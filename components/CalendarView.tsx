
import React, { useState, useContext, useMemo } from 'react';
import { MOCK_STORES, MOCK_USERS, MOCK_EQUIPMENT, MOCK_TASK_TYPES } from '../constants';
import { Task, Role, TaskStatus, Equipment } from '../types';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../App';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon, TrashIcon } from './Icons';

const CalendarView: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { tasks, addTask, materialCatalog } = useContext(DataContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({ materials: [] });
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);

  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const tasksByDate = useMemo(() => tasks.reduce((acc, task) => {
    const dateStr = task.scheduledDate.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>), [tasks, currentDate]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = e.target.value;
    const equipmentInStore = MOCK_EQUIPMENT.filter(eq => eq.storeId === storeId);
    setAvailableEquipment(equipmentInStore);
    setNewTaskData({ ...newTaskData, storeId, equipmentId: '' }); // Reset equipment
  };

  const handleToggleMaterials = (checked: boolean) => {
      if (checked) {
          setNewTaskData(prev => ({ ...prev, materials: [{ materialId: '', quantity: 1 }] }));
      } else {
          setNewTaskData(prev => ({ ...prev, materials: [] }));
      }
  };

  const handleAddMaterialRow = () => {
      setNewTaskData(prev => ({ ...prev, materials: [...(prev.materials || []), { materialId: '', quantity: 1 }] }));
  };
  
  const handleMaterialRowChange = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
      setNewTaskData(prev => {
          const newMaterials = [...(prev.materials || [])];
          // @ts-ignore
          newMaterials[index][field] = value;
          return { ...prev, materials: newMaterials };
      });
  };

  const handleRemoveMaterialRow = (index: number) => {
      setNewTaskData(prev => ({ ...prev, materials: (prev.materials || []).filter((_, i) => i !== index) }));
  };


  const handleCreateOS = () => {
    const { title, description, storeId, equipmentId, technicianId, scheduledDate, materials: taskMaterials } = newTaskData;
    if (!title || !storeId || !equipmentId || !technicianId || !scheduledDate) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }

    const equipment = MOCK_EQUIPMENT.find(e => e.id === equipmentId);
    if (!equipment) return;
    
    // --- Generate new OS Number ---
    const currentYear = new Date().getFullYear();
    const prefix = `C${currentYear}`;
    const currentYearTasks = tasks.filter(task => task.osNumber.startsWith(prefix));
    let nextConsecutive = 1;
    if (currentYearTasks.length > 0) {
        const highestNumber = Math.max(
            ...currentYearTasks.map(task => parseInt(task.osNumber.split('-')[1], 10))
        );
        nextConsecutive = highestNumber + 1;
    }
    const newOsNumber = `${prefix}-${String(nextConsecutive).padStart(3, '0')}`;
    // --------------------------------

    const newTask: Task = {
        id: `task-${Date.now()}`,
        osNumber: newOsNumber,
        title,
        description: description || '',
        storeId,
        equipmentId,
        technicianId,
        scheduledDate,
        status: TaskStatus.PENDING,
        serviceType: equipment.serviceType,
        photos: [],
        notes: '',
        materials: taskMaterials?.filter(m => m.materialId && m.quantity > 0),
    };
    
    addTask(newTask);

    setIsCreateModalOpen(false);
    setNewTaskData({ materials: [] });
    setAvailableEquipment([]);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear OS
            </button>
          )}
          <button onClick={prevMonth} className="p-2 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300">
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button onClick={nextMonth} className="p-2 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300">
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dayName => (
          <div key={dayName} className="py-2 font-semibold text-center text-gray-700 bg-gray-100">{dayName}</div>
        ))}
        {days.map(d => {
          const tasksOnDay = tasksByDate[d.toDateString()] || [];
          return (
            <div key={d.toString()} className={`relative p-2 h-32 overflow-y-auto bg-white ${d.getMonth() !== currentDate.getMonth() ? 'bg-gray-50' : ''}`}>
              <time dateTime={d.toISOString()} className={`font-semibold ${isToday(d) ? 'flex items-center justify-center w-8 h-8 bg-brand-blue text-white rounded-full' : 'text-gray-800'}`}>{d.getDate()}</time>
              <div className="mt-1 space-y-1">
                {tasksOnDay.map(task => (
                  <button key={task.id} onClick={() => setSelectedTask(task)} className="block w-full p-1 text-xs text-left text-white bg-brand-blue-light rounded-md truncate hover:bg-brand-blue">
                    {task.osNumber}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setSelectedTask(null)}>
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.osNumber}</h2>
                <p className="mt-1 text-lg text-gray-700">{selectedTask.title}</p>
                <p className="mt-2 text-gray-600">{selectedTask.description}</p>
                <div className="mt-4 space-y-2 text-gray-700">
                    <p><strong>Tienda:</strong> {MOCK_STORES.find(s => s.id === selectedTask.storeId)?.name}</p>
                    <p><strong>Técnico:</strong> {MOCK_USERS.find(u => u.id === selectedTask.technicianId)?.name}</p>
                    <p><strong>Fecha:</strong> {selectedTask.scheduledDate.toLocaleDateString()}</p>
                    <p><strong>Estado:</strong> <span className={`px-2 py-1 text-sm font-semibold rounded-full ${selectedTask.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedTask.status}</span></p>
                </div>
                <button onClick={() => setSelectedTask(null)} className="w-full px-4 py-2 mt-6 font-semibold text-white transition-colors duration-200 rounded-lg bg-brand-blue hover:bg-brand-blue-light">Cerrar</button>
            </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-lg max-h-[90vh] p-6 overflow-y-auto bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Orden de Servicio</h2>
                      <button onClick={() => setIsCreateModalOpen(false)}><XIcon className="w-6 h-6 text-gray-600"/></button>
                  </div>
                  <div className="mt-4 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Tipo de Tarea</label>
                          <select 
                            onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} 
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                            value={newTaskData.title || ''}
                          >
                              <option value="">Seleccione un tipo de tarea</option>
                              {MOCK_TASK_TYPES.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Descripción (Detalles Adicionales)</label>
                          <textarea spellCheck="true" onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"></textarea>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Fecha</label>
                          <input type="date" onChange={e => setNewTaskData({...newTaskData, scheduledDate: new Date(`${e.target.value}T12:00:00`)})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Tienda</label>
                          <select onChange={handleStoreChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                              <option value="">Seleccione una tienda</option>
                              {MOCK_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Equipo</label>
                          <select 
                            onChange={e => setNewTaskData({...newTaskData, equipmentId: e.target.value})} 
                            disabled={!newTaskData.storeId || availableEquipment.length === 0}
                            value={newTaskData.equipmentId || ''}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
                              <option value="">
                                {!newTaskData.storeId 
                                  ? "Primero seleccione una tienda" 
                                  : availableEquipment.length > 0
                                    ? "Seleccione un equipo"
                                    : "No hay equipos en esta tienda"}
                              </option>
                              {availableEquipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
                          <select onChange={e => setNewTaskData({...newTaskData, technicianId: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                              <option value="">Seleccione un técnico</option>
                              {MOCK_USERS.filter(u => u.role === Role.TECHNICIAN).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                      </div>
                      <div className="pt-2 border-t">
                        <label className="flex items-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-brand-blue-light focus:ring-brand-blue-light"
                                checked={!!newTaskData.materials && newTaskData.materials.length > 0}
                                onChange={(e) => handleToggleMaterials(e.target.checked)}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Asignar Materiales</span>
                        </label>
                      </div>

                      {newTaskData.materials && newTaskData.materials.length > 0 && (
                          <div className="p-3 mt-2 space-y-2 border rounded-md bg-gray-50">
                              {newTaskData.materials.map((mat, index) => (
                                  <div key={index} className="grid items-center grid-cols-12 gap-2">
                                      <select
                                          value={mat.materialId}
                                          onChange={(e) => handleMaterialRowChange(index, 'materialId', e.target.value)}
                                          className="w-full col-span-7 mt-1 border-gray-300 rounded-md shadow-sm"
                                      >
                                          <option value="">Seleccione material...</option>
                                          {materialCatalog.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                      </select>
                                      <input
                                          type="number"
                                          min="1"
                                          placeholder="Cant."
                                          value={mat.quantity}
                                          onChange={(e) => handleMaterialRowChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                          className="w-full col-span-3 mt-1 border-gray-300 rounded-md shadow-sm"
                                      />
                                      <button
                                          onClick={() => handleRemoveMaterialRow(index)}
                                          className="col-span-2 p-2 text-gray-500 rounded-full justify-self-center hover:bg-gray-100 hover:text-red-600"
                                          aria-label="Eliminar material"
                                      >
                                          <TrashIcon className="w-5 h-5"/>
                                      </button>
                                  </div>
                              ))}
                              <button
                                  onClick={handleAddMaterialRow}
                                  className="flex items-center gap-1 px-2 py-1 mt-2 text-xs font-semibold text-white rounded bg-brand-blue-light hover:bg-brand-blue"
                              >
                                  <PlusIcon className="w-4 h-4"/> Añadir Material
                              </button>
                          </div>
                      )}
                  </div>
                   <div className="flex justify-end mt-6 space-x-4">
                      <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                      <button onClick={handleCreateOS} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar OS</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CalendarView;