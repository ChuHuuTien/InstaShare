const {mongoose } = require('mongoose');

// const username = 'chuhuutien';
// const password = 'XMcY1aTiKRuPHbUf';
// const URL = `mongodb+srv://${username}:${password}@chatweb.frfxcpm.mongodb.net/ChatWeb`;
// const local = 'mongodb://localhost:27017';

async function connect() {
  try {
    await mongoose.connect(process.env.mongoURL);
    console.log('Connect Successfull!!!');
  } catch (error) {
    console.log(`${error} did not connect`);
  }
}

module.exports = { connect };

