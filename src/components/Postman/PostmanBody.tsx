import JSONAceEditor from '@/components/CodeEditor/AceEditor/JSONAceEditor';
import { IconFont } from '@/components/Icon/IconFont';
import FormData from '@/components/Postman/FormData';
import EditableTable from '@/components/Table/EditableTable';
import { httpRequest } from '@/services/request';
import auth from '@/utils/auth';
import {
  DeleteTwoTone,
  DownOutlined,
  EditTwoTone,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { connect } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  notification,
  Radio,
  Row,
  Select,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { TabPane } = Tabs;

interface PostmanBodyProps {
  form: any;
  gconfig: any;
  dispatch: any;
  body: string;
  setBody: (body: string) => void;
  headers: any[];
  setHeaders: (headers: any[]) => void;
  formData: any[];
  setFormData: (data: any[]) => void;
  caseInfo: any;
  bodyType: number;
  setBodyType: (type: number) => void;
  save?: any;
}

const STATUS: Record<number, { color: string; text: string }> = {
  200: { color: '#67C23A', text: 'OK' },
  401: { color: '#F56C6C', text: 'unauthorized' },
  400: { color: '#F56C6C', text: 'Bad Request' },
};

const tabExtra = (response: any) => {
  return response && response.response ? (
    <div style={{ marginRight: 16 }}>
      <span>
        Status:
        <span
          style={{
            color: STATUS[response.status_code] ? STATUS[response.status_code].color : '#F56C6C',
            marginLeft: 8,
            marginRight: 8,
          }}
        >
          {response.status_code}{' '}
          {STATUS[response.status_code] ? STATUS[response.status_code].text : ''}
        </span>
        <span style={{ marginLeft: 8, marginRight: 8 }}>
          Time: <span style={{ color: '#67C23A' }}>{response.cost}</span>
        </span>
      </span>
    </div>
  ) : null;
};

const PostmanBody: React.FC<PostmanBodyProps> = ({
  form,
  gconfig,
  dispatch,
  body,
  setBody,
  headers,
  setHeaders,
  formData,
  setFormData,
  caseInfo,
  bodyType,
  setBodyType,
  save = null,
}) => {
  const [rawType, setRawType] = useState('JSON');
  const [method, setMethod] = useState('GET');
  const [paramsData, setParamsData] = useState<any[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    paramsData.map((item) => item.id),
  );
  const [headersKeys, setHeadersKeys] = useState<React.Key[]>(() => headers.map((item) => item.id));
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>({});
  const [, setUrl] = useState('');
  const [, setEditor] = useState<any>(null);
  const [, setOpen] = useState(false);
  const { ossFileList, envMap, addressList } = gconfig;

  const parseFormData = () => {
    if (body) {
      const temp = JSON.parse(body);
      if (typeof temp === 'object' && temp[0] !== undefined) {
        setFormData(temp);
      }
    }
  };

  useEffect(() => {
    if (caseInfo) {
      setMethod(caseInfo.request_method);
    }
  }, [caseInfo?.request_method]);

  useEffect(() => {
    if (bodyType === 2) {
      dispatch({
        type: 'gconfig/listOssFile',
      });
      try {
        parseFormData();
      } catch (e) {
        // ignore parse error
      }
    }
  }, [bodyType]);

  const splitUrl = (nowUrl: string) => {
    if (!nowUrl) {
      return;
    }
    const split = nowUrl.split('?');
    if (split.length < 2) {
      setParamsData([]);
    } else {
      const params = split[1].split('&');
      const newParams: any[] = [];
      const keys: React.Key[] = [];
      params.forEach((item, idx) => {
        const [key, value] = item.split('=');
        const now = Date.now();
        keys.push(now + idx + 10);
        newParams.push({ key, value, id: now + idx + 10, description: '' });
      });
      setParamsData(newParams);
      setEditableRowKeys(keys);
    }
  };

  const init = async () => {
    setUrl(form.getFieldValue('url'));
    splitUrl(form.getFieldValue('url'));
  };

  useEffect(() => {
    dispatch({
      type: 'gconfig/fetchAddress',
    });
  }, []);

  useEffect(() => {
    init();
  }, [body]);

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

  const toTable = (field: string) => {
    if (!response[field]) {
      return [];
    }
    const data = JSON.parse(response[field]);
    return Object.keys(data).map((key) => ({
      key,
      value: data[key],
    }));
  };

  const joinUrl = (data: any[]) => {
    const urlValue = form.getFieldValue('url');
    let tempUrl: string;
    if (urlValue === undefined) {
      tempUrl = '';
    } else {
      tempUrl = urlValue.split('?')[0];
    }
    data.forEach((item, idx) => {
      if (item.key) {
        if (idx === 0) {
          tempUrl = `${tempUrl}?${item.key}=${item.value || ''}`;
        } else {
          tempUrl = `${tempUrl}&${item.key}=${item.value || ''}`;
        }
      }
    });
    form.setFieldsValue({ url: tempUrl });
  };

  const onClickMenu = (key: string) => {
    setRawType(key);
  };

  const getHeaders = () => {
    const result: Record<string, string> = {};
    headers.forEach((item) => {
      if (item.key !== '') {
        result[item.key] = item.value;
      }
    });
    return result;
  };

  const onRequest = async () => {
    const urlValue = form.getFieldValue('url');
    if (urlValue === '') {
      notification.error({
        message: '请求Url不能为空',
      });
      return;
    }
    setLoading(true);
    const params: any = {
      method: method || 'GET',
      url: urlValue,
      body,
      body_type: bodyType,
      headers: getHeaders(),
    };
    if (bodyType === 0) {
      params.body = null;
    }
    const res = await httpRequest(params);
    setLoading(false);
    if (auth.response(res, true)) {
      setResponse(res.data);
    }
  };

  const onDelete = (columnType: string, key: React.Key) => {
    if (columnType === 'params') {
      const data = paramsData.filter((item) => item.id !== key);
      setParamsData(data);
      joinUrl(data);
    } else {
      const data = headers.filter((item) => item.id !== key);
      setHeaders(data);
    }
  };

  const menu = {
    onClick: ({ key }: { key: string }) => onClickMenu(key),
    items: [
      { key: 'Text', label: 'Text' },
      { key: 'JavaScript', label: 'JavaScript' },
      { key: 'JSON', label: 'JSON' },
      { key: 'HTML', label: 'HTML' },
      { key: 'XML', label: 'XML' },
    ],
  };

  const columns = (columnType: string) => {
    return [
      {
        title: 'KEY',
        key: 'key',
        dataIndex: 'key',
      },
      {
        title: 'VALUE',
        key: 'value',
        dataIndex: 'value',
      },
      {
        title: 'DESCRIPTION',
        key: 'description',
        dataIndex: 'description',
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_: any, record: any) => (
          <>
            <EditTwoTone
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditableRowKeys([record.id]);
              }}
            />
            <DeleteTwoTone
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => {
                onDelete(columnType, record.id);
              }}
              twoToneColor="#eb2f96"
            />
          </>
        ),
      },
    ];
  };

  const getBody = (bd: number) => {
    if (bd === 0) {
      return (
        <div style={{ height: '20vh', lineHeight: '20vh', textAlign: 'center' }}>
          This request does not have a body
        </div>
      );
    }
    if (bd === 2) {
      return (
        <FormData ossFileList={ossFileList} dataSource={formData} setDataSource={setFormData} />
      );
    }
    return (
      <Row style={{ marginTop: 12 }}>
        <Col span={24}>
          <Card bodyStyle={{ padding: 0 }}>
            <JSONAceEditor
              value={body}
              onChange={(e: string) => setBody(e)}
              height="20vh"
              setEditor={setEditor}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const getAddress = () => {
    const temp: Record<string, Record<string, string>> = {};
    addressList.forEach((v: any) => {
      if (temp[v.name] === undefined) {
        temp[v.name] = { [v.env]: v.gateway };
      } else {
        temp[v.name][v.env] = v.gateway;
      }
    });
    return temp;
  };

  const currentAddress = getAddress();

  const prefixSelector = (
    <Form.Item name="base_path" noStyle>
      <Select
        style={{ width: 130 }}
        placeholder="选择BasePath"
        showSearch
        allowClear
        optionLabelProp="label"
        filterOption={(input, option: any) => {
          if (!option || option.children.length > 1) {
            return false;
          }
          return String(option.children).toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
      >
        <Option value={null as any} label="无">
          无
          <a style={{ float: 'right', fontSize: 12 }} href="/#/config/address">
            去配置
          </a>
        </Option>
        {Object.keys(currentAddress).map((key) => (
          <Option value={key} key={key} label={key}>
            <Tooltip
              title={
                <div>
                  {Object.keys(currentAddress[key]).map((v) => (
                    <p key={v}>
                      {envMap[v]}: {currentAddress[key][v]}
                    </p>
                  ))}
                </div>
              }
            >
              {key}
            </Tooltip>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  return (
    <Form form={form}>
      <Row gutter={[8, 8]}>
        <Col span={20}>
          <Form layout="inline" form={form}>
            <Col span={8}>
              <Form.Item
                colon={false}
                name="request_method"
                label="请求方式"
                rules={[{ required: true, message: '请选择请求方法' }]}
                initialValue={method}
              >
                <Select
                  placeholder="选择请求方式"
                  onChange={(data) => setMethod(data)}
                  style={{ width: 120, textAlign: 'left' }}
                >
                  <Option key="GET" value="GET">
                    GET
                  </Option>
                  <Option key="POST" value="POST">
                    POST
                  </Option>
                  <Option key="PUT" value="PUT">
                    PUT
                  </Option>
                  <Option key="DELETE" value="DELETE">
                    DELETE
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="url"
                colon={false}
                label={
                  <Tooltip title="点击可展开全局变量提示">
                    请求地址
                    <QuestionCircleOutlined
                      style={{ marginLeft: 4 }}
                      onClick={() => setOpen(true)}
                    />
                  </Tooltip>
                }
                rules={[{ required: true, message: '请输入请求url' }]}
              >
                <Input
                  addonBefore={prefixSelector}
                  style={{ width: '100%' }}
                  placeholder="请输入要请求的url"
                  onChange={(e) => {
                    splitUrl(e.target.value);
                    form.setFieldsValue({ url: e.target.value });
                    setUrl(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Form>
        </Col>
        <Col span={4}>
          <div style={{ float: 'right' }}>
            {!save ? (
              <Button onClick={onRequest} loading={loading} type="primary">
                <IconFont type="icon-fasong1" />
                Send{' '}
              </Button>
            ) : null}
          </div>
        </Col>
      </Row>
      <Row style={{ marginTop: 8 }}>
        <Tabs defaultActiveKey="1" style={{ width: '100%' }}>
          <TabPane tab="Params" key="1">
            <EditableTable
              columns={columns('params')}
              title="Query Params"
              dataSource={paramsData}
              setDataSource={setParamsData}
              extra={joinUrl}
              editableKeys={editableKeys}
              setEditableRowKeys={setEditableRowKeys}
            />
          </TabPane>
          <TabPane tab="Headers" key="2">
            <EditableTable
              columns={columns('headers')}
              title="Headers"
              dataSource={headers}
              setDataSource={setHeaders}
              editableKeys={headersKeys}
              setEditableRowKeys={setHeadersKeys}
            />
          </TabPane>
          <TabPane tab="Body" key="3">
            <Row>
              <Radio.Group
                defaultValue={0}
                value={bodyType}
                onChange={(e) => {
                  setBodyType(e.target.value);
                  if (e.target.value === 2) {
                    dispatch({
                      type: 'gconfig/listOssFile',
                    });
                  }
                }}
              >
                <Radio value={0}>none</Radio>
                <Radio value={2}>form-data</Radio>
                <Radio value={3}>x-www-form-urlencoded</Radio>
                <Radio value={1}>raw</Radio>
                <Radio value={4}>binary</Radio>
                <Radio value={5}>GraphQL</Radio>
              </Radio.Group>
              {bodyType === 1 ? (
                <Dropdown menu={menu} trigger={['click']}>
                  <a onClick={(e) => e.preventDefault()}>
                    {rawType} <DownOutlined />
                  </a>
                </Dropdown>
              ) : null}
            </Row>
            {getBody(bodyType)}
          </TabPane>
        </Tabs>
      </Row>
      <Row gutter={[8, 8]}>
        {Object.keys(response).length === 0 ? null : (
          <Tabs style={{ width: '100%' }} tabBarExtraContent={tabExtra(response)}>
            <TabPane tab="Body" key="1">
              <JSONAceEditor
                value={
                  typeof response?.response === 'object'
                    ? JSON.stringify(response.response, null, 2)
                    : response.response
                }
                readOnly={true}
                height="30vh"
                setEditor={setEditor}
              />
            </TabPane>
            <TabPane tab="Cookie" key="2">
              <Table
                columns={resColumns}
                dataSource={toTable('cookies')}
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Headers" key="3">
              <Table
                columns={resColumns}
                dataSource={toTable('response_headers')}
                size="small"
                pagination={false}
              />
            </TabPane>
          </Tabs>
        )}
      </Row>
    </Form>
  );
};

export default connect(({ gconfig }: any) => ({ gconfig }))(PostmanBody);
