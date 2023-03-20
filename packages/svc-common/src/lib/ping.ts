import { Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { promiseObservable } from "./promiseObservable";

export async function ping(client: ClientProxy, serviceName: string) {
	for (;;) {
		const req = client.send(`${serviceName}:ping`, "ping");
		try {
			const res = await promiseObservable(req);
			if (res === true)
				break;
		} catch {
			Logger.log(`Ping service ${serviceName} retry`)
		}
	}
}