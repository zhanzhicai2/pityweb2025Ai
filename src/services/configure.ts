import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface Params {
  [key: string]: any;
}

export async function listEnvironment(params: Params) {
  return request(`${CONFIG.URL}/config/environment/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function insertEnvironment(params: Params) {
  return request(`${CONFIG.URL}/config/environment/insert`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function updateEnvironment(params: Params) {
  return request(`${CONFIG.URL}/config/environment/update`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function deleteEnvironment(params: Params) {
  return request(`${CONFIG.URL}/config/environment/delete`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function insertGConfig(params: Params) {
  return request(`${CONFIG.URL}/config/gconfig/insert`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function listGConfig(params: Params) {
  return request(`${CONFIG.URL}/config/gconfig/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function updateGConfig(params: Params) {
  return request(`${CONFIG.URL}/config/gconfig/update`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function deleteGConfig(params: Params) {
  return request(`${CONFIG.URL}/config/gconfig/delete`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function queryStatistics(params: Params) {
  return request(`${CONFIG.URL}/workspace/statistics`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}
