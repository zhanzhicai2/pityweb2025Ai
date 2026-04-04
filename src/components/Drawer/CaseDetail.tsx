import AntdEditableTable from '@/components/Table/AntdEditableTable';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

interface OssFile {
  key: string;
  file_path: string;
}

interface CaseDetailProps {
  ossFileList: OssFile[];
  dataSource: any[];
  setDataSource: (data: any[]) => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ ossFileList, dataSource, setDataSource }) => {
  const columns = [
    {
      title: 'KEY',
      dataIndex: 'key',
      render: () => <Input />,
    },
    {
      title: 'VALUE',
      dataIndex: 'value',
      render: () => (
        <Select>
          {ossFileList.map((v) => (
            <Option key={v.key} value={v.key}>
              {v.key}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <AntdEditableTable
          {...{ columns: columns as any, data: dataSource, setData: setDataSource, ossFileList }}
        />
      </Col>
    </Row>
  );
};

export default CaseDetail;
