import React, { useState, useEffect } from 'react';
import { MOCK_SERVICE_TYPES } from '../constants';
import { ServiceType } from '../types';
import { EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';

interface EditModalProps {
    isOpen: boolean;
    serviceType: Partial<ServiceType> | null;
    onClose: () => void;
    onSave: (serviceType: Partial<ServiceType>) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, serviceType, onClose, onSave }) => {
    const [currentServiceType, setCurrentServiceType] = useState(serviceType);

    useEffect(() => {
        setCurrentServiceType(serviceType);
    }, [serviceType]);

    if (!isOpen || !currentServiceType) return null;

    const handleSaveClick = () => {
        if (!currentServiceType.name?.trim()) {
            alert("El nombre no puede estar vacío.");
            return;
        }
        onSave({ ...currentServiceType, name: currentServiceType.name.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">{currentServiceType?.id ? 'Editar' : 'Añadir'} Tipo de Servicio</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6 text-gray-500"/>
                    </button>
                </div>
                <div className="mt-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Tipo de Servicio</label>
                    <input
                        type="text"
                        spellCheck="true"
                        id="name"
                        value={currentServiceType.name || ''}
                        onChange={(e) => setCurrentServiceType({ ...currentServiceType, name: e.target.value })}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-light focus:border-brand-blue-light"
                    />
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar</button>
                </div>
            </div>
        </div>
    );
};

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    serviceType: ServiceType | null;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, serviceType, onClose, onConfirm }) => {
    if (!isOpen || !serviceType) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">
                ¿Está seguro que desea eliminar <span className="font-semibold">{serviceType.name}</span>?
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
  );
};

const ServiceTypesManagement: React.FC = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(MOCK_SERVICE_TYPES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentServiceType, setCurrentServiceType] = useState<Partial<ServiceType> | null>(null);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<ServiceType | null>(null);

  const openModalForNew = () => {
    setCurrentServiceType({ name: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (serviceType: ServiceType) => {
    setCurrentServiceType({ ...serviceType });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentServiceType(null);
  };

  const handleSave = (serviceTypeToSave: Partial<ServiceType>) => {
    if (serviceTypeToSave.id) { // Editing existing
      const updatedTypes = serviceTypes.map(st => st.id === serviceTypeToSave.id ? { ...st, name: serviceTypeToSave.name! } : st);
      setServiceTypes(updatedTypes);
      MOCK_SERVICE_TYPES.splice(0, MOCK_SERVICE_TYPES.length, ...updatedTypes); // Update mock data
    } else { // Adding new
      const newType: ServiceType = {
        id: `st-${Date.now()}`,
        name: serviceTypeToSave.name!,
      };
      const updatedTypes = [...serviceTypes, newType];
      setServiceTypes(updatedTypes);
      MOCK_SERVICE_TYPES.push(newType); // Update mock data
    }
    closeModal();
  };
  
  const handleDeleteConfirm = () => {
    if (!serviceTypeToDelete) return;
    
    const updatedTypes = serviceTypes.filter(st => st.id !== serviceTypeToDelete.id);
    setServiceTypes(updatedTypes);
    MOCK_SERVICE_TYPES.splice(0, MOCK_SERVICE_TYPES.length, ...updatedTypes); // Update mock data
    setServiceTypeToDelete(null);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Tipos de Servicio</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {serviceTypes.map(serviceType => (
                <tr key={serviceType.id} className="text-gray-700">
                  <td className="px-4 py-3">{serviceType.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openModalForEdit(serviceType)} 
                        className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-brand-blue" 
                        aria-label={`Editar ${serviceType.name}`}
                      >
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => setServiceTypeToDelete(serviceType)} className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${serviceType.name}`}>
                          <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={openModalForNew} className="inline-flex items-center px-4 py-2 mt-6 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500">
          <PlusIcon className="w-5 h-5 mr-2"/>
          Añadir Nuevo Tipo
        </button>
      </div>
      <EditModal 
        isOpen={isModalOpen}
        serviceType={currentServiceType}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteConfirmationModal 
        isOpen={!!serviceTypeToDelete}
        serviceType={serviceTypeToDelete}
        onClose={() => setServiceTypeToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ServiceTypesManagement;