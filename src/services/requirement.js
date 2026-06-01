import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

export async function listRequirement(params) {
  return request(`${CONFIG.URL}/requirement/document`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function getRequirement(id) {
  return request(`${CONFIG.URL}/requirement/document/${id}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function createRequirement(data) {
  return request(`${CONFIG.URL}/requirement/document`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateRequirement(id, data) {
  return request(`${CONFIG.URL}/requirement/document/${id}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

export async function deleteRequirement(id) {
  return request(`${CONFIG.URL}/requirement/document/${id}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// ---- 需求文件 API ----

export async function listRequirementFiles(requirementId) {
  return request(`${CONFIG.URL}/requirement/file/${requirementId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function deleteRequirementFile(fileId) {
  return request(`${CONFIG.URL}/requirement/file/${fileId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}
