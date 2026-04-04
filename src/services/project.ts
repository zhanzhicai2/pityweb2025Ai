import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface ProjectParams {
  [key: string]: any;
}

export async function listProject(params: ProjectParams) {
  return request(`${CONFIG.URL}/project/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function insertProject(params: ProjectParams) {
  return request(`${CONFIG.URL}/project/insert`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function queryProject(params: ProjectParams) {
  return request(`${CONFIG.URL}/project/query`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function updateProject(data: ProjectParams) {
  return request(`${CONFIG.URL}/project/update`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function insertProjectRole(data: ProjectParams) {
  return request(`${CONFIG.URL}/project/role/insert`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateProjectRole(data: ProjectParams) {
  return request(`${CONFIG.URL}/project/role/update`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function deleteProjectRole(data: ProjectParams) {
  return request(`${CONFIG.URL}/project/role/delete`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function updateAvatar(data: { file: File; project_id: number }) {
  const formData = new FormData();
  formData.append('file', data.file);
  return await request(`${CONFIG.URL}/project/avatar/${data.project_id}`, {
    method: 'POST',
    data: formData,
    requestType: 'form',
    headers: auth.headers(false),
  });
}

/**
 * 删除项目
 */
export async function deleteProject(params: ProjectParams) {
  return request(`${CONFIG.URL}/project/delete`, {
    method: 'DELETE',
    params,
    headers: auth.headers(),
  });
}
