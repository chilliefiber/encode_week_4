import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from './app.module';
import 'dotenv/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // allow the frontend to communicate with the backend
  // CAUTION: this enables access from any origin without authentication
  // It's ok for development, but even in development we should only let
  // localhost:3000 (where the scaffold-eth-2 is running) to access
  // Allowing all origins is really for when you want to let anyone access
  // the backend, definitely don't do it if using cookies or auth headers
  // or when handling sensitive data
  app.enableCors();
  const config = new DocumentBuilder()
  .setTitle("API example")
  .setDescription("The API description")
  .setVersion("1.0")
  .addTag("example")
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
