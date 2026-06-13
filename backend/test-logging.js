const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Url = require('./src/models/Url');
const Visit = require('./src/models/Visit');
const { resolveIp } = require('./src/utils/geo');

async function testLogging() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linklytics');
  console.log('Connected to DB');

  const url = await Url.findOne();
  if (!url) {
    console.log('No URL found to test with');
    process.exit(0);
  }

  console.log(`Testing logging for URL: ${url.originalUrl} (${url._id})`);

  try {
    const geo = await resolveIp('127.0.0.1');
    console.log('Resolved geo:', geo);

    const visit = await Visit.create({
      urlId: url._id,
      ip: '127.0.0.1',
      browser: 'TestBrowser',
      device: 'Desktop',
      os: 'Windows',
      country: geo.country,
      city: geo.city,
    });
    console.log('Successfully created visit:', visit);

    const visits = await Visit.find({ urlId: url._id });
    console.log(`Total visits for this URL: ${visits.length}`);

  } catch (err) {
    console.error('Error during logging:', err);
  }

  process.exit(0);
}

testLogging();
