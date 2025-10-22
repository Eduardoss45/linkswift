import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './database/database.js';
import routes from './routes/index.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/', routes);

connectDB();
app.listen(port, () => console.log(`Server started on port: ${port}`));