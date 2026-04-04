import PityAceEditor from '@/components/CodeEditor/AceEditor';
import JSONAceEditor from '@/components/CodeEditor/AceEditor/JSONAceEditor';
import TreeXmind from '@/components/G6/TreeXmind';
import { IconFont } from '@/components/Icon/IconFont';
import NoRecord from '@/components/NotFound/NoRecord';
import { queryXmindData } from '@/services/testcase';
import auth from '@/utils/auth';
import { Badge, Descriptions, Drawer, Row, Table, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const TabPane = Tabs.TabPane;

interface TestResultProps {
  response: any;
  caseName?: string;
  width?: number;
  modal: boolean;
  setModal: (modal: boolean) => void;
  single?: boolean;
}

const STATUS: Record<number, { color: string; text: string }> = {
  200: { color: '#67C23A', text: 'OK' },
  401: { color: '#F56C6C', text: 'unauthorized' },
  400: { color: '#F56C6C', text: 'Bad Request' },
};

const resColumns = [
  {
    title: 'KEY',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'VALUE',
    dataIndex: 'value',
    key: 'value',
  },
];

const TestResult: React.FC<TestResultProps> = ({
  response,
  caseName,
  width,
  modal,
  setModal,
  single = true,
}) => {
  const [xmindData, setXmindData] = useState<any>(null);
  const [xmindDataList, setXmindDataList] = useState<any[]>([]);
  const [graph, setGraph] = useState<Record<string, any>>({});
  const [, setEditor] = useState<any>(null);

  const getBrain = async (case_id?: number, isSingle = true) => {
    const res = await queryXmindData({ case_id });
    if (auth.response(res)) {
      if (isSingle) {
        setXmindData(res.data);
      } else {
        const temp = Object.keys(response).map(() => res.data);
        setXmindDataList(temp);
      }
    }
  };

  const getResponse = async () => {
    if (single) {
      if (response.case_id !== undefined) {
        await getBrain();
      }
    } else {
      for (const key of Object.keys(response)) {
        if (response[key].case_id !== undefined) {
          await getBrain(response[key].case_id, false);
        }
        return;
      }
    }
  };

  useEffect(() => {
    getResponse();
  }, [response]);

  const toTable = (field: string, resp = response) => {
    if (resp[field] === null || resp[field] === undefined || resp[field] === '{}') {
      return [];
    }
    const temp = JSON.parse(resp[field]);
    return Object.keys(temp).map((key) => ({
      key,
      value: temp[key],
    }));
  };

  const assertTable = [
    {
      title: '断言信息',
      key: 'msg',
      dataIndex: 'msg',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (text: boolean) => (
        <Badge status={text ? 'success' : 'error'} text={text ? '通过' : '未通过'} />
      ),
    },
  ];

  const getSource = (res = response) => {
    if (res.asserts === undefined || !res.asserts) {
      return [];
    }
    const temp = JSON.parse(res.asserts);
    const result: { status: boolean; msg: string }[] = [];
    Object.keys(temp).forEach((k) => {
      if (typeof temp[k].msg === 'string') {
        result.push({
          status: temp[k].status,
          msg: temp[k].msg,
        });
      } else {
        temp[k].msg.forEach((v: string) => {
          result.push({
            status: temp[k].status,
            msg: v,
          });
        });
      }
    });
    return result;
  };

  const renderSingleTab = (resp = response) => (
    <Tabs style={{ width: '100%', minHeight: 460 }} tabPosition="left">
      <TabPane
        tab={
          <span>
            <IconFont type="icon-yongliliebiao" />
            基本信息
          </span>
        }
        key="1"
      >
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="测试结果">
            <Badge
              status={resp.status ? 'success' : 'error'}
              text={resp.status ? '成功' : '失败'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="请求方式">{resp.request_method}</Descriptions.Item>
          <Descriptions.Item label="HTTP状态码">
            <span
              style={{
                color: STATUS[resp.status_code] ? STATUS[resp.status_code].color : '#F56C6C',
                marginLeft: 8,
                marginRight: 8,
              }}
            >
              {resp.status_code} {STATUS[resp.status_code] ? STATUS[resp.status_code].text : ''}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="执行时间">
            <span style={{ marginLeft: 8, marginRight: 8 }}>
              <span style={{ color: '#67C23A' }}>{resp.cost}</span>
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="请求url" span={2}>
            {resp.url}
          </Descriptions.Item>
          <Descriptions.Item label="请求body" span={2}>
            {resp.request_data ? (
              <SyntaxHighlighter language="json" style={vs2015}>
                {resp.request_data}
              </SyntaxHighlighter>
            ) : (
              <NoRecord height={120} />
            )}
          </Descriptions.Item>
        </Descriptions>
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-duanyan" />
            断言
          </span>
        }
        key="3"
      >
        <Table columns={assertTable} dataSource={getSource(resp)} size="small" pagination={false} />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-rizhi" />
            执行日志
          </span>
        }
        key="2"
      >
        <PityAceEditor
          language="html"
          setEditor={setEditor}
          readOnly={true}
          value={resp.logs}
          height="80vh"
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-header" />
            Request Headers
          </span>
        }
        key="5"
      >
        <Table
          columns={resColumns}
          dataSource={toTable('request_headers', resp)}
          size="small"
          pagination={false}
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-cookies-1" />
            Cookie
          </span>
        }
        key="6"
      >
        <Table
          columns={resColumns}
          dataSource={toTable('cookies', resp)}
          size="small"
          pagination={false}
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-header" />
            Response Headers
          </span>
        }
        key="7"
      >
        <Table
          columns={resColumns}
          dataSource={toTable('response_headers', resp)}
          size="small"
          pagination={false}
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-xiangying" />
            Response
          </span>
        }
        key="4"
      >
        <JSONAceEditor
          setEditor={setEditor}
          readOnly={true}
          value={JSON.stringify(resp?.response || null, null, 2)}
          height="80vh"
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <IconFont type="icon-tounaofengbao" />
            脑图
          </span>
        }
        key="8"
      >
        <div id="container">
          <TreeXmind data={xmindData} graph={graph['container']} setGraph={setGraph} />
        </div>
      </TabPane>
    </Tabs>
  );

  const renderMultiTabs = () => (
    <Tabs style={{ width: '100%', minHeight: 460 }}>
      {Object.keys(response).map((name, index) => (
        <TabPane tab={name} key={index.toString()}>
          <Tabs style={{ width: '100%' }} tabPosition="left">
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-yongliliebiao" />
                  基本信息
                </span>
              }
              key="1"
            >
              <Descriptions column={2} bordered size="middle">
                <Descriptions.Item label="测试结果">
                  <Badge
                    status={response[name].status ? 'success' : 'error'}
                    text={response[name].status ? '成功' : '失败'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="请求方式">
                  {response[name].request_method}
                </Descriptions.Item>
                <Descriptions.Item label="HTTP状态码">
                  <span
                    style={{
                      color: STATUS[response[name].status_code]
                        ? STATUS[response[name].status_code].color
                        : '#F56C6C',
                      marginLeft: 8,
                      marginRight: 8,
                    }}
                  >
                    {response[name].status_code}{' '}
                    {STATUS[response[name].status_code]
                      ? STATUS[response[name].status_code].text
                      : ''}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="执行时间">
                  <span style={{ marginLeft: 8, marginRight: 8 }}>
                    <span style={{ color: '#67C23A' }}>{response[name].cost}</span>
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="请求url" span={2}>
                  {response[name].url}
                </Descriptions.Item>
                <Descriptions.Item label="请求body" span={2}>
                  {response[name].request_data ? (
                    <SyntaxHighlighter language="json" style={vs2015}>
                      {response[name].request_data}
                    </SyntaxHighlighter>
                  ) : (
                    <NoRecord height={120} />
                  )}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-duanyan" />
                  断言
                </span>
              }
              key="3"
            >
              <Table
                columns={assertTable}
                dataSource={getSource(response[name])}
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-rizhi" />
                  执行日志
                </span>
              }
              key="2"
            >
              <PityAceEditor
                language="html"
                setEditor={setEditor}
                readOnly={true}
                value={response[name]?.logs}
                height="80vh"
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-header" />
                  Request Headers
                </span>
              }
              key="5"
            >
              <Table
                columns={resColumns}
                dataSource={toTable('request_headers', response[name])}
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-cookies-1" />
                  Cookie
                </span>
              }
              key="6"
            >
              <Table
                columns={resColumns}
                dataSource={toTable('cookies', response[name])}
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-header" />
                  Response Headers
                </span>
              }
              key="7"
            >
              <Table
                columns={resColumns}
                dataSource={toTable('response_headers', response[name])}
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-xiangying" />
                  Response
                </span>
              }
              key="4"
            >
              <JSONAceEditor
                setEditor={setEditor}
                readOnly={true}
                value={JSON.stringify(response[name]?.response || null, null, 2)}
                height="80vh"
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <IconFont type="icon-tounaofengbao" />
                  脑图
                </span>
              }
              key="8"
            >
              <div id={`container_${index}`}>
                <TreeXmind
                  data={xmindDataList[index]}
                  graph={graph[`container_${index}`]}
                  setGraph={setGraph}
                  container_id={`container_${index}`}
                />
              </div>
            </TabPane>
          </Tabs>
        </TabPane>
      ))}
    </Tabs>
  );

  return (
    <Drawer
      title={
        <span>
          [<strong>{caseName}</strong>] 执行详情
        </span>
      }
      width={width || 1000}
      open={modal}
      placement="right"
      onClose={() => setModal(false)}
    >
      <Row gutter={[8, 8]}>{!single ? renderMultiTabs() : renderSingleTab()}</Row>
    </Drawer>
  );
};

export default TestResult;
