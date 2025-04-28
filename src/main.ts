import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Create a logger instance
  const logger = new Logger('Bootstrap');
  
  // Add more verbosity in development mode
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('API de Ventas')
    .setDescription('Documentación de la API de gestión de ventas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(3000);
  
  // Message to confirm the application is running
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log('Hot reload is enabled. Waiting for file changes...');
}
bootstrap();