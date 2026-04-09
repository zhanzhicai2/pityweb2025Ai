import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

/**
 * 创建新会话
 */
export async function createChatSession() {
  return request(`${CONFIG.URL}/ai/chat/sessions`, {
    method: 'POST',
    headers: auth.headers(),
  });
}

/**
 * 获取会话列表
 * @param {number} skip - 跳过数量
 * @param {number} limit - 返回数量
 */
export async function listChatSessions(skip = 0, limit = 20) {
  return request(`${CONFIG.URL}/ai/chat/sessions`, {
    method: 'GET',
    params: { skip, limit },
    headers: auth.headers(),
  });
}

/**
 * 获取会话详情
 * @param {number} session_id - 会话ID
 */
export async function getChatSession(session_id) {
  return request(`${CONFIG.URL}/ai/chat/sessions/${session_id}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

/**
 * 删除会话
 * @param {number} session_id - 会话ID
 */
export async function deleteChatSession(session_id) {
  return request(`${CONFIG.URL}/ai/chat/sessions/${session_id}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

/**
 * 更新会话标题
 * @param {number} session_id - 会话ID
 * @param {string} title - 新标题
 */
export async function updateChatSession(session_id, title) {
  return request(`${CONFIG.URL}/ai/chat/sessions/${session_id}`, {
    method: 'PUT',
    params: { title },
    headers: auth.headers(),
  });
}

/**
 * 获取消息列表
 * @param {number} session_id - 会话ID
 * @param {number} skip - 跳过数量
 * @param {number} limit - 返回数量
 */
export async function listChatMessages(session_id, skip = 0, limit = 100) {
  return request(`${CONFIG.URL}/ai/chat/messages/${session_id}`, {
    method: 'GET',
    params: { skip, limit },
    headers: auth.headers(),
  });
}

/**
 * 发送消息（流式）
 * @param {number} session_id - 会话ID
 * @param {object} data - { content, model, use_rag }
 */
export async function sendChatMessageStream(session_id, data) {
  return request(`${CONFIG.URL}/ai/chat/send/stream/${session_id}`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

/**
 * 获取可用模型列表
 */
export async function listChatModels() {
  return request(`${CONFIG.URL}/ai/chat/models`, {
    method: 'GET',
    headers: auth.headers(),
  });
}
