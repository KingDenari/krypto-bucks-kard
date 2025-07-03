
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Product, Transaction, Worker, Employee, ExchangeRate } from '@/types';
import { initialUsers, initialProducts } from '@/data/data';

interface AppDataContextType {
  users: User[];
  products: Product[];
  transactions: Transaction[];
  workers: Worker[];
  employees: Employee[];
  exchangeRate: ExchangeRate;
  getUserBySecretCode: (secretCode: string) => User | undefined;
  getUserByBarcode: (barcode: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  transferKryptoBucks: (fromUserId: string, toUserId: string, amount: number, createdBy: string) => boolean;
  clearTransferHistory: () => void;
  clearSalesHistory: () => void;
  addWorker: (worker: Worker) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateExchangeRate: (rate: number, updatedBy: string) => void;
  factoryReset: () => void;
  purchaseProduct: (studentId: string, productId: string, quantity: number, createdBy: string) => boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : initialProducts;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  });
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const storedWorkers = localStorage.getItem('workers');
    return storedWorkers ? JSON.parse(storedWorkers) : [];
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const storedEmployees = localStorage.getItem('employees');
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  });
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>(() => {
    const storedRate = localStorage.getItem('exchangeRate');
    return storedRate ? JSON.parse(storedRate) : {
      kshToKrypto: 0.5,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    };
  });

  // Sync data across tabs/devices
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'users' && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
      if (e.key === 'products' && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
      if (e.key === 'transactions' && e.newValue) {
        setTransactions(JSON.parse(e.newValue));
      }
      if (e.key === 'workers' && e.newValue) {
        setWorkers(JSON.parse(e.newValue));
      }
      if (e.key === 'employees' && e.newValue) {
        setEmployees(JSON.parse(e.newValue));
      }
      if (e.key === 'exchangeRate' && e.newValue) {
        setExchangeRate(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    window.dispatchEvent(new StorageEvent('storage', { key: 'users', newValue: JSON.stringify(users) }));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    window.dispatchEvent(new StorageEvent('storage', { key: 'products', newValue: JSON.stringify(products) }));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    window.dispatchEvent(new StorageEvent('storage', { key: 'transactions', newValue: JSON.stringify(transactions) }));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('workers', JSON.stringify(workers));
    window.dispatchEvent(new StorageEvent('storage', { key: 'workers', newValue: JSON.stringify(workers) }));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
    window.dispatchEvent(new StorageEvent('storage', { key: 'employees', newValue: JSON.stringify(employees) }));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('exchangeRate', JSON.stringify(exchangeRate));
    window.dispatchEvent(new StorageEvent('storage', { key: 'exchangeRate', newValue: JSON.stringify(exchangeRate) }));
  }, [exchangeRate]);

  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(product => product.id === id ? { ...product, ...updates } : product));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const purchaseProduct = (studentId: string, productId: string, quantity: number, createdBy: string) => {
    const student = users.find(user => user.id === studentId);
    const product = products.find(p => p.id === productId);

    if (!student || !product || product.stock < quantity) {
      return false;
    }

    const totalAmount = product.price * quantity;
    if (student.balance < totalAmount) {
      return false;
    }

    // Update student balance
    updateUser(studentId, { balance: student.balance - totalAmount });

    // Update product stock
    updateProduct(productId, { stock: product.stock - quantity });

    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      studentId: studentId,
      studentName: student.name,
      type: 'purchase',
      amount: totalAmount,
      description: `Purchase of ${quantity} ${product.name}(s)`,
      products: [{
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price
      }],
      createdAt: new Date().toISOString(),
      createdBy: createdBy
    };

    addTransaction(transaction);
    return true;
  };

  const transferKryptoBucks = (fromUserId: string, toUserId: string, amount: number, createdBy: string) => {
    const fromUser = users.find(user => user.id === fromUserId);
    const toUser = users.find(user => user.id === toUserId);

    if (!fromUser || !toUser || fromUser.balance < amount) {
      return false;
    }

    const transferTransaction: Transaction = {
      id: Date.now().toString(),
      studentId: fromUserId,
      studentName: fromUser.name,
      type: 'transfer',
      amount: -amount,
      description: `Transfer to ${toUser.name}`,
      products: [],
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      transferTo: toUserId
    };

    const receiveTransaction: Transaction = {
      id: (Date.now() + 1).toString(),
      studentId: toUserId,
      studentName: toUser.name,
      type: 'transfer',
      amount: amount,
      description: `Transfer from ${fromUser.name}`,
      products: [],
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      transferFrom: fromUserId
    };

    setUsers(users.map(user => {
      if (user.id === fromUserId) {
        return { ...user, balance: user.balance - amount };
      } else if (user.id === toUserId) {
        return { ...user, balance: user.balance + amount };
      }
      return user;
    }));

    addTransaction(transferTransaction);
    addTransaction(receiveTransaction);
    return true;
  };

  const clearTransferHistory = () => {
    setTransactions(prev => prev.filter(t => t.type !== 'transfer'));
  };

  const clearSalesHistory = () => {
    setTransactions(prev => prev.filter(t => t.type !== 'purchase'));
  };

  const addWorker = (worker: Worker) => {
    setWorkers([...workers, worker]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(workers.map(worker => worker.id === id ? { ...worker, ...updates } : worker));
  };

  const deleteWorker = (id: string) => {
    setWorkers(workers.filter(worker => worker.id !== id));
  };

  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(employees.map(employee => employee.id === id ? { ...employee, ...updates } : employee));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(employee => employee.id !== id));
  };

  const updateExchangeRate = (rate: number, updatedBy: string) => {
    setExchangeRate({
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    });
  };

  const factoryReset = () => {
    setUsers(initialUsers);
    setProducts(initialProducts);
    setTransactions([]);
    setWorkers([]);
    setEmployees([]);
    setExchangeRate({
      kshToKrypto: 0.5,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    });
  };

  const value = {
    users,
    products,
    transactions,
    workers,
    employees,
    exchangeRate,
    getUserBySecretCode,
    getUserByBarcode,
    updateUser,
    addUser,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    transferKryptoBucks,
    clearTransferHistory,
    clearSalesHistory,
    addWorker,
    updateWorker,
    deleteWorker,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateExchangeRate,
    factoryReset,
    purchaseProduct,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
