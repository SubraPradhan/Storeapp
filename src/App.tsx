import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loader from './components/Loader';

const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OtpVerification = lazy(() => import('./pages/OtpVerification'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));

const App: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/verify/:orderRef" element={<OtpVerification />} />
          <Route path="/track/:orderRef" element={<OrderTracking />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;