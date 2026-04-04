import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface ReportParams {
  [key: string]: any;
}

export async function listTestReport(params: ReportParams) {
  return request(`${CONFIG.URL}/testcase/report/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function queryReport(params: ReportParams) {
  return request(`${CONFIG.URL}/testcase/report`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}
