import { Result } from 'antd';
import React from 'react';
import check from './CheckPermissions';

interface AuthorizedProps {
  children?: React.ReactNode;
  authority?:
    | string
    | string[]
    | ((currentAuthority: string | string[]) => boolean | Promise<boolean>);
  noMatch?: React.ReactNode;
}

const Authorized: React.FC<AuthorizedProps> & {
  Secured: any;
  check: typeof check;
} = ({
  children,
  authority,
  noMatch = (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
    />
  ),
}) => {
  const childrenRender = typeof children === 'undefined' ? null : children;
  const dom = check(authority, childrenRender, noMatch);
  return <>{dom}</>;
};

Authorized.Secured = require('./Secured').default;
Authorized.check = check;

export default Authorized;
