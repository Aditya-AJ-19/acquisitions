import express from 'express';
import helmet from 'helmet';
import logger from '#config/logger.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(cookieParser());
app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('Hello from acquisitions api!');
  res.status(200).send('Hello from acquisitions api!');
});

app.get('/health', (req, res) => {
  res.status(200).send({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).send('Acquisitions api is running!');
});

app.use('/api/auth', authRoutes);

export default app;
