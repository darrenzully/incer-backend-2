import React, { useState } from 'react';
import { 
  BellIcon, 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import CenterSelector from './CenterSelector';

interface TopbarProps {
  username: string;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ username, onLogout, darkMode, onToggleDarkMode }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Nuevo centro agregado', time: '2 min ago', read: false },
    { id: 2, message: 'Actualización del sistema completada', time: '1 hora ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm dark:!bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 search-input"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Center Selector */}
          <CenterSelector />
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-all duration-200 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-400 text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:!bg-gray-800 rounded-lg shadow-strong border border-gray-200 dark:border-gray-700 py-1 z-50 notifications-dropdown"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificaciones</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        notification.read 
                          ? 'bg-white dark:!bg-gray-800' 
                          : 'bg-accent-50 dark:!bg-accent-900/20'
                      }`}
                    >
                      <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* User summary removed - user menu moved to sidebar footer */}
        </div>
      </div>
    </header>
  );
};

export default Topbar; 