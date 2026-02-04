import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import ArchivalNotice from "./ArchivalNotice";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      <ArchivalNotice />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
