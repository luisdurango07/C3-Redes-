import { User, Role, Store, Equipment, Task, ServiceType, TaskStatus, TaskType, Tool, ToolCategory, ToolStatus, EquipmentTemplate, MaterialCatalogItem, MaterialInventoryItem, MaterialPurchaseLog } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alicia Vega (Super Admin)', role: Role.SUPER_ADMIN, assignedTools: [] },
  { id: 'user-2', name: 'Bruno Castro (Admin)', role: Role.ADMIN, assignedTools: [] },
  { id: 'user-3', name: 'Carlos Díaz (Técnico)', role: Role.TECHNICIAN, assignedTools: [] },
  { id: 'user-4', name: 'Diana Mora (Técnico)', role: Role.TECHNICIAN, assignedTools: [] },
];

export let MOCK_STORES: Store[] = Array.from({ length: 47 }, (_, i) => ({
  id: `store-${i + 1}`,
  name: `Tienda ${String(i + 1).padStart(2, '0')}`,
  address: `Calle Principal #${i+1}, Sector Central`,
  city: `Ciudad ${String.fromCharCode(65 + Math.floor(i / 5))}`, // Example: Ciudad A, B, C...
  contactName: `Gerente ${String.fromCharCode(65 + (i % 26))}`, // Example: Gerente A, B, C...
  contactPhone: `+58-412-12345${String(i + 1).padStart(2, '0')}`,
}));


export let MOCK_SERVICE_TYPES: ServiceType[] = [
    { id: 'st-ac', name: 'Aire Acondicionado' },
    { id: 'st-elec', name: 'Tablero Eléctrico' },
    { id: 'st-plumb', name: 'Sistema Hidráulico' },
    { id: 'st-light', name: 'Sistema de Iluminación' },
];

export let MOCK_EQUIPMENT: Equipment[] = [
  { id: 'EQ-AC-S1-001', name: 'Unidad Central AC', storeId: 'store-1', serviceType: 'Aire Acondicionado', history: [], details: 'Modelo Carrier 5 Toneladas, Serial #XYZ123' },
  { id: 'EQ-ELEC-S1-001', name: 'Tablero Principal', storeId: 'store-1', serviceType: 'Tablero Eléctrico', history: [], details: 'Tablero de 24 circuitos, marca Siemens' },
  { id: 'EQ-PLUMB-S2-001', name: 'Bomba de Agua', storeId: 'store-2', serviceType: 'Sistema Hidráulico', history: [], details: 'Bomba 1.5 HP, check de retorno vertical' },
  { id: 'EQ-LIGHT-S3-001', name: 'Iluminación Sector A', storeId: 'store-3', serviceType: 'Sistema de Iluminación', history: [], details: 'Luminarias LED 18W, tipo panel' },
  { id: 'EQ-AC-S4-001', name: 'Split Piso 2', storeId: 'store-4', serviceType: 'Aire Acondicionado', history: [], details: 'Equipo LG Inverter 24000 BTU' },
  { id: 'EQ-ELEC-S5-001', name: 'Transformador de 112.5kva', storeId: 'store-5', serviceType: 'Tablero Eléctrico', history: [], details: 'Transformador trifásico en aceite' },
  { id: 'EQ-ELEC-S6-001', name: 'Transformador de 75kva', storeId: 'store-6', serviceType: 'Tablero Eléctrico', history: [], details: 'Transformador trifásico tipo seco' },
  { id: 'EQ-AC-S7-001', name: 'Unidad Piso techo de 5 Toneladas', storeId: 'store-7', serviceType: 'Aire Acondicionado', history: [], details: 'Equipo marca Carrier, modelo PT-5T' },
];

// This is defined with 'let' so that the management component can modify it in this mock environment.
export let MOCK_TASK_TYPES: TaskType[] = [
  { id: 'tt-aa-prev', name: 'Mantenimiento preventivo de Aire Acondicionado' },
  { id: 'tt-aa-corr', name: 'Reparación / Correctivo de Aire Acondicionado' },
  { id: 'tt-hid-prev', name: 'Mantenimiento de Bomba Hidráulica de Agua Potable' },
  { id: 'tt-tab-prev', name: 'Mantenimiento de Tableros Eléctricos' },
  { id: 'tt-emg', name: 'Atención de Emergencia' },
  { id: 'tt-ins-rut', name: 'Inspección de Rutina' },
];

export const MOCK_TASKS: Task[] = [
  { 
    id: 'task-1', 
    osNumber: 'C2024-001',
    title: 'Mantenimiento preventivo de Aire Acondicionado', 
    description: 'Realizar mantenimiento trimestral según plantilla PLT-AA-PREV.', 
    storeId: 'store-1', 
    equipmentId: 'EQ-AC-S1-001', 
    technicianId: 'user-3', 
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
    status: TaskStatus.PENDING, 
    serviceType: 'Aire Acondicionado',
    photos: [],
    notes: ''
  },
  { 
    id: 'task-2', 
    osNumber: 'C2024-002',
    title: 'Mantenimiento de Tableros Eléctricos', 
    description: 'Revisión y ajuste de conexiones en tablero principal.', 
    storeId: 'store-1', 
    equipmentId: 'EQ-ELEC-S1-001', 
    technicianId: 'user-4', 
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)), 
    status: TaskStatus.PENDING, 
    serviceType: 'Tablero Eléctrico',
    photos: [],
    notes: ''
  },
  { 
    id: 'task-3', 
    osNumber: 'C2024-003',
    title: 'Mantenimiento de Bomba Hidráulica de Agua Potable', 
    description: 'Verificar presión y posibles fugas en sistema hidroneumático.', 
    storeId: 'store-2', 
    equipmentId: 'EQ-PLUMB-S2-001', 
    technicianId: 'user-3', 
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 3)), 
    status: TaskStatus.PENDING, 
    serviceType: 'Sistema Hidráulico',
    photos: [],
    notes: ''
  },
   { 
    id: 'task-4', 
    osNumber: 'C2024-004',
    title: 'Atención de Emergencia', 
    description: 'Reporte de falla en iluminación del pasillo central.', 
    storeId: 'store-3', 
    equipmentId: 'EQ-LIGHT-S3-001', 
    technicianId: 'user-4', 
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
    status: TaskStatus.IN_PROGRESS, 
    serviceType: 'Sistema de Iluminación',
    photos: [],
    notes: ''
  },
   { 
    id: 'task-5', 
    osNumber: 'C2024-005',
    title: 'Reparación / Correctivo de Aire Acondicionado', 
    description: 'Equipo no enfría, posible fuga de refrigerante.', 
    storeId: 'store-4', 
    equipmentId: 'EQ-AC-S4-001', 
    technicianId: 'user-3', 
    scheduledDate: new Date(), 
    status: TaskStatus.COMPLETED, 
    serviceType: 'Aire Acondicionado',
    photos: ['https://picsum.photos/400/300?random=1','https://picsum.photos/400/300?random=2'],
    notes: 'Se corrigió fuga en la tubería de alta presión y se recargó el gas refrigerante. El equipo opera en parámetros normales.',
    checklistData: {
      "usedMaterials": true,
      "materials": [
        { "materialId": "GAS-R22", "quantity": 2 },
        { "materialId": "VAL-S-14", "quantity": 1 }
      ],
      "reporteFalla": "El equipo de aire acondicionado no enfría y gotea agua.",
      "diagnostico": "Falta de gas",
      "pruebasRealizadas": "Se utilizó detector de fugas electrónico, encontrando microfuga en la válvula de servicio de alta presión.",
      "postReparacionOk": true,
      "tempSuministroPost": 16,
      "deltaTPost": 8,
      "observaciones": "Se recomienda al personal de la tienda no obstruir la unidad exterior para mejorar la ventilación.",
      "evidencia": [
        "https://picsum.photos/400/300?random=1",
        "https://picsum.photos/400/300?random=2"
      ],
      "firmaResponsable": "Jefe de Tienda - Manuel Pérez",
      "cierre": "Resuelto"
    },
    materials: [
      { materialId: "GAS-R22", quantity: 2 },
      { materialId: "VAL-S-14", quantity: 1 }
    ],
  },
];

// Populate equipment history from tasks
MOCK_EQUIPMENT.forEach(equipment => {
  equipment.history = MOCK_TASKS
    .filter(task => task.equipmentId === equipment.id)
    .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
});


// --- New Mock Data for Tools Management ---
export let MOCK_TOOLS: Tool[] = [
    { id: 'tool-001', name: 'Multímetro Digital Fluke 117', category: ToolCategory.ELECTRICAL, status: ToolStatus.ASSIGNED, assignedTechnicianId: 'user-3', assignmentHistory: [{technicianId: 'user-3', assignedDate: new Date()}], photoUrl: 'https://picsum.photos/seed/multimetro/200' },
    { id: 'tool-002', name: 'Pinza Amperimétrica', category: ToolCategory.ELECTRICAL, status: ToolStatus.AVAILABLE, assignedTechnicianId: null, assignmentHistory: [], photoUrl: 'https://picsum.photos/seed/pinza/200' },
    { id: 'tool-003', name: 'Juego de Manómetros (Manifold)', category: ToolCategory.HVAC, status: ToolStatus.ASSIGNED, assignedTechnicianId: 'user-4', assignmentHistory: [{technicianId: 'user-4', assignedDate: new Date()}], photoUrl: 'https://picsum.photos/seed/manifold/200' },
    { id: 'tool-004', name: 'Bomba de Vacío 5 CFM', category: ToolCategory.HVAC, status: ToolStatus.AVAILABLE, assignedTechnicianId: null, assignmentHistory: [], photoUrl: 'https://picsum.photos/seed/bomba/200' },
    { id: 'tool-005', name: 'Detector de Fugas de Refrigerante', category: ToolCategory.HVAC, status: ToolStatus.IN_REPAIR, assignedTechnicianId: null, assignmentHistory: [], photoUrl: 'https://picsum.photos/seed/detector/200' },
    { id: 'tool-006', name: 'Taladro Inalámbrico DeWalt', category: ToolCategory.GENERAL, status: ToolStatus.ASSIGNED, assignedTechnicianId: 'user-3', assignmentHistory: [{technicianId: 'user-3', assignedDate: new Date()}], photoUrl: 'https://picsum.photos/seed/taladro/200' },
    { id: 'tool-007', name: 'Juego de Destornilladores', category: ToolCategory.GENERAL, status: ToolStatus.ASSIGNED, assignedTechnicianId: 'user-4', assignmentHistory: [{technicianId: 'user-4', assignedDate: new Date()}], photoUrl: 'https://picsum.photos/seed/destornillador/200' },
    { id: 'tool-008', name: 'Escalera de Tijera 8ft', category: ToolCategory.GENERAL, status: ToolStatus.AVAILABLE, assignedTechnicianId: null, assignmentHistory: [], photoUrl: 'https://picsum.photos/seed/escalera/200' },
    { id: 'tool-009', name: 'Termómetro Infrarrojo', category: ToolCategory.HVAC, status: ToolStatus.MAINTENANCE, assignedTechnicianId: null, assignmentHistory: [], photoUrl: 'https://picsum.photos/seed/termometro/200' },
];

// --- New Mock Data for Equipment Catalog ---
export let MOCK_EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  { id: 'et-ac-001', name: 'Unidad Central AC 5 Toneladas', serviceType: 'Aire Acondicionado' },
  { id: 'et-ac-002', name: 'Split Inverter 24000 BTU', serviceType: 'Aire Acondicionado' },
  { id: 'et-elec-001', name: 'Tablero Principal 24 circuitos', serviceType: 'Tablero Eléctrico' },
  { id: 'et-elec-002', name: 'Tablero Secundario 12 circuitos', serviceType: 'Tablero Eléctrico' },
  { id: 'et-plumb-001', name: 'Bomba de Agua 1.5 HP', serviceType: 'Sistema Hidráulico' },
  { id: 'et-plumb-002', name: 'Sistema Hidroneumático 120L', serviceType: 'Sistema Hidráulico' },
  { id: 'et-light-001', name: 'Luminaria LED tipo panel 18W', serviceType: 'Sistema de Iluminación' },
  { id: 'et-light-002', name: 'Reflector LED 100W Exterior', serviceType: 'Sistema de Iluminación' },
  { id: 'et-elec-003', name: 'Transformador de 112.5kva', serviceType: 'Tablero Eléctrico' },
  { id: 'et-elec-004', name: 'Transformador de 75kva', serviceType: 'Tablero Eléctrico' },
  { id: 'et-ac-003', name: 'Unidad Piso techo de 5 Toneladas', serviceType: 'Aire Acondicionado' },
];

// --- New Mock Data for Materials Management ---
export let MOCK_MATERIAL_CATALOG: MaterialCatalogItem[] = [
    { id: 'GAS-R22', name: 'Gas Refrigerante R-22', unit: 'kg' },
    { id: 'TUB-C-14', name: 'Tubería de cobre 1/4"', unit: 'metros' },
    { id: 'CON-3P-30A', name: 'Contactor 3 polos 30A', unit: 'unidad' },
    { id: 'CAB-12-THHN', name: 'Cable THHN #12 AWG', unit: 'metros' },
    { id: 'VAL-S-14', name: 'Válvula de servicio 1/4"', unit: 'unidad' },
    { id: 'FIL-S-38', name: 'Filtro secador 3/8"', unit: 'unidad' },
    { id: 'CIN-A-N', name: 'Cinta aislante negra', unit: 'unidad' },
    { id: 'BRK-2P-20A', name: 'Breaker 2 polos 20A', unit: 'unidad' },
];

export let MOCK_MATERIAL_INVENTORY: MaterialInventoryItem[] = [
    { materialId: 'GAS-R22', stock: 15 },
    { materialId: 'TUB-C-14', stock: 50 },
    { materialId: 'CON-3P-30A', stock: 12 },
    { materialId: 'CAB-12-THHN', stock: 200 },
    { materialId: 'VAL-S-14', stock: 8 },
    { materialId: 'FIL-S-38', stock: 10 },
    { materialId: 'CIN-A-N', stock: 30 },
    { materialId: 'BRK-2P-20A', stock: 5 },
];

export let MOCK_MATERIAL_PURCHASE_LOGS: MaterialPurchaseLog[] = [
    { id: 'purch-1', materialId: 'GAS-R22', quantity: 20, unitCost: 50, supplier: 'Refrimundo C.A.', invoiceNumber: 'INV-00123', purchaseDate: new Date('2024-05-10') },
    { id: 'purch-2', materialId: 'CON-3P-30A', quantity: 15, unitCost: 25, supplier: 'ElecTotal S.A.', invoiceNumber: 'INV-A-456', purchaseDate: new Date('2024-05-15') },
];


// Populate user's assigned tools
MOCK_USERS.forEach(user => {
    if (user.role === Role.TECHNICIAN) {
        user.assignedTools = MOCK_TOOLS.filter(tool => tool.assignedTechnicianId === user.id);
    }
});