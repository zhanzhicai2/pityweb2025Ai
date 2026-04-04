import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/data-pool';

// 获取工具列表
export async function listTools() {
  return request(`${BASE_URL}/tools`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 生成单条数据
export async function generateData(toolName, params = null) {
  return request(`${BASE_URL}/generate`, {
    method: 'POST',
    data: {
      tool_name: toolName,
      params,
    },
    headers: auth.headers(),
  });
}

// 批量生成数据
export async function batchGenerateData(toolName, count = 10, params = null) {
  return request(`${BASE_URL}/batch-generate`, {
    method: 'POST',
    data: {
      tool_name: toolName,
      count,
      params,
    },
    headers: auth.headers(),
  });
}

// 获取使用记录
export async function listRecords(params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', (params.page || 1).toString());
  queryParams.append('size', (params.size || 20).toString());
  if (params.tool_name) queryParams.append('tool_name', params.tool_name);
  if (params.tool_category) queryParams.append('tool_category', params.tool_category);
  if (params.is_favorite !== undefined)
    queryParams.append('is_favorite', params.is_favorite.toString());

  return request(`${BASE_URL}/records?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 删除记录
export async function deleteRecord(recordId) {
  return request(`${BASE_URL}/records/${recordId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// 收藏/取消收藏
export async function favoriteRecord(id, isFavorite) {
  return request(`${BASE_URL}/favorite`, {
    method: 'POST',
    data: {
      id,
      is_favorite: isFavorite,
    },
    headers: auth.headers(),
  });
}
