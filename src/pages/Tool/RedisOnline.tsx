// @ts-nocheck
// @ts-nocheck
import { PageContainer } from '@ant-design/pro-components';

import { IconFont } from '@/components/Icon/IconFont';
import { connect } from '@umijs/max';
import { Alert, Card, Col, Menu, Row } from 'antd';
import { useEffect, useState } from 'react';
import Terminal from 'react-console-emulator';

interface RedisConfig {
  id: number;
  addr: string;
  cluster: boolean;
}

interface GconfigState {
  redisConfig: RedisConfig[];
}

interface RedisOnlineProps {
  dispatch: (action: { type: string; payload?: any }) => void;
  gconfig: GconfigState;
}

const RedisOnline = ({ dispatch, gconfig }: RedisOnlineProps) => {
  const [label, setLabel] = useState('disconnected> ');
  const [currentRedis, setCurrentRedis] = useState<number | null>(null);

  const { redisConfig } = gconfig;

  const getArray = (result: any) => {
    if (typeof result === 'string') {
      return result;
    }
    if (result.length === 0) {
      return '(empty array)';
    }
    return result.map((item: string, index: number) => `${index + 1}) ${item}`).join('\n');
  };

  const onlineRedis = async (command: string) => {
    return await dispatch({
      type: 'gconfig/onlineRedisCommand',
      payload: {
        id: currentRedis,
        command,
      },
    });
  };

  const commands: Record<string, any> = {
    get: {
      description: 'Get Key',
      usage: 'get [key]',
      fn: async (...args: string[]) => {
        const cmd = 'get' + ' ' + args.join(' ');
        const result = await onlineRedis(cmd);
        if (result === null) {
          return 'nil';
        }
        return result;
      },
    },
    set: {
      description: 'Set Key value',
      usage: 'set [key] [value]',
      fn: async (...args: string[]) => {
        const cmd = 'set' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
    hget: {
      description: 'hget key field',
      usage: 'hget [key] [field]',
      fn: async (...args: string[]) => {
        const cmd = 'hget' + ' ' + args.join(' ');
        const result = await onlineRedis(cmd);
        if (result === null) {
          return 'nil';
        }
        return result;
      },
    },
    hgetall: {
      description: 'hgetall key',
      usage: 'hgetall [key]',
      fn: async (...args: string[]) => {
        const cmd = 'hgetall' + ' ' + args.join(' ');
        const result = await onlineRedis(cmd);
        return getArray(result);
      },
    },
    hset: {
      description: 'hset key field value',
      usage: 'hset [key] [field] [value]',
      fn: async (...args: string[]) => {
        const cmd = 'hset' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
    keys: {
      description: 'keys pattern',
      usage: 'keys [regex]',
      fn: async (...args: string[]) => {
        const cmd = 'keys' + ' ' + args.join(' ');
        const result = await onlineRedis(cmd);
        return getArray(result);
      },
    },
    lpush: {
      description: 'lpush key value',
      usage: 'lpush [key] [value]',
      fn: async (...args: string[]) => {
        const cmd = 'lpush' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
    rpush: {
      description: 'rpush key value',
      usage: 'rpush [key] [value]',
      fn: async (...args: string[]) => {
        const cmd = 'rpush' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
    lrange: {
      description: 'lrange key start end',
      usage: 'lrange [key] [start] [end]',
      fn: async (...args: string[]) => {
        const cmd = 'lrange' + ' ' + args.join(' ');
        const result = await onlineRedis(cmd);
        return getArray(result);
      },
    },
    del: {
      description: 'del key',
      usage: 'del [key]',
      fn: async (...args: string[]) => {
        const cmd = 'del' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
    zadd: {
      fn: async (...args: string[]) => {
        const cmd = 'zadd' + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    },
  };

  const cmds = [
    'exists',
    'select',
    'expire',
    'move',
    'scan',
    'ttl',
    'sort',
    'getbit',
    'getset',
    'mget',
    'mset',
    'setnx',
    'strlen',
  ];
  cmds.forEach((command) => {
    commands[command] = {
      fn: async (...args: string[]) => {
        const cmd = command + ' ' + args.join(' ');
        return await onlineRedis(cmd);
      },
    };
  });

  useEffect(() => {
    dispatch({
      type: 'gconfig/fetchRedisConfig',
    });
  }, []);

  const handleClick = (a: any) => {
    setLabel(a.item.props.children[1].props.props.children[1].props.children + '> ');
    setCurrentRedis(parseInt(a.key, 10));
  };

  return (
    <PageContainer title="在线执行Redis" breadcrumb={undefined}>
      <Card style={{ margin: -12 }}>
        <Row>
          <Col span={24}>
            <Alert
              style={{ marginBottom: 8 }}
              type="info"
              showIcon
              closable
              message="选中左侧菜单可以切换Redis, 目前支持get/set/hget/hgetall/hset等常见操作"
            />
          </Col>
          <Col span={5}>
            <Menu
              style={{
                minHeight: 400,
                maxHeight: 400,
                overflow: 'auto',
                background: 'rgb(33, 33, 33)',
              }}
              theme="dark"
              onClick={handleClick}
              mode="inline"
            >
              {redisConfig.map((v) => (
                <Menu.Item
                  key={v.id}
                  icon={
                    v.cluster ? <IconFont type="icon-jiqun" /> : <IconFont type="icon-fuwushili" />
                  }
                >
                  {v.addr}
                </Menu.Item>
              ))}
            </Menu>
          </Col>

          <Col span={19}>
            <div
              style={{
                minHeight: 400,
                maxHeight: 400,
                overflow: 'auto',
                borderLeft: '1px solid rgb(70 68 12)',
              }}
            >
              <Terminal
                style={{ height: 400, borderRadius: 0 }}
                ignoreCommandCase
                commands={commands}
                disabled={label === 'disconnected> '}
                autoFocus
                welcomeMessage={
                  'Welcome to the Redis Terminal!\nEnter "help" show all command supported!'
                }
                promptLabel={label}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default connect(({ gconfig }: { gconfig: GconfigState }) => ({ gconfig }))(RedisOnline);
