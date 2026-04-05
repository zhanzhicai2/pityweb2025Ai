import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/import/openapi';

// ==================== OpenAPI 解析 ====================

// 解析 OpenAPI 文档（通过 URL）
export async function parseOpenApiByUrl(data) {
  return request(`${BASE_URL}/parse`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 解析 OpenAPI 文档（通过内容）
export async function parseOpenApiByContent(data) {
  return request(`${BASE_URL}/parse`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 生成测试用例
export async function generateTestcases(data) {
  return request(`${BASE_URL}/generate`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}
