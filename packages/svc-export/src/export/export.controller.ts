import { AuthGuard, Call, Roles, User } from "@betacall/svc-common";
import { Controller, Get, Query, Res, StreamableFile, UseGuards } from "@nestjs/common";
import { Between, LessThan, MoreThan, ObjectLiteral } from "typeorm";
import { ExportService } from "./export.service";

@Controller()
export class ExportController {

	constructor(
		private exportsvc: ExportService
	) {}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get('/stats')
	async getStats (@Query() query: {
		user?: string,
		from?: string,
		to?: string,
		provider?: Call.Provider 
	}, @Res() res) {
		const where: ObjectLiteral = {};
		if (query.user) where.user = { id: query.user };
		if (query.from) where.dt = MoreThan(query.from);
		if (query.to) where.dt = LessThan(query.to);
		if (query.from && query.to) where.dt = Between(query.from, query.to);
		if (query.provider) where.provider = query.provider;
		const buff = await this.exportsvc.exoprtStats(where);
		res.send(buff);
	}
}