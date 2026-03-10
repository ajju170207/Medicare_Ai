import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middleware/errorHandler';
import { protect } from './middleware/auth.middleware';

// Route files
import authRoutes from './routes/auth.routes';
import symptomRoutes from './routes/symptom.routes';
import diseaseRoutes from './routes/disease.routes';
import hospitalRoutes from './routes/hospital.routes';
import uploadRoutes from './routes/upload.routes';
import chatRoutes from './routes/diseaseChat.routes';
import connectDB from './config/db';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// 1. Enable CORS
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));

// 2. Body parser
app.use(express.json());

// 3. Dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 4. Security headers
app.use(helmet());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/symptoms', symptomRoutes);
app.use('/api/v1/diseases', diseaseRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/upload', protect, uploadRoutes);
app.use('/api/v1/chat', protect, chatRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`✅ MedicareAI Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
