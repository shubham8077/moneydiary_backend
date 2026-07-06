import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongoUri);
    
    const count = await Transaction.countDocuments();
    console.log('Total transactions in database:', count);
    
    const last5 = await Transaction.find().sort({ _id: -1 }).limit(5);
    console.log('\nLast 5 transactions:');
    last5.forEach(tx => {
      console.log('- ID:', tx._id);
      console.log('  Title:', tx.title);
      console.log('  Amount:', tx.amount);
      console.log('  Type:', tx.type);
      console.log('  Date:', tx.date);
      console.log('  UserId:', tx.userId);
      console.log('');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

run();
