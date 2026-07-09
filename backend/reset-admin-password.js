require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const NEW_PASSWORD = 'kishan@12345';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.log('No admin found.'); process.exit(1); }
  admin.password = NEW_PASSWORD;
  await admin.save();
  console.log(`Password updated for: ${admin.email}`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
