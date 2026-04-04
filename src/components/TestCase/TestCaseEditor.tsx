import styles from '@/components/Drawer/CaseDetail.less';
import getComponent from '@/components/PityForm';
import TestCaseBottom from '@/components/TestCase/TestCaseBottom';
import fields from '@/consts/fields';
import { PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { connect } from '@umijs/max';
import { Button, Card, Col, Form, Row } from 'antd';
import React, { useEffect } from 'react';

const FormItem = Form.Item;

interface TestCaseEditorProps {
  dispatch: any;
  form: any;
  testcase: any;
  caseId?: number;
  body: any;
  setBody: (body: any) => void;
  headers: any[];
  setHeaders: (headers: any[]) => void;
  formData: any[];
  setFormData: (data: any[]) => void;
  bodyType: number;
  setBodyType: (type: number) => void;
  setSuffix: (suffix: boolean) => void;
  onSubmit: (create: boolean) => void;
  create?: boolean;
}

const TestCaseEditor: React.FC<TestCaseEditorProps> = ({
  dispatch,
  form,
  testcase,
  caseId,
  body,
  setBody,
  headers,
  setHeaders,
  formData,
  setFormData,
  bodyType,
  setBodyType,
  setSuffix,
  onSubmit,
  create = false,
}) => {
  const { caseInfo } = testcase;

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(caseInfo);
    setBody(caseInfo.body);
  }, [caseInfo]);

  return (
    <Form form={form} name="addCase" initialValues={caseInfo}>
      <Card
        title={<span className={styles.caseTitle}>场景信息</span>}
        extra={
          create ? null : (
            <>
              <Button
                type="primary"
                onClick={async () => {
                  await onSubmit(create);
                }}
              >
                <SaveOutlined /> 提交
              </Button>
              {!create ? (
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    dispatch({
                      type: 'testcase/save',
                      payload: { editing: false },
                    });
                  }}
                >
                  <SaveOutlined /> 取消
                </Button>
              ) : (
                <Button style={{ marginLeft: 8 }}>
                  <PlayCircleOutlined /> 测试
                </Button>
              )}
            </>
          )
        }
      >
        <Row gutter={[8, 8]}>
          {fields.CaseDetail.map((item: any) => (
            <Col span={item.span || 24} key={item.name}>
              <FormItem
                label={item.label}
                colon={item.colon || true}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: item.required, message: item.message }]}
                name={item.name}
                valuePropName={item.valuePropName || 'value'}
              >
                {getComponent(item.type, item.placeholder, item.component)}
              </FormItem>
            </Col>
          ))}
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <TestCaseBottom
              case_id={caseId}
              body={body}
              bodyType={bodyType}
              setBody={setBody}
              headers={headers}
              setHeaders={setHeaders}
              form={form}
              createMode={create}
              formData={formData}
              setFormData={setFormData}
              setSuffix={setSuffix}
              setBodyType={setBodyType}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default connect(({ user, testcase, loading }: any) => ({ testcase, user, loading }))(
  TestCaseEditor,
);
