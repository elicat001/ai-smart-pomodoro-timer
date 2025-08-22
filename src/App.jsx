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
  Star: () => <span>⭐</span>
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

// 修复的useLocalStorage Hook
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(`aipomodoro_${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('读取localStorage失败:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue((currentValue) => {
        const valueToStore = typeof value === 'function' ? value(currentValue) : value;
        window.localStorage.setItem(`aipomodoro_${key}`, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error('保存localStorage失败:', error);
    }
  }, [key]); // 移除 storedValue 依赖

  return [storedValue, setValue];
};

const usePomodoroTimer = () => {
  const [activePomodoroId, setActivePomodoroId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [pomodoroStatus, setPomodoroStatus] = useState('idle');
  const intervalRef = useRef(null);

  const startPomodoro = useCallback((taskId, subtaskId, duration, taskName, subtaskName) => {
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
  }, [activePomodoroId]);

  const pausePomodoro = useCallback(() => {
    setPomodoroStatus('paused');
  }, []);

  const resumePomodoro = useCallback(() => {
    setPomodoroStatus('running');
  }, []);

  const stopPomodoro = useCallback(() => {
    setActivePomodoroId(null);
    setPomodoroTime(0);
    setPomodoroStatus('idle');
  }, []);

  const completePomodoroSession = useCallback(() => {
    setPomodoroStatus('completed');
    setTimeout(() => {
      stopPomodoro();
    }, 3000);
  }, [stopPomodoro]);

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
  }, [pomodoroStatus, pomodoroTime, completePomodoroSession]);

  return {
    activePomodoroId,
    pomodoroTime,
    pomodoroStatus,
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
  const [analyzingTasks, setAnalyzingTasks] = useState(new Set());
  const [expandedAnalysis, setExpandedAnalysis] = useState(new Set());
  
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
  const [isLoggedIn] = useState(false);

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

  // 智能识别任务类型 - 改进优先级逻辑
  const identifyTaskType = useCallback((taskText) => {
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
      { type: 'coding', keywords: TASK_KEYWORDS.coding } // 编程类型放在最后，避免误判
    ];
    
    for (const { type, keywords } of typeChecks) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }, []);

  // 生成任务分解策略
  const generateTaskStrategy = useCallback((taskType, taskText, duration) => {
    switch (taskType) {
      case 'learning': {
        const isComplexTopic = duration > 90;
        return {
          description: "运用费曼学习法，快速建立认知框架",
          steps: isComplexTopic ? [
            { text: "花5分钟浏览全局，找到核心概念清单", duration: Math.round(duration * 0.08) },
            { text: "选择最重要的3个概念，直接查找实例", duration: Math.round(duration * 0.25) },
            { text: "尝试用自己的话解释给假想的朋友", duration: Math.round(duration * 0.3) },
            { text: "找到一个可以立即应用的场景", duration: Math.round(duration * 0.2) },
            { text: "记录3个关键要点和1个疑问", duration: Math.round(duration * 0.17) }
          ] : [
            { text: "直接找到最关键的核心要点", duration: Math.round(duration * 0.3) },
            { text: "找一个具体例子来理解", duration: Math.round(duration * 0.4) },
            { text: "用自己的话复述一遍", duration: Math.round(duration * 0.3) }
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
              { text: "复现问题，记录具体现象", duration: Math.round(duration * 0.25) },
              { text: "检查最近的代码变更", duration: Math.round(duration * 0.15) },
              { text: "添加调试信息，定位问题代码段", duration: Math.round(duration * 0.35) },
              { text: "修复并验证解决方案", duration: Math.round(duration * 0.25) }
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
              { text: "明确最核心的功能需求", duration: Math.round(duration * 0.15) },
              { text: "先写出最简单能跑的版本", duration: Math.round(duration * 0.45) },
              { text: "测试核心流程是否正常", duration: Math.round(duration * 0.2) },
              { text: "优化用户体验和边界情况", duration: Math.round(duration * 0.2) }
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
              { text: "搭建基础框架，确认环境", duration: Math.round(duration * 0.2) },
              { text: "实现核心逻辑", duration: Math.round(duration * 0.5) },
              { text: "测试和调试", duration: Math.round(duration * 0.3) }
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
        const isLongForm = duration > 60;
        return {
          description: "运用结构化写作法，确保思路清晰",
          steps: isLongForm ? [
            { text: "明确目标读者和核心信息", duration: Math.round(duration * 0.15) },
            { text: "列出3-5个主要论点或章节", duration: Math.round(duration * 0.15) },
            { text: "快速写出第一稿，不要纠结细节", duration: Math.round(duration * 0.45) },
            { text: "检查逻辑结构和关键信息", duration: Math.round(duration * 0.15) },
            { text: "润色语言和格式", duration: Math.round(duration * 0.1) }
          ] : [
            { text: "明确要表达的核心观点", duration: Math.round(duration * 0.2) },
            { text: "快速写出完整草稿", duration: Math.round(duration * 0.6) },
            { text: "检查和修改", duration: Math.round(duration * 0.2) }
          ],
          tips: [
            "先写框架，再填内容",
            "第一稿重在完整，不求完美",
            "多用具体例子说明观点"
          ]
        };
      }
      
      case 'meeting': {
        const isPresentation = taskText.includes('演讲') || taskText.includes('汇报') || taskText.includes('分享');
        
        if (isPresentation) {
          return {
            description: "采用金字塔原理，确保信息传达有效",
            steps: [
              { text: "明确听众最关心的1个问题", duration: Math.round(duration * 0.2) },
              { text: "准备核心观点和3个支撑论据", duration: Math.round(duration * 0.4) },
              { text: "预演关键部分，准备互动环节", duration: Math.round(duration * 0.4) }
            ],
            tips: [
              "先说结论，再说理由",
              "准备具体的数据和例子",
              "预想可能的问题和回答"
            ]
          };
        } else {
          return {
            description: "采用积极倾听法，确保沟通有效",
            steps: [
              { text: "准备要讨论的关键问题清单", duration: Math.round(duration * 0.3) },
              { text: "会议中记录关键信息和行动项", duration: Math.round(duration * 0.5) },
              { text: "会后5分钟整理结论和下一步", duration: Math.round(duration * 0.2) }
            ],
            tips: [
              "会前明确目标和议程",
              "多问开放性问题",
              "确认重要信息是否理解正确"
            ]
          };
        }
      }
      
      case 'analysis': {
        return {
          description: "运用5W1H分析法，系统梳理信息",
          steps: [
            { text: "收集所有相关信息和数据", duration: Math.round(duration * 0.3) },
            { text: "从What/Why/How三个角度分析", duration: Math.round(duration * 0.4) },
            { text: "总结关键发现和可行建议", duration: Math.round(duration * 0.3) }
          ],
          tips: [
            "先看全局再看细节",
            "数据要客观，结论要基于事实",
            "重点是可执行的建议"
          ]
        };
      }
      
      case 'design': {
        return {
          description: "采用设计思维流程，从用户需求出发",
          steps: [
            { text: "明确用户场景和核心需求", duration: Math.round(duration * 0.25) },
            { text: "快速绘制3个不同方案", duration: Math.round(duration * 0.4) },
            { text: "选择最优方案细化关键细节", duration: Math.round(duration * 0.35) }
          ],
          tips: [
            "先解决核心问题，再考虑体验",
            "多画草图，少纠结工具",
            "经常问自己：用户会怎么使用？"
          ]
        };
      }
      
      case 'practice': {
        return {
          description: "采用刻意练习法，专注薄弱环节",
          steps: [
            { text: "识别当前最需要改进的技能点", duration: Math.round(duration * 0.2) },
            { text: "重复练习这个特定技能", duration: Math.round(duration * 0.6) },
            { text: "记录练习结果和改进点", duration: Math.round(duration * 0.2) }
          ],
          tips: [
            "质量比数量重要",
            "离开舒适区，练习困难的部分",
            "及时获得反馈并调整"
          ]
        };
      }
      
      case 'creative': {
        return {
          description: "运用发散-收敛思维，激发创意灵感",
          steps: [
            { text: "设定明确的创作目标和约束", duration: Math.round(duration * 0.15) },
            { text: "发散思维：产出大量想法不评判", duration: Math.round(duration * 0.45) },
            { text: "收敛筛选：选择最有潜力的想法", duration: Math.round(duration * 0.25) },
            { text: "快速制作原型或草稿", duration: Math.round(duration * 0.15) }
          ],
          tips: [
            "先追求数量，再追求质量",
            "借鉴不同领域的灵感",
            "约束能激发更多创意"
          ]
        };
      }
      
      case 'review': {
        return {
          description: "采用系统检查法，确保质量标准",
          steps: [
            { text: "制定检查清单和标准", duration: Math.round(duration * 0.2) },
            { text: "逐项检查，记录发现的问题", duration: Math.round(duration * 0.6) },
            { text: "整理问题清单并确定优先级", duration: Math.round(duration * 0.2) }
          ],
          tips: [
            "检查要有明确的标准",
            "重点关注影响最大的问题",
            "及时反馈给相关人员"
          ]
        };
      }
      
      case 'planning': {
        return {
          description: "采用时间管理法，合理规划安排",
          steps: [
            { text: "明确计划的目标和范围", duration: Math.round(duration * 0.25) },
            { text: "分解任务并估算时间", duration: Math.round(duration * 0.4) },
            { text: "制定时间表和检查点", duration: Math.round(duration * 0.35) }
          ],
          tips: [
            "重要的事情先做",
            "预留缓冲时间",
            "定期检查进度"
          ]
        };
      }
      
      default: {
        return {
          description: "制定通用执行方案，专注核心目标的实现",
          steps: [
            { text: "明确具体的成功标准", duration: Math.round(duration * 0.2) },
            { text: "执行核心工作内容", duration: Math.round(duration * 0.6) },
            { text: "检查结果并记录要点", duration: Math.round(duration * 0.2) }
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

  // 改进的AI分析功能 - 修复状态更新bug
  const analyzeTask = useCallback(async (taskId, taskText, duration = 60) => {
    // 参数验证和类型转换
    if (!taskId || !taskText || typeof taskText !== 'string') {
      console.error('analyzeTask: 参数无效', { taskId, taskText, duration });
      return;
    }

    const finalDuration = Math.max(5, Math.min(300, Number(duration) || 60));
    
    // 先检查任务是否存在
    setTasks(currentTasks => {
      const taskExists = currentTasks.some(task => task.id === taskId);
      if (!taskExists) {
        console.error('任务不存在，无法分析:', taskId);
        return currentTasks;
      }
      return currentTasks;
    });
    
    setAnalyzingTasks(prev => new Set([...prev, taskId]));
    
    try {
      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const taskType = identifyTaskType(taskText);
      const strategy = generateTaskStrategy(taskType, taskText, finalDuration);
      
      const analysis = {
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
        analyzedAt: Date.now()
      };
      
      // 使用更安全的map操作更新任务
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              aiAnalysis: analysis
            };
          }
          return task;
        });
        
        // 验证更新是否成功
        const updatedTask = updatedTasks.find(t => t.id === taskId);
        if (!updatedTask) {
          console.error('任务更新失败，任务不存在:', taskId);
          return prevTasks; // 返回原状态
        }
        
        if (!updatedTask.aiAnalysis) {
          console.error('AI分析添加失败:', taskId);
          return prevTasks; // 返回原状态
        }
        
        return updatedTasks;
      });
      
      setExpandedAnalysis(prev => new Set([...prev, taskId]));
      
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setAnalyzingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [identifyTaskType, getTaskTypeLabel, generateTaskStrategy]);

  // 生成唯一任务ID
  const generateTaskId = useCallback(() => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 任务操作
  const addTask = useCallback(() => {
    if (newTask.trim()) {
      const task = {
        id: generateTaskId(),
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
      setTasks(prev => [...prev, task]);
      setNewTask('');
      setSelectedTime('');
      setEstimatedDuration('');
    }
  }, [newTask, selectedPriority, selectedTime, estimatedDuration, generateTaskId, setTasks]);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const startEdit = useCallback((id, text) => {
    setEditingId(id);
    setEditingText(text);
  }, []);

  const saveEdit = useCallback(() => {
    setTasks(prev => prev.map(task => 
      task.id === editingId ? { ...task, text: editingText } : task
    ));
    setEditingId(null);
    setEditingText('');
  }, [editingId, editingText, setTasks]);

  // 子任务操作
  // 重新分析任务
  const reAnalyzeTask = useCallback((taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, aiAnalysis: null, subtasks: [] }
          : task
      )
    );
    setExpandedAnalysis(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);

  const convertStepsToSubtasks = useCallback((taskId) => {
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
  }, [tasks]);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
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
  }, [setTasks]);

  const toggleAnalysisExpanded = useCallback((taskId) => {
    setExpandedAnalysis(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // 完成番茄钟会话的处理
  const handlePomodoroComplete = useCallback((activeTask, activeSubtask, duration) => {
    const taskName = activeTask.text;
    const subtaskName = activeSubtask ? activeSubtask.text : taskName;

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
      toggleSubtask(activeTask.id, pomodoroHook.activePomodoroId);
    }

    // 通知处理
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 番茄钟完成！', {
        body: `恭喜完成「${subtaskName}」，休息一下吧！`,
        icon: '/favicon.ico'
      });
    }
  }, [setPomodoroHistory, toggleSubtask, pomodoroHook.activePomodoroId]);

  // 修改完成番茄钟的逻辑
  useEffect(() => {
    if (pomodoroHook.pomodoroStatus === 'completed') {
      const activeTask = tasks.find(t => 
        t.id === pomodoroHook.activePomodoroId || 
        t.subtasks.some(s => s.id === pomodoroHook.activePomodoroId)
      );
      
      if (activeTask) {
        const activeSubtask = activeTask.subtasks.find(s => s.id === pomodoroHook.activePomodoroId);
        const duration = activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration;
        handlePomodoroComplete(activeTask, activeSubtask, duration);
      }
    }
  }, [pomodoroHook.pomodoroStatus, pomodoroHook.activePomodoroId, tasks, handlePomodoroComplete]);

  // 工具函数
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDuration = useCallback((minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return 'default-priority';
    }
  }, []);

  // 计算统计数据
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const aiAnalyzed = tasks.filter(t => t.aiAnalysis).length;
    return { total, completed, high, pending: total - completed, aiAnalyzed };
  }, [tasks]);

  const pomodoroStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayPomodoros = pomodoroHistory.filter(p => p.date === today);
    const totalTime = todayPomodoros.reduce((sum, p) => sum + p.duration, 0);
    const totalSessions = todayPomodoros.length;
    return { totalTime, totalSessions };
  }, [pomodoroHistory]);

  const weeklyStats = useMemo(() => {
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
    
    return weekData;
  }, [pomodoroHistory]);

  const achievements = useMemo(() => {
    const newAchievements = [];
    const totalPomodoros = pomodoroHistory.length;
    const todayPomodoros = pomodoroStats.totalSessions;
    
    if (totalPomodoros >= 1) newAchievements.push({ id: 'first', name: '首次专注', icon: '🌱' });
    if (totalPomodoros >= 10) newAchievements.push({ id: 'ten', name: '十次专注', icon: '🔥' });
    if (totalPomodoros >= 50) newAchievements.push({ id: 'fifty', name: '专注达人', icon: '💪' });
    if (totalPomodoros >= 100) newAchievements.push({ id: 'hundred', name: '专注大师', icon: '🏆' });
    
    if (todayPomodoros >= dailyGoal) newAchievements.push({ id: 'daily', name: '今日目标达成', icon: '⭐' });
    if (todayPomodoros >= 10) newAchievements.push({ id: 'super', name: '超级专注日', icon: '💎' });
    
    if (focusStreak >= 3) newAchievements.push({ id: 'streak3', name: '连续专注3天', icon: '🔥' });
    if (focusStreak >= 7) newAchievements.push({ id: 'streak7', name: '连续专注一周', icon: '👑' });
    
    return newAchievements;
  }, [pomodoroHistory.length, pomodoroStats.totalSessions, dailyGoal, focusStreak]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    });
  }, [tasks, filter]);

  const sortedTasks = useMemo(() => {
    return filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  }, [filteredTasks]);

  const getEfficiencyScore = useCallback(() => {
    const completionRate = Math.min((pomodoroStats.totalSessions / dailyGoal) * 100, 100);
    return Math.round(completionRate);
  }, [pomodoroStats.totalSessions, dailyGoal]);

  function getPomodoroOriginalTime() {
    if (!pomodoroHook.activePomodoroId) return 25;
    
    const activeTask = tasks.find(t => 
      t.id === pomodoroHook.activePomodoroId || 
      t.subtasks.some(s => s.id === pomodoroHook.activePomodoroId)
    );
    
    if (activeTask) {
      const activeSubtask = activeTask.subtasks.find(s => s.id === pomodoroHook.activePomodoroId);
      return activeSubtask ? activeSubtask.duration : activeTask.estimatedDuration || 25;
    }
    
    return 25;
  }

  // 初始化和备份提醒
  useEffect(() => {
    if (tasks.length === 0) {
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
    }

    // 检查备份提醒
    const shouldShowReminder = 
      appStats.daysUsed >= 3 || 
      stats.total >= 5 || 
      pomodoroHistory.length >= 10;

    if (shouldShowReminder && !isLoggedIn) {
      const timer = setTimeout(() => setShowBackupReminder(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
                  onClick={() => alert('数据管理功能开发中...')}
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
                  className="duration-input"
                />
                <button onClick={addTask} className="add-btn">
                  <Icons.Plus />
                  添加
                </button>
              </div>
              <div className="tip-text">
                💡 极简体验：AI能识别10种任务类型，提供针对性的执行步骤分解
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
                              onClick={() => pomodoroHook.startPomodoro(task.id, null, task.estimatedDuration, task.text, task.text)}
                              disabled={pomodoroHook.activePomodoroId === task.id}
                              className={`action-btn pomodoro-btn ${pomodoroHook.activePomodoroId === task.id ? 'active' : ''}`}
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

                      {/* AI优化任务分解结果 */}
                      {task.aiAnalysis && expandedAnalysis.has(task.id) && (
                        <div className="analysis-section">
                          <div className="analysis-header">
                            <h4 className="analysis-title">
                              <Icons.Brain />
                              AI智能分解 - {getTaskTypeLabel(task.aiAnalysis.taskType)}
                              <span className="analysis-duration">
                                (总计: {formatDuration(task.aiAnalysis.totalDuration)})
                              </span>
                            </h4>
                            <p className="analysis-text">
                              {task.aiAnalysis.analysis}
                            </p>
                          </div>

                          <div className="analysis-content">
                            {/* 优化的执行步骤 */}
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
                                          onClick={() => pomodoroHook.startPomodoro(
                                            task.id, 
                                            subtask.id, 
                                            subtask.duration, 
                                            task.text, 
                                            subtask.text
                                          )}
                                          disabled={pomodoroHook.activePomodoroId === subtask.id}
                                          className={`subtask-play-btn ${pomodoroHook.activePomodoroId === subtask.id ? 'active' : ''}`}
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
                                    <div key={index} className="step-preview optimized-step">
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

                            {/* 优化建议 */}
                            <div className="tips-section">
                              <h5 className="tips-title">
                                <Icons.Lightbulb />
                                执行建议
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
                <li>• AI能识别学习、编程、写作等10种任务类型</li>
                <li>• 点击🧠获得针对性的步骤分解</li>
                <li>• 每种任务类型都有专门的执行策略</li>
                <li>• 点击▶️开始对应时长番茄钟</li>
                <li>• 保持连续专注获得成就徽章</li>
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
