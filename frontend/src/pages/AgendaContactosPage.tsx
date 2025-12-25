import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  InformationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useUsers } from '../hooks/useSecurity';
import { tareaService } from '../services/tareaService';
import { sucursalService } from '../services/sucursalService';

const AgendaContactosPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'mes' | 'semana' | 'día' | 'listado'>('mes');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('');
  
  // Estados para los datos de los dropdowns
  const [users, setUsers] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  
  // Hook para obtener usuarios
  const { users: usersData, loading: usersLoading } = useUsers();

  // Función para cargar sucursales por cliente
  const loadSucursalesByCliente = async (clienteId: number) => {
    try {
      setLoadingSucursales(true);
      console.log('Cargando sucursales para cliente ID:', clienteId);
      
      // Intentar con el servicio primero
      try {
        const sucursalesData = await sucursalService.getByClienteId(clienteId);
        console.log('Sucursales cargadas via servicio:', sucursalesData);
        setSucursalesFiltradas(sucursalesData);
      } catch (serviceError) {
        console.log('Error con servicio, intentando con fetch directo:', serviceError);
        
        // Fallback: usar fetch directo
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/api/sucursales/cliente/${clienteId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const sucursalesData = await response.json();
        console.log('Sucursales cargadas via fetch:', sucursalesData);
        setSucursalesFiltradas(sucursalesData);
      }
    } catch (error) {
      console.error('Error loading sucursales by cliente:', error);
      setSucursalesFiltradas([]);
    } finally {
      setLoadingSucursales(false);
    }
  };

  // Cargar datos de los dropdowns
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        console.log('Cargando datos iniciales...');
        
        const [clientesData, sucursalesData] = await Promise.all([
          tareaService.getClientes(),
          tareaService.getSucursales()
        ]);
        
        console.log('Clientes cargados:', clientesData);
        console.log('Sucursales cargadas:', sucursalesData);
        
        setClientes(clientesData);
        setSucursales(sucursalesData);
        setSucursalesFiltradas(sucursalesData); // Inicialmente mostrar todas las sucursales
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Actualizar usuarios cuando se cargan
  useEffect(() => {
    if (usersData && usersData.length > 0) {
      setUsers(usersData);
      // Establecer el primer usuario como seleccionado por defecto
      if (usersData.length > 0) {
        const firstUser = usersData[0];
        setSelectedUser(firstUser.nombreCompleto || 'Usuario sin nombre');
      }
    }
  }, [usersData]);

  // Manejar cambio de cliente para filtrar sucursales
  useEffect(() => {
    console.log('selectedClient changed:', selectedClient);
    console.log('clientes disponibles:', clientes);
    
    if (selectedClient) {
      // Buscar el cliente seleccionado para obtener su ID
      const clienteSeleccionado = clientes.find(c => c.nombre === selectedClient);
      console.log('clienteSeleccionado encontrado:', clienteSeleccionado);
      
      if (clienteSeleccionado) {
        loadSucursalesByCliente(clienteSeleccionado.id);
        // Limpiar la selección de sucursal cuando cambia el cliente
        setSelectedSucursal('');
      } else {
        console.log('No se encontró el cliente seleccionado');
      }
    } else {
      // Si no hay cliente seleccionado, mostrar todas las sucursales
      console.log('Mostrando todas las sucursales');
      setSucursalesFiltradas(sucursales);
      setSelectedSucursal('');
    }
  }, [selectedClient, clientes, sucursales]);

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (selectedView === 'mes') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
        return newDate;
      });
    } else if (selectedView === 'semana') {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 7);
        } else {
          newDate.setDate(prev.getDate() + 7);
        }
        return newDate;
      });
    } else if (selectedView === 'día') {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 1);
        } else {
          newDate.setDate(prev.getDate() + 1);
        }
        return newDate;
      });
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const weekDays = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  // Función para obtener los días de la semana actual
  const getWeekDaysFromDate = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Función para obtener los días del mes para vista mensual
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Ajustar para que lunes sea el primer día (0 = domingo, 1 = lunes)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        date: new Date(year, month, day)
      });
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  // Función para obtener los días de la semana para vista semanal
  const getWeekDays = () => {
    const weekDays = getWeekDaysFromDate(selectedDate);
    return weekDays.map(date => ({
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: date.toDateString() === new Date().toDateString(),
      date: date
    }));
  };

  // Función para obtener el día actual para vista diaria
  const getDayData = () => {
    const date = selectedDate;
    return {
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: date.toDateString() === new Date().toDateString(),
      date: date
    };
  };

  // Función para renderizar la vista mensual
  const renderMonthView = () => {
    const days = getMonthDays();
    
    return (
      <div className="grid grid-cols-7 h-full">
        {days.map((dayData, index) => (
          <div
            key={index}
            className={`p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[120px] ${
              !dayData.isCurrentMonth
                ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            } ${dayData.isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          >
            <div className="flex justify-end">
              <span
                className={`text-sm font-medium ${
                  dayData.isToday
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                    : ''
                }`}
              >
                {dayData.day}
              </span>
            </div>
            {/* Aquí se pueden agregar eventos de contactos en el futuro */}
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar la vista semanal
  const renderWeekView = () => {
    const days = getWeekDays();
    
    return (
      <div className="grid grid-cols-7 h-full">
        {days.map((dayData, index) => (
          <div
            key={index}
            className={`p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[200px] ${
              !dayData.isCurrentMonth
                ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            } ${dayData.isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          >
            <div className="flex justify-end">
              <span
                className={`text-sm font-medium ${
                  dayData.isToday
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                    : ''
                }`}
              >
                {dayData.day}
              </span>
            </div>
            {/* Aquí se pueden agregar eventos de contactos en el futuro */}
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar la vista diaria
  const renderDayView = () => {
    const dayData = getDayData();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex h-full">
        {/* Columna de horas */}
        <div className="w-20 border-r border-gray-200 dark:border-gray-700">
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        
        {/* Área principal del día */}
        <div className="flex-1">
          <div className="h-16 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {dayData.date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          {hours.slice(1).map(hour => (
            <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              {/* Aquí se pueden agregar eventos de contactos en el futuro */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para renderizar la vista de listado
  const renderListView = () => {
    // Simular algunos eventos de contactos para la vista de listado
    const contactos = [
      { id: 1, cliente: 'Empresa ABC S.A.', sucursal: 'Sede Central', fecha: new Date(), hora: '09:00', tipo: 'Reunión comercial' },
      { id: 2, cliente: 'Corporación XYZ', sucursal: 'Sucursal Norte', fecha: new Date(Date.now() + 86400000), hora: '14:00', tipo: 'Presentación' },
      { id: 3, cliente: 'Grupo DEF', sucursal: 'Sucursal Sur', fecha: new Date(Date.now() + 172800000), hora: '10:30', tipo: 'Seguimiento' },
    ];

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agenda de Contactos</h3>
        <div className="space-y-3">
          {contactos.map(contacto => (
            <div key={contacto.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{contacto.cliente}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contacto.sucursal} • {contacto.fecha.toLocaleDateString('es-ES')} a las {contacto.hora}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{contacto.tipo}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contacto.tipo === 'Reunión comercial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  contacto.tipo === 'Presentación' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {contacto.tipo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel de filtros (antes estaba implementado como "Sidebar" propio, lo que se veía duplicado con el menú global) */}
        <div className="lg:w-80 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Header del panel */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agenda de Contactos</h2>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            {/* Filtro por Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={usersLoading}
                >
                  <option value="">Todos los usuarios</option>
                  {usersLoading ? (
                    <option>Cargando usuarios...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user.id} value={user.nombreCompleto || 'Usuario sin nombre'}>
                        {user.nombreCompleto || 'Usuario sin nombre'}
                      </option>
                    ))
                  )}
                </select>
                <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filtro por Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente
              </label>
              <div className="relative">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Todos los clientes</option>
                  {loading ? (
                    <option>Cargando clientes...</option>
                  ) : (
                    clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.nombre}>
                        {cliente.nombre}
                      </option>
                    ))
                  )}
                </select>
                <BuildingOfficeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filtro por Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sucursal
              </label>
              <div className="relative">
                <select
                  value={selectedSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loadingSucursales}
                >
                  <option value="">
                    {selectedClient ? 'Seleccionar sucursal' : 'Todas las sucursales'}
                  </option>
                  {loadingSucursales ? (
                    <option>Cargando sucursales...</option>
                  ) : (
                    sucursalesFiltradas.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.nombre}>
                        {sucursal.nombre}
                      </option>
                    ))
                  )}
                </select>
                <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Resumen de filtros aplicados */}
          <div className="p-6 flex-1">
            <div className="flex items-center mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filtros aplicados</h3>
              <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {selectedUser && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Usuario: {selectedUser}</span>
                </div>
              )}
              {selectedClient && (
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>Cliente: {selectedClient}</span>
                </div>
              )}
              {selectedSucursal && (
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Sucursal: {selectedSucursal}</span>
                </div>
              )}
              {selectedClient && !selectedSucursal && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {sucursalesFiltradas.length} sucursales disponibles
                </div>
              )}
              {!selectedUser && !selectedClient && !selectedSucursal && (
                <p className="text-gray-500 dark:text-gray-400">Sin filtros aplicados</p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header del calendario */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              {/* Navegación */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  hoy
                </button>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Título según la vista */}
              <div className="text-2xl font-light text-gray-600 dark:text-gray-300">
                {selectedView === 'mes' && `${monthNames[month]} de ${year}`}
                {selectedView === 'semana' && `Semana del ${selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}
                {selectedView === 'día' && selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {selectedView === 'listado' && 'Lista de contactos'}
              </div>

              {/* Controles de vista */}
              <div className="flex space-x-1">
                {(['mes', 'semana', 'día', 'listado'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedView === view
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {view === 'mes' && 'Mes'}
                    {view === 'semana' && 'Semana'}
                    {view === 'día' && 'Día'}
                    {view === 'listado' && 'Lista'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido del calendario según la vista */}
          <div className="flex-1 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
              {selectedView === 'listado' ? (
                renderListView()
              ) : (
                <>
                  {/* Días de la semana (solo para vistas de calendario) */}
                  <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Contenido según la vista */}
                  {selectedView === 'mes' && renderMonthView()}
                  {selectedView === 'semana' && renderWeekView()}
                  {selectedView === 'día' && renderDayView()}
                </>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default AgendaContactosPage;
