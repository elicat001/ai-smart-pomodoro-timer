# React + TypeScript + Vite

A modern React application built with TypeScript and Vite for fast development and optimal production builds.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Latest React with concurrent features
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **ESLint** - Code linting for consistent code style
- 🔧 **Hot Module Replacement (HMR)** - Instant updates during development

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
