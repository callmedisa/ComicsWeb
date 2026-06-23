import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), "public"));
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
