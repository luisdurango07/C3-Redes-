import React, { useState, useRef, useEffect, useContext } from 'react';
import { Task, TaskStatus, MaterialCatalogItem } from '../types';
import { MOCK_STORES, MOCK_EQUIPMENT } from '../constants';
import { compressImage } from '../utils/imageCompressor';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon, QrCodeIcon, XIcon, PlusIcon, TrashIcon } from './Icons';
import { TASK_TYPE_TO_TEMPLATE_MAP, ChecklistItem, ChecklistItemType } from '../checklistTemplates';
import { DataContext } from '../App';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onUpdate: (task: Task) => void;
}

declare global {
  interface Window { BarcodeDetector: any; }
}

// Extracted Component: ChecklistItemRenderer
const ChecklistItemRenderer: React.FC<{ 
    item: ChecklistItem;
    checklistData: { [key: string]: any };
    handleChecklistChange: (id: string, value: any) => void;
    handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>, itemId: string) => void;
    isUploading: string | null;
    allMaterials: MaterialCatalogItem[];
}> = ({ item, checklistData, handleChecklistChange, handlePhotoUpload, isUploading, allMaterials }) => {
    const value = checklistData[item.id];
    const isOutOfRange = item.range && (value !== null && value !== undefined && value !== '') && (Number(value) < item.range.min || Number(value) > item.range.max);

    switch (item.type) {
      case ChecklistItemType.HEADER:
        return <h3 className="mt-6 mb-2 text-xl font-semibold text-gray-800">{item.label}</h3>;
      
      case ChecklistItemType.TEXT:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
            <input type="text" spellCheck="true" value={value || ''} onChange={e => handleChecklistChange(item.id, e.target.value)} placeholder={item.placeholder} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
          </div>
        );

      case ChecklistItemType.TEXTAREA:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
            <textarea spellCheck="true" value={value || ''} onChange={e => handleChecklistChange(item.id, e.target.value)} placeholder={item.placeholder} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
          </div>
        );

      case ChecklistItemType.BOOLEAN:
        return (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <label className="text-sm font-medium text-gray-800">{item.label}{item.required && '*'}</label>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleChecklistChange(item.id, true)} className={`px-4 py-1 text-sm rounded ${value === true ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Sí</button>
              <button onClick={() => handleChecklistChange(item.id, false)} className={`px-4 py-1 text-sm rounded ${value === false ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>No</button>
            </div>
          </div>
        );
      
      case ChecklistItemType.NUMERIC:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
            <div className="relative">
                <input type="number" value={value || ''} onChange={e => handleChecklistChange(item.id, e.target.value)} placeholder={item.placeholder} className={`w-full mt-1 border-gray-300 rounded-md shadow-sm ${isOutOfRange ? 'border-red-500 ring-red-500' : ''}`} />
                {item.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">{item.unit}</span>}
            </div>
            {isOutOfRange && <p className="mt-1 text-xs text-red-600">Valor fuera del rango normal ({item.range?.min} - {item.range?.max})</p>}
          </div>
        );
      
      case ChecklistItemType.OPTIONS:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
            <select value={value || ''} onChange={e => handleChecklistChange(item.id, e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
              <option value="">Seleccione...</option>
              {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      
      case ChecklistItemType.CALCULATED:
         return (
            <div>
              <label className="block text-sm font-medium text-gray-700">{item.label}</label>
              <div className={`flex items-center justify-between p-2 mt-1 bg-gray-100 border rounded-md ${isOutOfRange ? 'border-red-500' : 'border-gray-300'}`}>
                <span className="font-mono text-lg text-gray-900">{value || 'N/A'} {item.unit}</span>
                {isOutOfRange && <span className="text-xs font-semibold text-red-600">ALERTA</span>}
              </div>
            </div>
         );

      case ChecklistItemType.PHOTO:
        const photos = value || [];
        return (
          <div>
            <h4 className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}{item.photoConfig?.min && ` (mín. ${item.photoConfig.min})`}</h4>
            <div className="p-2 mt-1 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo: string, index: number) => (
                        <div key={index} className="relative">
                            <img src={photo} className="object-cover w-full h-24 rounded-lg" alt={`checklist-photo-${index}`} />
                            <button onClick={() => handleChecklistChange(item.id, photos.filter((_: any, i: number) => i !== index))} className="absolute top-0 right-0 p-0.5 bg-red-500 rounded-full text-white"><XIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-full h-24 text-gray-500 transition-colors duration-200 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                        <CameraIcon className="w-6 h-6" />
                        <span className="mt-1 text-xs text-center">Añadir Foto</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, item.id)} />
                    </label>
                </div>
                {isUploading === item.id && <p className="mt-2 text-xs text-center text-gray-600">Subiendo...</p>}
            </div>
          </div>
        );

      case ChecklistItemType.SUBTABLE:
        const rows = value || [];
        const addRow = () => handleChecklistChange(item.id, [...rows, {}]);
        const updateRow = (index: number, colId: string, val: any) => {
            const newRows = rows.map((row: any, i: number) => i === index ? { ...row, [colId]: val } : row);
            handleChecklistChange(item.id, newRows);
        };
        const removeRow = (index: number) => {
            handleChecklistChange(item.id, rows.filter((_: any, i: number) => i !== index));
        }
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
                <div className="mt-1 space-y-2">
                    {rows.map((row: any, index: number) => (
                        <div key={index} className="grid items-center gap-2 p-2 bg-gray-50 rounded-md" style={{gridTemplateColumns: `repeat(${item.subtableColumns?.length || 1}, 1fr) auto`}}>
                           {item.subtableColumns?.map(col => {
                                if (col.type === 'select' && col.optionsSource === 'materials') {
                                    return (
                                        <select key={col.id} value={row[col.id] || ''} onChange={(e) => updateRow(index, col.id, e.target.value)} className="w-full p-1 text-sm border-gray-300 rounded-md">
                                            <option value="">Seleccione...</option>
                                            {allMaterials.map(mat => <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>)}
                                        </select>
                                    );
                                }
                                if (col.type === 'number') {
                                    return <input key={col.id} type="number" placeholder={col.label} value={row[col.id] || ''} onChange={(e) => updateRow(index, col.id, e.target.value)} className="w-full p-1 text-sm border-gray-300 rounded-md"/>;
                                }
                                // Default to text
                                return <input key={col.id} type="text" placeholder={col.label} spellCheck="true" value={row[col.id] || ''} onChange={(e) => updateRow(index, col.id, e.target.value)} className="w-full p-1 text-sm border-gray-300 rounded-md"/>;
                            })}
                            <button onClick={() => removeRow(index)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                <button onClick={addRow} className="flex items-center gap-1 px-2 py-1 mt-2 text-xs font-semibold text-white rounded bg-brand-blue-light hover:bg-brand-blue"><PlusIcon className="w-4 h-4"/> Añadir Fila</button>
            </div>
        )
      
      case ChecklistItemType.SIGNATURE:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">{item.label}{item.required && '*'}</label>
            <input type="text" spellCheck="true" value={value || ''} onChange={e => handleChecklistChange(item.id, e.target.value)} placeholder="Nombre completo del responsable" className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
          </div>
        );

      default:
        return <p>Unsupported item type</p>;
    }
  };


const TaskDetail: React.FC<TaskDetailProps> = ({ task, onBack, onUpdate }) => {
  const { materialCatalog } = useContext(DataContext);
  const [checklistData, setChecklistData] = useState<{ [key: string]: any }>(task.checklistData || {});
  const [isUploading, setIsUploading] = useState<string | null>(null); // track which photo field is uploading
  const [qrScanned, setQrScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScannerSupported, setIsScannerSupported] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const store = MOCK_STORES.find(s => s.id === task.storeId);
  const equipment = MOCK_EQUIPMENT.find(e => e.id === task.equipmentId);
  const checklistTemplate = TASK_TYPE_TO_TEMPLATE_MAP[task.title];

  // --- QR Scanner Logic ---
  useEffect(() => {
    if ('BarcodeDetector' in window) setIsScannerSupported(true);
    return () => stopScanner();
  }, []);

  // --- Checklist Calculation Logic ---
  useEffect(() => {
      if (!checklistTemplate) return;

      const newChecklistData = { ...checklistData };
      let hasChanged = false;

      checklistTemplate.items.forEach(item => {
          if (item.type === ChecklistItemType.CALCULATED && item.calculate) {
              const result = item.calculate(checklistData);
              if (newChecklistData[item.id] !== result) {
                  newChecklistData[item.id] = result;
                  hasChanged = true;
              }
          }
      });
      if (hasChanged) {
          setChecklistData(newChecklistData);
      }
  }, [checklistData, checklistTemplate]);


  const stopScanner = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (scanIntervalRef.current) window.cancelAnimationFrame(scanIntervalRef.current);
    streamRef.current = null;
    scanIntervalRef.current = null;
    setIsScanning(false);
  };

  const handleScanSuccess = (scannedId: string) => {
    if (scannedId === task.equipmentId) {
      setQrScanned(true);
      stopScanner();
    } else {
      setScannerError(`Código incorrecto. Se esperaba ${task.equipmentId}.`);
      setTimeout(() => setScannerError(null), 3000);
    }
  };

  const detectQrCode = () => {
    if (!isScanning || !videoRef.current || videoRef.current.readyState < videoRef.current.HAVE_METADATA) {
      if (isScanning) scanIntervalRef.current = window.requestAnimationFrame(detectQrCode);
      return;
    }
    try {
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      barcodeDetector.detect(videoRef.current)
        .then((barcodes: any[]) => {
          if (barcodes.length > 0) handleScanSuccess(barcodes[0].rawValue);
        })
        .finally(() => { if (isScanning) scanIntervalRef.current = window.requestAnimationFrame(detectQrCode); });
    } catch (error) {
      setScannerError('Error al detectar código QR.');
      if (isScanning) scanIntervalRef.current = window.requestAnimationFrame(detectQrCode);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setScannerError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanIntervalRef.current = window.requestAnimationFrame(detectQrCode);
      }
    } catch (err) {
      setScannerError('No se pudo acceder a la cámara. Verifique los permisos.');
      setIsScanning(false);
    }
  };

  const handleChecklistChange = (id: string, value: any) => {
    setChecklistData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    if (event.target.files) {
      setIsUploading(itemId);
      const files = Array.from(event.target.files);
      const compressedPhotos = await Promise.all(files.map(file => compressImage(file as File)));
      handleChecklistChange(itemId, [...(checklistData[itemId] || []), ...compressedPhotos]);
      setIsUploading(null);
    }
  };

  const extractPhotosFromChecklist = (data: { [key: string]: any }): string[] => {
      if (!checklistTemplate) return [];
      let allPhotos: string[] = [];
      checklistTemplate.items.forEach(item => {
          if (item.type === ChecklistItemType.PHOTO && data[item.id]) {
              allPhotos = [...allPhotos, ...data[item.id]];
          }
      });
      return allPhotos;
  };
  
  const handleCompleteTask = () => {
    const allPhotos = extractPhotosFromChecklist(checklistData);
    const usedMaterials = checklistData.materials?.filter((m: any) => m.materialId && m.quantity > 0);
    onUpdate({ ...task, status: TaskStatus.COMPLETED, notes: '', photos: allPhotos, checklistData, materials: usedMaterials });
  };

  const handleStartTask = () => {
    const allPhotos = extractPhotosFromChecklist(checklistData);
    onUpdate({ ...task, status: TaskStatus.IN_PROGRESS, notes: '', photos: allPhotos, checklistData });
  }

  const isChecklistComplete = () => {
      if (!checklistTemplate) return true; // No checklist, no validation needed
      for (const item of checklistTemplate.items) {
          const isConditionMet = !item.condition || item.condition(checklistData);
          if (item.required && isConditionMet) {
              const value = checklistData[item.id];
              if (value === undefined || value === null || value === '') {
                  return false;
              }
              if (item.type === ChecklistItemType.PHOTO && (!Array.isArray(value) || value.length < (item.photoConfig?.min || 1))) {
                  return false;
              }
              if (item.type === ChecklistItemType.BOOLEAN && typeof value !== 'boolean') {
                  return false; // Must be explicitly true or false
              }
          }
      }
      // Special check for materials
      if (checklistData.usedMaterials === true) {
        const materialsList = checklistData.materials;
        if (!materialsList || !Array.isArray(materialsList) || materialsList.length === 0) {
            return false;
        }
        for (const mat of materialsList) {
            if (!mat.materialId || !mat.quantity || Number(mat.quantity) <= 0) {
                return false;
            }
        }
      }
      return true;
  }

  const isTaskCompletable = qrScanned && isChecklistComplete();

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg md:p-6">
      {isScanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-lg p-4 mx-4 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-center text-gray-800">Apunte al Código QR</h3>
            <div className="overflow-hidden rounded-lg aspect-square"><video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline /></div>
            {scannerError && <p className="mt-4 font-semibold text-center text-red-500 bg-red-100 p-2 rounded">{scannerError}</p>}
            <button onClick={stopScanner} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-200" aria-label="Cerrar escáner"><XIcon className="w-6 h-6 text-gray-700" /></button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="flex items-center mb-6 text-brand-blue-light hover:text-brand-blue"><ArrowLeftIcon className="w-5 h-5 mr-2" />Volver a mis tareas</button>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{task.osNumber}</h2>
          <p className="mt-1 text-xl text-gray-800">{task.title}</p>
          <p className="mt-1 text-lg text-gray-600">{store?.name} - {equipment?.name} ({equipment?.id})</p>
        </div>
        
        {task.materials && task.materials.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Materiales Pre-asignados</h3>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {task.materials.map((mat, index) => {
                        const materialInfo = materialCatalog.find(m => m.id === mat.materialId);
                        return (
                            <li key={index} className="text-gray-700">
                                {materialInfo?.name || mat.materialId}: <span className="font-semibold">{mat.quantity} {materialInfo?.unit || ''}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )}

        {!qrScanned ? (
          <div className="p-6 text-center bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-800">Requiere Verificación de Equipo</h3>
            <p className="mt-2 text-yellow-700">Por favor, escanee el código QR del equipo para continuar.</p>
            {isScannerSupported ? (
              <button onClick={startScanner} className="inline-flex items-center px-6 py-3 mt-4 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500"><QrCodeIcon className="w-6 h-6 mr-2" />Escanear Código QR</button>
            ) : (
              <button onClick={() => setQrScanned(true)} className="inline-flex items-center px-6 py-3 mt-4 font-bold text-white transition-colors duration-200 rounded-lg bg-brand-accent hover:bg-yellow-500"><CheckCircleIcon className="w-6 h-6 mr-2" />Verificación Manual (Simular)</button>
            )}
            {!isScannerSupported && <p className="mt-2 text-xs text-gray-500">Tu navegador no soporta el escaneo de QR. Se usará la verificación manual.</p>}
          </div>
        ) : (
          <div className="p-4 text-center bg-green-50 border border-green-300 rounded-lg">
            <p className="font-semibold text-green-800"><CheckCircleIcon className="inline w-6 h-6 mr-2"/>Equipo verificado: {equipment?.name} ({equipment?.id})</p>
          </div>
        )}

        <div className={`transition-opacity duration-500 ${!qrScanned ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {checklistTemplate ? (
                <div className="space-y-4">
                    {checklistTemplate.items
                        .filter(item => !item.condition || item.condition(checklistData))
                        .map(item => <ChecklistItemRenderer 
                            key={item.id} 
                            item={item} 
                            checklistData={checklistData} 
                            handleChecklistChange={handleChecklistChange} 
                            handlePhotoUpload={handlePhotoUpload}
                            isUploading={isUploading}
                            allMaterials={materialCatalog}
                        />)
                    }
                </div>
            ) : (
                <p className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">No hay un checklist definido para este tipo de tarea.</p>
            )}
            
            <div className="flex flex-col gap-4 pt-4 mt-6 border-t md:flex-row">
              {task.status === TaskStatus.PENDING && (
                <button onClick={handleStartTask} className="w-full px-6 py-3 text-lg font-bold text-white transition-colors duration-200 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400" disabled={!qrScanned}>Iniciar Tarea</button>
              )}
              {(task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PENDING) && (
                <button onClick={handleCompleteTask} className="flex items-center justify-center w-full px-6 py-3 text-lg font-bold text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400" disabled={!isTaskCompletable}><CheckCircleIcon className="w-6 h-6 mr-2" />Completar Tarea</button>
              )}
            </div>
            {!isTaskCompletable && qrScanned && <p className="mt-2 text-sm text-center text-red-600">Debe completar todos los campos requeridos (*), incluyendo la lista de materiales si aplica.</p>}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;