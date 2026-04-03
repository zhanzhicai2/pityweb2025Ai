import React from 'react';
import { history } from 'umi';
import Authorized from './Authorized';

interface AuthorizedRouteProps {
  component?: React.ComponentType<any>;
  render?: (props: any) => React.ReactNode;
  authority?: any;
  redirectPath?: string;
  [key: string]: any;
}

const AuthorizedRoute = (props: AuthorizedRouteProps) => {
  const { component: Component, render, authority, redirectPath, ...rest } = props;
  return (
    <Authorized
      authority={authority}
      noMatch={<div onClick={() => history.push(redirectPath || '/')} />}
    >
      {Component ? <Component {...rest} /> : render ? render(rest) : null}
    </Authorized>
  );
};

export default AuthorizedRoute;
