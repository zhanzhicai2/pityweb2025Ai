import { MenuOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { arrayMoveImmutable } from 'array-move';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import './SortedTable.less';

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

const defaultCols = [
  {
    title: '排序',
    dataIndex: 'sort',
    width: 65,
    className: 'drag-visible',
    render: () => <DragHandle />,
  },
];

const SortableItem = SortableElement((props: any) => <tr {...props} />);
const SortableContainerWrapper = SortableContainer((props: any) => <tbody {...props} />);

interface SortedTableProps {
  dataSource: any[];
  columns: any[];
  setDataSource: (data: any[]) => void;
  dragCallback?: (newData: any[]) => any;
  loading?: boolean;
}

export default ({
  dataSource,
  columns,
  setDataSource,
  dragCallback,
  loading,
}: SortedTableProps) => {
  const onSortEnd = async ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if (oldIndex !== newIndex) {
      const arr = [...dataSource];
      const newData = arrayMoveImmutable(arr, oldIndex, newIndex).filter((el: any) => !!el);
      if (dragCallback) {
        const res = await dragCallback(newData);
        if (res || res === undefined) {
          setDataSource(newData);
        }
      } else {
        setDataSource(newData);
      }
    }
  };

  const DraggableContainer = (props: any) => (
    <SortableContainerWrapper
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = ({ ...restProps }: any) => {
    const index = dataSource.findIndex((x: any) => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };
  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      loading={loading}
      columns={[...defaultCols, ...columns]}
      rowKey="index"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
    />
  );
};
