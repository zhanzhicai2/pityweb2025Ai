import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// ============== 测试计划 ==============

// 测试计划列表
export async function listPhaseXPlan(params) {
  return request(`${CONFIG.URL}/phasex/plan/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个测试计划
export async function getPhaseXPlan(id) {
  return request(`${CONFIG.URL}/phasex/plan`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建测试计划
export async function createPhaseXPlan(data) {
  return request(`${CONFIG.URL}/phasex/plan`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新测试计划
export async function updatePhaseXPlan(data) {
  return request(`${CONFIG.URL}/phasex/plan`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除测试计划
export async function deletePhaseXPlan(id) {
  return request(`${CONFIG.URL}/phasex/plan`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}

// 执行测试计划
export async function executePhaseXPlan(id) {
  return request(`${CONFIG.URL}/phasex/plan/execute`, {
    method: 'POST',
    params: { id },
    headers: auth.headers(),
  });
}

// ============== 执行记录 ==============

// 执行记录列表
export async function listPhaseXExecution(params) {
  return request(`${CONFIG.URL}/phasex/execution/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取执行记录详情
export async function getPhaseXExecution(id) {
  return request(`${CONFIG.URL}/phasex/execution`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 获取最新执行记录
export async function getLatestExecution(plan_id) {
  return request(`${CONFIG.URL}/phasex/execution/latest`, {
    method: 'GET',
    params: { plan_id },
    headers: auth.headers(),
  });
}

// ============== 测试报告 ==============

// 报告列表
export async function listPhaseXReport(params) {
  return request(`${CONFIG.URL}/phasex/report/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个报告
export async function getPhaseXReport(id) {
  return request(`${CONFIG.URL}/phasex/report`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建/更新报告
export async function savePhaseXReport(data) {
  return request(`${CONFIG.URL}/phasex/report`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}
