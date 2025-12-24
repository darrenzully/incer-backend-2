// Configuración para el toggle de vista en todas las páginas
export interface ViewToggleConfig {
  pageName: string;
  filePath: string;
  defaultView: 'grid' | 'table';
  hasDataTable: boolean;
  needsTableView: boolean;
  iconImports: string[];
  itemName: string;
}

export const viewToggleConfigs: ViewToggleConfig[] = [
  {
    pageName: 'CentersPage',
    filePath: 'frontend/src/pages/CentersPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'MapPinIcon', 'PhoneIcon', 'GlobeAltIcon'],
    itemName: 'centro'
  },
  {
    pageName: 'UsersPage',
    filePath: 'frontend/src/pages/UsersPage.tsx',
    defaultView: 'table',
    hasDataTable: true,
    needsTableView: false,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon'],
    itemName: 'usuario'
  },
  {
    pageName: 'ClientsPage',
    filePath: 'frontend/src/pages/ClientsPage.tsx',
    defaultView: 'table',
    hasDataTable: true,
    needsTableView: false,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'PhoneIcon', 'BuildingOfficeIcon'],
    itemName: 'cliente'
  },
  {
    pageName: 'SucursalesPage',
    filePath: 'frontend/src/pages/SucursalesPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'MapPinIcon', 'PhoneIcon'],
    itemName: 'sucursal'
  },
  {
    pageName: 'RolesPage',
    filePath: 'frontend/src/pages/RolesPage.tsx',
    defaultView: 'table',
    hasDataTable: true,
    needsTableView: false,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon'],
    itemName: 'rol'
  },
  {
    pageName: 'PermissionsPage',
    filePath: 'frontend/src/pages/PermissionsPage.tsx',
    defaultView: 'table',
    hasDataTable: true,
    needsTableView: false,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon'],
    itemName: 'permiso'
  },
  {
    pageName: 'ElementosPage',
    filePath: 'frontend/src/pages/ElementosPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'CubeIcon'],
    itemName: 'elemento'
  },
  {
    pageName: 'ExtintoresPage',
    filePath: 'frontend/src/pages/ExtintoresPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'FireIcon'],
    itemName: 'extintor'
  },
  {
    pageName: 'PuestosPage',
    filePath: 'frontend/src/pages/PuestosPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'BriefcaseIcon'],
    itemName: 'puesto'
  },
  {
    pageName: 'TipoElementosPage',
    filePath: 'frontend/src/pages/TipoElementosPage.tsx',
    defaultView: 'grid',
    hasDataTable: false,
    needsTableView: true,
    iconImports: ['EyeIcon', 'PencilIcon', 'TrashIcon', 'TagIcon'],
    itemName: 'tipo de elemento'
  }
];

// Función helper para obtener la configuración de una página específica
export const getViewToggleConfig = (pageName: string): ViewToggleConfig | undefined => {
  return viewToggleConfigs.find(config => config.pageName === pageName);
};

// Función helper para obtener todas las configuraciones
export const getAllViewToggleConfigs = (): ViewToggleConfig[] => {
  return viewToggleConfigs;
};
