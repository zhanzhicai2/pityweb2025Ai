// @ts-nocheck
import defaultSettings from '../../config/defaultSettings';

interface Payload {
  payload?: any;
}

interface State {
  colorWeak?: boolean;
  contentWidth?: string;
  [key: string]: any;
}

const updateColorWeak = (colorWeak: boolean) => {
  const root = document.getElementById('root');

  if (root) {
    root.className = colorWeak ? 'colorWeak' : '';
  }
};

const SettingModel = {
  namespace: 'settings',
  state: defaultSettings as State,
  reducers: {
    changeSetting(state: State = defaultSettings as State, { payload }: Payload) {
      const { colorWeak, contentWidth } = payload;

      if (state.contentWidth !== contentWidth && window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }

      updateColorWeak(!!colorWeak);
      return { ...state, ...payload };
    },
  },
};
export default SettingModel;
