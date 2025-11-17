import React, { useState, useRef, useEffect } from 'react';
import { MOCK_TOOLS, MOCK_USERS } from '../constants';
import { Tool, ToolStatus, ToolCategory, Role, User } from '../types';
import { XIcon, PlusIcon, ImageIcon, MoreVerticalIcon } from './Icons';

// --- Extracted Components ---

interface AssignmentModalProps {
    tool: Tool | null;
    technicians: User[];
    onClose: () => void;
    onAssign: (technicianId: string) => void;
}
const AssignmentModal: React.FC<AssignmentModalProps> = ({ tool, technicians, onClose, onAssign }) => {
    const [selectedTech, setSelectedTech] = useState('');

    useEffect(() => {
        // Reset selected tech when the modal is opened for a new tool
        setSelectedTech('');
    }, [tool]);
    
    if (!tool) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                     <h2 className="text-2xl font-bold text-gray-900">Asignar Herramienta</h2>
                     <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6"/></button>
                </div>
                <p className="mt-2 text-gray-700">Asignando: <span className="font-semibold">{tool.name}</span></p>
                <div className="mt-4">
                    <label htmlFor="technician-select" className="block text-sm font-medium text-gray-700">Seleccionar Técnico</label>
                    <select id="technician-select" onChange={(e) => setSelectedTech(e.target.value)} value={selectedTech} className="block w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm">
                        <option value="" disabled>Seleccione un técnico...</option>
                        {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={() => onAssign(selectedTech)} disabled={!selectedTech} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light disabled:bg-gray-400">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

interface CreateToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newToolData: Partial<Tool>) => void;
    existingToolIds: string[];
}
const CreateToolModal: React.FC<CreateToolModalProps> = ({ isOpen, onClose, onSave, existingToolIds }) => {
    const [newToolData, setNewToolData] = useState<Partial<Tool>>({
        id: '',
        name: '',
        category: ToolCategory.GENERAL,
        photoUrl: '',
    });

     useEffect(() => {
        if (isOpen) {
             // Reset form when modal opens
            setNewToolData({ id: '', name: '', category: ToolCategory.GENERAL, photoUrl: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewToolData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const photoUrl = URL.createObjectURL(file);
            setNewToolData(prev => ({ ...prev, photoUrl }));
        }
    };
    
    const handleSaveClick = () => {
         if (!newToolData.id?.trim() || !newToolData.name?.trim() || !newToolData.category) {
            alert('ID, Nombre y Categoría son campos requeridos.');
            return;
        }
        if (existingToolIds.includes(newToolData.id.trim())) {
            alert('El ID de la herramienta ya existe. Debe ser único.');
            return;
        }
        onSave(newToolData);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Herramienta</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="mt-4 space-y-4">
                    <input name="id" value={newToolData.id} onChange={handleInputChange} placeholder="ID / Código Único" className="w-full p-2 border border-gray-300 rounded-md"/>
                    <input name="name" spellCheck="true" value={newToolData.name} onChange={handleInputChange} placeholder="Nombre de la Herramienta" className="w-full p-2 border border-gray-300 rounded-md"/>
                    <select name="category" value={newToolData.category} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                        {Object.values(ToolCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Registro Fotográfico</label>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"/>
                        {newToolData.photoUrl && <img src={newToolData.photoUrl} alt="Preview" className="w-32 h-32 mt-2 object-cover rounded"/>}
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const ImageViewerModal: React.FC<{imageUrl: string | null, onClose: () => void}> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={onClose}>
            <div className="relative p-4 bg-white rounded-lg shadow-xl">
                <img src={imageUrl} alt="Vista ampliada de la herramienta" className="object-contain max-w-lg max-h-screen-80"/>
                 <button onClick={onClose} className="absolute p-1 bg-white rounded-full shadow-md top-2 right-2 hover:bg-gray-200">
                    <XIcon className="w-6 h-6 text-gray-700" />
                </button>
            </div>
        </div>
    )
};

// --- Main Component ---
const ToolsManagement: React.FC = () => {
    const [tools, setTools] = useState<Tool[]>(MOCK_TOOLS);
    const [filters, setFilters] = useState({ category: 'all', status: 'all' });
    const [toolToAssign, setToolToAssign] = useState<Tool | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionMenuRef]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSaveNewTool = (newToolData: Partial<Tool>) => {
        const newTool: Tool = {
            id: newToolData.id!.trim(),
            name: newToolData.name!.trim(),
            category: newToolData.category!,
            status: ToolStatus.AVAILABLE,
            assignedTechnicianId: null,
            assignmentHistory: [],
            photoUrl: newToolData.photoUrl || undefined,
        };

        const updatedTools = [...tools, newTool];
        setTools(updatedTools);
        MOCK_TOOLS.push(newTool);

        setIsCreateModalOpen(false);
    };

    const handleAssignTool = (technicianId: string) => {
        if (!toolToAssign) return;

        setTools(prevTools => prevTools.map(tool => {
            if (tool.id === toolToAssign.id) {
                return {
                    ...tool,
                    status: ToolStatus.ASSIGNED,
                    assignedTechnicianId: technicianId,
                    assignmentHistory: [...tool.assignmentHistory, { technicianId, assignedDate: new Date() }]
                };
            }
            return tool;
        }));
        
        const toolInMock = MOCK_TOOLS.find(t => t.id === toolToAssign.id);
        if (toolInMock) {
            toolInMock.status = ToolStatus.ASSIGNED;
            toolInMock.assignedTechnicianId = technicianId;
            toolInMock.assignmentHistory.push({ technicianId, assignedDate: new Date() });
        }
        const userInMock = MOCK_USERS.find(u => u.id === technicianId);
        if(userInMock) {
            if (!userInMock.assignedTools) {
                userInMock.assignedTools = [];
            }
            userInMock.assignedTools.push(toolInMock!);
        }

        setToolToAssign(null);
    };

    const handleReturnTool = (toolId: string) => {
        let previousOwnerId: string | null = null;
        
        setTools(prevTools => prevTools.map(tool => {
            if (tool.id === toolId) {
                previousOwnerId = tool.assignedTechnicianId;
                const lastAssignment = tool.assignmentHistory.find(h => !h.returnedDate);
                if(lastAssignment) {
                    lastAssignment.returnedDate = new Date();
                }
                return {
                    ...tool,
                    status: ToolStatus.AVAILABLE,
                    assignedTechnicianId: null,
                };
            }
            return tool;
        }));
        
        const toolInMock = MOCK_TOOLS.find(t => t.id === toolId);
        if (toolInMock) {
            toolInMock.status = ToolStatus.AVAILABLE;
            toolInMock.assignedTechnicianId = null;
            const lastAssignment = toolInMock.assignmentHistory.find(h => !h.returnedDate);
            if(lastAssignment) lastAssignment.returnedDate = new Date();
        }
        
        if (previousOwnerId) {
            const userInMock = MOCK_USERS.find(u => u.id === previousOwnerId);
            if(userInMock && userInMock.assignedTools) {
                userInMock.assignedTools = userInMock.assignedTools.filter(t => t.id !== toolId);
            }
        }
    };

    const handleStatusChange = (toolId: string, status: ToolStatus.IN_REPAIR | ToolStatus.MAINTENANCE) => {
        let previousOwnerId: string | null = null;
        
        setTools(prevTools => prevTools.map(tool => {
            if (tool.id === toolId) {
                previousOwnerId = tool.assignedTechnicianId;
                return { ...tool, status: status, assignedTechnicianId: null };
            }
            return tool;
        }));

        const toolInMock = MOCK_TOOLS.find(t => t.id === toolId);
        if (toolInMock) {
            toolInMock.status = status;
            toolInMock.assignedTechnicianId = null;
        }

        if (previousOwnerId) {
            const userInMock = MOCK_USERS.find(u => u.id === previousOwnerId);
            if (userInMock && userInMock.assignedTools) {
                userInMock.assignedTools = userInMock.assignedTools.filter(t => t.id !== toolId);
            }
        }
        setOpenActionMenu(null);
    };
    
    const handleMarkAsAvailable = (toolId: string) => {
        setTools(prevTools => prevTools.map(tool => {
            if (tool.id === toolId) {
                return { ...tool, status: ToolStatus.AVAILABLE };
            }
            return tool;
        }));
        
        const toolInMock = MOCK_TOOLS.find(t => t.id === toolId);
        if (toolInMock) {
            toolInMock.status = ToolStatus.AVAILABLE;
        }
    };

    const technicians = MOCK_USERS.filter(u => u.role === Role.TECHNICIAN);

    const filteredTools = tools.filter(tool => {
        const categoryMatch = filters.category === 'all' || tool.category === filters.category;
        const statusMatch = filters.status === 'all' || tool.status === filters.status;
        return categoryMatch && statusMatch;
    });

    const getStatusBadgeColor = (status: ToolStatus) => {
        switch (status) {
            case ToolStatus.AVAILABLE: return 'bg-green-100 text-green-800';
            case ToolStatus.ASSIGNED: return 'bg-blue-100 text-blue-800';
            case ToolStatus.IN_REPAIR: return 'bg-yellow-100 text-yellow-800';
            case ToolStatus.MAINTENANCE: return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Herramientas</h1>
                
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md md:col-span-1">
                        <option value="all">Todas las Categorías</option>
                        {Object.values(ToolCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md md:col-span-1">
                        <option value="all">Todos los Estados</option>
                        {Object.values(ToolStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}
                    </select>
                     <div className="md:col-span-2 md:text-right">
                        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center w-full px-4 py-2 font-bold text-white transition-colors duration-200 rounded-lg md:w-auto bg-brand-accent hover:bg-yellow-500">
                            <PlusIcon className="w-5 h-5 mr-2"/>
                            Crear Herramienta
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Foto</th>
                                <th className="px-4 py-3">Herramienta</th>
                                <th className="px-4 py-3">Categoría</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Asignada a</th>
                                <th className="px-4 py-3">Fecha Asignación</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y">
                        {filteredTools.map(tool => {
                            const lastAssignment = tool.assignmentHistory.find(h => !h.returnedDate);
                            return (
                                <tr key={tool.id} className="text-gray-700">
                                    <td className="px-4 py-3">
                                        {tool.photoUrl ? (
                                            <button onClick={() => setSelectedImage(tool.photoUrl!)} className="p-1 rounded-md hover:bg-gray-200">
                                                <img src={tool.photoUrl} alt={tool.name} className="object-cover w-12 h-12 rounded-md"/>
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center w-12 h-12 text-gray-400 bg-gray-100 rounded-md">
                                                <ImageIcon className="w-6 h-6"/>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{tool.name}</td>
                                    <td className="px-4 py-3">{tool.category}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusBadgeColor(tool.status)}`}>
                                            {tool.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {tool.assignedTechnicianId ? MOCK_USERS.find(u => u.id === tool.assignedTechnicianId)?.name.split(' (')[0] : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {lastAssignment ? lastAssignment.assignedDate.toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="relative inline-block text-left">
                                            {(tool.status === ToolStatus.AVAILABLE || tool.status === ToolStatus.ASSIGNED) && (
                                                <>
                                                    {tool.status === ToolStatus.AVAILABLE && (
                                                        <button onClick={() => setToolToAssign(tool)} className="px-3 py-1 mr-2 text-sm font-semibold text-white rounded-md bg-brand-blue-light hover:bg-brand-blue">
                                                            Asignar
                                                        </button>
                                                    )}
                                                    {tool.status === ToolStatus.ASSIGNED && (
                                                        <button onClick={() => handleReturnTool(tool.id)} className="px-3 py-1 mr-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600">
                                                            Retornar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setOpenActionMenu(openActionMenu === tool.id ? null : tool.id)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
                                                    >
                                                        <MoreVerticalIcon className="w-5 h-5"/>
                                                    </button>
                                                    { openActionMenu === tool.id && (
                                                        <div ref={actionMenuRef} className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(tool.id, ToolStatus.IN_REPAIR); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                                    Marcar en Reparación
                                                                </a>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(tool.id, ToolStatus.MAINTENANCE); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                                    Marcar en Mantenimiento
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {(tool.status === ToolStatus.IN_REPAIR || tool.status === ToolStatus.MAINTENANCE) && (
                                                <button onClick={() => handleMarkAsAvailable(tool.id)} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">
                                                    Marcar Disponible
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            <CreateToolModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveNewTool}
                existingToolIds={tools.map(t => t.id)}
            />
            <AssignmentModal
                tool={toolToAssign}
                technicians={technicians}
                onClose={() => setToolToAssign(null)}
                onAssign={handleAssignTool}
            />
            <ImageViewerModal
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
};

export default ToolsManagement;