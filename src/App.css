import React, { useState, useEffect, useRef, useCallback } from 'react';

const FocusTimer = () => {
  // 极简状态管理
  const [task, setTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // 计时逻辑
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      if (timeLeft === 0 && isActive) {
        handleComplete();
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  // 完成处理
  const handleComplete = useCallback(() => {
    setIsActive(false);
    
    // 音效提示
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    
    // 通知
    if (Notification.permission === 'granted') {
      new Notification(isBreak ? '休息结束' : '专注完成', {
        body: isBreak ? '开始下一个专注' : `完成: ${task}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>'
      });
    }
    
    if (!isBreak) {
      setSessions(prev => prev + 1);
      setIsBreak(true);
      setTimeLeft(5 * 60); // 5分钟休息
      setTask('休息时间');
    } else {
      setIsBreak(false);
      setTimeLeft(0);
      setTask('');
    }
  }, [isBreak, task]);

  // 开始专注
  const startFocus = useCallback((inputTask, duration = 25) => {
    if (!inputTask.trim()) return;
    
    setTask(inputTask.trim());
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsBreak(false);
    
    // 请求通知权限
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 快速开始（回车键）
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      startFocus(e.target.value);
      e.target.blur(); // 失焦以便快捷键生效
    }
  }, [startFocus]);

  // 全局快捷键
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (timeLeft > 0) setIsActive(!isActive);
          break;
        case 'Escape':
          e.preventDefault();
          setIsActive(false);
          setTimeLeft(0);
          setTask('');
          setIsBreak(false);
          break;
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowStats(!showStats);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [isActive, timeLeft, showStats]);

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度
  const progress = timeLeft > 0 ? ((isBreak ? 5 * 60 : 25 * 60) - timeLeft) / (isBreak ? 5 * 60 : 25 * 60) * 100 : 0;

  // 专注模式渲染
  if (timeLeft > 0 && isActive) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: isBreak ? 
          'linear-gradient(135deg, #00b894 0%, #00a085 100%)' :
          'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none'
      }}>
        <audio ref={audioRef}>
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dfm2AcCj+S3/LGeCUFLYHF8dycRAkVYrjn6aZUFAlGnu/mnFwbDD+Y2u/FeSUGKH/I8dyaQAoUYLXp6qZTFAhGneXmo2IbCjaA2uu8cSMEJn/L9N2Xvj4HGm297OytUxcFADGS2fLWfSwFJX7H8N2hT" type="audio/wav" />
        </audio>

        {/* 任务标题 */}
        <div style={{
          fontSize: '18px',
          opacity: 0.8,
          marginBottom: '32px',
          textAlign: 'center',
          maxWidth: '70%'
        }}>
          {task}
        </div>

        {/* 主计时器 */}
        <div style={{
          fontSize: '96px',
          fontWeight: '100',
          marginBottom: '48px',
          fontFamily: 'Georgia, serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* 简洁进度条 */}
        <div style={{
          width: '300px',
          height: '2px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '1px',
          overflow: 'hidden',
          marginBottom: '48px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'white',
            transition: 'width 1s linear'
          }} />
        </div>

        {/* 控制按钮 */}
        <div style={{
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => setIsActive(false)}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            暂停
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setTimeLeft(0);
              setTask('');
              setIsBreak(false);
            }}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            结束
          </button>
        </div>

        {/* 快捷键提示 */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          fontSize: '12px',
          opacity: 0.6
        }}>
          空格暂停 • Esc结束
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* 主卡片 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          marginBottom: showStats ? '24px' : '0'
        }}>
          <h1 style={{
            fontSize: '28px',
            margin: '0 0 40px 0',
            color: '#2d3436',
            fontWeight: '400'
          }}>
            专注计时器
          </h1>

          {/* 任务输入 */}
          <div style={{ marginBottom: '32px' }}>
            <input
              type="text"
              placeholder="输入任务，按回车开始专注"
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                textAlign: 'center'
              }}
            />
          </div>

          {/* 快速开始按钮 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '32px'
          }}>
            {[
              { label: '25分钟', value: 25 },
              { label: '45分钟', value: 45 },
              { label: '60分钟', value: 60 }
            ].map(({label, value}) => (
              <button
                key={value}
                onClick={() => {
                  const input = document.querySelector('input[type="text"]');
                  if (input && input.value.trim()) {
                    startFocus(input.value, value);
                  }
                }}
                style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#495057'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 当前状态 */}
          {timeLeft > 0 && !isActive && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '32px',
                color: isBreak ? '#00b894' : '#e17055',
                marginBottom: '8px'
              }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6c757d',
                marginBottom: '16px'
              }}>
                {task}
              </div>
              <button
                onClick={() => setIsActive(true)}
                style={{
                  padding: '12px 24px',
                  background: isBreak ? '#00b894' : '#e17055',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                继续
              </button>
            </div>
          )}

          {/* 快捷操作 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showStats ? '隐藏' : '显示'}统计
            </button>
          </div>
        </div>

        {/* 统计面板 */}
        {showStats && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e17055' }}>
                  {sessions}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  今日完成
                </div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00b894' }}>
                  {Math.floor(sessions * 25 / 60)}h{(sessions * 25) % 60}m
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  专注时长
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '16px',
              fontSize: '11px',
              color: '#adb5bd'
            }}>
              Ctrl+S 切换显示 • 数据仅本地保存
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;
