const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  function footdataplayer(query) {
    return new Promise((resolve, reject) => {
      // created by hann. dont haous wm ya
      axios.get('https://www.footballdatabase.eu/en/search_result&q=' + query)
        .then(response => {
          const $ = cheerio.load(response.data);
          const hasil = [];
          const ling = [];
          const age = [];
          const position = [];
          const club = [];
          const nama = [];

          $('td.player').each(function(a, b) {
            ling.push('https://www.footballdatabase.eu' + $(b).find('a').attr('href'));
            nama.push($(b).text().trim());
          });

          $('td.age').each(function(a, b) {
            age.push($(b).text().trim());
          });

          $('td.position').each(function(a, b) {
            position.push($(b).text().trim());
          });

          $('td.club').each(function(a, b) {
            club.push($(b).text().trim());
          });

          // Pastikan loop hanya berjalan hingga jumlah data yang tersedia
          const maxLength = Math.min(nama.length, age.length, position.length, club.length, ling.length);
          
          for (let i = 0; i < maxLength; i++) {
            const name = nama[i];
            const umur = age[i];
            const link = ling[i];
            const posisi = position[i];
            const klub = club[i];

            hasil.push({ name, umur, link, posisi, klub });
          }

          if (hasil.length === 0) {
            return resolve(`Tidak ada pemain yang ditemukan untuk pencarian: ${query}`);
          }

          resolve(hasil);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Endpoint footballdata
  app.get('/search/footballdata', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
      const response = await footdataplayer(text);
      res.status(200).json({
        status: 200,
        creator: "Hann & AP",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};