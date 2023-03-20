import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { config } from "./config";

interface Options {
	prefix?: string
	port?: number
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

  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${prefix}`
  );
}