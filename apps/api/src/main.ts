import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const baseDomain = process.env.FRONTEND_URL || 'takshstore.com';

  const allowedOrigins = [
    'http://localhost:3000',
    `https://${baseDomain}`,
    `https://www.${baseDomain}`
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Taksh Store API')
    .setDescription(
      'Endpoints for physical canvases and digital SaaS invitations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
