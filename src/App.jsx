import React, { useState, useEffect, useRef } from 'react';
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
  Star: () => <span>⭐</span>
};

const WorkOrganizer = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedTime, setSelectedTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [analyzingTasks, setAnalyzingTasks] = useState(new Set());
  const [expandedAnalysis, setExpandedAnalysis] = useState(new Set());
  
  // 番茄钟状态
  const [activePomodoroId, setActivePomodoroId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [pomodoroStatus, setPomodoroStatus] = useState('idle');
  const [pomodoroHistory, setPomodoroHistory] = useState([]);
  
  // 数据管理状态
  const [dataMode, setDataMode] = useState('local');
  const [showDataManager, setShowDataManager] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [appStats, setAppStats] = useState({
    daysUsed: 0,
    totalTasks: 0,
    totalPomodoros: 0,
    firstUse: null
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // 新增状态
  const [dailyGoal, setDailyGoal] = useState(6); // 每日番茄钟目标
  const [focusStreak, setFocusStreak] = useState(0); // 连续专注天数
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  const intervalRef = useRef(null);

  // 本地存储管理
  const saveToLocal = (key, data) => {
    try {
      const storage = JSON.stringify(data);
      localStorage.setItem(`aipomodoro_${key}`, storage);
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const loadFromLocal = (key) => {
    try {
      const data = localStorage.getItem(`aipomodoro_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  };

  // 生成周统计数据
  const generateWeeklyStats = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayPomodoros = pomodoroHistory.filter(p => p.date === dateStr);
      weekData.push({
        day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        date: dateStr,
        count: dayPomodoros.length,
        time: dayPomodoros.reduce((sum, p) => sum + (p.duration || 0), 0)
      });
    }
    
    setWeeklyStats(weekData);
  };

  // 计算成就
  const calculateAchievements = () => {
    const newAchievements = [];
    const totalPomodoros = pomodoroHistory.length;
    const todayPomodoros = getTodayPomodoroStats().totalSessions;
    
    // 基础成就
    if (totalPomodoros >= 1) newAchievements.push({ id: 'first', name: '首次专注', icon: '🌱' });
    if (totalPomodoros >= 10) newAchievements.push({ id: 'ten', name: '十次专注', icon: '🔥' });
    if (totalPomodoros >= 50) newAchievements.push({ id: 'fifty', name: '专注达人', icon: '💪' });
    if (totalPomodoros >= 100) newAchievements.push({ id: 'hundred', name: '专注大师', icon: '🏆' });
    
    // 每日成就
    if (todayPomodoros >= dailyGoal) newAchievements.push({ id: 'daily', name: '今日目标达成', icon: '⭐' });
    if (todayPomodoros >= 10) newAchievements.push({ id: 'super', name: '超级专注日', icon: '💎' });
    
    // 连续性成就
    if (focusStreak >= 3) newAchievements.push({ id: 'streak3', name: '连续专注3天', icon: '🔥' });
    if (focusStreak >= 7) newAchievements.push({ id: 'streak7', name: '连续专注一周', icon: '👑' });
    
    setAchievements(newAchievements);
  };

  // 初始化数据
  useEffect(() => {
    const savedTasks = loadFromLocal('tasks');
    const savedHistory = loadFromLocal('pomodoroHistory');
    const savedStats = loadFromLocal('appStats');
    const savedGoal = loadFromLocal('dailyGoal');
    const savedStreak = loadFromLocal('focusStreak');
    
    if (savedTasks) {
      setTasks(savedTasks);
    } else {
      const sampleTasks = [
        {
          id: 1,
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
      saveToLocal('tasks', sampleTasks);
    }

    if (savedHistory) {
      setPomodoroHistory(savedHistory);
    }

    if (savedGoal) {
      setDailyGoal(savedGoal);
    }

    if (savedStreak) {
      setFocusStreak(savedStreak);
    }

    let stats = savedStats || {
      daysUsed: 1,
      totalTasks: 0,
      totalPomodoros: 0,
      firstUse: new Date().toISOString()
    };

    const daysSinceFirstUse = Math.floor((Date.now() - new Date(stats.firstUse).getTime()) / (1000 * 60 * 60 * 24));
    stats.daysUsed = Math.max(1, daysSinceFirstUse);
    
    setAppStats(stats);
    saveToLocal('appStats', stats);

    checkBackupReminder(stats);
  }, []);

  // 当番茄钟历史更新时，重新计算统计
  useEffect(() => {
    generateWeeklyStats();
    calculateAchievements();
  }, [pomodoroHistory, dailyGoal, focusStreak]);

  const checkBackupReminder = (stats) => {
    const shouldShowReminder = 
      stats.daysUsed >= 3 || 
      stats.totalTasks >= 5 || 
      stats.totalPomodoros >= 10;

    if (shouldShowReminder && !isLoggedIn) {
      setTimeout(() => setShowBackupReminder(true), 5000);
    }
  };

  // 数据自动保存
  useEffect(() => {
    if (tasks.length > 0) {
      saveToLocal('tasks', tasks);
      setAppStats(prev => {
        const newStats = { ...prev, totalTasks: tasks.length };
        saveToLocal('appStats', newStats);
        return newStats;
      });
    }
  }, [tasks]);

  useEffect(() => {
    if (pomodoroHistory.length > 0) {
      saveToLocal('pomodoroHistory', pomodoroHistory);
      setAppStats(prev => {
        const newStats = { ...prev, totalPomodoros: pomodoroHistory.length };
        saveToLocal('appStats', newStats);
        return newStats;
      });
    }
  }, [pomodoroHistory]);

  // 保存目标和连击
  useEffect(() => {
    saveToLocal('dailyGoal', dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    saveToLocal('focusStreak', focusStreak);
  }, [focusStreak]);

  // 番茄钟计时器
  useEffect(() => {
    if (pomodoroStatus === 'running' && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            completePomodoroSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [pomodoroStatus, pomodoroTime]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        priority: selectedPriority,
        time: selectedTime,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        completed: false,
        category: 'work',
        aiAnalysis: null,
        subtasks: [],
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setSelectedTime('');
      setEstimatedDuration('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    setTasks(tasks.map(task => 
      task.id === editingId ? { ...task, text: editingText } : task
    ));
    setEditingId(null);
    setEditingText('');
  };

  // 番茄钟功能
  const startPomodoro = (taskId, subtaskId, duration, taskName, subtaskName) => {
    if (activePomodoroId) {
      stopPomodoro();
    }
    
    setActivePomodoroId(subtaskId || taskId);
    setPomodoroTime(duration * 60);
    setPomodoroStatus('running');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🍅 开始专注：${subtaskName || taskName}`, {
        body: `预计用时 ${duration} 分钟`,
        icon: '/favicon.ico'
      });
    }
  };

  const pausePomodoro = () => {
    setPomodoroStatus('paused');
  };

  const resumePomodoro = () => {
    setPomodoroStatus('running');
  };

  const stopPomodoro = () => {
    setActivePomodoroId(null);
    setPomodoroTime(0);
    setPomodoroStatus('idle');
  };

  const completePomodoroSession = () => {
    const activeTask = tasks.find(t => 
      t.id === activePomodoroId || 
      t.subtasks.some(s => s.id === activePomodoroId)
    );
    
    if (activeTask) {
      const activeSubtask = activeTask.subtasks.find(s => s.id === activePomodoroId);
      const taskName = activeTask.text;
      const subtaskName = activeSubtask ? activeSubtask.text : taskName;
      const duration = activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration;

      const pomodoroRecord = {
        id: Date.now(),
        taskName,
        subtaskName,
        duration,
        completedAt: new Date().toISOString(),
        date: new Date().toDateString(),
        efficiency: 'high'
      };

      setPomodoroHistory(prev => [pomodoroRecord, ...prev]);

      if (activeSubtask) {
        toggleSubtask(activeTask.id, activePomodoroId);
      }

      // 检查是否达成今日目标
      const todayCount = getTodayPomodoroStats().totalSessions + 1;
      if (todayCount === dailyGoal) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 今日目标达成！', {
            body: `恭喜完成今日 ${dailyGoal} 个番茄钟目标！`,
            icon: '/favicon.ico'
          });
        }
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 番茄钟完成！', {
          body: `恭喜完成「${subtaskName}」，休息一下吧！`,
          icon: '/favicon.ico'
        });
      }
    }

    setPomodoroStatus('completed');
    setTimeout(() => {
      stopPomodoro();
    }, 3000);
  };

  // 第一性原理AI分析功能
  const analyzeTaskWithFirstPrinciples = async (taskId, taskText, duration) => {
    setAnalyzingTasks(prev => new Set([...prev, taskId]));
    
    // 模拟第一性原理分析
    setTimeout(() => {
      const analysis = generateFirstPrinciplesAnalysis(taskText, duration);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, aiAnalysis: analysis }
            : task
        )
      );
      
      setExpandedAnalysis(prev => new Set([...prev, taskId]));
      setAnalyzingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 2000);
  };

  // 第一性原理分析生成器
  const generateFirstPrinciplesAnalysis = (taskText, duration) => {
    // 基于任务类型生成第一性原理分析
    const taskType = identifyTaskType(taskText);
    
    const coreObjective = extractCoreObjective(taskText);
    const fundamentalElements = breakDownToFundamentals(taskText, taskType);
    const minimalActions = identifyMinimalActions(fundamentalElements, duration);
    const assumptions = identifyAssumptions(taskText);
    
    return {
      analysis: `基于第一性原理分析"${taskText}"：核心目标是${coreObjective}。通过剥离传统假设，我们找到了完成这个目标的最小必要动作。`,
      totalDuration: duration || 60,
      coreObjective,
      fundamentalElements,
      assumptions,
      steps: minimalActions,
      firstPrinciplesInsights: generateInsights(taskText, taskType),
      tips: generateFirstPrinciplesTips(taskType)
    };
  };

  // 识别任务类型
  const identifyTaskType = (taskText) => {
    const text = taskText.toLowerCase();
    if (text.includes('学习') || text.includes('研究') || text.includes('阅读')) return 'learning';
    if (text.includes('写') || text.includes('报告') || text.includes('文档')) return 'creation';
    if (text.includes('会议') || text.includes('讨论') || text.includes('沟通')) return 'communication';
    if (text.includes('分析') || text.includes('解决') || text.includes('问题')) return 'analysis';
    if (text.includes('设计') || text.includes('规划') || text.includes('策划')) return 'design';
    return 'general';
  };

  // 提取核心目标
  const extractCoreObjective = (taskText) => {
    const objectives = {
      learning: '获得特定知识或技能',
      creation: '产生有价值的信息或内容',
      communication: '传递信息并达成共识',
      analysis: '理解问题本质并找到解决方案',
      design: '创造满足需求的方案',
      general: '完成特定的可衡量结果'
    };
    
    const type = identifyTaskType(taskText);
    return objectives[type];
  };

  // 分解到基本要素
  const breakDownToFundamentals = (taskText, taskType) => {
    const fundamentals = {
      learning: ['信息输入', '理解加工', '记忆巩固', '应用验证'],
      creation: ['明确需求', '收集素材', '组织结构', '表达输出'],
      communication: ['准备信息', '选择渠道', '传递内容', '获得反馈'],
      analysis: ['收集数据', '识别模式', '建立假设', '验证结论'],
      design: ['理解约束', '生成选项', '评估方案', '优化细节'],
      general: ['明确标准', '分解行动', '执行检验', '达成结果']
    };
    
    return fundamentals[taskType] || fundamentals.general;
  };

  // 识别隐含假设
  const identifyAssumptions = (taskText) => {
    return [
      '假设现有方法是最佳的',
      '假设必须按传统流程执行',
      '假设需要完美的初次尝试',
      '假设复杂度等于质量'
    ];
  };

  // 生成最小必要动作
  const identifyMinimalActions = (fundamentalElements, duration) => {
    const totalDuration = duration || 60;
    const stepCount = fundamentalElements.length;
    
    return fundamentalElements.map((element, index) => {
      let stepDuration;
      switch (index) {
        case 0: // 第一步通常是理解/准备
          stepDuration = Math.round(totalDuration * 0.25);
          break;
        case stepCount - 1: // 最后一步通常是验证/输出
          stepDuration = Math.round(totalDuration * 0.15);
          break;
        default: // 中间步骤平均分配
          stepDuration = Math.round(totalDuration * 0.6 / (stepCount - 2));
      }
      
      return {
        text: `${element}（去除不必要的复杂性）`,
        duration: stepDuration,
        order: index + 1,
        principle: getStepPrinciple(element)
      };
    });
  };

  // 获取步骤的第一性原理
  const getStepPrinciple = (element) => {
    const principles = {
      '信息输入': '获取是理解的前提',
      '理解加工': '理解比记忆更重要',
      '记忆巩固': '重复是记忆的本质',
      '应用验证': '应用是学习的目的',
      '明确需求': '目标决定路径',
      '收集素材': '内容是创作的基础',
      '组织结构': '结构决定效果',
      '表达输出': '输出验证价值',
      '准备信息': '准备决定传递质量',
      '选择渠道': '渠道影响接收效果',
      '传递内容': '内容是沟通的核心',
      '获得反馈': '反馈验证理解',
      '收集数据': '数据是分析的原料',
      '识别模式': '模式揭示规律',
      '建立假设': '假设指导验证',
      '验证结论': '验证确保正确',
      '理解约束': '约束定义可能',
      '生成选项': '选项提供可能',
      '评估方案': '评估优化选择',
      '优化细节': '细节决定成败'
    };
    
    return principles[element] || '专注于本质，忽略表面';
  };

  // 生成第一性原理洞察
  const generateInsights = (taskText, taskType) => {
    const insights = {
      learning: [
        '学习的本质是神经连接的建立和强化',
        '理解比记忆更持久，应用比理解更深刻',
        '主动构建知识比被动接受更有效'
      ],
      creation: [
        '创作的本质是重新组合已有元素',
        '价值来自解决真实需求，而非复杂技巧',
        '迭代改进比一次性完美更实际'
      ],
      communication: [
        '沟通的本质是信息的准确传递',
        '理解对方比表达自己更重要',
        '简单明确比复杂修饰更有效'
      ],
      analysis: [
        '分析的本质是发现因果关系',
        '数据是现象，模式是本质',
        '假设驱动比盲目探索更高效'
      ],
      design: [
        '设计的本质是在约束下优化',
        '功能决定形式，需求决定功能',
        '简单有效比复杂精美更重要'
      ],
      general: [
        '任何任务的本质都是输入转化为输出',
        '效果比效率更重要，方向比速度更关键',
        '最小可行动作比完美计划更有价值'
      ]
    };
    
    return insights[taskType] || insights.general;
  };

  // 生成第一性原理建议
  const generateFirstPrinciplesTips = (taskType) => {
    return [
      '质疑每个"必须"，大多数是习惯而非必要',
      '寻找最直接的路径，避免不必要的中间步骤',
      '专注于结果的本质需求，而非形式要求',
      '用最简单的方式验证假设，快速迭代'
    ];
  };

  // 保持原有的函数名以兼容现有代码
  const analyzeTask = analyzeTaskWithFirstPrinciples;

  const convertStepsToSubtasks = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.aiAnalysis?.steps) return;

    const subtasks = task.aiAnalysis.steps.map((step, index) => ({
      id: `${taskId}-sub-${index}`,
      text: step.text,
      duration: step.duration,
      order: step.order,
      completed: false,
      startTime: null,
      endTime: null
    }));

    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId 
          ? { ...t, subtasks }
          : t
      )
    );
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              subtasks: task.subtasks.map(sub =>
                sub.id === subtaskId 
                  ? { 
                      ...sub, 
                      completed: !sub.completed,
                      endTime: !sub.completed ? new Date().toLocaleTimeString() : null
                    }
                  : sub
              )
            }
          : task
      )
    );
  };

  const toggleAnalysisExpanded = (taskId) => {
    setExpandedAnalysis(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // 工具函数
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return 'default-priority';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const aiAnalyzed = tasks.filter(t => t.aiAnalysis).length;
    return { total, completed, high, pending: total - completed, aiAnalyzed };
  };

  const getTodayPomodoroStats = () => {
    const today = new Date().toDateString();
    const todayPomodoros = pomodoroHistory.filter(p => p.date === today);
    const totalTime = todayPomodoros.reduce((sum, p) => sum + p.duration, 0);
    const totalSessions = todayPomodoros.length;
    
    return { totalTime, totalSessions };
  };

  const getEfficiencyScore = () => {
    const todayStats = getTodayPomodoroStats();
    const completionRate = Math.min((todayStats.totalSessions / dailyGoal) * 100, 100);
    return Math.round(completionRate);
  };

  const stats = getStats();
  const pomodoroStats = getTodayPomodoroStats();

  function getPomodoroOriginalTime() {
    if (!activePomodoroId) return 25;
    
    const activeTask = tasks.find(t => 
      t.id === activePomodoroId || 
      t.subtasks.some(s => s.id === activePomodoroId)
    );
    
    if (activeTask) {
      const activeSubtask = activeTask.subtasks.find(s => s.id === activePomodoroId);
      return activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration || 25;
    }
    
    return 25;
  }

  return (
    <div className="app-container">
      {/* 备份提醒弹窗 */}
      {showBackupReminder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-text-center">
              <div className="modal-icon">☁️</div>
              <h3>保护你的数据？</h3>
              <p>
                你已经使用 {appStats.daysUsed} 天，创建了 {stats.total} 个任务！
                <br />一键备份，多设备同步，永不丢失。
              </p>
              <div className="modal-buttons">
                <button
                  onClick={() => alert('登录功能开发中...')}
                  className="btn btn-green"
                >
                  🟢 微信一键登录
                </button>
                <button
                  onClick={() => alert('登录功能开发中...')}
                  className="btn btn-blue"
                >
                  🔵 Google一键登录
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

      <div className="layout-grid">
        {/* 主要任务区域 */}
        <div className="main-content">
          <div className="card">
            {/* 头部统计 */}
            <div className="header-stats">
              <div className="header-actions">
                <button
                  onClick={() => setShowDataManager(true)}
                  className="header-btn"
                  title="数据管理"
                >
                  <Icons.CloudOff />
                </button>
              </div>

              <h1 className="main-title">
                <Icons.Timer />
                AI智能番茄钟
                <span className="subtitle">极简版</span>
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
            {pomodoroStatus !== 'idle' && (
              <div className="pomodoro-status">
                <div className="pomodoro-info">
                  <div className="pomodoro-indicator"></div>
                  <span className="pomodoro-text">
                    {pomodoroStatus === 'running' ? '🍅 专注中' : 
                     pomodoroStatus === 'paused' ? '⏸️ 已暂停' : '✅ 已完成'}
                  </span>
                </div>
                <div className="pomodoro-controls">
                  <div className="pomodoro-timer">
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="pomodoro-buttons">
                    {pomodoroStatus === 'running' && (
                      <button onClick={pausePomodoro} className="pomodoro-btn">
                        <Icons.Pause />
                      </button>
                    )}
                    {pomodoroStatus === 'paused' && (
                      <button onClick={resumePomodoro} className="pomodoro-btn">
                        <Icons.Play />
                      </button>
                    )}
                    <button onClick={stopPomodoro} className="pomodoro-btn">
                      <Icons.Square />
                    </button>
                  </div>
                </div>
                {pomodoroStatus === 'running' && (
                  <div className="pomodoro-progress">
                    <div 
                      className="pomodoro-progress-bar"
                      style={{
                        width: `${100 - (pomodoroTime / (getPomodoroOriginalTime() * 60)) * 100}%`
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
                  placeholder="添加任务，AI帮你分解步骤..."
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
                  className="duration-input"
                />
                <button onClick={addTask} className="add-btn">
                  <Icons.Plus />
                  添加
                </button>
              </div>
              <div className="tip-text">
                💡 极简体验：直接使用，数据自动保存到本地。需要多设备同步可点击右上角☁️
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
                    🚀 极简设计：打开即用，AI智能分析，番茄钟专注
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

                          <div className="task-text-container">
                            {editingId === task.id ? (
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                onBlur={saveEdit}
                                className="task-edit-input"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`task-text ${task.completed ? 'completed-text' : ''}`}
                                onClick={() => startEdit(task.id, task.text)}
                              >
                                {task.text}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="task-actions">
                          {/* 直接开始番茄钟 */}
                          {task.estimatedDuration && !task.completed && (
                            <button
                              onClick={() => startPomodoro(task.id, null, task.estimatedDuration, task.text, task.text)}
                              disabled={activePomodoroId === task.id}
                              className={`action-btn pomodoro-btn ${activePomodoroId === task.id ? 'active' : ''}`}
                              title="开始番茄钟"
                            >
                              <Icons.Play />
                            </button>
                          )}

                          {/* AI分析按钮 */}
                          {!task.aiAnalysis ? (
                            <button
                              onClick={() => analyzeTask(task.id, task.text, task.estimatedDuration)}
                              disabled={analyzingTasks.has(task.id)}
                              className="action-btn ai-btn"
                              title="AI智能分析"
                            >
                              {analyzingTasks.has(task.id) ? (
                                <span className="spinner">🔄</span>
                              ) : (
                                <Icons.Brain />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAnalysisExpanded(task.id)}
                              className="action-btn ai-btn"
                              title="查看AI分析"
                            >
                              {expandedAnalysis.has(task.id) ? (
                                <Icons.ChevronDown />
                              ) : (
                                <Icons.ChevronRight />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => startEdit(task.id, task.text)}
                            className="action-btn edit-btn"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="action-btn delete-btn"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>

                      {/* AI分析结果 */}
                      {task.aiAnalysis && expandedAnalysis.has(task.id) && (
                        <div className="analysis-section">
                          <div className="analysis-header">
                            <h4 className="analysis-title">
                              <Icons.Brain />
                              AI番茄钟规划
                              <span className="analysis-duration">
                                (总计: {formatDuration(task.aiAnalysis.totalDuration)})
                              </span>
                            </h4>
                            <p className="analysis-text">
                              {task.aiAnalysis.analysis}
                            </p>
                          </div>

                          <div className="analysis-content">
                            {/* 番茄钟步骤 */}
                            <div className="steps-section">
                              <div className="steps-header">
                                <h5 className="steps-title">
                                  <Icons.Timer />
                                  执行步骤
                                </h5>
                                {task.subtasks.length === 0 && (
                                  <button
                                    onClick={() => convertStepsToSubtasks(task.id)}
                                    className="start-btn"
                                  >
                                    开始执行
                                  </button>
                                )}
                              </div>
                              
                              {task.subtasks.length > 0 ? (
                                <div className="subtasks-list">
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="subtask-item">
                                      <button
                                        onClick={() => toggleSubtask(task.id, subtask.id)}
                                        className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                                      >
                                        {subtask.completed && <Icons.Check />}
                                      </button>
                                      <div className="subtask-content">
                                        <div className={`subtask-text ${subtask.completed ? 'completed-text' : ''}`}>
                                          步骤{subtask.order}: {subtask.text}
                                        </div>
                                        <div className="subtask-info">
                                          <span className="subtask-duration">
                                            🍅 {formatDuration(subtask.duration)}
                                          </span>
                                          {subtask.completed && subtask.endTime && (
                                            <span className="subtask-time">
                                              完成于 {subtask.endTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {!subtask.completed && (
                                        <button
                                          onClick={() => startPomodoro(
                                            task.id, 
                                            subtask.id, 
                                            subtask.duration, 
                                            task.text, 
                                            subtask.text
                                          )}
                                          disabled={activePomodoroId === subtask.id}
                                          className={`subtask-play-btn ${activePomodoroId === subtask.id ? 'active' : ''}`}
                                          title="开始这个步骤的番茄钟"
                                        >
                                          <Icons.Play />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {/* 进度条 */}
                                  <div className="progress-section">
                                    <div className="progress-info">
                                      <span>总体进度</span>
                                      <span>{Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill"
                                        style={{
                                          width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="steps-preview">
                                  {task.aiAnalysis.steps.map((step, index) => (
                                    <div key={index} className="step-preview">
                                      <div className="step-text">
                                        步骤{step.order}: {step.text}
                                      </div>
                                      <div className="step-duration">
                                        🍅 {formatDuration(step.duration)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 实用技巧 */}
                            <div className="tips-section">
                              <h5 className="tips-title">
                                <Icons.Lightbulb />
                                效率技巧
                              </h5>
                              <ul className="tips-list">
                                {task.aiAnalysis.tips.map((tip, index) => (
                                  <li key={index} className="tip-item">
                                    <span className="tip-icon">💡</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
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

        {/* 增强的侧边栏 */}
        <div className="sidebar">
          <div className="sidebar-card">
            {/* 今日目标 */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <span className="sidebar-emoji">🎯</span>
                今日目标
              </h3>
              
              <div className="goal-section">
                <div className="goal-progress">
                  <div className="goal-numbers">
                    <span className="goal-current">{pomodoroStats.totalSessions}</span>
                    <span className="goal-separator">/</span>
                    <span className="goal-target">{dailyGoal}</span>
                  </div>
                  <div className="goal-label">番茄钟</div>
                </div>
                
                <div className="goal-progress-bar">
                  <div 
                    className="goal-progress-fill"
                    style={{
                      width: `${Math.min((pomodoroStats.totalSessions / dailyGoal) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                
                <div className="goal-controls">
                  <button 
                    onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                    className="goal-btn"
                  >
                    -
                  </button>
                  <span className="goal-text">调整目标</span>
                  <button 
                    onClick={() => setDailyGoal(dailyGoal + 1)}
                    className="goal-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 效率分析 */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <span className="sidebar-emoji">📊</span>
                效率分析
              </h3>
              
              <div className="efficiency-grid">
                <div className="efficiency-item">
                  <div className="efficiency-number">{getEfficiencyScore()}%</div>
                  <div className="efficiency-label">完成度</div>
                </div>
                <div className="efficiency-item">
                  <div className="efficiency-number">{formatDuration(pomodoroStats.totalTime)}</div>
                  <div className="efficiency-label">专注时间</div>
                </div>
                <div className="efficiency-item">
                  <div className="efficiency-number">{focusStreak}</div>
                  <div className="efficiency-label">连续天数</div>
                </div>
                <div className="efficiency-item">
                  <div className="efficiency-number">{appStats.daysUsed}</div>
                  <div className="efficiency-label">使用天数</div>
                </div>
              </div>
            </div>

            {/* 周趋势 */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <span className="sidebar-emoji">📈</span>
                一周趋势
              </h3>
              
              <div className="week-chart">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="week-day">
                    <div className="week-bar-container">
                      <div 
                        className="week-bar"
                        style={{
                          height: `${Math.max((day.count / Math.max(...weeklyStats.map(d => d.count), 1)) * 60, 4)}px`
                        }}
                      ></div>
                    </div>
                    <div className="week-count">{day.count}</div>
                    <div className="week-label">{day.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 成就系统 */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <span className="sidebar-emoji">🏆</span>
                成就徽章
              </h3>
              
              <div className="achievements-grid">
                {achievements.length > 0 ? (
                  achievements.slice(0, 6).map((achievement) => (
                    <div key={achievement.id} className="achievement-item">
                      <span className="achievement-icon">{achievement.icon}</span>
                      <span className="achievement-name">{achievement.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="achievement-empty">
                    <span>🌟</span>
                    <p>完成首个番茄钟解锁成就</p>
                  </div>
                )}
              </div>
            </div>

            {/* 使用提示 */}
            <div className="sidebar-section">
              <h4 className="sidebar-tips-title">💡 使用提示</h4>
              <ul className="sidebar-tips-list">
                <li>• 设置预计时间，AI分析更准确</li>
                <li>• 点击🧠获得智能步骤分解</li>
                <li>• 点击▶️开始对应时长番茄钟</li>
                <li>• 调整每日目标激励自己</li>
                <li>• 保持连续专注获得成就</li>
              </ul>
            </div>

            {/* 番茄钟历史 */}
            <div className="sidebar-section">
              <h4 className="sidebar-history-title">最近完成</h4>
              <div className="sidebar-history-list">
                {pomodoroHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="history-item">
                    <div className="history-task">
                      {record.subtaskName}
                    </div>
                    <div className="history-info">
                      <span className="history-duration">
                        🍅 {formatDuration(record.duration)}
                      </span>
                      <span className="history-time">
                        {new Date(record.completedAt).toLocaleTimeString().slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
                {pomodoroHistory.length === 0 && (
                  <div className="history-empty">
                    <Icons.Timer />
                    <p>还没有完成的番茄钟</p>
                    <p className="history-empty-sub">开始你的第一个专注时间吧！</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrganizer;
