import dayjs from 'dayjs';

const advancedFormat = require('dayjs/plugin/advancedFormat');
const isBetween = require('dayjs/plugin/isBetween');
const relativeTime = require('dayjs/plugin/relativeTime');

dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

export default dayjs;
