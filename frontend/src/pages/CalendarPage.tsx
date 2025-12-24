import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useUsers } from '../hooks/useSecurity';
import { tareaService } from '../services/tareaService';
import { relevamientoService, Relevamiento } from '../services/relevamientoService';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'mes' | 'semana' | 'día' | 'listado'>('mes');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('PESSE, Agustina');
  const [selectedTaskType, setSelectedTaskType] = useState('Tipo');
  const [selectedAssignTo, setSelectedAssignTo] = useState('Asignar a...');
  
  // Estados para los datos de los dropdowns
  const [users, setUsers] = useState<any[]>([]);
  const [tiposTarea, setTiposTarea] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para relevamientos
  const [relevamientos, setRelevamientos] = useState<Relevamiento[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Hook para obtener usuarios
  const { users: usersData, loading: usersLoading } = useUsers();

  // Función para cargar relevamientos del usuario seleccionado
  const loadRelevamientos = async (userId: number) => {
    try {
      setLoading(true);
      const relevamientosData = await relevamientoService.getByUsuario(userId);
      setRelevamientos(relevamientosData);
    } catch (error) {
      console.error('Error cargando relevamientos:', error);
      setRelevamientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener relevamientos de un día específico
  const getRelevamientosForDate = (date: Date) => {
    if (!relevamientos.length) return [];
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return relevamientos.filter(relevamiento => {
      const relevamientoDate = new Date(relevamiento.fecha);
      relevamientoDate.setHours(0, 0, 0, 0);
      return relevamientoDate.getTime() === targetDate.getTime();
    });
  };

  // Cargar datos de los dropdowns
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [tiposTareaData] = await Promise.all([
          tareaService.getTiposTarea()
        ]);
        setTiposTarea(tiposTareaData);
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
        setSelectedUserId(firstUser.id);
        // Cargar relevamientos del primer usuario
        loadRelevamientos(firstUser.id);
      }
    }
  }, [usersData]);

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
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      const dayRelevamientos = getRelevamientosForDate(date);
      
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        date,
        relevamientos: dayRelevamientos
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      const date = new Date(year, month, day);
      const dayRelevamientos = getRelevamientosForDate(date);
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        date,
        relevamientos: dayRelevamientos
      });
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dayRelevamientos = getRelevamientosForDate(date);
      
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        date,
        relevamientos: dayRelevamientos
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
            
            {/* Mostrar relevamientos del día */}
            {dayData.relevamientos && dayData.relevamientos.length > 0 && (
              <div className="mt-1 space-y-1">
                {dayData.relevamientos.slice(0, 3).map((relevamiento, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded truncate cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-800"
                    title={`${relevamiento.sucursal?.cliente?.nombre || 'Cliente'} - ${relevamiento.sucursal?.nombre || 'Sucursal'}`}
                  >
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {relevamiento.sucursal?.cliente?.nombre || 'Cliente'}
                      </span>
                    </div>
                  </div>
                ))}
                {dayData.relevamientos.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayData.relevamientos.length - 3} más
                  </div>
                )}
              </div>
            )}
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
            {/* Aquí se pueden agregar eventos en el futuro */}
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
              {/* Aquí se pueden agregar eventos en el futuro */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para renderizar la vista de listado
  const renderListView = () => {
    // Simular algunos eventos para la vista de listado
    const events = [
      { id: 1, title: 'Reunión de equipo', date: new Date(), time: '09:00', type: 'reunión' },
      { id: 2, title: 'Mantenimiento extintor A1', date: new Date(Date.now() + 86400000), time: '14:00', type: 'mantenimiento' },
      { id: 3, title: 'Inspección mensual', date: new Date(Date.now() + 172800000), time: '10:30', type: 'inspección' },
    ];

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Próximos eventos</h3>
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.date.toLocaleDateString('es-ES')} a las {event.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.type === 'reunión' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  event.type === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calendario</h2>
          </div>

          {/* Selección de usuario */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  // Encontrar el usuario seleccionado y cargar sus relevamientos
                  const selectedUserData = users.find(user => user.nombreCompleto === e.target.value);
                  if (selectedUserData) {
                    setSelectedUserId(selectedUserData.id);
                    loadRelevamientos(selectedUserData.id);
                  }
                }}
                className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={usersLoading}
              >
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
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Indicador de relevamientos */}
            {selectedUserId && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Relevamientos pendientes
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {relevamientos.length} relevamientos asignados
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tareas pendientes */}
          <div className="p-6 flex-1">
            <div className="flex items-center mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Tareas pendientes</h3>
              <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            
            <div className="space-y-3">
              {/* Filtro por tipo */}
              <div className="relative">
                <select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="Tipo">Tipo</option>
                  {loading ? (
                    <option>Cargando tipos...</option>
                  ) : (
                    tiposTarea.map((tipo) => (
                      <option key={tipo.id} value={tipo.nombre}>
                        {tipo.nombre}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro por asignar a */}
              <div className="relative">
                <select
                  value={selectedAssignTo}
                  onChange={(e) => setSelectedAssignTo(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={usersLoading}
                >
                  <option value="Asignar a...">Asignar a...</option>
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
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Lista de tareas pendientes (vacía por ahora) */}
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No hay tareas pendientes
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal del calendario */}
        <div className="flex-1 flex flex-col">
          {/* Header del calendario */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              {/* Navegación */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  hoy
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
                {selectedView === 'listado' && 'Lista de eventos'}
              </div>

              {/* Controles de vista */}
              <div className="flex space-x-1">
                {(['mes', 'semana', 'día', 'listado'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedView === view
                        ? 'bg-red-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {view}
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
    </div>
  );
};

export default CalendarPage;
