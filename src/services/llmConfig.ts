import auth from '@/utils/auth';
import request from '@/utils/request';

const BASE_URL = '/llm/config';

// ==================== LLM 配置 ====================

// 获取 LLM 配置列表
export async function listConfigs(params: { provider?: string; is_active?: boolean } = {}) {
  const queryParams = new URLSearchParams();
  if (params.provider) {
    queryParams.append('provider', params.provider);
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }

  return request(`${BASE_URL}?${queryParams.toString()}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取默认配置
export async function getDefaultConfig() {
  return request(`${BASE_URL}/default`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 获取配置详情
export async function getConfig(configId: number) {
  return request(`${BASE_URL}/${configId}`, {
    method: 'GET',
    headers: auth.headers(),
  });
}

// 创建 LLM 配置
export async function createConfig(data: any) {
  return request(`${BASE_URL}`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// 更新 LLM 配置
export async function updateConfig(configId: number, data: any) {
  return request(`${BASE_URL}/${configId}`, {
    method: 'PUT',
    data,
    headers: auth.headers(),
  });
}

// 删除 LLM 配置
export async function deleteConfig(configId: number) {
  return request(`${BASE_URL}/${configId}`, {
    method: 'DELETE',
    headers: auth.headers(),
  });
}

// 设为默认
export async function setDefaultConfig(configId: number) {
  return request(`${BASE_URL}/${configId}/set-default`, {
    method: 'POST',
    headers: auth.headers(),
  });
}

// 测试连接
export async function testConfig(data: any) {
  return request(`${BASE_URL}/test`, {
    method: 'POST',
    data,
    headers: auth.headers(),
  });
}

// ==================== 类型定义 ====================

export type LLMProvider = 'openai' | 'azure_openai' | 'anthropic' | 'ollama' | 'custom';

export interface LLMConfigData {
  id: number;
  config_name: string;
  name: string;
  provider: LLMProvider;
  model_name: string;
  api_key: string;
  base_url?: string;
  system_prompt?: string;
  temperature: number;
  max_tokens: number;
  supports_vision: boolean;
  context_limit: number;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  create_user?: number;
  updated_at?: string;
  update_user?: number;
}

export interface LLMConfigCreateData {
  config_name: string;
  name: string;
  provider: LLMProvider;
  model_name: string;
  api_key?: string;
  base_url?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  supports_vision?: boolean;
  context_limit?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface LLMConfigUpdateData {
  config_name?: string;
  name?: string;
  provider?: LLMProvider;
  model_name?: string;
  api_key?: string;
  base_url?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  supports_vision?: boolean;
  context_limit?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface LLMConfigTestData {
  config_id?: number;
  config_name?: string;
  name?: string;
  provider?: LLMProvider;
  api_key?: string;
  base_url?: string;
  test_message?: string;
}

export interface LLMConfigTestResponse {
  success: boolean;
  message: string;
  response?: string;
  error?: string;
  latency?: number;
}
