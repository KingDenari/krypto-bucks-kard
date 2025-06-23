import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Transaction, ExchangeRate } from '@/types';

interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface AppDataContextType {
  users: User[];
  products: Product[];
  transactions: Transaction[];
  employees: Employee[];
  exchangeRate: ExchangeRate;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addTransaction: (transaction: Transaction) => void;
  getUserByBarcode: (barcode: string) => User | undefined;
  getUserBySecretCode: (secretCode: string) => User | undefined;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  deleteEmployee: (employeeId: string) => void;
  updateExchangeRate: (rate: number, updatedBy: string) => void;
  transferKryptoBucks: (fromUserId: string, toUserId: string, amount: number, transferredBy: string) => boolean;
  // Keep workers for backward compatibility during transition
  workers: Employee[];
  addWorker: (worker: Employee) => void;
  updateWorker: (workerId: string, updates: Partial<Employee>) => void;
  deleteWorker: (workerId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

interface AppDataProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('krypto-users', []));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('krypto-products', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('krypto-transactions', []));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('krypto-employees', []));
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>(() => 
    loadFromStorage('krypto-exchange-rate', {
      kshToKrypto: 51,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    })
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('krypto-users', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('krypto-products', products);
  }, [products]);

  useEffect(() => {
    saveToStorage('krypto-transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage('krypto-employees', employees);
  }, [employees]);

  useEffect(() => {
    saveToStorage('krypto-exchange-rate', exchangeRate);
  }, [exchangeRate]);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    
    // Update user balance if it's a purchase, deposit, or deduction
    if (transaction.type === 'purchase' || transaction.type === 'deduction') {
      const user = users.find(u => u.id === transaction.studentId);
      if (user) {
        updateUser(transaction.studentId, { 
          balance: user.balance - transaction.amount 
        });
      }
    } else if (transaction.type === 'deposit') {
      const user = users.find(u => u.id === transaction.studentId);
      if (user) {
        updateUser(transaction.studentId, { 
          balance: user.balance + transaction.amount 
        });
      }
    }

    // Update product stock for purchases
    if (transaction.type === 'purchase' && transaction.products) {
      transaction.products.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct(item.productId, { stock: product.stock - item.quantity });
        }
      });
    }
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const transferKryptoBucks = (fromUserId: string, toUserId: string, amount: number, transferredBy: string) => {
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser || fromUser.balance < amount) {
      return false;
    }

    // Update balances
    updateUser(fromUserId, { balance: fromUser.balance - amount });
    updateUser(toUserId, { balance: toUser.balance + amount });

    // Add transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      studentId: fromUserId,
      studentName: fromUser.name,
      type: 'transfer',
      amount: -amount,
      description: `Transfer to ${toUser.name}`,
      transferTo: toUserId,
      createdAt: new Date().toISOString(),
      createdBy: transferredBy,
    };

    // Add corresponding transaction for recipient
    const recipientTransaction: Transaction = {
      id: (Date.now() + 1).toString(),
      studentId: toUserId,
      studentName: toUser.name,
      type: 'transfer',
      amount: amount,
      description: `Transfer from ${fromUser.name}`,
      transferFrom: fromUserId,
      createdAt: new Date().toISOString(),
      createdBy: transferredBy,
    };

    setTransactions(prev => [...prev, transaction, recipientTransaction]);
    return true;
  };

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(employee => 
      employee.id === employeeId ? { ...employee, ...updates } : employee
    ));
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== employeeId));
  };

  const updateExchangeRate = (rate: number, updatedBy: string) => {
    setExchangeRate({
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy
    });
  };

  const value = {
    users,
    products,
    transactions,
    employees,
    exchangeRate,
    addUser,
    updateUser,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    getUserByBarcode,
    getUserBySecretCode,
    transferKryptoBucks,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateExchangeRate,
    // Backward compatibility aliases
    workers: employees,
    addWorker: addEmployee,
    updateWorker: updateEmployee,
    deleteWorker: deleteEmployee,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
