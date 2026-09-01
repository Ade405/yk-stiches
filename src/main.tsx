import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalFetch = window.fetch.bind(window);

window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const method = (init?.method ?? (typeof input === 'string' ? 'GET' : input instanceof Request ? input.method : 'GET')).toUpperCase();

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const cookies = document.cookie.split('; ').find((cookie) => cookie.startsWith('yk_csrf='));
    const token = cookies ? decodeURIComponent(cookies.split('=')[1] ?? '') : '';

    if (token) {
      const headers = new Headers(init?.headers ?? {});
      headers.set('X-CSRF-Token', token);
      return originalFetch(input, { ...init, headers, credentials: 'include' });
    }
  }

  return originalFetch(input, { ...init, credentials: 'include' });
}) as typeof window.fetch;

fetch('/api/csrf-token', { credentials: 'include' }).catch((): undefined => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
