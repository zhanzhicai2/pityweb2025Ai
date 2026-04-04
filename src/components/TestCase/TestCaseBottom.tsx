import { IconFont } from '@/components/Icon/IconFont';
import TooltipIcon from '@/components/Icon/TooltipIcon';
import NoRecord from '@/components/NotFound/NoRecord';
import NoRecord2 from '@/components/NotFound/NoRecord2';
import PostmanForm from '@/components/Postman/PostmanForm';
import SortedTable from '@/components/Table/SortedTable';
import TestCaseAssert from '@/components/TestCase/TestCaseAssert';
import TestcaseData from '@/components/TestCase/TestcaseData';
import TestCaseOutParameters from '@/components/TestCase/TestCaseOutParameters';
import VariableModal from '@/components/TestCase/variableModal';
import CONFIG from '@/consts/config';
import { listGConfig } from '@/services/configure';
import { queryVars } from '@/services/testcase';
import auth from '@/utils/auth';
import common from '@/utils/common';
import {
  DeleteTwoTone,
  DownOutlined,
  EditTwoTone,
  ExclamationCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { connect } from '@umijs/max';
import { useKeyPress } from 'ahooks';
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Image,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Tabs,
  Tag,
  Timeline,
  Tour,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { TabPane } = Tabs;

interface TestCaseBottomProps {
  dispatch: any;
  testcase: any;
  case_id?: number;
  setSuffix?: (suffix: boolean) => void;
  body: string;
  setBody: (body: string) => void;
  formData: any[];
  setFormData: (data: any[]) => void;
  gconfig: any;
  onSubmit?: (create: boolean) => void;
  form: any;
  createMode?: boolean;
  headers: any[];
  setHeaders: (headers: any[]) => void;
  bodyType: number;
  setBodyType: (type: number) => void;
  loading: any;
}

interface EnvItem {
  id: number;
  name: string;
}

interface Step {
  case_id: number;
  step_name: string;
}

interface ConstructorRecord {
  id?: number;
  type: number;
  name: string;
  enable: boolean;
  constructor_json: string;
  index?: number;
  tempIndex?: number;
}

const TestCaseBottom: React.FC<TestCaseBottomProps> = ({
  dispatch,
  testcase,
  case_id,
  setSuffix,
  body,
  setBody,
  formData,
  setFormData,
  gconfig,
  onSubmit,
  form,
  createMode = false,
  headers,
  setHeaders,
  bodyType,
  setBodyType,
  loading,
}) => {
  const {
    preConstructor,
    postConstructor,
    activeKey,
    constructors_case,
    envActiveKey,
    asserts,
    caseInfo,
  } = testcase;
  const { envList } = gconfig;

  const [variableModal, setVariableModal] = useState(false);
  const [gconfigVars, setGconfigVars] = useState<{ name: string }[]>([]);
  const [caseVars, setCaseVars] = useState<any[]>([]);
  const [tour, setTour] = useState(localStorage.getItem('case_study') === null);
  const [currentEnv, setCurrentEnv] = useState<string | null>(null);

  const dataRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const sufRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<HTMLDivElement>(null);
  const assertRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);

  const envItems = envList.map((item: EnvItem) => ({
    key: item.id,
    label: (
      <a
        onClick={() => {
          setCurrentEnv(item.name);
          message.success('测试环境已切换至' + item.name);
        }}
      >
        {item.name}
      </a>
    ),
  }));

  const onQueryCaseVars = async (steps: Step[]) => {
    const params = steps.map((item) => ({ case_id: item.case_id, step_name: item.step_name }));
    const res = await queryVars(params);
    if (auth.response(res)) {
      setCaseVars(Object.keys(res.data).map((k) => res.data[k]));
    }
  };

  const steps = [
    {
      title: '数据管理',
      placement: 'right' as const,
      description: '数据管理模块，以数据驱动的方式批量请求接口，解决重复编写场景的烦恼~👻',
      cover: <Image width="100%" style={{ height: 200 }} src="/data_driven.jpeg" />,
      target: () => dataRef.current,
    },
    {
      title: '前置步骤',
      placement: 'right' as const,
      description:
        '在前置步骤中，你可以构造一切你需要的数据，包括但不限于DB/Redis等，并能将数据传递下去👀',
      cover: <Image width="100%" style={{ height: 200 }} src="/pre.svg" />,
      target: () => preRef.current,
    },
    {
      title: '接口请求',
      placement: 'right' as const,
      description:
        '在接口请求中，你可以构建HTTP/DUBBO/GRPC这3类请求，如果遇到有变量需要填写，可以按下快捷键『$』弹出变量菜单哦~🐬',
      cover: <Image width="100%" style={{ height: 200 }} src="/api.svg" />,
      target: () => reqRef.current,
    },
    {
      title: '出参提取',
      placement: 'left' as const,
      description:
        '在出参提取中，你可以提取你在下一个步骤中需要的数据, 比如你可以提取登录后的token，用于接下来的操作！出参提取主要支持正则和JSONPath2种方式，如果还不熟悉的话，建议去搜索学习一下哦~👽',
      cover: <Image width="100%" style={{ height: 200 }} src="/out.svg" />,
      target: () => outRef.current,
    },
    {
      title: '断言',
      placement: 'left' as const,
      description:
        '在断言中，你可以对你本次测试的数据进行校验，以便于后续场景自动执行时能检测出异常，断言很重要，记得要填哦！🎃',
      cover: <Image width="100%" style={{ height: 200 }} src="/assert.svg" />,
      target: () => assertRef.current,
    },
    {
      title: '后置步骤',
      placement: 'left' as const,
      description:
        '在后置步骤中，你可以做一些清理工作，比如删除你创建的数据等，用法与前置步骤类似~🚀',
      cover: <Image width="100%" style={{ height: 200 }} src="/clean.svg" />,
      target: () => sufRef.current,
    },
  ];

  useKeyPress(
    ['shift.4'],
    () => {
      if (
        activeKey !== '4' &&
        window.location.href.indexOf(`/apiTest/testcase/`) > -1 &&
        window.location.href.endsWith(`/${case_id}`)
      ) {
        setVariableModal(true);
      }
    },
    {
      exactMatch: true,
      useCapture: true,
    },
  );

  const onFetchGConfigData = async () => {
    const res = await listGConfig({ page: 1, size: 500 });
    if (auth.response(res)) {
      setGconfigVars(res.data.map((item: any) => ({ name: '${' + item.key + '}' })));
    }
  };

  useEffect(() => {
    onFetchGConfigData();
  }, []);

  useEffect(() => {
    onQueryCaseVars(preConstructor);
  }, [preConstructor]);

  const onCreateConstructor = () => {
    dispatch({
      type: 'testcase/save',
      payload: {
        constructorModal: true,
        testCaseConstructorData: {
          public: true,
          enable: true,
        },
        currentStep: 0,
        constructRecord: {},
      },
    });
    dispatch({
      type: 'construct/save',
      payload: { currentStep: 0 },
    });
  };

  const onDeleteConstructor = async (record: ConstructorRecord, suffix = false) => {
    const res = await dispatch({
      type: 'construct/delete',
      payload: { id: record.id },
    });
    if (res) {
      let newData;
      if (suffix) {
        newData = postConstructor.filter((v: ConstructorRecord) => v.id !== record.id);
      } else {
        newData = preConstructor.filter((v: ConstructorRecord) => v.id !== record.id);
      }
      dispatch({
        type: 'testcase/save',
        payload: { [suffix ? 'postConstructor' : 'preConstructor']: newData } as any,
      });
    }
  };

  const onDeleteConstructorLocal = async (record: ConstructorRecord, suffix?: boolean) => {
    const newData = [...(!suffix ? preConstructor : postConstructor)];
    newData.splice(record.index!, 1);
    dispatch({
      type: 'testcase/save',
      payload: {
        [!suffix ? 'preConstructor' : 'postConstructor']: newData.map((v, index) => ({
          ...v,
          index,
        })),
      },
    });
  };

  const getJson = (record: ConstructorRecord, json_data: any) => {
    if (record.type === 4) {
      return {
        body: json_data.body,
        headers: common.parseHeaders(json_data.headers),
        base_path: json_data.base_path,
        url: json_data.url,
        request_method: json_data.request_method,
        body_type: json_data.body_type,
      };
    }
    return json_data;
  };

  const onEditConstructor = (record: ConstructorRecord) => {
    const dt = JSON.parse(record.constructor_json);
    dispatch({
      type: 'construct/save',
      payload: {
        currentStep: 1,
        testCaseConstructorData: { ...record, ...getJson(record, dt) },
        constructorType: record.type,
      },
    });
    dispatch({
      type: 'testcase/save',
      payload: { constructorModal: true, constructRecord: record },
    });
  };

  const onSwitchConstructor = async (record: ConstructorRecord, value: boolean, suffix = false) => {
    let res: any;
    const newData = [...(!suffix ? preConstructor : postConstructor)];
    if (createMode) {
      res = true;
    } else {
      res = await dispatch({
        type: 'construct/update',
        payload: {
          ...record,
          enable: value,
        },
      });
    }
    if (res) {
      if (createMode) {
        newData.forEach((v, index) => {
          if (index === record.index) {
            v.enable = value;
          }
        });
      } else {
        newData.forEach((v) => {
          if (v.id === record.id) {
            v.enable = value;
          }
        });
      }
      dispatch({
        type: 'testcase/save',
        payload: { [suffix ? 'postConstructor' : 'preConstructor']: newData } as any,
      });
    }
  };

  const getDesc = (item: ConstructorRecord) => {
    const data = JSON.parse(item.constructor_json);
    if (item.type === 0) {
      const result = constructors_case[data.case_id];
      if (!result) {
        return null;
      }
      return (
        <div>
          用例:{' '}
          <a href={`/#/apiTest/testcase/${result.directory_id}/${result.id}`} rel="noreferrer">
            {result.name}
          </a>
        </div>
      );
    }
    if (item.type === 1) {
      return <code>{data.sql}</code>;
    }
    if (item.type === 2 || item.type === 3) {
      return (
        <code>
          <pre>{data.command}</pre>
        </code>
      );
    }
    return null;
  };

  const BadgeButton = ({
    number,
    bgColor,
    color,
    style,
  }: {
    number: number;
    bgColor: string;
    color: string;
    style?: React.CSSProperties;
  }) => {
    if (number === 0) {
      return null;
    }
    return (
      <div
        style={{
          display: 'inline-block',
          marginLeft: 2,
          textAlign: 'center',
          width: 24,
          borderRadius: 10,
          background: bgColor,
          color,
          ...style,
        }}
      >
        {number}
      </div>
    );
  };

  const columns = [
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
      render: (text: string, record: ConstructorRecord, index: number) => (
        <a
          onClick={() => {
            onEditConstructor({ ...record, tempIndex: index });
          }}
        >
          {text}
        </a>
      ),
      className: 'drag-visible',
    },
    {
      title: '类型',
      key: 'type',
      dataIndex: 'type',
      render: (tag: number) => (
        <Tag
          color={
            CONFIG.CASE_CONSTRUCTOR_COLOR[
              tag as unknown as keyof typeof CONFIG.CASE_CONSTRUCTOR_COLOR
            ]
          }
        >
          {CONFIG.CASE_CONSTRUCTOR[tag as unknown as keyof typeof CONFIG.CASE_CONSTRUCTOR]}
        </Tag>
      ),
      className: 'drag-visible',
    },
    {
      title: '状态',
      key: 'enable',
      dataIndex: 'enable',
      className: 'drag-visible',
      render: (enable: boolean, record: ConstructorRecord) => (
        <Switch
          defaultChecked={record.enable}
          onChange={async (value) => {
            await onSwitchConstructor(record, value);
          }}
        />
      ),
    },
    {
      title: '返回值',
      key: 'value',
      dataIndex: 'value',
      className: 'drag-visible',
    },
    {
      title: '操作',
      key: 'ops',
      className: 'drag-visible',
      render: (_: any, record: ConstructorRecord, index: number) => (
        <>
          <a
            onClick={() => {
              onEditConstructor({ ...record, tempIndex: index });
            }}
          >
            <EditTwoTone />
          </a>
          <a
            style={{ marginLeft: 8 }}
            onClick={() => {
              Modal.confirm({
                title: '你确定要删除这个数据构造器吗?',
                icon: <ExclamationCircleOutlined />,
                content: '如果只是暂时不开启，可以先暂停它~',
                okText: '确定',
                okType: 'danger',
                cancelText: '点错了',
                onOk: async () => {
                  if (createMode) {
                    await onDeleteConstructorLocal(record);
                  } else {
                    await onDeleteConstructor(record);
                  }
                },
              });
            }}
          >
            <DeleteTwoTone twoToneColor="red" />
          </a>
        </>
      ),
    },
  ];

  const renderPrePostConstructor = (constructor: ConstructorRecord[], suffix: boolean) => (
    <>
      {constructor.length === 0 ? (
        <NoRecord
          height={180}
          desc={
            <div>
              还没有{suffix ? '后置' : '前'}置步骤, 还不赶快{' '}
              <a onClick={onCreateConstructor}>添加一个</a>?
            </div>
          }
        />
      ) : (
        <Row gutter={12}>
          <Col span={16}>
            <Row>
              <Col span={24}>
                <Button
                  type="dashed"
                  block
                  style={{ marginBottom: 16 }}
                  onClick={onCreateConstructor}
                >
                  <PlusOutlined />
                  添加
                </Button>
              </Col>
            </Row>
            <SortedTable
              columns={columns}
              dataSource={constructor}
              setDataSource={(data) => {
                dispatch({
                  type: 'testcase/save',
                  payload: { [suffix ? 'postConstructor' : 'preConstructor']: data } as any,
                });
              }}
              loading={loading.effects['construct/delete'] || loading.effects['construct/update']}
              dragCallback={async (newData) => {
                if (createMode) {
                  return true;
                }
                return await dispatch({
                  type: 'construct/orderConstructor',
                  payload: newData.map((v: ConstructorRecord, index: number) => ({
                    id: v.id,
                    index,
                  })),
                });
              }}
            />
          </Col>
          <Col span={8}>
            <Card style={{ height: 400, overflow: 'auto' }} hoverable bordered={false}>
              {constructor.filter((item) => item.enable).length === 0 ? (
                <NoRecord2 desc={`暂无开启的${suffix ? '后置' : '前置'}步骤`} />
              ) : (
                <Timeline>
                  {constructor.map((item, index) =>
                    item.enable ? (
                      <Timeline.Item key={index}>
                        <div key={index}>
                          <Badge
                            count={index + 1}
                            key={index}
                            style={{ backgroundColor: '#a6d3ff' }}
                          />{' '}
                          名称: {item.type === 0 ? <a key={item.name}>{item.name}</a> : item.name}
                        </div>
                        {getDesc(item)}
                      </Timeline.Item>
                    ) : null,
                  )}
                </Timeline>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );

  return (
    <Row gutter={8} style={{ marginTop: 36, minHeight: 500 }}>
      <VariableModal
        open={variableModal}
        gconfig={gconfigVars}
        variables={caseVars}
        onCancel={() => setVariableModal(false)}
      />
      <Tour
        open={tour}
        onClose={() => {
          localStorage.setItem('case_study', 'done');
          setTour(false);
        }}
        steps={steps as any}
      />
      <Col span={24}>
        <Tabs
          activeKey={activeKey}
          onChange={(key) => {
            dispatch({
              type: 'testcase/save',
              payload: { activeKey: key },
            });
            setSuffix?.(key === '6');
            if (key === '1' && envList.length > 0) {
              dispatch({
                type: 'testcase/save',
                payload: {
                  envActiveKey: envList[0].id.toString(),
                },
              });
            }
          }}
          tabBarExtraContent={
            <Dropdown menu={{ items: envItems }}>
              <a
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Space>
                  {currentEnv || '选择当前执行环境'}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          }
        >
          <TabPane
            key="1"
            tab={
              <span ref={dataRef}>
                <IconFont type="icon-shujuqudong1" />
                数据管理{' '}
                <TooltipIcon
                  onClick={() => {
                    window.open(
                      `${CONFIG.DOCUMENT_URL}/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/%E6%A6%82%E5%BF%B5/%E6%95%B0%E6%8D%AE%E7%AE%A1%E7%90%86`,
                    );
                  }}
                  icon={<QuestionCircleOutlined />}
                  title="在这里你可以对多套环境的测试数据进行管理，从而达到数据驱动的目的~点击此按钮查看详细文档。"
                />
              </span>
            }
          >
            {envList.length > 0 ? (
              <Tabs
                tabPosition="left"
                activeKey={envActiveKey}
                onChange={(key) => {
                  dispatch({
                    type: 'testcase/save',
                    payload: { envActiveKey: key },
                  });
                }}
              >
                {envList.map((item: EnvItem) => (
                  <TabPane key={item.id} tab={item.name}>
                    <TestcaseData
                      caseId={case_id}
                      currentEnv={envActiveKey}
                      createMode={createMode}
                    />
                  </TabPane>
                ))}
              </Tabs>
            ) : (
              <NoRecord2
                height={280}
                desc={<span>没有任何环境信息, {<a href="/#/config/environment">去添加</a>}</span>}
              />
            )}
          </TabPane>
          <TabPane
            key="2"
            tab={
              <div ref={preRef}>
                <IconFont type="icon-DependencyGraph_16x" />
                前置步骤
                <BadgeButton
                  number={preConstructor.length}
                  bgColor="rgb(237, 242, 251)"
                  color="rgb(29, 98, 203)"
                />
              </div>
            }
          >
            {renderPrePostConstructor(preConstructor, false)}
          </TabPane>
          <TabPane
            key="3"
            tab={
              <span ref={reqRef}>
                <IconFont type="icon-qingqiu" />
                接口请求
              </span>
            }
          >
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <PostmanForm
                  form={form}
                  body={body}
                  setBody={setBody}
                  headers={headers}
                  formData={formData}
                  setFormData={setFormData}
                  caseInfo={caseInfo}
                  setHeaders={setHeaders}
                  bodyType={bodyType}
                  setBodyType={setBodyType}
                  bordered={false}
                  save={onSubmit}
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane
            key="4"
            tab={
              <span ref={outRef}>
                <IconFont type="icon-canshu2" />
                出参提取{' '}
                <TooltipIcon
                  icon={<QuestionCircleOutlined />}
                  title="通过管理请求产生的参数，帮助我们更好地改善【断言】"
                />
              </span>
            }
          >
            <TestCaseOutParameters
              {...({
                caseId: case_id,
                createMode,
                testcase,
                dispatch,
              } as any)}
            />
          </TabPane>
          <TabPane
            key="5"
            tab={
              <div ref={assertRef}>
                <IconFont type="icon-duanyan" />
                断言{' '}
                <BadgeButton
                  number={asserts.length}
                  bgColor="rgb(233, 249, 245)"
                  color="rgb(40, 195, 151)"
                />
              </div>
            }
          >
            <TestCaseAssert asserts={asserts} caseId={case_id} createMode={createMode} />
          </TabPane>
          <TabPane
            key="6"
            tab={
              <div ref={sufRef}>
                <IconFont type="icon-qingliwuliuliang" />
                后置步骤
                <BadgeButton
                  number={postConstructor.length}
                  bgColor="rgb(255, 238, 239)"
                  color="rgb(255, 87, 95)"
                />
              </div>
            }
          >
            {renderPrePostConstructor(postConstructor, true)}
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default connect(({ testcase, gconfig, loading }: any) => ({ testcase, gconfig, loading }))(
  TestCaseBottom,
);
