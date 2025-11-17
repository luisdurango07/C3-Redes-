import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Role } from '../types';
import Dashboard from './Dashboard';
import UsersManagement from './UsersManagement';
import CalendarView from './CalendarView';
import TechnicianTasks from './TechnicianTasks';
import EquipmentHistory from './EquipmentHistory';
import TaskTypesManagement from './TaskTypesManagement';
import ServiceTypesManagement from './ServiceTypesManagement';
import StoresManagement from './StoresManagement';
import EquipmentManagement from './EquipmentManagement';
import Reports from './Reports';
import ToolsManagement from './ToolsManagement';
import MaterialsManagement from './MaterialsManagement'; // Import new component
import { CalendarIcon, DashboardIcon, LogoutIcon, MenuIcon, UsersIcon, XIcon, WrenchIcon, HistoryIcon, ClipboardListIcon, StoreIcon, ChartBarIcon, ToolsIcon, CogIcon, PackageIcon } from './Icons';

const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [techViewKey, setTechViewKey] = useState(0); // Key to force remount TechnicianTasks

  const renderView = () => {
    if (user?.role === Role.TECHNICIAN) {
      // Using a key ensures the component remounts and resets state when the key changes
      return <TechnicianTasks key={techViewKey} />;
    }
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'calendar':
        return <CalendarView />;
      case 'stores':
        return <StoresManagement />;
      case 'equipment_management':
        return <EquipmentManagement />;
      case 'tools_management':
        return <ToolsManagement />;
      case 'materials':
        return <MaterialsManagement />;
      case 'equipment_history':
        return <EquipmentHistory />;
      case 'reports':
        return <Reports />;
      case 'servicetypes':
        return user?.role === Role.SUPER_ADMIN ? <ServiceTypesManagement /> : <Dashboard setActiveView={setActiveView}/>;
      case 'tasktypes':
        return user?.role === Role.SUPER_ADMIN ? <TaskTypesManagement /> : <Dashboard setActiveView={setActiveView}/>;
      case 'users':
        return user?.role === Role.SUPER_ADMIN ? <UsersManagement /> : <Dashboard setActiveView={setActiveView}/>;
      default:
        return <Dashboard setActiveView={setActiveView}/>;
    }
  };
  
  const NavItem = ({ icon, label, viewName, isTechHomeReset = false }: { icon: React.ReactElement, label: string, viewName: string, isTechHomeReset?: boolean }) => (
    <button
      onClick={() => {
        setActiveView(viewName);
        if (isTechHomeReset) {
          setTechViewKey(prev => prev + 1); // Increment key to force remount
        }
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-lg transition-colors duration-200 ${
        activeView === viewName ? 'bg-brand-accent text-brand-blue font-bold rounded-lg' : 'text-white hover:bg-brand-blue-light rounded-lg'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );

  const getHeaderTitle = () => {
    if (user?.role === Role.TECHNICIAN) return 'Mis Tareas';
    
    const viewTitles: { [key: string]: string } = {
        dashboard: 'Panel Principal',
        calendar: 'Calendario',
        stores: 'Gestión de Tiendas',
        equipment_management: 'Gestión de Equipos',
        tools_management: 'Gestión de Herramientas',
        materials: 'Gestión de Materiales',
        equipment_history: 'Historial de OS',
        reports: 'Reportes',
        servicetypes: 'Tipos de Servicio',
        tasktypes: 'Tipos de Tarea',
        users: 'Gestión de Usuarios'
    };
    return viewTitles[activeView] || 'Panel Principal';
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`absolute inset-y-0 left-0 z-30 w-64 px-4 py-8 overflow-y-auto transition duration-300 ease-in-out transform bg-brand-blue md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">C3 Redes</h2>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}><XIcon className="w-6 h-6 text-white"/></button>
        </div>
        <nav className="mt-10 space-y-2">
            {user?.role === Role.TECHNICIAN && <NavItem icon={<WrenchIcon className="w-6 h-6"/>} label="Mis Tareas" viewName="tasks" isTechHomeReset={true}/>}

            {user?.role !== Role.TECHNICIAN && <NavItem icon={<DashboardIcon className="w-6 h-6"/>} label="Panel Principal" viewName="dashboard"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<CalendarIcon className="w-6 h-6"/>} label="Calendario" viewName="calendar"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<StoreIcon className="w-6 h-6"/>} label="Tiendas" viewName="stores"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<WrenchIcon className="w-6 h-6"/>} label="Equipos" viewName="equipment_management"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<ToolsIcon className="w-6 h-6"/>} label="Herramientas" viewName="tools_management"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<HistoryIcon className="w-6 h-6"/>} label="Historial de OS" viewName="equipment_history"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<ChartBarIcon className="w-6 h-6"/>} label="Reportes" viewName="reports"/>}
            {user?.role !== Role.TECHNICIAN && <NavItem icon={<PackageIcon className="w-6 h-6"/>} label="Materiales" viewName="materials"/>}
            
            {user?.role === Role.SUPER_ADMIN && <NavItem icon={<CogIcon className="w-6 h-6"/>} label="Tipos de Servicio" viewName="servicetypes"/>}
            {user?.role === Role.SUPER_ADMIN && <NavItem icon={<ClipboardListIcon className="w-6 h-6"/>} label="Tipos de Tarea" viewName="tasktypes"/>}
            {user?.role === Role.SUPER_ADMIN && <NavItem icon={<UsersIcon className="w-6 h-6"/>} label="Usuarios" viewName="users"/>}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 md:hidden focus:outline-none">
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">{getHeaderTitle()}</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">Hola, {user?.name.split(' ')[0]}</span>
            <button onClick={logout} className="p-2 text-red-500 transition-colors duration-200 bg-red-100 rounded-full hover:bg-red-200">
              <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto lg:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;