import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GlobalStyle, Protected, UserApi } from '@betacall/ui-kit';
import { Base } from './components/Base';
import { Statistics } from './components/Statistics';
import { Users } from './components/Users';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <GlobalStyle />
    <AuthProvider>
      <Protected role={UserApi.Role.ADMIN}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Base>
            <Routes>
              <Route path="/" element={<Statistics />} />
              <Route path="/users" element={<Users />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Base>
        </BrowserRouter>
      </Protected>
    </AuthProvider>
  </>
);
