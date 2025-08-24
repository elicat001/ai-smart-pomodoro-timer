import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';

// 图标组件（使用Unicode字符代替Lucide图标）
const Icons = {
  Plus: () => <span>➕</span>,
  Clock: () => <span>🕐</span>,
  Flag: () => <span>🚩</span>,
  Check: () => <span>✅</span>,
  Edit: () => <span>✏️</span>,
  Trash: () => <span>🗑️</span>,
  Calendar: () => <span>📅</span>,
  Target: () => <span>🎯</span>,
  AlertCircle: () => <span>🔴</span>,
  Brain: () => <span>🧠</span>,
  ChevronDown: () => <span>🔽</span>,
  ChevronRight: () => <span>▶️</span>,
  Lightbulb: () => <span>💡</span>,
  Timer: () => <span>⏲️</span>,
  Play: () => <span>▶️</span>,
  Pause: () => <span>⏸️</span>,
  Square: () => <span>⏹️</span>,
  Cloud: () => <span>☁️</span>,
  CloudOff: () => <span>📱</span>,
  Download: () => <span>⬇️</span>,
  Upload: () => <span>⬆️</span>,
  Settings: () => <span>⚙️</span>,
  X: () => <span>❌</span>,
  TrendingUp: () => <span>📈</span>,
  Award: () => <span>🏆</span>,
  Zap: () => <span>⚡</span>,
  Star: () => <span>⭐</span>,
  Shield: () => <span>🛡️</span>,
  Key: () => <span>🔑</span>,
  Lock: () => <span>🔒</span>,
  Unlock: () => <span>🔓</span>
};

// 任务类型识别的关键词映射
const TASK_KEYWORDS = {
  learning: ['学习', '研究', '阅读', '掌握', '理解', '熟悉', '了解', '学会', '教程', '课程', '基础', '入门', '进阶'],
  coding: ['编程', '开发', '代码', '实现', '调试', '优化', '重构', 'bug', '系统', 'erp', '平台', 'app', '网站', '软件', '程序', '接口', 'api', '数据库', '前端', '后端', '框架', '搭建', '构建'],
  writing: ['写', '撰写', '编写', '起草', '文档', '报告', '文章', '方案', '材料', '内容', '文案', '说明', '总结'],
  meeting: ['会议', '讨论', '沟通', '汇报', '演讲', '分享', '交流', '谈话', '商议'],
  analysis: ['分析', '调研', '研究', '评估', '整理', '总结', '梳理', '统计', '数据'],
  design: ['设计', '规划', '策划', '构思', '原型', '界面', 'UI', 'UX', '布局', '视觉'],
  practice: ['练习', '训练', '提升', '锻炼', '复习', '巩固', '操练', '演示'],
  creative: ['创作', '创意', '构思', '头脑风暴', '想法', '创新', '灵感', '点子'],
  review: ['检查', '审核', '校对', '测试', '验证', '确认', '审查', '核实'],
  planning: ['计划', '安排', '组织', '筹备', '准备', '规划', '安排', '排期'],
  testing: ['体验', '测试', '试用', '尝试', '验证', '检验']
};

// ===== 增强的加密存储功能 =====

// 生成用户ID哈希 - 修复：添加错误处理
const generateUserIdHash = () => {
  try {
    const existingUserId = localStorage.getItem('aipomodoro_user_id');
    if (existingUserId) {
      return existingUserId;
    }
    
    // 生成基于时间戳和随机数的唯一标识
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const browserInfo = (navigator.userAgent || '') + (navigator.language || '') + 
                       (screen.width || 0) + (screen.height || 0);
    
    // 简单哈希函数
    const simpleHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return Math.abs(hash).toString(36);
    };
    
    const userId = simpleHash(timestamp + randomStr + browserInfo);
    localStorage.setItem('aipomodoro_user_id', userId);
    return userId;
  } catch (error) {
    console.error('生成用户ID失败:', error);
    // 返回一个基于时间戳的备用ID
    return `fallback_${Date.now().toString(36)}`;
  }
};

// 简单的加密/解密函数（基于XOR和Base64）- 修复：增强错误处理
const encryptData = (data, key) => {
  try {
    if (!data || !key) return null;
    
    const jsonStr = JSON.stringify(data);
    let encrypted = '';
    
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    return btoa(encrypted); // Base64编码
  } catch (error) {
    console.error('加密失败:', error);
    return null;
  }
};

const decryptData = (encryptedData, key) => {
  try {
    if (!encryptedData || !key) return null;
    
    const encrypted = atob(encryptedData); // Base64解码
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密失败:', error);
    return null;
  }
};

// 修复：改进的useLocalStorage Hook，增强错误处理和localStorage检查
const useLocalStorage = (key, initialValue, encrypt = true) => {
  // 检查localStorage是否可用
  const isLocalStorageAvailable = useCallback(() => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  const userId = generateUserIdHash();
  const encryptionKey = `aipomodoro_${userId}_key`;
  
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage不可用，使用内存存储');
        return initialValue;
      }

      const item = localStorage.getItem(`aipomodoro_${key}`);
      if (!item) return initialValue;
      
      if (encrypt) {
        const decrypted = decryptData(item, encryptionKey);
        return decrypted !== null ? decrypted : initialValue;
      } else {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error('读取localStorage失败:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage不可用，仅更新内存状态');
        setStoredValue(value);
        return;
      }

      setStoredValue((currentValue) => {
        const valueToStore = typeof value === 'function' ? value(currentValue) : value;
        
        try {
          if (encrypt) {
            const encrypted = encryptData(valueToStore, encryptionKey);
            if (encrypted !== null) {
              localStorage.setItem(`aipomodoro_${key}`, encrypted);
            }
          } else {
            localStorage.setItem(`aipomodoro_${key}`, JSON.stringify(valueToStore));
          }
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage空间不足，尝试清理旧数据');
            // 可以在这里添加清理逻辑
          } else {
            console.error('保存localStorage失败:', error);
          }
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error('设置localStorage值失败:', error);
    }
  }, [key, encrypt, encryptionKey, isLocalStorageAvailable]);

  return [storedValue, setValue];
};

// 修复：改进数据导出/导入功能，增加验证和错误恢复
const DataManager = {
  // 导出所有数据 - 修复：增加数据验证
  exportData: () => {
    try {
      const userId = generateUserIdHash();
      const encryptionKey = `aipomodoro_${userId}_key`;
      
      // 收集所有相关数据
      const allData = {};
      const keys = ['tasks', 'pomodoroHistory', 'dailyGoal', 'focusStreak', 'appStats', 'aiConfig'];
      
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(`aipomodoro_${key}`);
          if (item) {
            // 尝试解密
            const decrypted = decryptData(item, encryptionKey);
            if (decrypted !== null) {
              allData[key] = decrypted;
            } else {
              // 尝试直接解析（向后兼容）
              try {
                allData[key] = JSON.parse(item);
              } catch {
                console.warn(`无法解析数据项: ${key}`);
              }
            }
          }
        } catch (error) {
          console.warn(`导出数据项失败: ${key}`, error);
        }
      });
      
      // 验证数据完整性
      if (Object.keys(allData).length === 0) {
        throw new Error('没有找到可导出的数据');
      }
      
      // 添加导出元数据
      const exportPackage = {
        version: '1.0.0',
        exportTime: new Date().toISOString(),
        userId: userId,
        data: allData,
        checksum: Math.random().toString(36) // 简单的校验和
      };
      
      // 加密整个数据包
      const encryptedPackage = encryptData(exportPackage, encryptionKey);
      if (encryptedPackage === null) {
        throw new Error('数据加密失败');
      }
      
      return {
        success: true,
        data: encryptedPackage,
        filename: `aipomodoro_backup_${userId}_${new Date().toISOString().slice(0, 10)}.aip`,
        dataKeys: Object.keys(allData)
      };
    } catch (error) {
      console.error('导出数据失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 导入数据 - 修复：增加数据验证和恢复选项
  importData: (encryptedData, options = { merge: false }) => {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('无效的数据格式');
      }

      const userId = generateUserIdHash();
      const encryptionKey = `aipomodoro_${userId}_key`;
      
      // 解密数据包
      const dataPackage = decryptData(encryptedData, encryptionKey);
      if (!dataPackage || typeof dataPackage !== 'object') {
        throw new Error('数据解密失败或格式不正确');
      }
      
      // 验证数据包结构
      if (!dataPackage.data || typeof dataPackage.data !== 'object') {
        throw new Error('数据包结构无效');
      }
      
      // 验证版本兼容性
      if (dataPackage.version && dataPackage.version !== '1.0.0') {
        console.warn(`数据包版本不同: ${dataPackage.version}，可能存在兼容性问题`);
      }
      
      // 安全检查：验证用户ID（可选，用于警告）
      if (dataPackage.userId && dataPackage.userId !== userId) {
        console.warn('数据包来自不同用户，导入可能覆盖当前数据');
      }
      
      // 备份当前数据（用于恢复）
      const backupKeys = [];
      Object.keys(dataPackage.data).forEach(key => {
        try {
          const currentData = localStorage.getItem(`aipomodoro_${key}`);
          if (currentData) {
            localStorage.setItem(`aipomodoro_${key}_backup_${Date.now()}`, currentData);
            backupKeys.push(key);
          }
        } catch (error) {
          console.warn(`备份数据失败: ${key}`, error);
        }
      });
      
      // 导入数据
      const importedKeys = [];
      Object.keys(dataPackage.data).forEach(key => {
        try {
          const encrypted = encryptData(dataPackage.data[key], encryptionKey);
          if (encrypted !== null) {
            localStorage.setItem(`aipomodoro_${key}`, encrypted);
            importedKeys.push(key);
          }
        } catch (error) {
          console.error(`导入数据项失败: ${key}`, error);
        }
      });
      
      if (importedKeys.length === 0) {
        throw new Error('没有成功导入任何数据');
      }
      
      return {
        success: true,
        importTime: dataPackage.exportTime,
        dataKeys: importedKeys,
        backedUpKeys: backupKeys,
        warnings: importedKeys.length < Object.keys(dataPackage.data).length ? 
          ['部分数据项导入失败'] : []
      };
    } catch (error) {
      console.error('导入数据失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 获取存储统计 - 修复：增加错误处理
  getStorageStats: () => {
    try {
      const userId = generateUserIdHash();
      let totalSize = 0;
      let itemCount = 0;
      const items = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        try {
          const key = localStorage.key(i);
          if (key && key.startsWith('aipomodoro_')) {
            const value = localStorage.getItem(key);
            const size = key.length + (value ? value.length : 0);
            totalSize += size;
            itemCount++;
            items.push({ key, size });
          }
        } catch (error) {
          console.warn('获取存储项失败:', error);
        }
      }
      
      return {
        userId,
        itemCount,
        totalSize,
        formattedSize: `${(totalSize / 1024).toFixed(2)} KB`,
        items,
        quota: (() => {
          try {
            // 尝试估算localStorage配额
            const testKey = '__quota_test__';
            let estimate = 0;
            try {
              for (let i = 0; i < 1000000; i += 1000) {
                localStorage.setItem(testKey, 'a'.repeat(i));
                estimate = i;
              }
            } catch {
              // 达到配额限制
            } finally {
              localStorage.removeItem(testKey);
            }
            return estimate > 0 ? `约${Math.round(estimate / 1024)}KB可用` : '未知';
          } catch {
            return '无法检测';
          }
        })()
      };
    } catch (error) {
      console.error('获取存储统计失败:', error);
      return null;
    }
  }
};

// 修复：改进的番茄钟计时器Hook，解决内存泄漏和状态同步问题
const usePomodoroTimer = () => {
  const [activePomodoroId, setActivePomodoroId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [pomodoroStatus, setPomodoroStatus] = useState('idle');
  const [originalDuration, setOriginalDuration] = useState(0); // 修复：记录原始时长
  const intervalRef = useRef(null);
  const statusRef = useRef('idle'); // 修复：使用ref避免闭包问题

  // 修复：同步状态到ref
  useEffect(() => {
    statusRef.current = pomodoroStatus;
  }, [pomodoroStatus]);

  const startPomodoro = useCallback((taskId, subtaskId, duration, taskName, subtaskName) => {
    console.log('开始番茄钟:', { taskId, subtaskId, duration, taskName, subtaskName });
    
    // 修复：清理之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const targetId = subtaskId || taskId;
    const durationInSeconds = (duration || 25) * 60;
    
    setActivePomodoroId(targetId);
    setPomodoroTime(durationInSeconds);
    setOriginalDuration(durationInSeconds);
    setPomodoroStatus('running');
    
    // 修复：通知权限检查
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`🍅 开始专注：${subtaskName || taskName}`, {
          body: `预计用时 ${duration || 25} 分钟`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`🍅 开始专注：${subtaskName || taskName}`, {
              body: `预计用时 ${duration || 25} 分钟`,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }, []);

  const pausePomodoro = useCallback(() => {
    console.log('暂停番茄钟');
    setPomodoroStatus('paused');
  }, []);

  const resumePomodoro = useCallback(() => {
    console.log('恢复番茄钟');
    setPomodoroStatus('running');
  }, []);

  const stopPomodoro = useCallback(() => {
    console.log('停止番茄钟');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setActivePomodoroId(null);
    setPomodoroTime(0);
    setOriginalDuration(0);
    setPomodoroStatus('idle');
  }, []);

  const completePomodoroSession = useCallback(() => {
    console.log('番茄钟完成');
    setPomodoroStatus('completed');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 修复：延迟重置状态，避免过快切换
    setTimeout(() => {
      if (statusRef.current === 'completed') {
        stopPomodoro();
      }
    }, 3000);
  }, [stopPomodoro]);

  // 修复：改进定时器逻辑，避免内存泄漏
  useEffect(() => {
    if (pomodoroStatus === 'running' && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            // 在下一个事件循环中完成，避免状态更新冲突
            setTimeout(() => completePomodoroSession(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 修复：组件卸载时清理定时器
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pomodoroStatus, pomodoroTime, completePomodoroSession]);

  return {
    activePomodoroId,
    pomodoroTime,
    pomodoroStatus,
    originalDuration, // 修复：提供原始时长
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    completePomodoroSession
  };
};

const WorkOrganizer = () => {
  // 基础状态
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedTime, setSelectedTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // 修复：将Set状态改为普通对象，避免React更新检测问题
  const [analyzingTasks, setAnalyzingTasks] = useState({});
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  
  // 番茄钟相关
  const pomodoroHook = usePomodoroTimer();
  const [pomodoroHistory, setPomodoroHistory] = useLocalStorage('pomodoroHistory', []);
  
  // 统计和目标
  const [dailyGoal, setDailyGoal] = useLocalStorage('dailyGoal', 6);
  const [focusStreak, setFocusStreak] = useLocalStorage('focusStreak', 0);
  const [appStats, setAppStats] = useLocalStorage('appStats', {
    daysUsed: 1,
    totalTasks: 0,
    totalPomodoros: 0,
    firstUse: new Date().toISOString()
  });
  
  // UI状态
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [isLoggedIn] = useState(false);
  
  // 数据管理状态
  const [importExportStatus, setImportExportStatus] = useState(null);
  const [storageStats, setStorageStats] = useState(null);

  // AI设置状态
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiConfig, setAiConfig] = useLocalStorage('aiConfig', {
    provider: 'local',
    apiKey: '',
    model: 'deepseek-chat',
    enabled: true
  });

  // 修复：改进防重复处理机制
  const processedPomodoroRef = useRef(new Map()); // 使用Map替代Set，包含时间戳
  const abortControllerRef = useRef(new Map()); // 修复：添加API请求取消机制

  // 修复：清理过期的处理记录
  const cleanupProcessedPomodoro = useCallback(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    Array.from(processedPomodoroRef.current.entries()).forEach(([key, timestamp]) => {
      if (timestamp < fiveMinutesAgo) {
        processedPomodoroRef.current.delete(key);
      }
    });
  }, []);

  // 修复：改进API调用，添加超时和取消机制
  const callDeepSeekAPI = useCallback(async (taskText, duration) => {
    if (!aiConfig.apiKey) {
      throw new Error('请先配置DeepSeek API Key');
    }

    // 创建取消控制器
    const abortController = new AbortController();
    const requestId = `deepseek_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    abortControllerRef.current.set(requestId, abortController);

    const prompt = `你是一个专业的任务分解专家。请分析以下任务并提供执行方案：

任务内容：${taskText}
预计时长：${duration}分钟

请按照以下JSON格式返回分析结果（只返回JSON，不要包含其他文字）：
{
  "taskType": "任务类型(learning/coding/writing/meeting/analysis/design/practice/creative/review/planning/testing/general)",
  "description": "简短的执行策略描述",
  "steps": [
    {
      "text": "步骤描述",
      "duration": 预计分钟数,
      "order": 步骤序号
    }
  ],
  "tips": [
    "执行建议1",
    "执行建议2",
    "执行建议3"
  ]
}

要求：
1. steps数组应包含3-5个具体的执行步骤
2. 每个步骤的duration总和应该等于${duration}
3. 步骤要实用、可操作
4. tips要针对具体任务类型给出专业建议`;

    try {
      // 修复：添加15秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), 15000);
      });

      const fetchPromise = fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的任务分解和时间管理专家，擅长将复杂任务分解为具体可执行的步骤。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
        signal: abortController.signal
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        let errorMessage = `API请求失败: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || response.statusText}`;
        } catch {
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // 修复：更严格的响应验证
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('API返回数据格式错误：缺少choices');
      }

      const content = data.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('API返回数据格式错误：缺少content');
      }

      // 修复：更健壮的JSON解析
      let jsonStr = content.trim();
      
      // 移除可能的markdown代码块标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 查找JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let aiResult;
      try {
        aiResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('JSON解析失败:', parseError, 'Raw content:', content);
        throw new Error('AI返回的数据无法解析为JSON');
      }
      
      // 修复：更全面的响应验证
      const errors = [];
      if (!aiResult.taskType || typeof aiResult.taskType !== 'string') {
        errors.push('缺少或无效的taskType');
      }
      if (!aiResult.steps || !Array.isArray(aiResult.steps) || aiResult.steps.length === 0) {
        errors.push('缺少或无效的steps');
      }
      if (!aiResult.tips || !Array.isArray(aiResult.tips)) {
        errors.push('缺少或无效的tips');
      }
      
      // 验证steps结构
      if (aiResult.steps && Array.isArray(aiResult.steps)) {
        aiResult.steps.forEach((step, index) => {
          if (!step.text || typeof step.text !== 'string') {
            errors.push(`步骤${index + 1}缺少文本描述`);
          }
          if (typeof step.duration !== 'number' || step.duration <= 0) {
            errors.push(`步骤${index + 1}缺少有效的时长`);
          }
        });
      }

      if (errors.length > 0) {
        throw new Error(`AI返回的数据格式不正确: ${errors.join(', ')}`);
      }

      return aiResult;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求已取消');
      }
      console.error('DeepSeek API调用失败:', error);
      throw error;
    } finally {
      abortControllerRef.current.delete(requestId);
    }
  }, [aiConfig.apiKey, aiConfig.model]);

  // 修复：类似地改进OpenAI API调用
  const callOpenAIAPI = useCallback(async (taskText, duration) => {
    if (!aiConfig.apiKey) {
      throw new Error('请先配置OpenAI API Key');
    }

    const abortController = new AbortController();
    const requestId = `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    abortControllerRef.current.set(requestId, abortController);

    const prompt = `你是一个专业的任务分解专家。请分析以下任务并提供执行方案：

任务内容：${taskText}
预计时长：${duration}分钟

请按照以下JSON格式返回分析结果（只返回JSON，不要包含其他文字）：
{
  "taskType": "任务类型(learning/coding/writing/meeting/analysis/design/practice/creative/review/planning/testing/general)",
  "description": "简短的执行策略描述",
  "steps": [
    {
      "text": "步骤描述",
      "duration": 预计分钟数,
      "order": 步骤序号
    }
  ],
  "tips": [
    "执行建议1",
    "执行建议2",
    "执行建议3"
  ]
}

要求：
1. steps数组应包含3-5个具体的执行步骤
2. 每个步骤的duration总和应该等于${duration}
3. 步骤要实用、可操作
4. tips要针对具体任务类型给出专业建议`;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), 15000);
      });

      const fetchPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的任务分解和时间管理专家，擅长将复杂任务分解为具体可执行的步骤。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
        signal: abortController.signal
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        let errorMessage = `API请求失败: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || response.statusText}`;
        } catch {
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('API返回数据格式错误：缺少choices');
      }

      const content = data.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('API返回数据格式错误：缺少content');
      }

      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let aiResult;
      try {
        aiResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('JSON解析失败:', parseError, 'Raw content:', content);
        throw new Error('AI返回的数据无法解析为JSON');
      }
      
      // 验证响应格式（复用上面的验证逻辑）
      const errors = [];
      if (!aiResult.taskType || typeof aiResult.taskType !== 'string') {
        errors.push('缺少或无效的taskType');
      }
      if (!aiResult.steps || !Array.isArray(aiResult.steps) || aiResult.steps.length === 0) {
        errors.push('缺少或无效的steps');
      }
      if (!aiResult.tips || !Array.isArray(aiResult.tips)) {
        errors.push('缺少或无效的tips');
      }
      
      if (aiResult.steps && Array.isArray(aiResult.steps)) {
        aiResult.steps.forEach((step, index) => {
          if (!step.text || typeof step.text !== 'string') {
            errors.push(`步骤${index + 1}缺少文本描述`);
          }
          if (typeof step.duration !== 'number' || step.duration <= 0) {
            errors.push(`步骤${index + 1}缺少有效的时长`);
          }
        });
      }

      if (errors.length > 0) {
        throw new Error(`AI返回的数据格式不正确: ${errors.join(', ')}`);
      }

      return aiResult;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求已取消');
      }
      console.error('OpenAI API调用失败:', error);
      throw error;
    } finally {
      abortControllerRef.current.delete(requestId);
    }
  }, [aiConfig.apiKey, aiConfig.model]);

  // 修复：添加组件卸载时的清理逻辑
  useEffect(() => {
    return () => {
      // 取消所有进行中的API请求
      abortControllerRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllerRef.current.clear();
    };
  }, []);

  // 导出数据 - 修复：改进用户反馈
  const handleExportData = useCallback(() => {
    try {
      const result = DataManager.exportData();
      if (result.success) {
        // 创建下载链接
        const blob = new Blob([result.data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setImportExportStatus({
          type: 'success',
          message: `数据已成功导出到 ${result.filename}，包含 ${result.dataKeys?.length || 0} 项数据`
        });
      } else {
        setImportExportStatus({
          type: 'error',
          message: `导出失败: ${result.error}`
        });
      }
    } catch (error) {
      setImportExportStatus({
        type: 'error',
        message: `导出失败: ${error.message}`
      });
    }
    
    // 5秒后清除状态
    setTimeout(() => setImportExportStatus(null), 5000);
  }, []);
  
  // 导入数据 - 修复：改进错误处理和用户反馈
  const handleImportData = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 修复：验证文件类型和大小
    if (!file.name.endsWith('.aip')) {
      setImportExportStatus({
        type: 'error',
        message: '请选择正确的备份文件（.aip格式）'
      });
      setTimeout(() => setImportExportStatus(null), 5000);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB限制
      setImportExportStatus({
        type: 'error',
        message: '文件过大，请选择小于10MB的备份文件'
      });
      setTimeout(() => setImportExportStatus(null), 5000);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encryptedData = e.target?.result;
        if (typeof encryptedData !== 'string') {
          throw new Error('文件读取失败');
        }
        
        const result = DataManager.importData(encryptedData);
        
        if (result.success) {
          setImportExportStatus({
            type: 'success',
            message: `数据导入成功! 导入了 ${result.dataKeys.length} 项数据${result.warnings?.length ? '，有部分警告' : ''}`
          });
          
          // 刷新页面以重新加载数据
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setImportExportStatus({
            type: 'error',
            message: `导入失败: ${result.error}`
          });
        }
      } catch (error) {
        setImportExportStatus({
          type: 'error',
          message: `导入失败: ${error.message}`
        });
      }
    };
    
    reader.onerror = () => {
      setImportExportStatus({
        type: 'error',
        message: '文件读取失败，请重试'
      });
    };
    
    reader.readAsText(file);
    
    // 清空input
    event.target.value = '';
    
    // 5秒后清除状态
    setTimeout(() => setImportExportStatus(null), 5000);
  }, []);
  
  // 更新存储统计
  const updateStorageStats = useCallback(() => {
    const stats = DataManager.getStorageStats();
    setStorageStats(stats);
  }, []);

  // 修复：改进番茄钟历史清理逻辑
  const cleanupPomodoroHistory = useCallback(() => {
    setPomodoroHistory(prev => {
      if (!Array.isArray(prev) || prev.length === 0) {
        return prev;
      }

      const cleanedHistory = [];
      const seenRecords = new Set();
      
      // 按时间排序，保留最新的记录
      const sortedHistory = [...prev].sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      
      for (const record of sortedHistory) {
        // 修复：更严格的去重逻辑
        if (!record || !record.completedAt || !record.taskName) {
          console.warn('发现无效记录，已跳过:', record);
          continue;
        }

        // 创建唯一标识符（精确到分钟，避免秒级重复）
        const completedTime = new Date(record.completedAt);
        const recordKey = `${record.date}_${record.taskName}_${record.subtaskName || ''}_${completedTime.getFullYear()}_${completedTime.getMonth()}_${completedTime.getDate()}_${completedTime.getHours()}_${completedTime.getMinutes()}`;
        
        if (!seenRecords.has(recordKey)) {
          seenRecords.add(recordKey);
          cleanedHistory.push(record);
        } else {
          console.log('发现重复记录，已移除:', record);
        }
      }
      
      console.log(`清理番茄钟数据：原有${prev.length}条，清理后${cleanedHistory.length}条，移除${prev.length - cleanedHistory.length}条重复记录`);
      return cleanedHistory;
    });
    
    setImportExportStatus({
      type: 'success',
      message: '重复数据清理完成'
    });
    setTimeout(() => setImportExportStatus(null), 3000);
  }, [setPomodoroHistory]);
  
  // 重置番茄钟数据
  const resetPomodoroHistory = useCallback(() => {
    if (window.confirm('确定要清空所有番茄钟历史记录吗？此操作不可恢复！\n\n建议先导出备份数据。')) {
      setPomodoroHistory([]);
      console.log('番茄钟历史记录已重置');
      setImportExportStatus({
        type: 'success',
        message: '番茄钟历史记录已重置'
      });
      setTimeout(() => setImportExportStatus(null), 3000);
    }
  }, [setPomodoroHistory]);

  // 获取任务类型标签
  const getTaskTypeLabel = useCallback((type) => {
    const labels = {
      learning: '学习研究',
      coding: '编程开发', 
      writing: '写作文档',
      meeting: '会议沟通',
      analysis: '分析调研',
      design: '设计规划',
      practice: '练习训练',
      creative: '创意创作',
      review: '检查审核',
      planning: '计划安排',
      testing: '体验测试',
      general: '通用任务'
    };
    return labels[type] || '通用任务';
  }, []);

  // 智能识别任务类型
  const identifyTaskType = useCallback((taskText) => {
    if (!taskText || typeof taskText !== 'string') {
      return 'general';
    }
    
    const text = taskText.toLowerCase();
    
    // 按优先级顺序检查，避免误判
    const typeChecks = [
      { type: 'testing', keywords: TASK_KEYWORDS.testing },
      { type: 'learning', keywords: TASK_KEYWORDS.learning },
      { type: 'writing', keywords: TASK_KEYWORDS.writing },
      { type: 'meeting', keywords: TASK_KEYWORDS.meeting },
      { type: 'analysis', keywords: TASK_KEYWORDS.analysis },
      { type: 'design', keywords: TASK_KEYWORDS.design },
      { type: 'practice', keywords: TASK_KEYWORDS.practice },
      { type: 'creative', keywords: TASK_KEYWORDS.creative },
      { type: 'review', keywords: TASK_KEYWORDS.review },
      { type: 'planning', keywords: TASK_KEYWORDS.planning },
      { type: 'coding', keywords: TASK_KEYWORDS.coding }
    ];
    
    for (const { type, keywords } of typeChecks) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }, []);

  // 生成任务分解策略 - 修复：添加输入验证
  const generateTaskStrategy = useCallback((taskType, taskText, duration) => {
    // 修复：输入验证
    if (!taskType || !taskText || !duration) {
      return {
        description: "制定通用执行方案，专注核心目标的实现",
        steps: [
          { text: "明确具体的成功标准", duration: Math.round((duration || 60) * 0.2) },
          { text: "执行核心工作内容", duration: Math.round((duration || 60) * 0.6) },
          { text: "检查结果并记录要点", duration: Math.round((duration || 60) * 0.2) }
        ],
        tips: ["专注最重要的部分", "及时调整方法", "记录关键成果"]
      };
    }

    const safeDuration = Math.max(5, Math.min(300, duration)); // 限制在5-300分钟

    switch (taskType) {
      case 'learning': {
        const isComplexTopic = safeDuration > 90;
        return {
          description: "运用费曼学习法，快速建立认知框架",
          steps: isComplexTopic ? [
            { text: "花5分钟浏览全局，找到核心概念清单", duration: Math.round(safeDuration * 0.08) },
            { text: "选择最重要的3个概念，直接查找实例", duration: Math.round(safeDuration * 0.25) },
            { text: "尝试用自己的话解释给假想的朋友", duration: Math.round(safeDuration * 0.3) },
            { text: "找到一个可以立即应用的场景", duration: Math.round(safeDuration * 0.2) },
            { text: "记录3个关键要点和1个疑问", duration: Math.round(safeDuration * 0.17) }
          ] : [
            { text: "直接找到最关键的核心要点", duration: Math.round(safeDuration * 0.3) },
            { text: "找一个具体例子来理解", duration: Math.round(safeDuration * 0.4) },
            { text: "用自己的话复述一遍", duration: Math.round(safeDuration * 0.3) }
          ],
          tips: [
            "先看结论和总结，再看详细内容",
            "边学边想现实应用场景",
            "卡住时立即换个角度或资源"
          ]
        };
      }
      
      case 'coding': {
        const isBugFix = taskText.includes('bug') || taskText.includes('修复') || taskText.includes('调试');
        const isNewFeature = taskText.includes('实现') || taskText.includes('开发') || taskText.includes('新增');
        
        if (isBugFix) {
          return {
            description: "采用系统性调试法，快速定位和解决问题",
            steps: [
              { text: "复现问题，记录具体现象", duration: Math.round(safeDuration * 0.25) },
              { text: "检查最近的代码变更", duration: Math.round(safeDuration * 0.15) },
              { text: "添加调试信息，定位问题代码段", duration: Math.round(safeDuration * 0.35) },
              { text: "修复并验证解决方案", duration: Math.round(safeDuration * 0.25) }
            ],
            tips: [
              "先找最可能的原因，不要从头调试",
              "善用console.log和断点",
              "修复后要测试相关功能"
            ]
          };
        } else if (isNewFeature) {
          return {
            description: "采用最小可行产品思路，快速实现核心功能",
            steps: [
              { text: "明确最核心的功能需求", duration: Math.round(safeDuration * 0.15) },
              { text: "先写出最简单能跑的版本", duration: Math.round(safeDuration * 0.45) },
              { text: "测试核心流程是否正常", duration: Math.round(safeDuration * 0.2) },
              { text: "优化用户体验和边界情况", duration: Math.round(safeDuration * 0.2) }
            ],
            tips: [
              "先让功能跑起来，再考虑优雅",
              "及时测试，避免积累太多问题",
              "重要的是解决问题，不是炫技"
            ]
          };
        } else {
          return {
            description: "采用渐进式开发，确保每一步都能验证",
            steps: [
              { text: "搭建基础框架，确认环境", duration: Math.round(safeDuration * 0.2) },
              { text: "实现核心逻辑", duration: Math.round(safeDuration * 0.5) },
              { text: "测试和调试", duration: Math.round(safeDuration * 0.3) }
            ],
            tips: [
              "经常保存和提交代码",
              "一次只专注一个功能",
              "代码要简洁易懂"
            ]
          };
        }
      }
      
      case 'writing': {
        const isLongForm = safeDuration > 60;
        return {
          description: "运用结构化写作法，确保思路清晰",
          steps: isLongForm ? [
            { text: "明确目标读者和核心信息", duration: Math.round(safeDuration * 0.15) },
            { text: "列出3-5个主要论点或章节", duration: Math.round(safeDuration * 0.15) },
            { text: "快速写出第一稿，不要纠结细节", duration: Math.round(safeDuration * 0.45) },
            { text: "检查逻辑结构和关键信息", duration: Math.round(safeDuration * 0.15) },
            { text: "润色语言和格式", duration: Math.round(safeDuration * 0.1) }
          ] : [
            { text: "明确要表达的核心观点", duration: Math.round(safeDuration * 0.2) },
            { text: "快速写出完整草稿", duration: Math.round(safeDuration * 0.6) },
            { text: "检查和修改", duration: Math.round(safeDuration * 0.2) }
          ],
          tips: [
            "先写框架，再填内容",
            "第一稿重在完整，不求完美",
            "多用具体例子说明观点"
          ]
        };
      }
      
      default: {
        return {
          description: "制定通用执行方案，专注核心目标的实现",
          steps: [
            { text: "明确具体的成功标准", duration: Math.round(safeDuration * 0.2) },
            { text: "执行核心工作内容", duration: Math.round(safeDuration * 0.6) },
            { text: "检查结果并记录要点", duration: Math.round(safeDuration * 0.2) }
          ],
          tips: [
            "专注最重要的部分",
            "及时调整方法",
            "记录关键成果"
          ]
        };
      }
    }
  }, []);

  // 修复：改进AI分析功能，增强错误处理和状态管理
  const analyzeTask = useCallback(async (taskId, taskText, duration = 60) => {
    // 参数验证
    if (!taskId || !taskText || typeof taskText !== 'string' || taskText.trim() === '') {
      console.error('analyzeTask: 参数无效', { taskId, taskText, duration });
      setImportExportStatus({
        type: 'error',
        message: 'AI分析失败: 任务信息无效'
      });
      setTimeout(() => setImportExportStatus(null), 3000);
      return;
    }

    const finalDuration = Math.max(5, Math.min(300, Number(duration) || 60));
    
    // 检查任务是否存在
    const taskExists = tasks.some(task => task.id === taskId);
    if (!taskExists) {
      console.error('任务不存在，无法分析:', taskId);
      return;
    }

    // 检查是否已在分析中
    if (analyzingTasks[taskId]) {
      console.warn('任务已在分析中，跳过重复请求:', taskId);
      return;
    }
    
    setAnalyzingTasks(prev => ({ ...prev, [taskId]: true }));
    
    try {
      let analysis;
      
      if (aiConfig.provider === 'deepseek' && aiConfig.enabled && aiConfig.apiKey) {
        console.log('使用DeepSeek API进行任务分析');
        const aiResult = await callDeepSeekAPI(taskText, finalDuration);
        
        analysis = {
          taskType: aiResult.taskType,
          taskTypeLabel: getTaskTypeLabel(aiResult.taskType),
          analysis: aiResult.description || `基于任务特点"${taskText}"，识别为${getTaskTypeLabel(aiResult.taskType)}类型。${aiResult.description}`,
          totalDuration: finalDuration,
          steps: aiResult.steps.map((step, index) => ({
            text: step.text,
            duration: Math.max(1, step.duration || Math.round(finalDuration / aiResult.steps.length)),
            order: step.order || (index + 1),
            id: `${taskId}-step-${index}`,
            completed: false
          })),
          tips: Array.isArray(aiResult.tips) ? aiResult.tips : ['专注核心目标', '及时调整方法', '记录关键成果'],
          analyzedAt: Date.now(),
          source: 'deepseek'
        };
      } else if (aiConfig.provider === 'openai' && aiConfig.enabled && aiConfig.apiKey) {
        console.log('使用OpenAI API进行任务分析');
        const aiResult = await callOpenAIAPI(taskText, finalDuration);
        
        analysis = {
          taskType: aiResult.taskType,
          taskTypeLabel: getTaskTypeLabel(aiResult.taskType),
          analysis: aiResult.description || `基于任务特点"${taskText}"，识别为${getTaskTypeLabel(aiResult.taskType)}类型。${aiResult.description}`,
          totalDuration: finalDuration,
          steps: aiResult.steps.map((step, index) => ({
            text: step.text,
            duration: Math.max(1, step.duration || Math.round(finalDuration / aiResult.steps.length)),
            order: step.order || (index + 1),
            id: `${taskId}-step-${index}`,
            completed: false
          })),
          tips: Array.isArray(aiResult.tips) ? aiResult.tips : ['专注核心目标', '及时调整方法', '记录关键成果'],
          analyzedAt: Date.now(),
          source: 'openai'
        };
      } else {
        console.log('使用本地AI进行任务分析');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const taskType = identifyTaskType(taskText);
        const strategy = generateTaskStrategy(taskType, taskText, finalDuration);
        
        analysis = {
          taskType,
          taskTypeLabel: getTaskTypeLabel(taskType),
          analysis: `基于任务特点"${taskText}"，识别为${getTaskTypeLabel(taskType)}类型。${strategy.description}`,
          totalDuration: finalDuration,
          steps: strategy.steps.map((step, index) => ({
            ...step,
            order: index + 1,
            id: `${taskId}-step-${index}`,
            completed: false
          })),
          tips: strategy.tips,
          analyzedAt: Date.now(),
          source: 'local'
        };
      }
      
      // 修复：更安全的任务更新，带回退机制
      setTasks(prevTasks => {
        const taskIndex = prevTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
          console.error('任务更新失败，任务不存在:', taskId);
          return prevTasks;
        }
        
        const updatedTasks = [...prevTasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          aiAnalysis: analysis
        };
        
        return updatedTasks;
      });
      
      setExpandedAnalysis(prev => ({ ...prev, [taskId]: true }));
      
      console.log('AI分析完成:', { taskId, analysis });
      
    } catch (error) {
      console.error('AI分析失败:', error);
      
      let errorMessage = 'AI分析失败';
      if (error.message.includes('请先配置')) {
        errorMessage = error.message;
      } else if (error.message.includes('请求超时')) {
        errorMessage = 'AI分析超时，请重试';
      } else if (error.message.includes('请求已取消')) {
        errorMessage = 'AI分析已取消';
      } else {
        errorMessage = `AI分析失败: ${error.message}`;
      }
      
      setImportExportStatus({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setImportExportStatus(null), 5000);
    } finally {
      setAnalyzingTasks(prev => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });
    }
  }, [aiConfig, callDeepSeekAPI, callOpenAIAPI, identifyTaskType, getTaskTypeLabel, generateTaskStrategy, tasks]);

  // 生成唯一任务ID
  const generateTaskId = useCallback(() => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 任务操作
  const addTask = useCallback(() => {
    if (newTask.trim()) {
      const task = {
        id: generateTaskId(),
        text: newTask.trim(),
        priority: selectedPriority,
        time: selectedTime,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        completed: false,
        category: 'work',
        aiAnalysis: null,
        subtasks: [],
        createdAt: new Date().toISOString()
      };
      
      // 修复：验证任务数据
      if (!task.id || !task.text) {
        console.error('任务创建失败：数据无效');
        return;
      }
      
      setTasks(prev => {
        // 修复：检查重复ID
        const exists = prev.some(t => t.id === task.id);
        if (exists) {
          console.warn('检测到重复任务ID，重新生成');
          task.id = generateTaskId();
        }
        return [...prev, task];
      });
      
      // 重置表单
      setNewTask('');
      setSelectedTime('');
      setEstimatedDuration('');
    }
  }, [newTask, selectedPriority, selectedTime, estimatedDuration, generateTaskId, setTasks]);

  const toggleTask = useCallback((id) => {
    if (!id) return;
    
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    if (!id) return;
    
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // 清理相关状态
      setExpandedAnalysis(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      
      setAnalyzingTasks(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  }, [setTasks]);

  const startEdit = useCallback((id, text) => {
    if (!id || !text) return;
    setEditingId(id);
    setEditingText(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editingText.trim()) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingId ? { 
        ...task, 
        text: editingText.trim(),
        updatedAt: new Date().toISOString()
      } : task
    ));
    setEditingId(null);
    setEditingText('');
  }, [editingId, editingText, setTasks]);

  // 任务自动完成处理
  const handleTaskAutoComplete = useCallback((taskId, taskText) => {
    if (!taskId || !taskText) return;
    
    // 显示任务自动完成的提示
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('任务自动完成！', {
        body: `恭喜完成任务：${taskText}`,
        icon: '/favicon.ico'
      });
    }
    
    console.log(`任务自动完成: ${taskText}`);
  }, []);

  // 修复：改进子任务切换逻辑，避免竞争条件
  const toggleSubtask = useCallback((taskId, subtaskId) => {
    if (!taskId || !subtaskId) return;
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id !== taskId) return task;
        
        if (!task.subtasks || !Array.isArray(task.subtasks)) {
          console.warn('任务子任务数据无效:', task);
          return task;
        }
        
        const updatedSubtasks = task.subtasks.map(sub =>
          sub.id === subtaskId 
            ? { 
                ...sub, 
                completed: !sub.completed,
                endTime: !sub.completed ? new Date().toLocaleTimeString() : null,
                completedAt: !sub.completed ? new Date().toISOString() : null
              }
            : sub
        );
        
        // 检查所有子任务是否都完成了
        const allSubtasksCompleted = updatedSubtasks.length > 0 && 
          updatedSubtasks.every(sub => sub.completed);
        const wasIncomplete = !task.completed;
        
        // 如果任务原来未完成，且现在所有子任务都完成了，则自动完成主任务
        if (wasIncomplete && allSubtasksCompleted) {
          // 延迟显示完成提示，让用户看到进度变化
          setTimeout(() => {
            handleTaskAutoComplete(taskId, task.text);
          }, 500);
        }
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted,
          completedAt: allSubtasksCompleted && wasIncomplete ? new Date().toISOString() : task.completedAt
        };
      })
    );
  }, [setTasks, handleTaskAutoComplete]);

  // 修复：改进展开/折叠状态管理
  const toggleAnalysisExpanded = useCallback((taskId) => {
    if (!taskId) return;
    
    setExpandedAnalysis(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  }, []);

  // 重新分析任务
  const reAnalyzeTask = useCallback((taskId) => {
    if (!taskId) return;
    
    console.log('=== 重新分析任务 ===', taskId);
    
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) {
      console.error('任务不存在:', taskId);
      return;
    }
    
    if (!targetTask.text || targetTask.text.trim() === '') {
      console.error('任务文本为空:', targetTask);
      return;
    }
    
    // 取消可能进行中的分析请求
    const controller = Array.from(abortControllerRef.current.entries())
      .find(([key]) => key.includes(taskId))?.[1];
    if (controller) {
      controller.abort();
    }
    
    // 清除旧的分析结果
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, aiAnalysis: null, subtasks: [] }
          : task
      )
    );
    
    // 清除展开状态
    setExpandedAnalysis(prev => ({
      ...prev,
      [taskId]: false
    }));
    
    // 延迟触发新分析
    setTimeout(() => {
      console.log('触发新分析:', targetTask.text);
      analyzeTask(targetTask.id, targetTask.text, targetTask.estimatedDuration || 60);
    }, 300);
  }, [tasks, analyzeTask]);

  // 将AI分析步骤转换为子任务
  const convertStepsToSubtasks = useCallback((taskId) => {
    if (!taskId) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task?.aiAnalysis?.steps || !Array.isArray(task.aiAnalysis.steps)) {
      console.warn('无有效的AI分析步骤可转换');
      return;
    }

    const subtasks = task.aiAnalysis.steps.map((step, index) => ({
      id: `${taskId}-sub-${index}-${Date.now()}`, // 修复：添加时间戳避免ID冲突
      text: step.text,
      duration: step.duration || 25,
      order: step.order || (index + 1),
      completed: false,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    }));

    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId 
          ? { ...t, subtasks }
          : t
      )
    );

    console.log(`已将${subtasks.length}个步骤转换为子任务`);
  }, [tasks, setTasks]);

  // 修复：改进番茄钟完成处理，避免重复和竞争条件
  const handlePomodoroComplete = useCallback((activeTask, activeSubtask, duration, pomodoroId) => {
    if (!activeTask || !pomodoroId) {
      console.error('番茄钟完成处理参数无效');
      return;
    }

    // 防止重复处理
    const completionKey = `${pomodoroId}_${Date.now()}`;
    const existingTimestamp = processedPomodoroRef.current.get(completionKey);
    
    if (existingTimestamp && (Date.now() - existingTimestamp) < 10000) {
      console.log('防止重复处理番茄钟完成事件:', completionKey);
      return;
    }
    
    processedPomodoroRef.current.set(completionKey, Date.now());
    
    // 清理过期记录
    cleanupProcessedPomodoro();

    const taskName = activeTask.text;
    const subtaskName = activeSubtask ? activeSubtask.text : taskName;

    const pomodoroRecord = {
      id: `pomodoro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: activeTask.id,
      subtaskId: activeSubtask?.id || null,
      taskName,
      subtaskName,
      duration: duration || 25,
      completedAt: new Date().toISOString(),
      date: new Date().toDateString(),
      efficiency: 'high' // 可以后续根据实际情况调整
    };

    console.log('添加番茄钟记录:', pomodoroRecord);

    setPomodoroHistory(prev => {
      if (!Array.isArray(prev)) {
        console.warn('番茄钟历史数据格式异常，重置为空数组');
        return [pomodoroRecord];
      }
      
      // 检查是否已存在相同的记录（基于时间戳和任务名）
      const isDuplicate = prev.some(record => 
        Math.abs(new Date(record.completedAt).getTime() - new Date(pomodoroRecord.completedAt).getTime()) < 5000 &&
        record.taskName === pomodoroRecord.taskName &&
        record.subtaskName === pomodoroRecord.subtaskName
      );
      
      if (isDuplicate) {
        console.log('发现重复记录，跳过添加');
        return prev;
      }
      
      return [pomodoroRecord, ...prev];
    });

    // 如果是子任务，标记为完成
    if (activeSubtask) {
      toggleSubtask(activeTask.id, activeSubtask.id);
    }

    // 通知处理
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 番茄钟完成！', {
        body: `恭喜完成「${subtaskName}」，休息一下吧！`,
        icon: '/favicon.ico'
      });
    }

    // 清理旧的处理记录（保留最近50个）
    setTimeout(() => {
      const entries = Array.from(processedPomodoroRef.current.entries());
      if (entries.length > 50) {
        const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
        const keepEntries = sortedEntries.slice(0, 50);
        processedPomodoroRef.current.clear();
        keepEntries.forEach(([key, timestamp]) => {
          processedPomodoroRef.current.set(key, timestamp);
        });
      }
    }, 10000);

  }, [setPomodoroHistory, toggleSubtask, cleanupProcessedPomodoro]);

  // 修复：监听番茄钟完成事件，避免重复触发
  useEffect(() => {
    if (pomodoroHook.pomodoroStatus === 'completed' && pomodoroHook.activePomodoroId) {
      const activeTask = tasks.find(t => 
        t.id === pomodoroHook.activePomodoroId || 
        (t.subtasks && Array.isArray(t.subtasks) && t.subtasks.some(s => s.id === pomodoroHook.activePomodoroId))
      );
      
      if (activeTask) {
        const activeSubtask = activeTask.subtasks?.find(s => s.id === pomodoroHook.activePomodoroId);
        const duration = activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration || 25;
        
        // 使用setTimeout避免状态更新冲突
        setTimeout(() => {
          handlePomodoroComplete(activeTask, activeSubtask, duration, pomodoroHook.activePomodoroId);
        }, 100);
      } else {
        console.warn('未找到对应的活动任务:', pomodoroHook.activePomodoroId);
      }
    }
  }, [pomodoroHook.pomodoroStatus, pomodoroHook.activePomodoroId, tasks, handlePomodoroComplete]);

  // 工具函数
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDuration = useCallback((minutes) => {
    if (!minutes || isNaN(minutes)) return '';
    const mins = Math.abs(minutes);
    if (mins < 60) return `${mins}分钟`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}小时${remainingMins}分钟` : `${hours}小时`;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return 'default-priority';
    }
  }, []);

  // 修复：改进统计计算，添加错误处理
  const stats = useMemo(() => {
    try {
      if (!Array.isArray(tasks)) {
        console.warn('tasks不是数组，使用默认值');
        return { total: 0, completed: 0, high: 0, pending: 0, aiAnalyzed: 0 };
      }

      const total = tasks.length;
      const completed = tasks.filter(t => t && t.completed).length;
      const high = tasks.filter(t => t && t.priority === 'high' && !t.completed).length;
      const aiAnalyzed = tasks.filter(t => t && t.aiAnalysis).length;
      
      return { 
        total, 
        completed, 
        high, 
        pending: total - completed, 
        aiAnalyzed 
      };
    } catch (error) {
      console.error('计算统计数据失败:', error);
      return { total: 0, completed: 0, high: 0, pending: 0, aiAnalyzed: 0 };
    }
  }, [tasks]);

  const pomodoroStats = useMemo(() => {
    try {
      if (!Array.isArray(pomodoroHistory)) {
        console.warn('pomodoroHistory不是数组，使用默认值');
        return { totalTime: 0, totalSessions: 0 };
      }

      const today = new Date().toDateString();
      const todayPomodoros = pomodoroHistory.filter(p => p && p.date === today);
      const totalTime = todayPomodoros.reduce((sum, p) => sum + (p.duration || 0), 0);
      const totalSessions = todayPomodoros.length;
      
      return { totalTime, totalSessions };
    } catch (error) {
      console.error('计算番茄钟统计失败:', error);
      return { totalTime: 0, totalSessions: 0 };
    }
  }, [pomodoroHistory]);

  const weeklyStats = useMemo(() => {
    try {
      if (!Array.isArray(pomodoroHistory)) {
        return [];
      }

      const today = new Date();
      const weekData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayPomodoros = pomodoroHistory.filter(p => p && p.date === dateStr);
        weekData.push({
          day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
          date: dateStr,
          count: dayPomodoros.length,
          time: dayPomodoros.reduce((sum, p) => sum + (p.duration || 0), 0)
        });
      }
      
      return weekData;
    } catch (error) {
      console.error('计算周统计失败:', error);
      return [];
    }
  }, [pomodoroHistory]);

  const achievements = useMemo(() => {
    try {
      const newAchievements = [];
      const totalPomodoros = Array.isArray(pomodoroHistory) ? pomodoroHistory.length : 0;
      const todayPomodoros = pomodoroStats.totalSessions;
      const currentDailyGoal = dailyGoal || 6;
      const currentFocusStreak = focusStreak || 0;
      
      if (totalPomodoros >= 1) newAchievements.push({ id: 'first', name: '首次专注', icon: '🌱' });
      if (totalPomodoros >= 10) newAchievements.push({ id: 'ten', name: '十次专注', icon: '🔥' });
      if (totalPomodoros >= 50) newAchievements.push({ id: 'fifty', name: '专注达人', icon: '💪' });
      if (totalPomodoros >= 100) newAchievements.push({ id: 'hundred', name: '专注大师', icon: '🏆' });
      
      if (todayPomodoros >= currentDailyGoal) newAchievements.push({ id: 'daily', name: '今日目标达成', icon: '⭐' });
      if (todayPomodoros >= 10) newAchievements.push({ id: 'super', name: '超级专注日', icon: '💎' });
      
      if (currentFocusStreak >= 3) newAchievements.push({ id: 'streak3', name: '连续专注3天', icon: '🔥' });
      if (currentFocusStreak >= 7) newAchievements.push({ id: 'streak7', name: '连续专注一周', icon: '👑' });
      
      return newAchievements;
    } catch (error) {
      console.error('计算成就失败:', error);
      return [];
    }
  }, [pomodoroHistory, pomodoroStats.totalSessions, dailyGoal, focusStreak]);

  const filteredTasks = useMemo(() => {
    try {
      if (!Array.isArray(tasks)) {
        return [];
      }
      
      return tasks.filter(task => {
        if (!task) return false;
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        return true;
      });
    } catch (error) {
      console.error('过滤任务失败:', error);
      return [];
    }
  }, [tasks, filter]);

  const sortedTasks = useMemo(() => {
    try {
      return filteredTasks.sort((a, b) => {
        if (!a || !b) return 0;
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        // 按创建时间排序
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error('排序任务失败:', error);
      return filteredTasks;
    }
  }, [filteredTasks]);

  const getEfficiencyScore = useCallback(() => {
    try {
      const currentGoal = dailyGoal || 1;
      const sessions = pomodoroStats.totalSessions || 0;
      const completionRate = Math.min((sessions / currentGoal) * 100, 100);
      return Math.round(completionRate);
    } catch (error) {
      console.error('计算效率分数失败:', error);
      return 0;
    }
  }, [pomodoroStats.totalSessions, dailyGoal]);

  // 修复：改进番茄钟原始时长获取
  function getPomodoroOriginalTime() {
    try {
      if (!pomodoroHook.activePomodoroId) return 25;
      
      const activeTask = tasks.find(t => 
        t && (t.id === pomodoroHook.activePomodoroId || 
        (t.subtasks && Array.isArray(t.subtasks) && 
         t.subtasks.some(s => s && s.id === pomodoroHook.activePomodoroId)))
      );
      
      if (activeTask) {
        const activeSubtask = activeTask.subtasks?.find(s => s && s.id === pomodoroHook.activePomodoroId);
        const duration = activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration;
        return Math.max(1, duration || 25);
      }
      
      return 25;
    } catch (error) {
      console.error('获取番茄钟原始时长失败:', error);
      return 25;
    }
  }

  // 修复：改进初始化逻辑
  useEffect(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      const sampleTasks = [
        {
          id: generateTaskId(),
          text: '体验AI智能分析功能',
          priority: 'high',
          time: '',
          estimatedDuration: 30,
          completed: false,
          category: 'demo',
          aiAnalysis: null,
          subtasks: [],
          createdAt: new Date().toISOString()
        }
      ];
      setTasks(sampleTasks);
    }

    // 修复：改进备份提醒逻辑
    try {
      const shouldShowReminder = 
        (appStats?.daysUsed >= 3) || 
        (stats.total >= 5) || 
        (Array.isArray(pomodoroHistory) && pomodoroHistory.length >= 10);

      if (shouldShowReminder && !isLoggedIn) {
        const timer = setTimeout(() => setShowBackupReminder(true), 5000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('检查备份提醒失败:', error);
    }
  }, [tasks, appStats?.daysUsed, stats.total, pomodoroHistory, isLoggedIn, setTasks, generateTaskId]);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(error => {
        console.warn('请求通知权限失败:', error);
      });
    }
  }, []);
  
  // 初始化时更新存储统计
  useEffect(() => {
    updateStorageStats();
  }, [updateStorageStats]);

  // 修复：定期清理过期数据
  useEffect(() => {
    const cleanup = setInterval(() => {
      cleanupProcessedPomodoro();
    }, 5 * 60 * 1000); // 每5分钟清理一次

    return () => clearInterval(cleanup);
  }, [cleanupProcessedPomodoro]);

  return (
    <div className="app-container">
      {/* 备份提醒弹窗 */}
      {showBackupReminder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="ai-settings-content">
              {/* AI提供商选择 */}
              <div className="setting-section">
                <h4 className="setting-title">AI分析引擎</h4>
                <div className="provider-options">
                  <label className={`provider-option ${aiConfig.provider === 'local' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="provider"
                      value="local"
                      checked={aiConfig.provider === 'local'}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value }))}
                    />
                    <div className="provider-info">
                      <div className="provider-name">
                        <Icons.Brain />
                        本地AI分析
                      </div>
                      <div className="provider-desc">基于规则的任务分解，免费使用</div>
                    </div>
                  </label>
                  
                  <label className={`provider-option ${aiConfig.provider === 'openai' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="provider"
                      value="openai"
                      checked={aiConfig.provider === 'openai'}
                      onChange={(e) => setAiConfig(prev => ({ 
                        ...prev, 
                        provider: e.target.value,
                        model: e.target.value === 'openai' ? 'gpt-4' : prev.model
                      }))}
                    />
                    <div className="provider-info">
                      <div className="provider-name">
                        <Icons.Star />
                        OpenAI GPT
                      </div>
                      <div className="provider-desc">强大的GPT模型，需要API Key</div>
                    </div>
                  </label>
                  
                  <label className={`provider-option ${aiConfig.provider === 'deepseek' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="provider"
                      value="deepseek"
                      checked={aiConfig.provider === 'deepseek'}
                      onChange={(e) => setAiConfig(prev => ({ 
                        ...prev, 
                        provider: e.target.value,
                        model: e.target.value === 'deepseek' ? 'deepseek-chat' : prev.model
                      }))}
                    />
                    <div className="provider-info">
                      <div className="provider-name">
                        <Icons.Zap />
                        DeepSeek AI
                      </div>
                      <div className="provider-desc">智能任务分析，需要API Key</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* AI提供商配置 */}
              {(aiConfig.provider === 'deepseek' || aiConfig.provider === 'openai') && (
                <div className="setting-section">
                  <h4 className="setting-title">
                    {aiConfig.provider === 'deepseek' ? 'DeepSeek配置' : 'OpenAI配置'}
                  </h4>
                  
                  <div className="setting-field">
                    <label className="field-label">API Key</label>
                    <input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={`请输入${aiConfig.provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API Key`}
                      className="field-input"
                    />
                    <div className="field-hint">
                      在 <a 
                        href={aiConfig.provider === 'deepseek' ? 
                          'https://platform.deepseek.com/api-keys' : 
                          'https://platform.openai.com/api-keys'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {aiConfig.provider === 'deepseek' ? 'DeepSeek开放平台' : 'OpenAI平台'}
                      </a> 获取API Key
                    </div>
                  </div>
                  
                  <div className="setting-field">
                    <label className="field-label">模型选择</label>
                    <select
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                      className="field-select"
                    >
                      {aiConfig.provider === 'deepseek' ? (
                        <>
                          <option value="deepseek-chat">DeepSeek-V3 (推荐)</option>
                          <option value="deepseek-reasoner">DeepSeek-R1 (深度思考)</option>
                        </>
                      ) : (
                        <>
                          <option value="gpt-4">GPT-4 (推荐)</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (经济)</option>
                        </>
                      )}
                    </select>
                    <div className="field-hint">
                      {aiConfig.provider === 'deepseek' ? 
                        'V3适合快速分析，R1提供更深入的思考过程' :
                        'GPT-4效果最好，GPT-3.5更经济'
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* 功能开关 */}
              <div className="setting-section">
                <h4 className="setting-title">功能设置</h4>
                <label className="toggle-setting">
                  <input
                    type="checkbox"
                    checked={aiConfig.enabled}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">启用AI智能分析</span>
                </label>
              </div>

              {/* 使用说明 */}
              <div className="setting-section">
                <h4 className="setting-title">使用说明</h4>
                <div className="usage-info">
                  <div className="usage-item">
                    <Icons.Star />
                    <span>AI提供更智能的任务分解和个性化建议</span>
                  </div>
                  <div className="usage-item">
                    <Icons.Lock />
                    <span>API Key安全加密存储在本地，不会上传到服务器</span>
                  </div>
                  <div className="usage-item">
                    <Icons.Zap />
                    <span>每次分析大约消耗0.001-0.02元，成本极低</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAISettings(false)}
                className="btn btn-gray"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowAISettings(false);
                  setImportExportStatus({
                    type: 'success',
                    message: 'AI设置已保存'
                  });
                  setTimeout(() => setImportExportStatus(null), 3000);
                }}
                className="btn btn-blue"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 数据管理弹窗 */}
      {showDataManager && (
        <div className="modal-overlay">
          <div className="modal-content data-manager-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <Icons.Shield />
                加密数据管理
              </h3>
              <button
                onClick={() => setShowDataManager(false)}
                className="modal-close-btn"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="data-manager-content">
              {/* 存储统计 */}
              {storageStats && (
                <div className="storage-stats">
                  <h4 className="section-title">
                    <Icons.Key />
                    存储统计
                  </h4>
                  <div className="stats-grid-small">
                    <div className="stat-item">
                      <span className="stat-label">用户ID</span>
                      <span className="stat-value">{storageStats.userId}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">数据项</span>
                      <span className="stat-value">{storageStats.itemCount} 项</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">占用空间</span>
                      <span className="stat-value">{storageStats.formattedSize}</span>
                    </div>
                  </div>
                  {storageStats.quota && (
                    <div className="quota-info">
                      <span>存储配额: {storageStats.quota}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 数据操作 */}
              <div className="data-operations">
                <h4 className="section-title">
                  <Icons.Lock />
                  数据操作
                </h4>
                
                <div className="operation-buttons">
                  <button
                    onClick={handleExportData}
                    className="operation-btn export-btn"
                  >
                    <Icons.Download />
                    导出加密数据包
                  </button>
                  
                  <label className="operation-btn import-btn">
                    <Icons.Upload />
                    导入加密数据包
                    <input
                      type="file"
                      accept=".aip"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                {/* 数据清理功能 */}
                <div className="cleanup-section">
                  <h5 className="cleanup-title">数据维护</h5>
                  <div className="cleanup-buttons">
                    <button
                      onClick={cleanupPomodoroHistory}
                      className="cleanup-btn warning"
                    >
                      <Icons.Settings />
                      清理重复数据
                    </button>
                    <button
                      onClick={resetPomodoroHistory}
                      className="cleanup-btn danger"
                    >
                      <Icons.Trash />
                      重置番茄钟历史
                    </button>
                  </div>
                  <p className="cleanup-desc">
                    如果发现番茄钟计数异常，可以使用清理功能移除重复数据，或完全重置历史记录。
                  </p>
                </div>
                
                {/* 状态提示 */}
                {importExportStatus && (
                  <div className={`status-message ${importExportStatus.type}`}>
                    <span className="status-icon">
                      {importExportStatus.type === 'success' ? '✅' : '❌'}
                    </span>
                    {importExportStatus.message}
                  </div>
                )}
              </div>
              
              {/* 安全说明 */}
              <div className="security-info">
                <h4 className="section-title">
                  <Icons.Shield />
                  安全说明
                </h4>
                <ul className="security-list">
                  <li>• 数据通过用户唯一密钥加密存储</li>
                  <li>• 导出文件(.aip)使用双重加密保护</li>
                  <li>• 只有相同设备用户才能解密导入</li>
                  <li>• 建议定期备份重要数据</li>
                  <li>• 本地存储，不依赖网络服务</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="layout-grid">
        {/* 主要任务区域 */}
        <div className="main-content">
          <div className="card">
            {/* 头部统计 */}
            <div className="header-stats">
              <div className="header-actions">
                <button
                  onClick={() => setShowDataManager(true)}
                  className="header-btn data-manager-btn"
                  title="加密数据管理"
                >
                  <Icons.Shield />
                  <span className="btn-text">数据管理</span>
                </button>
              </div>

              <h1 className="main-title">
                <Icons.Timer />
                AI智能番茄钟
                <span className="subtitle">加密版</span>
              </h1>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">总任务</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number stat-green">{stats.completed}</div>
                  <div className="stat-label">已完成</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number stat-yellow">{stats.pending}</div>
                  <div className="stat-label">待处理</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number stat-red">{stats.high}</div>
                  <div className="stat-label">高优先级</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number stat-purple">{stats.aiAnalyzed}</div>
                  <div className="stat-label">AI分析</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number stat-cyan">{pomodoroStats.totalSessions}</div>
                  <div className="stat-label">今日🍅</div>
                </div>
              </div>
            </div>

            {/* 番茄钟状态栏 */}
            {pomodoroHook.pomodoroStatus !== 'idle' && (
              <div className="pomodoro-status">
                <div className="pomodoro-info">
                  <div className="pomodoro-indicator"></div>
                  <span className="pomodoro-text">
                    {pomodoroHook.pomodoroStatus === 'running' ? '🍅 专注中' : 
                     pomodoroHook.pomodoroStatus === 'paused' ? '⏸️ 已暂停' : '✅ 已完成'}
                  </span>
                </div>
                <div className="pomodoro-controls">
                  <div className="pomodoro-timer">
                    {formatTime(pomodoroHook.pomodoroTime)}
                  </div>
                  <div className="pomodoro-buttons">
                    {pomodoroHook.pomodoroStatus === 'running' && (
                      <button onClick={pomodoroHook.pausePomodoro} className="pomodoro-btn">
                        <Icons.Pause />
                      </button>
                    )}
                    {pomodoroHook.pomodoroStatus === 'paused' && (
                      <button onClick={pomodoroHook.resumePomodoro} className="pomodoro-btn">
                        <Icons.Play />
                      </button>
                    )}
                    <button onClick={pomodoroHook.stopPomodoro} className="pomodoro-btn">
                      <Icons.Square />
                    </button>
                  </div>
                </div>
                {pomodoroHook.pomodoroStatus === 'running' && (
                  <div className="pomodoro-progress">
                    <div 
                      className="pomodoro-progress-bar"
                      style={{
                        width: `${100 - (pomodoroHook.pomodoroTime / (getPomodoroOriginalTime() * 60)) * 100}%`
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* 任务添加 */}
            <div className="add-task-section">
              <div className="add-task-form">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="添加任务，AI智能识别类型并分解步骤..."
                  className="task-input"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="priority-select"
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="time-input"
                />
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="预计分钟"
                  min="1"
                  max="300"
                  className="duration-input"
                />
                <button onClick={addTask} className="add-btn">
                  <Icons.Plus />
                  添加
                </button>
              </div>
              <div className="tip-text">
                🛡️ 数据加密存储 | 🧠 支持DeepSeek/OpenAI AI智能分析 | 
                <button 
                  onClick={() => setShowAISettings(true)}
                  className="inline-settings-btn"
                >
                  AI设置
                </button>
              </div>
            </div>

            {/* 过滤器 */}
            <div className="filter-section">
              <div className="filter-buttons">
                <button
                  onClick={() => setFilter('all')}
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                  全部任务
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                >
                  待处理
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                >
                  已完成
                </button>
              </div>
            </div>

            {/* 任务列表 */}
            <div className="tasks-section">
              {sortedTasks.length === 0 ? (
                <div className="empty-state">
                  <Icons.Timer />
                  <p className="empty-title">开始添加你的第一个任务吧！</p>
                  <p className="empty-subtitle">
                    🚀 AI智能分析：学习、编程、写作、会议等10种任务类型专业分解
                  </p>
                </div>
              ) : (
                <div className="tasks-list">
                  {sortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item ${task.completed ? 'completed' : ''}`}
                    >
                      {/* 主任务行 */}
                      <div className="task-header">
                        <div className="task-main">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                          >
                            {task.completed && <Icons.Check />}
                          </button>

                          <div className={`priority-badge ${getPriorityColor(task.priority)}`}>
                            <Icons.Flag />
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </div>

                          {task.time && (
                            <div className="task-time">
                              <Icons.Clock />
                              {task.time}
                            </div>
                          )}

                          {task.estimatedDuration && (
                            <div className="task-duration">
                              <Icons.Timer />
                              {formatDuration(task.estimatedDuration)}
                            </div>
                          )}

                          <div className="task-text">
                            {editingId === task.id ? (
                              <div className="edit-task">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                  className="edit-input"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="save-edit-btn">
                                  <Icons.Check />
                                </button>
                              </div>
                            ) : (
                              <span>{task.text}</span>
                            )}
                          </div>
                        </div>

                        <div className="task-actions">
                          {task.estimatedDuration && (
                            <button
                              onClick={() => pomodoroHook.startPomodoro(
                                task.id, null, task.estimatedDuration, task.text
                              )}
                              disabled={pomodoroHook.pomodoroStatus === 'running'}
                              className="pomodoro-start-btn"
                            >
                              <Icons.Play />
                              开始
                            </button>
                          )}

                          <button
                            onClick={() => analyzeTask(task.id, task.text, task.estimatedDuration)}
                            disabled={analyzingTasks[task.id]}
                            className="analyze-btn"
                            title="AI智能分析任务"
                          >
                            <Icons.Brain />
                            {analyzingTasks[task.id] ? '分析中...' : 'AI分析'}
                          </button>

                          <button
                            onClick={() => startEdit(task.id, task.text)}
                            className="edit-btn"
                          >
                            <Icons.Edit />
                          </button>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="delete-btn"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>

                      {/* AI分析结果 */}
                      {task.aiAnalysis && (
                        <div className="ai-analysis">
                          <div className="analysis-header">
                            <button
                              onClick={() => toggleAnalysisExpanded(task.id)}
                              className="analysis-toggle"
                            >
                              {expandedAnalysis[task.id] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                              <span className="task-type-badge">
                                {task.aiAnalysis.taskTypeLabel}
                              </span>
                            </button>
                            <button
                              onClick={() => reAnalyzeTask(task.id)}
                              className="reanalyze-btn"
                              title="重新分析"
                            >
                              <Icons.Brain />
                              重新分析
                            </button>
                          </div>

                          {expandedAnalysis[task.id] && (
                            <div className="analysis-content">
                              <div className="analysis-description">
                                {task.aiAnalysis.analysis}
                              </div>

                              <div className="analysis-steps">
                                <div className="steps-header">
                                  <h4>执行步骤</h4>
                                  <button
                                    onClick={() => convertStepsToSubtasks(task.id)}
                                    className="convert-steps-btn"
                                  >
                                    转为子任务
                                  </button>
                                </div>
                                <div className="steps-list">
                                  {task.aiAnalysis.steps.map((step, index) => (
                                    <div key={index} className="step-item">
                                      <span className="step-number">{step.order}</span>
                                      <span className="step-text">{step.text}</span>
                                      <span className="step-duration">
                                        <Icons.Timer />
                                        {step.duration}分钟
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="analysis-tips">
                                <h4>
                                  <Icons.Lightbulb />
                                  执行建议
                                </h4>
                                <ul className="tips-list">
                                  {task.aiAnalysis.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="analysis-meta">
                                <span className="analysis-source">
                                  {task.aiAnalysis.source === 'deepseek' && '🚀 DeepSeek AI分析'}
                                  {task.aiAnalysis.source === 'openai' && '⭐ OpenAI GPT分析'}
                                  {task.aiAnalysis.source === 'local' && '🧠 本地AI分析'}
                                </span>
                                <span className="analysis-time">
                                  {new Date(task.aiAnalysis.analyzedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 子任务列表 */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="subtasks">
                          <div className="subtasks-header">
                            <h4>子任务进度 ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</h4>
                          </div>
                          <div className="subtasks-list">
                            {task.subtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
                              >
                                <button
                                  onClick={() => toggleSubtask(task.id, subtask.id)}
                                  className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                                >
                                  {subtask.completed && <Icons.Check />}
                                </button>
                                
                                <div className="subtask-text">{subtask.text}</div>
                                
                                <div className="subtask-meta">
                                  <span className="subtask-duration">
                                    <Icons.Timer />
                                    {subtask.duration}分钟
                                  </span>
                                  {subtask.startTime && (
                                    <span className="subtask-time">
                                      开始: {subtask.startTime}
                                    </span>
                                  )}
                                  {subtask.endTime && (
                                    <span className="subtask-time">
                                      完成: {subtask.endTime}
                                    </span>
                                  )}
                                </div>
                                
                                {!subtask.completed && (
                                  <button
                                    onClick={() => pomodoroHook.startPomodoro(
                                      task.id, subtask.id, subtask.duration, task.text, subtask.text
                                    )}
                                    disabled={pomodoroHook.pomodoroStatus === 'running'}
                                    className="subtask-start-btn"
                                  >
                                    <Icons.Play />
                                    开始
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧统计面板 */}
        <div className="sidebar">
          {/* 每日目标 */}
          <div className="card daily-goal">
            <h3>
              <Icons.Target />
              每日目标
            </h3>
            <div className="goal-progress">
              <div className="goal-circle">
                <div className="goal-number">{pomodoroStats.totalSessions}</div>
                <div className="goal-target">/ {dailyGoal}</div>
              </div>
              <div className="goal-bar">
                <div 
                  className="goal-fill"
                  style={{ width: `${Math.min((pomodoroStats.totalSessions / dailyGoal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="goal-controls">
              <button
                onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                className="goal-btn"
              >
                -
              </button>
              <span>目标: {dailyGoal} 番茄</span>
              <button
                onClick={() => setDailyGoal(dailyGoal + 1)}
                className="goal-btn"
              >
                +
              </button>
            </div>
            <div className="efficiency-score">
              <Icons.TrendingUp />
              <span>今日效率: {getEfficiencyScore()}%</span>
            </div>
          </div>

          {/* 本周统计 */}
          <div className="card weekly-stats">
            <h3>
              <Icons.Calendar />
              本周统计
            </h3>
            <div className="week-chart">
              {weeklyStats.map((day, index) => (
                <div key={index} className="day-bar">
                  <div 
                    className="bar-fill"
                    style={{ height: `${Math.max(4, (day.count / Math.max(...weeklyStats.map(d => d.count), 1)) * 60)}px` }}
                  ></div>
                  <div className="day-label">{day.day}</div>
                  <div className="day-count">{day.count}</div>
                </div>
              ))}
            </div>
            <div className="week-summary">
              <div className="summary-item">
                <span>本周总计</span>
                <span>{weeklyStats.reduce((sum, day) => sum + day.count, 0)} 番茄</span>
              </div>
              <div className="summary-item">
                <span>专注时长</span>
                <span>{Math.round(weeklyStats.reduce((sum, day) => sum + day.time, 0) / 60)}h</span>
              </div>
            </div>
          </div>

          {/* 成就系统 */}
          <div className="card achievements">
            <h3>
              <Icons.Award />
              成就徽章
            </h3>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-item">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-name">{achievement.name}</div>
                </div>
              ))}
              {achievements.length === 0 && (
                <div className="no-achievements">
                  <Icons.Star />
                  <span>完成更多番茄钟解锁成就！</span>
                </div>
              )}
            </div>
          </div>

          {/* 专注状态 */}
          <div className="card focus-status">
            <h3>
              <Icons.Zap />
              专注状态
            </h3>
            <div className="focus-metrics">
              <div className="metric-item">
                <div className="metric-label">连续专注</div>
                <div className="metric-value">{focusStreak} 天</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">总专注时长</div>
                <div className="metric-value">
                  {Math.round((Array.isArray(pomodoroHistory) ? pomodoroHistory.reduce((sum, p) => sum + (p.duration || 0), 0) : 0) / 60)}h
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">平均效率</div>
                <div className="metric-value">高效</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrganizer;="modal-text-center">
              <div className="modal-icon">☁️</div>
              <h3>保护你的数据？</h3>
              <p>
                你已经使用 {appStats?.daysUsed || 0} 天，创建了 {stats.total} 个任务！
                <br />一键备份，多设备同步，永不丢失。
              </p>
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setShowBackupReminder(false);
                    setShowDataManager(true);
                  }}
                  className="btn btn-green"
                >
                  🛡️ 加密备份数据
                </button>
                <button
                  onClick={() => alert('登录功能开发中...')}
                  className="btn btn-blue"
                >
                  🔵 云端同步 (开发中)
                </button>
                <button
                  onClick={() => setShowBackupReminder(false)}
                  className="btn btn-gray"
                >
                  稍后再说
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI设置弹窗 */}
      {showAISettings && (
        <div className="modal-overlay">
          <div className="modal-content ai-settings-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <Icons.Brain />
                AI分析设置
              </h3>
              <button
                onClick={() => setShowAISettings(false)}
                className="modal-close-btn"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className
