import { Table } from 'antd';
import { useEffect, useState } from 'react';

interface HeaderTableProps {
  headers: string;
  size?: 'small' | 'middle' | 'large';
}

export default ({ headers, size }: HeaderTableProps) => {
  const [data, setData] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (headers) {
      const header = JSON.parse(headers);
      const temp = Object.keys(header).map((k) => ({
        key: k,
        value: header[k],
      }));
      setData(temp);
    }
  }, [headers]);
  const columns = [
    {
      title: 'key',
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      fixed: 'left' as const,
    },
    {
      title: 'value',
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      ellipsis: true,
    },
  ];
  return <Table dataSource={data} columns={columns} pagination={false} size={size || 'middle'} />;
};
