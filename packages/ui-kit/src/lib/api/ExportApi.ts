import { Api } from "./Api";
import { Provider } from "./types";

export class ExportApi {

	api = new Api('/api/v1/export')

	private downlaodBlob = (blob: Blob, filename: string) => {
		const url = URL.createObjectURL(blob)
		const $a = document.createElement("a");
		$a.type = "file"
		$a.href = url;
		$a.download = filename;
		$a.click();
	}

	async stats (query: {
		provider: Provider;
		from: string;
		to: string;
	}) {
		const res = await this.api.get('/stats', query);
		const blob = await res.blob();
		const filename = `stats-${Object.values(query).join("-")}.xlsx`;
		this.downlaodBlob(blob, filename);
	}
}