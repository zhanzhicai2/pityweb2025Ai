import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Empty, Row } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import SplitPane from 'react-split-pane';
import ScrollCard from '@/components/Scrollbar/ScrollCard';
import { useProject } from '@/utils/useProject';
import useKnowledgeBase from './hooks/useKnowledgeBase';
import useDocuments from './hooks/useDocuments';
import KnowledgeBaseList from './components/KnowledgeBaseList';
import DocumentTable from './components/DocumentTable';
import KnowledgeBaseForm from './components/KnowledgeBaseForm';
import DocumentUpload from './components/DocumentUpload';
import DocumentDetail from './components/DocumentDetail';
import './KnowledgeBase.less';

const PROJECT_ID_KEY = 'pity_knowledge_base_project_id';

export default function KnowledgeBase() {
  const { projects, loading: projectLoading } = useProject();
  const [projectId, setProjectId] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  // 初始化项目：从 localStorage 读取或默认选择最新项目
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

  // 保存选择的项目到 localStorage
  const handleProjectChange = (id) => {
    setProjectId(id);
    localStorage.setItem(PROJECT_ID_KEY, id.toString());
  };

  const kb = useKnowledgeBase(projectId);
  const docs = useDocuments(kb.currentKB);

  const handleFormSave = async (values) => {
    if (kb.editingKB) {
      return kb.update(kb.editingKB.id, values);
    }
    return kb.create(values);
  };

  const handleDeleteKB = (item) => {
    kb.remove(item.id);
  };

  if (!projectId && !projectLoading) {
    return (
      <PageContainer title={false} breadcrumb={null}>
        <Card
          style={{ height: '100%', minHeight: 600 }}
          styles={{ body: { padding: 0 } }}
          variant="ghost"
        >
          <Empty description="加载中..." />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={false} breadcrumb={null}>
      <Card
        style={{ height: '100%', minHeight: 600 }}
        styles={{ body: { padding: 0 } }}
        variant="ghost"
      >
        <Row>
          <SplitPane className="knowledgeSplit" split="vertical" minSize={200} defaultSize={280}>
            {/* 左侧：知识库列表 */}
            <ScrollCard className="card" hideOverflowX={true}>
              <KnowledgeBaseList
                list={kb.list}
                currentId={kb.currentId}
                loading={kb.loading}
                projects={projects}
                currentProjectId={projectId}
                onProjectChange={handleProjectChange}
                onSelect={kb.selectKB}
                onEdit={kb.openEdit}
                onDelete={handleDeleteKB}
                onCreate={kb.openCreate}
              />
            </ScrollCard>

            {/* 右侧：文档管理 */}
            <ScrollCard className="card" hideOverflowX={true}>
              {kb.currentKB ? (
                <DocumentTable
                  currentKB={kb.currentKB}
                  documents={docs.documents}
                  loading={docs.loading}
                  stats={docs.stats}
                  searchKeyword={docs.searchKeyword}
                  searchAll={docs.searchAll}
                  onSearchKeywordChange={docs.setSearchKeyword}
                  onSearchAllChange={docs.setSearchAll}
                  onSearch={(keyword) => docs.search(keyword, projectId)}
                  onReset={docs.resetSearch}
                  onUpload={() => setUploadVisible(true)}
                  onRefresh={docs.fetchList}
                  onView={docs.showDetail}
                  onDelete={docs.remove}
                />
              ) : (
                <Empty description="请选择左侧知识库查看文档" style={{ marginTop: 100 }} />
              )}
            </ScrollCard>
          </SplitPane>
        </Row>
      </Card>

      {/* 新建/编辑知识库弹窗 */}
      <KnowledgeBaseForm
        visible={kb.formVisible}
        editingKB={kb.editingKB}
        onSave={handleFormSave}
        onCancel={kb.closeForm}
      />

      {/* 上传文档弹窗 */}
      <DocumentUpload
        visible={uploadVisible}
        currentKB={kb.currentKB}
        onSuccess={docs.fetchList}
        onCancel={() => setUploadVisible(false)}
      />

      {/* 文档详情抽屉 */}
      <DocumentDetail
        visible={docs.detailVisible}
        data={docs.detailData}
        onClose={docs.closeDetail}
      />
    </PageContainer>
  );
}
