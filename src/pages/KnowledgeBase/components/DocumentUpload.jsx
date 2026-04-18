import React, { useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { uploadDocument } from '../services';
import auth from '@/utils/auth';

export default function DocumentUpload({ visible, currentKB, onSuccess, onCancel }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件');
      return;
    }
    setUploading(true);
    let successCount = 0;
    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      if (currentKB?.id) {
        formData.append('lib_id', currentKB.id);
      }
      try {
        const res = await uploadDocument(formData);
        if (auth.response(res)) {
          successCount++;
        }
      } catch (e) {
        console.error('上传失败', e);
      }
    }
    setUploading(false);
    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`);
      setFileList([]);
      onSuccess?.();
    }
  };

  const beforeUpload = (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'md', 'txt'];
    if (!allowed.includes(ext)) {
      message.error(`不支持的文件类型: .${ext}`);
      return Upload.LIST_IGNORE;
    }
    setFileList((prev) => [...prev, file]);
    return false;
  };

  const handleRemove = (file) => {
    setFileList((prev) => prev.filter((f) => f !== file));
  };

  return (
    <Modal
      title="上传文档"
      open={visible}
      onOk={handleUpload}
      onCancel={() => {
        setFileList([]);
        onCancel();
      }}
      okText="上传"
      cancelText="关闭"
      confirmLoading={uploading}
      width={600}
      destroyOnClose
    >
      <Upload
        multiple
        accept=".pdf,.docx,.md,.txt"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={handleRemove}
        showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
      >
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px dashed #d9d9d9',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#fafafa',
          }}
        >
          <p style={{ fontSize: '48px', color: '#1677ff', marginBottom: 8 }}>
            <InboxOutlined />
          </p>
          <p>点击或拖拽文件到此区域上传</p>
          <p style={{ color: '#999', fontSize: 12 }}>支持 PDF、DOCX、Markdown、TXT 格式</p>
        </div>
      </Upload>
    </Modal>
  );
}
