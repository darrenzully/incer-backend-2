import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissionsContext, PermissionKey } from '../contexts/PermissionsContext';

export default function RequirePermission({
  anyOf,
  children,
}: {
  anyOf: PermissionKey[];
  children: React.ReactNode;
}) {
  const { loading, hasAny } = usePermissionsContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!hasAny(anyOf)) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">No autorizado</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          No tenés permisos para acceder a esta sección.
        </p>
        <div className="mt-4">
          <Link
            to="/dashboard"
            className="inline-flex px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


