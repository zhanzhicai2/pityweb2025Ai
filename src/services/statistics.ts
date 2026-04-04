import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryStatistics(params: any) {
  return request(`${CONFIG.URL}/workspace/statistics`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}
