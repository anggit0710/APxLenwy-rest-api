const express = require('express');
const cors = require('cors');
const path = require('path');

// Full Kode Di Github Saya : https://github.com/Lenwyy/

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.static(path.join(__dirname, 'public')));

// Middleware CORS
app.use(cors());

// Import AI
require('./ai/Blackbox')(app);
require('./ai/LuminAI')(app);
require('./ai/Aianswer')(app);

// Import Berita
require('./berita/liputan6')(app);

// Import downloader 
require('./downloader/Tiktokdl')(app);

// Import islamic
require('./islamic/ypia')(app);
require('./islamic/rumaysho')(app);
require('./islamic/surah')(app);
require('./islamic/jadwalsholat')(app);

// Import Search
require('./search/goodread')(app);
require('./search/Footballdata')(app);


//import Tools
require('./tools/ttstalk')(app);


// Full Kode Di Github Saya : https://github.com/Lenwyy/

// Endpoint untuk halaman HTML utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
