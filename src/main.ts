import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Crear una instancia de logger
  const logger = new Logger('Bootstrap');
  
  // Añadir más verbosidad en modo desarrollo
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
  
  // Mensaje para confirmar que la aplicación está corriendo
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log('Hot reload is enabled. Waiting for file changes...');
}
bootstrap();