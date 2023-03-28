import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider, GlobalStyle, Protected, UserApi } from '@betacall/ui-kit';
import { Home } from './components/Home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <GlobalStyle />
    <AuthProvider>
      <Protected role={UserApi.Role.ADMIN}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </Protected>
    </AuthProvider>
  </>
);
