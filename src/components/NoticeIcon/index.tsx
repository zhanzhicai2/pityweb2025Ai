import { BellOutlined } from '@ant-design/icons';
import { Badge, Spin, Tabs } from 'antd';
import classNames from 'classnames';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import React from 'react';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import NoticeList from './NoticeList';

const { TabPane } = Tabs;

interface NoticeIconProps {
  className?: string;
  count?: number;
  bell?: React.ReactNode;
  loading?: boolean;
  popupVisible?: boolean;
  onPopupVisibleChange?: (visible: boolean) => void;
  onClear?: (title: string, tabKey: string) => void;
  onTabChange?: (tabKey: string) => void;
  onItemClick?: (item: any, tabProps: any) => void;
  onViewMore?: (tabProps: any, event: any) => void;
  clearText?: string;
  viewMoreText?: string;
  children?: React.ReactNode;
}

const NoticeIcon: React.FC<NoticeIconProps> = (props) => {
  const getNotificationBox = () => {
    const {
      children,
      loading,
      onClear,
      onTabChange,
      onItemClick,
      onViewMore,
      clearText,
      viewMoreText,
    } = props;

    if (!children) {
      return null;
    }

    const panes: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (!child) {
        return;
      }

      const { list, title, count, tabKey, showClear, showViewMore } = (child as any).props;
      const len = list && list.length ? list.length : 0;
      const msgCount = count || count === 0 ? count : len;
      const tabTitle = msgCount > 0 ? `${title} (${msgCount})` : title;
      panes.push(
        <TabPane tab={tabTitle} key={tabKey}>
          <NoticeList
            {...(child as any).props}
            clearText={clearText}
            viewMoreText={viewMoreText}
            data={list}
            onClear={() => {
              onClear?.(title, tabKey);
            }}
            onClick={(item: any) => {
              onItemClick?.(item, (child as any).props);
            }}
            onViewMore={(event: any) => {
              onViewMore?.((child as any).props, event);
            }}
            showClear={showClear}
            showViewMore={showViewMore}
            title={title}
          />
        </TabPane>,
      );
    });
    return (
      <Spin spinning={loading} delay={300}>
        <Tabs className={styles.tabs} onChange={onTabChange}>
          {panes}
        </Tabs>
      </Spin>
    );
  };

  const { className, count, bell } = props;
  const [visible, setVisible] = useMergedState(false, {
    value: props.popupVisible,
    onChange: props.onPopupVisibleChange,
  });
  const noticeButtonClass = classNames(className, styles.noticeButton);
  const notificationBox = getNotificationBox();
  const NoticeBellIcon = bell || <BellOutlined className={styles.icon} />;
  const trigger = (
    <span
      className={classNames(noticeButtonClass, {
        opened: visible,
      })}
    >
      <Badge
        count={count}
        style={{
          boxShadow: 'none',
        }}
        className={styles.badge}
      >
        {NoticeBellIcon}
      </Badge>
    </span>
  );

  if (!notificationBox) {
    return trigger;
  }

  return (
    <HeaderDropdown
      placement="bottomRight"
      overlayClassName={styles.popover}
      open={visible}
      onOpenChange={(open) => setVisible(open)}
    >
      {notificationBox}
      {trigger}
    </HeaderDropdown>
  );
};

(NoticeIcon as any).Tab = NoticeList;
export default NoticeIcon;
