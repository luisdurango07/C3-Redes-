
import React, { useState } from 'react';
import { MOCK_STORES } from '../constants';
import { Store } from '../types';
import { EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';

const StoresManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Partial<Store> | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const openModalForNew = () => {
    setCurrentStore({ name: '', address: '', city: '', contactName: '', contactPhone: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (store: Store) => {
    setCurrentStore({ ...store });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStore(null);
  };

  const handleSave = () => {
    // FIX: Added city to the validation check and alert message.
    if (!currentStore || !currentStore.name?.trim() || !currentStore.address?.trim() || !currentStore.city?.trim()) {
      alert("Nombre, Dirección y Ciudad son campos requeridos.");
      return;
    }

    if (currentStore.id) { // Editing
      const updatedStores = stores.map(s => s.id === currentStore.id ? currentStore as Store : s);
      setStores(updatedStores);
      MOCK_STORES.splice(0, MOCK_STORES.length, ...updatedStores);
    } else { // Adding
      // FIX: Added city to the new Store object.
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: currentStore.name.trim(),
        address: currentStore.address.trim(),
        city: currentStore.city.trim(),
        contactName: currentStore.contactName?.trim() || '',
        contactPhone: currentStore.contactPhone?.trim() || '',
      };
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      MOCK_STORES.push(newStore);
    }
    closeModal();
  };
  
  const handleDeleteConfirm = () => {
    if (!storeToDelete) return;
    
    const updatedStores = stores.filter(s => s.id !== storeToDelete.id);
    setStores(updatedStores);
    MOCK_STORES.splice(0, MOCK_STORES.length, ...updatedStores);
    setStoreToDelete(null);
  };
  
  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Gestión de Tiendas</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-gray-600 uppercase border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {stores.map(store => (
                <tr key={store.id} className="text-gray-700">
                  <td className="px-4 py-3 font-semibold">{store.name}</td>
                  <td className="px-4 py-3">{store.address}</td>
                  <td className="px-4 py-3">{store.contactName}</td>
                  <td className="px-4 py-3">{store.contactPhone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openModalForEdit(store)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-brand-blue" aria-label={`Editar ${store.name}`}>
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => setStoreToDelete(store)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600" aria-label={`Eliminar ${store.name}`}>
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
          Añadir Nueva Tienda
        </button>
      </div>

      {isModalOpen && currentStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{currentStore.id ? 'Editar' : 'Añadir'} Tienda</h2>
              <button onClick={closeModal}><XIcon className="w-6 h-6 text-gray-500"/></button>
            </div>
            <div className="mt-4 space-y-4">
              <input type="text" placeholder="Nombre de la Tienda" spellCheck="true" value={currentStore.name || ''} onChange={e => setCurrentStore({...currentStore, name: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
              <input type="text" placeholder="Dirección" spellCheck="true" value={currentStore.address || ''} onChange={e => setCurrentStore({...currentStore, address: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
              {/* FIX: Added input for the required 'city' field. */}
              <input type="text" placeholder="Ciudad" spellCheck="true" value={currentStore.city || ''} onChange={e => setCurrentStore({...currentStore, city: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
              <input type="text" placeholder="Nombre del Contacto" spellCheck="true" value={currentStore.contactName || ''} onChange={e => setCurrentStore({...currentStore, contactName: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
              <input type="text" placeholder="Teléfono del Contacto" value={currentStore.contactPhone || ''} onChange={e => setCurrentStore({...currentStore, contactPhone: e.target.value})} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button onClick={closeModal} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 font-semibold text-white rounded-lg bg-brand-blue hover:bg-brand-blue-light">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">
                ¿Está seguro que desea eliminar la tienda <span className="font-semibold">{storeToDelete.name}</span>?
            </p>
            <div className="flex justify-end mt-6 space-x-4">
                <button onClick={() => setStoreToDelete(null)} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoresManagement;