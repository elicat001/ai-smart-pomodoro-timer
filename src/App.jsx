/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.5;
  color: #374151;
  background: linear-gradient(135deg, #EBF4FF 0%, #C7D2FE 100%);
  min-height: 100vh;
}

/* 应用容器 */
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
}

/* 布局网格 */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

/* 主内容区域 */
.main-content {
  grid-column: 1;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 头部统计 */
.header-stats {
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  color: white;
  padding: 2rem;
  position: relative;
}

.header-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.header-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle {
  font-size: 0.875rem;
  font-weight: normal;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-green { color: #86EFAC; }
.stat-yellow { color: #FDE047; }
.stat-red { color: #FCA5A5; }
.stat-purple { color: #D8B4FE; }
.stat-cyan { color: #7DD3FC; }

.stat-label {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* 番茄钟状态栏 */
.pomodoro-status {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: white;
  padding: 1rem;
}

.pomodoro-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.pomodoro-indicator {
  width: 0.75rem;
  height: 0.75rem;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pomodoro-text {
  font-weight: 600;
}

.pomodoro-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pomodoro-timer {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.pomodoro-buttons {
  display: flex;
  gap: 0.5rem;
}

.pomodoro-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pomodoro-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.pomodoro-progress {
  width: 100%;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-top: 0.5rem;
}

.pomodoro-progress-bar {
  height: 100%;
  background: white;
  border-radius: 0.25rem;
  transition: width 1s linear;
}

/* 任务添加 */
.add-task-section {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.add-task-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .add-task-form {
    flex-direction: column;
  }
}

.task-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.task-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.priority-select,
.time-input,
.duration-input {
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.duration-input {
  width: 100px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #2563EB;
}

.tip-text {
  font-size: 0.875rem;
  color: #6B7280;
}

/* 过滤器 */
.filter-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: white;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
}

.filter-btn:hover {
  background: #F3F4F6;
}

.filter-btn.active {
  background: #DBEAFE;
  color: #1D4ED8;
}

/* 任务列表 */
.tasks-section {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6B7280;
}

.empty-state span {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-title {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #9CA3AF;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  border: 2px solid #E5E7EB;
  border-radius: 0.75rem;
  background: white;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #BFDBFE;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  background: #F9FAFB;
  border-color: #D1D5DB;
  opacity: 0.75;
}

.task-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.task-checkbox {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #D1D5DB;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.task-checkbox:hover {
  border-color: #10B981;
}

.task-checkbox.checked {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

.priority-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 500;
}

.high-priority {
  color: #DC2626;
  background: #FEF2F2;
  border-color: #FCA5A5;
}

.medium-priority {
  color: #D97706;
  background: #FFFBEB;
  border-color: #FCD34D;
}

.low-priority {
  color: #059669;
  background: #ECFDF5;
  border-color: #A7F3D0;
}

.default-priority {
  color: #6B7280;
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.task-time,
.task-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.task-duration {
  color: #7C3AED;
  background: #F3E8FF;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.task-text-container {
  flex: 1;
}

.task-text {
  cursor: pointer;
  transition: color 0.2s;
}

.task-text:hover {
  color: #3B82F6;
}

.completed-text {
  text-decoration: line-through;
  color: #9CA3AF;
}

.task-edit-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.task-edit-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.pomodoro-btn {
  color: #DC2626;
}

.pomodoro-btn:hover,
.pomodoro-btn.active {
  background: #FEF2F2;
  color: #B91C1C;
}

.ai-btn {
  color: #7C3AED;
}

.ai-btn:hover {
  background: #F3E8FF;
  color: #6D28D9;
}

.edit-btn {
  color: #6B7280;
}

.edit-btn:hover {
  background: #DBEAFE;
  color: #3B82F6;
}

.delete-btn {
  color: #6B7280;
}

.delete-btn:hover {
  background: #FEF2F2;
  color: #DC2626;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* AI分析区域 */
.analysis-section {
  border-top: 1px solid #E5E7EB;
  background: linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 100%);
  padding: 1rem;
}

.analysis-header {
  margin-bottom: 1rem;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.analysis-duration {
  font-size: 0.875rem;
  font-weight: normal;
  color: #7C3AED;
}

.analysis-text {
  color: #4B5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.analysis-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .analysis-content {
    grid-template-columns: 1fr;
  }
}

.steps-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.steps-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.start-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #FEF2F2;
  color: #B91C1C;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-btn:hover {
  background: #FCA5A5;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
}

.subtask-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.subtask-checkbox:hover {
  border-color: #10B981;
}

.subtask-checkbox.checked {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

.subtask-content {
  flex: 1;
}

.subtask-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
}

.subtask-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.subtask-duration {
  font-size: 0.75rem;
  color: #DC2626;
  background: #FEF2F2;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.subtask-time {
  font-size: 0.75rem;
  color: #059669;
}

.subtask-play-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: #DC2626;
  cursor: pointer;
  transition: all 0.2s;
}

.subtask-play-btn:hover,
.subtask-play-btn.active {
  background: #FEF2F2;
}

.progress-section {
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #E5E7EB;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #DC2626;
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.steps-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
}

.step-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
}

.step-duration {
  font-size: 0.875rem;
  font-weight: 600;
  color: #DC2626;
  background: #FEF2F2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.tips-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
}

.tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #4B5563;
}

.tip-icon {
  font-size: 1rem;
  color: #F59E0B;
}

/* 侧边栏 */
.sidebar {
  grid-column: 2;
}

@media (max-width: 1024px) {
  .sidebar {
    grid-column: 1;
  }
}

.sidebar-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: sticky;
  top: 1.5rem;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-emoji {
  font-size: 1.5rem;
}

.sidebar-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sidebar-stat {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.sidebar-stat.red {
  background: #FEF2F2;
}

.sidebar-stat.orange {
  background: #FFF7ED;
}

.sidebar-stat.blue {
  background: #EBF8FF;
}

.sidebar-stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.sidebar-stat.red .sidebar-stat-number {
  color: #DC2626;
}

.sidebar-stat.orange .sidebar-stat-number {
  color: #EA580C;
}

.sidebar-stat.blue .sidebar-stat-number {
  color: #2563EB;
}

.sidebar-stat-label {
  font-size: 0.875rem;
  color: #6B7280;
}

.sidebar-tips {
  background: linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 100%);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.sidebar-tips-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.sidebar-tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-tips-list li {
  font-size: 0.75rem;
  color: #6B7280;
}

.sidebar-history-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.sidebar-history-list {
  max-height: 16rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
}

.history-task {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-duration {
  font-size: 0.75rem;
  color: #DC2626;
  background: #FEF2F2;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.history-time {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.history-empty {
  text-align: center;
  padding: 2rem 0;
  color: #9CA3AF;
}

.history-empty span {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.history-empty p {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.history-empty-sub {
  font-size: 0.75rem;
  color: #D1D5DB;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-text-center {
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.modal-content h3 {
  font-size: 1.125rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 0.5rem;
}

.modal-content p {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-green {
  background: #10B981;
  color: white;
}

.btn-green:hover {
  background: #059669;
}

.btn-blue {
  background: #3B82F6;
  color: white;
}

.btn-blue:hover {
  background: #2563EB;
}

.btn-gray {
  color: #6B7280;
  background: transparent;
}

.btn-gray:hover {
  color: #4B5563;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .app-container {
    padding: 1rem;
  }
  
  .header-stats {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .add-task-form {
    flex-direction: column;
  }
  
  .task-main {
    flex-wrap: wrap;
  }
  
  .task-actions {
    flex-wrap: wrap;
  }
}
