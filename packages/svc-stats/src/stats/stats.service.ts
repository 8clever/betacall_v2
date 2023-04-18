import { Stats } from "@betacall/svc-common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectLiteral, Repository } from "typeorm";

@Injectable()
export class StatsService {

	constructor (
		@InjectRepository(Stats)
		private readonly repo: Repository<Stats>
	) {

	}

	async find (query: ObjectLiteral, options: Partial<StatsService.FindOptions>) {
		let builder = this.repo.createQueryBuilder('stats')
			.leftJoinAndSelect(`stats.user`, 'user')
			.orderBy('stats.dt', 'DESC')
			.where(query);

		if (options.limit)
			builder = builder.take(options.limit);
		if (options.skip)
			builder = builder.skip(options.skip);
		
		const [ list, count ] = await builder.getManyAndCount();
		return {
			list,
			count
		}
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
		withRelations?: boolean
	}
}