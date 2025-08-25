import { StrictMode, Suspense, } from 'react'
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
import { Loading } from './components/loading.tsx';



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



createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<Loading />}>
    <StrictMode>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      </Provider>
    </StrictMode>
  </Suspense>
)
