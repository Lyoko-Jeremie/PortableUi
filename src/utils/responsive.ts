/**
 * 响应式设计工具
 */

/** 断点定义 */
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * 获取当前视口宽度
 */
export function getViewportWidth(): number {
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
}

/**
 * 获取当前视口高度
 */
export function getViewportHeight(): number {
  return Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
}

/**
 * 检查是否匹配某个媒体查询
 * @param query - 媒体查询字符串
 */
export function matchesMedia(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

/**
 * 检查是否在指定断点以上
 * @param breakpoint - 断点名称
 */
export function isAboveBreakpoint(breakpoint: Breakpoint): boolean {
  const width = getViewportWidth();
  return width >= breakpoints[breakpoint];
}

/**
 * 检查是否在指定断点以下
 * @param breakpoint - 断点名称
 */
export function isBelowBreakpoint(breakpoint: Breakpoint): boolean {
  const width = getViewportWidth();
  return width < breakpoints[breakpoint];
}

/**
 * 获取当前所在的断点
 */
export function getCurrentBreakpoint(): Breakpoint {
  const width = getViewportWidth();

  const sortedBreakpoints = Object.entries(breakpoints).sort((a, b) => b[1] - a[1]);

  for (const [name, value] of sortedBreakpoints) {
    if (width >= value) {
      return name as Breakpoint;
    }
  }

  return 'xs';
}

/**
 * 注册视口变化监听
 * @param callback - 回调函数
 * @param debounceDelay - 防抖延迟（毫秒）
 */
export function onViewportChange(callback: () => void, debounceDelay: number = 150): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const handler = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, debounceDelay);
  };

  window.addEventListener('resize', handler);

  // 返回取消监听的函数
  return () => {
    window.removeEventListener('resize', handler);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * 注册媒体查询变化监听
 * @param query - 媒体查询字符串
 * @param callback - 回调函数
 */
export function onMediaQueryChange(query: string, callback: (matches: boolean) => void): () => void {
  const mediaQuery = window.matchMedia(query);

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);

    // 返回取消监听的函数
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  } else {
    // 兼容旧浏览器
    mediaQuery.addListener(handler);
    return () => {
      mediaQuery.removeListener(handler);
    };
  }
}

/**
 * 检查是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 检查是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (!!window.ontouchstart ||
      !!(navigator as any).maxTouchPoints ||
      !!(navigator as any).msMaxTouchPoints)
  );
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
}

/**
 * 检查是否为暗色主题
 */
export function isDarkMode(): boolean {
  return matchesMedia('(prefers-color-scheme: dark)');
}

/**
 * 监听暗色模式变化
 * @param callback - 回调函数
 */
export function onDarkModeChange(callback: (isDark: boolean) => void): () => void {
  return onMediaQueryChange('(prefers-color-scheme: dark)', callback);
}

/**
 * 检查是否为横屏
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

/**
 * 检查是否为竖屏
 */
export function isPortrait(): boolean {
  return window.innerWidth <= window.innerHeight;
}


