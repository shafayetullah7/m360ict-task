import app from './app';
import db from './config/db';
import env from './config/env';

async function bootstrap() {
  try {
    await db.raw('SELECT 1');
    console.log('Database connected');

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Application failed to start');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();