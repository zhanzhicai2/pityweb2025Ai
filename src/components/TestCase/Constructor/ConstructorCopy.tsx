import CONFIG from '@/consts/config';
import { connect } from '@umijs/max';
import { Col, Form, Row, Select, TreeSelect } from 'antd';
import React, { useEffect } from 'react';

const { Option } = Select;

interface ConstructorCopyProps {
  construct: any;
  dispatch: any;
  suffix?: boolean;
}

const ConstructorCopy: React.FC<ConstructorCopyProps> = ({
  construct,
  dispatch,
  suffix = true,
}) => {
  const { constructorData, searchConstructor, constructorType } = construct;

  const save = (data: any) => {
    dispatch({
      type: 'construct/save',
      payload: data,
    });
  };

  const getConstructorData = () => {
    dispatch({
      type: 'construct/getConstructorTree',
      payload: {
        constructor_type: constructorType,
        suffix,
      },
    });
  };

  useEffect(() => {
    getConstructorData();
  }, [constructorType]);

  return (
    <Row style={{ marginTop: 24 }}>
      <Col span={24}>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="数据类型" name="type" {...CONFIG.SUB_LAYOUT}>
              <Select disabled defaultValue={constructorType}>
                {Object.keys(CONFIG.CONSTRUCTOR_TYPE).map((key) => (
                  <Option value={parseInt(key, 10)} key={key}>
                    {
                      CONFIG.CONSTRUCTOR_TYPE[
                        parseInt(key, 10) as unknown as keyof typeof CONFIG.CONSTRUCTOR_TYPE
                      ]
                    }
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="复制构造条件" {...CONFIG.SUB_LAYOUT}>
              <TreeSelect
                allowClear
                showSearch
                style={{ width: '100%' }}
                value={searchConstructor}
                filterTreeNode={(inputValue, treeNode) => {
                  const title = String(treeNode.title || '');
                  return title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
                }}
                styles={{ popup: { root: { maxHeight: 600, overflow: 'auto' } } }}
                treeData={constructorData}
                placeholder="通过搜索构造条件，可以快速复制参数哦！"
                treeDefaultExpandAll
                onChange={(e) => {
                  save({ searchConstructor: e });
                  if (e !== undefined) {
                    dispatch({
                      type: 'construct/getConstructorData',
                      payload: { id: e.split('_')[1] },
                    });
                  } else {
                    dispatch({
                      type: 'construct/save',
                      payload: {
                        testCaseConstructorData: {
                          type: constructorType,
                          public: true,
                          enable: true,
                        },
                      },
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default connect(({ loading, construct }: any) => ({ loading, construct }))(ConstructorCopy);
