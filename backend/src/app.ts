import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './database/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errors.js';
import { connectRabbitMQ } from './rabbitmq/rabbitmq.js';

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/', routes);
app.use(errorHandler);

app.use('/', routes);

connectDB();
connectRabbitMQ();

app.listen(port, () => console.log(`Server started on port: ${port}`));
