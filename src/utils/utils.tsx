import { parse } from 'querystring';

export const getPageQuery = (): Record<string, string> =>
  parse(window.location.href.split('?')[1]) as any;
