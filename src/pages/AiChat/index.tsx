import {
  createSession,
  deleteSession,
  listMessages,
  listModels,
  listSessions,
  sendMessage,
} from '@/services/chat';
import {
  DeleteOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  Input,
  Layout,
  List,
  Modal,
  Select,
  Spin,
  Switch,
  Typography,
  message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: number;
}

interface Session {
  id: number;
  session_id: string;
  title: string;
  message_count: number;
  model?: string;
  created_at: number;
}

export default () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [useRag, setUseRag] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 加载会话列表
  const loadSessions = async () => {
    try {
      const res = await listSessions({ skip: 0, limit: 100 });
      if (res.code === 0) {
        setSessions(res.data?.list || []);
      }
    } catch (e) {
      message.error('加载会话列表失败');
    }
  };

  // 加载消息列表
  const loadMessages = async (sessionId: number) => {
    try {
      setLoading(true);
      const res = await listMessages(sessionId, { skip: 0, limit: 100 });
      if (res.code === 0) {
        setMessages(res.data?.list || []);
        scrollToBottom();
      }
    } catch (e) {
      message.error('加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载模型列表
  const loadModels = async () => {
    try {
      const res = await listModels();
      if (res.code === 0) {
        setModels(res.data || []);
        if (res.data?.length > 0) {
          setSelectedModel(res.data[0].id);
        }
      }
    } catch (e) {
      console.error('加载模型失败', e);
    }
  };

  // 创建新会话
  const handleCreateSession = async () => {
    try {
      const res = await createSession();
      if (res.code === 0) {
        message.success('创建成功');
        await loadSessions();
        const newSession = res.data;
        setCurrentSession(newSession);
        setMessages([]);
      }
    } catch (e) {
      message.error('创建会话失败');
    }
  };

  // 选择会话
  const handleSelectSession = async (session: Session) => {
    setCurrentSession(session);
    await loadMessages(session.id);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) {
      return;
    }

    try {
      setSending(true);
      const res = await sendMessage(currentSession.id, {
        content: inputValue,
        model: selectedModel,
        use_rag: useRag,
      });

      if (res.code === 0) {
        setInputValue('');
        // 添加用户消息
        const userMsg = res.data.user_message;
        const assistantMsg = res.data.assistant_message;
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        scrollToBottom();
        // 更新会话列表
        loadSessions();
      } else {
        message.error(res.msg || '发送失败');
      }
    } catch (e) {
      message.error('发送消息失败');
    } finally {
      setSending(false);
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个会话吗？',
      onOk: async () => {
        try {
          const res = await deleteSession(sessionId);
          if (res.code === 0) {
            message.success('删除成功');
            if (currentSession?.id === sessionId) {
              setCurrentSession(null);
              setMessages([]);
            }
            loadSessions();
          }
        } catch (e) {
          message.error('删除失败');
        }
      },
    });
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  return (
    <Layout className="ai-chat-page" style={{ height: '100%' }}>
      {/* 左侧会话列表 */}
      <Sider width={300} className="chat-sider">
        <div className="sider-header">
          <Title level={5} style={{ margin: 0 }}>
            AI 对话
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSession}>
            新建
          </Button>
        </div>
        <div className="rag-toggle">
          <Switch size="small" checked={useRag} onChange={setUseRag} />
          <span style={{ marginLeft: 8, fontSize: 12 }}>启用知识库</span>
        </div>

        <div className="session-list">
          {sessions.length === 0 ? (
            <Empty description="暂无会话" style={{ marginTop: 40 }} />
          ) : (
            <List
              dataSource={sessions}
              renderItem={(session) => (
                <List.Item
                  className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => handleSelectSession(session)}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={session.title || '新对话'}
                    description={`${session.message_count || 0} 条消息 · ${formatDate(
                      session.created_at,
                    )}`}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Sider>

      {/* 右侧对话区域 */}
      <Content className="chat-content">
        {currentSession ? (
          <>
            {/* 消息列表 */}
            <div className="messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${msg.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <Avatar
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className={`message-avatar ${msg.role === 'user' ? 'user' : 'assistant'}`}
                  />
                  <div className="message-content">
                    <div className="message-bubble">{msg.content}</div>
                    <div className="message-time">{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="loading-container">
                  <Spin description="加载中..." />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="input-container">
              <div className="model-select">
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  style={{ width: 120 }}
                  options={models.map((m) => ({ label: m.name, value: m.id }))}
                />
              </div>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入消息..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sending}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </div>
          </>
        ) : (
          <div className="no-session">
            <RobotOutlined style={{ fontSize: 64, color: '#ccc' }} />
            <p>选择一个会话或创建新对话</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSession}>
              新建对话
            </Button>
          </div>
        )}
      </Content>

      <style>{`
        .ai-chat-page {
          background: #fff;
        }
        .chat-sider {
          background: #fafafa;
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }
        .sider-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f0f0f0;
        }
        .rag-toggle {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }
        .session-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .session-item {
          cursor: pointer;
          padding: 12px !important;
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .session-item:hover {
          background: #f5f5f5;
        }
        .session-item.active {
          background: #e6f7ff;
        }
        .chat-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .message-item {
          display: flex;
          margin-bottom: 16px;
          align-items: flex-start;
        }
        .message-item.user {
          flex-direction: row-reverse;
        }
        .message-avatar {
          flex-shrink: 0;
          margin: 0 8px;
        }
        .message-avatar.user {
          background: #1890ff;
        }
        .message-avatar.assistant {
          background: #52c41a;
        }
        .message-content {
          max-width: 70%;
        }
        .message-item.user .message-content {
          align-items: flex-end;
        }
        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          background: #f5f5f5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .message-item.user .message-bubble {
          background: #1890ff;
          color: #fff;
        }
        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
        .loading-container {
          text-align: center;
          padding: 20px;
        }
        .input-container {
          padding: 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .model-select {
          flex-shrink: 0;
        }
        .no-session {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          color: #999;
        }
      `}</style>
    </Layout>
  );
};
