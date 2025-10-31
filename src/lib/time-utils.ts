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

/**
 * 格式化日期显示（相对时间）
 * @param dateString ISO 时间字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}

