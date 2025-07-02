import React, { useState } from 'react';
// DITAMBAHKAN: Impor ikon baru untuk kartu statistik dan aktivitas
import { Users, UserCheck, DollarSign, Clock, ArrowUp, ArrowDown, Wallet } from 'lucide-react';

// Komponen Kartu Statistik
const StatCard = ({ icon: Icon, title, value, iconColor }) => (
  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md flex items-center gap-4 border border-gray-200 dark:border-gray-700">
    <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

// Komponen Daftar Aktivitas
const ActivityList = ({ activities }) => (
  <ul className="space-y-3 mt-4">
    {activities.map((activity, index) => (
      <li key={index} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activity.type === 'masuk' ? 
            <ArrowUp className="w-5 h-5 text-green-500" /> : 
            <ArrowDown className="w-5 h-5 text-red-500" />
          }
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{activity.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${
            activity.status === 'Tepat waktu' ? 'text-green-500' 
            : activity.status === 'Terlambat' ? 'text-yellow-500'
            : 'text-gray-500'
          }`}>
          {activity.time}
        </span>
      </li>
    ))}
  </ul>
);

// DITAMBAHKAN: Komponen baru untuk daftar gaji karyawan
const SalaryList = ({ salaries }) => (
    <ul className="space-y-3 mt-4">
        {salaries.map((salary, index) => (
            <li key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Wallet className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{salary.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{salary.position}</p>
                    </div>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {salary.amount}
                </span>
            </li>
        ))}
    </ul>
);


const Dashboard = () => {
  // DITAMBAHKAN: State untuk mengelola tab aktif
  const [activeTab, setActiveTab] = useState('aktivitas');

  // Data dummy untuk kartu statistik
  const stats = [
    { icon: Users, title: 'Total Karyawan', value: '12', iconColor: 'text-blue-500' },
    { icon: UserCheck, title: 'Hadir Hari Ini', value: '10', iconColor: 'text-green-500' },
    { icon: DollarSign, title: 'Total Gaji Bulan Ini', value: 'Rp 125.000.000', iconColor: 'text-purple-500' },
    { icon: Clock, title: 'Rata-rata Jam Kerja', value: '8.5 jam', iconColor: 'text-orange-500' },
  ];

  // Data dummy untuk aktivitas terbaru
  const recentActivities = [
    { type: 'masuk', name: 'John Doe', description: 'Masuk kerja', time: '08:30', status: 'Tepat waktu' },
    { type: 'keluar', name: 'Jane Smith', description: 'Pulang kerja', time: '17:45', status: 'Lembur' },
    { type: 'masuk', name: 'Bob Wilson', description: 'Masuk kerja', time: '09:15', status: 'Terlambat' },
    { type: 'masuk', name: 'Alice Brown', description: 'Tidak hadir', time: '-', status: 'Tidak hadir' },
  ];

  // DITAMBAHKAN: Data dummy untuk gaji karyawan
  const salaries = [
      { name: 'John Doe', position: 'Developer', amount: 'Rp 12.500.000' },
      { name: 'Jane Smith', position: 'Designer', amount: 'Rp 11.000.000' },
      { name: 'Bob Wilson', position: 'Project Manager', amount: 'Rp 15.000.000' },
      { name: 'Alice Brown', position: 'QA Engineer', amount: 'Rp 10.500.000' },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Dashboard Manajemen Gaji
      </h1>
      <p className="mt-1 mb-6 text-gray-600 dark:text-gray-400">
        Kelola gaji karyawan dengan sistem perhitungan otomatis berdasarkan jam kerja.
      </p>

      {/* Grid untuk kartu statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Konten utama dashboard dengan sistem tab */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Navigasi Tab */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('aktivitas')}
              className={`${
                activeTab === 'aktivitas'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Aktivitas Terbaru
            </button>
            <button
              onClick={() => setActiveTab('gaji')}
              className={`${
                activeTab === 'gaji'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Gaji Karyawan
            </button>
          </nav>
        </div>
        
        {/* Konten Tab */}
        {activeTab === 'aktivitas' && <ActivityList activities={recentActivities} />}
        {activeTab === 'gaji' && <SalaryList salaries={salaries} />}
      </div>
    </div>
  );
};

export default Dashboard;
