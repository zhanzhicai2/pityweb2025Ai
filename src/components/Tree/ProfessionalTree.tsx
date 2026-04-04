import { Col, Empty, Input, Row, Spin, Tooltip, Tree } from 'antd';
import React, { useEffect, useState } from 'react';

const { TreeNode } = Tree;

interface TreeData {
  key: string | number;
  title: string;
  requestType?: number;
  total?: number;
  children?: TreeData[];
}

interface ProfessionalTreeProps {
  gData: TreeData[];
  expandedKeys: React.Key[];
  searchValue: string;
  setSearchValue: (v: string) => void;
  onExpand?: (expandedKeys: React.Key[]) => void;
  onChange?: (e: any) => void;
  loading?: boolean;
  checkable?: boolean;
  onCheck?: (checkedKeys: any) => void;
  onSelect?: (selectedKeys: React.Key[], info: any) => void;
  checkedKeys?: any;
  iconMap: (key: string | number) => React.ReactNode;
  suffixMap: (item: TreeData) => React.ReactNode;
  parseStatus: (key: string | number) => React.ReactNode;
  AddButton?: React.ReactNode;
}

const ProfessionalTree: React.FC<ProfessionalTreeProps> = (props) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(props.expandedKeys);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [currentKey, setCurrentKey] = useState<string | number | null>(null);

  let dataList: { key: string | number; title: string }[] = [];

  const generateList = (data: TreeData[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key } = node;
      dataList.push({
        key,
        title: node.title,
      });
      if (node.children) {
        generateList(node.children);
      }
    }
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setAutoExpandParent(false);
    if (props.onExpand) {
      props.onExpand(expandedKeys);
      return;
    }
    setExpandedKeys(expandedKeys);
  };

  const getParentKey = (key: string | number, tree: TreeData[]): string | number | undefined => {
    let parentKey: string | number | undefined;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key;
        } else {
          const found = getParentKey(key, node.children);
          if (found) parentKey = found;
        }
      }
    }
    return parentKey;
  };

  const parseTitle = (key: string | number, title: string, suffix: React.ReactNode) => {
    const index = title.toLowerCase().indexOf(props.searchValue.toLowerCase());
    const beforeStr = title.substr(0, index);
    const afterStr = title.substr(index + props.searchValue.length);
    return props.searchValue !== '' && index > -1 ? (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{title.substr(index, props.searchValue.length)}</span>
        {afterStr} {key === currentKey ? suffix : null}
      </span>
    ) : (
      <span
        onMouseLeave={() => {
          setTimeout(() => {
            setCurrentKey(null);
          }, 100);
        }}
        onMouseEnter={() => setCurrentKey(key)}
      >
        <Tooltip title={title}>
          {title.length > 16 ? `${title.slice(0, 16)}...` : title}
          {key === currentKey ? suffix : null} {props.parseStatus(key)}
        </Tooltip>
      </span>
    );
  };

  const parseDirectory = (key: string | number, title: string, requestType?: number) => {
    const index = title.toLowerCase().indexOf(props.searchValue.toLowerCase());
    const beforeStr = title.substr(0, index);
    const afterStr = title.substr(index + props.searchValue.length);
    return props.searchValue !== '' && index > -1 ? (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{title.substr(index, props.searchValue.length)}</span>
        {afterStr}
      </span>
    ) : (
      <span>
        <Tooltip title={title}>
          {requestType !== undefined ? (
            requestType === 0 ? (
              <a style={{ color: '#DEB946' }}>RPC</a>
            ) : (
              <a style={{ color: '#f540c9' }}>MSG</a>
            )
          ) : null}{' '}
          {title.length > 16 ? `${title.slice(0, 16)}...` : title}
        </Tooltip>
      </span>
    );
  };

  const handleTreeSearch = (e: any) => {
    if (props.onChange) {
      props.onChange(e);
      return;
    }
    const { value } = e.target;
    dataList = [];
    generateList(props.gData);
    const expKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, props.gData);
        }
        return null;
      })
      .filter((item, i, self) => item !== null && self.indexOf(item as string | number) === i) as (
      | string
      | number
    )[];
    props.setSearchValue(value);
    setAutoExpandParent(true);
    if (props.onExpand) {
      props.onExpand(expandedKeys.length > 0 ? expandedKeys : []);
    } else if (expKeys.length > 0) {
      setExpandedKeys(expKeys as any);
    } else {
      setExpandedKeys([]);
    }
  };

  useEffect(() => {
    generateList(props.gData);
  }, []);

  const loop = (data: TreeData[]) =>
    data.map((item) => {
      if (item.children !== undefined) {
        return (
          <TreeNode
            key={item.key}
            icon={props.iconMap(item.key)}
            title={
              <span
                onMouseLeave={() => {
                  setTimeout(() => {
                    setCurrentKey(null);
                  }, 100);
                }}
                onMouseEnter={() => setCurrentKey(item.key)}
              >
                {parseDirectory(item.key, item.title, item.requestType)} ({item.total})
                {item.key === currentKey ? props.suffixMap(item) : null}
              </span>
            }
          >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.key}
          icon={props.iconMap(item.key)}
          title={parseTitle(item.key, item.title, props.suffixMap(item))}
        />
      );
    });

  return (
    <Spin spinning={props.loading ? props.loading : false}>
      <Row style={{ padding: 8, marginBottom: 4 }}>
        <Col span={22}>
          <Input
            placeholder="请输入用例名称"
            style={{ width: '100%' }}
            onChange={handleTreeSearch}
            size="small"
            allowClear
            value={props.searchValue}
          />
        </Col>
        <Col span={2}>{props.AddButton}</Col>
      </Row>
      {props.gData.length > 0 ? (
        <Tree
          blockNode
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          checkable={props.checkable}
          onCheck={props.onCheck}
          onSelect={props.onSelect}
          checkedKeys={props.checkedKeys}
          showIcon
          defaultExpandParent
        >
          {loop(props.gData)}
        </Tree>
      ) : (
        <Empty />
      )}
    </Spin>
  );
};

export default ProfessionalTree;
