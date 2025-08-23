import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import user from './routes/user.js';
import link from './routes/link.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
connectDB();
app.use(
  express.json(),
  cookieParser(),
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/', user);
app.use('/', link);

app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));
