import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// ============== 模板管理 ==============

// 模板列表
export async function listTemplate(params) {
  return request(`${CONFIG.URL}/case/v2/template/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个模板
export async function getTemplate(id) {
  return request(`${CONFIG.URL}/case/v2/template`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建模板
export async function createTemplate(data) {
  return request(`${CONFIG.URL}/case/v2/template`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新模板
export async function updateTemplate(data) {
  return request(`${CONFIG.URL}/case/v2/template`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除模板
export async function deleteTemplate(id) {
  return request(`${CONFIG.URL}/case/v2/template`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}

// ============== 用例管理 ==============

// 用例列表
export async function listCase(params) {
  return request(`${CONFIG.URL}/case/v2/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个用例（含扩展字段）
export async function getCase(id) {
  return request(`${CONFIG.URL}/case/v2`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建用例
export async function createCase(data) {
  return request(`${CONFIG.URL}/case/v2`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新用例
export async function updateCase(data) {
  return request(`${CONFIG.URL}/case/v2`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除用例
export async function deleteCase(id) {
  return request(`${CONFIG.URL}/case/v2`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}

// ============== AI 生成任务管理 ==============

// AI 任务列表
export async function listAITask(params) {
  return request(`${CONFIG.URL}/case/v2/ai/task/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个 AI 任务
export async function getAITask(id) {
  return request(`${CONFIG.URL}/case/v2/ai/task`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建 AI 任务
export async function createAITask(data) {
  return request(`${CONFIG.URL}/case/v2/ai/task`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新 AI 任务
export async function updateAITask(data) {
  return request(`${CONFIG.URL}/case/v2/ai/task`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除 AI 任务
export async function deleteAITask(id) {
  return request(`${CONFIG.URL}/case/v2/ai/task`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}

// 执行 AI 生成任务
export async function executeAITask(id) {
  return request(`${CONFIG.URL}/case/v2/ai/task/execute`, {
    method: 'POST',
    params: { id },
    headers: auth.headers(),
  });
}
