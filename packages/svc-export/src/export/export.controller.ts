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
	async getStats (@Query() query: object, @Res() res) {
		const buff = await this.exportsvc.exoprtStats(query);
		res.send(buff);
	}
}