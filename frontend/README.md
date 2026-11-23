# Orvendiq Frontend

### Interactive Fintech Dashboard & Fraud Risk Monitoring

Orvendiq Frontend is a responsive fintech dashboard built with React,
TypeScript, and Vite. It provides an interactive interface for a
Spring Boot and Oracle Database financial transaction simulation.

> This is a portfolio project. It does not process real money.

## Features

### Overview Dashboard
- Financial account summary
- Balance and transaction insights
- Live fraud risk information
- Animated dashboard components

### Money Transfers
- Account-to-account transfer interface
- REST API integration
- Backend validation and error feedback

### Transaction History
- Transaction history visualization
- Transaction details
- Automatic data refresh where supported

### Fraud Analytics
- Rule-based fraud risk assessment visualization
- LOW, MEDIUM, and HIGH risk classifications
- Risk indicators and investigation details

### Settings
- Session information
- Account information
- Interface preferences
- Application details

### User Experience
- Responsive desktop, tablet, and mobile layouts
- Muted Dusty Rose visual theme
- Smooth scrolling with Lenis
- GSAP and Motion animations
- Reduced-motion accessibility support

## Technology Stack

| Category | Technology |
|---|---|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animation | GSAP, Motion |
| Scrolling | Lenis |
| Backend Integration | REST API |
| Backend | Java Spring Boot |
| Database | Oracle Database Free |

## Application Architecture

```text
React + TypeScript
        |
        v
 Dashboard UI
        |
        +-- Overview
        +-- Transfers
        +-- Transactions
        +-- Fraud Analytics
        +-- Settings
        |
        v
 API Client
        |
        v
 Spring Boot REST API
        |
        v
 Oracle Database
```

## Local Development

### Requirements

- Node.js and npm
- Orvendiq Spring Boot backend
- Oracle Database configured for the backend

### Install Dependencies

```powershell
npm install
```

### Start Development Server

```powershell
npm run dev
```

The default Vite development URL is:

http://localhost:5173

The application uses backend API integration during local development.
Ensure the Spring Boot backend is available and the Vite proxy is
configured correctly.

### Production Build

```powershell
npm run build
```

The compiled frontend is generated in the `dist` directory.

## Authentication

The frontend integrates with the backend JWT authentication flow.

- Login is validated by the backend.
- Protected API requests require an authenticated session.
- Account access is enforced by backend authorization rules.
- Frontend controls are not a substitute for backend security.

## Fraud Monitoring

The fraud dashboard displays assessment results produced by the
Spring Boot fraud engine.

Risk scores are rule-based indicators for demonstration purposes,
not definitive evidence of fraud or transaction safety.

## Project Scope

Orvendiq is a financial technology portfolio simulation.

It is not a production banking platform, payment processor,
or licensed financial service.

## Backend

The backend is built with Java Spring Boot, Spring Security,
Oracle Database, and a double-entry ledger architecture.

## Author

Dwi Nisyatul Wardah

Information Technology Graduate

GitHub: https://github.com/dnwardah-dev