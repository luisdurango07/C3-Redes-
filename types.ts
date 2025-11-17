export enum Role {
  SUPER_ADMIN = 'Super Administrador',
  ADMIN = 'Administrador',
  TECHNICIAN = 'Técnico',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  assignedTools?: Tool[];
}

export interface ServiceType {
  id: string;
  name: string;
}

export enum TaskStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  COMPLETED = 'Completado',
}

export interface Equipment {
  id: string; // Used for QR code
  name: string;
  storeId: string;
  serviceType: string;
  history: Task[];
  details: string;
}

export interface Store {
  id:string;
  name: string;
  address: string;
  city: string;
  contactName: string;
  contactPhone: string;
}

export interface Task {
  id: string;
  osNumber: string; // e.g., C2025-001
  title: string;
  description: string;
  storeId: string;
  equipmentId: string;
  technicianId: string;
  scheduledDate: Date;
  status: TaskStatus;
  serviceType: string;
  photos: string[]; // URLs or base64 strings of compressed images
  notes: string;
  checklistData?: { [key: string]: any }; // To store dynamic checklist answers
  materials?: { materialId: string; quantity: number; }[];
}

export interface TaskType {
  id: string;
  name: string;
}

// --- New Types for Tools Management ---
export enum ToolCategory {
    ELECTRICAL = 'Eléctrica',
    HVAC = 'Aire Acondicionado',
    GENERAL = 'General',
}

export enum ToolStatus {
    AVAILABLE = 'Disponible',
    ASSIGNED = 'Asignada',
    IN_REPAIR = 'En Reparación',
    MAINTENANCE = 'En Mantenimiento',
}

export interface ToolAssignmentLog {
    technicianId: string;
    assignedDate: Date;
    returnedDate?: Date;
}

export interface Tool {
    id: string;
    name: string;
    category: ToolCategory;
    status: ToolStatus;
    assignedTechnicianId: string | null;
    assignmentHistory: ToolAssignmentLog[];
    photoUrl?: string;
}

// --- New Type for Equipment Catalog ---
export interface EquipmentTemplate {
  id: string;
  name: string;
  serviceType: string;
}

// --- New Types for Materials Management ---
export interface MaterialCatalogItem {
  id: string; // SKU
  name: string;
  unit: string; // e.g., 'unidad', 'metros', 'kg'
}

export interface MaterialInventoryItem {
    materialId: string; // Foreign key to MaterialCatalogItem.id
    stock: number;
}

export interface MaterialPurchaseLog {
    id: string;
    materialId: string;
    quantity: number;
    unitCost: number;
    supplier: string;
    invoiceNumber: string;
    purchaseDate: Date;
}