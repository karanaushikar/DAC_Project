import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet /> {/* This is where your page components will be rendered */}
            </main>
        </div>
    );
};

export default MainLayout;