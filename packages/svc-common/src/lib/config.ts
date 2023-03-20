
export const config = {
	secret: process.env.SECRET || "secret",
	mqttUrl: process.env.MQTT || "mqtt://localhost:1883",
	redisUrl: process.env.REDIS || "redis://localhost:6379",
	admin: {
		login: "admin",
		password: process.env.ADMIN_PASSWORD || "123"
	},
	pg: {
		host: process.env.PG_HOST ||'localhost',
		port: Number(process.env.PG_PORT || 5432),
		username: process.env.PG_USER || 'postgres',
		password: process.env.PG_PASSWORD || 'postgres',
		database: process.env.PG_DB || 'postgres',
	}
}