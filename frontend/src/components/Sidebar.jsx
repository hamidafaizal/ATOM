import React from 'react';
// DIUBAH: Impor ikon Settings untuk menu baru
import { Home, Users, Printer, Settings } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
    // DIUBAH: Daftar menu ditambahkan "Pengaturan"
    const menuItems = [
        { icon: Home, name: 'Dashboard' },
        { icon: Users, name: 'Detail Karyawan' },
        { icon: Printer, name: 'Export Slip Gaji' },
        { icon: Settings, name: 'Pengaturan' },
    ];

    return (
        <aside className="w-64 bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
                ATOM
            </div>
            
            <nav>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} className="mb-2">
                            <button
                                onClick={() => setActivePage(item.name)}
                                className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left ${
                                    activePage === item.name 
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-semibold' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
