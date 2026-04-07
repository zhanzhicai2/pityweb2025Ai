import noRecord from '@/assets/no_record.svg';
import { Empty } from 'antd';
import React from 'react';

interface NoRecordProps {
  desc?: React.ReactNode;
  height?: number;
  image?: string;
}

export default ({ desc, height = 180, image = noRecord }: NoRecordProps) => {
  return (
    <Empty
      image={image}
      styles={{
        image: {
          height,
        },
      }}
      description={desc || '暂无数据'}
    ></Empty>
  );
};
