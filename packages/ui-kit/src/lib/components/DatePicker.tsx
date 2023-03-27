import generateConfig from 'rc-picker/lib/generate/dateFns'
import generatePicker from 'antd/es/date-picker/generatePicker';

export const DatePicker = generatePicker<Date>(generateConfig);