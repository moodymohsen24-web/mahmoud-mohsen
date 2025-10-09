import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex flex-1 container mx-auto px-6 py-8 gap-10">
            <aside className="w-64 flex-shrink-0 hidden md:block">
                <Sidebar />
            </aside>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;