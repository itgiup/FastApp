import { StrictMode, Suspense } from 'react'
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import store from './store/index.ts';

import './index.scss'
import App from './App.tsx'
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import About from './pages/About.tsx';
import { I18nextProvider } from 'react-i18next';
import i18n from './services/i18n.ts';
import GenerateWallets from './pages/generate-wallets/index.tsx';
import Tron from './pages/generate-wallets/tron.tsx';
import NotFound from './pages/NotFound.tsx';
import ICP from './pages/generate-wallets/icp.tsx';



const router = createBrowserRouter([{
  element: <App />,
  children: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
    {
      path: "/generate-wallets",
      element: <GenerateWallets />,
      children: [
        {
          path: 'tron',
          element: <Tron />,
        },
        {
          path: 'icp',
          element: <ICP />,
        },
      ],
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "*",
      element: <NotFound />
    }
  ]
}]);

const loading = (
  <>
    <style>{`
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
          'Helvetica Neue', sans-serif;
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: white;
      }

      .loading img {
        width: 48px;
        height: 48px;
        animation: spin 1.2s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      .loading p {
        margin-top: 10px;
        font-size: 1.2em;
        animation: fadeIn 1.5s ease-in-out infinite alternate;
      }

      @keyframes fadeIn {
        from {
          opacity: 0.5;
        }

        to {
          opacity: 1;
        }
      }
    `}</style>
    <div className="loading">
      <img src="/images/logox48.png" alt="Loading..." />
      <p>Loading...</p>
    </div>
  </>
);



createRoot(document.getElementById('root')!).render(
  <Suspense fallback={loading} >
    <StrictMode>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
            <RouterProvider router={router} />
        </I18nextProvider>
      </Provider>
    </StrictMode>
  </Suspense>
)
