import CONFIG from '@/consts/config';
import { Avatar, List } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './NoticeList.less';

interface NoticeItem {
  key?: string;
  read?: boolean;
  avatar?: string | React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  datetime?: React.ReactNode;
  extra?: React.ReactNode;
}

interface NoticeListProps {
  data?: NoticeItem[];
  onClick?: (item: NoticeItem) => void;
  onClear?: () => void;
  title?: React.ReactNode;
  onViewMore?: () => void;
  emptyText?: React.ReactNode;
  showClear?: boolean;
  clearText?: string;
  viewMoreText?: string;
  showViewMore?: boolean;
}

const NoticeList: React.FC<NoticeListProps> = ({
  data = [],
  onClick,
  onClear,
  title,
  onViewMore,
  emptyText,
  showClear = true,
  clearText,
  viewMoreText,
  showViewMore = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.notFound}>
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
          alt="not found"
        />
        <div>{emptyText}</div>
      </div>
    );
  }

  return (
    <div>
      <List
        className={styles.list}
        dataSource={data}
        renderItem={(item: NoticeItem, i: number) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
          });

          const leftIcon = item.avatar ? (
            typeof item.avatar === 'string' ? (
              <Avatar className={styles.avatar} src={item.avatar || CONFIG.AVATAR_URL} />
            ) : (
              <span className={styles.iconElement}>{item.avatar}</span>
            )
          ) : null;
          return (
            <List.Item
              className={itemCls}
              key={item.key || i}
              onClick={() => {
                onClick?.(item);
              }}
            >
              <List.Item.Meta
                className={styles.meta}
                avatar={leftIcon}
                title={
                  <div className={styles.title}>
                    {item.title}
                    <div className={styles.extra}>{item.extra}</div>
                  </div>
                }
                description={
                  <div>
                    <div className={styles.description}>{item.description}</div>
                    <div className={styles.datetime}>{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <div className={styles.bottomBar}>
        {showClear ? (
          <div onClick={onClear}>
            {clearText} {title}
          </div>
        ) : null}
        {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e);
              }
            }}
          >
            {viewMoreText}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NoticeList;
