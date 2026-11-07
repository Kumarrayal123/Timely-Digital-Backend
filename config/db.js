import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS resolution for MongoDB Atlas SRV lookup reliability
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
