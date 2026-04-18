import React, { useState } from 'react';
import { Button, Dropdown, Empty, Input, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';

export default function KnowledgeBaseList({
  list,
  currentId,
  loading,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
}) {
  const [searchText, setSearchText] = useState('');

  const filteredList = list.filter((item) =>
    item.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div style={{ padding: 12 }}>
      <Input.Search
        placeholder="搜索知识库"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
        allowClear
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        block
        onClick={onCreate}
        style={{ marginBottom: 12 }}
      >
        新建知识库
      </Button>

      {filteredList.length === 0 ? (
        <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          loading={loading}
          dataSource={filteredList}
          renderItem={(item) => (
            <KnowledgeBaseItem
              key={item.id}
              item={item}
              active={item.id === currentId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        />
      )}
    </div>
  );
}

function KnowledgeBaseItem({ item, active, onSelect, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => onEdit(item),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => onDelete(item),
    },
  ];

  return (
    <div
      style={{
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        background: active ? '#e6f7ff' : hovered ? '#f5f5f5' : 'transparent',
        borderLeft: active ? '3px solid #1677ff' : '3px solid transparent',
        transition: 'background 0.2s',
      }}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
          {item.document_count || 0} 篇文档
        </div>
      </div>
      {(hovered || active) && (
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <EllipsisOutlined
            style={{ fontSize: 16, color: '#999', cursor: 'pointer', padding: '0 4px' }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      )}
    </div>
  );
}
