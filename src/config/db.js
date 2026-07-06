import mongoose from 'mongoose';

let dbConnected = false;

export const isDBConnected = () => dbConnected;

export const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Connect to MongoDB
    await mongoose.connect(connString);
    dbConnected = true;
    console.log('Connected to MongoDB database successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    dbConnected = false;
    throw error;
  }
};

