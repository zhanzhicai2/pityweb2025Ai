import NoRecord from '@/components/NotFound/NoRecord';
import FormForModal from '@/components/PityForm/FormForModal';
import CONFIG from '@/consts/config';
import fields from '@/consts/fields';
import auth from '@/utils/auth';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { connect } from '@umijs/max';
import { Button, Col, Divider, Modal, Row, Table } from 'antd';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface TestCaseAssertProps {
  asserts: any[];
  caseId?: number;
  createMode?: boolean;
}

const TestCaseAssert: React.FC<TestCaseAssertProps> = ({ asserts, caseId, createMode }) => {
  const [assertModal, setAssertModal] = useState(false);
  const [record, setRecord] = useState<any>({});

  const dispatch = useDispatch?.() || (() => {});

  const onDeleteAsserts = async (rec: any) => {
    const res = await dispatch({
      type: 'testcase/deleteTestCaseAsserts',
      payload: { id: rec.id },
    });
    if (res) {
      dispatch({
        type: 'testcase/save',
        payload: {
          asserts: asserts.filter((v: any) => v.id !== rec.id),
        },
      });
    }
  };

  const onDeleteLocalAsserts = (rec: any) => {
    const newData = [...asserts];
    newData.splice(rec.index, 1);
    dispatch({
      type: 'testcase/save',
      payload: {
        asserts: newData,
      },
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '校验内容',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '类型',
      key: 'assert_type',
      dataIndex: 'assert_type',
      render: (text: number) =>
        CONFIG.ASSERT_TYPE[text as unknown as keyof typeof CONFIG.ASSERT_TYPE],
    },
    {
      title: '预期结果',
      key: 'expected',
      dataIndex: 'expected',
      ellipse: true,
    },
    {
      title: '实际结果',
      key: 'actually',
      dataIndex: 'actually',
      ellipse: true,
    },
    {
      title: '操作',
      key: 'ops',
      render: (_: any, rec: any, index: number) => (
        <>
          <a
            onClick={() => {
              setAssertModal(true);
              setRecord({ ...rec, index });
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              Modal.confirm({
                title: '你确定要删除这条断言数据吗?',
                icon: <ExclamationCircleOutlined />,
                content: '删除后不可恢复，请谨慎~',
                okText: '确定',
                okType: 'danger',
                cancelText: '点错了',
                onOk: async () => {
                  if (createMode) {
                    onDeleteLocalAsserts({ ...rec, index });
                  } else {
                    await onDeleteAsserts(rec);
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

  const onSaveAssert = async (values: any) => {
    const data = { case_id: caseId, ...values };
    let res;
    if (createMode) {
      let newData;
      if (record.index !== undefined) {
        newData = [...asserts];
        newData.splice(record.index, 1, { ...data });
      } else {
        newData = [...asserts, { ...data }];
      }
      await dispatch({
        type: 'testcase/save',
        payload: {
          asserts: newData,
        },
      });
      setAssertModal(false);
    } else {
      if (record.id) {
        res = (await dispatch({
          type: 'testcase/updateTestCaseAsserts',
          payload: { ...data, id: record.id },
        })) as any;
        if (auth.response(res, true)) {
          setAssertModal(false);
          const newData = [...asserts];
          const index = newData.findIndex((item) => record.id === item.id);
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...res.data });
          await dispatch({
            type: 'testcase/save',
            payload: {
              asserts: newData,
            },
          });
        }
      } else {
        res = (await dispatch({
          type: 'testcase/insertTestCaseAsserts',
          payload: data,
        })) as any;
        if (auth.response(res, true)) {
          setAssertModal(false);
          await dispatch({
            type: 'testcase/save',
            payload: {
              asserts: [...asserts, res.data],
            },
          });
        }
      }
    }
  };

  return (
    <Row gutter={8}>
      <Col span={24}>
        <FormForModal
          open={assertModal}
          fields={fields.CaseAsserts}
          title="用例断言"
          left={6}
          right={18}
          onFinish={onSaveAssert}
          onCancel={() => setAssertModal(false)}
          record={record}
        />
        <Row style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Button
              type="primary"
              onClick={() => {
                setAssertModal(true);
                setRecord({});
              }}
            >
              <PlusOutlined />
              添加断言
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={asserts}
          rowKey={(record: any) => record.id}
          locale={{ emptyText: <NoRecord height={150} /> }}
        />
      </Col>
    </Row>
  );
};

export default connect(({ testcase, loading }: any) => ({ testcase, loading }))(TestCaseAssert);
