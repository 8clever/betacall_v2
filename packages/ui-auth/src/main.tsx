import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route } from 'react-router-dom';
import { SignIn } from './pages/SignIn';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter basename='/auth'>
      <Route path='/signin' element={<SignIn />}/>
      <Route path="*" element={<Navigate to="/signin" />} />
    </BrowserRouter>
  </StrictMode>
);
