import request from '@/utils/request';
import auth from '@/utils/auth';
import CONFIG from '@/consts/config';

export async function getServerMonitorInfo() {
  return request(`${CONFIG.URL}/monitor/server/info`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function getCpuInfo() {
  return request(`${CONFIG.URL}/monitor/server/cpu`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function getMemoryInfo() {
  return request(`${CONFIG.URL}/monitor/server/memory`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function getDiskInfo() {
  return request(`${CONFIG.URL}/monitor/server/disk`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function getNetworkInfo() {
  return request(`${CONFIG.URL}/monitor/server/network`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

export async function getProcessInfo(limit = 10) {
  return request(`${CONFIG.URL}/monitor/server/processes?limit=${limit}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}
