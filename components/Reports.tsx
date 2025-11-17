import React, { useState, useContext } from 'react';
import { DataContext } from '../App';
import { MOCK_USERS, MOCK_STORES } from '../constants';
import { Role, Task, TaskStatus, Equipment } from '../types';
import { DownloadIcon } from './Icons';

type ReportType = 'productivity' | 'equipment' | 'taskType';

const exportToCsv = (filename: string, rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
      if (String(row[j]).includes(',')) {
        innerValue = `"${innerValue.replace(/"/g, '""')}"`;
      }
      if (j > 0) {
        finalVal += ',';
      }
      finalVal += innerValue;
    }
    return finalVal + '\n';
  };

  let csvFile = '';
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([`\uFEFF${csvFile}`], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const TabButton: React.FC<{ type: ReportType, label: string, activeReport: ReportType, onClick: () => void }> = ({ type, label, activeReport, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeReport === type ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);


const Reports: React.FC = () => {
    const { tasks, equipment } = useContext(DataContext);
    const [activeReport, setActiveReport] = useState<ReportType>('productivity');
    
    // State for Productivity Report
    const [prodFilters, setProdFilters] = useState({ techId: 'all', startDate: '', endDate: '' });
    const [prodResults, setProdResults] = useState<{ name: string, count: number }[] | null>(null);

    // State for Equipment Report
    const [equipFilters, setEquipFilters] = useState({ storeId: '', equipmentId: '' });
    const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
    const [equipResults, setEquipResults] = useState<Task[] | null>(null);

    // State for Task Type Report
    const [taskTypeFilters, setTaskTypeFilters] = useState({ startDate: '', endDate: '' });
    const [taskTypeResults, setTaskTypeResults] = useState<{ type: string, count: number }[] | null>(null);

    const technicians = MOCK_USERS.filter(u => u.role === Role.TECHNICIAN);
    
    // --- Handlers for generating reports ---
    const handleGenerateProductivityReport = () => {
        let filteredTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

        if (prodFilters.techId !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.technicianId === prodFilters.techId);
        }
        if (prodFilters.startDate) {
            const start = new Date(`${prodFilters.startDate}T00:00:00`);
            filteredTasks = filteredTasks.filter(t => t.scheduledDate >= start);
        }
        if (prodFilters.endDate) {
            const end = new Date(`${prodFilters.endDate}T23:59:59`);
            filteredTasks = filteredTasks.filter(t => t.scheduledDate <= end);
        }
        const counts: { [key: string]: { name: string, count: number } } = {};
        for (const task of filteredTasks) {
            if (!counts[task.technicianId]) {
                const techName = MOCK_USERS.find(u => u.id === task.technicianId)?.name || 'Desconocido';
                counts[task.technicianId] = { name: techName, count: 0 };
            }
            counts[task.technicianId].count++;
        }
        setProdResults(Object.values(counts));
    };
    
    const handleGenerateEquipmentReport = () => {
        if (!equipFilters.equipmentId) {
            setEquipResults([]);
            return;
        }
        const selectedEquipment = equipment.find(e => e.id === equipFilters.equipmentId);
        setEquipResults(selectedEquipment ? selectedEquipment.history : []);
    };
    
    const handleGenerateTaskTypeReport = () => {
         let filteredTasks = tasks;
         if (taskTypeFilters.startDate) {
            const start = new Date(`${taskTypeFilters.startDate}T00:00:00`);
            filteredTasks = filteredTasks.filter(t => t.scheduledDate >= start);
        }
        if (taskTypeFilters.endDate) {
            const end = new Date(`${taskTypeFilters.endDate}T23:59:59`);
            filteredTasks = filteredTasks.filter(t => t.scheduledDate <= end);
        }
        const counts: { [key: string]: number } = {};
        for (const task of filteredTasks) {
            counts[task.title] = (counts[task.title] || 0) + 1;
        }
        const results = Object.entries(counts).map(([type, count]) => ({ type, count }));
        setTaskTypeResults(results);
    };

    // --- Handlers for exporting data ---
    const handleExportProductivity = () => {
        if (!prodResults) return;
        const rows = [
            ['Técnico', 'OS Completadas'],
            ...prodResults.map(r => [r.name, r.count])
        ];
        exportToCsv('reporte_productividad.csv', rows);
    };

    const handleExportEquipment = () => {
        if (!equipResults) return;
        const selectedEquipment = equipment.find(e => e.id === equipFilters.equipmentId);
        const filename = `historial_${selectedEquipment?.id.replace(/\s+/g, '_') || 'equipo'}.csv`;
        const rows = [
            ['Fecha', 'OS #', 'Intervención', 'Técnico', 'Estado', 'Notas'],
            ...equipResults.map(task => [
                task.scheduledDate.toLocaleDateString('es-VE'),
                task.osNumber,
                task.title,
                MOCK_USERS.find(u => u.id === task.technicianId)?.name || 'N/A',
                task.status,
                task.notes || ''
            ])
        ];
        exportToCsv(filename, rows);
    };

    const handleExportTaskType = () => {
        if (!taskTypeResults) return;
        const rows = [
            ['Tipo de Tarea', 'Cantidad de OS'],
            ...taskTypeResults.map(r => [r.type, r.count])
        ];
        exportToCsv('reporte_por_tipo_tarea.csv', rows);
    };

    const handleStoreChangeForEquipReport = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const storeId = e.target.value;
        setEquipFilters({ storeId, equipmentId: '' }); // Reset equipment
        setEquipResults(null); // Clear previous results
        if (storeId) {
            const equipmentInStore = equipment.filter(eq => eq.storeId === storeId);
            setAvailableEquipment(equipmentInStore);
        } else {
            setAvailableEquipment([]);
        }
    };
    
    // --- Render Functions for each report type ---
    const renderProductivityReport = () => (
        <div>
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg md:grid-cols-4 bg-gray-50">
                <select value={prodFilters.techId} onChange={e => setProdFilters({...prodFilters, techId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="all">Todos los Técnicos</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="date" value={prodFilters.startDate} onChange={e => setProdFilters({...prodFilters, startDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md"/>
                <input type="date" value={prodFilters.endDate} onChange={e => setProdFilters({...prodFilters, endDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md"/>
                <button onClick={handleGenerateProductivityReport} className="w-full px-4 py-2 font-semibold text-white rounded-md bg-brand-blue hover:bg-brand-blue-light">Generar Reporte</button>
            </div>
            {prodResults && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Resultados de Productividad</h3>
                        {prodResults.length > 0 && (
                            <button onClick={handleExportProductivity} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                <DownloadIcon className="w-4 h-4 mr-2"/>
                                Exportar a Excel
                            </button>
                        )}
                    </div>
                    {prodResults.length > 0 ? (
                        <ul className="space-y-2">
                           {prodResults.map(res => <li key={res.name} className="flex justify-between p-3 bg-white rounded-md shadow-sm"><strong>{res.name}</strong> <span>{res.count} OS Completadas</span></li>)}
                        </ul>
                    ) : <p className="p-4 text-gray-500 bg-gray-50 rounded-md">No se encontraron resultados para los filtros seleccionados.</p>}
                </div>
            )}
        </div>
    );
    
    const renderEquipmentReport = () => (
        <div>
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg md:grid-cols-3 bg-gray-50">
                <select value={equipFilters.storeId} onChange={handleStoreChangeForEquipReport} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Primero seleccione una tienda</option>
                    {MOCK_STORES.sort((a,b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={equipFilters.equipmentId} onChange={e => setEquipFilters({...equipFilters, equipmentId: e.target.value})} disabled={!equipFilters.storeId || availableEquipment.length === 0} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-200">
                    <option value="">{equipFilters.storeId ? 'Luego seleccione un equipo' : '...'}</option>
                    {availableEquipment.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                </select>
                <button onClick={handleGenerateEquipmentReport} disabled={!equipFilters.equipmentId} className="w-full px-4 py-2 font-semibold text-white rounded-md bg-brand-blue hover:bg-brand-blue-light disabled:bg-gray-400">Generar Historial</button>
            </div>
             {equipResults && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Historial de Incidencias</h3>
                        {equipResults.length > 0 && (
                             <button onClick={handleExportEquipment} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                <DownloadIcon className="w-4 h-4 mr-2"/>
                                Exportar a Excel
                            </button>
                        )}
                    </div>
                    {equipResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left bg-white table-auto">
                                <thead className="bg-gray-100"><tr><th className="px-4 py-2">Fecha</th><th className="px-4 py-2">OS #</th><th className="px-4 py-2">Intervención</th><th className="px-4 py-2">Estado</th></tr></thead>
                                <tbody>
                                    {equipResults.map(task => <tr key={task.id} className="border-b"><td className="px-4 py-2">{task.scheduledDate.toLocaleDateString()}</td><td className="px-4 py-2">{task.osNumber}</td><td className="px-4 py-2">{task.title}</td><td className="px-4 py-2">{task.status}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="p-4 text-gray-500 bg-gray-50 rounded-md">No se encontraron intervenciones para este equipo.</p>}
                </div>
            )}
        </div>
    );

    const renderTaskTypeReport = () => (
         <div>
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg md:grid-cols-3 bg-gray-50">
                <input type="date" value={taskTypeFilters.startDate} onChange={e => setTaskTypeFilters({...taskTypeFilters, startDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md"/>
                <input type="date" value={taskTypeFilters.endDate} onChange={e => setTaskTypeFilters({...taskTypeFilters, endDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md"/>
                <button onClick={handleGenerateTaskTypeReport} className="w-full px-4 py-2 font-semibold text-white rounded-md bg-brand-blue hover:bg-brand-blue-light">Generar Reporte</button>
            </div>
            {taskTypeResults && (
                <div className="mt-6">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Resultados por Tipo de Tarea</h3>
                        {taskTypeResults.length > 0 && (
                            <button onClick={handleExportTaskType} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                <DownloadIcon className="w-4 h-4 mr-2"/>
                                Exportar a Excel
                            </button>
                        )}
                    </div>
                    {taskTypeResults.length > 0 ? (
                        <ul className="space-y-2">
                           {taskTypeResults.map(res => <li key={res.type} className="flex justify-between p-3 bg-white rounded-md shadow-sm"><strong>{res.type}</strong> <span>{res.count} OS</span></li>)}
                        </ul>
                    ) : <p className="p-4 text-gray-500 bg-gray-50 rounded-md">No se encontraron resultados para los filtros seleccionados.</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">Central de Reportes</h1>
            <div className="flex border-b">
                <TabButton type="productivity" label="Productividad por Técnico" activeReport={activeReport} onClick={() => setActiveReport('productivity')} />
                <TabButton type="equipment" label="Incidencias por Equipo" activeReport={activeReport} onClick={() => setActiveReport('equipment')} />
                <TabButton type="taskType" label="Reporte por Tipo de Tarea" activeReport={activeReport} onClick={() => setActiveReport('taskType')} />
            </div>
            <div className="p-6 bg-white border border-t-0 rounded-b-lg">
                {activeReport === 'productivity' && renderProductivityReport()}
                {activeReport === 'equipment' && renderEquipmentReport()}
                {activeReport === 'taskType' && renderTaskTypeReport()}
            </div>
        </div>
    );
};

export default Reports;