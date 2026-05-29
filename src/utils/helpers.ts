/**
 * 辅助函数工具
 */

import { isNil, isFunction } from './types';

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param interval - 时间间隔（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastRunTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRunTime >= interval) {
      fn(...args);
      lastRunTime = now;
    }
  };
}

/**
 * 延迟执行
 * @param fn - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 */
export function delay<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 0
): Promise<ReturnType<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn());
    }, delay);
  });
}

/**
 * 生成唯一 ID
 * @param prefix - 前缀（可选）
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

/**
 * 生成范围内的随机数
 * @param min - 最小值
 * @param max - 最大值
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取对象的指定路径值
 * @param obj - 对象
 * @param path - 路径（如 'a.b.c'）
 * @param defaultValue - 默认值
 */
export function getPath(obj: any, path: string, defaultValue?: any): any {
  const paths = path.split('.');
  let result = obj;

  for (const p of paths) {
    if (isNil(result)) {
      return defaultValue;
    }
    result = result[p];
  }

  return isNil(result) ? defaultValue : result;
}

/**
 * 设置对象的指定路径值
 * @param obj - 对象
 * @param path - 路径（如 'a.b.c'）
 * @param value - 值
 */
export function setPath(obj: any, path: string, value: any): any {
  const paths = path.split('.');
  let current = obj;

  for (let i = 0; i < paths.length - 1; i++) {
    const p = paths[i];
    if (!p) continue;
    if (!current[p]) {
      current[p] = {};
    }
    current = current[p];
  }

  const lastPath = paths[paths.length - 1];
  if (lastPath) {
    current[lastPath] = value;
  }
  return obj;
}

/**
 * 重试函数执行
 * @param fn - 要执行的函数
 * @param maxRetries - 最大重试次数
 * @param delayMs - 重试延迟（毫秒）
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * 并行执行异步任务，带有限制
 * @param tasks - 任务数组
 * @param concurrency - 并发数量
 */
export async function promisePool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;

    const promise = Promise.resolve()
      .then(() => task())
      .then((result) => {
        results[i] = result;
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      const index = executing.findIndex((p) => p === promise);
      if (index !== -1) {
        executing.splice(index, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * 缓存装饰器工厂
 * @param fn - 要缓存的函数
 * @param keyGenerator - 缓存键生成函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, any>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}




