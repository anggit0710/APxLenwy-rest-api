const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  async function pasteBin(url) {
      if (!url || typeof url !== 'string' || !url.startsWith('https://pastebin.com/')) {
          return 'URL tidak valid. Mohon berikan URL Pastebin yang valid.';
      }

      try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data);

          const pasteTitle = $('div.info-top h1').text().trim() || 'Judul tidak ditemukan';
          const rawLink = $('a[href^="/raw"]').attr('href');
          const downloadLink = $('a[href^="/dl"]').attr('href');

          const codeContent = [];
          $('.source.text ol li').each((i, el) => {
              codeContent.push($(el).text().trim());
          });

          const username = $('div.username a').text().trim() || 'Username tidak ditemukan';
          const datePosted = $('div.date span').text().trim() || 'Tanggal tidak ditemukan';
          const pasteViews = $('div.visits').text().trim() || 'Jumlah tampilan tidak ditemukan';

          return {
              title: pasteTitle,
              rawLink: rawLink ? `https://pastebin.com${rawLink}` : 'Link raw tidak ditemukan',
              downloadLink: downloadLink ? `https://pastebin.com${downloadLink}` : 'Link unduh tidak ditemukan',
              content: codeContent.length ? codeContent.join('\n') : 'Konten kode tidak ditemukan',
              datePosted,
              username,
              viewCount: pasteViews
          };
      } catch (error) {
          return 'Terjadi kesalahan saat scraping: ' + error.message;
      }
  }

  // Endpoint pastebin
  app.get('/tools/pastebin', async (req, res) => {
      try {
        const { text } = req.query;
        if (!text) {
          return res.status(400).json({ error: 'Parameter "url" Tidak Ditemukan, Tolong Masukkan Perintah' });
        }
        const response = await pasteBin(text); 
        if (typeof response === 'string') {
          return res.status(400).json({ error: response });
        }
        res.status(200).json({
          status: 200,
          creator: "Zaenishi & AP",
          data: response
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
};