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
  purchaseProduct: (studentId: string, productId: string, quantity: number, createdBy: string) => Promise<boolean>;
  clearStudentTransactions: (studentId: string) => void;
  setCurrentAccount: (email: string) => void;
  refreshData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccount, setCurrentAccountState] = useState<string | null>(() => {
    return localStorage.getItem('currentAccount') || null;
  });
  
  const getStorageKey = (key: string) => {
    return currentAccount ? `${currentAccount}_${key}` : key;
  };

  const [users, setUsers] = useState<User[]>(() => {
    const storageKey = getStorageKey('users');
    const storedUsers = localStorage.getItem(storageKey);
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const storageKey = getStorageKey('products');
    const storedProducts = localStorage.getItem(storageKey);
    return storedProducts ? JSON.parse(storedProducts) : initialProducts;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storageKey = getStorageKey('transactions');
    const storedTransactions = localStorage.getItem(storageKey);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  });
  
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const storageKey = getStorageKey('workers');
    const storedWorkers = localStorage.getItem(storageKey);
    return storedWorkers ? JSON.parse(storedWorkers) : [];
  });
  
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const storageKey = getStorageKey('employees');
    const storedEmployees = localStorage.getItem(storageKey);
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  });
  
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>(() => {
    const storageKey = getStorageKey('exchangeRate');
    const storedRate = localStorage.getItem(storageKey);
    return storedRate ? JSON.parse(storedRate) : {
      kshToKrypto: 0.5,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    };
  });

  const refreshData = async () => {
    if (currentAccount) {
      await loadFromSupabase();
    }
  };

  const setCurrentAccount = (email: string) => {
    setCurrentAccountState(email);
    localStorage.setItem('currentAccount', email);
    
    // Load data from Supabase immediately after setting account
    if (email) {
      setTimeout(() => {
        loadFromSupabase();
      }, 100);
    }
  };

  // Enhanced Supabase sync functions with better error handling
  const syncToSupabase = async () => {
    if (!currentAccount) return;
    
    try {
      console.log('Syncing data to Supabase for account:', currentAccount);
      
      // Sync users with proper type handling
      for (const user of users) {
        await supabase.from('users').upsert({
          id: user.id,
          name: user.name,
          role: user.role,
          balance: user.balance,
          barcode: user.barcode,
          grade: user.grade,
          secret_code: user.secretCode,
          account_email: currentAccount,
          created_at: user.createdAt
        });
      }

      // Sync products
      for (const product of products) {
        await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          account_email: currentAccount,
          created_at: product.createdAt
        });
      }

      // Sync transactions
      for (const transaction of transactions) {
        await supabase.from('transactions').upsert({
          id: transaction.id,
          student_id: transaction.studentId,
          student_name: transaction.studentName,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          products: transaction.products,
          account_email: currentAccount,
          created_at: transaction.createdAt
        });
      }

      // Sync exchange rate
      await supabase.from('exchange_rates').upsert({
        ksh_to_krypto: exchangeRate.kshToKrypto,
        account_email: currentAccount,
        updated_at: exchangeRate.lastUpdated
      });

      console.log('Successfully synced data to Supabase');
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const loadFromSupabase = async () => {
    if (!currentAccount) return;
    
    try {
      console.log('Loading data from Supabase for account:', currentAccount);
      
      // Load users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .eq('account_email', currentAccount);
        
      if (usersData && usersData.length > 0) {
        const formattedUsers: User[] = usersData.map(user => ({
          id: user.id,
          name: user.name,
          email: '',
          role: user.role as 'admin' | 'worker' | 'student',
          balance: parseFloat(user.balance?.toString() || '0'),
          barcode: user.barcode || '',
          grade: user.grade || '',
          secretCode: user.secret_code || '',
          createdAt: user.created_at || new Date().toISOString()
        }));
        setUsers(formattedUsers);
        localStorage.setItem(getStorageKey('users'), JSON.stringify(formattedUsers));
        console.log('Loaded users from Supabase:', formattedUsers);
      }

      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('account_email', currentAccount);
        
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
        localStorage.setItem(getStorageKey('products'), JSON.stringify(formattedProducts));
        console.log('Loaded products from Supabase:', formattedProducts);
      }

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_email', currentAccount)
        .order('created_at', { ascending: false });
        
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
        localStorage.setItem(getStorageKey('transactions'), JSON.stringify(formattedTransactions));
        console.log('Loaded transactions from Supabase:', formattedTransactions);
      }

      // Load exchange rate
      const { data: rateData } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('account_email', currentAccount)
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (rateData && rateData.length > 0) {
        const newRate = {
          kshToKrypto: parseFloat(rateData[0].ksh_to_krypto?.toString() || '0.5'),
          lastUpdated: rateData[0].updated_at || new Date().toISOString(),
          updatedBy: 'system'
        };
        setExchangeRate(newRate);
        localStorage.setItem(getStorageKey('exchangeRate'), JSON.stringify(newRate));
        console.log('Loaded exchange rate from Supabase:', newRate);
      }

      console.log('Successfully loaded all data from Supabase');
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    }
  };

  // Load data from Supabase on component mount and account change
  useEffect(() => {
    if (currentAccount) {
      loadFromSupabase();
    }
  }, [currentAccount]);

  // Auto-sync data changes to Supabase with debounce
  useEffect(() => {
    if (currentAccount) {
      const timeoutId = setTimeout(() => {
        syncToSupabase();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [users, products, transactions, exchangeRate, currentAccount]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey('users') && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
      if (e.key === getStorageKey('products') && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
      if (e.key === getStorageKey('transactions') && e.newValue) {
        setTransactions(JSON.parse(e.newValue));
      }
      if (e.key === getStorageKey('workers') && e.newValue) {
        setWorkers(JSON.parse(e.newValue));
      }
      if (e.key === getStorageKey('employees') && e.newValue) {
        setEmployees(JSON.parse(e.newValue));
      }
      if (e.key === getStorageKey('exchangeRate') && e.newValue) {
        setExchangeRate(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('users');
    localStorage.setItem(storageKey, JSON.stringify(users));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(users) }));
  }, [users, currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('products');
    localStorage.setItem(storageKey, JSON.stringify(products));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(products) }));
  }, [products, currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('transactions');
    localStorage.setItem(storageKey, JSON.stringify(transactions));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(transactions) }));
  }, [transactions, currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('workers');
    localStorage.setItem(storageKey, JSON.stringify(workers));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(workers) }));
  }, [workers, currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('employees');
    localStorage.setItem(storageKey, JSON.stringify(employees));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(employees) }));
  }, [employees, currentAccount]);

  useEffect(() => {
    const storageKey = getStorageKey('exchangeRate');
    localStorage.setItem(storageKey, JSON.stringify(exchangeRate));
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(exchangeRate) }));
  }, [exchangeRate, currentAccount]);

  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => user.id === id ? { ...user, ...updates } : user);
    setUsers(updatedUsers);
    
    // Sync to Supabase immediately for user updates
    if (currentAccount) {
      try {
        const userToUpdate = updatedUsers.find(u => u.id === id);
        if (userToUpdate) {
          await supabase
            .from('users')
            .upsert({
              id: userToUpdate.id,
              name: userToUpdate.name,
              role: userToUpdate.role,
              balance: userToUpdate.balance,
              barcode: userToUpdate.barcode,
              grade: userToUpdate.grade,
              secret_code: userToUpdate.secretCode,
              account_email: currentAccount,
              updated_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error updating user in Supabase:', error);
      }
    }
  };

  const addUser = async (user: User) => {
    setUsers([...users, user]);
    
    // Add to Supabase immediately
    if (currentAccount) {
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
            account_email: currentAccount,
            created_at: user.createdAt
          });
      } catch (error) {
        console.error('Error adding user to Supabase:', error);
      }
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    
    // Delete from Supabase immediately
    if (currentAccount) {
      try {
        await supabase.from('users').delete().eq('id', id).eq('account_email', currentAccount);
      } catch (error) {
        console.error('Error deleting user from Supabase:', error);
      }
    }
  };

  const addProduct = async (product: Product) => {
    setProducts([...products, product]);
    
    // Add to Supabase immediately
    if (currentAccount) {
      try {
        await supabase
          .from('products')
          .insert({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            account_email: currentAccount,
            created_at: product.createdAt
          });
      } catch (error) {
        console.error('Error adding product to Supabase:', error);
      }
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product => product.id === id ? { ...product, ...updates } : product);
    setProducts(updatedProducts);
    
    // Sync to Supabase immediately for product updates
    if (currentAccount) {
      try {
        const productToUpdate = updatedProducts.find(p => p.id === id);
        if (productToUpdate) {
          await supabase
            .from('products')
            .upsert({
              id: productToUpdate.id,
              name: productToUpdate.name,
              price: productToUpdate.price,
              stock: productToUpdate.stock,
              category: productToUpdate.category,
              account_email: currentAccount,
              updated_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error updating product in Supabase:', error);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    
    // Delete from Supabase immediately
    if (currentAccount) {
      try {
        await supabase.from('products').delete().eq('id', id).eq('account_email', currentAccount);
      } catch (error) {
        console.error('Error deleting product from Supabase:', error);
      }
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    
    // Add to Supabase immediately
    if (currentAccount) {
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
            account_email: currentAccount,
            created_at: transaction.createdAt
          });
      } catch (error) {
        console.error('Error adding transaction to Supabase:', error);
      }
    }
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

  const clearStudentTransactions = (studentId: string) => {
    setTransactions(prev => prev.filter(t => t.studentId !== studentId));
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
    
    // Update in Supabase immediately
    if (currentAccount) {
      try {
        await supabase
          .from('exchange_rates')
          .insert({
            ksh_to_krypto: rate,
            account_email: currentAccount,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error updating exchange rate in Supabase:', error);
      }
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
    if (currentAccount) {
      try {
        await supabase
          .from('receipts')
          .insert({
            student_id: studentId,
            transaction_id: transaction.id,
            account_email: currentAccount,
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
    }

    return true;
  };

  const factoryReset = () => {
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
    
    // Clear account-specific localStorage
    if (currentAccount) {
      const keys = ['users', 'products', 'transactions', 'workers', 'employees', 'exchangeRate'];
      keys.forEach(key => {
        localStorage.removeItem(getStorageKey(key));
      });
    }
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
    addWorker: (worker: Worker) => setWorkers([...workers, worker]),
    updateWorker: (id: string, updates: Partial<Worker>) => setWorkers(workers.map(worker => worker.id === id ? { ...worker, ...updates } : worker)),
    deleteWorker: (id: string) => setWorkers(workers.filter(worker => worker.id !== id)),
    addEmployee: (employee: Employee) => setEmployees([...employees, employee]),
    updateEmployee: (id: string, updates: Partial<Employee>) => setEmployees(employees.map(employee => employee.id === id ? { ...employee, ...updates } : employee)),
    deleteEmployee: (id: string) => setEmployees(employees.filter(employee => employee.id !== id)),
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
