import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';

module.exports = function(app) {

  const TikWM = async (url) => {
    try {
      const response = await axios.post('https://www.tikwm.com/api/', null, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'User-Agent': 'Postify/1.0.0',
        },
        data: {
          url: url,
          count: 12,
          cursor: 0,
          web: 1,
          hd: 1
        }
      });

      const data = response.data.data;
      if (!data) throw new Error('Gak ada response dari API-nya...');

      let images = data.images && Array.isArray(data.images) ? data.images : [];
      if (!images.length) {
        return response.data;
      }
      
      if (data.otherImages) images.push(...data.otherImages);

      const audioLink = data.music_info?.play;
      if (!audioLink) throw new Error('Musik tidak ditemukan.');

      const title = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const output = `${title}.mp4`;

      const command = ffmpeg();
      images.forEach(image => command.input(image));
      command.input(audioLink);

      const filterComplex = images.map((_, idx) => `[${idx}:v]format=rgb24,loop=999:1,setpts=N/FRAME_RATE/TB[v${idx}];`).join('') + 
      images.map((_, idx) => `[v${idx}]`).join('') + 
      `concat=n=${images.length}:v=1:a=0[vout]`;

      command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map', '[vout]',
          '-map', `${images.length}:a`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-shortest',
          '-pix_fmt', 'yuv420p'
        ])
        .audioCodec('aac')
        .on('end', () => console.log('Video Slideshow Tiktok berhasil di render..'))
        .on('error', err => console.error('Proses Render Video Slideshow gagal :', err))
        .save(output);
      
      return 'Render Video Slideshow Tiktok sedang di proses....';
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  };

  // Endpoint untuk TikWM
  app.get('/downloader/ttslide', async (req, res) => {
    try {
      const url = req.query.url;
      if (!url) {
        return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
      }
      const response = await TikWM(url);
      res.status(200).json({
        status: 200,
        creator: "AP",
        data: { response }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};