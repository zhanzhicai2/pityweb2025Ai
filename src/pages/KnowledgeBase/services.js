import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// ==================== 知识库 CRUD ====================

export async function getKnowledgeBases(projectId) {
  return request(`${CONFIG.URL}/rag/knowledge-bases`, {
    method: 'GET',
    params: { project_id: projectId },
    headers: auth.headers(),
  });
}

export async function createKnowledgeBase(data) {
  return request(`${CONFIG.URL}/rag/knowledge-bases`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateKnowledgeBase(id, data) {
  return request(`${CONFIG.URL}/rag/knowledge-bases/${id}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

export async function deleteKnowledgeBase(id) {
  return request(`${CONFIG.URL}/rag/knowledge-bases/${id}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// ==================== 文档管理 ====================

export async function getDocuments(params) {
  return request(`${CONFIG.URL}/rag/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function uploadDocument(formData) {
  return request(`${CONFIG.URL}/rag/upload`, {
    method: 'POST',
    data: formData,
    headers: auth.headers(false),
  });
}

export async function deleteDocument(docId) {
  return request(`${CONFIG.URL}/rag/${docId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

export async function getDocumentDetail(docId) {
  return request(`${CONFIG.URL}/rag/${docId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// ==================== 检索 ====================

export async function searchDocuments(data) {
  return request(`${CONFIG.URL}/rag/search`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}
