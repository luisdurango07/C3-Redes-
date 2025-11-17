import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../App';
import { MaterialCatalogItem } from '../types';
import { EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';

// --- Catalog Management Modal ---
interface EditModalProps {
    isOpen: boolean;
    material: Partial<MaterialCatalogItem> | null;
    onClose: () => void;
    onSave: (material: Partial<MaterialCatalogItem>) => void;
    existingMaterialIds: string[];
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, material, onClose, onSave, existingMaterialIds }) => {
    const [currentMaterial, setCurrentMaterial] = useState(material);

    useEffect(() => {
        setCurrentMaterial(material);
    }, [material]);

    if (!isOpen || !currentMaterial) return null;

    const handleSaveClick = () => {
        if (!currentMaterial.id?.trim() || !currentMaterial.name?.trim() || !currentMaterial.unit?.trim()) {
            alert("ID, Nombre y Unidad son campos requeridos.");
            return;
        }
        if (!material?.id && existingMaterialIds.includes(currentMaterial.id.trim())) {
            alert('El ID del material ya existe. Debe ser único.');
            return;
        }
        onSave({ ...currentMaterial, name: currentMaterial.name.trim(), id: currentMaterial.id.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">{material?.id ? 'Editar' : 'Añadir'} Material al Catálogo</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-500"/></button>
                </div>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID / SKU</label>
                        <input type="text" value={currentMaterial.id || ''} onChange={(e) => setCurrentMaterial({ ...currentMaterial, id: e.target.value })} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm" disabled={!!material?.id}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Material</label>
                        <input type="text" value={currentMaterial.name || ''} onChange={(e) => setCurrentMaterial({ ...currentMaterial, name: e.target.value })} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                        <input type="text" value={currentMaterial.unit || ''} onChange={(e) => setCurrentMaterial({ ...currentMaterial, unit: e.target.value })} placeholder="ej: unidad, kg, metros" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
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

// --- Catalog Delete Modal ---
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    material: MaterialCatalogItem | null;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, material, onClose, onConfirm }) => {
    if (!isOpen || !material) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">¿Está seguro que desea eliminar <span className="font-semibold">{material.name}</span> del catálogo?</p>
            <div className="flex justify-end mt-6 space-x-4">
                <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={onConfirm} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
        </div>
      </div>
  );
};

// --- Catalog Tab ---
const CatalogManagement: React.FC = () => {
  const { materialCatalog, addCatalogItem, updateCatalogItem, deleteCatalogItem } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<MaterialCatalogItem> | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<MaterialCatalogItem | null>(null);

  const openModalForNew = () => {
    setCurrentMaterial({ id: '', name: '', unit: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (material: MaterialCatalogItem) => {
    setCurrentMaterial({ ...material });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMaterial(null);
  };

  const handleSave = (materialToSave: Partial<MaterialCatalogItem>) => {
    const isEditing = materialCatalog.some(m => m.id === materialToSave.id);
    if (isEditing) {
      updateCatalogItem(materialToSave as MaterialCatalogItem);
    } else {
      addCatalogItem(materialToSave as MaterialCatalogItem);
    }
    closeModal();
  };
  
  const handleDeleteConfirm = () => {
    if (!materialToDelete) return;
    deleteCatalogItem(materialToDelete.id);
    setMaterialToDelete(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
              <th className="px-4 py-3">ID / SKU</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Unidad</th><th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {materialCatalog.map(material => (
              <tr key={material.id} className="text-gray-700">
                <td className="px-4 py-3 font-mono text-sm">{material.id}</td><td className="px-4 py-3 font-semibold">{material.name}</td><td className="px-4 py-3">{material.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => openModalForEdit(material)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-blue" aria-label={`Editar ${material.name}`}><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => setMaterialToDelete(material)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${material.name}`}><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={openModalForNew} className="inline-flex items-center px-4 py-2 mt-6 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500">
        <PlusIcon className="w-5 h-5 mr-2"/>Añadir Nuevo Material al Catálogo
      </button>
      <EditModal isOpen={isModalOpen} material={currentMaterial} onClose={closeModal} onSave={handleSave} existingMaterialIds={materialCatalog.map(m => m.id)} />
      <DeleteConfirmationModal isOpen={!!materialToDelete} material={materialToDelete} onClose={() => setMaterialToDelete(null)} onConfirm={handleDeleteConfirm} />
    </>
  );
};

// --- Inventory Tab ---
const InventoryView: React.FC = () => {
    const { materialInventory, materialCatalog } = useContext(DataContext);
    
    const inventoryWithDetails = materialInventory.map(item => {
        const catalogItem = materialCatalog.find(cat => cat.id === item.materialId);
        return { ...item, name: catalogItem?.name || 'N/A (Catálogo Eliminado)', unit: catalogItem?.unit || 'N/A' };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    return (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">ID / SKU</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3 text-right">Stock Actual</th><th className="px-4 py-3">Unidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {inventoryWithDetails.length > 0 ? inventoryWithDetails.map(item => (
                <tr key={item.materialId} className="text-gray-700">
                  <td className="px-4 py-3 font-mono text-sm">{item.materialId}</td><td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3 font-mono text-lg text-right">{item.stock}</td><td className="px-4 py-3">{item.unit}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No hay materiales en el inventario.</td></tr>
              )}
            </tbody>
          </table>
        </div>
    );
};

// --- Material Entry Tab ---
const MaterialEntryForm: React.FC = () => {
    const { materialCatalog, addMaterialPurchase } = useContext(DataContext);
    const [entry, setEntry] = useState({ materialId: '', quantity: '', unitCost: '', supplier: '', invoiceNumber: '', purchaseDate: new Date().toISOString().split('T')[0] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { materialId, quantity, unitCost, supplier, invoiceNumber, purchaseDate } = entry;
        if (!materialId || !quantity || !unitCost || !supplier.trim() || !invoiceNumber.trim() || !purchaseDate) {
            alert('Por favor, complete todos los campos.');
            return;
        }
        setIsSubmitting(true);
        addMaterialPurchase({
            materialId,
            quantity: parseInt(quantity, 10),
            unitCost: parseFloat(unitCost),
            supplier: supplier.trim(),
            invoiceNumber: invoiceNumber.trim(),
            purchaseDate: new Date(`${purchaseDate}T12:00:00`),
        });
        alert('Ingreso de material registrado exitosamente.');
        setEntry({ materialId: '', quantity: '', unitCost: '', supplier: '', invoiceNumber: '', purchaseDate: new Date().toISOString().split('T')[0] });
        setIsSubmitting(false);
    };
    
    return (
        <form onSubmit={handleSubmit} className="max-w-xl p-4 space-y-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">Registrar Compra de Material</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Material (del Catálogo)</label>
                <select name="materialId" value={entry.materialId} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"><option value="" disabled>Seleccione un material...</option>{materialCatalog.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block text-sm font-medium text-gray-700">Cantidad</label><input type="number" min="1" name="quantity" value={entry.quantity} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Costo por Unidad</label><input type="number" min="0" step="0.01" name="unitCost" value={entry.unitCost} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"/></div>
            </div>
             <div><label className="block text-sm font-medium text-gray-700">Proveedor</label><input type="text" name="supplier" value={entry.supplier} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"/></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block text-sm font-medium text-gray-700">Nro. de Factura</label><input type="text" name="invoiceNumber" value={entry.invoiceNumber} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Fecha de Compra</label><input type="date" name="purchaseDate" value={entry.purchaseDate} onChange={handleInputChange} required className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"/></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-blue hover:bg-brand-blue-light disabled:bg-gray-400">{isSubmitting ? 'Registrando...' : 'Registrar Ingreso'}</button>
        </form>
    );
};

// --- Main Component ---
const MaterialsManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'catalog' | 'entry'>('inventory');

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Materiales y Repuestos</h1>
            <div className="flex border-b">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'inventory' ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Inventario</button>
                <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'catalog' ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Catálogo de Materiales</button>
                <button onClick={() => setActiveTab('entry')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'entry' ? 'bg-white border-b-0 border text-brand-blue' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Ingreso de Material</button>
            </div>
            <div className="pt-6">
                {activeTab === 'inventory' && <InventoryView />}
                {activeTab === 'catalog' && <CatalogManagement />}
                {activeTab === 'entry' && <MaterialEntryForm />}
            </div>
        </div>
    );
};

export default MaterialsManagement;