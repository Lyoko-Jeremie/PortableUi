/**
 * 间距设计令牌
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// 提供便利函数用于组合间距
export function spacing_horizontal(left: string | number, right?: string | number): {
  marginLeft: string;
  marginRight: string;
} {
  const lValue = typeof left === 'string' ? left : spacing[left as keyof typeof spacing] || left;
  const rValue = right ? (typeof right === 'string' ? right : spacing[right as keyof typeof spacing] || right) : lValue;

  return {
    marginLeft: String(lValue),
    marginRight: String(rValue),
  };
}

export function spacing_vertical(top: string | number, bottom?: string | number): {
  marginTop: string;
  marginBottom: string;
} {
  const tValue = typeof top === 'string' ? top : spacing[top as keyof typeof spacing] || top;
  const bValue = bottom ? (typeof bottom === 'string' ? bottom : spacing[bottom as keyof typeof spacing] || bottom) : tValue;

  return {
    marginTop: String(tValue),
    marginBottom: String(bValue),
  };
}

export function padding_horizontal(left: string | number, right?: string | number): {
  paddingLeft: string;
  paddingRight: string;
} {
  const lValue = typeof left === 'string' ? left : spacing[left as keyof typeof spacing] || left;
  const rValue = right ? (typeof right === 'string' ? right : spacing[right as keyof typeof spacing] || right) : lValue;

  return {
    paddingLeft: String(lValue),
    paddingRight: String(rValue),
  };
}

export function padding_vertical(top: string | number, bottom?: string | number): {
  paddingTop: string;
  paddingBottom: string;
} {
  const tValue = typeof top === 'string' ? top : spacing[top as keyof typeof spacing] || top;
  const bValue = bottom ? (typeof bottom === 'string' ? bottom : spacing[bottom as keyof typeof spacing] || bottom) : tValue;

  return {
    paddingTop: String(tValue),
    paddingBottom: String(bValue),
  };
}

