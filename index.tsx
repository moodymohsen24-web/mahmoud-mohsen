
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModalProvider } from './context/ModalContext';

// Since we are using CDN for react-router and recharts, we need to ensure they are available on the window
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Recharts: any;
    }
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);