import request from '@/utils/request';
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';

// ============== 场景管理 ==============

// 场景列表
export async function listScenario(params) {
  return request(`${CONFIG.URL}/case/v2/scenario/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

// 获取单个场景（含步骤）
export async function getScenario(id) {
  return request(`${CONFIG.URL}/case/v2/scenario`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建场景
export async function createScenario(data) {
  return request(`${CONFIG.URL}/case/v2/scenario`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新场景
export async function updateScenario(data) {
  return request(`${CONFIG.URL}/case/v2/scenario`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除场景
export async function deleteScenario(id) {
  return request(`${CONFIG.URL}/case/v2/scenario`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}

// ============== 场景步骤管理 ==============

// 获取场景的所有步骤
export async function listScenarioSteps(scenario_id) {
  return request(`${CONFIG.URL}/case/v2/scenario/steps`, {
    method: 'GET',
    params: { scenario_id },
    headers: auth.headers(),
  });
}

// 获取单个步骤
export async function getScenarioStep(id) {
  return request(`${CONFIG.URL}/case/v2/scenario/step`, {
    method: 'GET',
    params: { id },
    headers: auth.headers(),
  });
}

// 创建步骤
export async function createScenarioStep(data) {
  return request(`${CONFIG.URL}/case/v2/scenario/step`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新步骤
export async function updateScenarioStep(data) {
  return request(`${CONFIG.URL}/case/v2/scenario/step`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除步骤
export async function deleteScenarioStep(id) {
  return request(`${CONFIG.URL}/case/v2/scenario/step`, {
    method: 'DELETE',
    params: { id },
    headers: auth.headers(),
  });
}
