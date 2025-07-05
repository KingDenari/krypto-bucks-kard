
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
  const [isInitialized, setIsInitialized] = useState(false);

  const { toast } = useToast();

  const refreshData = async () => {
    if (currentAccount) {
      await loadFromSupabase();
    }
  };

  const setCurrentAccount = (email: string) => {
    console.log('Setting current account to:', email);
    setCurrentAccountState(email);
    loadDataForAccount(email);
  };

  const loadDataForAccount = async (accountEmail: string) => {
    console.log('Loading data for account:', accountEmail);
    setIsInitialized(false);
    
    try {
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('account_email', accountEmail);

      if (!usersError && usersData && usersData.length > 0) {
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
        console.log('Loaded users from Supabase:', formattedUsers.length);
      } else {
        console.log('No users found in Supabase, using initial users');
        setUsers(initialUsers);
        await syncUsersToSupabase(initialUsers, accountEmail);
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('account_email', accountEmail);

      if (!productsError && productsData && productsData.length > 0) {
        const formattedProducts: Product[] = productsData.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price?.toString() || '0'),
          stock: product.stock || 0,
          category: product.category || '',
          createdAt: product.created_at || new Date().toISOString()
        }));
        setProducts(formattedProducts);
        console.log('Loaded products from Supabase:', formattedProducts.length);
      } else {
        console.log('No products found in Supabase, using initial products');
        setProducts(initialProducts);
        await syncProductsToSupabase(initialProducts, accountEmail);
      }

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_email', accountEmail)
        .order('created_at', { ascending: false });

      if (!transactionsError && transactionsData) {
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
        console.log('Loaded transactions from Supabase:', formattedTransactions.length);
      } else {
        setTransactions([]);
      }

      // Load exchange rate
      const { data: rateData, error: rateError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('account_email', accountEmail)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (!rateError && rateData && rateData.length > 0) {
        const newRate = {
          kshToKrypto: parseFloat(rateData[0].ksh_to_krypto?.toString() || '0.5'),
          lastUpdated: rateData[0].updated_at || new Date().toISOString(),
          updatedBy: 'system'
        };
        setExchangeRate(newRate);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const loadFromSupabase = async () => {
    if (currentAccount) {
      await loadDataForAccount(currentAccount);
    }
  };

  const syncUsersToSupabase = async (usersToSync: User[], accountEmail: string) => {
    try {
      await supabase.from('users').delete().eq('account_email', accountEmail);
      
      if (usersToSync.length > 0) {
        const userInserts = usersToSync.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          balance: user.balance,
          barcode: user.barcode,
          grade: user.grade,
          secret_code: user.secretCode,
          account_email: accountEmail,
          created_at: user.createdAt
        }));
        await supabase.from('users').insert(userInserts);
      }
    } catch (error) {
      console.error('Error syncing users:', error);
    }
  };

  const syncProductsToSupabase = async (productsToSync: Product[], accountEmail: string) => {
    try {
      await supabase.from('products').delete().eq('account_email', accountEmail);
      
      if (productsToSync.length > 0) {
        const productInserts = productsToSync.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          account_email: accountEmail,
          created_at: product.createdAt
        }));
        await supabase.from('products').insert(productInserts);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
    }
  };

  const syncTransactionsToSupabase = async (transactionsToSync: Transaction[], accountEmail: string) => {
    try {
      await supabase.from('transactions').delete().eq('account_email', accountEmail);
      
      if (transactionsToSync.length > 0) {
        const transactionInserts = transactionsToSync.map(transaction => ({
          id: transaction.id,
          student_id: transaction.studentId,
          student_name: transaction.studentName,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          products: transaction.products,
          account_email: accountEmail,
          created_at: transaction.createdAt
        }));
        await supabase.from('transactions').insert(transactionInserts);
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
    }
  };

  const syncExchangeRateToSupabase = async (rate: ExchangeRate, accountEmail: string) => {
    try {
      await supabase.from('exchange_rates').delete().eq('account_email', accountEmail);
      await supabase.from('exchange_rates').insert({
        ksh_to_krypto: rate.kshToKrypto,
        account_email: accountEmail,
        updated_at: rate.lastUpdated
      });
    } catch (error) {
      console.error('Error syncing exchange rate:', error);
    }
  };

  // Sync data whenever it changes
  useEffect(() => {
    if (currentAccount && isInitialized) {
      const timeoutId = setTimeout(() => {
        syncUsersToSupabase(users, currentAccount);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [users, currentAccount, isInitialized]);

  useEffect(() => {
    if (currentAccount && isInitialized) {
      const timeoutId = setTimeout(() => {
        syncProductsToSupabase(products, currentAccount);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [products, currentAccount, isInitialized]);

  useEffect(() => {
    if (currentAccount && isInitialized) {
      const timeoutId = setTimeout(() => {
        syncTransactionsToSupabase(transactions, currentAccount);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, currentAccount, isInitialized]);

  useEffect(() => {
    if (currentAccount && isInitialized) {
      const timeoutId = setTimeout(() => {
        syncExchangeRateToSupabase(exchangeRate, currentAccount);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [exchangeRate, currentAccount, isInitialized]);

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

  const updateExchangeRate = (rate: number, updatedBy: string) => {
    const newRate = {
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };
    setExchangeRate(newRate);
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
