import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const OptimizedPomodoro = () => {
  // 核心状态 - 大幅简化
  const [currentTask, setCurrentTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [suggestedDuration, setSuggestedDuration] = useState(25);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // 智能时长推荐
  const suggestDuration = useCallback((taskText) => {
    if (!taskText) return 25;
    
    const text = taskText.toLowerCase();
    
    // 基于任务类型的智能建议
    if (text.includes('会议') || text.includes('讨论')) return 60;
    if (text.includes('阅读') || text.includes('学习')) return 45;
    if (text.includes('写作') || text.includes('文档')) return 40;
    if (text.includes('编程') || text.includes('代码')) return 50;
    if (text.includes('设计') || text.includes('创作')) return 35;
    if (text.includes('邮件') || text.includes('回复')) return 15;
    
    // 基于任务长度的粗略估算
    if (text.length > 50) return 45;
    if (text.length > 20) return 35;
    
    return 25;
  }, []);

  // 任务输入处理
  useEffect(() => {
    if (currentTask.trim()) {
      const suggested = suggestDuration(currentTask);
      setSuggestedDuration(suggested);
      if (!isRunning) {
        setTimeLeft(suggested * 60);
      }
    }
  }, [currentTask, suggestDuration, isRunning]);

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // 会话完成处理
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    // 音效提示
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    
    // 浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        isBreak ? '休息结束，开始工作！' : '专注完成，该休息了！',
        {
          body: isBreak ? '准备好开始下一个专注会话' : `完成了「${currentTask}」`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
        }
      );
    }
    
    if (!isBreak) {
      // 工作会话完成，开始休息
      setSessionCount(prev => prev + 1);
      setIsBreak(true);
      const breakTime = (sessionCount + 1) % 4 === 0 ? 15 : 5; // 每4个番茄钟长休息
      setTimeLeft(breakTime * 60);
      setIsFocusMode(false); // 退出专注模式
    } else {
      // 休息完成，准备下一个工作会话
      setIsBreak(false);
      setTimeLeft(suggestedDuration * 60);
    }
  }, [isBreak, currentTask, sessionCount, suggestedDuration]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 只在非输入状态下响应快捷键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (timeLeft > 0) {
            setIsRunning(!isRunning);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (!isRunning && currentTask.trim()) {
            startFocusSession();
          } else {
            inputRef.current?.focus();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isFocusMode) {
            exitFocusMode();
          }
          break;
        case 'Tab':
          if (e.shiftKey) {
            e.preventDefault();
            setIsFocusMode(!isFocusMode);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, currentTask, timeLeft, isFocusMode]);

  // 开始专注会话
  const startFocusSession = useCallback(() => {
    if (!currentTask.trim()) return;
    
    setIsRunning(true);
    setIsFocusMode(true);
    
    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [currentTask]);

  // 退出专注模式
  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    setIsRunning(false);
  }, []);

  // 重置会话
  const resetSession = useCallback(() => {
    setIsRunning(false);
    setIsFocusMode(false);
    setIsBreak(false);
    setTimeLeft(suggestedDuration * 60);
  }, [suggestedDuration]);

  // 格式化时间
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 计算进度
  const progress = useMemo(() => {
    const totalTime = isBreak ? 
      ((sessionCount % 4 === 0 && sessionCount > 0) ? 15 * 60 : 5 * 60) : 
      suggestedDuration * 60;
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  }, [timeLeft, isBreak, sessionCount, suggestedDuration]);

  // 获取当前模式信息
  const getModeInfo = useCallback(() => {
    if (isBreak) {
      const isLongBreak = sessionCount % 4 === 0 && sessionCount > 0;
      return {
        title: isLongBreak ? '长休息时间' : '短休息时间',
        color: isLongBreak ? '#3498db' : '#27ae60',
        icon: isLongBreak ? '🌱' : '☕',
        bgGradient: isLongBreak ? 
          'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' : 
          'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
      };
    } else {
      return {
        title: '专注时间',
        color: '#e74c3c',
        icon: '🍅',
        bgGradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
      };
    }
  }, [isBreak, sessionCount]);

  const modeInfo = getModeInfo();

  // 沉浸式专注模式渲染
  if (isFocusMode) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: modeInfo.bgGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'white',
        userSelect: 'none'
      }}>
        {/* 音频元素 */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dfm2AcCj+S3/LGeCUFLYHF8dycRAkVYrjn6aZUFAlGnu/mnFwbDD+Y2u/FeSUGKH/I8dyaQAoUYLXp6qZTFAhGneXmo2IbCjaA2uu8cSMEJn/L9N2Xvj4HGm297OytUxcFADGS2fLWfSwFJX7H8N2hT" type="audio/wav" />
        </audio>

        {/* 当前任务显示 */}
        <div style={{
          fontSize: '24px',
          fontWeight: '300',
          marginBottom: '32px',
          textAlign: 'center',
          opacity: 0.9,
          maxWidth: '80%'
        }}>
          {isBreak ? modeInfo.title : `正在专注：${currentTask}`}
        </div>

        {/* 大型计时器 */}
        <div style={{
          fontSize: '120px',
          fontWeight: '100',
          fontFamily: 'Georgia, serif',
          marginBottom: '48px',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* 进度环 */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          marginBottom: '48px'
        }}>
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              style={{
                transition: 'stroke-dashoffset 1s linear'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px'
          }}>
            {modeInfo.icon}
          </div>
        </div>

        {/* 控制按钮 */}
        <div style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              color: modeInfo.color,
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            {isRunning ? '暂停' : '继续'}
          </button>
          
          <button
            onClick={exitFocusMode}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            退出专注
          </button>
        </div>

        {/* 快捷键提示 */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '14px',
          opacity: 0.7,
          textAlign: 'center'
        }}>
          空格键：暂停/继续 | Esc：退出专注模式
        </div>

        {/* 会话计数 */}
        <div style={{
          position: 'absolute',
          top: '32px',
          right: '32px',
          fontSize: '16px',
          opacity: 0.8
        }}>
          第 {sessionCount + 1} 个番茄钟
        </div>
      </div>
    );
  }

  // 正常模式渲染
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* 标题 */}
        <h1 style={{
          fontSize: '32px',
          margin: '0 0 48px 0',
          color: '#2c3e50',
          fontWeight: '300'
        }}>
          智能专注助手
        </h1>

        {/* 任务输入 */}
        <div style={{ marginBottom: '32px' }}>
          <input
            ref={inputRef}
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="现在要专注做什么？（按回车开始）"
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '18px',
              border: '2px solid #f1f3f4',
              borderRadius: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: '#fafafa'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.backgroundColor = 'white';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#f1f3f4';
              e.target.style.backgroundColor = '#fafafa';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && currentTask.trim()) {
                startFocusSession();
              }
            }}
          />
        </div>

        {/* 智能建议 */}
        {currentTask.trim() && (
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'left'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💡 智能建议
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              建议专注时长：{suggestedDuration} 分钟
            </div>
            {suggestedDuration !== 25 && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                基于任务类型自动调整
              </div>
            )}
          </div>
        )}

        {/* 当前状态 */}
        {timeLeft > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '300',
              color: modeInfo.color,
              marginBottom: '16px'
            }}>
              {formatTime(timeLeft)}
            </div>
            
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#f1f3f4',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: modeInfo.color,
                transition: 'width 1s linear'
              }} />
            </div>

            <div style={{ fontSize: '16px', color: '#666' }}>
              {modeInfo.title} - 今日已完成 {sessionCount} 个番茄钟
            </div>
          </div>
        )}

        {/* 主要操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {timeLeft > 0 ? (
            <>
              <button
                onClick={startFocusSession}
                disabled={!currentTask.trim()}
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: !currentTask.trim() ? '#ccc' : '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: !currentTask.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                进入专注模式
              </button>
              
              <button
                onClick={resetSession}
                style={{
                  padding: '16px 24px',
                  fontSize: '16px',
                  color: '#666',
                  backgroundColor: 'transparent',
                  border: '2px solid #e1e8ed',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                重置
              </button>
            </>
          ) : (
            <div style={{ padding: '20px', color: '#666' }}>
              输入任务内容开始专注
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div style={{
          fontSize: '12px',
          color: '#999',
          borderTop: '1px solid #f1f3f4',
          paddingTop: '16px'
        }}>
          快捷键：回车开始 | 空格暂停/继续 | Shift+Tab切换模式
        </div>
      </div>
    </div>
  );
};

export default OptimizedPomodoro;
