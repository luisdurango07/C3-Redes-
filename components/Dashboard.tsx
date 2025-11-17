import React, { useState, useContext } from 'react';
import { MOCK_STORES, MOCK_USERS } from '../constants';
import { Task, TaskStatus } from '../types';
import { CalendarIcon, CheckCircleIcon, ClockIcon, WrenchIcon, XIcon } from './Icons';
import { DataContext } from '../App';

interface DashboardProps {
    setActiveView: (view: string) => void;
}

// Extracted Component: StatCard
const StatCard = ({ icon, title, value, color, onClick }: { icon: React.ReactElement, title: string, value: number | string, color: string, onClick?: () => void }) => {
    const CardComponent = onClick ? 'button' : 'div';
    return (
        <CardComponent
            onClick={onClick}
            className={`flex items-center p-6 bg-white rounded-xl shadow-lg text-left w-full ${onClick ? 'transition-transform transform hover:scale-105 cursor-pointer' : ''}`}
        >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full ${color}`}>
                {icon}
            </div>
            <div className="ml-6">
                <p className="text-xl font-semibold text-gray-700">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
        </CardComponent>
    );
};

// Extracted Component: TaskListModal
const TaskListModal = ({ modalData, onClose }: { modalData: { title: string; tasks: Task[] } | null, onClose: () => void }) => {
    if (!modalData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[80vh] p-6 mx-4 overflow-y-auto bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                     <h2 className="text-2xl font-bold text-gray-900">{modalData.title}</h2>
                     <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6"/>
                     </button>
                </div>
                <div className="mt-4 space-y-3">
                    {modalData.tasks.length > 0 ? modalData.tasks.map(task => (
                         <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                             <p className="font-bold text-gray-800">{task.osNumber}: <span className="font-semibold">{task.title}</span></p>
                             <p className="text-sm text-gray-600">
                                 <strong>Tienda:</strong> {MOCK_STORES.find(s => s.id === task.storeId)?.name || 'N/A'}
                             </p>
                              <p className="text-sm text-gray-600">
                                 <strong>Técnico:</strong> {MOCK_USERS.find(u => u.id === task.technicianId)?.name.split(' (')[0] || 'N/A'}
                             </p>
                         </div>
                    )) : <p className="text-gray-500">No hay órdenes de servicio en esta categoría.</p>}
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const { tasks } = useContext(DataContext);
    const allPendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);
    const allCompletedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    const totalStores = MOCK_STORES.length;
    
    const upcomingTasks = tasks
        .filter(t => t.status !== TaskStatus.COMPLETED && t.scheduledDate >= new Date())
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
        .slice(0, 5);
        
    const [modalData, setModalData] = useState<{ title: string; tasks: Task[] } | null>(null);

    return (
        <>
            <div className="space-y-8">
                <h1 className="text-4xl font-bold text-gray-800">Panel Principal de Administrador</h1>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard 
                        icon={<ClockIcon className="w-8 h-8 text-white"/>} 
                        title="OS Pendientes" 
                        value={allPendingTasks.length} 
                        color="bg-yellow-500" 
                        onClick={() => setModalData({ title: 'Órdenes de Servicio Pendientes', tasks: allPendingTasks })}
                    />
                    <StatCard 
                        icon={<CheckCircleIcon className="w-8 h-8 text-white"/>} 
                        title="OS Completadas" 
                        value={allCompletedTasks.length} 
                        color="bg-green-500"
                        onClick={() => setModalData({ title: 'Órdenes de Servicio Completadas', tasks: allCompletedTasks })}
                    />
                    <StatCard icon={<WrenchIcon className="w-8 h-8 text-white"/>} title="Tiendas Gestionadas" value={totalStores} color="bg-blue-500" />
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="p-6 bg-white rounded-xl shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold text-gray-800">Próximas Órdenes de Servicio</h2>
                        <div className="space-y-4">
                            {upcomingTasks.map(task => (
                                <div key={task.id} className="flex items-center p-4 transition-all duration-300 bg-gray-50 rounded-lg hover:shadow-md hover:bg-gray-100">
                                    <div className="p-3 mr-4 bg-brand-blue-light rounded-full">
                                        <CalendarIcon className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{task.osNumber} - {task.title}</p>
                                        <p className="text-sm text-gray-600">
                                            {MOCK_STORES.find(s => s.id === task.storeId)?.name} - {task.scheduledDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button onClick={() => setActiveView('calendar')} className="px-4 py-1 ml-auto text-sm font-semibold text-white transition-colors duration-200 rounded-full bg-brand-accent hover:bg-yellow-500">
                                        Ver
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold text-gray-800">Actividad Reciente</h2>
                        <div className="space-y-4">
                            {allCompletedTasks.slice(0,3).map(task => (
                                <div key={task.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">{task.osNumber} - {task.title}</p>
                                        <p className="text-sm text-gray-600">
                                            Completada por {MOCK_USERS.find(u => u.id === task.technicianId)?.name.split(' ')[0]} en {MOCK_STORES.find(s => s.id === task.storeId)?.name}
                                        </p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 text-xs font-bold text-green-800 bg-green-200 rounded-full">
                                        Completado
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <TaskListModal modalData={modalData} onClose={() => setModalData(null)} />
        </>
    );
};

export default Dashboard;