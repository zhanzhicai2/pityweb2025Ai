import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/webhook';

// ==================== Webhook 配置 ====================

// 获取 Webhook 配置列表
export async function listConfigs(params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('skip', (params.skip || 0).toString());
  queryParams.append('limit', (params.limit || 20).toString());

  return request(`${BASE_URL}/configs?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 创建 Webhook 配置
export async function createConfig(data) {
  return request(`${BASE_URL}/configs`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新 Webhook 配置
export async function updateConfig(webhookId, data) {
  return request(`${BASE_URL}/configs/${webhookId}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除 Webhook 配置
export async function deleteConfig(webhookId) {
  return request(`${BASE_URL}/configs/${webhookId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// 测试 Webhook
export async function testWebhook(data) {
  return request(`${BASE_URL}/test`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// ==================== 通知历史 ====================

// 获取通知历史
export async function listHistories(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.config_id) {
    queryParams.append('config_id', params.config_id.toString());
  }
  if (params.status) {
    queryParams.append('status', params.status);
  }
  queryParams.append('days', (params.days || 7).toString());
  queryParams.append('skip', (params.skip || 0).toString());
  queryParams.append('limit', (params.limit || 100).toString());

  return request(`${BASE_URL}/histories?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 删除通知历史
export async function deleteHistory(historyId) {
  return request(`${BASE_URL}/histories/${historyId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// ==================== 任务通知设置 ====================

// 获取任务通知设置列表
export async function listTaskSettings(params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('skip', (params.skip || 0).toString());
  queryParams.append('limit', (params.limit || 100).toString());

  return request(`${BASE_URL}/task-settings?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 创建任务通知设置
export async function createTaskSetting(data) {
  return request(`${BASE_URL}/task-settings`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新任务通知设置
export async function updateTaskSetting(settingId, data) {
  return request(`${BASE_URL}/task-settings/${settingId}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除任务通知设置
export async function deleteTaskSetting(settingId) {
  return request(`${BASE_URL}/task-settings/${settingId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}
