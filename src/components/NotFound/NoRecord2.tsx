import noRecord from '@/assets/NoSearch.svg';
import { Empty } from 'antd';
import React from 'react';

interface NoRecord2Props {
  desc?: React.ReactNode;
  height?: number;
}

export default ({ desc, height = 180 }: NoRecord2Props) => {
  return (
    <Empty
      image={noRecord}
      imageStyle={{
        height,
      }}
      description={desc || '暂无数据'}
    ></Empty>
  );
};
