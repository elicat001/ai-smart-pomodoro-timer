# AI智能番茄钟 (AI Smart Pomodoro Timer)

一个基于AI的智能番茄钟应用，帮助用户更高效地管理任务和时间。通过AI分析将复杂任务分解为具体可执行的步骤，让工作和学习更有条理。

## 项目介绍

这是一个现代化的任务管理与时间管理工具，结合了番茄钟技术和AI智能分析功能：

- 🧠 **AI智能分析** - 自动识别任务类型（学习、编程、写作、会议等），并生成针对性的执行步骤
- 🍅 **番茄钟计时** - 集成番茄钟工作法，帮助保持专注
- 📊 **进度追踪** - 实时统计完成情况和效率分析
- 🎯 **目标管理** - 设置每日目标，跟踪连续专注天数
- 📈 **数据可视化** - 周趋势图表、成就系统等
- 💾 **本地存储** - 数据自动保存到本地，支持离线使用

## 技术特性

- ⚡️ **Vite** - 快速的构建工具和开发服务器
- ⚛️ **React 18** - 最新的React并发特性
- 🔷 **TypeScript** - 类型安全和更好的开发体验  
- 🎨 **现代CSS** - CSS变量系统、响应式设计、暗色模式支持
- 🔧 **热模块替换** - 开发时的即时更新

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vite-react
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Deployment

This project is configured for easy deployment on various platforms:

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Manual Build

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## Development

### Adding New Components

Create new components in the `src/components/` directory:

```tsx
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default MyComponent;
```

### TypeScript Configuration

The project uses strict TypeScript settings for better type safety. Configuration can be found in:
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.node.json` - Node.js specific configuration

### ESLint Configuration

Code style and quality rules are configured in `eslint.config.js`. The project follows modern React and TypeScript best practices.

## Browser Support

This project supports all modern browsers that support ES2015+.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
