import { EditableProTable } from '@ant-design/pro-table';
import { useEffect } from 'react';

interface EditableTableProps {
  columns: any[];
  dataSource: any[];
  title?: string;
  setDataSource: (data: any[]) => void;
  editableKeys?: any[];
  setEditableRowKeys?: (keys: any[]) => void;
  extra?: (recordList: any[]) => void;
}

export default ({
  columns,
  dataSource,
  title,
  setDataSource,
  editableKeys,
  setEditableRowKeys,
  extra,
}: EditableTableProps) => {
  useEffect(() => {
    if (setEditableRowKeys) {
      setEditableRowKeys(dataSource.map((v: any) => v.id));
    }
  }, [dataSource]);

  return (
    <EditableProTable
      headerTitle={title}
      columns={columns}
      rowKey="id"
      value={dataSource}
      onChange={setDataSource as any}
      recordCreatorProps={{
        newRecordType: 'dataSource',
        record: () => ({
          id: Date.now(),
        }),
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        actionRender: (row: any, config: any, defaultDoms: any) => {
          return [defaultDoms.delete];
        },
        onValuesChange: (record: any, recordList: any[]) => {
          if (extra) {
            extra(recordList);
          }
          setDataSource(recordList);
        },
        onChange: setEditableRowKeys as any,
      }}
    />
  );
};
