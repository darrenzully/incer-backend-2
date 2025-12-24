import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BusinessCenter {
  id: number;
  name: string;
  description?: string;
  activo: boolean;
}

interface CenterContextType {
  currentCenter: BusinessCenter | null;
  accessibleCenters: BusinessCenter[];
  switchCenter: (centerId: number) => void;
  hasMultipleCenters: boolean;
  isLoading: boolean;
}

const CenterContext = createContext<CenterContextType | undefined>(undefined);

interface CenterProviderProps {
  children: ReactNode;
}

export function CenterProvider({ children }: CenterProviderProps) {
  const [currentCenter, setCurrentCenter] = useState<BusinessCenter | null>(null);
  const [accessibleCenters, setAccessibleCenters] = useState<BusinessCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar centros accesibles al inicializar
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Obtener centros accesibles del usuario
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5124'}/api/businesscenters/accessible`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const centers = await response.json();
          console.log('=== CENTERS DEBUG ===');
          console.log('Centers recibidos:', centers);
          console.log('Cantidad de centros:', centers.length);
          console.log('====================');
          setAccessibleCenters(centers);

          // Si hay centros, cargar el centro actual del localStorage o usar el primero
          const savedCenterId = localStorage.getItem('currentCenterId');
          console.log('Saved center ID:', savedCenterId);
          
          if (savedCenterId && centers.find(c => c.id === parseInt(savedCenterId))) {
            const center = centers.find(c => c.id === parseInt(savedCenterId));
            console.log('Centro encontrado por ID guardado:', center);
            setCurrentCenter(center || null);
          } else if (centers.length > 0) {
            console.log('Usando primer centro:', centers[0]);
            setCurrentCenter(centers[0]);
            localStorage.setItem('currentCenterId', centers[0].id.toString());
          } else {
            console.log('No hay centros disponibles');
            setCurrentCenter(null);
          }
        } else {
          console.error('Error en respuesta de centros:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        }
      } catch (error) {
        console.error('Error cargando centros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCenters();
  }, []);

  const switchCenter = (centerId: number) => {
    console.log('=== SWITCH CENTER ===');
    console.log('CenterId recibido:', centerId);
    console.log('Current center antes:', currentCenter);
    const center = accessibleCenters.find(c => c.id === centerId);
    console.log('Center encontrado:', center);
    if (center) {
      setCurrentCenter(center);
      localStorage.setItem('currentCenterId', centerId.toString());
      console.log('Centro cambiado a:', center);
    } else {
      console.warn('Centro no encontrado en accessibleCenters');
    }
    console.log('====================');
  };

  const hasMultipleCenters = accessibleCenters.length > 1;

  const value: CenterContextType = {
    currentCenter,
    accessibleCenters,
    switchCenter,
    hasMultipleCenters,
    isLoading
  };

  return (
    <CenterContext.Provider value={value}>
      {children}
    </CenterContext.Provider>
  );
}

export function useCenter(): CenterContextType {
  const context = useContext(CenterContext);
  if (context === undefined) {
    throw new Error('useCenter must be used within a CenterProvider');
  }
  return context;
}
