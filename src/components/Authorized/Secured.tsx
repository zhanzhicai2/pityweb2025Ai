import React from 'react';
import CheckPermissions from './CheckPermissions';

const Exception403 = () => 403;

export const isComponentClass = (component: any): boolean => {
  if (!component) return false;
  const proto = Object.getPrototypeOf(component);
  if (proto === React.Component || proto === Function.prototype) return true;
  return isComponentClass(proto);
};

const checkIsInstantiation = (target: any) => {
  if (isComponentClass(target)) {
    const Target = target;
    return (props: any) => <Target {...props} />;
  }
  if (React.isValidElement(target)) {
    return (props: any) => React.cloneElement(target, props);
  }
  return () => target;
};

const authorize = (authority: any, error?: React.ReactNode) => {
  let classError: any = false;
  if (error) {
    classError = () => error;
  }
  if (!authority) {
    throw new Error('authority is required');
  }
  return function decideAuthority(target: any) {
    const component = CheckPermissions(authority, target, classError || (() => Exception403()));
    return checkIsInstantiation(component);
  };
};

export default authorize;
