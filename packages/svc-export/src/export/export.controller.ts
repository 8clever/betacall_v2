import { AuthGuard, Roles, User } from "@betacall/svc-common";
import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { ExportService } from "./export.service";

@Controller()
export class ExportController {

	constructor(
		private exportsvc: ExportService
	) {}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get('/stats')
	async getStats (@Query() query: object, @Res() res: { send: (v: Buffer) => void}) {
		const buff = await this.exportsvc.exoprtStats(query);
		res.send(buff);
	}
}