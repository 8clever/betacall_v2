import fs from 'fs/promises';
import path from 'path';

interface Info {
	code: string;
	from: number;
	to: number;
	operator: string;
	region: string;
	value: string;
}

export class RosReestr {

		info: Map<Info['code'], Info[]> = new Map();

		init = async () => {
			const filePath = path.join(__dirname, 'rosreestr.csv');
			const csv = await fs.readFile(filePath)
			const rows = csv.toString().split("\n");
			for (const row of rows) {
				const [ code, from, to, value, operator, region ] = row.split(";");
				const info: Info = {
					code,
					from: Number(from),
					to: Number(to),
					value,
					operator,
					region
				}
				const arr = this.info.get(info.code) || []
				arr.push(info)
				this.info.set(info.code, arr);
			}
		}

    getInfoByPhone (phone: string): Info | null {
        const code = phone.slice(1, 4);
        const number = Number(phone.slice(4, phone.length));

				const infos = this.info.get(code)
        if (!infos) return null;

        const info = infos.find(info => number >= info.from && number <= info.to);
        return info || null;
    }
}