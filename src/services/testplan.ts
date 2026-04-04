// 编辑测试数据
import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface TestPlanParams {
  [key: string]: any;
}

export async function listTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/list`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function listTestPlanCaseTree(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/tree`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function insertTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/insert`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function updateTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/update`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function deleteTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/delete`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function executeTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/execute`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

/**
 * 关注测试计划
 * @param params
 * @returns {Promise<*>}
 */
export async function followTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/follow`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

/**
 * 取关测试计划
 * @param params
 * @returns {Promise<*>}
 */
export async function unFollowTestPlan(params: TestPlanParams) {
  return request(`${CONFIG.URL}/testcase/plan/unfollow`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}
