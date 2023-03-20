import { MiddlewareConsumer, Module, ModuleMetadata, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from "./config";
import { User } from "./entities/user.entity";
import { HelmMiddleware } from "./middlewares/helm.middleware";

interface Options {
	metadata: ModuleMetadata
	db?: boolean;
}

export function createModule (options: Options) {
	const { db = true } = options;
	const imports = [...options.metadata.imports || []];

	if (db) {
		imports.push(
			TypeOrmModule.forRoot({
				type: 'postgres',
				...config.pg,
				entities: [
					User
				],
				synchronize: true,
			})
		)
	}
	
	@Module({
		...options.metadata,
		imports
	})
	class AppModule {
		configure(consumer: MiddlewareConsumer) {
			consumer.apply(HelmMiddleware).forRoutes({ method: RequestMethod.ALL, path: "*" })
		}
	}

	return AppModule;
}