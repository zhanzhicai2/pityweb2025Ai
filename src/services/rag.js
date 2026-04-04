import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/rag';

// 上传文档到知识库
export async function uploadDocument(file, name) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);

  return request(`${BASE_URL}/upload`, {
    method: 'POST',
    data: formData,
    headers: {
      ...auth.headers(),
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 搜索知识库
export async function searchKnowledge(query, topK = 10, useCache = true) {
  return request(`${BASE_URL}/search`, {
    method: 'POST',
    data: { query, top_k: topK, use_cache: useCache },
    headers: auth.headers(),
  });
}

// 搜索知识库（带Rerank精排）
export async function searchKnowledgeV2(query, topK = 10, initialK = 50) {
  return request(`${BASE_URL}/search-v2`, {
    method: 'POST',
    data: { query, top_k: topK, initial_k: initialK },
    headers: auth.headers(),
  });
}

// 获取文档列表
export async function listDocuments(page = 1, size = 20, name = '', status = '') {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (name) params.append('name', name);
  if (status) params.append('status', status);

  return request(`${BASE_URL}/list?${params.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取文档详情
export async function getDocument(docId) {
  return request(`${BASE_URL}/${docId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 删除文档
export async function deleteDocument(docId) {
  return request(`${BASE_URL}/${docId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}
