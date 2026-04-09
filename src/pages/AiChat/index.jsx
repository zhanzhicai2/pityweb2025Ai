import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  List,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Typography,
  Dropdown,
  Menu,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import {
  createChatSession,
  deleteChatSession,
  listChatMessages,
  listChatModels,
  listChatSessions,
  updateChatSession,
} from '@/services/chat';
import auth from '@/utils/auth';
import CONFIG from '@/consts/config';

const { TextArea } = Input;
const { Text } = Typography;
const { Sider, Content } = Layout;
const { Option } = Select;

// 初始化 mermaid
mermaid.initialize({ startOnLoad: true });

// Mermaid 渲染组件
const MermaidBlock = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!chart) return;
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    const trimmedChart = chart.trim();
    mermaid
      .render(id, trimmedChart)
      .then(({ svg }) => {
        setSvg(svg);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [chart]);

  if (error)
    return (
      <pre style={{ color: '#red' }}>
        {chart}\nError: {error}
      </pre>
    );
  if (!svg) return <div>渲染中...</div>;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};

const AiChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [useRag, setUseRag] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSessionId, setEditSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef(null);
  const chatContentRef = useRef(null);

  // 格式化时间分组
  const formatTimeGroup = (timestamp) => {
    const now = moment();
    const msgTime = moment(timestamp);
    const diffHours = now.diff(msgTime, 'hours');

    if (diffHours < 1) return '1 小时前';
    if (diffHours < 2) return '2 小时前';
    if (diffHours < 24) return `${Math.floor(diffHours)} 小时前`;
    if (diffHours < 48) return '1 天前';
    return msgTime.format('YYYY/M/D');
  };

  // 加载会话列表
  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await listChatSessions(0, 100);
      if (auth.response(res)) {
        setSessions(res.data?.list || []);
      }
    } catch (e) {
      console.error('加载会话列表失败', e);
    }
    setSessionsLoading(false);
  };

  // 加载模型列表
  const loadModels = async () => {
    try {
      const res = await listChatModels();
      if (auth.response(res)) {
        const modelList = res.data || [];
        setModels(modelList);
        // 默认选中第一个启用的模型
        const defaultModel = modelList.find((m) => m.enabled);
        if (defaultModel) {
          setSelectedModel(defaultModel.id);
        }
      }
    } catch (e) {
      console.error('加载模型列表失败', e);
    }
  };

  // 加载消息列表
  const loadMessages = async (sessionId) => {
    try {
      const res = await listChatMessages(sessionId);
      if (auth.response(res)) {
        setMessages(res.data?.list || []);
        scrollToBottom();
      }
    } catch (e) {
      console.error('加载消息列表失败', e);
    }
  };

  // 创建新会话
  const handleCreateSession = async () => {
    try {
      const res = await createChatSession();
      if (auth.response(res)) {
        const newSession = res.data;
        setSessions([newSession, ...sessions]);
        setCurrentSession(newSession);
        setMessages([]);
      }
    } catch (e) {
      console.error('创建会话失败', e);
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个会话吗？删除后无法恢复。',
      async onOk() {
        try {
          const res = await deleteChatSession(sessionId);
          if (auth.response(res, true)) {
            setSessions(sessions.filter((s) => s.id !== sessionId));
            if (currentSession?.id === sessionId) {
              setCurrentSession(null);
              setMessages([]);
            }
          }
        } catch (e) {
          console.error('删除会话失败', e);
        }
      },
    });
  };

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 发送消息（流式）
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession || streaming) return;

    const content = inputValue.trim();
    setInputValue('');
    setStreaming(true);

    // 添加用户消息到列表
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // 添加 AI 消息占位符（立即显示，减少等待感）
    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '思考中...',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    scrollToBottom();

    try {
      const response = await fetch(`${CONFIG.URL}/ai/chat/send/stream/${currentSession.id}`, {
        method: 'POST',
        headers: {
          ...auth.headers(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          model: selectedModel,
          use_rag: useRag,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                fullContent += data.data;
                setMessages((prev) => {
                  const updated = [...prev];
                  // 找到 assistant 消息并更新
                  for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i]?.role === 'assistant') {
                      updated[i].content = fullContent;
                      break;
                    }
                  }
                  return updated;
                });
                scrollToBottom();
              } else if (data.type === 'done') {
                // 如果是默认标题"新对话"，自动更新为用户提问前20字符
                if (currentSession?.title === '新对话') {
                  const title = content.length > 20 ? content.substring(0, 20) + '...' : content;
                  updateChatSession(currentSession.id, title).then((res) => {
                    if (auth.response(res)) {
                      setSessions(
                        sessions.map((s) => (s.id === currentSession.id ? { ...s, title } : s)),
                      );
                      setCurrentSession({ ...currentSession, title });
                    }
                  });
                }
              } else if (data.type === 'error') {
                message.error(data.message);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (e) {
      message.error('发送消息失败: ' + e.message);
    }

    setStreaming(false);
    scrollToBottom();
  };

  // 选择会话
  const handleSelectSession = (session) => {
    setCurrentSession(session);
    loadMessages(session.id);
  };

  // 编辑会话标题
  const handleEditTitle = (session) => {
    setEditSessionId(session.id);
    setEditTitle(session.title);
    setEditModalVisible(true);
  };

  // 确认编辑标题
  const handleConfirmEditTitle = async () => {
    if (!editTitle.trim() || !editSessionId) return;
    // 标题截取前20字符
    const title =
      editTitle.trim().length > 20 ? editTitle.trim().substring(0, 20) + '...' : editTitle.trim();
    // 异步更新，不阻塞 UI
    updateChatSession(editSessionId, title).then((res) => {
      if (auth.response(res)) {
        setSessions(sessions.map((s) => (s.id === editSessionId ? { ...s, title } : s)));
        if (currentSession?.id === editSessionId) {
          setCurrentSession({ ...currentSession, title });
        }
      }
    });
    setEditModalVisible(false);
  };

  // 搜索过滤
  const filteredSessions = sessions.filter((s) =>
    s.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // 按时间分组
  const groupedSessions = () => {
    const groups = {};
    filteredSessions.forEach((session) => {
      const group = formatTimeGroup(session.created_at);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(session);
    });
    return Object.entries(groups);
  };

  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession?.id]);

  return (
    <Layout style={{ height: '100vh', background: '#fff' }}>
      {/* 左侧会话列表 */}
      <Sider
        width={280}
        style={{
          background: '#f5f5f5',
          borderRight: '1px solid #e8e8e8',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ width: '100%', marginBottom: 16 }}
            onClick={handleCreateSession}
          >
            新建对话
          </Button>
          <Input
            placeholder="搜索历史..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        </div>

        <Spin spinning={sessionsLoading}>
          <div style={{ padding: '0 8px' }}>
            {groupedSessions().map(([group, groupSessions]) => (
              <div key={group} style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ padding: '8px 12px', display: 'block', fontSize: 12 }}
                >
                  {group}
                </Text>
                <List
                  dataSource={groupSessions}
                  renderItem={(session) => (
                    <List.Item
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: currentSession?.id === session.id ? '#e6f7ff' : 'transparent',
                        borderRadius: 6,
                        marginBottom: 4,
                      }}
                      onClick={() => handleSelectSession(session)}
                    >
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text ellipsis style={{ flex: 1 }}>
                            {session.title || '新对话'}
                          </Text>
                          <Dropdown
                            overlay={
                              <Menu>
                                <Menu.Item
                                  key="edit"
                                  icon={<EditOutlined />}
                                  onClick={(e) => {
                                    e.domEvent.stopPropagation();
                                    handleEditTitle(session);
                                  }}
                                >
                                  编辑标题
                                </Menu.Item>
                                <Menu.Item
                                  key="export"
                                  icon={<ExportOutlined />}
                                  onClick={(e) => e.domEvent.stopPropagation()}
                                >
                                  导出对话
                                </Menu.Item>
                                <Menu.Item
                                  key="delete"
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={(e) => {
                                    e.domEvent.stopPropagation();
                                    handleDeleteSession(session.id);
                                  }}
                                >
                                  删除对话
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={['click']}
                          >
                            <MoreOutlined
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: 14 }}
                            />
                          </Dropdown>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {session.message_count || 0} 条消息
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            ))}
          </div>
        </Spin>
      </Sider>

      {/* 右侧聊天区域 */}
      <Layout>
        {/* 顶部栏 */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ fontWeight: 500 }}>模型：</span>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 200 }}
            placeholder="选择模型"
          >
            {models.map((model) => (
              <Option key={model.id} value={model.id} disabled={!model.enabled}>
                {model.name} {!model.enabled && '(已禁用)'}
              </Option>
            ))}
          </Select>

          <span style={{ fontWeight: 500, marginLeft: 16 }}>RAG：</span>
          <Switch checked={useRag} onChange={setUseRag} />
          <Text type="secondary">知识库增强</Text>
        </div>

        {/* 消息区域 */}
        <Content
          ref={chatContentRef}
          style={{
            overflow: 'auto',
            padding: 24,
            background: '#fff',
          }}
        >
          {!currentSession ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text type="secondary">请选择一个会话或创建新对话</Text>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text type="secondary">开始对话吧！</Text>
            </div>
          ) : (
            <div>
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 24,
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
                      color: msg.role === 'user' ? '#fff' : '#333',
                    }}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code({ node, inline, className, children }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!inline && match?.[1] === 'mermaid') {
                              const chart = String(children).replace(/\n$/, '');
                              return <MermaidBlock chart={chart} />;
                            }
                            return <code className={className}>{children}</code>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {streaming && msg.role === 'assistant' && (
                      <span style={{ marginLeft: 4 }}>▊</span>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                    {msg.role === 'user' ? '我' : 'AI 助手'} ·{' '}
                    {moment(msg.created_at).format('HH:mm')}
                  </Text>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Content>

        {/* 输入区域 */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e8e8e8',
            background: '#fff',
          }}
        >
          <Row gutter={[8, 8]}>
            <Col span={20}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="向 AI 助手发送消息..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!currentSession || streaming}
                style={{ marginBottom: 12 }}
              />
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!currentSession || !inputValue.trim() || streaming}
                loading={streaming}
              >
                {streaming ? '发送中...' : '发送'}
              </Button>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Shift + Enter 换行，Enter 发送
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </Layout>

      {/* 编辑标题弹窗 */}
      <Modal
        title="编辑会话标题"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleConfirmEditTitle}
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="请输入会话标题"
        />
      </Modal>
    </Layout>
  );
};

export default AiChat;
