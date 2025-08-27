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
import { Loading } from './components/Loading.tsx';
import LoginPage from './pages/users/login.tsx';
import MePage from './pages/users/me.tsx';
import { AuthProvider } from './components/users/AuthContext.tsx';
import ProtectedRoute from './components/users/ProtectedRoute.tsx';
import DashboardLayout from './pages/dashboard/DashboardLayout.tsx';
import DashboardOverview from './pages/dashboard/DashboardOverview.tsx';
import DashboardUsers from './pages/dashboard/DashboardUsers.tsx';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics.tsx';
import ProtectedRouteSuper from './components/users/ProtectedRouteSuper.tsx';
import SignupPage from './pages/users/Signup.tsx';



const router = createBrowserRouter([{
  element: <App />,
  children: [
    // /
    {
      path: "/",
      element: <Home />,
    },
    // settings
    {
      path: "/settings",
      element: <Settings />,
    },
    // generate-wallets
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
    // about
    {
      path: "/about",
      element: <About />,
    },
    // user
    {
      path: '/user',
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "signup",
          element: <SignupPage />,
        },
        {
          element: <ProtectedRoute />, // bảo vệ các route dưới đây
          children: [
            {
              index: true, // /user
              element: <MePage />,
            },
            {
              path: "me",
              element: <MePage />,
            },
          ],
        },
      ],
    },
    // Dashboard và các trang con của nó
    {
      path: "/dashboard",
      // Sử dụng ProtectedRoute để bảo vệ toàn bộ dashboard
      element: <ProtectedRouteSuper />,
      children: [
        {
          element: <DashboardLayout />, // DashboardLayout sẽ chứa Outlet để hiển thị các route con
          children: [
            {
              index: true,
              element: <DashboardOverview />,
            },
            {
              path: 'overview',
              element: <DashboardOverview />,
            },
            {
              path: "users",
              element: <DashboardUsers />,
            },
            {
              path: "analytics",
              element: <DashboardAnalytics />,
            },
          ]
        },
      ],
    },
    // *
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
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </I18nextProvider>
      </Provider>
    </StrictMode>
  </Suspense>
)
