import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Product, Transaction, Worker, Employee, ExchangeRate } from '@/types';
import { initialUsers, initialProducts } from '@/data/data';
import { toast } from '@/hooks/use-toast';

interface AppDataContextType {
  users: User[];
  products: Product[];
  transactions: Transaction[];
  workers: Worker[];
  employees: Employee[];
  exchangeRate: ExchangeRate;
  currentAccount: string | null;
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
  clearStudentTransactions: (studentId: string) => void;
  setCurrentAccount: (email: string) => void;
  refreshData: () => void;
  
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccount, setCurrentAccountState] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    kshToKrypto: 0.5,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system'
  });
  // Save data to localStorage
  const saveDataToStorage = (accountEmail: string) => {
    const accountData = {
      users,
      products,
      transactions,
      workers,
      employees,
      exchangeRate
    };
    localStorage.setItem(`kbucks_data_${accountEmail}`, JSON.stringify(accountData));
  };

  // Load data from localStorage
  const loadDataFromStorage = (accountEmail: string) => {
    const savedData = localStorage.getItem(`kbucks_data_${accountEmail}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setUsers(data.users || []);
        setProducts(data.products || []);
        setTransactions(data.transactions || []);
        setWorkers(data.workers || []);
        setEmployees(data.employees || []);
        setExchangeRate(data.exchangeRate || {
          kshToKrypto: 0.5,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'system'
        });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // Load default data if parsing fails
        setUsers([]);
        setProducts([]);
        setTransactions([]);
        setWorkers([]);
        setEmployees([]);
        setExchangeRate({
          kshToKrypto: 0.5,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'system'
        });
      }
    } else {
      // No saved data, use empty arrays
      setUsers([]);
      setProducts([]);
      setTransactions([]);
      setWorkers([]);
      setEmployees([]);
      setExchangeRate({
        kshToKrypto: 0.5,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      });
    }
  };

  const refreshData = () => {
    if (currentAccount) {
      loadDataFromStorage(currentAccount);
    }
  };

  const setCurrentAccount = (email: string) => {
    // Save current account's data before switching
    if (currentAccount) {
      saveDataToStorage(currentAccount);
    }
    
    setCurrentAccountState(email);
    localStorage.setItem('kbucks_current_account', email);
    loadDataFromStorage(email);
  };

  // Load current account from localStorage on app start
  useEffect(() => {
    const savedAccount = localStorage.getItem('kbucks_current_account');
    if (savedAccount && !currentAccount) {
      setCurrentAccountState(savedAccount);
      loadDataFromStorage(savedAccount);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (currentAccount) {
      saveDataToStorage(currentAccount);
    }
  }, [users, products, transactions, workers, employees, exchangeRate, currentAccount]);



  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    toast({
      title: "Student updated",
      description: "Student information has been updated successfully.",
    });
  };

  const addUser = (user: User) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding students",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => [...prev, user]);
    toast({
      title: "Student added",
      description: "New student has been added successfully.",
    });
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast({
      title: "Student deleted",
      description: "Student has been removed successfully.",
    });
  };

  const addProduct = (product: Product) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding products",
        variant: "destructive",
      });
      return;
    }

    setProducts(prev => [...prev, product]);
    toast({
      title: "Product added",
      description: "New product has been added successfully.",
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => product.id === id ? { ...product, ...updates } : product));
    toast({
      title: "Product updated",
      description: "Product information has been updated successfully.",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast({
      title: "Product deleted",
      description: "Product has been removed successfully.",
    });
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
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

    setUsers(prev => prev.map(user => {
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

  const clearStudentTransactions = (studentId: string) => {
    setTransactions(prev => prev.filter(t => t.studentId !== studentId));
  };

  const addWorker = (worker: Worker) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding workers",
        variant: "destructive",
      });
      return;
    }

    setWorkers([...workers, worker]);
    toast({
      title: "Worker added",
      description: "New worker has been added successfully.",
    });
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(workers.map(worker => worker.id === id ? { ...worker, ...updates } : worker));
    toast({
      title: "Worker updated",
      description: "Worker information has been updated successfully.",
    });
  };

  const deleteWorker = (id: string) => {
    setWorkers(workers.filter(worker => worker.id !== id));
    toast({
      title: "Worker deleted",
      description: "Worker has been removed successfully.",
    });
  };

  const addEmployee = (employee: Employee) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding employees",
        variant: "destructive",
      });
      return;
    }

    setEmployees([...employees, employee]);
    toast({
      title: "Employee added",
      description: "New employee has been added successfully.",
    });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(employees.map(employee => employee.id === id ? { ...employee, ...updates } : employee));
    toast({
      title: "Employee updated",
      description: "Employee information has been updated successfully.",
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(employee => employee.id !== id));
    toast({
      title: "Employee deleted",
      description: "Employee has been removed successfully.",
    });
  };

  const updateExchangeRate = (rate: number, updatedBy: string) => {
    const newRate = {
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };
    setExchangeRate(newRate);
    toast({
      title: "Exchange rate updated",
      description: "Exchange rate has been updated successfully.",
    });
  };

  const purchaseProduct = (studentId: string, productId: string, quantity: number, createdBy: string): boolean => {
    const student = users.find(user => user.id === studentId);
    const product = products.find(p => p.id === productId);

    if (!student || !product || product.stock < quantity) {
      return false;
    }

    const totalAmount = product.price * quantity;
    if (student.balance < totalAmount) {
      return false;
    }

    // Update student balance and product stock
    updateUser(studentId, { balance: student.balance - totalAmount });
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
    currentAccount,
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
    clearStudentTransactions,
    addWorker,
    updateWorker,
    deleteWorker,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateExchangeRate,
    factoryReset,
    purchaseProduct,
    setCurrentAccount,
    refreshData,
    
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