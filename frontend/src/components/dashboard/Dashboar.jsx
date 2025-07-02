import React from 'react';
import { File, Folder } from 'lucide-react';

// Saya memperbaiki nama komponen dari "Dashboar" menjadi "Dashboard"
const Dashboard = () => {
    // Data dummy untuk tampilan
    const quickAccess = [
        { type: File, name: 'Project Proposal.docx', owner: 'Hamida', lastModified: '10:30 AM' },
        { type: Folder, name: 'Q3 Reports', owner: 'You', lastModified: 'Yesterday' },
        { type: File, name: 'Design Mockups.fig', owner: 'Putra', lastModified: 'June 24, 2025' },
        { type: File, name: 'Budget.xlsx', owner: 'You', lastModified: 'June 23, 2025' },
    ];
    
    const folders = [
        { name: 'Project MANKUN' },
        { name: 'Personal' },
        { name: 'Client Files' },
        { name: 'Archive 2024' },
    ];

    const files = [
        { type: File, name: 'Meeting Notes.pdf', owner: 'You', lastModified: '1:15 PM', size: '1.2 MB' },
        { type: File, name: 'Onboarding Video.mp4', owner: 'Hamida', lastModified: 'Yesterday', size: '128 MB' },
        { type: File, name: 'Company Photos.zip', owner: 'Putra', lastModified: 'June 22, 2025', size: '54 MB' },
    ];

    return (
        <div className="p-6 md:p-8">
            {/* Bagian Quick Access */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickAccess.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <item.type className="w-6 h-6 text-blue-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Opened {item.lastModified}</p>
                    </div>
                ))}
            </div>

            {/* Bagian Folders */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Folders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {folders.map((folder, index) => (
                     <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors cursor-pointer">
                        <Folder className="w-6 h-6 text-blue-500 shrink-0" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{folder.name}</span>
                    </div>
                ))}
            </div>

            {/* Bagian Files dalam bentuk tabel */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Files</h2>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Name</th>
                            <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">Owner</th>
                            <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">Last modified</th>
                            <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">File size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <file.type className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">{file.owner}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 hidden lg:table-cell">{file.lastModified}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">{file.size}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
