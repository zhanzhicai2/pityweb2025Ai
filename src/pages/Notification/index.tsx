import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useState } from 'react';
import ConfigList from './Configs';
import HistoryList from './Histories';
import TaskSettings from './TaskSettings';

const NotificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('configs');

  const tabItems = [
    { key: 'configs', label: 'Webhook 配置', children: <ConfigList /> },
    { key: 'histories', label: '发送历史', children: <HistoryList /> },
    { key: 'task-settings', label: '任务通知设置', children: <TaskSettings /> },
  ];

  return (
    <PageContainer>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </PageContainer>
  );
};

export default NotificationPage;
