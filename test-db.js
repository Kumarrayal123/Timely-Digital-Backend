import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix DNS for Windows SRV queries
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const testMongo = async () => {
  console.log('Testing connection to MongoDB...');
  console.log('URI:', process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connection Successful!');
    console.log('Host:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    console.log('Ready State:', conn.connection.readyState); // 1 = connected

    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err);
    process.exit(1);
  }
};

testMongo();
