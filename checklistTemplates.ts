import { MaterialCatalogItem } from './types';

export enum ChecklistItemType {
    HEADER = 'HEADER',
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    BOOLEAN = 'BOOLEAN',
    NUMERIC = 'NUMERIC',
    OPTIONS = 'OPTIONS',
    PHOTO = 'PHOTO',
    SIGNATURE = 'SIGNATURE',
    CALCULATED = 'CALCULATED',
    SUBTABLE = 'SUBTABLE',
}

export interface ChecklistItem {
    id: string;
    label: string;
    type: ChecklistItemType;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    range?: { min: number; max: number };
    unit?: string;
    calculationDependencies?: string[];
    calculate?: (values: { [key: string]: any }) => number | string;
    subtableColumns?: { id: string, label: string, type?: 'text' | 'number' | 'select', optionsSource?: 'materials' }[];
    photoConfig?: { min: number };
    condition?: (values: { [key: string]: any }) => boolean;
}

export interface ChecklistTemplate {
    id: string;
    name: string;
    items: ChecklistItem[];
}

const PLT_AA_PREV: ChecklistTemplate = {
    id: 'PLT-AA-PREV',
    name: 'Mantenimiento preventivo de Aire Acondicionado',
    items: [
        { id: 'headerObservaciones', label: 'Observaciones Iniciales', type: ChecklistItemType.HEADER },
        { id: 'observacionesIniciales', label: 'Observaciones iniciales', type: ChecklistItemType.TEXTAREA, placeholder: 'Describa el estado inicial del equipo' },
        { id: 'headerChecklist', label: 'Checklist de Mantenimiento', type: ChecklistItemType.HEADER },
        { id: 'energizadoSinAlarmas', label: 'Equipo energizado y sin alarmas', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'tempSuministro', label: 'Temperatura suministro (°C)', type: ChecklistItemType.NUMERIC, required: true, range: { min: 14, max: 20 }, unit: '°C' },
        { id: 'tempRetorno', label: 'Temperatura retorno (°C)', type: ChecklistItemType.NUMERIC, required: true, range: { min: 20, max: 26 }, unit: '°C' },
        { 
            id: 'deltaT', 
            label: 'ΔT calculado (°C)', 
            type: ChecklistItemType.CALCULATED,
            unit: '°C',
            range: { min: 4, max: 10 },
            calculationDependencies: ['tempSuministro', 'tempRetorno'],
            calculate: (values) => {
                const retorno = parseFloat(values.tempRetorno);
                const suministro = parseFloat(values.tempSuministro);
                if (!isNaN(retorno) && !isNaN(suministro)) {
                    return (retorno - suministro).toFixed(1);
                }
                return 'N/A';
            }
        },
        { id: 'estadoFiltros', label: 'Estado de filtros', type: ChecklistItemType.OPTIONS, required: true, options: ['Limpio', 'Sucio', 'Reemplazado'] },
        { id: 'limpiezaSerpentinInt', label: 'Limpieza de serpentín interior', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'limpiezaSerpentinExt', label: 'Limpieza de serpentín exterior', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'presionSuccion', label: 'Presión de succión (psi)', type: ChecklistItemType.NUMERIC, range: { min: 55, max: 75 }, unit: 'psi' },
        { id: 'presionDescarga', label: 'Presión de descarga (psi)', type: ChecklistItemType.NUMERIC, range: { min: 200, max: 300 }, unit: 'psi' },
        { id: 'verificacionDrenaje', label: 'Verificación drenaje/charolas', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'tensionAlimentacion', label: 'Tensión de alimentación (V)', type: ChecklistItemType.NUMERIC, range: { min: 208, max: 240 }, unit: 'V' },
        { id: 'corrienteCompresor', label: 'Corriente del compresor (A)', type: ChecklistItemType.NUMERIC, unit: 'A', placeholder: 'Valor según placa' },
        { id: 'conexionesElectricas', label: 'Estado conexiones eléctricas', type: ChecklistItemType.OPTIONS, required: true, options: ['OK', 'Apretar', 'Reemplazar'] },
        { id: 'headerMateriales', label: 'Materiales', type: ChecklistItemType.HEADER },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'headerEvidencia', label: 'Evidencia Fotográfica', type: ChecklistItemType.HEADER },
        { id: 'fotosAntesDespues', label: 'Fotos antes/después', type: ChecklistItemType.PHOTO, required: true, photoConfig: { min: 2 } },
        { id: 'headerCierre', label: 'Cierre', type: ChecklistItemType.HEADER },
        { id: 'firmaResponsable', label: 'Firma responsable tienda', type: ChecklistItemType.SIGNATURE, required: true },
    ]
};

const PLT_AA_CORR: ChecklistTemplate = {
    id: 'PLT-AA-CORR',
    name: 'Reparación / Correctivo de Aire Acondicionado',
    items: [
        { id: 'reporteFalla', label: 'Descripción del reporte de falla', type: ChecklistItemType.TEXTAREA, required: true },
        { id: 'diagnostico', label: 'Diagnóstico preliminar', type: ChecklistItemType.OPTIONS, required: true, options: ['Falta gas', 'Falla eléctrica', 'Falta mantenimiento', 'Otro'] },
        { id: 'pruebasRealizadas', label: 'Pruebas realizadas', type: ChecklistItemType.TEXTAREA, required: true },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'postReparacionOk', label: 'Prueba de funcionamiento post-reparación OK', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'tempSuministroPost', label: 'Temperatura suministro post (°C)', type: ChecklistItemType.NUMERIC, unit: '°C' },
        { id: 'deltaTPost', label: 'ΔT post (°C)', type: ChecklistItemType.NUMERIC, unit: '°C' },
        { id: 'observaciones', label: 'Observaciones y recomendaciones', type: ChecklistItemType.TEXTAREA, placeholder: 'Obligatorio si diagnóstico fue "Otro"' },
        { id: 'evidencia', label: 'Evidencia fotográfica de la reparación', type: ChecklistItemType.PHOTO, required: true, photoConfig: { min: 2 } },
        { id: 'firmaResponsable', label: 'Firma responsable tienda', type: ChecklistItemType.SIGNATURE, required: true },
        { id: 'cierre', label: 'Estado de Cierre', type: ChecklistItemType.OPTIONS, required: true, options: ['Resuelto', 'En observación', 'Requiere segunda visita'] },
    ]
};

const PLT_HID_PREV: ChecklistTemplate = {
    id: 'PLT-HID-PREV',
    name: 'Mantenimiento de Bomba Hidráulica de Agua Potable',
    items: [
        { id: 'valvulasOk', label: 'Válvulas en posición correcta', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'presionLinea', label: 'Presión línea (psi)', type: ChecklistItemType.NUMERIC, required: true, range: { min: 30, max: 60 }, unit: 'psi' },
        { id: 'caudalEstimado', label: 'Caudal estimado (L/min)', type: ChecklistItemType.NUMERIC, range: { min: 10, max: 120 }, unit: 'L/min' },
        { id: 'vibraciones', label: 'Vibraciones anómalas', type: ChecklistItemType.OPTIONS, required: true, options: ['No', 'Leve', 'Alta'] },
        { id: 'fugas', label: 'Fugas visibles', type: ChecklistItemType.OPTIONS, required: true, options: ['No', 'Sí menor', 'Sí mayor'] },
        { id: 'estadoSello', label: 'Estado sello mecánico', type: ChecklistItemType.OPTIONS, required: true, options: ['OK', 'Desgaste', 'Reemplazar'] },
        { id: 'alineacion', label: 'Alineación motor-bomba OK', type: ChecklistItemType.BOOLEAN },
        { id: 'corrienteMotor', label: 'Corriente motor (A)', type: ChecklistItemType.NUMERIC, unit: 'A' },
        { id: 'aislamiento', label: 'Aislamiento eléctrico (MΩ)', type: ChecklistItemType.NUMERIC, unit: 'MΩ' },
        { id: 'limpiezaFiltros', label: 'Limpieza de coladores/filtros', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'fotosConexiones', label: 'Fotos de conexiones y base', type: ChecklistItemType.PHOTO, required: true, photoConfig: { min: 1 } },
        { id: 'firmaResponsable', label: 'Firma responsable tienda', type: ChecklistItemType.SIGNATURE, required: true },
    ]
};

const PLT_TAB_PREV: ChecklistTemplate = {
    id: 'PLT-TAB-PREV',
    name: 'Mantenimiento de Tableros Eléctricos',
    items: [
        { id: 'loto', label: 'Bloqueo/etiquetado (LOTO) aplicado', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'riesgos', label: 'Riesgos identificados antes de abrir', type: ChecklistItemType.TEXTAREA },
        { id: 'epp', label: 'Apertura segura + EPP', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'ajusteTornilleria', label: 'Ajuste de tornillería (par %)', type: ChecklistItemType.NUMERIC, range: { min: 80, max: 100 }, unit: '%' },
        { id: 'estadoBarras', label: 'Estado barras/colectores', type: ChecklistItemType.OPTIONS, required: true, options: ['OK', 'Calentamiento', 'Corrosión'] },
        { id: 'estadoBreakers', label: 'Estado breakers', type: ChecklistItemType.OPTIONS, required: true, options: ['OK', 'Reemplazar'] },
        { id: 'tempTermografica', label: 'Temperatura termográfica máx (°C)', type: ChecklistItemType.NUMERIC, unit: '°C', placeholder: 'Alerta > 60°C' },
        { id: 'limpieza', label: 'Limpieza interior/externa', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'etiquetadoCircuitos', label: 'Etiquetado de circuitos', type: ChecklistItemType.OPTIONS, required: true, options: ['Completo', 'Parcial', 'Inexistente'] },
        { id: 'tensionFases', label: 'Medición tensión fases (V)', type: ChecklistItemType.NUMERIC, unit: 'V' },
        { id: 'balanceCorrientes', label: 'Medición balance corrientes (A)', type: ChecklistItemType.NUMERIC, unit: 'A' },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'fotoTermografia', label: 'Foto termografía (puntos críticos)', type: ChecklistItemType.PHOTO },
        { id: 'fotoGeneral', label: 'Foto general tablero (antes/después)', type: ChecklistItemType.PHOTO, required: true, photoConfig: { min: 2 } },
        { id: 'retiroLoto', label: 'Retiro LOTO y normalización', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'firmaResponsable', label: 'Firma responsable tienda', type: ChecklistItemType.SIGNATURE, required: true },
    ]
};

const PLT_EMG_ATENCION: ChecklistTemplate = {
    id: 'PLT-EMG-ATENCION',
    name: 'Atención de Emergencia',
    items: [
        { id: 'tipoEmergencia', label: 'Tipo de emergencia', type: ChecklistItemType.OPTIONS, required: true, options: ['AA', 'Tablero', 'Bomba', 'Otro'] },
        { id: 'descripcionEvento', label: 'Descripción del evento', type: ChecklistItemType.TEXTAREA, required: true },
        { id: 'seguridadControlada', label: 'Condiciones de seguridad controladas', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'aislamiento', label: 'Aislamiento eléctrico/hidráulico aplicado', type: ChecklistItemType.BOOLEAN },
        { id: 'causaRaiz', label: 'Diagnóstico causa raíz provisional', type: ChecklistItemType.TEXTAREA, required: true },
        { id: 'accionesContencion', label: 'Acciones de contención', type: ChecklistItemType.TEXTAREA, required: true },
        { id: 'servicioRestablecido', label: 'Servicio restablecido', type: ChecklistItemType.OPTIONS, required: true, options: ['Sí', 'Parcial', 'No'] },
        { id: 'tiempoFueraServicio', label: 'Tiempo fuera de servicio (min)', type: ChecklistItemType.NUMERIC, required: true, unit: 'min' },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'evidencia', label: 'Evidencia fotográfica', type: ChecklistItemType.PHOTO, required: true, photoConfig: { min: 2 } },
        { id: 'recomendacion', label: 'Recomendación trabajo definitivo', type: ChecklistItemType.TEXTAREA, required: true, placeholder: 'Obligatorio si servicio no fue restablecido al 100%' },
        { id: 'firmaResponsable', label: 'Firma responsable tienda', type: ChecklistItemType.SIGNATURE, required: true },
        { id: 'cierre', label: 'Estado de Cierre', type: ChecklistItemType.OPTIONS, required: true, options: ['Resuelto', 'Requiere seguimiento', 'Escalado'] },
    ]
};

const PLT_INS_RUTINA: ChecklistTemplate = {
    id: 'PLT-INS-RUTINA',
    name: 'Inspección de Rutina',
    items: [
        { id: 'aaIndicadores', label: 'AA – Indicadores normales', type: ChecklistItemType.BOOLEAN },
        { id: 'aaRuidos', label: 'AA – Ruidos/Vibraciones', type: ChecklistItemType.OPTIONS, options: ['No', 'Leve', 'Alta'] },
        { id: 'bombaPresion', label: 'Bomba – Presión (psi)', type: ChecklistItemType.NUMERIC, unit: 'psi' },
        { id: 'bombaFugas', label: 'Bomba – Fugas', type: ChecklistItemType.OPTIONS, options: ['No', 'Sí menor', 'Sí mayor'] },
        { id: 'tableroOlores', label: 'Tablero – Olores/Calentamiento', type: ChecklistItemType.OPTIONS, options: ['No', 'Leve', 'Alto'] },
        { id: 'iluminacionPuntos', label: 'Iluminación – Puntos fuera', type: ChecklistItemType.NUMERIC, unit: 'cantidad' },
        { id: 'usedMaterials', label: '¿Se utilizaron materiales/repuestos?', type: ChecklistItemType.BOOLEAN, required: true },
        { id: 'materials', label: 'Materiales y Repuestos Utilizados', type: ChecklistItemType.SUBTABLE, condition: (values) => values.usedMaterials === true, subtableColumns: [{ id: 'materialId', label: 'Material', type: 'select', optionsSource: 'materials' }, { id: 'quantity', label: 'Cantidad', type: 'number' }] },
        { id: 'fotosHallazgos', label: 'Fotos hallazgos', type: ChecklistItemType.PHOTO },
        { id: 'observaciones', label: 'Observaciones', type: ChecklistItemType.TEXTAREA },
        { id: 'generarOS', label: 'Generar OS correctiva', type: ChecklistItemType.BOOLEAN, },
    ]
};


export const TASK_TYPE_TO_TEMPLATE_MAP: { [key: string]: ChecklistTemplate } = {
    'Mantenimiento preventivo de Aire Acondicionado': PLT_AA_PREV,
    'Reparación / Correctivo de Aire Acondicionado': PLT_AA_CORR,
    'Mantenimiento de Bomba Hidráulica de Agua Potable': PLT_HID_PREV,
    'Mantenimiento de Tableros Eléctricos': PLT_TAB_PREV,
    'Atención de Emergencia': PLT_EMG_ATENCION,
    'Inspección de Rutina': PLT_INS_RUTINA,
};