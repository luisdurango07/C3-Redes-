import React, { useState, useContext, useEffect, useRef } from 'react';
import { MOCK_STORES, MOCK_USERS, MOCK_EQUIPMENT, MOCK_TASK_TYPES } from '../constants';
import { Task, TaskStatus, Role } from '../types';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../App';
import { SearchIcon, EyeIcon, XIcon, EditIcon, ShareIcon } from './Icons';
import { TASK_TYPE_TO_TEMPLATE_MAP, ChecklistItemType } from '../checklistTemplates';
import { logoBase64 } from '../assets/logo';


declare global {
  interface Window {
    jspdf: any;
  }
}

const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url, { cache: 'no-cache' }); // Use no-cache to avoid CORS issues with cached images
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image to base64:", error);
        return ''; // Return empty string or a placeholder if conversion fails
    }
};

const ChecklistReadOnlyViewer: React.FC<{ task: Task }> = ({ task }) => {
    const { checklistData } = task;
    const template = TASK_TYPE_TO_TEMPLATE_MAP[task.title];

    if (!checklistData || !template) {
        return (
             <div>
                <h3 className="font-semibold text-gray-700">Observaciones del Técnico:</h3>
                <p className="p-3 mt-1 text-gray-800 bg-gray-100 rounded-md whitespace-pre-wrap">{task.notes || 'No se dejaron notas.'}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
        {template.items.map(item => {
            const value = checklistData[item.id];
            if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                return null;
            }

            switch(item.type) {
                case ChecklistItemType.HEADER:
                    return <h3 key={item.id} className="pt-2 text-lg font-semibold text-gray-800 border-t first:pt-0 first:border-t-0">{item.label}</h3>;
                case ChecklistItemType.BOOLEAN:
                     return <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.label}:</span> <span className="font-semibold">{value ? 'Sí' : 'No'}</span></div>;
                case ChecklistItemType.CALCULATED:
                case ChecklistItemType.NUMERIC:
                    return <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.label}:</span> <span className="font-semibold">{value} {item.unit || ''}</span></div>;
                case ChecklistItemType.SUBTABLE:
                    return (
                        <div key={item.id}>
                            <h4 className="text-sm font-semibold text-gray-600">{item.label}:</h4>
                            <table className="w-full mt-1 text-xs text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {item.subtableColumns?.map(col => <th key={col.id} className="p-1 font-semibold">{col.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(value as any[]).map((row, idx) => (
                                        <tr key={idx} className="border-b">
                                             {item.subtableColumns?.map(col => <td key={col.id} className="p-1">{row[col.id]}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                case ChecklistItemType.PHOTO:
                    // Photos are handled separately below
                    return null;
                default:
                    return (
                        <div key={item.id}>
                            <h4 className="text-sm font-semibold text-gray-600">{item.label}:</h4>
                            <p className="p-2 mt-1 text-sm text-gray-800 bg-gray-50 rounded-md whitespace-pre-wrap">{Array.isArray(value) ? value.join(', ') : value}</p>
                        </div>
                    );
            }
        })}
        </div>
    );
};

interface EditTaskModalProps {
    isOpen: boolean;
    task: Task;
    onClose: () => void;
    onSave: (task: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, task, onClose, onSave }) => {
    const [editedTask, setEditedTask] = useState<Task>(task);

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    if (!isOpen) return null;

    const technicians = MOCK_USERS.filter(u => u.role === Role.TECHNICIAN);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const newDate = new Date(`${e.target.value}T12:00:00`); // Use noon to avoid timezone issues
         setEditedTask(prev => ({ ...prev, scheduledDate: newDate }));
    };

    const handleSaveClick = () => {
        onSave(editedTask);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-2xl max-h-[90vh] p-6 mx-4 overflow-y-auto bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Editar OS: {editedTask.osNumber}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-200">
                       <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Intervención</label>
                        <select name="title" value={editedTask.title} onChange={handleInputChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                            {MOCK_TASK_TYPES.map(tt => <option key={tt.id} value={tt.name}>{tt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" name="scheduledDate" value={editedTask.scheduledDate.toISOString().split('T')[0]} onChange={handleDateChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
                        <select name="technicianId" value={editedTask.technicianId} onChange={handleInputChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="status" value={editedTask.status} onChange={handleInputChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                            {Object.values(TaskStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notas (Técnico)</label>
                        <textarea name="notes" spellCheck="true" value={editedTask.notes} onChange={handleInputChange} rows={4} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar Cambios</button>
                </div>
            </div>
        </div>
    )
}

const EquipmentHistory: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { tasks, equipment: equipmentList, updateTask } = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const isSuperAdmin = user?.role === Role.SUPER_ADMIN;

    const handleEditClick = (task: Task) => {
        setTaskToEdit(task);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedTask: Task) => {
        updateTask(updatedTask);
        setIsEditModalOpen(false);
        setTaskToEdit(null);
    };

    const handleGenerateAndSharePdf = async (task: Task) => {
        setIsGeneratingPdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;
            let y = margin;
            let pageCount = 1;

            const addHeaderFooter = () => {
                // Header
                doc.addImage(logoBase64, 'SVG', margin, 5, 40, 10);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Reporte de Orden de Servicio', pageWidth / 2, 12, { align: 'center' });
                // Footer
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Página ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
                doc.text(`Generado: ${new Date().toLocaleString('es-VE')}`, margin, pageHeight - 8);
            };

            const checkPageBreak = (spaceNeeded: number) => {
                if (y + spaceNeeded > pageHeight - margin) {
                    doc.addPage();
                    pageCount++;
                    y = margin;
                    addHeaderFooter();
                }
            };
            
            addHeaderFooter();
            y += 15;

            // --- Task Details ---
            const store = MOCK_STORES.find(s => s.id === task.storeId);
            const equipment = MOCK_EQUIPMENT.find(e => e.id === task.equipmentId);
            const technician = MOCK_USERS.find(u => u.id === task.technicianId);
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`${task.osNumber}: ${task.title}`, margin, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${task.scheduledDate.toLocaleDateString('es-VE')}`, margin, y);
            doc.text(`Estado: ${task.status}`, pageWidth - margin, y, { align: 'right' });
            y += 6;
            doc.text(`Tienda: ${store?.name || 'N/A'}`, margin, y);
            y += 6;
            doc.text(`Equipo: ${equipment?.name || 'N/A'} (${equipment?.id || 'N/A'})`, margin, y);
            y += 6;
            doc.text(`Técnico: ${technician?.name.split(' (')[0] || 'N/A'}`, margin, y);
            y += 10;
            doc.setDrawColor(200);
            doc.line(margin, y - 5, pageWidth - margin, y - 5);

            // --- Checklist Details ---
            const template = TASK_TYPE_TO_TEMPLATE_MAP[task.title];
            if (task.checklistData && template) {
                for (const item of template.items) {
                    const value = task.checklistData[item.id];
                    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) continue;

                    if (item.type === ChecklistItemType.HEADER) {
                        checkPageBreak(12);
                        y += 6;
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text(item.label, margin, y);
                        y += 6;
                    } else if (item.type !== ChecklistItemType.PHOTO) {
                        let valueText = '';
                        if (item.type === ChecklistItemType.BOOLEAN) valueText = value ? 'Sí' : 'No';
                        else if (item.type === ChecklistItemType.SUBTABLE) {
                             checkPageBreak(10 + value.length * 8);
                             doc.setFontSize(10);
                             doc.setFont('helvetica', 'bold');
                             doc.text(`${item.label}:`, margin, y);
                             y += 5;
                             value.forEach((row: any, index: number) => {
                                 const rowText = item.subtableColumns?.map(col => `${col.label}: ${row[col.id] || '-'}`).join(' | ');
                                 doc.setFont('courier', 'normal');
                                 doc.text(`- ${rowText}`, margin + 4, y);
                                 y+= 5;
                             });
                             continue;
                        }
                        else valueText = `${value} ${item.unit || ''}`;

                        const lines = doc.splitTextToSize(`${item.label}: ${valueText}`, contentWidth);
                        checkPageBreak(lines.length * 5);
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.text(lines, margin, y);
                        y += lines.length * 5;
                    }
                }
            } else {
                 checkPageBreak(15);
                 doc.setFontSize(12);
                 doc.setFont('helvetica', 'bold');
                 doc.text('Observaciones del Técnico', margin, y);
                 y += 6;
                 doc.setFontSize(10);
                 doc.setFont('helvetica', 'normal');
                 const notesLines = doc.splitTextToSize(task.notes || 'No se dejaron notas.', contentWidth);
                 doc.text(notesLines, margin, y);
                 y += notesLines.length * 5;
            }
            
            // --- Photos ---
            if (task.photos && task.photos.length > 0) {
                checkPageBreak(12);
                y += 6;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Evidencia Fotográfica', margin, y);
                y += 8;

                const photoPromises = task.photos.map(url => imageUrlToBase64(url));
                const base64Photos = await Promise.all(photoPromises);
                
                const imgWidth = contentWidth / 2 - 2;
                const imgHeight = imgWidth * (3 / 4);
                let x = margin;
                
                for (const photo of base64Photos) {
                    if (!photo) continue;
                    checkPageBreak(imgHeight + 5);
                    doc.addImage(photo, 'JPEG', x, y, imgWidth, imgHeight);
                    x += imgWidth + 4;
                    if (x > margin + contentWidth / 2) {
                        x = margin;
                        y += imgHeight + 4;
                    }
                }
            }


            // --- Generate and Share/Download ---
            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], `OS-${task.osNumber}.pdf`, { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                try {
                    await navigator.share({ title: `Orden de Servicio: ${task.osNumber}`, text: `Detalles de la OS ${task.osNumber}.`, files: [pdfFile] });
                } catch (error: any) {
                    if (error.name !== 'AbortError') {
                        alert('No se pudo compartir el archivo. Se descargará en su lugar.');
                        doc.save(`OS-${task.osNumber}.pdf`);
                    }
                }
            } else {
                alert('Tu navegador no es compatible con la función de compartir. El PDF se descargará.');
                doc.save(`OS-${task.osNumber}.pdf`);
            }

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocurrió un error al generar el PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };


    const filteredTasks = tasks.filter(task => {
        const store = MOCK_STORES.find(s => s.id === task.storeId);
        const equipment = equipmentList.find(e => e.id === task.equipmentId);
        
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm ?
            task.osNumber.toLowerCase().includes(searchTermLower) ||
            store?.name.toLowerCase().includes(searchTermLower) ||
            equipment?.name.toLowerCase().includes(searchTermLower) ||
            store?.city.toLowerCase().includes(searchTermLower)
            : true;

        if (!matchesSearch) return false;

        const taskDate = task.scheduledDate;
        const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

        if (start && taskDate < start) return false;
        if (end && taskDate > end) return false;

        return true;
    }).sort((a, b) => {
        const dateDiff = b.scheduledDate.getTime() - a.scheduledDate.getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.osNumber.localeCompare(a.osNumber);
    });

    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h1 className="mb-6 text-3xl font-bold text-gray-800">Historial de OS</h1>
                
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <input
                            type="text"
                            spellCheck="true"
                            placeholder="Buscar por OS, Tienda, Equipo, Ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div>
                         <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Desde</label>
                         <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">Hasta</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3">Fecha</th>
                                <th scope="col" className="px-4 py-3">OS #</th>
                                <th scope="col" className="px-4 py-3">Tienda</th>
                                <th scope="col" className="px-4 py-3">Equipo</th>
                                <th scope="col" className="px-4 py-3">Intervención</th>
                                <th scope="col" className="px-4 py-3">Técnico</th>
                                <th scope="col" className="px-4 py-3">Estado</th>
                                <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                const store = MOCK_STORES.find(s => s.id === task.storeId);
                                const equipment = MOCK_EQUIPMENT.find(e => e.id === task.equipmentId);
                                const technician = MOCK_USERS.find(u => u.id === task.technicianId);
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
                                        <td className="px-4 py-4">{equipment?.name}</td>
                                        <td className="px-4 py-4">{task.title}</td>
                                        <td className="px-4 py-4">{technician?.name.split(' (')[0] || 'N/A'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusColor[task.status]}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => setSelectedTask(task)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-blue" aria-label="Ver detalles">
                                                    <EyeIcon className="w-5 h-5"/>
                                                </button>
                                                {isSuperAdmin && (
                                                    <button onClick={() => handleEditClick(task)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-accent" aria-label="Editar OS">
                                                        <EditIcon className="w-5 h-5"/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-gray-500">
                                        No se encontraron órdenes de servicio con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setSelectedTask(null)}>
                    <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col p-6 mx-4 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.osNumber}</h2>
                                <p className="mt-1 text-lg text-gray-700">{selectedTask.title}</p>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 modal-close-btn">
                               <XIcon className="w-6 h-6"/>
                            </button>
                        </div>
                        
                        <div className="flex-1 mt-4 space-y-4 overflow-y-auto">
                            <ChecklistReadOnlyViewer task={selectedTask} />
                             <div>
                                <h3 className="font-semibold text-gray-700">Registros Fotográficos:</h3>
                                {selectedTask.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3">
                                        {selectedTask.photos.map((photo, index) => (
                                            <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
                                                <img src={photo} alt={`Registro ${index + 1}`} className="object-cover w-full h-32 rounded-lg transition-transform duration-200 hover:scale-105" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-3 mt-1 text-gray-500 bg-gray-100 rounded-md">No hay fotos adjuntas.</p>
                                )}
                            </div>
                        </div>
                         <div className="flex justify-end pt-4 mt-4 border-t modal-actions">
                            {selectedTask.status === TaskStatus.COMPLETED && (
                                <button
                                    onClick={() => handleGenerateAndSharePdf(selectedTask)}
                                    disabled={isGeneratingPdf}
                                    className="inline-flex items-center px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-brand-blue hover:bg-brand-blue-light disabled:bg-gray-400"
                                >
                                    {isGeneratingPdf ? 'Generando PDF profesional...' : <><ShareIcon className="w-5 h-5 mr-2"/> Exportar / Compartir</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {isEditModalOpen && taskToEdit && (
                <EditTaskModal 
                    isOpen={isEditModalOpen} 
                    task={taskToEdit} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={handleSaveEdit}
                />
            )}
        </>
    );
};

export default EquipmentHistory;