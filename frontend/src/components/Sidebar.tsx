import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  UserIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  FireIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionsContext, PermissionKey } from '../contexts/PermissionsContext';

interface SidebarItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
  anyOf?: PermissionKey[]; // si no está, el item es visible (p.ej. Dashboard)
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Ventas', 
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Clientes', href: '/clientes', icon: UsersIcon, anyOf: [{ resource: 'clients', action: 'list' }, { resource: 'clients', action: 'view_all' }] },
      { name: 'Agenda de Contactos', href: '/agenda-contactos', icon: CalendarIcon, anyOf: [{ resource: 'agenda', action: 'list' }, { resource: 'agenda', action: 'view_all' }] },
      { name: 'Sucursales', href: '/sucursales', icon: BuildingStorefrontIcon, anyOf: [{ resource: 'sucursales', action: 'list' }, { resource: 'sucursales', action: 'view_all' }] },
      { name: 'Presupuestos', href: '/presupuestos', icon: DocumentTextIcon, anyOf: [{ resource: 'presupuestos', action: 'list' }] },
    ]
  },
  { 
    name: 'Cobranzas', 
    icon: TruckIcon,
    children: [
      { name: 'Asignación de Remitos', href: '/remito-usuarios', icon: UserIcon, anyOf: [{ resource: 'asignacion-remitos', action: 'list' }, { resource: 'asignacion-remitos', action: 'view_all' }] },
      { name: 'Remitos', href: '/remitos', icon: DocumentTextIcon, anyOf: [{ resource: 'remitos', action: 'list' }, { resource: 'remitos', action: 'view_all' }] },
    ]
  },
  { 
    name: 'Gestión', 
    icon: ClipboardDocumentListIcon,
    children: [
      { name: 'Calendario', href: '/calendario', icon: CalendarIcon, anyOf: [{ resource: 'agenda', action: 'list' }, { resource: 'agenda', action: 'view_all' }] },
      { name: 'Tareas', href: '/tareas', icon: WrenchScrewdriverIcon, anyOf: [{ resource: 'tareas', action: 'list' }, { resource: 'tareas', action: 'view_all' }] },
      { name: 'Solicitudes', href: '/solicitudes', icon: DocumentTextIcon, anyOf: [{ resource: 'solicitudes', action: 'list' }, { resource: 'solicitudes', action: 'view_all' }] },
      { name: 'Relevamientos', href: '/relevamientos', icon: EyeIcon, anyOf: [{ resource: 'relevamientos', action: 'list' }, { resource: 'relevamientos', action: 'view_all' }] },
    ]
  },
  {
    name: 'Reportes',
    icon: ChartBarIcon,
    children: [
      { name: 'Puestos Relevados', href: '/reportes/puestos-relevados', icon: MapPinIcon, anyOf: [{ resource: 'reportes.puestos-relevados', action: 'read' }, { resource: 'reportes', action: 'read' }] },
      { name: 'Elementos Relevados', href: '/reportes/elementos-relevados', icon: BuildingOfficeIcon, anyOf: [{ resource: 'reportes.elementos-relevados', action: 'read' }, { resource: 'reportes', action: 'read' }] },
    ]
  },
  { 
    name: 'Producción', 
    icon: WrenchScrewdriverIcon,
    children: [
      { name: 'Órdenes de Trabajo', href: '/ordenes-trabajo', icon: ClipboardDocumentListIcon, anyOf: [{ resource: 'ordenes-trabajo', action: 'list' }, { resource: 'ordenes-trabajo', action: 'view_all' }] },
    ]
  },
  { 
    name: 'Productos', 
    icon: CubeIcon,
    children: [
      { name: 'Extintores', href: '/extintores', icon: FireIcon, anyOf: [{ resource: 'extintores', action: 'list' }, { resource: 'extintores', action: 'view_all' }] },
      { name: 'Instalaciones Fijas', href: '/elementos', icon: BuildingOfficeIcon, anyOf: [{ resource: 'elementos', action: 'list' }, { resource: 'elementos', action: 'view_all' }] },
      { name: 'Puestos', href: '/puestos', icon: MapPinIcon, anyOf: [{ resource: 'puestos', action: 'list' }, { resource: 'puestos', action: 'view_all' }] },
    ]
  },
  { 
    name: 'Configuración', 
    icon: WrenchScrewdriverIcon,
    children: [
      { name: 'Centros', href: '/centers', icon: BuildingOfficeIcon, anyOf: [{ resource: 'centers', action: 'list' }] },
      { name: 'Tipo de inst. fijas', href: '/tipos-elemento', icon: CubeIcon, anyOf: [{ resource: 'tipos-elemento', action: 'list' }] },
      { name: 'Checklists', href: '/checklists', icon: DocumentTextIcon, anyOf: [{ resource: 'checklists', action: 'list' }] },
    ]
  },
  { 
    name: 'Seguridad', 
    icon: LockClosedIcon,
    children: [
      { name: 'Gestión de Usuarios', href: '/user-management', icon: UserGroupIcon, anyOf: [{ resource: 'users', action: 'list' }, { resource: 'users', action: 'read' }] },
      { name: 'Gestión de Roles', href: '/role-management', icon: ShieldCheckIcon, anyOf: [{ resource: 'roles', action: 'list' }, { resource: 'roles', action: 'read' }] },
      { name: 'Plantillas de Roles', href: '/role-templates', icon: DocumentTextIcon, anyOf: [{ resource: 'roles', action: 'list' }, { resource: 'roles', action: 'read' }] },
      { name: 'Permissions', href: '/permissions', icon: KeyIcon, anyOf: [{ resource: 'permissions', action: 'list' }, { resource: 'permissions', action: 'read' }] },
      { name: 'Aplicaciones', href: '/applications', icon: ComputerDesktopIcon, anyOf: [{ resource: 'applications', action: 'list' }, { resource: 'applications', action: 'read' }] },
      { name: 'Acceso a Aplicaciones', href: '/app-access', icon: ComputerDesktopIcon, anyOf: [{ resource: 'access', action: 'list' }, { resource: 'access', action: 'manage' }] },
      { name: 'Dashboard de Seguridad', href: '/security-matrix', icon: ChartBarIcon, anyOf: [{ resource: 'access', action: 'list' }, { resource: 'access', action: 'manage' }] },
    ]
  },
  { 
    name: 'Etiquetas', 
    icon: DocumentTextIcon,
    children: [
      { name: 'QR', href: '/qrs', icon: DocumentTextIcon, anyOf: [{ resource: 'qr', action: 'list' }, { resource: 'qr', action: 'view_all' }] },
    ]
  },
  { name: 'Preferencias', href: '/preferences', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth(); // reservado para futuro (rol/nombre); hoy el footer lee localStorage directo
  const { can } = usePermissionsContext();

  const filterItems = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }

        if (!item.anyOf || item.anyOf.length === 0) return item;
        const ok = item.anyOf.some(p => can(p.resource, p.action));
        return ok ? item : null;
      })
      .filter((x): x is SidebarItem => Boolean(x));
  };

  const visibleSidebarItems = filterItems(sidebarItems);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      // Si el item ya está expandido, lo cerramos
      if (prev.includes(itemName)) {
        return prev.filter(name => name !== itemName);
      }
      // Si no está expandido, cerramos todos los otros grupos y abrimos este
      return [itemName];
    });
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.href);
    }
    return false;
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`bg-primary-500 dark:bg-gray-900 text-white h-full flex flex-col ${isMobile ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {(!isCollapsed || isMobile) ? (
          <>
            <div className="flex-1 flex items-center justify-center">
              <img 
                src="/incer_logo.png" 
                alt="Incer Logo" 
                className="h-12 w-auto"
              />
            </div>
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-primary-600 dark:hover:bg-gray-800 transition-colors duration-200 ml-2"
              >
                <XMarkIcon className="w-5 h-5 text-accent-400 dark:text-gray-300" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex justify-center">
            {/* Espacio vacío cuando está colapsado */}
          </div>
        )}
        {isMobile && (
          <button
            onClick={toggleMobileSidebar}
            className="p-1 rounded-lg hover:bg-primary-600 dark:hover:bg-gray-800 transition-colors duration-200 ml-2"
          >
            <XMarkIcon className="w-5 h-5 text-accent-400 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleSidebarItems.map((item) => {
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.name);
          
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`w-full sidebar-item ${isActive ? 'active' : 'text-white dark:text-gray-200'}`}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate flex-1 text-left"
                      >
                        {item.name}
                      </motion.span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                </button>
                
                {/* Submenu */}
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            to={child.href!}
                            className={`sidebar-item ${isChildActive ? 'active' : 'text-white dark:text-gray-200'}`}
                          >
                            <child.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="truncate text-sm"
                            >
                              {child.name}
                            </motion.span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href!}
              className={`sidebar-item ${isActive ? 'active' : 'text-white dark:text-gray-200'}`}
              title={isCollapsed && !isMobile ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
              {item.badge && (!isCollapsed || isMobile) && (
                <span className="ml-auto bg-accent-400 dark:bg-accent-500 text-primary-600 dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer user menu */}
      <div className="p-4 border-t border-primary-600 dark:border-gray-700">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(v => !v)}
            className="w-full flex items-center space-x-3 hover:bg-primary-600 dark:hover:bg-gray-800 rounded-lg px-2 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-accent-400 dark:bg-accent-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary-600 dark:text-gray-900" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white dark:text-gray-200 truncate">
                  {JSON.parse(localStorage.getItem('user') || '{}').alias || 'Usuario'}
                </p>
                <p className="text-xs text-accent-200 dark:text-gray-400 truncate">
                  Administrador
                </p>
              </div>
            )}
            {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 text-white dark:text-gray-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />}
          </button>

          {(!isCollapsed || isMobile) && isUserMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:!bg-gray-800 rounded-lg shadow-strong border border-gray-200 dark:border-gray-700 py-1">
              <Link
                to="/perfil"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Perfil
              </Link>
              <Link
                to="/preferences"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Preferencias
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('username');
                  window.location.href = '/login';
                }}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative">
        <SidebarContent />
        
        {/* Botón de abrir cuando está colapsado */}
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-4 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors duration-200 z-10"
          >
            <Bars3Icon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <motion.div
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          exit={{ x: -256 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full z-50 md:hidden"
        >
          <SidebarContent isMobile />
        </motion.div>
      )}

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 bg-primary-500 text-white rounded-lg shadow-lg hover:bg-primary-600 transition-colors duration-200"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default Sidebar; 