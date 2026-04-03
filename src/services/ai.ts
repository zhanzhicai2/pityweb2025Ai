import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// AI 生成测试用例（同步）
export async function generateTestCase(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/generate`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// AI 生成测试用例（异步）
export async function generateTestCaseAsync(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/generate/async`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// AI 增强断言（同步）
export async function enhanceAsserts(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/enhance`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// AI 增强断言（异步）
export async function enhanceAssertsAsync(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/enhance/async`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 批量生成（同步）
export async function batchGenerate(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/batch-generate`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 批量生成（异步）
export async function batchGenerateAsync(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/batch-generate/async`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 解析 cURL
export async function parseCurl(data: any) {
  return request(`${CONFIG.URL}/testcase/ai/parse-curl`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 获取 AI 模型列表
export async function listAiModels() {
  return request(`${CONFIG.URL}/testcase/ai/models`, {
    method: 'GET',
    headers: auth.headers(),
  });
}
