import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '../constants';
import { Role, User } from '../types';
import { EditIcon, TrashIcon, XIcon } from './Icons';

// --- Extracted Components ---

interface UserModalProps {
  isOpen: boolean;
  user: Partial<User> | null;
  allUsers: User[];
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, user, allUsers, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  if (!isOpen || !editedUser) return null;

  const handleSaveClick = () => {
    if (!editedUser.name?.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    onSave({ ...editedUser, name: editedUser.name.trim() });
  };

  const isSuperAdmin = editedUser?.id && allUsers.find(u => u.id === editedUser.id)?.role === Role.SUPER_ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{editedUser.id ? 'Editar' : 'Añadir'} Usuario</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="name"
              spellCheck="true"
              value={editedUser.name || ''}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              id="role"
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as Role })}
              disabled={isSuperAdmin}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={Role.ADMIN}>Administrador</option>
              <option value={Role.TECHNICIAN}>Técnico</option>
              {isSuperAdmin && <option value={Role.SUPER_ADMIN}>Super Administrador</option>}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSaveClick} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};


interface DeleteConfirmationModalProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onConfirm: () => void;
}
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, user, onClose, onConfirm }) => {
    if (!isOpen || !user) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">
                ¿Está seguro que desea eliminar a <span className="font-semibold">{user.name}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end mt-6 space-x-4">
                <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                    Eliminar
                </button>
            </div>
        </div>
      </div>
  )};

// --- Main Component ---
const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const openModalForNew = () => {
    setCurrentUser({ name: '', role: Role.TECHNICIAN });
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: User) => {
    setCurrentUser({ ...user }); // Create a copy to edit
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = (userToSave: Partial<User>) => {
    if (userToSave.id) { // Editing existing user
      setUsers(users.map(u => u.id === userToSave.id ? userToSave as User : u));
    } else { // Adding new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userToSave.name!,
        role: userToSave.role || Role.TECHNICIAN,
      };
      setUsers([...users, newUser]);
    }
    closeModal();
  };
  
  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    
    // This is a double-check, but the UI should prevent this.
    if (userToDelete.role === Role.SUPER_ADMIN) {
        alert("El Super Administrador no puede ser eliminado.");
        setUserToDelete(null);
        return;
    }

    setUsers(users.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {users.map(user => (
                <tr key={user.id} className="text-gray-700">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                      user.role === Role.SUPER_ADMIN ? 'bg-red-100 text-red-700' :
                      user.role === Role.ADMIN ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModalForEdit(user)} 
                        className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-brand-blue" 
                        aria-label={`Editar ${user.name}`}
                        disabled={user.role === Role.SUPER_ADMIN} // Disable editing for Super Admin
                      >
                        <EditIcon className={`w-5 h-5 ${user.role === Role.SUPER_ADMIN ? 'text-gray-300 cursor-not-allowed' : ''}`}/>
                      </button>
                       {user.role !== Role.SUPER_ADMIN && (
                        <button onClick={() => setUserToDelete(user)} className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${user.name}`}>
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={openModalForNew} className="w-full px-4 py-2 mt-6 font-bold text-white transition-colors duration-200 rounded-lg md:w-auto bg-brand-accent hover:bg-yellow-500">
          Añadir Nuevo Usuario
        </button>
      </div>
      <UserModal 
        isOpen={isModalOpen}
        user={currentUser}
        allUsers={users}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteConfirmationModal 
        isOpen={!!userToDelete}
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default UsersManagement;