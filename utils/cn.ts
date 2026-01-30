
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 智能合并 Tailwind 类名
 * 解决类名冲突并支持条件渲染
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
