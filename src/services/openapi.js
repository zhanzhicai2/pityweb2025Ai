import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

/**
 * 解析 OpenAPI 文档
 * @param {{url?: string, content?: string}} params
 */
export async function parseOpenAPI(params) {
  return request(`${CONFIG.URL}/import/openapi/parse`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

/**
 * 生成测试用例
 * @param {{project_id: number, apis: Array, base_url?: string}} params
 */
export async function generateTestCases(params) {
  return request(`${CONFIG.URL}/import/openapi/generate`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}
