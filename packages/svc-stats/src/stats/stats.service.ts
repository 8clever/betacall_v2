import { Stats } from "@betacall/svc-common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class StatsService {

	constructor (
		@InjectRepository(Stats)
		private readonly repo: Repository<Stats>
	) {

	}

	find (query: Partial<Stats> | string, options: Partial<StatsService.FindOptions>) {
		let builder = this.repo.createQueryBuilder().where(query);
		if (options.limit)
			builder = builder.take(options.limit);
		if (options.skip)
			builder = builder.skip(options.skip);
		return builder.getManyAndCount();
	}

	add (stats: Partial<Stats>) {
		delete stats.id;
		delete stats.dt;
		return this.repo.save(stats);
	}
}

export namespace StatsService {
	export interface FindOptions {
		skip: number;
		limit: number;
	}
}