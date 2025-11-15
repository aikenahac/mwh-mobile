# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo (SDK 54) targeting iOS, Android, and Web platforms. The app is named "mwh" (bundle ID: `com.gomwh.mobile`) and uses Expo Router for file-based navigation with the new architecture enabled.

**Key Technologies:**
- Expo Router (v6) with typed routes and React Compiler experimental features
- NativeWind v4 for Tailwind CSS styling
- React Navigation v7 with bottom tabs
- TypeScript with strict mode
- pnpm package manager

## Development Commands

### Starting the Development Server
```bash
pnpm start          # Start Expo dev server
pnpm ios            # Run on iOS simulator
pnpm android        # Run on Android emulator
pnpm web            # Run on web browser
```

### Building
```bash
pnpm build          # Interactive build script (see local-dev-build.js)
```
The build command launches an interactive CLI tool that prompts for:
- Platform (android/ios)
- Build profile (development/ios-simulator/preview/production)
- Build location (local/eas)

### Code Quality
```bash
pnpm lint           # Run ESLint (expo lint)
```

### Utility
```bash
pnpm reset-project  # Move starter code to app-example, create blank app directory
```

## Project Structure

```
/app                    # Expo Router file-based routing
  /_layout.tsx         # Root layout with theme provider
  /(tabs)/             # Tab navigation group
    /_layout.tsx       # Tab navigator configuration
    /index.tsx         # Home tab
    /explore.tsx       # Explore tab
  /modal.tsx           # Modal screen
  /global.css          # Global Tailwind CSS styles

/components            # Reusable React components
  /ui/                 # UI component library (shadcn-style)
  /themed-*.tsx        # Theme-aware components
  /haptic-tab.tsx      # Tab bar with haptic feedback

/hooks                 # Custom React hooks
/constants             # App constants (theme colors, etc.)
/assets                # Static assets (images, fonts)
/scripts               # Build/utility scripts
```

## Architecture & Patterns

### Routing
Uses Expo Router with file-based routing. The `(tabs)` directory creates a tab navigation group. Routes are automatically generated from the file structure. The app has typed routes enabled via `experiments.typedRoutes: true`.

### Theming
- Theme switching via `@react-navigation/native` (DarkTheme/DefaultTheme)
- Custom `useColorScheme` hook with platform-specific implementations (`.web.ts` and `.ts`)
- Theme colors defined in `/constants/theme.ts`
- Global CSS with Tailwind configured via NativeWind

### Styling
- **Primary**: NativeWind v4 (Tailwind CSS for React Native)
- Babel configured with `jsxImportSource: "nativewind"`
- Metro bundler configured with NativeWind plugin
- Global CSS imported in root `_layout.tsx`
- Tailwind config: `/tailwind.config.js` (currently scans `/src/**/*.{ts,tsx}` - may need adjustment)
- Component library configuration: `/components.json` (shadcn-style with path aliases)

### Path Aliases
TypeScript and component library configured with `@/*` alias mapping to project root:
- `@/components` → `/components`
- `@/hooks` → `/hooks`
- `@/constants` → `/constants`
- `@/lib` → `/lib`

### Platform-Specific Code
- Use `.ios.tsx`, `.android.tsx`, `.web.tsx` extensions for platform-specific implementations
- Example: `icon-symbol.tsx` has an iOS-specific variant `icon-symbol.ios.tsx`

## Environment & Build Configuration

### API Endpoints
Configured per environment in `eas.json`:
- **Preview**: `https://beta.gomwh.com/api`
- **Production**: `https://gomwh.com/api`

Use `process.env.EXPO_PUBLIC_API_URL` to access.

### Build Profiles (EAS)
- **development**: Development client, internal distribution
- **ios-simulator**: iOS simulator builds (extends development)
- **preview**: Internal distribution for beta testing
- **production**: Auto-increment versioning, Android APK builds

### Expo Configuration
- New Architecture: **enabled** (`newArchEnabled: true`)
- Edge-to-edge: **enabled** on Android
- Predictive back gesture: **disabled** on Android
- React Compiler: **enabled** (experimental)
- Web bundler: **Metro** (not Webpack)

## Important Notes

### Tailwind Content Path Issue
The `tailwind.config.js` currently scans `./src/**/*.{ts,tsx}` but the project structure uses `/app`, `/components`, etc. at the root level. Update the content array if Tailwind classes aren't being detected:
```js
content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']
```

### NativeWind Setup
- Types: `nativewind-env.d.ts` provides TypeScript definitions
- Metro config: Uses `withNativeWind` wrapper with `input: "./global.css"`
- Babel preset: Includes both `babel-preset-expo` with `jsxImportSource` and `nativewind/babel`

### Package Manager
This project uses **pnpm**, not npm. Always use `pnpm` commands.

### Git Status
The project has several untracked configuration files:
- Prettier config (`.prettierrc`)
- NativeWind types (`nativewind-env.d.ts`)
- Build configs (`eas.json`, `metro.config.js`, `babel.config.js`)
- Tailwind/component configs

Consider committing these configuration files.
- When making UI components, always use shadcn components from react native reusables.
- Always use lucide icons for icons
- This project uses npm