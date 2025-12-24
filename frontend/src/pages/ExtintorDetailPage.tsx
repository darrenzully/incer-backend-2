import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  FireIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  UserIcon,
  CubeIcon,
  TagIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { extintorService, Extintor } from '../services/extintorService';
import Notification from '../components/Notification';

const ExtintorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [extintor, setExtintor] = useState<Extintor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadExtintor = useCallback(async () => {
    try {
      setLoading(true);
      const data = await extintorService.getById(parseInt(id!));
      setExtintor(data);
    } catch (error) {
      console.error('Error al cargar extintor:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del extintor'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadExtintor();
    }
  }, [id, loadExtintor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!extintor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Extintor no encontrado
          </h1>
          <button
            onClick={() => navigate('/extintores')}
            className="text-primary-500 hover:text-primary-600"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/extintores')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Extintor #{extintor.orden}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  ID: {extintor.id}
                </p>
                {extintor.codigo && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Código: {extintor.codigo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                extintor.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {extintor.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => navigate(`/extintores/edit/${extintor.id}`)}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Información General */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información General
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Número de Orden
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {extintor.orden}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ID del Extintor
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {extintor.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      {extintor.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {extintor.interno && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Número Interno
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.interno}
                      </p>
                    </div>
                  )}

                  {extintor.nroSerie && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Número de Serie
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.nroSerie}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {extintor.tipoDeCarga && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Tipo de Carga
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.tipoDeCarga.nombre}
                      </p>
                    </div>
                  )}

                  {extintor.capacidad && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Capacidad
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.capacidad.valor} {extintor.capacidad.unidad || 'kg'}
                      </p>
                    </div>
                  )}

                  {extintor.fabricante && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Fabricante
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.fabricante.nombre}
                      </p>
                      {extintor.nroFabricante && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nº: {extintor.nroFabricante}
                        </p>
                      )}
                    </div>
                  )}

                  {extintor.año && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Año de Fabricación
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.año}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas Importantes */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Fechas Importantes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Vencimiento de Carga
                    </label>
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <p className={`text-lg font-medium ${
                        isExpired(extintor.vencimientoCarga) 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatDate(extintor.vencimientoCarga)}
                      </p>
                      {isExpired(extintor.vencimientoCarga) && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-2" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Vencimiento PH
                    </label>
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <p className={`text-lg font-medium ${
                        isExpired(extintor.vencimientoPH) 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatDate(extintor.vencimientoPH)}
                      </p>
                      {isExpired(extintor.vencimientoPH) && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-2" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Incorporación
                    </label>
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatDate(extintor.incorporacion)}
                      </p>
                    </div>
                  </div>

                  {extintor.fechaRecepcion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Fecha de Recepción
                      </label>
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatDate(extintor.fechaRecepcion)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicación y Asignación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Ubicación y Asignación
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {extintor.cliente && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Cliente Asignado
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {extintor.cliente.id}
                      </p>
                    </div>
                  )}

                  {extintor.sucursal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sucursal
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.sucursal.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {extintor.sucursal.id}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {extintor.ubicacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ubicación Específica
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.ubicacion}
                      </p>
                    </div>
                  )}

                  {extintor.qrId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        ID del Código QR
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.qrId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información Adicional
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <TagIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Etiqueta
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.etiqueta || 'Sin etiqueta'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CubeIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Código IRAM
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.iram || 'Sin código IRAM'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Reserva
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.reserva ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <XCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Baja
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {extintor.baja ? 'Sí' : 'No'}
                      </p>
                      {extintor.observacionBaja && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {extintor.observacionBaja}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Estado y Tipo */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Tipo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {extintor.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {extintor.activo ? 'Extintor Activo' : 'Extintor Inactivo'}
                  </span>
                </div>

                {extintor.tipoDeCarga && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tipo de Carga
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {extintor.tipoDeCarga.nombre}
                    </p>
                  </div>
                )}

                {extintor.capacidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Capacidad
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {extintor.capacidad.valor} {extintor.capacidad.unidad || 'kg'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Asignación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información de Asignación
              </h3>
              
              <div className="space-y-4">
                {extintor.cliente && (
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Cliente
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {extintor.cliente.nombre}
                      </p>
                    </div>
                  </div>
                )}

                {extintor.sucursal && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Sucursal
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {extintor.sucursal.nombre}
                      </p>
                    </div>
                  </div>
                )}

                {extintor.ubicacion && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Ubicación
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {extintor.ubicacion}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información del Sistema
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FireIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tipo de Entidad
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Extintor de Incendio
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <QrCodeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Código QR
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {extintor.qrId ? `ID: ${extintor.qrId}` : 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Código
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {extintor.codigo || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ExtintorDetailPage;
