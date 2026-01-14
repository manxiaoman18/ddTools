<script setup lang="ts" name="XunFeiAIView">
import { NButton, NSpin, NMessageProvider, useMessage } from 'naive-ui';
import CryptoJs from 'crypto-js';
import { ref, onUnmounted, nextTick, computed, watch, onMounted } from 'vue';
import { marked } from 'marked';
import type { Ref } from 'vue';

// 配置类型定义
interface SparkConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
  apiVersion: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPending?: boolean;
}

interface WebSocketMessage {
  header: {
    code: number;
    message: string;
    status: number;
  };
  payload?: {
    choices?: {
      text: Array<{ content: string }>;
    };
  };
}

// 响应式数据
const message = useMessage();

// 配置（实际使用时应该从环境变量读取）
const sparkConfig: SparkConfig = {
  appId: import.meta.env.VITE_SPARK_APP_ID || 'a25bccdd',
  apiKey: import.meta.env.VITE_SPARK_API_KEY || 'a0a7ed3ff63dff77385b1296290f8cdd',
  apiSecret: import.meta.env.VITE_SPARK_API_SECRET || 'NDJjZWU4MTQzNzMyYmFhMTY2MjA2Yzgy',
  apiVersion: 'v1.1'
};

// 响应式数据
const isLoading = ref(false);
const inputMessage = ref('');
const chatContentRef = ref<HTMLDivElement>();
const chatMessages: Ref<Message[]> = ref([
  {
    id: generateId(),
    role: 'assistant',
    content: '您好，我是AI助手，有什么可以帮您的吗？',
    timestamp: Date.now()
  }
]);
const socket = ref<WebSocket | null>(null);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 3;

// 计算属性
const isConnected = computed(() =>
  socket.value?.readyState === WebSocket.OPEN
);

const hasInput = computed(() =>
  inputMessage.value.trim().length > 0
);

const inputLength = computed(() =>
  inputMessage.value.length
);

const isInputValid = computed(() =>
  hasInput.value && inputLength.value <= 2000
);

// 工具函数
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 生成WebSocket URL（带缓存，避免重复计算）
const websocketUrl = computed(() => {
  const { apiKey, apiSecret, apiVersion } = sparkConfig;
  const host = 'spark-api.xf-yun.com';
  const apiKeyName = 'api_key';
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';

  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /${apiVersion}/chat HTTP/1.1`;
  const signatureSha = CryptoJs.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJs.enc.Base64.stringify(signatureSha);

  const authorizationOrigin = `${apiKeyName}="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

  return `wss://${host}/${apiVersion}/chat?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
});

// 滚动到底部（优化：只有在接近底部时才滚动）
const scrollToBottom = (force = false) => {
  nextTick(() => {
    if (chatContentRef.value) {
      const { scrollTop, scrollHeight, clientHeight } = chatContentRef.value;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (force || isNearBottom) {
        chatContentRef.value.scrollTop = scrollHeight;
      }
    }
  });
};

// 初始化时滚动到底部
onMounted(() => {
  scrollToBottom(true);

  // 监听窗口大小变化，自动调整滚动
  window.addEventListener('resize', () => scrollToBottom(true));
});

// 添加消息
const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>): Message => {
  const newMessage: Message = {
    ...msg,
    id: generateId(),
    timestamp: Date.now()
  };

  chatMessages.value.push(newMessage);
  scrollToBottom();

  return newMessage;
};

// 更新消息
const updateMessage = (id: string, content: string) => {
  const index = chatMessages.value.findIndex(msg => msg.id === id);
  if (index !== -1) {
    chatMessages.value[index].content = content;
    scrollToBottom();
  }
};

// 清除聊天记录
const clearChat = () => {
  chatMessages.value = [
    {
      id: generateId(),
      role: 'assistant',
      content: '聊天记录已清空，有什么可以帮您的吗？',
      timestamp: Date.now()
    }
  ];
  message.success('聊天记录已清空');
  scrollToBottom(true);
};

// 复制消息
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    message.error('复制失败，请手动复制');
  }
};

// 处理AI响应（优化：支持流式响应的增量更新）
const handleAIResponse = (data: string) => {
  try {
    const parsed: WebSocketMessage = JSON.parse(data);

    // 错误处理
    if (parsed.header.code !== 0) {
      message.error(`AI响应错误: ${parsed.header.message}`);
      isLoading.value = false;
      return;
    }

    const content = parsed.payload?.choices?.text[0]?.content || '';

    if (content) {
      // 查找当前AI消息
      const aiMessageIndex = chatMessages.value.findLastIndex(
        msg => msg.role === 'assistant' && !msg.isPending
      );

      if (aiMessageIndex !== -1) {
        const currentMessage = chatMessages.value[aiMessageIndex];
        // 检查是否是连续的流式响应
        const isLastMessageFromAI = aiMessageIndex === chatMessages.value.length - 1;

        if (isLastMessageFromAI) {
          // 追加内容
          currentMessage.content += content;
        } else {
          // 创建新消息
          addMessage({ role: 'assistant', content });
        }
      } else {
        // 创建新消息
        addMessage({ role: 'assistant', content });
      }
    }

    // 如果是结束消息
    if (parsed.header.status === 2) {
      isLoading.value = false;
      reconnectAttempts.value = 0; // 重置重连计数
    }
  } catch (error) {
    console.error('解析AI响应失败:', error);
    message.error('处理AI响应时出错');
    isLoading.value = false;
  }
};

// 建立WebSocket连接
const connectWebSocket = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    try {
      // 关闭之前的连接
      if (socket.value) {
        socket.value.close(1000, 'Reconnecting');
      }

      const ws = new WebSocket(websocketUrl.value);
      socket.value = ws;

      ws.onopen = () => {
        console.log('WebSocket连接成功');
        reconnectAttempts.value = 0;
        resolve(ws);
      };

      ws.onmessage = (event) => {
        handleAIResponse(event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        reject(error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket关闭: ${event.code} ${event.reason}`);

        // 如果不是正常关闭且正在加载中，尝试重连
        if (event.code !== 1000 && isLoading.value && reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          message.warning(`连接断开，正在尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts})...`);

          setTimeout(() => {
            connectWebSocket().catch(err => {
              message.error('重连失败，请重新发送消息');
              isLoading.value = false;
            });
          }, 2000 * reconnectAttempts.value); // 指数退避
        } else if (event.code !== 1000) {
          isLoading.value = false;
        }

        socket.value = null;
      };

    } catch (error) {
      console.error('创建WebSocket失败:', error);
      reject(error);
    }
  });
};

// 发送消息
const sendMessage = async () => {
  if (isLoading.value) {
    message.warning('请等待上一条消息处理完成');
    return;
  }

  if (!isInputValid.value) {
    message.warning(inputLength.value > 2000 ? '消息长度不能超过2000字符' : '请输入消息内容');
    return;
  }

  const userMessageContent = inputMessage.value.trim();
  // 添加用户消息
  addMessage({ role: 'user', content: userMessageContent });
  inputMessage.value = '';

  try {
    isLoading.value = true;

    // 建立连接并发送消息
    const ws = await connectWebSocket();

    const params = {
      header: {
        app_id: sparkConfig.appId,
        uid: `user_${Date.now()}`,
      },
      parameter: {
        chat: {
          domain: 'lite',
          temperature: 0.5,
          max_tokens: 4096,
          incremental: true, // 启用增量响应
        },
      },
      payload: {
        message: {
          text: chatMessages.value.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        },
      },
    };

    // 添加一个空的AI消息作为占位符
    addMessage({ role: 'assistant', content: '', isPending: true });

    ws.send(JSON.stringify(params));

  } catch (error) {
    console.error('发送消息失败:', error);
    message.error('连接AI服务失败，请稍后重试');
    isLoading.value = false;
  }
};

// 键盘快捷键（优化：支持Ctrl+Enter发送）
const handleKeyPress = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' && !event.shiftKey) ||
    (event.ctrlKey && event.key === 'Enter')) {
    event.preventDefault();
    sendMessage();
  }
};

// 监听输入变化，自动调整textarea高度
watch(inputMessage, (newVal) => {
  const textarea = document.querySelector('textarea');
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }
});

// 清理资源
onUnmounted(() => {
  if (socket.value) {
    socket.value.close(1000, 'Component unmounted');
  }

  // 移除事件监听器
  window.removeEventListener('resize', () => scrollToBottom(true));
});

// 初始化marked配置
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    // 注意这里的参数变成了 { text, lang }，而不是 (code, lang)
    code({ text, lang }: { text: string; lang?: string }): string {
      // 1. 防止 XSS 攻击：转义 HTML 字符
      const escapedCode = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      // 2. 处理语言类名
      const langClass = lang ? `language-${lang}` : '';
      
      // 3. 返回 HTML
      return `<pre><code class="${langClass}">${escapedCode}</code></pre>`;
    }
  }
});
</script>

<template>
  <div class="ai-chat-container">
    <!-- 标题栏 -->
    <div class="chat-header">
      <h2>讯飞星火AI助手</h2>
      <div class="header-actions">
        <n-button size="small" @click="clearChat" :disabled="isLoading || chatMessages.length <= 1" type="default">
          清空对话
        </n-button>
        <div class="connection-status">
          <span :class="[
            'status-dot',
            isConnected ? 'connected' : isLoading ? 'connecting' : 'disconnected'
          ]"></span>
          {{
            isConnected ? '已连接' :
              isLoading ? '连接中...' : '未连接'
          }}
        </div>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content-wrapper">
      <div ref="chatContentRef" class="chat-content">
        <div v-for="(msg, index) in chatMessages" :key="msg.id" :class="[
          'message-item',
          `message-${msg.role}`,
          { 'last-message': index === chatMessages.length - 1 }
        ]">
          <div class="message-avatar">
            <div v-if="msg.role === 'user'" class="avatar user-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div v-else class="avatar ai-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path fill="currentColor" d="M13 7h-2v6h2zm0 8h-2v2h2z" />
              </svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">
                {{ msg.role === 'user' ? '您' : 'AI助手' }}
              </span>
              <span class="message-time">
                {{ new Date(msg.timestamp).toLocaleString() }}
              </span>
            </div>
            <div class="message-text" v-html="marked(msg.content)"></div>
            <div class="message-actions" v-if="msg.role === 'assistant' && msg.content">
              <n-button size="tiny" text @click="copyMessage(msg.content)" type="default">
                复制
              </n-button>
              <n-button size="tiny" text @click="sendMessage" type="default">
                追问
              </n-button>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isLoading" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">AI正在思考...</span>
        </div>

        <!-- 空状态 -->
        <div v-if="chatMessages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>开始对话</h3>
          <p>输入消息开始与AI助手对话</p>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <div class="input-limit" :class="{ warning: inputLength > 1800, error: inputLength > 2000 }">
          {{ inputLength }}/2000
        </div>
        <textarea v-model="inputMessage" placeholder="请输入您的问题（按 Enter 发送，Shift + Enter 换行，Ctrl + Enter 强制发送）..."
          :disabled="isLoading" @keydown="handleKeyPress" rows="1" :class="{ 'error': inputLength > 2000 }"></textarea>
        <div class="input-actions">
          <n-button type="primary" size="large" @click="sendMessage" :loading="isLoading" :disabled="!isInputValid"
            class="send-button">
            {{ isLoading ? '思考中...' : '发送' }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.chat-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e1e5eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.chat-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.status-dot.connected {
  background: #52c41a;
  animation: pulse 2s infinite;
}

.status-dot.connecting {
  background: #faad14;
  animation: pulse 1.5s infinite;
}

.status-dot.disconnected {
  background: #ff4d4f;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.chat-content-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.chat-content {
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 20px;
}

/* 自定义滚动条 */
.chat-content::-webkit-scrollbar {
  width: 6px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.message-item:nth-child(odd) {
  animation-delay: 0.05s;
}

.message-item:nth-child(even) {
  animation-delay: 0.1s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-content {
  flex: 1;
  max-width: calc(100% - 60px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-role {
  font-weight: 600;
  color: #2c3e50;
}

.message-time {
  font-size: 12px;
  color: #95a5a6;
}

.message-text {
  background: white;
  padding: 16px;
  border-radius: 12px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.message-text:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.message-user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-top-right-radius: 4px;
}

.message-assistant .message-text {
  border-top-left-radius: 4px;
}

.message-text :deep(*) {
  margin-top: 0;
  margin-bottom: 0.75em;
}

.message-text :deep(*:last-child) {
  margin-bottom: 0;
}

/* 代码块样式 */
.message-text :deep(pre) {
  background: #2d2d2d;
  color: #ccc;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-text :deep(code) {
  background: #f1f1f1;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}

.message-user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
}

.typing-text {
  color: #666;
  font-size: 14px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.input-area {
  background: white;
  border-top: 1px solid #e1e5eb;
  padding: 16px 24px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.input-wrapper {
  position: relative;
}

.input-limit {
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 12px;
  color: #95a5a6;
  transition: color 0.3s;
}

.input-limit.warning {
  color: #faad14;
}

.input-limit.error {
  color: #ff4d4f;
}

textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s;
  outline: none;
  box-sizing: border-box;
  min-height: 48px;
  max-height: 150px;
  overflow-y: auto;
}

textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

textarea.error {
  border-color: #ff4d4f;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.send-button {
  min-width: 100px;
}

:deep(.n-button) {
  transition: all 0.3s;
}

:deep(.n-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.n-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.n-button--primary:disabled) {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }

  .chat-header h2 {
    font-size: 18px;
  }

  .chat-content-wrapper {
    padding: 16px;
  }

  .message-content {
    max-width: calc(100% - 50px);
  }

  .input-area {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 8px;
  }

  .connection-status {
    font-size: 12px;
    padding: 4px 8px;
  }

  .message-text {
    padding: 12px;
  }
}
</style>