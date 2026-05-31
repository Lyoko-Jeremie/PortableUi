export function splitPath(path: string): string[] {
  return path
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function getValueAtPath(source: Record<string, any>, path: string): any {
  if (!path) {
    return source;
  }

  let current: any = source;
  for (const segment of splitPath(path)) {
    if (current == null) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}

export function hasPath(source: Record<string, any>, path: string): boolean {
  if (!path) {
    return true;
  }

  let current: any = source;
  for (const segment of splitPath(path)) {
    if (current == null || !(segment in Object(current))) {
      return false;
    }
    current = current[segment];
  }

  return true;
}

export function setValueAtPath(source: Record<string, any>, path: string, value: any): void {
  if (!path) {
    throw new Error('setValueAtPath requires a non-empty path.');
  }

  const segments = splitPath(path);
  let current: any = source;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (!segment) {
      continue;
    }

    const next = current[segment];
    if (next == null || typeof next !== 'object') {
      current[segment] = {};
    }

    current = current[segment];
  }

  const lastSegment = segments[segments.length - 1];
  if (!lastSegment) {
    return;
  }

  current[lastSegment] = value;
}

export function matchesDirtyPath(bindingPath: string, dirtyPath?: string): boolean {
  if (!dirtyPath || dirtyPath === '*') {
    return true;
  }

  return bindingPath === dirtyPath
    || bindingPath.startsWith(`${dirtyPath}.`)
    || dirtyPath.startsWith(`${bindingPath}.`);
}

