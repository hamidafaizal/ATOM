import React from 'react';
import Dashboard from './dashboard/Dashboar.jsx'; 
import DetailKaryawan from './detailkaryawan/DetailKaryawan.jsx';
import ExportSlipGaji from './exportslipgaji/ExportSlipGaji.jsx';
// DIUBAH: Impor komponen baru
import Pengaturan from './pengaturan/Pengaturan.jsx';
import { Search, List, Settings, UserCircle, Grid } from 'lucide-react';

const MainContent = ({ activePage }) => {

    const renderContent = () => {
        // DIUBAH: Logika switch diperbarui untuk menangani halaman baru
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Detail Karyawan':
                return <DetailKaryawan />;
            case 'Export Slip Gaji':
                return <ExportSlipGaji />;
            case 'Pengaturan':
                return <Pengaturan />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search in Drive"
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                     <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <List className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <Grid className="w-5 h-5" />
                    </button>
                     <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                         <UserCircle className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
            </header>
            
            {renderContent()}
        </main>
    );
};

export default MainContent;
