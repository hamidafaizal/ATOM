import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, Clock, ArrowUp, ArrowDown, Wallet, Loader2 } from 'lucide-react';
import apiClient from '../../api';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const StatCard = ({ icon: Icon, title, value, iconColor, loading }) => (
  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md flex items-center gap-4 border border-gray-200 dark:border-gray-700">
    <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      )}
    </div>
  </div>
);

const ActivityList = ({ activities, loading }) => {
    if (loading) {
        return (
            <div className="space-y-3 mt-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
      <ul className="space-y-3 mt-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activity.tipe === 'MASUK' ? 
                <ArrowUp className="w-5 h-5 text-green-500" /> : 
                <ArrowDown className="w-5 h-5 text-red-500" />
              }
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{activity.karyawan.nama_lengkap}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Melakukan absen {activity.tipe.toLowerCase()}
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {new Date(activity.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </li>
        ))}
      </ul>
    );
};

const SalaryList = ({ salaries, loading }) => {
    if (loading) {
        return (
            <div className="space-y-3 mt-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <ul className="space-y-3 mt-4">
            {salaries.map((salary, index) => (
                <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <Wallet className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{salary.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{salary.position}</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {formatRupiah(salary.amount)}
                    </span>
                </li>
            ))}
        </ul>
    );
};


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('aktivitas');
  const [summaryData, setSummaryData] = useState({});
  const [salaries, setSalaries] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingSalaries, setLoadingSalaries] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingSummary(true);
        setLoadingSalaries(true);
        setLoadingActivities(true);

        const [summaryRes, salariesRes, activitiesRes] = await Promise.all([
          apiClient.get('/dashboard/summary'),
          apiClient.get('/gaji/rincian-bulan-ini'),
          apiClient.get('/dashboard/aktivitas-terbaru')
        ]);

        setSummaryData(summaryRes.data);
        setSalaries(salariesRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoadingSummary(false);
        setLoadingSalaries(false);
        setLoadingActivities(false);
      }
    };

    fetchAllData();
  }, []);

  const stats = [
    { icon: Users, title: 'Total Karyawan', value: summaryData.totalKaryawan, iconColor: 'text-blue-500' },
    { icon: UserCheck, title: 'Hadir Hari Ini', value: summaryData.hadirHariIni, iconColor: 'text-green-500' },
    { icon: DollarSign, title: 'Total Gaji Bulan Ini', value: formatRupiah(summaryData.totalGajiBulanIni || 0), iconColor: 'text-purple-500' },
    { icon: Clock, title: 'Rata-rata Jam Kerja', value: `${summaryData.rataRataJamKerja || 0} jam`, iconColor: 'text-orange-500' },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Dashboard Manajemen Gaji
      </h1>
      <p className="mt-1 mb-6 text-gray-600 dark:text-gray-400">
        Kelola gaji karyawan dengan sistem perhitungan otomatis berdasarkan jam kerja.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loadingSummary} />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('aktivitas')}
              className={`${
                activeTab === 'aktivitas'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Aktivitas Terbaru
            </button>
            <button
              onClick={() => setActiveTab('gaji')}
              className={`${
                activeTab === 'gaji'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Gaji Karyawan
            </button>
          </nav>
        </div>
        
        {activeTab === 'aktivitas' && <ActivityList activities={activities} loading={loadingActivities} />}
        {activeTab === 'gaji' && <SalaryList salaries={salaries} loading={loadingSalaries} />}
      </div>
    </div>
  );
};

export default Dashboard;
