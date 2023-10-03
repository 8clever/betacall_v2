import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider, GlobalStyle, Protected, UserApi } from '@betacall/ui-kit';
import { Base } from './components/Base';
import { Loading } from './components/Loading';
import React from 'react';

const pages = import.meta.glob('./pages/**/*.tsx');

const LoadablePage = (props: { prefix?: string }) => {
  const { prefix = "" } = props;
  const params = useParams();
  const path = `./pages${prefix}/${params.page}.tsx`
  const page = pages[path] as () => Promise<{ default: React.ComponentType }>;

  if (!page)
    return <Navigate to="/" />

  const Page = React.lazy(page);

  return (
    <React.Suspense fallback={<Loading />}>
      <Page />
    </React.Suspense>
  )
}

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
              <Route path="/" element={<Navigate to={'/statistics'} />} />
              <Route path="/:page" element={<LoadablePage />} />
              <Route path="*" element={<Navigate to="/" />}/>
            </Routes>
          </Base>
        </BrowserRouter>
      </Protected>
    </AuthProvider>
  </>
);
