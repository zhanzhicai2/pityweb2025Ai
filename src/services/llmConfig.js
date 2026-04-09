import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

export async function listLlmConfig(params) {
  return request(`${CONFIG.URL}/llm/config`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function getLlmConfig(config_id) {
  return request(`${CONFIG.URL}/llm/config/${config_id}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function insertLlmConfig(data) {
  return request(`${CONFIG.URL}/llm/config`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateLlmConfig(config_id, data) {
  return request(`${CONFIG.URL}/llm/config/${config_id}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

export async function deleteLlmConfig(config_id) {
  return request(`${CONFIG.URL}/llm/config/${config_id}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

export async function setDefaultLlmConfig(config_id) {
  return request(`${CONFIG.URL}/llm/config/${config_id}/set-default`, {
    method: 'POST',
    headers: auth.headers(),
  });
}

export async function testLlmConfig(data) {
  return request(`${CONFIG.URL}/llm/config/test`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}
