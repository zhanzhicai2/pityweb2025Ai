import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface ConstructorParams {
  [key: string]: any;
}

export async function listConstructorData(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function queryConstructorData(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function insertConstructorData(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor/insert`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function updateConstructorData(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor/update`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function deleteConstructorData(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor/delete`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function updateConstructorOrder(params: ConstructorParams) {
  return request(`${CONFIG.URL}/testcase/constructor/order`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}
