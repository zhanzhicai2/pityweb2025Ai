import { parse } from 'querystring';

const common = {
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
  parseHeaders: (headers: any): any[] => {
    if (!headers) {
      return [];
    }
    let hd: any = {};
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
  translateHeaders: (headers: any): string => {
    const hd: any = {};
    for (const h in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, h)) {
        hd[headers[h].key] = headers[h].value;
      }
    }
    return JSON.stringify(hd, null, 2);
  },
};

export const getPageQuery = (): Record<string, string> =>
  parse(window.location.href.split('?')[1]) as any;

export default common;
