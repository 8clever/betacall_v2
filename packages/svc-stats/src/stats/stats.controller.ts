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

	@MessagePattern("stats:list")
	list(@Payload() payload: StatsService.QueryOptions) {
		return this.statssvc.findByQuery(payload);
	}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get()
	getStats (@Query() query: StatsService.QueryOptions) {
		return this.statssvc.findByQuery(query);
	}
}