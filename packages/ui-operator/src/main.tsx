import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GlobalStyle, Protected, Provider, UserApi } from '@betacall/ui-kit'

import { Main } from './components/Main';
import { Layout } from 'antd';
import { SocketProvider } from './components/SocketProvider';
import { TopDelivery } from './components/TopDelivery';
import { OrderProvider } from './components/OrderProvider';
import { ProtectProvider } from './components/ProtectProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <>
    <GlobalStyle />
    <Layout>
      <AuthProvider>
        <Protected role={UserApi.Role.OPERATOR}>
          <OrderProvider>
            <SocketProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                  <Route path="/" element={<Main />} />
                  <Route path="/provider">
                    <Route path={Provider.TOP_DELIVERY} element={
                      <ProtectProvider provider={Provider.TOP_DELIVERY}>
                        <TopDelivery />
                      </ProtectProvider>
                    } />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </BrowserRouter>
            </SocketProvider>
          </OrderProvider>
        </Protected>
      </AuthProvider>
    </Layout>
  </>
);
