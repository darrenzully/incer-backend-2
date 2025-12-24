# Incer Frontend - UI Moderna

Una aplicación web moderna y profesional para la gestión de centros, usuarios y productos de Incer.

## 🎨 Características de la UI

### Diseño Moderno
- **Tailwind CSS**: Framework de CSS utility-first para un diseño consistente y responsive
- **Heroicons**: Iconografía moderna y consistente
- **Framer Motion**: Animaciones fluidas y profesionales
- **Inter Font**: Tipografía moderna y legible

### Componentes Profesionales
- **Sidebar Colapsible**: Navegación lateral con animaciones suaves
- **Topbar Inteligente**: Barra superior con búsqueda y notificaciones
- **DataTable Avanzada**: Tabla con búsqueda, filtros, ordenamiento y paginación
- **Dashboard Interactivo**: Gráficos y estadísticas en tiempo real
- **Formularios Modernos**: Campos con validación y estados visuales

### Paleta de Colores
- **Primario**: Rojo (#C62828) - Identidad de marca
- **Acento**: Amarillo (#FFD600) - Elementos destacados
- **Grises**: Escala completa para textos y fondos
- **Estados**: Verde (éxito), Rojo (error), Amarillo (advertencia)

## 🚀 Tecnologías

- **React 19**: Framework de UI más reciente
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de CSS utility-first
- **Framer Motion**: Biblioteca de animaciones
- **Heroicons**: Iconografía moderna
- **Recharts**: Gráficos interactivos
- **React Router**: Navegación SPA
- **React Hot Toast**: Notificaciones elegantes

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Construir para producción
npm run build
```

## 🎯 Componentes Principales

### Layout
- `App.tsx`: Configuración principal de rutas y layout
- `Sidebar.tsx`: Navegación lateral colapsible
- `Topbar.tsx`: Barra superior con búsqueda y usuario
- `Notification.tsx`: Sistema de notificaciones

### Páginas
- `DashboardPage.tsx`: Panel principal con estadísticas
- `LoginPage.tsx`: Página de autenticación moderna
- `CentersPage.tsx`: Gestión de centros con tabla avanzada

### Componentes Reutilizables
- `DataTable.tsx`: Tabla de datos con funcionalidades avanzadas
- Componentes de formularios modernos
- Gráficos interactivos

## 🎨 Guía de Estilos

### Clases CSS Personalizadas
```css
.btn-primary    /* Botón principal rojo */
.btn-secondary  /* Botón secundario con borde */
.btn-accent     /* Botón de acento amarillo */
.card           /* Tarjeta con sombra suave */
.input-field    /* Campo de entrada estilizado */
```

### Animaciones
- Transiciones suaves en hover
- Animaciones de entrada con Framer Motion
- Micro-interacciones para mejor UX

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl
- **Sidebar Adaptativa**: Se convierte en overlay en móviles
- **Tablas Responsivas**: Scroll horizontal en pantallas pequeñas

## 🔧 Configuración

### Variables de Entorno
```env
REACT_APP_API_URL=http://localhost:5000
```

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { /* Paleta de rojos */ },
        accent: { /* Paleta de amarillos */ }
      }
    }
  }
}
```

## 🎯 Próximas Mejoras

- [ ] Modo oscuro
- [ ] Más animaciones personalizadas
- [ ] Componentes de gráficos adicionales
- [ ] Optimización de rendimiento
- [ ] Tests unitarios con Jest
- [ ] Storybook para documentación de componentes

## 📄 Licencia

© 2024 Incer. Todos los derechos reservados.
