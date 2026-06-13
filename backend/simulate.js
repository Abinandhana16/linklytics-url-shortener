const axios = require('axios');

async function simulateClick() {
  try {
    // 1. Fetch my links (we need to bypass auth for this test or just use the first url directly from DB)
    const mongoose = require('mongoose');
    require('dotenv').config({ path: './.env' });
    const Url = require('./src/models/Url');
    const Visit = require('./src/models/Visit');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linklytics');
    
    // get a url
    const url = await Url.findOne();
    if (!url) {
      console.log("No URL found in DB");
      process.exit(1);
    }
    
    console.log(`Testing with ShortCode: ${url.shortCode}`);
    const beforeVisits = await Visit.countDocuments({ urlId: url._id });
    const beforeClicks = url.clicks;
    console.log(`Before: ${beforeVisits} visits, ${beforeClicks} clicks`);
    
    // Simulate HTTP GET to the redirect endpoint
    try {
      await axios.get(`http://localhost:5000/${url.shortCode}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Resolve only if the status code is less than 400
        }
      });
    } catch (err) {
      console.log(`HTTP request failed: ${err.message}`);
    }
    
    // Wait a little for the async Visit.create to finish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const afterVisits = await Visit.countDocuments({ urlId: url._id });
    const updatedUrl = await Url.findById(url._id);
    console.log(`After: ${afterVisits} visits, ${updatedUrl.clicks} clicks`);
    
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

simulateClick();
