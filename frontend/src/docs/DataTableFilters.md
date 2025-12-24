# DataTable - Filtros Avanzados

El componente `DataTable` ahora soporta filtros avanzados con autocompletado automático basado en los datos existentes.

## Configuración de Filtros

### Interfaz FilterConfig

```typescript
interface FilterConfig {
  key: string;                    // Campo del objeto a filtrar
  label: string;                  // Etiqueta mostrada al usuario
  type: 'text' | 'select' | 'multiselect' | 'date' | 'boolean';
  options?: { value: any; label: string }[];  // Opciones personalizadas (opcional)
  placeholder?: string;           // Placeholder para campos de texto
}
```

### Tipos de Filtros Disponibles

1. **`text`** - Campo de texto con búsqueda parcial
2. **`select`** - Lista desplegable con opciones únicas
3. **`multiselect`** - Selección múltiple
4. **`date`** - Selector de fecha
5. **`boolean`** - Filtro sí/no

## Ejemplo de Uso

### Configuración Básica

```typescript
import DataTable, { FilterConfig } from '../components/DataTable';

const MyPage: React.FC = () => {
  // Configuración de filtros
  const filterConfig: FilterConfig[] = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Filtrar por nombre...'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' }
      ]
    },
    {
      key: 'isActive',
      label: 'Habilitado',
      type: 'boolean'
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      type: 'date'
    }
  ];

  return (
    <DataTable
      data={myData}
      columns={myColumns}
      filters={filterConfig}
      enableAdvancedFilters={true}
      // ... otras props
    />
  );
};
```

### Autocompletado Automático

Para filtros de tipo `select` y `multiselect`, si no se proporcionan `options`, el componente generará automáticamente las opciones basándose en los valores únicos del campo en los datos:

```typescript
// Este filtro generará automáticamente las opciones
{
  key: 'category',
  label: 'Categoría',
  type: 'select'
  // No necesita options - se generan automáticamente
}
```

### Filtros Personalizados

```typescript
const filterConfig: FilterConfig[] = [
  {
    key: 'priority',
    label: 'Prioridad',
    type: 'select',
    options: [
      { value: 'high', label: 'Alta' },
      { value: 'medium', label: 'Media' },
      { value: 'low', label: 'Baja' }
    ]
  },
  {
    key: 'tags',
    label: 'Etiquetas',
    type: 'multiselect'
    // Se generarán automáticamente basadas en los datos
  }
];
```

## Funcionalidades

### Búsqueda General
- El campo de búsqueda principal busca en todos los campos del objeto
- Funciona en combinación con los filtros avanzados

### Filtros Avanzados
- Se muestran/ocultan con el botón "Filtros"
- Cada filtro se aplica independientemente
- Botón "Limpiar filtros" para resetear todos los filtros
- Los filtros se combinan con AND lógico

### Autocompletado
- Los filtros `select` y `multiselect` se autocompletan con valores únicos de los datos
- Se actualizan automáticamente cuando cambian los datos
- Filtran valores nulos/vacíos automáticamente

## Ejemplos por Página

### Aplicaciones
```typescript
const filterConfig: FilterConfig[] = [
  {
    key: 'type',
    label: 'Tipo de Aplicación',
    type: 'select',
    options: [
      { value: 'web', label: 'Web' },
      { value: 'mobile', label: 'Móvil' },
      { value: 'desktop', label: 'Escritorio' },
      { value: 'api', label: 'API' }
    ]
  },
  {
    key: 'platform',
    label: 'Plataforma',
    type: 'text',
    placeholder: 'Filtrar por plataforma...'
  },
  {
    key: 'active',
    label: 'Estado',
    type: 'boolean'
  }
];
```

### Usuarios
```typescript
const filterConfig: FilterConfig[] = [
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Filtrar por email...'
  },
  {
    key: 'firstName',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Filtrar por nombre...'
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'boolean'
  }
];
```

## Notas Importantes

1. **Performance**: Los filtros se aplican en el frontend, por lo que con datasets muy grandes puede afectar el rendimiento
2. **Tipos de datos**: Los filtros funcionan mejor con tipos de datos consistentes
3. **Fechas**: Para filtros de fecha, asegúrate de que el campo contenga fechas en formato ISO
4. **Booleanos**: Los filtros booleanos convierten automáticamente strings a booleanos
5. **Multiselect**: Requiere Ctrl/Cmd + click para selección múltiple
