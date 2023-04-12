import generateConfig from 'rc-picker/lib/generate/dateFns'
import generatePicker from 'antd/es/date-picker/generatePicker';

function StartOfDay (date?: Date) {
	if (!date) return null;
	
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

function EndOfDay (date?: Date) {
	if (!date) return null;

	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);
	date.setMilliseconds(59);
	return date;
}

export const DatePicker = Object.assign(
	generatePicker<Date>(generateConfig),
	{
		StartOfDay,
		EndOfDay
	}
)