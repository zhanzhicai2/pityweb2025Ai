// @ts-nocheck
import { Button, Result } from 'antd';
import { history } from 'umi';

const Building: React.FC = () => (
  <Result
    status="403"
    title="努力建设中..."
    subTitle="请再给我一点点时间..."
    extra={
      <Button type="primary" onClick={() => history.push('/#/index')}>
        返回首页
      </Button>
    }
  />
);

export default Building;
