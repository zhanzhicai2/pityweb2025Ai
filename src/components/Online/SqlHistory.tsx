import UserLink from '@/components/Button/UserLink';
import { connect } from '@umijs/max';
import { Badge, Table, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';

const { Text } = Typography;

interface SqlHistoryProps {
  dispatch: any;
  user: any;
  online: any;
  loading: any;
}

interface HistoryRecord {
  id: number;
  sql: string;
  elapsed: number;
  create_user: number;
  created_at: string;
  database: {
    name: string;
    env_info: {
      name: string;
    };
  };
}

const SqlHistory: React.FC<SqlHistoryProps> = ({ dispatch, user, online, loading }) => {
  const { historyPage: pagination, historyData: data } = online;
  const { userMap } = user;

  useEffect(() => {
    if (Object.keys(userMap).length === 0) {
      dispatch({
        type: 'user/fetchUserList',
      });
    }
  }, []);

  const columns = [
    {
      title: '环境',
      key: 'env',
      render: (_: any, record: HistoryRecord) => <Tag>{record.database.env_info.name}</Tag>,
    },
    {
      title: '数据库',
      key: 'database',
      render: (_: any, record: HistoryRecord) => record.database.name,
    },
    {
      title: 'SQL',
      dataIndex: 'sql',
      ellipse: true,
      render: (sql: string) => (
        <Text copyable ellipsis={true}>
          {sql}
        </Text>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'elapsed',
      render: (elapsed: number) => (
        <Badge status={elapsed > 200 ? 'error' : 'success'} text={`${elapsed}ms`} />
      ),
    },
    {
      title: '执行人',
      dataIndex: 'create_user',
      render: (userId: number) => <UserLink user={userMap[userId]} />,
    },
    {
      title: '执行时间',
      dataIndex: 'created_at',
    },
  ];

  const fetchData = () => {
    dispatch({
      type: 'online/fetchHistorySQL',
      payload: {
        page: pagination.current,
        size: pagination.pageSize,
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  return (
    <Table
      size="small"
      columns={columns}
      pagination={pagination}
      dataSource={data}
      loading={loading.effects['online/fetchHistorySQL']}
      onChange={(pg: any) => {
        dispatch({
          type: 'online/save',
          payload: {
            historyPage: {
              ...pagination,
              current: pg.current,
              pageSize: pg.pageSize,
            },
          },
        });
      }}
      rowKey={(record: HistoryRecord) => record.id}
    />
  );
};

export default connect(({ user, loading, online }: any) => ({ user, loading, online }))(SqlHistory);
