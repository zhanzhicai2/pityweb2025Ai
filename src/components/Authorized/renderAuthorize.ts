/* eslint-disable @typescript-eslint/no-unused-vars */
let CURRENT: string | string[] = 'NULL';

/**
 * Use authority or getAuthority
 *
 * @param {string|()=>String} currentAuthority
 */
const renderAuthorize =
  (Authorized: any) => (currentAuthority?: string | (() => string) | string[] | null) => {
    if (currentAuthority) {
      if (typeof currentAuthority === 'function') {
        CURRENT = currentAuthority();
      } else if (
        Object.prototype.toString.call(currentAuthority) === '[object String]' ||
        Array.isArray(currentAuthority)
      ) {
        CURRENT = currentAuthority;
      }
    } else {
      CURRENT = 'NULL';
    }

    return Authorized;
  };

export { CURRENT };
export default (Authorized: any) => renderAuthorize(Authorized);
