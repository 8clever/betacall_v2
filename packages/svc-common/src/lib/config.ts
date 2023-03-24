import { Call } from "./entities/call.entity";

export const config = {
	// for all services
	mqttUrl: process.env.MQTT || "mqtt://localhost:1883",

	// for all services with DB usage
	pg: {
		host: process.env.PG_HOST ||'localhost',
		port: Number(process.env.PG_PORT || 5432),
		username: process.env.PG_USER || 'postgres',
		password: process.env.PG_PASSWORD || 'postgres',
		database: process.env.PG_DB || 'postgres',
	},

	// for CALL svc
	redisUrl: process.env.REDIS || "redis://localhost:6379",
	ami: {
		timeout: Number(process.env.AMI_TIMEOUT || 120000),
		exten: process.env.AMI_EXTEN || "1",
		host: process.env.AMI_HOST || "192.168.1.26",
		port: Number(process.env.AMI_PORT || "5038"),
		username: process.env.AMI_USER || "u",
		password: process.env.AMI_PASS || "p"
	},
	providers: {
		[Call.Provider.TOP_DELIVERY]: {
			slots: 3
		},
		[Call.Provider.B2CPL]: {
			slots: 2
		}
	},
	gateaways: {
		default: {
			channel: "Local/<phone>@voip1/n",
			context: "testt"
		}
	},

	// for USERS svc
	secret: process.env.SECRET || "secret",
	admin: {
		login: "admin",
		password: process.env.ADMIN_PASSWORD || "123"
	}
}