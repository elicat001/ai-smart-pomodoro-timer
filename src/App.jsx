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
  X: () => <span>❌</span>
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

  // 初始化数据
  useEffect(() => {
    const savedTasks = loadFromLocal('tasks');
    const savedHistory = loadFromLocal('pomodoroHistory');
    const savedStats = loadFromLocal('appStats');
    
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

  // AI分析功能（简化版，实际使用时需要真实API）
  const analyzeTask = async (taskId, taskText, duration) => {
    setAnalyzingTasks(prev => new Set([...prev, taskId]));
    
    // 模拟AI分析结果
    setTimeout(() => {
      const analysis = {
        analysis: `针对"${taskText}"任务，建议按以下步骤执行，确保高效完成。`,
        totalDuration: duration || 60,
        steps: [
          {
            text: "明确任务目标和要求",
            duration: Math.round((duration || 60) * 0.2),
            order: 1
          },
          {
            text: "准备必要资源和工具",
            duration: Math.round((duration || 60) * 0.2),
            order: 2
          },
          {
            text: "执行核心工作内容",
            duration: Math.round((duration || 60) * 0.5),
            order: 3
          },
          {
            text: "检查和完善成果",
            duration: Math.round((duration || 60) * 0.1),
            order: 4
          }
        ],
        tips: [
          "保持专注，避免外界干扰",
          "定期休息，保持高效状态",
          "及时记录重要想法和进展"
        ]
      };
      
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

        {/* 番茄钟统计侧边栏 */}
        <div className="sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <span className="sidebar-emoji">🍅</span>
              今日统计
            </h3>
            
            {/* 今日统计 */}
            <div className="sidebar-stats">
              <div className="sidebar-stat red">
                <div className="sidebar-stat-number">{pomodoroStats.totalSessions}</div>
                <div className="sidebar-stat-label">完成番茄钟</div>
              </div>
              <div className="sidebar-stat orange">
                <div className="sidebar-stat-number">{formatDuration(pomodoroStats.totalTime)}</div>
                <div className="sidebar-stat-label">专注时间</div>
              </div>
              <div className="sidebar-stat blue">
                <div className="sidebar-stat-number">{appStats.daysUsed}</div>
                <div className="sidebar-stat-label">使用天数</div>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="sidebar-tips">
              <h4 className="sidebar-tips-title">💡 使用提示</h4>
              <ul className="sidebar-tips-list">
                <li>• 设置预计时间，AI分析更准确</li>
                <li>• 点击🧠获得智能步骤分解</li>
                <li>• 点击▶️开始对应时长番茄钟</li>
                <li>• 数据自动保存到本地</li>
              </ul>
            </div>

            {/* 番茄钟历史 */}
            <div className="sidebar-history">
              <h4 className="sidebar-history-title">最近完成</h4>
              <div className="sidebar-history-list">
                {pomodoroHistory.slice(0, 8).map((record) => (
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
