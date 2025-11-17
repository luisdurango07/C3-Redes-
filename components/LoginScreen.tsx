
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MOCK_USERS } from '../constants';
import { LogoIcon } from './Icons';

const LoginScreen: React.FC = () => {
  const { login } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-blue to-blue-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-20 h-20 text-brand-blue" />
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            C3 Redes Management
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Seleccione un usuario para iniciar sesión
          </p>
        </div>
        <div className="space-y-4">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => login(user.id)}
              className="w-full px-4 py-3 text-lg font-semibold text-white transition-transform duration-200 transform bg-brand-blue-light rounded-lg hover:bg-brand-blue hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
