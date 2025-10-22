import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;

export default function connectDB(): void {
  mongoose
    .connect(uri!)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
      console.error('Error: ', err.message);
      process.exit(1);
    });
}
