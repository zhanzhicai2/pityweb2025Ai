import TooltipIcon from '@/components/Icon/TooltipIcon';
import AutoEditTable from '@/components/Table/AutoEditTable';
import HELPER from '@/consts/helper';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { connect } from '@umijs/max';
import React from 'react';

const selectMap: Record<number, string> = {
  0: 'Response: 正则',
  1: 'Response: JSONPath',
  2: 'Header: K/V',
  3: 'Cookie: K/V',
  4: '响应状态码',
  5: 'Body: 正则',
  6: 'Body: JSONPath',
  7: 'Request Header: K/V',
};

interface TestCaseOutParametersProps {
  testcase: any;
  caseId?: number;
  createMode?: boolean;
  dispatch?: any;
}

const TestCaseOutParameters: React.FC<TestCaseOutParametersProps> = ({ testcase, dispatch }) => {
  const { outParameters } = testcase;

  const setDataSource = (dataSource: any[]) => {
    dispatch({
      type: 'testcase/save',
      payload: {
        outParameters: dataSource,
      },
    });
  };

  const columns = [
    {
      title: '出参名',
      dataIndex: 'name',
      key: 'name',
      name: '出参名',
      width: '20%',
      editable: true,
      render: (name: string) => name || '请输入出参名',
    },
    {
      title: '来源',
      name: '来源',
      dataIndex: 'source',
      key: 'source',
      width: '25%',
      editable: true,
      render: (source: number) => (source !== undefined ? selectMap[source] : '请选择来源'),
    },
    {
      title: (
        <span>
          解析表达式 <TooltipIcon icon={<QuestionCircleOutlined />} title={HELPER.JSONPATH_TITLE} />
        </span>
      ),
      name: '解析表达式',
      dataIndex: 'expression',
      key: 'expression',
      editable: true,
      render: (expression: string, record: any) =>
        record.source !== 4 ? expression || '请输入解析表达式' : '无需填写',
    },
    {
      title: '第几个匹配项',
      name: '第几个匹配项',
      dataIndex: 'match_index',
      editable: true,
      render: (match_index: string, record: any) =>
        record.source !== 4 && record.source !== 1 && record.source !== 6
          ? match_index || '请输入匹配项'
          : '无需填写',
    },
  ];

  return (
    <AutoEditTable columns={columns} dataSource={outParameters} setDataSource={setDataSource} />
  );
};

export default connect(({ testcase }: any) => ({ testcase }))(TestCaseOutParameters);
