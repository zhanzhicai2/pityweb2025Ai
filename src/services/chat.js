import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/ai/chat';

// 创建会话
export async function createSession() {
  return request(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: auth.headers(),
  });
}

// 获取会话列表
export async function listSessions(params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('skip', (params.skip || 0).toString());
  queryParams.append('limit', (params.limit || 20).toString());

  return request(`${BASE_URL}/sessions?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取会话详情
export async function getSession(sessionId) {
  return request(`${BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 删除会话
export async function deleteSession(sessionId) {
  return request(`${BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// 获取消息列表
export async function listMessages(sessionId, params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('skip', (params.skip || 0).toString());
  queryParams.append('limit', (params.limit || 100).toString());

  return request(`${BASE_URL}/messages/${sessionId}?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 发送消息
export async function sendMessage(sessionId, data) {
  return request(`${BASE_URL}/send/${sessionId}`, {
    method: 'POST',
    data: {
      content: data.content,
      model: data.model,
      use_rag: data.use_rag || false,
    },
    headers: auth.headers(),
  });
}

// 获取可用模型
export async function listModels() {
  return request(`${BASE_URL}/models`, {
    method: 'GET',
    headers: auth.headers(),
  });
}
