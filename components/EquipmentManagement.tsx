import React, { useState, useEffect } from 'react';
import { MOCK_EQUIPMENT, MOCK_STORES, MOCK_EQUIPMENT_TEMPLATES, MOCK_SERVICE_TYPES } from '../constants';
import { Equipment, EquipmentTemplate } from '../types';
import { EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';

// --- Sub-component for Catalog Management ---

const EquipmentCatalogManagement: React.FC = () => {
    const [templates, setTemplates] = useState<EquipmentTemplate[]>(MOCK_EQUIPMENT_TEMPLATES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<EquipmentTemplate> | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<EquipmentTemplate | null>(null);

    const openModalForNew = () => {
        setCurrentTemplate({ id: '', name: '', serviceType: MOCK_SERVICE_TYPES[0].name });
        setIsModalOpen(true);
    };
    
    const openModalForEdit = (template: EquipmentTemplate) => {
        setCurrentTemplate({ ...template });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTemplate(null);
    };

    const handleSave = (templateToSave: Partial<EquipmentTemplate>) => {
        const isEditing = templates.some(t => t.id === templateToSave.id);
        if (isEditing) {
            const updatedTemplates = templates.map(t => t.id === templateToSave.id ? templateToSave as EquipmentTemplate : t);
            setTemplates(updatedTemplates);
            MOCK_EQUIPMENT_TEMPLATES.splice(0, MOCK_EQUIPMENT_TEMPLATES.length, ...updatedTemplates);
        } else {
            const newTemplate: EquipmentTemplate = templateToSave as EquipmentTemplate;
            const updatedTemplates = [...templates, newTemplate];
            setTemplates(updatedTemplates);
            MOCK_EQUIPMENT_TEMPLATES.push(newTemplate);
        }
        closeModal();
    };

    const handleDeleteConfirm = () => {
        if (!templateToDelete) return;
        const updatedTemplates = templates.filter(t => t.id !== templateToDelete.id);
        setTemplates(updatedTemplates);
        MOCK_EQUIPMENT_TEMPLATES.splice(0, MOCK_EQUIPMENT_TEMPLATES.length, ...updatedTemplates);
        setTemplateToDelete(null);
    };
    
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Tipo de Servicio</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                        {templates.map(template => (
                            <tr key={template.id} className="text-gray-700">
                                <td className="px-4 py-3">{template.name}</td>
                                <td className="px-4 py-3">{template.serviceType}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => openModalForEdit(template)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-blue" aria-label={`Editar ${template.name}`}><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setTemplateToDelete(template)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${template.name}`}><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={openModalForNew} className="inline-flex items-center px-4 py-2 mt-6 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500">
                <PlusIcon className="w-5 h-5 mr-2"/>
                Añadir al Catálogo
            </button>
            <CatalogEditModal 
                isOpen={isModalOpen}
                template={currentTemplate}
                onClose={closeModal}
                onSave={handleSave}
                existingTemplateIds={templates.map(t => t.id)}
            />
            <CatalogDeleteModal
                isOpen={!!templateToDelete}
                template={templateToDelete}
                onClose={() => setTemplateToDelete(null)}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
};

// --- Modals for Catalog Management ---
interface CatalogEditModalProps {
    isOpen: boolean;
    template: Partial<EquipmentTemplate> | null;
    onClose: () => void;
    onSave: (template: Partial<EquipmentTemplate>) => void;
    existingTemplateIds: string[];
}
const CatalogEditModal: React.FC<CatalogEditModalProps> = ({ isOpen, template, onClose, onSave, existingTemplateIds }) => {
    const [currentTemplate, setCurrentTemplate] = useState(template);

    useEffect(() => {
        setCurrentTemplate(template);
    }, [template]);

    if (!isOpen || !currentTemplate) return null;

    const handleSaveClick = () => {
        if (!currentTemplate.id?.trim() || !currentTemplate.name?.trim() || !currentTemplate.serviceType) {
            alert("ID, Nombre y Tipo de Servicio son requeridos.");
            return;
        }
        if (!template?.id && existingTemplateIds.includes(currentTemplate.id.trim())) {
             alert('El ID del tipo de equipo ya existe. Debe ser único.');
            return;
        }
        onSave({ ...currentTemplate, name: currentTemplate.name.trim(), id: currentTemplate.id.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">{template?.id ? 'Editar' : 'Añadir'} Tipo de Equipo</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-500"/></button>
                </div>
                <div className="mt-4 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">ID Único</label>
                        <input type="text" value={currentTemplate.id} onChange={(e) => setCurrentTemplate({ ...currentTemplate, id: e.target.value })} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" disabled={!!template?.id} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Tipo de Equipo</label>
                        <input type="text" spellCheck="true" value={currentTemplate.name} onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
                        <select value={currentTemplate.serviceType} onChange={(e) => setCurrentTemplate({ ...currentTemplate, serviceType: e.target.value })} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" >
                            {MOCK_SERVICE_TYPES.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                        </select>
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

interface CatalogDeleteModalProps {
    isOpen: boolean;
    template: EquipmentTemplate | null;
    onClose: () => void;
    onConfirm: () => void;
}
const CatalogDeleteModal: React.FC<CatalogDeleteModalProps> = ({ isOpen, template, onClose, onConfirm }) => {
    if (!isOpen || !template) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">¿Está seguro que desea eliminar <span className="font-semibold">{template.name}</span> del catálogo?</p>
            <div className="flex justify-end mt-6 space-x-4">
                <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={onConfirm} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
        </div>
      </div>
  );
};


// --- Main Component ---
const EquipmentManagement: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment> | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'byStore' | 'catalog'>('byStore');

  const equipmentTemplates = MOCK_EQUIPMENT_TEMPLATES;

  const filteredEquipment = selectedStoreId
    ? equipmentList.filter(e => e.storeId === selectedStoreId)
    : [];

  const openModalForNew = () => {
    if (!selectedStoreId) return;
    setCurrentEquipment({ name: '', id: '', storeId: selectedStoreId, details: '', serviceType: undefined, history: [] });
    setIsModalOpen(true);
  };

  const openModalForEdit = (equipment: Equipment) => {
    setCurrentEquipment({ ...equipment });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEquipment(null);
  };
  
  const handleTemplateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = equipmentTemplates.find(t => t.id === e.target.value);
    if (selectedTemplate) {
        setCurrentEquipment(prev => ({
            ...prev,
            name: selectedTemplate.name,
            serviceType: selectedTemplate.serviceType,
        }));
    } else {
        setCurrentEquipment(prev => ({
            ...prev,
            name: '',
            serviceType: undefined,
        }));
    }
  };

  const handleSave = () => {
    const isEditing = !!currentEquipment?.history?.length;

    if (!currentEquipment || !currentEquipment.name?.trim() || !currentEquipment.id?.trim() || !currentEquipment.storeId) {
      alert("Nombre, Código (ID) y Tienda son campos requeridos.");
      return;
    }

    if (!isEditing && equipmentList.some(e => e.id === currentEquipment.id?.trim())) {
        alert("El Código (ID) del equipo ya existe. Debe ser único.");
        return;
    }

    if (isEditing) { // Editing
      const updatedList = equipmentList.map(e => e.id === currentEquipment.id ? currentEquipment as Equipment : e);
      setEquipmentList(updatedList);
      MOCK_EQUIPMENT.splice(0, MOCK_EQUIPMENT.length, ...updatedList);
    } else { // Adding
      const newEquipment: Equipment = {
        name: currentEquipment.name.trim(),
        id: currentEquipment.id.trim(),
        storeId: currentEquipment.storeId,
        serviceType: currentEquipment.serviceType || MOCK_SERVICE_TYPES[0].name,
        details: currentEquipment.details?.trim() || '',
        history: [],
      };
      const updatedList = [...equipmentList, newEquipment];
      setEquipmentList(updatedList);
      MOCK_EQUIPMENT.push(newEquipment);
    }
    closeModal();
  };

  const handleDeleteConfirm = () => {
    if (!equipmentToDelete) return;
    const updatedList = equipmentList.filter(e => e.id !== equipmentToDelete.id);
    setEquipmentList(updatedList);
    MOCK_EQUIPMENT.splice(0, MOCK_EQUIPMENT.length, ...updatedList);
    setEquipmentToDelete(null);
  };
  
  const isEditing = currentEquipment?.history ? currentEquipment.history.length > 0 : false;
  
  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Equipos</h1>
        
         <div className="flex border-b">
            <button onClick={() => setActiveTab('byStore')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'byStore' ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Equipos por Tienda
            </button>
            <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'catalog' ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Catálogo de Equipos
            </button>
        </div>

        <div className="pt-6">
          {activeTab === 'byStore' ? (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                      <label htmlFor="store-filter" className="block text-sm font-medium text-gray-700">Filtrar por Tienda</label>
                      <select id="store-filter" value={selectedStoreId} onChange={e => setSelectedStoreId(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light" >
                          <option value="">Seleccione una tienda para ver sus equipos</option>
                          {MOCK_STORES.sort((a,b) => a.name.localeCompare(b.name)).map(store => (<option key={store.id} value={store.id}>{store.name}</option>))}
                      </select>
                  </div>
                  <div className="self-end text-right">
                      <button onClick={openModalForNew} disabled={!selectedStoreId} className="inline-flex items-center w-full px-4 py-2 font-bold text-white transition-colors duration-200 rounded-lg md:w-auto bg-brand-accent hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed" >
                          <PlusIcon className="w-5 h-5 mr-2"/>Añadir Nuevo Equipo
                      </button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                  <thead className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Código (QR)</th><th className="px-4 py-3">Tienda</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {!selectedStoreId ? (<tr><td colSpan={5} className="py-8 text-center text-gray-500">Por favor, seleccione una tienda para comenzar.</td></tr>
                    ) : filteredEquipment.length > 0 ? (
                      filteredEquipment.map(item => (
                          <tr key={item.id} className="text-gray-700">
                            <td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3">{item.id}</td><td className="px-4 py-3">{MOCK_STORES.find(s => s.id === item.storeId)?.name}</td><td className="px-4 py-3">{item.serviceType}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => openModalForEdit(item)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-blue" aria-label={`Editar ${item.name}`}><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => setEquipmentToDelete(item)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${item.name}`}><TrashIcon className="w-5 h-5"/></button>
                              </div>
                            </td>
                          </tr>
                      ))
                    ) : (<tr><td colSpan={5} className="py-8 text-center text-gray-500">No se encontraron equipos para la tienda seleccionada.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EquipmentCatalogManagement />
          )}
        </div>
      </div>

      {isModalOpen && currentEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar' : 'Añadir'} Equipo</h2>
              <button onClick={closeModal}><XIcon className="w-6 h-6 text-gray-500"/></button>
            </div>
            <div className="mt-4 space-y-4">
               {isEditing ? (
                 <input type="text" placeholder="Nombre del Equipo" spellCheck="true" value={currentEquipment.name} onChange={e => setCurrentEquipment({...currentEquipment, name: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
               ) : (
                 <select value={equipmentTemplates.find(t => t.name === currentEquipment.name)?.id || ''} onChange={handleTemplateSelection} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" >
                     <option value="">Seleccione un equipo del catálogo...</option>
                     {equipmentTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
               )}
              <input type="text" placeholder="Código (ID para QR/Barras)" value={currentEquipment.id} onChange={e => setCurrentEquipment({...currentEquipment, id: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" disabled={isEditing}/>
              <select value={currentEquipment.storeId} onChange={e => setCurrentEquipment({...currentEquipment, storeId: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:text-gray-500" disabled >
                {MOCK_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={currentEquipment.serviceType || ''} onChange={e => setCurrentEquipment({...currentEquipment, serviceType: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" disabled={!isEditing && !!currentEquipment.name}>
                <option value="" disabled>Tipo de Servicio</option>
                {MOCK_SERVICE_TYPES.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
              </select>
              <textarea placeholder="Detalles (Modelo, serial, etc.)" spellCheck="true" value={currentEquipment.details} onChange={e => setCurrentEquipment({...currentEquipment, details: e.target.value})} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button onClick={closeModal} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {equipmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">¿Está seguro que desea eliminar el equipo <span className="font-semibold">{equipmentToDelete.name}</span>?</p>
            <div className="flex justify-end mt-6 space-x-4">
                <button onClick={() => setEquipmentToDelete(null)} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EquipmentManagement;