import React from "react";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

const AdminDashboard = () => {
  return (
    <div className="min-w-0 flex-1 px-1 sm:px-2 md:px-3">
      <div className="flex min-h-screen w-full">
      
        <div className="hidden md:block md:w-64 md:shrink-0">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1 p-2 sm:p-3 md:p-4">
          <Header />
          <main className="content mt-4 min-h-[calc(100vh-6rem)] w-full rounded-2xl p-3 sm:p-4 md:p-6 text-[var(--color-text)]">
            به پنل ادمین خوش آمدید
          </main>
        </div>
        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
