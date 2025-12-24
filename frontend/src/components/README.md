# Toggle de Vista - Implementación

Este directorio contiene los componentes necesarios para implementar el toggle de vista (grilla vs tabla) en todas las páginas del sistema.

## Componentes

### ViewToggle.tsx
Componente que permite cambiar entre vista de grilla y vista de tabla. Incluye:
- Botones para alternar entre vistas
- Iconos visuales (Squares2X2Icon para grilla, TableCellsIcon para tabla)
- Estilos consistentes con el tema de la aplicación

### TableView.tsx
Componente reutilizable para mostrar datos en formato de tabla. Incluye:
- Columnas configurables
- Renderizado personalizado de celdas
- Acciones estándar (ver, editar, eliminar)
- Estado vacío personalizable

## Implementación en Páginas

### Para páginas que ya usan DataTable:
1. Importar `ViewToggle` y `TableView`
2. Agregar estado `viewMode` con valor por defecto 'table'
3. Agregar el componente `ViewToggle` en el header
4. Envolver el `DataTable` existente en una condición `viewMode === 'table'`
5. Agregar la vista de grilla con `viewMode === 'grid'`

### Para páginas que ya usan vista de grilla:
1. Importar `ViewToggle` y `TableView`
2. Agregar estado `viewMode` con valor por defecto 'grid'
3. Agregar el componente `ViewToggle` en el header
4. Envolver la vista de grilla existente en una condición `viewMode === 'grid'`
5. Agregar la vista de tabla con `viewMode === 'table'`

## Ejemplo de Implementación

```tsx
import ViewToggle from '../components/ViewToggle';
import TableView from '../components/TableView';

const MyPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>Mi Página</h1>
        <ViewToggle
          currentView={viewMode}
          onViewChange={setViewMode}
        />
      </div>
      
      {viewMode === 'grid' ? (
        // Vista de grilla existente
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards */}
        </div>
      ) : (
        // Nueva vista de tabla
        <TableView
          data={data}
          columns={columns}
          viewPath="/my-route"
          editPath="/my-route/edit"
          itemName="elemento"
        />
      )}
    </div>
  );
};
```

## Páginas Actualizadas

- ✅ CentersPage.tsx
- ✅ UsersPage.tsx  
- ✅ ClientsPage.tsx
- ✅ SucursalesPage.tsx

## Páginas Pendientes

- ⏳ RolesPage.tsx
- ⏳ PermissionsPage.tsx
- ⏳ ElementosPage.tsx
- ⏳ ExtintoresPage.tsx
- ⏳ PuestosPage.tsx
- ⏳ TipoElementosPage.tsx

## Notas de Implementación

1. **Iconos**: Asegurarse de importar todos los iconos necesarios para las acciones
2. **Rutas**: Configurar correctamente `viewPath` y `editPath` para la navegación
3. **Estados**: Usar nombres descriptivos para el estado `viewMode`
4. **Responsive**: Las vistas de grilla ya son responsive, las tablas se adaptan automáticamente
5. **Consistencia**: Mantener el mismo estilo visual en ambas vistas
