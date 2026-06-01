import React, { useState } from 'react';
import { Avatar, Button, Col, Dropdown, Input, Row, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import CONFIG from '@/consts/config';

function RequirementItem({ item, active, onSelect, onEdit, onDelete }) {
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
        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.doc_type}</div>
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

export default function RequirementList({
  list,
  currentId,
  loading,
  projects,
  currentProjectId,
  onProjectChange,
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 第一行：项目头像 + 项目下拉 */}
      <div style={{ padding: '1px 6px', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={4} align="middle">
          <Col flex="none">
            <Avatar size={38} src={CONFIG.PROJECT_AVATAR_URL} />
            <Select
              value={currentProjectId}
              onChange={onProjectChange}
              style={{ width: 'auto', maxWidth: 130, minWidth: 80 }}
              placeholder="选择项目"
            >
              {projects?.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* 第二行：搜索 + 新建按钮 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space size="small" style={{ width: '100%' }}>
          <Input.Search
            placeholder="搜索需求文档"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} />
        </Space>
      </div>

      {/* 第三行：需求文档列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <RequirementItem
              key={item.id}
              item={item}
              active={item.id === currentId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            还没有需求文档，<a onClick={onCreate}>点击创建</a>个吧~
          </div>
        )}
      </div>
    </div>
  );
}
