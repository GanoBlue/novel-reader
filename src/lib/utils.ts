import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { debounce, throttle } from 'lodash-es';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 导出防抖和节流函数
export { debounce, throttle };

