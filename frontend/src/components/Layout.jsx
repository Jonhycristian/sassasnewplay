import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex bg-slate-950 min-h-screen text-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
