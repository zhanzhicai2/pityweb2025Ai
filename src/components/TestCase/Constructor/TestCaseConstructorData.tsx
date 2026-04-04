import ConstructorCopy from '@/components/TestCase/Constructor/ConstructorCopy';
import TestCaseConstructor from '@/components/TestCase/Constructor/TestCaseConstructor';
import { connect } from '@umijs/max';
import { Col, Row } from 'antd';
import React from 'react';

interface TestCaseConstructorDataProps {
  caseId?: number;
  construct: any;
  dispatch: any;
  form: any;
  onFinish?: (values: any) => void;
  suffix?: boolean;
}

const TestCaseConstructorData: React.FC<TestCaseConstructorDataProps> = ({
  construct,
  dispatch,
  form,
  suffix,
}) => {
  const { testcaseData, testCaseConstructorData, constructorType } = construct;

  return (
    <Row style={{ marginTop: 24 }} gutter={[8, 8]}>
      <Col span={24}>
        <ConstructorCopy suffix={suffix} />
        <Row gutter={8}>
          <Col span={24}>
            <TestCaseConstructor
              data={testCaseConstructorData}
              dispatch={dispatch}
              testcaseData={testcaseData}
              constructorType={constructorType}
              form={form}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default connect(({ construct, loading }: any) => ({
  construct,
  loading,
}))(TestCaseConstructorData);
