/**
 * 格式化时间显示
 * @param minutes 分钟数
 * @returns 格式化后的时间字符串
 */
export function formatTime(minutes: number | undefined): string {
  if (!minutes || minutes === 0) return '0分钟';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}分钟`;
  } else if (mins === 0) {
    return `${hours}小时`;
  } else {
    return `${hours}小时${mins}分钟`;
  }
}
