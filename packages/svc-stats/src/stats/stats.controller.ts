import { AuthGuard, Roles, Stats, User } from "@betacall/svc-common";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { StatsService } from "./stats.service";

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
	getStats (@Query() query: { skip?: string, limit?: string, user?: string }) {
		const options: Partial<StatsService.FindOptions> = {}
		const where: Partial<Stats> = {};
		if (query.user) where.user = { id: query.user };
		if (query.skip) options.skip = Number(query.skip);
		if (query.limit) options.limit = Number(query.limit);
		return this.statssvc.find(where, options);
	}
}