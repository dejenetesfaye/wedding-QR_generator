const axios = require('axios');
axios.get('https://wedding-qr-generator.onrender.com/api/events/slug/kebede')
  .then(res => console.log("Render API returned:", res.data))
  .catch(err => console.error("Render API error:", err.message));
