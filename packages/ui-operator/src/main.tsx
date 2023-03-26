import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GlobalStyle, Protected, Provider, UserApi } from '@betacall/ui-kit'

import { Main } from './components/Main';
import { Layout } from 'antd';
import { SocketProvider } from './components/SocketProvider';
import { TopDelivery } from './components/TopDelivery';
import { OrderProvider } from './components/OrderProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <GlobalStyle />
    <Layout>
      <AuthProvider>
        <Protected role={UserApi.Role.OPERATOR}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <OrderProvider>
              <SocketProvider>
                <Routes>
                  <Route path="/" element={<Main />} />
                  <Route path="/provider">
                    <Route path={Provider.TOP_DELIVERY} element={<TopDelivery />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </SocketProvider>
            </OrderProvider>
          </BrowserRouter>
        </Protected>
      </AuthProvider>
    </Layout>
  </StrictMode>
);
