import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row } from 'antd';
import SplitPane from 'react-split-pane';
import ScrollCard from '@/components/Scrollbar/ScrollCard';
import { useProject } from '@/utils/useProject';
import RequirementList from './components/RequirementList';
import RequirementTable from './components/RequirementTable';
import RequirementForm from './components/RequirementForm';
import RequirementUpload from './components/RequirementUpload';
import './Requirement.less';

const PROJECT_ID_KEY = 'pity_requirement_project_id';

export default function Requirement() {
  const { projects, loading: projectLoading } = useProject();
  const [projectId, setProjectId] = useState(null);
  const [list, setList] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 文件列表相关状态
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // 初始化项目
  useEffect(() => {
    if (projects && projects.length > 0 && projectId === null) {
      const savedProjectId = localStorage.getItem(PROJECT_ID_KEY);
      if (savedProjectId) {
        const exists = projects.find((p) => p.id === parseInt(savedProjectId));
        if (exists) {
          setProjectId(parseInt(savedProjectId));
          return;
        }
      }
      const latestProject = projects.reduce((prev, curr) => (curr.id > prev.id ? curr : prev));
      setProjectId(latestProject.id);
    }
  }, [projects, projectId]);

  // 保存选择的项目
  const handleProjectChange = (id) => {
    setProjectId(id);
    setCurrentId(null);
    setFiles([]);
    localStorage.setItem(PROJECT_ID_KEY, id.toString());
  };

  // 加载需求文档列表
  const fetchList = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await import('@/services/requirement').then((m) =>
        m.listRequirement({ project_id: projectId }),
      );
      if (res?.code === 0) {
        const docs = res.data || [];
        setList(docs);
        // 自动选中第一个（若当前无选中）
        if (docs.length > 0 && !currentId) {
          setCurrentId(docs[0].id);
        }
        // 若当前选中的文档已被删除，清空选中
        if (currentId && !docs.find((d) => d.id === currentId)) {
          setCurrentId(null);
          setFiles([]);
        }
      }
    } catch (e) {
      console.error('加载需求文档失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [projectId]);

  // 选中文档变化时加载文件列表
  const fetchFiles = async (docId) => {
    if (!docId) {
      setFiles([]);
      return;
    }
    setFilesLoading(true);
    try {
      const res = await import('@/services/requirement').then((m) => m.listRequirementFiles(docId));
      if (res?.code === 0) {
        setFiles(res.data || []);
      }
    } catch (e) {
      console.error('加载文件列表失败', e);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentId);
    setSearchKeyword('');
  }, [currentId]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    const res = await import('@/services/requirement').then((m) => m.deleteRequirement(id));
    if (res?.code === 0) {
      if (currentId === id) {
        setCurrentId(null);
        setFiles([]);
      }
      fetchList();
    }
  };

  const handleSave = async (values) => {
    const service = editingItem
      ? import('@/services/requirement').then((m) => m.updateRequirement(editingItem.id, values))
      : import('@/services/requirement').then((m) =>
          m.createRequirement({ ...values, project_id: projectId }),
        );
    const res = await service;
    if (res?.code === 0) {
      setFormVisible(false);
      fetchList();
    }
  };

  const handleDeleteFile = async (fileId) => {
    const res = await import('@/services/requirement').then((m) => m.deleteRequirementFile(fileId));
    if (res?.code === 0) {
      fetchFiles(currentId);
    }
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  const handleReset = () => {
    setSearchKeyword('');
  };

  const currentItem = list.find((item) => item.id === currentId);

  return (
    <PageContainer title={false} breadcrumb={null}>
      <Card
        style={{ height: '100%', minHeight: 600 }}
        styles={{ body: { padding: 0 } }}
        variant="ghost"
      >
        <Row>
          <SplitPane className="requirementSplit" split="vertical" minSize={200} defaultSize={280}>
            <ScrollCard className="card" hideOverflowX={true}>
              <RequirementList
                list={list}
                currentId={currentId}
                loading={loading}
                projects={projects}
                currentProjectId={projectId}
                onProjectChange={handleProjectChange}
                onSelect={setCurrentId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreate={handleCreate}
              />
            </ScrollCard>

            <ScrollCard className="card" hideOverflowX={true}>
              <RequirementTable
                currentItem={currentItem}
                files={files}
                loading={filesLoading}
                searchKeyword={searchKeyword}
                onSearchKeywordChange={setSearchKeyword}
                onSearch={handleSearch}
                onReset={handleReset}
                onUpload={() => setUploadVisible(true)}
                onRefresh={() => fetchFiles(currentId)}
                onDeleteFile={handleDeleteFile}
              />
            </ScrollCard>
          </SplitPane>
        </Row>
      </Card>

      <RequirementForm
        visible={formVisible}
        editingItem={editingItem}
        onSave={handleSave}
        onCancel={() => setFormVisible(false)}
      />

      <RequirementUpload
        visible={uploadVisible}
        currentItem={currentItem}
        onSuccess={() => fetchFiles(currentId)}
        onCancel={() => setUploadVisible(false)}
      />
    </PageContainer>
  );
}
