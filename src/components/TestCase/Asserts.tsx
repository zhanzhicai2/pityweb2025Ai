import { Col, Row } from 'antd';
import React from 'react';
import styles from './index.less';

const Asserts: React.FC = () => {
  return (
    <>
      <p className={styles.title}>断言详情</p>
      <Row gutter={[8, 8]}>
        <Col span={24} />
      </Row>
    </>
  );
};

export default Asserts;
