
import React, { useState, useMemo, createContext, useEffect } from 'react';
import { User, Role, Task, Equipment, MaterialCatalogItem, MaterialInventoryItem, MaterialPurchaseLog, TaskStatus } from './types';
import { AuthContext } from './context/AuthContext';
import { MOCK_USERS, MOCK_TASKS, MOCK_EQUIPMENT, MOCK_MATERIAL_CATALOG, MOCK_MATERIAL_INVENTORY, MOCK_MATERIAL_PURCHASE_LOGS } from './constants';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';

// --- Data Context for reactive state management ---
interface DataContextType {
  tasks: Task[];
  equipment: Equipment[];
  materialCatalog: MaterialCatalogItem[];
  materialInventory: MaterialInventoryItem[];
  materialPurchaseLogs: MaterialPurchaseLog[];
  updateTask: (updatedTask: Task) => void;
  addTask: (newTask: Task) => void;
  // Catalog functions
  addCatalogItem: (newItem: MaterialCatalogItem) => void;
  updateCatalogItem: (updatedItem: MaterialCatalogItem) => void;
  deleteCatalogItem: (itemId: string) => void;
  // Inventory functions
  addMaterialPurchase: (purchaseLog: Omit<MaterialPurchaseLog, 'id'>) => void;
}
export const DataContext = createContext<DataContextType>({} as DataContextType);
// ----------------------------------------------------

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [materialCatalog, setMaterialCatalog] = useState<MaterialCatalogItem[]>(MOCK_MATERIAL_CATALOG);
  const [materialInventory, setMaterialInventory] = useState<MaterialInventoryItem[]>(MOCK_MATERIAL_INVENTORY);
  const [materialPurchaseLogs, setMaterialPurchaseLogs] = useState<MaterialPurchaseLog[]>(MOCK_MATERIAL_PURCHASE_LOGS);


  // This effect ensures that the history array on each piece of equipment
  // is always up-to-date when the global list of tasks changes.
  useEffect(() => {
    setEquipment(prevEquipment => {
        return prevEquipment.map(eq => ({
            ...eq,
            history: tasks.filter(t => t.equipmentId === eq.id)
                          .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())
        }));
    });
  }, [tasks]);

  const login = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateTask = (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    // Check if status changed to COMPLETED to deduct stock
    if (oldTask && oldTask.status !== TaskStatus.COMPLETED && updatedTask.status === TaskStatus.COMPLETED) {
        if (updatedTask.materials && updatedTask.materials.length > 0) {
            setMaterialInventory(currentInventory => {
                const newInventory = JSON.parse(JSON.stringify(currentInventory)); // Deep copy
                updatedTask.materials!.forEach(usedMat => {
                    const itemIndex = newInventory.findIndex((invItem: MaterialInventoryItem) => invItem.materialId === usedMat.materialId);
                    if (itemIndex > -1) {
                        const newStock = newInventory[itemIndex].stock - usedMat.quantity;
                        if (newStock < 0) {
                            console.warn(`Stock for ${usedMat.materialId} has gone negative. Setting to 0.`);
                            newInventory[itemIndex].stock = 0;
                        } else {
                            newInventory[itemIndex].stock = newStock;
                        }
                    } else {
                        console.warn(`Material ${usedMat.materialId} used in task but not found in inventory.`);
                    }
                });
                return newInventory;
            });
        }
    }
    
    setTasks(currentTasks => 
      currentTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };
  
  const addTask = (newTask: Task) => {
    setTasks(currentTasks => [...currentTasks, newTask]);
  };
  
  const addCatalogItem = (newItem: MaterialCatalogItem) => {
      setMaterialCatalog(prev => [...prev, newItem]);
  };
  
  const updateCatalogItem = (updatedItem: MaterialCatalogItem) => {
      setMaterialCatalog(prev => prev.map(m => m.id === updatedItem.id ? updatedItem : m));
  };
  
  const deleteCatalogItem = (itemId: string) => {
      setMaterialCatalog(prev => prev.filter(m => m.id !== itemId));
  };
  
  const addMaterialPurchase = (purchaseLog: Omit<MaterialPurchaseLog, 'id'>) => {
    const newLogEntry: MaterialPurchaseLog = {
        ...purchaseLog,
        id: `purch-${Date.now()}`
    };
    setMaterialPurchaseLogs(prev => [...prev, newLogEntry]);

    setMaterialInventory(prev => {
        const newInventory = [...prev];
        const itemIndex = newInventory.findIndex(item => item.materialId === purchaseLog.materialId);

        if (itemIndex > -1) {
            newInventory[itemIndex] = {
                ...newInventory[itemIndex],
                stock: newInventory[itemIndex].stock + purchaseLog.quantity,
            };
        } else {
            newInventory.push({
                materialId: purchaseLog.materialId,
                stock: purchaseLog.quantity,
            });
        }
        return newInventory;
    });
  };


  const authContextValue = useMemo(
    () => ({
      user: currentUser,
      login,
      logout,
    }),
    [currentUser]
  );
  
  const dataContextValue = useMemo(() => ({
    tasks,
    equipment,
    materialCatalog,
    materialInventory,
    materialPurchaseLogs,
    updateTask,
    addTask,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    addMaterialPurchase,
  }), [tasks, equipment, materialCatalog, materialInventory, materialPurchaseLogs]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <DataContext.Provider value={dataContextValue}>
        <div className="min-h-screen bg-gray-100">
          {currentUser ? <MainLayout /> : <LoginScreen />}
        </div>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;