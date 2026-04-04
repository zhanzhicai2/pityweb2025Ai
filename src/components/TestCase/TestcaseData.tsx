import JSONAceEditor from '@/components/CodeEditor/AceEditor/JSONAceEditor';
import NoRecord from '@/components/NotFound/NoRecord';
import FormForModal from '@/components/PityForm/FormForModal';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { connect } from '@umijs/max';
import { Alert, Button, Card, Col, Divider, Modal, Row, Table } from 'antd';
import React, { useEffect, useState } from 'react';

interface TestcaseDataProps {
  caseId?: number;
  testcase: any;
  loading: any;
  dispatch: any;
  currentEnv: string;
  createMode?: boolean;
}

const TestcaseData: React.FC<TestcaseDataProps> = ({
  caseId,
  testcase,
  loading,
  dispatch,
  currentEnv,
  createMode = false,
}) => {
  const { testData } = testcase;
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 5 });
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [record, setRecord] = useState<any>({});
  const [modal, setModal] = useState(false);
  const [, setEditor] = useState<any>(null);

  useEffect(() => {
    const current = parseInt(currentEnv, 10);
    const temp = testData[current];
    if (temp) {
      setDataSource([...temp]);
      setPagination({ ...pagination, current: 1, total: temp.length });
    } else {
      setDataSource([]);
      setPagination({ ...pagination, current: 1, total: 0 });
    }
  }, [currentEnv, testData]);

  const onRemoveTestData = async (data: any) => {
    const newData = { ...testData };
    const temp = newData[parseInt(currentEnv, 10)];
    newData[parseInt(currentEnv, 10)] = temp.filter((item: any) => data.name !== item.name);
    await dispatch({
      type: 'testcase/save',
      payload: {
        testData: newData,
      },
    });
  };

  const onDeleteTestData = async (id: number) => {
    const res = await dispatch({
      type: 'testcase/deleteTestcaseData',
      payload: {
        id,
      },
    });
    if (res) {
      const newData = { ...testData };
      const temp = newData[parseInt(currentEnv, 10)];
      newData[parseInt(currentEnv, 10)] = temp.filter((item: any) => item.id !== id);
      await dispatch({
        type: 'testcase/save',
        payload: {
          testData: newData,
        },
      });
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '场景名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '测试数据',
      dataIndex: 'json_data',
      key: 'json_data',
      ellipse: true,
    },
    {
      title: '操作',
      key: 'ops',
      render: (_: any, rec: any, index: number) => (
        <>
          <a
            onClick={() => {
              setRecord({ ...rec, index });
              setModal(true);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              Modal.confirm({
                title: '你确定要删除这条测试数据吗?',
                icon: <ExclamationCircleOutlined />,
                content: '删除后不可恢复，请谨慎~',
                okText: '确定',
                okType: 'danger',
                cancelText: '点错了',
                onOk: async () => {
                  if (createMode) {
                    await onRemoveTestData(rec);
                  } else {
                    await onDeleteTestData(rec.id);
                  }
                },
              });
            }}
          >
            删除
          </a>
        </>
      ),
    },
  ];

  const onCreateModeFinish = async (values: any) => {
    const newData = { ...testData };
    const data = {
      env: currentEnv,
      ...values,
    };
    if (record.index !== undefined) {
      newData[parseInt(currentEnv, 10)].splice(record.index, 1, data);
    } else {
      if (newData[parseInt(currentEnv, 10)] === undefined) {
        newData[parseInt(currentEnv, 10)] = [data];
      } else {
        newData[parseInt(currentEnv, 10)].push(data);
      }
    }
    dispatch({
      type: 'testcase/save',
      payload: {
        testData: newData,
      },
    });
    setModal(false);
  };

  const onFinish = async (values: any) => {
    let result;
    if (!record.id) {
      result = await dispatch({
        type: 'testcase/insertTestcaseData',
        payload: {
          case_id: caseId,
          env: currentEnv,
          ...values,
        },
      });
    } else {
      result = await dispatch({
        type: 'testcase/updateTestcaseData',
        payload: {
          id: record.id,
          case_id: caseId,
          env: currentEnv,
          ...values,
        },
      });
    }
    if (result) {
      setModal(false);
    }
  };

  const fields = [
    {
      name: 'name',
      label: '测试场景',
      required: true,
      type: 'input',
      placeholder: '请输入测试场景',
      initialValue: record.name,
    },
    {
      name: 'json_data',
      label: 'JSON数据',
      required: true,
      placeholder: '请输入测试场景',
      initialValue: record.name,
      component: <JSONAceEditor height={200} setEditor={setEditor} theme="material-one-dark" />,
    },
  ];

  return (
    <Row gutter={8}>
      <FormForModal
        title="测试数据"
        record={record}
        onCancel={() => {
          setModal(false);
        }}
        left={4}
        right={20}
        width={650}
        open={modal}
        onFinish={createMode ? onCreateModeFinish : onFinish}
        fields={fields}
      >
        <Alert
          closable
          type="info"
          style={{ marginBottom: 12 }}
          message="数据管理接受一串key-value的数据，供大家在case里面使用这些变量，用${变量}的方式。"
          showIcon
        />
      </FormForModal>
      <Col span={24}>
        <Card bordered={false}>
          <Row gutter={8}>
            <Col span={6}>
              <Button
                type="primary"
                onClick={() => {
                  setModal(true);
                  setRecord({});
                }}
              >
                <PlusOutlined /> 添加数据
              </Button>
            </Col>
          </Row>
          <Row gutter={8} style={{ marginTop: 12 }}>
            <Col span={24}>
              <Table
                columns={columns}
                pagination={pagination}
                rowKey={(record: any) => record.id}
                loading={
                  loading.effects['testcase/insertTestcaseData'] ||
                  loading.effects['testcase/updateTestcaseData'] ||
                  loading.effects['testcase/deleteTestcaseData']
                }
                dataSource={dataSource}
                locale={{ emptyText: <NoRecord height={150} /> }}
                onChange={(pg: any) => setPagination({ ...pagination, current: pg.current })}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default connect(({ testcase, loading }: any) => ({ testcase, loading }))(TestcaseData);
