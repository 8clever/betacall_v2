import { MiddlewareConsumer, Module, ModuleMetadata, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from "./config";
import { User } from "./entities/user.entity";
import { Call } from './entities/call.entity'
import { HelmMiddleware } from "./middlewares/helm.middleware";
import { Stats } from "./entities/stats.entity";
import { EntitySchema, MixedList } from "typeorm";

interface Options {
	metadata: ModuleMetadata
	entities?: MixedList<EntitySchema | Function | string>	
}

export function createModule (options: Options) {
	const { entities = [], metadata } = options;
	const imports = [...metadata.imports || []];

	if (entities.length) {
		imports.push(
			TypeOrmModule.forRoot({
				type: 'postgres',
				...config.pg,
				entities,
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