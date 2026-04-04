import NoRecord2 from '@/components/NotFound/NoRecord2';
import { Avatar, Collapse, Tag } from 'antd';
import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './OperationLog.less';

const OperationType: Record<number, React.ReactNode> = {
  0: <span className={styles.operationType}>添加了</span>,
  1: <span className={styles.operationType}>更新了</span>,
  2: <span className={styles.operationType}>删除了</span>,
  3: <span className={styles.operationType}>执行了</span>,
  4: <span className={styles.operationType}>终止了</span>,
};

const { Panel } = Collapse;

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface OperationRecord {
  id: number;
  title: string;
  user_id: number;
  mode: number;
  tag: string;
  description: string;
  operate_time: string;
}

interface OperationLogProps {
  userMap: Record<number, User>;
  userId: number;
  record: OperationRecord[];
}

const OperationLog: React.FC<OperationLogProps> = ({ userMap, userId, record }) => {
  const getTitle = (item: OperationRecord) => {
    const { title } = item;
    const data = title.split('&');
    const titles = data.map((v) => {
      const [key, value] = v.split('=');
      return `${key}: ${value}`;
    });
    const realTitle = titles.join('　');
    return (
      <div>
        <Avatar
          src={
            userMap[userId]?.avatar ||
            `https://joeschmoe.io/api/v1/${userMap[userId]?.name || 'unknown'}`
          }
        />
        <span className={styles.tag}>
          <Tag color="green">{item.tag}</Tag>
        </span>
        <span className={styles.userName}>{userMap[item.user_id]?.name}</span>
        <span>{OperationType[item.mode]}</span>
        <span>{realTitle}</span>
      </div>
    );
  };

  const convertBool = (value: any) => {
    if (value === true) {
      return '是';
    } else if (value === false) {
      return '否';
    }
    return value;
  };

  interface DescItem {
    name: string;
    old?: any;
    now?: any;
  }

  const getDescription = (item: OperationRecord) => {
    const desc: DescItem[] = JSON.parse(item.description);
    return (
      <div className={styles.description}>
        {desc.length > 0
          ? desc.map((v, index) => {
              if (v.old === null) {
                return (
                  <div className={styles.desc} key={index}>
                    <span className={styles.field}>{v.name}:</span>
                    <strong className={styles.newField}>{v.now}</strong>
                  </div>
                );
              }
              return (
                <div className={styles.desc} key={index}>
                  <span className={styles.field}>{v.name}</span> 由 <del>{convertBool(v.old)}</del>{' '}
                  变更为
                  <strong className={styles.newField}>{convertBool(v.now)}</strong>
                </div>
              );
            })
          : '未发生变动'}
      </div>
    );
  };

  return record.length > 0 ? (
    <Scrollbars
      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}
      style={{ width: '100%', height: 300 }}
    >
      <Collapse ghost>
        {record.map((item) => (
          <Panel header={<span>{getTitle(item)}</span>} key={item.id} extra={item.operate_time}>
            {getDescription(item)}
          </Panel>
        ))}
      </Collapse>
    </Scrollbars>
  ) : (
    <NoRecord2 desc="没有操作记录" height={160} />
  );
};

export default OperationLog;
