export const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function timeText(cls) {
  return `${DAY_NAMES[cls.day]} ${cls.start}-${cls.end} 节 · ${cls.startWeek}-${cls.endWeek} 周`;
}

export function clockText(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
