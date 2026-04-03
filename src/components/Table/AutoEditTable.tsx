import { DeleteTwoTone } from '@ant-design/icons';
import { Form, Input, Popconfirm, Select, Table } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './AutoEditTable.less';

const { Option } = Select;
const EditableContext = React.createContext<any>(null);

interface EditableRowProps {
  index: number;
  [key: string]: any;
}

const EditableRow: React.FC<EditableRowProps> = ({ ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface AutoEditTableProps {
  columns: any[];
  dataSource: any[];
  setDataSource: (data: any[]) => void;
}

const AutoEditTable: React.FC<AutoEditTableProps> = ({ columns, dataSource, setDataSource }) => {
  const [editing, setEditing] = useState<number | null>(null);

  const EditableCell = ({
    editable,
    children,
    dataIndex,
    name,
    record,
    handleSave,
    ...restProps
  }: any) => {
    const form = useContext(EditableContext);
    const inputRef = useRef<any>(null);

    useEffect(() => {
      if (editing !== null) {
        form.setFieldsValue(dataSource[editing]);
      }
    }, [editing]);

    const onUpdateRecord = (record: any, name: string, value: any) => {
      const newData = [...dataSource];
      const index = newData.findIndex((item) => record.key === item.key);
      const item = newData[index];
      newData[index] = { ...item, [name]: value };
      setDataSource(newData);
    };

    const getComponent = (
      name: string,
      dataIndex: string,
      record: any,
      inputRef: any,
      save: () => void,
    ) => {
      if (dataIndex === 'source') {
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${name} is required.`,
              },
            ]}
          >
            <Select
              placeholder="选择数据来源"
              style={{ width: '90%' }}
              ref={inputRef}
              onSelect={(e: any) => {
                onUpdateRecord(record, dataIndex, e);
              }}
              onBlur={save}
            >
              <Option value={0}>Response: 正则</Option>
              <Option value={1}>Response: JSONPath</Option>
              <Option value={2}>Header: K/V</Option>
              <Option value={3}>Cookie: K/V</Option>
              <Option value={4}>响应状态码</Option>
              <Option value={5}>Body: 正则</Option>
              <Option value={6}>Body: JSONPath</Option>
              <Option value={7}>Request Header: K/V</Option>
            </Select>
          </Form.Item>
        );
      }
      if (dataIndex === 'expression') {
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: record.source !== 4,
                message: `${name} is required.`,
              },
            ]}
          >
            <Input
              ref={inputRef}
              onPressEnter={save}
              disabled={record.source === 4}
              onBlur={save}
              placeholder={record.source === 4 ? '无需填写' : '请输入表达式'}
            />
          </Form.Item>
        );
      }
      if (dataIndex === 'match_index') {
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: [4, 1, 6, 2, 3, 7].indexOf(record.source) === -1,
                message: `${name} is required.`,
              },
            ]}
          >
            <Input
              ref={inputRef}
              onPressEnter={save}
              disabled={[4, 1, 6, 2, 3, 7].indexOf(record.source) > -1}
              onBlur={save}
              placeholder={record.source === 4 ? '无需填写' : '请输入匹配项'}
            />
          </Form.Item>
        );
      }
      return (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: record.source !== 4,
              message: `${name} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} placeholder={`请输入${name}`} />
        </Form.Item>
      );
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        setEditing(null);
        form.setFieldsValue(record);
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode =
        editing === record.key ? (
          getComponent(name, dataIndex, record, inputRef, save)
        ) : (
          <div
            className="editable-cell-value-wrap"
            style={{
              paddingRight: 24,
            }}
          >
            {children}
          </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    if (newData.filter((item: any) => item.name).length === newData.length) {
      newData.push({
        key: dataSource.length === 0 ? 0 : dataSource[dataSource.length - 1].key + 1,
        source: 1,
      });
    }
    setDataSource(newData);
  };

  const handleDelete = (key: number) => {
    const data = [...dataSource];
    setDataSource(
      data
        .filter((item) => item.key !== key)
        .map((v: any, index: number) => ({ ...v, key: index })),
    );
  };

  let newColumns = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        name: col.name,
        handleSave: handleSave,
      }),
    };
  });

  newColumns = [
    ...newColumns,
    {
      title: '操作',
      render: (_: any, record: any) =>
        dataSource.length > 1 ? (
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => {
              handleDelete(record.key);
            }}
          >
            <DeleteTwoTone
              twoToneColor="red"
              onClick={(e: any) => {
                e.stopPropagation();
              }}
            />
          </Popconfirm>
        ) : null,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <Table
      onRow={(record: any) => {
        return {
          onClick: () => {
            setEditing(record.key);
          },
        };
      }}
      components={components}
      rowClassName="editable-row"
      dataSource={dataSource}
      columns={newColumns}
      pagination={false}
    />
  );
};

export default AutoEditTable;
