import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GlobalStyle, Protected, UserApi } from '@betacall/ui-kit'

import { Main } from './components/Main';
import { Layout } from 'antd';
import { SocketProvider } from './components/SocketProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <GlobalStyle />
    <Layout>
      <AuthProvider>
        <Protected role={UserApi.Role.OPERATOR}>
          <SocketProvider />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </Protected>
      </AuthProvider>
    </Layout>
  </StrictMode>
);
