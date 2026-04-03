import React from 'react';
import PromiseRender from './PromiseRender';
import { CURRENT } from './renderAuthorize';

interface CheckPermissionsProps {
  authority?:
    | string
    | string[]
    | ((currentAuthority: string | string[]) => boolean | Promise<boolean>);
  currentAuthority?: string | string[];
  target: React.ReactNode;
  Exception?: React.ReactNode;
}

/**
 * 通用权限检查方法 Common check permissions method
 */
const checkPermissions = ({
  authority,
  currentAuthority,
  target,
  Exception,
}: CheckPermissionsProps) => {
  if (!authority) {
    return target;
  }

  if (Array.isArray(authority)) {
    if (Array.isArray(currentAuthority)) {
      if (currentAuthority.some((item) => authority.includes(item))) {
        return target;
      }
    } else if (authority.includes(currentAuthority as string)) {
      return target;
    }
    return Exception;
  }

  if (typeof authority === 'string') {
    if (Array.isArray(currentAuthority)) {
      if (currentAuthority.some((item) => authority === item)) {
        return target;
      }
    } else if (authority === currentAuthority) {
      return target;
    }
    return Exception;
  }

  if (authority instanceof Promise) {
    return <PromiseRender ok={target as any} error={Exception as any} promise={authority} />;
  }

  if (typeof authority === 'function') {
    const bool = (authority as (currentAuthority: string | string[]) => boolean | Promise<boolean>)(
      currentAuthority as string | string[],
    );
    if (bool instanceof Promise) {
      return <PromiseRender ok={target as any} error={Exception as any} promise={bool} />;
    }
    if (bool) {
      return target;
    }
    return Exception;
  }

  throw new Error('unsupported parameters');
};

export { checkPermissions };

function check(
  authority: CheckPermissionsProps['authority'],
  target: React.ReactNode,
  Exception?: React.ReactNode,
) {
  return checkPermissions({
    authority,
    currentAuthority: CURRENT as string | string[],
    target,
    Exception,
  });
}

export default check;
