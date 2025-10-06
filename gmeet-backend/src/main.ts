import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS for browser extension and frontend
  app.enableCors({
    origin: [
      /^chrome-extension:\/\/.*$/,  // Chrome/Brave extensions
      'http://localhost:3000',      // Backend itself
      'http://localhost:3001',      // Frontend local dev
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://api.stats.rb2.fr',
      'https://stats.rb2.fr',       // Frontend production
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
