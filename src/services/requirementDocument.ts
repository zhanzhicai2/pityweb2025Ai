import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/requirement/document';

// ==================== 需求文档 ====================

// 获取文档列表
export async function listDocuments(
  params: { project_id?: number; doc_type?: string; keyword?: string } = {},
) {
  const queryParams = new URLSearchParams();
  if (params.project_id) {
    queryParams.append('project_id', params.project_id.toString());
  }
  if (params.doc_type) {
    queryParams.append('doc_type', params.doc_type);
  }
  if (params.keyword) {
    queryParams.append('keyword', params.keyword);
  }

  return request(`${BASE_URL}?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取文档详情
export async function getDocument(documentId: number) {
  return request(`${BASE_URL}/${documentId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 创建文档
export async function createDocument(data: any) {
  return request(`${BASE_URL}`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新文档
export async function updateDocument(documentId: number, data: any) {
  return request(`${BASE_URL}/${documentId}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除文档
export async function deleteDocument(documentId: number) {
  return request(`${BASE_URL}/${documentId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// ==================== 类型定义 ====================

export interface RequirementDocumentData {
  id: number;
  name: string;
  doc_type: string;
  project_id?: number;
  file_path?: string;
  file_name?: string;
  content?: string;
  create_user?: number;
  created_at?: string;
  updated_at?: string;
  update_user?: number;
}

export interface RequirementDocumentCreateData {
  name: string;
  doc_type: string;
  project_id?: number;
  file_path?: string;
  file_name?: string;
  content?: string;
}

export interface RequirementDocumentUpdateData {
  name?: string;
  doc_type?: string;
  project_id?: number;
  file_path?: string;
  file_name?: string;
  content?: string;
}
