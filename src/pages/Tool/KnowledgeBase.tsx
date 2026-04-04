import KnowledgeBaseComponent from '@/components/RAG/KnowledgeBase';
import { PageContainer } from '@ant-design/pro-components';

export default () => {
  return (
    <PageContainer
      title="知识库管理"
      breadcrumb={undefined}
      content="管理 RAG 知识库文档，支持上传、搜索和删除"
    >
      <KnowledgeBaseComponent />
    </PageContainer>
  );
};
