// @ts-nocheck
import { Avatar, Tooltip } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

const avatarSizeToClassName = (size: string) =>
  classNames(styles.avatarItem, {
    [styles.avatarItemLarge]: size === 'large',
    [styles.avatarItemSmall]: size === 'small',
    [styles.avatarItemMini]: size === 'mini',
  });

interface ItemProps {
  src?: string;
  size?: string | number;
  tips?: string;
  onClick?: () => void;
}

const Item = ({ src, size, tips, onClick = () => {} }: ItemProps) => {
  const cls = avatarSizeToClassName(size as string);
  return (
    <li className={cls} onClick={onClick}>
      {tips ? (
        <Tooltip title={tips}>
          <Avatar
            src={src}
            size={size}
            style={{
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      ) : (
        <Avatar src={src} size={size} />
      )}
    </li>
  );
};

interface AvatarListProps {
  children?: React.ReactNode;
  size?: string | number;
  maxLength?: number;
  excessItemsStyle?: React.CSSProperties;
}

const AvatarList = ({
  children,
  size,
  maxLength = 5,
  excessItemsStyle,
  ...other
}: AvatarListProps) => {
  const numOfChildren = React.Children.count(children);
  const numToShow = maxLength >= numOfChildren ? numOfChildren : maxLength;
  const childrenArray = React.Children.toArray(children);
  const childrenWithProps = childrenArray.slice(0, numToShow).map((child) =>
    React.cloneElement(child as React.ReactElement<any>, {
      size,
    }),
  );

  if (numToShow < numOfChildren) {
    const cls = avatarSizeToClassName(size as string);
    childrenWithProps.push(
      <li key="exceed" className={cls}>
        <Avatar size={size} style={excessItemsStyle}>{`+${numOfChildren - maxLength}`}</Avatar>
      </li>,
    );
  }

  return (
    <div {...other} className={styles.avatarList}>
      <ul> {childrenWithProps} </ul>
    </div>
  );
};

AvatarList.Item = Item;
export default AvatarList;
