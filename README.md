# ForestGrid 🌲🔥

A comprehensive fire risk management and evacuation coordination system built with Next.js, providing real-time monitoring, risk assessment, and emergency response capabilities for forest fire management.

## Features

### 🔥 Fire Risk Management
- **Real-time Fire Risk Grid**: Interactive grid-based fire risk visualization
- **Fire Probability Mapping**: Advanced probability calculations for fire spread
- **Fire Spread Simulation**: Predictive modeling for fire behavior
- **Enhanced Grid Simulation**: Detailed fire progression analysis

### 🚨 Emergency Response
- **Evacuation Alerts**: Automated alert system for high-risk areas
- **Evacuation Command Center**: Centralized evacuation coordination
- **Mission Control Navigation**: Command center for emergency operations
- **Admin Panel**: Administrative controls for system management

### 📊 Monitoring & Analytics
- **Fire Risk Overview**: Comprehensive risk assessment dashboard
- **Real-time Grid Updates**: Live data visualization
- **Historical Data Analysis**: Trend analysis and reporting

## Tech Stack

- **Framework**: Next.js 15+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Charts**: Recharts for data visualization
- **Package Manager**: pnpm
- **State Management**: React hooks and context

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ForestGrid.git
cd ForestGrid
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
ForestGrid/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── admin-panel.tsx    # Admin interface
│   ├── evacuation-*.tsx   # Evacuation system components
│   ├── fire-*.tsx         # Fire management components
│   └── grid-*.tsx         # Grid visualization components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
└── styles/                # Global styles
```

## Key Components

- **Enhanced Grid Simulation**: Advanced fire spread modeling
- **Evacuation Panel**: Emergency coordination interface
- **Fire Risk Grid**: Interactive risk visualization
- **Mission Control Nav**: Central command interface
- **Admin Panel**: System administration tools

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components powered by [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**⚠️ Important**: This system is designed for fire risk management and emergency coordination. Always follow official emergency protocols and consult with local fire departments and emergency services.
