import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from "./config";

interface Options {
	prefix?: string
	port?: number;
  swagger?: {
    title: string;
    version?: string;
  }
}

export async function runModule (AppModule, options: Options = {}) {

	const { prefix = "api/v1", port = 3000 } = options;
	const app = await NestFactory.create(AppModule);

  
  
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: config.mqttUrl
    }
  })
  
  app.setGlobalPrefix(prefix);

  if (options.swagger) {
    const documentConfig = new DocumentBuilder()
      .setTitle(options.swagger.title)
      .setVersion(options.swagger.version || "0.0.1")
      .build();

    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup(prefix + "/swagger", app, document);
  }

  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${prefix}`
  );
}