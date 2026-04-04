import Body from '@/pages/datafactory/body';
import Header from '@/pages/datafactory/header';
import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import Helper from './help';
import './index.less';

export default () => {
  const [helpVisible, setHelperVisible] = useState(false);

  return (
    <PageContainer title={false} breadcrumb={null}>
      <Helper open={helpVisible} onCancel={() => setHelperVisible(false)} />
      <Header />
      <Body />
    </PageContainer>
  );
};
