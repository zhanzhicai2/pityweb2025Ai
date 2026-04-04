// @ts-nocheck
import UserLink from '@/components/Button/UserLink';
import FormForModal from '@/components/PityForm/FormForModal';
import fields from '@/consts/fields';
import { insertEnvironment, listEnvironment, updateEnvironment } from '@/services/configure';
import { listUsers } from '@/services/user';
import auth from '@/utils/auth';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Divider, Input, Row, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';

interface Environment {
  id: number;
  name: string;
  remarks?: string;
  create_user: number;
  updated_at: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

export default () => {
  const [name, setName] = useState('');
  const [data, setData] = useState<Environment[]>([]);
  const [record, setRecord] = useState<Environment>({
    id: 0,
    name: '',
    create_user: 0,
    updated_at: '',
  });
  const [users, setUsers] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pageSize: 8, total: 0 });

  const getUsers = async () => {
    const user = await listUsers();
    const temp: Record<string, string> = {};
    user.forEach((item: { id: number; name: string }) => {
      temp[item.id] = item.name;
    });
    setUsers(temp);
  };

  const fetchEnvironmentList = async (
    _page = pagination.current,
    _size = pagination.pageSize,
    searchName = name,
  ) => {
    setLoading(true);
    const res = await listEnvironment({ page: _page, size: _size, name: searchName });
    if (auth.response(res)) {
      setData(res.data);
      setPagination({ ...pagination, total: res.data });
    }
    setLoading(false);
  };

  const init = async () => {
    await fetchEnvironmentList();
    await getUsers();
  };

  useEffect(() => {
    init();
  }, []);

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '环境名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '备注',
      key: 'remarks',
      dataIndex: 'remarks',
    },
    {
      title: '创建人',
      key: 'create_user',
      render: (_: any, record: Environment) => (
        <UserLink user={users[record.create_user.toString()]} />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'operation',
      render: (_: any, record: Environment) => (
        <>
          <a
            onClick={() => {
              setRecord(record);
              setVisible(true);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <a>删除</a>
        </>
      ),
    },
  ];

  const onHandleSearch = () => {};

  const onChange = () => {};

  const onFinish = async (values: Record<string, any>) => {
    const params = { ...values, id: record.id };
    let res;
    if (record.id === 0) {
      res = await insertEnvironment(params);
    } else {
      res = await updateEnvironment(params);
    }
    if (auth.response(res, true)) {
      setVisible(false);
    }
    await fetchEnvironmentList();
  };

  return (
    <PageContainer title="环境配置" breadcrumb={null}>
      <Spin spinning={loading}>
        <FormForModal
          open={visible}
          onCancel={() => setVisible(false)}
          title="环境管理"
          left={6}
          right={18}
          width={500}
          record={record}
          onFinish={onFinish}
          fields={fields.Environment}
        />
        <Card>
          <Row>
            <Col span={6}>
              <Button type="primary" onClick={() => setVisible(true)}>
                新增环境
              </Button>
            </Col>
            <Col span={12} />
            <Col span={6}>
              <Input.Search
                value={name}
                onChange={(e) => setName(e.target.value)}
                onSearch={onHandleSearch}
                placeholder="请输入环境名"
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col span={24}>
              <Table columns={columns} dataSource={data} pagination={onChange} />
            </Col>
          </Row>
        </Card>
      </Spin>
    </PageContainer>
  );
};
