import express from 'express';
import path from 'path';
import env from './config/env';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.resolve(env.UPLOAD_PATH)));
app.use(routes);
app.use(errorMiddleware);

export default app;
