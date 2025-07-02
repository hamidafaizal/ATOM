import React from 'react';
// DIUBAH: Menambahkan ikon 'BookCopy' untuk menu baru
import { Plus, Home, Clock, Trash2, ShoppingBag, Landmark, Smartphone, Phone, BookCopy } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
    // DIUBAH: Daftar menu diperbarui.
    const menuItems = [
        { icon: Home, name: 'Dashboard' },
        { icon: Smartphone, name: 'HP Manage' },
        { icon: Phone, name: 'Nomer Selluler Manage' },
        { icon: ShoppingBag, name: 'Akun Shopee' },
        { icon: Landmark, name: 'Akun NPWP' },
        { icon: BookCopy, name: 'Laporan Keuangan' }, // Menambahkan menu baru
        { icon: Clock, name: 'Recent' },
        { icon: Trash2, name: 'Trash' },
    ];

    return (
        <aside className="w-64 bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
                MANKUN Drive
            </div>
            
            <button className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-shadow mb-8">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New</span>
            </button>

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

            <div className="mt-auto">
                 <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "45%"}}></div>
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    6.7 GB of 15 GB used
                 </p>
                 <button className="mt-2 w-full text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Get more storage
                 </button>
            </div>
        </aside>
    );
};

export default Sidebar;
