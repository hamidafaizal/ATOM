import React from 'react';
import { Home, Users, Printer, Settings, LogOut } from 'lucide-react'; // DITAMBAHKAN: LogOut
import { useAuth } from '../context/AuthContext'; // DITAMBAHKAN

const Sidebar = ({ activePage, setActivePage }) => {
    const { logout } = useAuth(); // DITAMBAHKAN
    
    const menuItems = [
        { icon: Home, name: 'Dashboard' },
        { icon: Users, name: 'Detail Karyawan' },
        { icon: Printer, name: 'Export Slip Gaji' },
        { icon: Settings, name: 'Pengaturan' },
    ];

    return (
        <aside className="w-64 bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-700">
            <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-8 text-center">
                    ATOM
                </div>
                
                <nav>
                    <ul>
                        {menuItems.map((item, index) => (
                            <li key={index} className="mb-2">
                                <button
                                    onClick={() => setActivePage(item.name)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                        activePage === item.name 
                                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-semibold' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {/* DITAMBAHKAN: Tombol Logout di bagian bawah */}
            <div className="mt-auto">
                 <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
