# CrisisOps Admin

A modern, responsive admin dashboard for crisis and disaster management operations. Built with React 19 and TypeScript, featuring real-time incident tracking, hazard pack management, and interactive map visualization.

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

- **Dashboard Overview** — Real-time statistics and metrics for crisis operations
- **Incident Management** — Track, create, and manage incident reports
- **Hazard Packs** — Organize and deploy emergency response resources
- **Interactive Map View** — Visualize incidents and resources geographically using Leaflet
- **User Profile & Settings** — Customizable user preferences and system configuration
- **Dark/Light Theme** — Full theme support with smooth transitions
- **Responsive Design** — Optimized for desktop and mobile devices

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript 5.6 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 |
| Maps | Leaflet + React Leaflet |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/crisisops-admin.git
   cd crisisops-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ThemeToggle.tsx
├── context/          # React context providers
│   └── ThemeContext.tsx
├── layouts/          # Layout components
│   └── DashboardLayout.tsx
├── pages/            # Page components
│   ├── OverviewPage.tsx
│   ├── IncidentsPage.tsx
│   ├── HazardPacksPage.tsx
│   ├── MapViewPage.tsx
│   ├── SettingsPage.tsx
│   ├── ProfilePage.tsx
│   └── LoginPage.tsx
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Configuration

### Tailwind Theme

Custom theme colors are defined in `tailwind.config.js`:

- `primary` — Main brand color (#1e59f1)
- `background-light` / `background-dark` — Base backgrounds
- `surface-dark` / `card-dark` — Dark mode surfaces
- `border-dark` — Dark mode borders

### Dark Mode

The application uses class-based dark mode. Toggle is available via the `ThemeToggle` component, with state managed through `ThemeContext`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Mosimiloluwa Adebisi**

---

Built with ❤️ for emergency responders and crisis management teams.
