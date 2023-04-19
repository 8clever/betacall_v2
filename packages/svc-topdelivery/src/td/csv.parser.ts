import fs from 'fs/promises'
import path from 'path';

export class CsvParser {

	async parse<T extends object = object> (filePath: string, head: (keyof T)[]) {
		const buff = await fs.readFile(path.resolve(__dirname, filePath));
		const rows = buff.toString().replace(/\r/m, '').split('\n');
		const data: T[] = [];
		for (const r of rows) {
			const cols = r.split(",");
			const obj = head.reduce((m, h, idx) => {
				Object.assign(m, {[h]: cols[idx]});
				return m;
			}, {} as T);
			data.push(obj);
		}
		return data;
	}
}