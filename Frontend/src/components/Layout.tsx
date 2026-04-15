import React from 'react';
import Navbar from './Navbar';
import FloatingCart from './FloatingCart';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-4 pb-28">{children}</main>
      <FloatingCart />
    </div>
  );
};

export default Layout;