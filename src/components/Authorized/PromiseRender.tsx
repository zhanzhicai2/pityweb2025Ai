import { Spin } from 'antd';
import isEqual from 'lodash/isEqual';
import React from 'react';
import { isComponentClass } from './Secured';

interface PromiseRenderProps {
  ok?: React.ReactNode;
  error?: React.ReactNode;
  promise?: Promise<any>;
}

export default class PromiseRender extends React.Component<PromiseRenderProps> {
  state = {
    component: () => null,
  };

  componentDidMount() {
    this.setRenderComponent(this.props);
  }

  shouldComponentUpdate = (
    nextProps: PromiseRenderProps,
    nextState: { component: () => React.ReactNode },
  ) => {
    const { component } = this.state;
    if (!isEqual(nextProps, this.props)) {
      this.setRenderComponent(nextProps);
    }
    if (nextState.component !== component) return true;
    return false;
  };

  setRenderComponent(props: PromiseRenderProps) {
    const ok = this.checkIsInstantiation(props.ok);
    const error = this.checkIsInstantiation(props.error);
    (props.promise as Promise<any>)
      .then(() => {
        this.setState({ component: ok as () => React.ReactNode });
        return true;
      })
      .catch(() => {
        this.setState({ component: error as () => React.ReactNode });
      });
  }

  checkIsInstantiation = (target?: React.ReactNode) => {
    if (!target) return () => null;
    if (isComponentClass(target as any)) {
      const Target = target as React.ComponentType<any>;
      return (props: any) => <Target {...props} />;
    }
    if (React.isValidElement(target)) {
      return (props: any) => React.cloneElement(target as React.ReactElement, props);
    }
    return () => target;
  };

  render() {
    const { component: Component } = this.state;
    return Component ? (
      <Component />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          margin: 'auto',
          paddingTop: 50,
          textAlign: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
}
