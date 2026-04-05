import {
  createTaskSetting,
  deleteTaskSetting,
  listConfigs,
  listTaskSettings,
  updateTaskSetting,
} from '@/services/webhook';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, message, Modal, Switch } from 'antd';
import { useEffect, useRef, useState } from 'react';

const taskTypeOptions = [
  { label: '测试计划', value: 'test_plan' },
  { label: '任务调度', value: 'scheduler' },
];

interface TaskSettingFormProps {
  record: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const TaskSettingForm: React.FC<TaskSettingFormProps> = ({ record, onCancel, onSuccess }) => {
  const [form] = ProTable.useForm();
  const [loading, setLoading] = useState(false);
  const [configOptions, setConfigOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    // 加载 Webhook 配置列表
    listConfigs({ skip: 0, limit: 100 }).then((res) => {
      if (res.code === 0) {
        const options = (res.data?.list || []).map((c: any) => ({
          label: c.name,
          value: c.id,
        }));
        setConfigOptions(options);
      }
    });
  }, []);

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_enabled: true,
        notify_on_success: false,
        notify_on_failure: true,
      });
    }
  }, [record, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let res;
      if (record?.id) {
        res = await updateTaskSetting(record.id, values);
      } else {
        res = await createTaskSetting(values);
      }
      if (res.code === 0) {
        message.success(record?.id ? '更新成功' : '创建成功');
        onSuccess();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (e) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const formColumns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      formItemProps: {
        rules: [{ required: true, message: '请输入任务ID' }],
      },
    },
    {
      title: '任务类型',
      dataIndex: 'task_type',
      key: 'task_type',
      valueType: 'select',
      fieldProps: { options: taskTypeOptions },
      formItemProps: {
        rules: [{ required: true, message: '请选择任务类型' }],
      },
    },
    {
      title: 'Webhook 配置',
      dataIndex: 'config_id',
      key: 'config_id',
      valueType: 'select',
      fieldProps: { options: configOptions },
      formItemProps: {
        rules: [{ required: true, message: '请选择 Webhook 配置' }],
      },
    },
    {
      title: '成功通知',
      dataIndex: 'notify_on_success',
      key: 'notify_on_success',
      valueType: 'switch',
      initialValue: false,
    },
    {
      title: '失败通知',
      dataIndex: 'notify_on_failure',
      key: 'notify_on_failure',
      valueType: 'switch',
      initialValue: true,
    },
    {
      title: '启用',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      valueType: 'switch',
      initialValue: true,
    },
  ];

  return (
    <ProTable
      type="form"
      form={form}
      columns={formColumns}
      submitButtonProps={{ loading, htmlType: 'submit' }}
      onSubmit={handleSubmit}
      onReset={onCancel}
      rowKey="id"
      pagination={false}
    />
  );
};

const TaskSettings: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteTaskSetting(id);
      if (res.code === 0) {
        message.success('删除成功');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      width: 120,
    },
    {
      title: '任务类型',
      dataIndex: 'task_type',
      key: 'task_type',
      width: 120,
      render: (_: any, record: any) => {
        const type = taskTypeOptions.find((t) => t.value === record.task_type);
        return type?.label || record.task_type;
      },
    },
    {
      title: '配置ID',
      dataIndex: 'config_id',
      key: 'config_id',
      width: 100,
    },
    {
      title: '成功通知',
      dataIndex: 'notify_on_success',
      key: 'notify_on_success',
      width: 100,
      render: (_: any, record: any) => <Switch checked={record.notify_on_success} disabled />,
    },
    {
      title: '失败通知',
      dataIndex: 'notify_on_failure',
      key: 'notify_on_failure',
      width: 100,
      render: (_: any, record: any) => <Switch checked={record.notify_on_failure} disabled />,
    },
    {
      title: '启用',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      width: 80,
      render: (_: any, record: any) => <Switch checked={record.is_enabled} disabled />,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      valueType: 'option',
      render: (_: any, record: any) => (
        <>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <ProTable
        headerTitle="任务通知设置"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
        request={async () => {
          const res = await listTaskSettings({ skip: 0, limit: 100 });
          return {
            data: res.data?.list || [],
            total: res.data?.total || 0,
            success: res.code === 0,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingRecord ? '编辑任务通知' : '新建任务通知'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
        width={500}
      >
        <TaskSettingForm
          record={editingRecord}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
          }}
          onSuccess={() => {
            setModalVisible(false);
            setEditingRecord(null);
            actionRef.current?.reload();
          }}
        />
      </Modal>
    </>
  );
};

export default TaskSettings;
