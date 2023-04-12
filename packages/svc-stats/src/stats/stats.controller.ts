import { AuthGuard, Call, Roles, Stats, User } from "@betacall/svc-common";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { StatsService } from "./stats.service";
import { Between, LessThan, MoreThan, ObjectLiteral } from "typeorm";

@Controller()
export class StatsController {

	constructor (
		private statssvc: StatsService
	) {

	}

	@MessagePattern("stats:add")
	add(@Payload() payload: Partial<Stats>) {
		return this.statssvc.add(payload);
	}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get()
	getStats (@Query() query: { 
		skip?: string, 
		limit?: string, 
		user?: string,
		from?: string,
		to?: string,
		provider?: Call.Provider 
	}) {
		const options: Partial<StatsService.FindOptions> = {}
		const where: ObjectLiteral = {};
		if (query.user) where.user = { id: query.user };
		if (query.skip) options.skip = Number(query.skip);
		if (query.limit) options.limit = Number(query.limit);
		if (query.from) where.dt = MoreThan(query.from);
		if (query.to) where.dt = LessThan(query.to);
		if (query.from && query.to) where.dt = Between(query.from, query.to);
		if (query.provider) where.provider = query.provider;
		return this.statssvc.find(where, options);
	}
}