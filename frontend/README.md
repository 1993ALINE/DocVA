# DocVA Frontend

The frontend application for DocVA, a role-based clinical documentation platform.

## Technology

* React
* Vite
* React Router
* JavaScript / JSX
* CSS
* Vitest
* ESLint

## Structure

```text
src/
├── __tests__/
├── assets/
├── auth/
├── components/
├── pages/
├── services/
├── splash/
├── utils/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Application Areas

The frontend provides role-based interfaces and shared application functionality for:

* Clinicians
* Medical scribes
* QPS / quality review
* Administrators
* Super administrators

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Configuration

Environment-specific configuration is provided through environment files.

Do not commit production credentials, API keys, passwords, private keys, or other sensitive information.

## Related Backend

The DocVA backend is located in the repository's `backend/` directory and provides the REST API, authentication, database integration, file handling, AI/transcription integrations, and background processing.
