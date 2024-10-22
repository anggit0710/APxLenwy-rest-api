const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  async function ligaKlasemen(liga) {
    try {
      const response = await axios.get(`https://www.bola.net/klasemen/${liga}.html`);

      const $ = cheerio.load(response.data);
      const options = [];

      $('.box-select #liga option').each((i, element) => {
        const value = $(element).attr('value');
        const nama = $(element).text();
        options.push({ value, nama });
      });

      const klasemen = [];

      $('.main-table tbody tr').each((i, element) => {
        const posisi = $(element).find('.team-row-pos').text().trim();
        const namaTim = $(element).find('.team-row-name').text().trim();
        const main = $(element).find('td').eq(0).text().trim();
        const poin = $(element).find('td').eq(1).text().trim();
        const menang = $(element).find('td').eq(2).text().trim();
        const seri = $(element).find('td').eq(3).text().trim();
        const kalah = $(element).find('td').eq(4).text().trim();
        const goal = $(element).find('td').eq(5).text().trim();
        const selisihGoal = $(element).find('td').eq(6).text().trim();

        klasemen.push({
          posisi,
          namaTim,
          main,
          poin,
          menang,
          seri,
          kalah,
          goal,
          selisihGoal
        });
      });

      if (klasemen.length === 0) {
        return `Data klasemen untuk liga ${liga} tidak ditemukan.`;
      }

      return {
        creator: 'Zaenishi',
        liga: liga,
        options: options,
        klasemen: klasemen
      };

    } catch (error) {
      if (error.response && error.response.status === 404) {
        const response = await axios.get('https://www.bola.net/klasemen/inggris.html');
        const $ = cheerio.load(response.data);
        const options = [];

        $('.box-select #liga option').each((i, element) => {
          const nama = $(element).text();
          options.push(nama);
        });

        return {
          message: `Liga yang anda input salah, berikut liga yang benar:`,
          ligaBenar: options
        };
      } else {
        console.error(error.message);
        return `Terjadi kesalahan saat mengambil data liga ${liga}. Error: ${error.message}`;
      }
    }
  }

  // Endpoint ligaklasemen
  app.get('/search/liga', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
      const response = await ligaKlasemen(text);
      res.status(200).json({
        status: 200,
        creator: "Zaenishi & AP",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  });
};