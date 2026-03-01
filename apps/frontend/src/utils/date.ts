/**
 * 日期格式化工具函数
 * 避免在组件中重复定义，提供统一的日期格式化逻辑
 */

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化为时间 HH:mm:ss
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化为日期时间 YYYY-MM-DD HH:mm
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp).slice(0, 5)}`;
}

/**
 * 智能格式化（今天显示时间，其他显示日期）
 */
export function formatSmartDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `今天 ${formatTime(timestamp).slice(0, 5)}`;
  }
  return formatDate(timestamp);
}
