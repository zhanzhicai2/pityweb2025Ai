import { Card } from 'antd';

export default () => {
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, color: '#666' }}>
        数据池 — 测试数据生成工具，支持生成姓名、手机号、邮箱、身份证、地址等测试数据
      </div>
    </Card>
  );
};
