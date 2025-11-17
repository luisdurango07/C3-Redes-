import React, { useState, useEffect } from 'react';
import { MOCK_TASK_TYPES } from '../constants';
import { TaskType } from '../types';
import { EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';

interface EditModalProps {
    isOpen: boolean;
    taskType: Partial<TaskType> | null;
    onClose: () => void;
    onSave: (taskType: Partial<TaskType>) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, taskType, onClose, onSave }) => {
    const [currentTaskType, setCurrentTaskType] = useState(taskType);

    useEffect(() => {
        setCurrentTaskType(taskType);
    }, [taskType]);

    if (!isOpen || !currentTaskType) return null;

    const handleSaveClick = () => {
        if (!currentTaskType.name?.trim()) {
            alert("El nombre no puede estar vacío.");
            return;
        }
        onSave({ ...currentTaskType, name: currentTaskType.name.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">{currentTaskType?.id ? 'Editar' : 'Añadir'} Tipo de Tarea</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6 text-gray-500"/>
                    </button>
                </div>
                <div className="mt-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Tipo de Tarea</label>
                    <input
                        type="text"
                        id="name"
                        spellCheck="true"
                        value={currentTaskType.name}
                        onChange={(e) => setCurrentTaskType({ ...currentTaskType, name: e.target.value })}
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
    taskType: TaskType | null;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, taskType, onClose, onConfirm }) => {
    if (!isOpen || !taskType) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">
                ¿Está seguro que desea eliminar <span className="font-semibold">{taskType.name}</span>?
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

const TaskTypesManagement: React.FC = () => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(MOCK_TASK_TYPES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState<Partial<TaskType> | null>(null);
  const [taskTypeToDelete, setTaskTypeToDelete] = useState<TaskType | null>(null);

  const openModalForNew = () => {
    setCurrentTaskType({ name: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (taskType: TaskType) => {
    setCurrentTaskType({ ...taskType });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTaskType(null);
  };

  const handleSave = (taskTypeToSave: Partial<TaskType>) => {
    if (taskTypeToSave.id) { // Editing existing
      const updatedTypes = taskTypes.map(tt => tt.id === taskTypeToSave.id ? { ...tt, name: taskTypeToSave.name! } : tt);
      setTaskTypes(updatedTypes);
      MOCK_TASK_TYPES.splice(0, MOCK_TASK_TYPES.length, ...updatedTypes); // Update mock data
    } else { // Adding new
      const newType: TaskType = {
        id: `tt-${Date.now()}`,
        name: taskTypeToSave.name!,
      };
      const updatedTypes = [...taskTypes, newType];
      setTaskTypes(updatedTypes);
      MOCK_TASK_TYPES.push(newType); // Update mock data
    }
    closeModal();
  };
  
  const handleDeleteConfirm = () => {
    if (!taskTypeToDelete) return;
    
    const updatedTypes = taskTypes.filter(tt => tt.id !== taskTypeToDelete.id);
    setTaskTypes(updatedTypes);
    MOCK_TASK_TYPES.splice(0, MOCK_TASK_TYPES.length, ...updatedTypes); // Update mock data
    setTaskTypeToDelete(null);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Tipos de Tarea</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {taskTypes.map(taskType => (
                <tr key={taskType.id} className="text-gray-700">
                  <td className="px-4 py-3">{taskType.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openModalForEdit(taskType)} 
                        className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-brand-blue" 
                        aria-label={`Editar ${taskType.name}`}
                      >
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => setTaskTypeToDelete(taskType)} className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${taskType.name}`}>
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
        taskType={currentTaskType}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteConfirmationModal 
        isOpen={!!taskTypeToDelete}
        taskType={taskTypeToDelete}
        onClose={() => setTaskTypeToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default TaskTypesManagement;