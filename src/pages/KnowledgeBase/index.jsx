import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Select, Space } from 'antd';
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

export default function KnowledgeBase() {
  const { projects, loading: projectLoading } = useProject();
  const [projectId, setProjectId] = useState(null);

  const kb = useKnowledgeBase(projectId);
  const docs = useDocuments(kb.currentKB);

  const [uploadVisible, setUploadVisible] = useState(false);

  const handleFormSave = async (values) => {
    if (kb.editingKB) {
      return kb.update(kb.editingKB.id, values);
    }
    return kb.create(values);
  };

  const handleDeleteKB = (item) => {
    kb.remove(item.id);
  };

  return (
    <PageContainer>
      <Card>
        {/* 项目选择器 */}
        <div style={{ marginBottom: 12 }}>
          <Space>
            <span>项目：</span>
            <Select
              style={{ width: 300 }}
              placeholder="请选择项目"
              loading={projectLoading}
              value={projectId}
              onChange={setProjectId}
              showSearch
              optionFilterProp="label"
              options={(projects || []).map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Space>
        </div>

        <SplitPane split="vertical" defaultSize={280} minSize={200} maxSize={400}>
          {/* 左侧：知识库列表 */}
          <ScrollCard>
            <KnowledgeBaseList
              list={kb.list}
              currentId={kb.currentId}
              loading={kb.loading}
              onSelect={kb.selectKB}
              onEdit={kb.openEdit}
              onDelete={handleDeleteKB}
              onCreate={kb.openCreate}
            />
          </ScrollCard>

          {/* 右侧：文档管理 */}
          <ScrollCard>
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
          </ScrollCard>
        </SplitPane>

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
      </Card>
    </PageContainer>
  );
}
