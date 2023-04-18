import { Call, Stats } from "@betacall/svc-common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, ObjectLiteral, Repository } from "typeorm";

@Injectable()
export class StatsService {

	constructor (
		@InjectRepository(Stats)
		private readonly repo: Repository<Stats>
	) {

	}

	async findByQuery (query: StatsService.QueryOptions) {
		const options: Partial<StatsService.FindOptions> = {}
		const where: ObjectLiteral = {};
		if (query.user) where.user = { id: query.user };
		if (query.skip) options.skip = Number(query.skip);
		if (query.limit) options.limit = Number(query.limit);
		if (query.from) where.dt = MoreThan(query.from);
		if (query.to) where.dt = LessThan(query.to);
		if (query.from && query.to) where.dt = Between(query.from, query.to);
		if (query.provider) where.provider = query.provider;
		return this.find(where, options);
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

	export interface QueryOptions {
		skip?: string, 
		limit?: string, 
		user?: string,
		from?: string,
		to?: string,
		provider?: Call.Provider 
	}
	export interface FindOptions {
		skip: number;
		limit: number;
		withRelations?: boolean
	}
}