import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const OptimizedPomodoro = () => {
  // 核心状态
  const [currentTask, setCurrentTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [suggestedDuration, setSuggestedDuration] = useState(25);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // 窗口尺寸监听
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
    return () => window.removeEventListener('resize', updateWindowWidth);
  }, []);

  // 智能时长推荐
  const suggestDuration = useCallback((taskText) => {
    if (!taskText) return 25;
    
    const text = taskText.toLowerCase();
    
    if (text.includes('会议') || text.includes('讨论')) return 60;
    if (text.includes('阅读') || text.includes('学习')) return 45;
    if (text.includes('写作') || text.includes('文档')) return 40;
    if (text.includes('编程') || text.includes('代码')) return 50;
    if (text.includes('设计') || text.includes('创作')) return 35;
    if (text.includes('邮件') || text.includes('回复')) return 15;
    
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
    
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    
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
      setSessionCount(prev => prev + 1);
      setIsBreak(true);
      const breakTime = (sessionCount + 1) % 4 === 0 ? 15 : 5;
      setTimeLeft(breakTime * 60);
      setIsFocusMode(false);
    } else {
      setIsBreak(false);
      setTimeLeft(suggestedDuration * 60);
    }
  }, [isBreak, currentTask, sessionCount, suggestedDuration]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e) => {
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
          } else if (inputRef.current) {
            inputRef.current.focus();
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
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, currentTask, timeLeft, isFocusMode]);

  const startFocusSession = useCallback(() => {
    if (!currentTask.trim()) return;
    
    setIsRunning(true);
    setIsFocusMode(true);
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [currentTask]);

  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    setIsRunning(false);
  }, []);

  const resetSession = useCallback(() => {
    setIsRunning(false);
    setIsFocusMode(false);
    setIsBreak(false);
    setTimeLeft(suggestedDuration * 60);
  }, [suggestedDuration]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = useMemo(() => {
    const totalTime = isBreak ? 
      ((sessionCount % 4 === 0 && sessionCount > 0) ? 15 * 60 : 5 * 60) : 
      suggestedDuration * 60;
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  }, [timeLeft, isBreak, sessionCount, suggestedDuration]);

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
  const showSidebar = windowWidth > 1200;

  // 沉浸式专注模式
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
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dfm2AcCj+S3/LGeCUFLYHF8dycRAkVYrjn6aZUFAlGnu/mnFwbDD+Y2u/FeSUGKH/I8dyaQAoUYLXp6qZTFAhGneXmo2IbCjaA2uu8cSMEJn/L9N2Xvj4HGm297OytUxcFADGS2fLWfSwFJX7H8N2hT" type="audio/wav" />
        </audio>

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

        <div style={{
          fontSize: '120px',
          fontWeight: '100',
          fontFamily: 'Georgia, serif',
          marginBottom: '48px',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          {formatTime(timeLeft)}
        </div>

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
          >
            退出专注
          </button>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '14px',
          opacity: 0.7,
          textAlign: 'center'
        }}>
          空格键：暂停/继续 | Esc：退出专注模式
        </div>

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

  // 正常模式
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
        display: 'grid',
        gridTemplateColumns: showSidebar ? '1fr 400px' : '1fr',
        gap: '32px',
        maxWidth: '1200px',
        width: '100%',
        alignItems: 'start'
      }}>
        {/* 主要内容区域 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            margin: '0 0 48px 0',
            color: '#2c3e50',
            fontWeight: '300'
          }}>
            智能专注助手
          </h1>

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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentTask.trim()) {
                  startFocusSession();
                }
              }}
            />
          </div>

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

          <div style={{
            fontSize: '12px',
            color: '#999',
            borderTop: '1px solid #f1f3f4',
            paddingTop: '16px'
          }}>
            快捷键：回车开始 | 空格暂停/继续 | Shift+Tab切换模式
          </div>
        </div>

        {/* 侧边栏 */}
        {showSidebar && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                margin: '0 0 16px 0',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                今日统计
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>完成番茄钟</span>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#e74c3c' 
                  }}>
                    {sessionCount}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>专注时长</span>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#27ae60' 
                  }}>
                    {Math.floor(sessionCount * 25 / 60)}h{(sessionCount * 25) % 60}m
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                margin: '0 0 16px 0',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                专注建议
              </h3>
              <div style={{
                padding: '16px',
                backgroundColor: '#e8f4fd',
                borderRadius: '12px',
                borderLeft: '4px solid #3498db'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#2c3e50',
                  lineHeight: '1.5'
                }}>
                  {sessionCount === 0 && "开始你的第一个专注会话，建议选择一个具体明确的任务"}
                  {sessionCount >= 1 && sessionCount < 4 && "保持节奏，每个番茄钟后记得休息5分钟"}
                  {sessionCount >= 4 && "已完成多个番茄钟，考虑安排15分钟长休息"}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '18px',
                margin: '0 0 16px 0',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                快捷键
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: '回车', desc: '快速开始专注' },
                  { key: '空格', desc: '暂停/继续计时' },
                  { key: 'Esc', desc: '退出专注模式' }
                ].map((tip, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px'
                  }}>
                    <kbd style={{
                      padding: '2px 6px',
                      backgroundColor: '#f1f3f4',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {tip.key}
                    </kbd>
                    <span style={{ color: '#666' }}>{tip.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedPomodoro;
