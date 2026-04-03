import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// 查询任务状态
export async function getTaskStatus(taskId: string) {
  return request(`${CONFIG.URL}/task/${taskId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取任务结果
export async function getTaskResult(taskId: string) {
  return request(`${CONFIG.URL}/task/${taskId}/result`, {
    method: 'GET',
    headers: auth.headers(),
  });
}
