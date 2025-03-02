import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors();
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('QuickBite API')
    .setDescription('The QuickBite food delivery platform API')
    .setVersion('1.0')
    .addTag('restaurants')
    .addTag('orders')
    .addTag('users')
    .addTag('payments')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  // Health check endpoint for k8s probes
  app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.get('/ready', (req, res) => {
    res.status(200).send({ status: 'ready', timestamp: new Date().toISOString() });
  });
  
  const port = configService.get<number>('port') || 8080;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();