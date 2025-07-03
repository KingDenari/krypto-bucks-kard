
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Product, Transaction, Worker, Employee, ExchangeRate } from '@/types';
import { initialUsers, initialProducts } from '@/data/data';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  purchaseProduct: (studentId: string, productId: string, quantity: number, createdBy: string) => Promise<boolean>;
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

  // Load data from Supabase on component mount
  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      // Load users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
        const formattedUsers: User[] = usersData.map(user => ({
          id: user.id,
          name: user.name,
          email: '', // Not stored in Supabase table
          role: user.role as 'admin' | 'worker' | 'student',
          balance: parseFloat(user.balance?.toString() || '0'),
          barcode: user.barcode || '',
          grade: user.grade || '',
          secretCode: user.secret_code || '',
          createdAt: user.created_at || new Date().toISOString()
        }));
        setUsers(formattedUsers);
      }

      // Load products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData && productsData.length > 0) {
        const formattedProducts: Product[] = productsData.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price?.toString() || '0'),
          stock: product.stock || 0,
          category: product.category || '',
          createdAt: product.created_at || new Date().toISOString()
        }));
        setProducts(formattedProducts);
      }

      // Load transactions
      const { data: transactionsData } = await supabase.from('transactions').select('*');
      if (transactionsData && transactionsData.length > 0) {
        const formattedTransactions: Transaction[] = transactionsData.map(transaction => ({
          id: transaction.id,
          studentId: transaction.student_id || '',
          studentName: transaction.student_name,
          type: transaction.type as 'purchase' | 'deposit' | 'deduction' | 'transfer',
          amount: parseFloat(transaction.amount?.toString() || '0'),
          description: transaction.description,
          products: Array.isArray(transaction.products) ? transaction.products as { productId: string; productName: string; quantity: number; price: number }[] : [],
          createdAt: transaction.created_at || new Date().toISOString(),
          createdBy: 'system'
        }));
        setTransactions(formattedTransactions);
      }

      // Load exchange rate
      const { data: rateData } = await supabase.from('exchange_rates').select('*').order('updated_at', { ascending: false }).limit(1);
      if (rateData && rateData.length > 0) {
        setExchangeRate({
          kshToKrypto: parseFloat(rateData[0].ksh_to_krypto?.toString() || '0.5'),
          lastUpdated: rateData[0].updated_at || new Date().toISOString(),
          updatedBy: 'system'
        });
      }
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    }
  };

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

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updates } : user));
    
    // Update in Supabase
    try {
      await supabase
        .from('users')
        .update({
          name: updates.name,
          role: updates.role,
          balance: updates.balance,
          barcode: updates.barcode,
          grade: updates.grade,
          secret_code: updates.secretCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating user in Supabase:', error);
    }
  };

  const addUser = async (user: User) => {
    setUsers([...users, user]);
    
    // Add to Supabase
    try {
      await supabase
        .from('users')
        .insert({
          id: user.id,
          name: user.name,
          role: user.role,
          balance: user.balance,
          barcode: user.barcode,
          grade: user.grade,
          secret_code: user.secretCode,
          created_at: user.createdAt
        });
    } catch (error) {
      console.error('Error adding user to Supabase:', error);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    
    // Delete from Supabase
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  };

  const addProduct = async (product: Product) => {
    setProducts([...products, product]);
    
    // Add to Supabase
    try {
      await supabase
        .from('products')
        .insert({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          created_at: product.createdAt
        });
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(products.map(product => product.id === id ? { ...product, ...updates } : product));
    
    // Update in Supabase
    try {
      await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          stock: updates.stock,
          category: updates.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating product in Supabase:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    
    // Delete from Supabase
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    
    // Add to Supabase
    try {
      await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          student_id: transaction.studentId,
          student_name: transaction.studentName,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          products: transaction.products,
          created_at: transaction.createdAt
        });
    } catch (error) {
      console.error('Error adding transaction to Supabase:', error);
    }
  };

  const purchaseProduct = async (studentId: string, productId: string, quantity: number, createdBy: string): Promise<boolean> => {
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
    await updateUser(studentId, { balance: student.balance - totalAmount });

    // Update product stock
    await updateProduct(productId, { stock: product.stock - quantity });

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

    await addTransaction(transaction);

    // Create receipt in Supabase
    try {
      await supabase
        .from('receipts')
        .insert({
          student_id: studentId,
          transaction_id: transaction.id,
          receipt_data: {
            transactionId: transaction.id,
            studentId: studentId,
            studentName: student.name,
            grade: student.grade,
            amount: totalAmount,
            products: transaction.products,
            date: new Date().toISOString(),
            exchangeRate: exchangeRate.kshToKrypto
          }
        });
    } catch (error) {
      console.error('Error creating receipt in Supabase:', error);
    }

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

  const updateExchangeRate = async (rate: number, updatedBy: string) => {
    const newRate = {
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };
    
    setExchangeRate(newRate);
    
    // Update in Supabase
    try {
      await supabase
        .from('exchange_rates')
        .insert({
          ksh_to_krypto: rate,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating exchange rate in Supabase:', error);
    }
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
