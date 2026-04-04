import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface OnlineParams {
  [key: string]: any;
}

export async function fetchDatabaseSource(params: OnlineParams) {
  return request(`${CONFIG.URL}/online/database/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function fetchTables(data: OnlineParams) {
  return request(`${CONFIG.URL}/online/tables/list`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

export async function onlineExecuteSQL(params: OnlineParams) {
  return request(`${CONFIG.URL}/online/sql`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function listHistory(params: OnlineParams) {
  return request(`${CONFIG.URL}/online/history/query`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}
