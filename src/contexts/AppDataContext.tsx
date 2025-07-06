
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Product, Transaction, Worker, Employee, ExchangeRate } from '@/types';
import { initialUsers, initialProducts } from '@/data/data';
import { supabase } from '@/integrations/supabase/client';

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
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
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
  exportToCSV: (type: 'users' | 'products') => void;
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

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`kbucks_${currentAccount}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = (key: string) => {
    try {
      const stored = localStorage.getItem(`kbucks_${currentAccount}_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  const saveToCSVFile = (type: 'users' | 'products', data: User[] | Product[]) => {
    if (currentAccount === 'kbucks@admin.com') {
      try {
        localStorage.setItem(`csv_${type}`, JSON.stringify(data));
        console.log(`Saved ${type} data to CSV storage`);
      } catch (error) {
        console.error(`Error saving ${type} to CSV:`, error);
      }
    }
  };

  const loadFromCSVFile = (type: 'users' | 'products') => {
    if (currentAccount === 'kbucks@admin.com') {
      try {
        const stored = localStorage.getItem(`csv_${type}`);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error(`Error loading ${type} from CSV:`, error);
        return null;
      }
    }
    return null;
  };

  const saveData = async () => {
    if (!currentAccount || !isInitialized) return;
    
    console.log('Saving data for account:', currentAccount);
    
    try {
      // Save to CSV if admin account
      if (currentAccount === 'kbucks@admin.com') {
        saveToCSVFile('users', users);
        saveToCSVFile('products', products);
      }

      // Try to save to Supabase first
      await Promise.all([
        syncUsersToSupabase(users, currentAccount),
        syncProductsToSupabase(products, currentAccount),
        syncTransactionsToSupabase(transactions, currentAccount),
        syncExchangeRateToSupabase(exchangeRate, currentAccount)
      ]);
      
      // Also save to localStorage as backup
      saveToLocalStorage('users', users);
      saveToLocalStorage('products', products);
      saveToLocalStorage('transactions', transactions);
      saveToLocalStorage('exchangeRate', exchangeRate);
      
      console.log('Data saved successfully to Supabase');
      
    } catch (error) {
      console.error('Error saving to Supabase, falling back to localStorage:', error);
      
      // Fallback to localStorage only
      saveToLocalStorage('users', users);
      saveToLocalStorage('products', products);
      saveToLocalStorage('transactions', transactions);
      saveToLocalStorage('exchangeRate', exchangeRate);
    }
  };

  const exportToCSV = (type: 'users' | 'products') => {
    let csvContent = '';
    let filename = '';
    
    if (type === 'users') {
      const students = users.filter(u => u.role === 'student');
      csvContent = 'Name,Email,Grade,Balance,Barcode,Secret Code,Created At\n';
      students.forEach(user => {
        csvContent += `"${user.name}","${user.email}","${user.grade || ''}",${user.balance},"${user.barcode}","${user.secretCode}","${user.createdAt}"\n`;
      });
      filename = 'students.csv';
    } else if (type === 'products') {
      csvContent = 'Name,Price,Stock,Category,Created At\n';
      products.forEach(product => {
        csvContent += `"${product.name}",${product.price},${product.stock},"${product.category}","${product.createdAt}"\n`;
      });
      filename = 'products.csv';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshData = async () => {
    if (currentAccount) {
      console.log('Refreshing data for account:', currentAccount);
      await loadDataForAccount(currentAccount);
    }
  };

  const setCurrentAccount = (email: string) => {
    console.log('Setting current account to:', email);
    setCurrentAccountState(email);
    localStorage.setItem('kbucks_current_account', email);
    loadDataForAccount(email);
  };

  // Load current account from localStorage on app start
  useEffect(() => {
    const savedAccount = localStorage.getItem('kbucks_current_account');
    if (savedAccount && !currentAccount) {
      console.log('Loading saved account:', savedAccount);
      setCurrentAccountState(savedAccount);
      loadDataForAccount(savedAccount);
    }
  }, []);

  const loadDataForAccount = async (accountEmail: string) => {
    console.log('Loading data for account:', accountEmail);
    setIsInitialized(false);
    
    try {
      // Try to load from CSV first if admin account
      if (accountEmail === 'kbucks@admin.com') {
        const csvUsers = loadFromCSVFile('users');
        const csvProducts = loadFromCSVFile('products');
        
        if (csvUsers && csvUsers.length > 0) {
          setUsers(csvUsers);
          console.log('Loaded users from CSV:', csvUsers.length);
        }
        
        if (csvProducts && csvProducts.length > 0) {
          setProducts(csvProducts);
          console.log('Loaded products from CSV:', csvProducts.length);
        }
        
        if (csvUsers || csvProducts) {
          setTransactions([]);
          setIsInitialized(true);
          return;
        }
      }

      // Try to load from Supabase with better error handling
      const [usersResult, productsResult, transactionsResult, rateResult] = await Promise.allSettled([
        supabase.from('users').select('*').eq('account_email', accountEmail),
        supabase.from('products').select('*').eq('account_email', accountEmail),
        supabase.from('transactions').select('*').eq('account_email', accountEmail).order('created_at', { ascending: false }),
        supabase.from('exchange_rates').select('*').eq('account_email', accountEmail).order('updated_at', { ascending: false }).limit(1)
      ]);

      // Load users
      if (usersResult.status === 'fulfilled' && !usersResult.value.error && usersResult.value.data && usersResult.value.data.length > 0) {
        const formattedUsers: User[] = usersResult.value.data.map(user => ({
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
        // Try localStorage fallback
        const localUsers = loadFromLocalStorage('users');
        if (localUsers && localUsers.length > 0) {
          setUsers(localUsers);
          console.log('Loaded users from localStorage:', localUsers.length);
        } else {
          setUsers(initialUsers);
          console.log('Using initial users');
        }
      }

      // Load products
      if (productsResult.status === 'fulfilled' && !productsResult.value.error && productsResult.value.data && productsResult.value.data.length > 0) {
        const formattedProducts: Product[] = productsResult.value.data.map(product => ({
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
        const localProducts = loadFromLocalStorage('products');
        if (localProducts && localProducts.length > 0) {
          setProducts(localProducts);
          console.log('Loaded products from localStorage:', localProducts.length);
        } else {
          setProducts(initialProducts);
          console.log('Using initial products');
        }
      }

      // Load transactions
      if (transactionsResult.status === 'fulfilled' && !transactionsResult.value.error && transactionsResult.value.data) {
        const formattedTransactions: Transaction[] = transactionsResult.value.data.map(transaction => ({
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
        const localTransactions = loadFromLocalStorage('transactions');
        setTransactions(localTransactions || []);
      }

      // Load exchange rate
      if (rateResult.status === 'fulfilled' && !rateResult.value.error && rateResult.value.data && rateResult.value.data.length > 0) {
        const newRate = {
          kshToKrypto: parseFloat(rateResult.value.data[0].ksh_to_krypto?.toString() || '0.5'),
          lastUpdated: rateResult.value.data[0].updated_at || new Date().toISOString(),
          updatedBy: 'system'
        };
        setExchangeRate(newRate);
      } else {
        const localRate = loadFromLocalStorage('exchangeRate');
        if (localRate) {
          setExchangeRate(localRate);
        }
      }

    } catch (error) {
      console.error('Error loading data from Supabase, trying localStorage:', error);
      
      // Load from localStorage as fallback
      const localUsers = loadFromLocalStorage('users');
      const localProducts = loadFromLocalStorage('products');
      const localTransactions = loadFromLocalStorage('transactions');
      const localRate = loadFromLocalStorage('exchangeRate');
      
      setUsers(localUsers || initialUsers);
      setProducts(localProducts || initialProducts);
      setTransactions(localTransactions || []);
      if (localRate) setExchangeRate(localRate);
      
    } finally {
      setIsInitialized(true);
    }
  };

  const syncUsersToSupabase = async (usersToSync: User[], accountEmail: string) => {
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
      const { error } = await supabase.from('users').insert(userInserts);
      if (error) throw error;
    }
  };

  const syncProductsToSupabase = async (productsToSync: Product[], accountEmail: string) => {
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
      const { error } = await supabase.from('products').insert(productInserts);
      if (error) throw error;
    }
  };

  const syncTransactionsToSupabase = async (transactionsToSync: Transaction[], accountEmail: string) => {
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
      const { error } = await supabase.from('transactions').insert(transactionInserts);
      if (error) throw error;
    }
  };

  const syncExchangeRateToSupabase = async (rate: ExchangeRate, accountEmail: string) => {
    await supabase.from('exchange_rates').delete().eq('account_email', accountEmail);
    const { error } = await supabase.from('exchange_rates').insert({
      ksh_to_krypto: rate.kshToKrypto,
      account_email: accountEmail,
      updated_at: rate.lastUpdated
    });
    if (error) throw error;
  };

  // Auto-save when data changes with debouncing
  useEffect(() => {
    if (currentAccount && isInitialized) {
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [users, products, transactions, exchangeRate, currentAccount, isInitialized]);

  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const addUser = (user: User) => {
    const newUsers = [...users, user];
    setUsers(newUsers);
    
    // Save to CSV if admin account
    if (currentAccount === 'kbucks@admin.com') {
      saveToCSVFile('users', newUsers);
    }
    
    // Auto-export to download CSV
    setTimeout(() => exportToCSV('users'), 100);
  };

  const deleteUser = (id: string) => {
    const newUsers = users.filter(user => user.id !== id);
    setUsers(newUsers);
    
    // Save to CSV if admin account
    if (currentAccount === 'kbucks@admin.com') {
      saveToCSVFile('users', newUsers);
    }
  };

  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    
    // Save to CSV if admin account
    if (currentAccount === 'kbucks@admin.com') {
      saveToCSVFile('products', newProducts);
    }
    
    // Auto-export to download CSV
    setTimeout(() => exportToCSV('products'), 100);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const newProducts = products.map(product => product.id === id ? { ...product, ...updates } : product);
    setProducts(newProducts);
    
    // Save to CSV if admin account
    if (currentAccount === 'kbucks@admin.com') {
      saveToCSVFile('products', newProducts);
    }
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter(product => product.id !== id);
    setProducts(newProducts);
    
    // Save to CSV if admin account
    if (currentAccount === 'kbucks@admin.com') {
      saveToCSVFile('products', newProducts);
    }
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

    // Update student balance and product stock
    await updateUser(studentId, { balance: student.balance - totalAmount });
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
    exportToCSV,
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
