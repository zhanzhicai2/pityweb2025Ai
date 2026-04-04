export default {
  calPercent: function Percentage(num: number, total: number): number {
    if (num === 0 || total === 0) {
      return 0;
    }
    return Math.round((num / total) * 10000) / 100.0; // 小数点后两位百分比
  },

  calPiePercent: function Percentage(num: number, total: number): number {
    if (num === 0 || total === 0) {
      return 0;
    }
    return Math.round((num / total) * 100) / 100.0; // 小数点后两位百分比
  },
  parseHeaders: (headers: string | Record<string, string> | undefined) => {
    if (!headers) {
      return [];
    }
    let hd: Record<string, string> = {};
    if (typeof headers === 'string') {
      hd = JSON.parse(headers);
    } else {
      hd = headers;
    }
    return Object.keys(hd).map((key, index) => ({
      key,
      value: hd[key],
      id: index,
    }));
  },
  translateHeaders: (headers: any) => {
    const hd: Record<string, string> = {};
    for (const h in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, h)) {
        hd[headers[h].key] = headers[h].value;
      }
    }
    return JSON.stringify(hd, null, 2);
  },
} as any;
