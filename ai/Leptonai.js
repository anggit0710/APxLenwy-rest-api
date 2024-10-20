const axios = require('axios');

module.exports = function(app) {
	
function generateRandomRid() {
    return Math.random().toString(36).substring(2, 15);
}
async function leptonLlm(query) {
    const url = 'https://search.lepton.run/api/query';
    const rid = generateRandomRid();

    const requestData = {
        query: query,
        rid: rid
    };

    try {
        const response = await axios.post(url, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Endpoint untuk LeptonAI
app.get('/leptonai', async (req, res) => {
    try {
      const text = req.query.text;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
      }
      const response = await leptonLlm(text);
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
