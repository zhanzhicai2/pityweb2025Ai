import React, { useState } from 'react';
import { Modal, Upload, Input, Switch, Form, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import auth from '@/utils/auth';

export default function RequirementUpload({ visible, currentItem, onSuccess, onCancel }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件');
      return;
    }
    if (!currentItem?.id) {
      message.error('请先选择需求文档');
      return;
    }

    console.log('上传参数:', {
      requirement_id: currentItem.id,
      description,
      isPublic,
      fileCount: fileList.length,
    });
    const headers = auth.headers(false); // false = 不加 Content-Type，让 fetch 自动处理 multipart
    console.log('请求头:', headers);

    setUploading(true);
    let successCount = 0;

    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requirement_id', String(currentItem.id));
      if (description) {
        formData.append('description', description);
      }
      formData.append('is_public', isPublic ? 'true' : 'false');

      try {
        const res = await fetch('/requirement/file/upload', {
          method: 'POST',
          headers,
          body: formData,
        });
        const data = await res.json();
        console.log('上传响应:', data);
        if (data.code === 0) {
          successCount++;
        } else {
          message.error(`${file.name} 上传失败: ${data.msg}`);
        }
      } catch (e) {
        console.error('上传失败', e);
        message.error(`${file.name} 上传失败`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`);
      setFileList([]);
      setDescription('');
      setIsPublic(true);
      onSuccess?.();
      onCancel?.();
    }
  };

  const beforeUpload = (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'md', 'txt'];
    if (!allowed.includes(ext)) {
      message.error(`不支持的文件类型: .${ext}，仅支持 PDF、Word、Markdown、TXT`);
      return Upload.LIST_IGNORE;
    }
    setFileList((prev) => [...prev, file]);
    return false;
  };

  const handleRemove = (file) => {
    setFileList((prev) => prev.filter((f) => f !== file));
  };

  const handleCancel = () => {
    setFileList([]);
    setDescription('');
    setIsPublic(true);
    onCancel?.();
  };

  return (
    <Modal
      title={`上传文件 - ${currentItem?.name || ''}`}
      open={visible}
      onOk={handleUpload}
      onCancel={handleCancel}
      okText="上传"
      cancelText="取消"
      confirmLoading={uploading}
      width={560}
      destroyOnClose
    >
      <Upload
        multiple
        accept=".pdf,.docx,.doc,.md,.txt"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={handleRemove}
        showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
      >
        <div
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            cursor: 'pointer',
            background: '#fafafa',
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 40, color: '#1677ff', marginBottom: 8 }}>
            <InboxOutlined />
          </p>
          <p>点击或拖拽文件到此区域上传</p>
          <p style={{ color: '#999', fontSize: 12 }}>支持 PDF、DOCX、Markdown、TXT 格式</p>
        </div>
      </Upload>

      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="文件描述" style={{ marginBottom: 12 }}>
          <Input.TextArea
            rows={2}
            placeholder="可选：输入文件描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="是否公开" style={{ marginBottom: 0 }}>
          <Switch
            checked={isPublic}
            onChange={setIsPublic}
            checkedChildren="公开"
            unCheckedChildren="私有"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
