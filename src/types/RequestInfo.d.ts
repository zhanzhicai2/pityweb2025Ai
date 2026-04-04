export interface RequestInfo {
  index?: number;
  url?: string;
  request_method?: string;
  request_headers?: string;
  response_headers?: string;
  body?: string;
  response_content?: string;
  request_cookies?: string;
  cookies?: string;
  status_code?: number;
}
