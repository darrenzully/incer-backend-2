import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  BuildingOfficeIcon, 
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { securityService } from '../services/securityService';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [centros, setCentros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    alias: '',
    rolId: null as number | null,
    activo: true
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const lastLogin = localStorage.getItem('lastLogin') || new Date().toLocaleString();
  const permisos = user.permisos || [];
  const rol = user.rol || null;

  // Cargar centros y clientes del usuario desde el backend
  useEffect(() => {
    const loadUserData = async () => {
      if (!user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [centrosData, clientesData] = await Promise.all([
          securityService.getUsuarioCentros(user.id),
          securityService.getUsuarioClientes(user.id)
        ]);
        setCentros(centrosData || []);
        setClientes(clientesData || []);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user.id]);

  const handleEdit = () => {
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      mail: user.mail || '',
      alias: user.alias || '',
      rolId: user.rolId || null,
      activo: user.activo !== undefined ? user.activo : true
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    // Aquí se implementaría la lógica para guardar los cambios
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona tu información personal y preferencias</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información Principal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Personal</h2>
                <p className="text-gray-600 dark:text-gray-400">Detalles de tu cuenta</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Nombre
                     </label>
                     <input
                       type="text"
                       value={formData.nombre}
                       onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                       placeholder="Ingrese su nombre"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Apellido
                     </label>
                     <input
                       type="text"
                       value={formData.apellido}
                       onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                       placeholder="Ingrese su apellido"
                     />
                   </div>
                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Usuario (Alias)
                     </label>
                     <input
                       type="text"
                       value={formData.alias}
                       onChange={(e) => setFormData({...formData, alias: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                       placeholder="Ingrese su usuario"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Email
                     </label>
                     <input
                       type="email"
                       value={formData.mail}
                       onChange={(e) => setFormData({...formData, mail: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                       placeholder="usuario@incer.com"
                     />
                   </div>
                 </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 dark:bg-green-500 dark:hover:bg-green-600"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
                         ) : (
               <div className="space-y-4">
                 <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
                   <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</p>
                     <p className="font-medium text-gray-900 dark:text-white">{user.nombreCompleto || `${user.apellido || ''} ${user.nombre || ''}`.trim() || 'No especificado'}</p>
                   </div>
                 </div>
                 <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
                   <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Usuario (Alias)</p>
                     <p className="font-medium text-gray-900 dark:text-white">{user.alias || 'No especificado'}</p>
                   </div>
                 </div>
                 <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
                   <EnvelopeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                     <p className="font-medium text-gray-900 dark:text-white">{user.mail || 'No especificado'}</p>
                   </div>
                 </div>
                 <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
                   <UserGroupIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Rol</p>
                     <p className="font-medium text-gray-900 dark:text-white">{rol?.nombre || 'No asignado'}</p>
                   </div>
                 </div>
                 <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
                   <ShieldCheckIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                     <p className="font-medium text-gray-900 dark:text-white">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         user.activo 
                           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                           : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                       }`}>
                         {user.activo ? 'Activo' : 'Inactivo'}
                       </span>
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center py-3">
                   <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Último Acceso</p>
                     <p className="font-medium text-gray-900 dark:text-white">{lastLogin}</p>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </motion.div>

        {/* Sidebar con información adicional */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Centros */}
          <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Centros Asignados</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {centros.length} {centros.length === 1 ? 'centro' : 'centros'}
              </span>
            </div>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
              ) : centros.length > 0 ? (
                centros.map((centro: any, index: number) => (
                  <div key={centro.id || index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{centro.nombre || `Centro ${index + 1}`}</span>
                        {centro.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{centro.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay centros asignados</p>
              )}
            </div>
          </div>

          {/* Clientes */}
          <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Clientes Asignados</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
              ) : clientes.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Los clientes se asignan automáticamente según los centros a los que tienes acceso.
                  </p>
                  {clientes.slice(0, 10).map((cliente: any, index: number) => (
                    <div key={cliente.id || index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block truncate">
                            {cliente.nombre || `Cliente ${index + 1}`}
                          </span>
                          {cliente.centro && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{cliente.centro.nombre}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {clientes.length > 10 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                      +{clientes.length - 10} clientes más
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay clientes asignados</p>
              )}
            </div>
          </div>

           {/* Permissions */}
          <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Permissions</h3>
            </div>
                         <div className="space-y-2">
               {permisos.length > 0 ? (
                 permisos.slice(0, 5).map((permiso: any, index: number) => (
                   <div key={permiso.id || index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                     <div className="w-2 h-2 bg-accent-400 dark:bg-accent-500 rounded-full mr-3"></div>
                     <span className="text-sm text-gray-700 dark:text-gray-300">{permiso.nombre || `Permission ${index + 1}`}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No hay permisos asignados</p>
               )}
               {permisos.length > 5 && (
                 <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                   +{permisos.length - 5} permisos más
                 </p>
               )}
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 