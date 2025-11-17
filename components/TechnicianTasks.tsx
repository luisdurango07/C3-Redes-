import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../App';
import { Task, TaskStatus, Tool } from '../types';
import TaskDetail from './TaskDetail';
import { MOCK_STORES, MOCK_EQUIPMENT } from '../constants';
import { ToolsIcon } from './Icons';

// A reusable component for displaying a list of tasks in a table.
const TaskTable: React.FC<{ tasks: Task[]; onSelectTask: (task: Task) => void }> = ({ tasks, onSelectTask }) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                    <th scope="col" className="px-4 py-3">Fecha</th>
                    <th scope="col" className="px-4 py-3">OS #</th>
                    <th scope="col" className="px-4 py-3">Tienda</th>
                    <th scope="col" className="px-4 py-3">Ciudad</th>
                    <th scope="col" className="px-4 py-3">Equipo</th>
                    <th scope="col" className="px-4 py-3">Intervención</th>
                    <th scope="col" className="px-4 py-3">Estado</th>
                    <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map(task => {
                    const store = MOCK_STORES.find(s => s.id === task.storeId);
                    const equipment = MOCK_EQUIPMENT.find(e => e.id === task.equipmentId);
                    const statusColor = {
                        [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
                        [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
                        [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
                    };
                    return (
                        <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-4">{task.scheduledDate.toLocaleDateString()}</td>
                            <td className="px-4 py-4 font-medium text-gray-900">{task.osNumber}</td>
                            <td className="px-4 py-4">{store?.name}</td>
                            <td className="px-4 py-4">{store?.city}</td>
                            <td className="px-4 py-4">{equipment?.name}</td>
                            <td className="px-4 py-4">{task.title}</td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusColor[task.status]}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                               <button 
                                    onClick={() => onSelectTask(task)}
                                    className="px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg text-xs bg-brand-blue hover:bg-brand-blue-light"
                                >
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const AssignedTools: React.FC<{ tools?: Tool[] }> = ({ tools }) => {
    if (!tools || tools.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="flex items-center mb-4 text-3xl font-bold text-gray-800">
                <ToolsIcon className="w-8 h-8 mr-3 text-brand-blue"/>
                Mis Herramientas Asignadas
            </h2>
            <div className="p-4 bg-white rounded-lg shadow">
                 <ul className="space-y-2">
                    {tools.map(tool => (
                        <li key={tool.id} className="p-3 text-gray-700 bg-gray-50 rounded-md">
                            <span className="font-semibold">{tool.name}</span> ({tool.id}) - <span className="text-sm text-gray-500">{tool.category}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const TechnicianTasks: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { tasks, updateTask } = useContext(DataContext);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myTasks = tasks.filter(task => task.technicianId === user?.id);
  const pendingTasks = myTasks.filter(t => t.status !== TaskStatus.COMPLETED).sort((a,b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);
    setSelectedTask(null);
  }

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} onUpdate={handleTaskUpdate} />;
  }

  return (
    <div className="space-y-8">
        <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800">Tareas Pendientes</h2>
            {pendingTasks.length > 0 ? (
                <TaskTable tasks={pendingTasks} onSelectTask={setSelectedTask} />
            ) : <p className="p-4 text-gray-500 bg-gray-100 rounded-lg">No tienes tareas pendientes.</p>}
        </div>

        <AssignedTools tools={user?.assignedTools} />
    </div>
  );
};

export default TechnicianTasks;
