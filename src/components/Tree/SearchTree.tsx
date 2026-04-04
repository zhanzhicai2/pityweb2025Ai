import { MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FolderCode } from '@icon-park/react';
import { Col, Dropdown, Input, Row, Tree } from 'antd';
import React, { useState } from 'react';
import './SearchTree.less';

interface TreeData {
  key: string | number;
  title: string;
  children?: TreeData[];
}

interface SearchTreeProps {
  treeData: TreeData[];
  blockNode?: boolean;
  selectedKeys?: React.Key[];
  onSelect?: (selectedKeys: React.Key[], info: any) => void;
  onAddNode?: (node: TreeData) => void;
  addDirectory?: React.ReactNode;
  menu: (node: TreeData) => React.ReactElement;
}

const SearchTree: React.FC<SearchTreeProps> = ({
  treeData: gData,
  blockNode = true,
  onAddNode,
  menu,
  selectedKeys,
  onSelect,
  addDirectory,
}) => {
  let dataList: { key: string | number; title: string }[] = [];

  const generateList = (data: TreeData[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key, title } = node;
      dataList.push({ key, title });
      if (node.children) {
        generateList(node.children);
      }
    }
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

  generateList(gData);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [nodeKey, setNodeKey] = useState<string | number | null>(null);

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: any) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, gData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item as any) === i);
    setExpandedKeys(newExpandedKeys as any);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const loop = (data: TreeData[]): React.ReactNode[] =>
    data.map((item) => {
      const index = String(item.title).indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className="site-tree-search-value">{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return { title, key: item.key, children: loop(item.children) };
      }

      return {
        title,
        key: item.key,
      };
    });

  return (
    <div>
      <Row gutter={8}>
        <Col span={18}>
          <Input
            size="small"
            className="treeSearch"
            placeholder="输入要查找的目录"
            onChange={onChange}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={6}>{addDirectory}</Col>
      </Row>
      <Tree
        onExpand={onExpand}
        defaultExpandAll
        blockNode={blockNode}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={loop(gData)}
        titleRender={(node: any) => {
          return (
            <div onMouseOver={() => setNodeKey(node.key)} onMouseLeave={() => setNodeKey(null)}>
              <FolderCode theme="outline" size="15" className="folder" />
              {node.title}
              {nodeKey === node.key ? (
                <span className="suffixButton">
                  <PlusOutlined
                    onClick={(event: any) => {
                      event.stopPropagation();
                      onAddNode?.(node);
                    }}
                    className="icon-left"
                  />
                  <Dropdown menu={{ items: menu(node).props.children }} trigger={['click']}>
                    <MoreOutlined
                      className="icon-right"
                      onClick={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Dropdown>
                </span>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
};

export default SearchTree;
