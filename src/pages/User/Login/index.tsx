import Footer from '@/components/Footer';
import {
  GithubOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Tabs } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

const clientId = `0f4fc0a875de30614a6a`;

const redirectToGithub = () => {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
};

const ActionIcons = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    };
  });

  return (
    <>
      <GithubOutlined key="GithubOutlined" className={langClassName} onClick={redirectToGithub} />
    </>
  );
};

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { loginPity, registerPity } = useModel('auth');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    let resp;
    if (type === 'register') {
      resp = await registerPity({
        name: values?.name,
        password: values.password,
        email: values?.email,
        username: values.username,
      });
    } else {
      resp = await loginPity({ username: values.username, password: values.password });
    }
    if (resp.code === 0) {
      message.success('🎉 🎉 🎉 登录成功');
      await fetchUserInfo();
      const urlParams = new URL(window.location.href).searchParams;
      history.push(urlParams.get('redirect') || '/');
      return;
    }
    message.error(resp.msg);
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>{Settings.title}</title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="pity"
          subTitle="Pity是一款开源的接口自动化平台"
          initialValues={{
            autoLogin: true,
          }}
          actions={[<span key="loginWith">其他登录方式</span>, <ActionIcons key="icons" />]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="用户名: tester"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="密码: tester"
                rules={[
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ]}
              />
            </>
          )}

          {type === 'register' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                name="username"
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ]}
              />
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="name"
                placeholder="请输入姓名"
                rules={[
                  {
                    required: true,
                    message: '请输入姓名',
                  },
                ]}
              />
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                }}
                name="email"
                placeholder="请输入用户邮箱"
                rules={[
                  {
                    type: 'email',
                    required: true,
                    message: '请输入合法的邮箱',
                  },
                ]}
              />
              <ProFormText.Password
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                  type: 'password',
                }}
                name="password"
                placeholder="请输入用户密码"
                rules={[
                  {
                    required: true,
                    message: '请输入用户密码',
                  },
                ]}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            {type === 'register' ? null : (
              <ProFormCheckbox noStyle name="autoLogin">
                自动登录
              </ProFormCheckbox>
            )}
            <a
              style={{
                float: 'right',
              }}
            >
              {type === 'register' ? null : '忘记密码'}
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
