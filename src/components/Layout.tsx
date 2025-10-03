import React from "react";
// import { Header } from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen justify-between max-w-2xl mx-auto pt-6 px-4">
      <div>
        {/* <Header /> */}
        {children}
      </div>
      <Footer />
    </div>
  );
}
