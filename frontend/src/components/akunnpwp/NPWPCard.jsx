import React from 'react';
import { Folder } from 'lucide-react';

const NPWPCard = ({ data, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <Folder className="w-16 h-16 text-blue-500 mb-2" />
      <span className="font-medium text-sm text-gray-800 dark:text-gray-200 break-words w-full">
        {data.nama_pemilik}
      </span>
    </button>
  );
};

export default NPWPCard;
