import axios from 'axios';

module.exports = function(app) {

const aiAnswer = {
  chat: async function(input) {
    try {
      const response = await axios.post('https://aianswer.pro/api', 
        { question: input }, 
        { 
          headers: {
            'content-type': 'application/json',
            'origin': 'https://aianswer.pro',
            'referer': 'https://aianswer.pro/',
            'user-agent': 'Postify/1.0.0'
          }
        }
      );
      return {
        creator: 'Daffa ~',
        status: 'success',
        code: 200,
        data: response.data
      };
    } catch (error) {
      return {
        creator: 'Daffa ~',
        status: 'error',
        code: error.response ? error.response.status : 500,
        message: error.message
      };
    }
  }
};

// Endpoint Aianswer
app.get('/aianswer', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
      const response = await aiAnswer(text);
      res.status(200).json({
        status: 200,
        creator: "AP",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};