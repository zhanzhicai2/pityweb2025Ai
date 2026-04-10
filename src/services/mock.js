import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

export async function listMockRule(params) {
  return request(`${CONFIG.URL}/mock/rule/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function getMockRule(id) {
  return request(`${CONFIG.URL}/mock/rule?id=${id}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function createMockRule(data) {
  return request(`${CONFIG.URL}/mock/rule`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateMockRule(data) {
  return request(`${CONFIG.URL}/mock/rule`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

export async function deleteMockRule(id) {
  return request(`${CONFIG.URL}/mock/rule?id=${id}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

export async function toggleMockRule(id, is_active) {
  return request(`${CONFIG.URL}/mock/rule/toggle?id=${id}&is_active=${is_active}`, {
    method: 'PATCH',
    headers: auth.headers(),
  });
}
