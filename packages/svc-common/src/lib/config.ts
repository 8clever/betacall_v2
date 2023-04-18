import { Call } from "./entities/call.entity";

export const config = {
	/** for ALL */
	mqttUrl: process.env.MQTT || "mqtt://localhost:1883",

	/** for ALL services with db */
	pg: {
		host: process.env.PG_HOST ||'localhost',
		port: Number(process.env.PG_PORT || 5432),
		username: process.env.PG_USER || 'postgres',
		password: process.env.PG_PASSWORD || 'postgres',
		database: process.env.PG_DB || 'postgres',
	},

	/** for Caller */
	redisUrl: process.env.REDIS || "redis://localhost:6379",
	ami: {
		timeout: Number(process.env.AMI_TIMEOUT || 120000),
		exten: process.env.AMI_EXTEN || "1",
		host: process.env.AMI_HOST || "192.168.1.26",
		port: Number(process.env.AMI_PORT || "5038"),
		username: process.env.AMI_USER || "u",
		password: process.env.AMI_PASS || "p"
	},
	testPhone: process.env.TEST_PHONE || "",
	providers: {
		[Call.Provider.TOP_DELIVERY]: {
			slots: Number(process.env.TD_SLOTS || 0)
		},
		[Call.Provider.B2CPL]: {
			slots: Number(process.env.B2CPL_SLOTS || 0)
		}
	},
	gateaways: {
		default: {
			channel: process.env.ASTERISK_CHANNEL || "Local/<phone>@voip1/n",
			context: process.env.ASTERISK_CTX || "testt"
		}
	},

	/** for Users */
	secret: process.env.SECRET || "secret",
	admin: {
		login: "admin",
		password: process.env.ADMIN_PASSWORD || "123"
	},

	/** for b2cpl */
	b2cpl: {
		apiKey: process.env.B2CPL_API_KEY || "b2c-test"
	},

	/** for TopDelivery  */
	topdelivery: {
		url: process.env.TD_URL || "https://is.topdelivery.ru/api/soap/c/2.0/?WSDL",
		basic: {
			user: process.env.BASIC_USER || "u",
    	password: process.env.BASIC_PASS || "p"
		},
		body: {
			login: process.env.BODY_LOGIN || "u",
    	password: process.env.BODY_PASS || "p"
		}
	},

	/** for SIP */
	sip: {
		host: process.env.SIP_HOST || "test.lan",
		port: Number(process.env.SIP_PORT || 8021),
		password: process.env.SIP_PASSWORD || "ClueCon"
	}
}