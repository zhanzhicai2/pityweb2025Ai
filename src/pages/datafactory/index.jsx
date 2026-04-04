import Body from '@/pages/datafactory/body';
import Header from '@/pages/datafactory/header';
import { PageContainer } from '@ant-design/pro-components';
import { Alert } from 'antd';
import { useState } from 'react';
import Helper from './help';
import './index.less';

export default () => {
  const [helpVisible, setHelperVisible] = useState(true);

  return (
    <PageContainer title={false} breadcrumb={null}>
      <Alert type="warning" banner message="龟速开发中..." style={{ marginBottom: 12 }} />
      {/*  头部*/}
      <Helper open={helpVisible} onCancel={() => setHelperVisible(false)} />
      <Header />
      <Body />
    </PageContainer>
  );
};
