// @ts-nocheck
// @ts-nocheck
import UserLink from '@/components/Button/UserLink';
import PityPopConfirm from '@/components/Confirm/PityPopConfirm';
import CONFIG from '@/consts/config';
import { UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { connect } from '@umijs/max';
import { Card, Col, Divider, Form, Input, Modal, Row, Select, Switch, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: number;
  last_login_at?: string;
  is_valid: boolean;
}

interface UserState {
  userList: UserRecord[];
  currentUserList: UserRecord[];
}

interface LoadingState {
  effects: Record<string, boolean>;
}

interface UserInfoProps {
  user: UserState;
  dispatch: (action: { type: string; payload?: any }) => void;
  loading: LoadingState;
}

const UserInfo = ({ user, dispatch, loading }: UserInfoProps) => {
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState<UserRecord>({} as UserRecord);
  const [form] = Form.useForm();

  const fetchUserInfo = () => {
    dispatch({
      type: 'user/fetchUserList',
    });
  };

  const onSwitch = (value: boolean, id: number) => {
    dispatch({
      type: 'user/updateUser',
      payload: {
        id,
        is_valid: value,
      },
    });
  };

  const onDeleteUser = async (id: number) => {
    const res = await dispatch({
      type: 'user/deleteUser',
      payload: {
        id,
      },
    });
    if (res) {
      fetchUserInfo();
    }
  };

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: (
        <span>
          <UserOutlined /> 姓名
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: UserRecord) => <UserLink marginLeft={4} user={record} />,
    },
    {
      title: '✉ 邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '🎨 角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => (
        <Tag color={CONFIG.USER_ROLE_TAG[role]}>{CONFIG.USER_ROLE[role]}</Tag>
      ),
    },
    {
      title: '上次登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
    },
    {
      title: '🚫 是否启用',
      dataIndex: 'is_valid',
      key: 'is_valid',
      render: (is_valid: boolean, record: UserRecord) => (
        <Switch
          defaultChecked={is_valid}
          onChange={(e) => {
            onSwitch(e, record.id);
          }}
        />
      ),
    },
    {
      title: '🧷 操作',
      key: 'ops',
      render: (_: any, record: UserRecord) => (
        <>
          <a
            onClick={() => {
              setRecord(record);
              form.setFieldsValue(record);
              setModal(true);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <PityPopConfirm
            onConfirm={async () => {
              await onDeleteUser(record.id);
            }}
            text="删除"
            title="你确定要删除该用户吗?"
          />
        </>
      ),
    },
  ];

  const { userList, currentUserList } = user;

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const onSearch = (value: string) => {
    if (value === '') {
      fetchUserInfo();
      return;
    }
    const temp = userList.filter(
      (item) =>
        item.name.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
        item.email.toLowerCase().indexOf(value.toLowerCase()) > -1,
    );
    dispatch({
      type: 'user/save',
      payload: {
        currentUserList: temp,
      },
    });
  };

  const onSubmit = async () => {
    const values = await form.getFieldsValue();
    const result = await dispatch({
      type: 'user/updateUser',
      payload: {
        ...values,
        id: record.id,
      },
    });
    if (result) {
      const temp = [...currentUserList];
      currentUserList.forEach((v, idx) => {
        if (v.id === record.id) {
          temp[idx] = {
            ...record,
            ...values,
          };
        }
      });
      dispatch({
        type: 'user/save',
        payload: { currentUserList: temp },
      });
      setModal(false);
    }
  };

  return (
    <PageContainer breadcrumb={undefined} title="用户管理页面">
      <Card>
        <Modal
          title="编辑用户"
          width={500}
          open={modal}
          onCancel={() => setModal(false)}
          onOk={onSubmit}
        >
          <Form form={form} initialValues={record} {...CONFIG.LAYOUT}>
            <Form.Item label="姓名" name="name">
              <Input placeholder="输入用户姓名" />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input placeholder="输入用户邮箱" />
            </Form.Item>
            <Form.Item label="角色" name="role">
              <Select>
                <Option key={0} value={0}>
                  普通成员
                </Option>
                <Option key={1} value={1}>
                  组长
                </Option>
                <Option key={2} value={2}>
                  超级管理员
                </Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Row style={{ marginBottom: 12 }}>
          <Col span={18} />
          <Col span={6}>
            <Input.Search
              placeholder="输入用户邮箱或姓名"
              onChange={(e) => {
                onSearch(e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={currentUserList}
              loading={loading.effects['user/fetchUserList']}
            />
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default connect(({ user, loading }: { user: UserState; loading: LoadingState }) => ({
  user,
  loading,
}))(UserInfo);
