import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  https?: boolean;
  logo?: string;
  apiUrl?: string;
  wssUrl?: string;
  backend?: boolean;
} = {
  navTheme: 'light',
  colorPrimary: '#1677ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  pwa: false,
  logo: '/logo.svg',
  apiUrl: '127.0.0.1:7777',
  wssUrl: 'ws://127.0.0.1:7777',
  https: false,
  backend: true,
  siderMenuType: 'sub',
  splitMenus: false,
};

export default Settings;
