# DocVA

A full-stack clinical documentation platform built with React, Vite, Node.js, Express, PostgreSQL, and cloud-based AI services.

DocVA is designed to support clinical documentation workflows from patient visit audio through transcription, note preparation, review, and administrative management.

## Overview

DocVA provides a role-based workspace for healthcare documentation teams.

The platform supports:

* Clinician workflows for patients and visits
* Audio capture and upload for clinical encounters
* Speech-to-text transcription using Deepgram
* Optional AI-assisted documentation using Anthropic Claude
* Scribe documentation and review workflows
* QPS quality review workflows
* Administrative user and assignment management
* Audit and operational workflows
* Customer and visit data management
* Background job processing
* File storage and secure document access
* Monitoring, testing, and deployment tooling

## Technology Stack

### Frontend

* React
* Vite
* React Router
* JavaScript / JSX
* CSS
* Service/API integration
* Vitest

### Backend

* Node.js
* Express 5
* PostgreSQL
* JWT authentication
* bcrypt
* REST API architecture
* Request validation and middleware
* File upload handling

### AI & Speech

* Deepgram Speech-to-Text
* Anthropic Claude
* AI-assisted clinical documentation workflows

### Cloud & Infrastructure

* AWS S3
* AWS Systems Manager
* AWS CloudWatch Logs
* Redis
* Bull background jobs
* Sentry monitoring
* Vercel
* Docker / deployment configuration

### Testing & Quality

* Jest
* Playwright
* Vitest
* ESLint
* Load-testing utilities
* Database migration tooling

## Application Architecture

```text
DocVA
├── frontend/
│   ├── src/
│   │   ├── __tests__/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── splash/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── __tests__/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── migrations/
    │   ├── routes/
    │   ├── services/
    │   ├── startup/
    │   ├── utils/
    │   └── server.js
    ├── migrations/
    ├── scripts/
    ├── Dockerfile
    ├── package.json
    └── .env.example
```

## Key Engineering Areas

### Role-Based Workflows

The application supports separate workflows for:

* Clinicians
* Medical scribes
* QPS / quality review
* Administrators
* Super administrators

### Audio & Transcription Pipeline

Clinical encounter audio can be processed through a backend workflow involving:

```text
Audio Upload
     ↓
Backend Processing
     ↓
Cloud Storage
     ↓
Speech-to-Text
     ↓
Optional AI Documentation
     ↓
Clinical Review
     ↓
Final Documentation
```

Deepgram is used for speech-to-text processing, while Anthropic Claude can be used for AI-assisted documentation.

### Backend Architecture

The Express backend is organized into controllers, routes, middleware, services, configuration, migrations, startup logic, utilities, and automated tests.

This structure separates API handling, business logic, infrastructure integrations, and shared backend functionality.

### Background Processing

Redis and Bull are used for background job processing and asynchronous workloads.

### Cloud Storage

AWS S3 integrations support application file storage and controlled access to stored resources.

### Monitoring

Sentry and AWS CloudWatch integrations provide application and infrastructure monitoring capabilities.

## Local Development

### Prerequisites

* Node.js
* npm
* PostgreSQL
* Redis
* Required third-party service credentials

### Install

Clone the repository and install dependencies for both applications.

```bash
npm install
npm run install:all
```

### Environment Configuration

Create the required environment files from the provided examples.

Do not commit production credentials, API keys, database passwords, private certificates, or other secrets.

### Start Development

```bash
npm run dev
```

The frontend and backend can then be accessed through their configured development ports.

## Testing

Backend tests:

```bash
cd backend
npm test
```

Backend linting:

```bash
cd backend
npm run lint
```

Frontend tests and checks can be run using the scripts defined in the frontend package configuration.

## Security

The application includes security-related engineering practices such as:

* JWT-based authentication
* Password hashing
* HTTP security headers
* CORS configuration
* Rate limiting
* Environment-based configuration
* Controlled file access
* Audit-related application functionality
* Error and application monitoring

This repository should not contain real patient information, production credentials, private keys, certificates, database dumps, or other sensitive information.

## Project Structure

DocVA follows a separated frontend/backend architecture that allows the user interface, API layer, business services, database access, cloud integrations, and background processing to evolve independently.

The project also includes deployment configuration, database migrations, automated testing, operational scripts, and monitoring utilities.

## Portfolio Highlights

This project demonstrates experience with:

* Full-stack JavaScript development
* React application architecture
* REST API development
* PostgreSQL database applications
* Authentication and authorization
* Cloud storage integration
* Speech-to-text API integration
* AI API integration
* Background job processing
* Role-based application workflows
* Automated testing
* Application monitoring
* Production deployment configuration

## Project Status

DocVA is an actively developed clinical documentation platform with a production-oriented architecture and ongoing improvements to the clinician experience.

> This repository is presented as a software engineering portfolio project. Any production or healthcare deployment should be evaluated separately for applicable security, privacy, regulatory, and organizational requirements.
