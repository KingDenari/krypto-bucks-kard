import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Product, Transaction, Worker, Employee, ExchangeRate } from '@/types';
import { initialUsers, initialProducts } from '@/data/data';
import { supabase } from '@/integrations/supabase/client';
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
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  transferKryptoBucks: (fromUserId: string, toUserId: string, amount: number, createdBy: string) => boolean;
  clearTransferHistory: () => void;
  clearSalesHistory: () => void;
  addWorker: (worker: Worker) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateExchangeRate: (rate: number, updatedBy: string) => Promise<void>;
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
    console.log('Loading data from Supabase for account:', accountEmail);
    setIsInitialized(false);
    
    try {
      // Load from Supabase
      const [usersResult, productsResult, transactionsResult, rateResult] = await Promise.allSettled([
        supabase.from('users').select('*').eq('account_email', accountEmail),
        supabase.from('products').select('*').eq('account_email', accountEmail),
        supabase.from('transactions').select('*').eq('account_email', accountEmail).order('created_at', { ascending: false }),
        supabase.from('exchange_rates').select('*').eq('account_email', accountEmail).order('updated_at', { ascending: false }).limit(1)
      ]);

      // Load users
      if (usersResult.status === 'fulfilled' && !usersResult.value.error && usersResult.value.data) {
        if (usersResult.value.data.length > 0) {
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
          setUsers([]);
          console.log('No users found in Supabase');
        }
      } else {
        setUsers([]);
        console.log('Error loading users from Supabase');
      }

      // Load products
      if (productsResult.status === 'fulfilled' && !productsResult.value.error && productsResult.value.data) {
        if (productsResult.value.data.length > 0) {
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
          setProducts([]);
          console.log('No products found in Supabase');
        }
      } else {
        setProducts([]);
        console.log('Error loading products from Supabase');
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
        setTransactions([]);
        console.log('No transactions found or error loading');
      }

      // Load exchange rate
      if (rateResult.status === 'fulfilled' && !rateResult.value.error && rateResult.value.data && rateResult.value.data.length > 0) {
        const newRate = {
          kshToKrypto: 0.5, // Use default for now
          lastUpdated: rateResult.value.data[0].updated_at || new Date().toISOString(),
          updatedBy: 'system'
        };
        setExchangeRate(newRate);
        console.log('Loaded exchange rate from Supabase');
      } else {
        console.log('No exchange rate found, using default');
      }

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      setUsers([]);
      setProducts([]);
      setTransactions([]);
      
    } finally {
      setIsInitialized(true);
    }
  };



  const getUserBySecretCode = (secretCode: string) => {
    return users.find(user => user.secretCode === secretCode);
  };

  const getUserByBarcode = (barcode: string) => {
    return users.find(user => user.barcode === barcode);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    // Update local state first
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          balance: updates.balance,
          secret_code: updates.secretCode,
          barcode: updates.barcode,
          grade: updates.grade
        })
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) throw error;
      
      toast({
        title: "Student updated",
        description: "Student information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Update failed",
        description: "Failed to update student in database",
        variant: "destructive",
      });
    }
  };

  const addUser = async (user: User) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding students",
        variant: "destructive",
      });
      return;
    }

    // Add to local state first
    setUsers(prev => [...prev, user]);
    
    // Add to Supabase
    try {
      const { error } = await supabase.from('users').insert({
        id: user.id,
        name: user.name,
        student_id: user.id,
        secret_code: user.secretCode,
        balance: user.balance,
        role: user.role,
        barcode: user.barcode || '',
        grade: user.grade || '',
        account_email: currentAccount,
        created_at: user.createdAt
      });

      if (error) throw error;
      
      toast({
        title: "Student added",
        description: "New student has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      // Remove from local state if Supabase insert failed
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: "Add failed",
        description: "Failed to add student to database",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete student from database",
          variant: "destructive",
        });
        return;
      }

      // Then update local state
      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "Student deleted",
        description: "Student has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the student",
        variant: "destructive",
      });
    }
  };

  const addProduct = async (product: Product) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding products",
        variant: "destructive",
      });
      return;
    }

    // Add to local state first
    setProducts(prev => [...prev, product]);
    
    // Add to Supabase
    try {
      const { error } = await supabase.from('products').insert({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        account_email: currentAccount,
        created_at: product.createdAt
      });

      if (error) throw error;
      
      toast({
        title: "Product added",
        description: "New product has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      // Remove from local state if Supabase insert failed
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast({
        title: "Add failed",
        description: "Failed to add product to database",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // Update local state first
    setProducts(prev => prev.map(product => product.id === id ? { ...product, ...updates } : product));
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          stock: updates.stock,
          category: updates.category
        })
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) throw error;
      
      toast({
        title: "Product updated",
        description: "Product information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: "Failed to update product in database",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) {
        console.error('Error deleting product from Supabase:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete product from database",
          variant: "destructive",
        });
        return;
      }

      // Then update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      toast({
        title: "Product deleted",
        description: "Product has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the product",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    // Add to local state first
    setTransactions(prev => [transaction, ...prev]);
    
    // Add to Supabase
    try {
      const { error } = await supabase.from('transactions').insert({
        id: transaction.id,
        student_id: transaction.studentId,
        student_name: transaction.studentName,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        products: transaction.products || [],
        quantity: transaction.products?.[0]?.quantity || 1,
        total_amount: transaction.amount,
        account_email: currentAccount,
        created_at: transaction.createdAt
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding transaction:', error);
      // Remove from local state if Supabase insert failed
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
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

  const addWorker = async (worker: Worker) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding workers",
        variant: "destructive",
      });
      return;
    }

    // Add to local state first
    setWorkers([...workers, worker]);
    
    // Add to Supabase
    try {
      const { error } = await supabase.from('workers').insert({
        id: worker.id,
        name: worker.name,
        email: worker.email,
        role: 'worker',
        hourly_rate: 0,
        account_email: currentAccount,
        created_at: worker.createdAt
      });

      if (error) throw error;
      
      toast({
        title: "Worker added",
        description: "New worker has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding worker:', error);
      // Remove from local state if Supabase insert failed
      setWorkers(prev => prev.filter(w => w.id !== worker.id));
      toast({
        title: "Add failed",
        description: "Failed to add worker to database",
        variant: "destructive",
      });
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    // Update local state first
    setWorkers(workers.map(worker => worker.id === id ? { ...worker, ...updates } : worker));
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          name: updates.name,
          email: updates.email
        })
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) throw error;
      
      toast({
        title: "Worker updated",
        description: "Worker information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      toast({
        title: "Update failed",
        description: "Failed to update worker in database",
        variant: "destructive",
      });
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) {
        console.error('Error deleting worker from Supabase:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete worker from database",
          variant: "destructive",
        });
        return;
      }

      // Then update local state
      setWorkers(workers.filter(worker => worker.id !== id));
      toast({
        title: "Worker deleted",
        description: "Worker has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the worker",
        variant: "destructive",
      });
    }
  };

  const addEmployee = async (employee: Employee) => {
    if (!currentAccount) {
      toast({
        title: "Account required",
        description: "Please set an account before adding employees",
        variant: "destructive",
      });
      return;
    }

    // Add to local state first
    setEmployees([...employees, employee]);
    
    // Add to Supabase
    try {
      const { error } = await supabase.from('employees').insert({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: 'General',
        salary: 0,
        account_email: currentAccount,
        created_at: employee.createdAt
      });

      if (error) throw error;
      
      toast({
        title: "Employee added",
        description: "New employee has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      // Remove from local state if Supabase insert failed
      setEmployees(prev => prev.filter(e => e.id !== employee.id));
      toast({
        title: "Add failed",
        description: "Failed to add employee to database",
        variant: "destructive",
      });
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    // Update local state first
    setEmployees(employees.map(employee => employee.id === id ? { ...employee, ...updates } : employee));
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: updates.name,
          email: updates.email
        })
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) throw error;
      
      toast({
        title: "Employee updated",
        description: "Employee information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Update failed",
        description: "Failed to update employee in database",
        variant: "destructive",
      });
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
        .eq('account_email', currentAccount);

      if (error) {
        console.error('Error deleting employee from Supabase:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete employee from database",
          variant: "destructive",
        });
        return;
      }

      // Then update local state
      setEmployees(employees.filter(employee => employee.id !== id));
      toast({
        title: "Employee deleted",
        description: "Employee has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the employee",
        variant: "destructive",
      });
    }
  };

  const updateExchangeRate = async (rate: number, updatedBy: string) => {
    const newRate = {
      kshToKrypto: rate,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };
    setExchangeRate(newRate);
    
    // Save to Supabase
    try {
      const { error } = await supabase.from('exchange_rates').upsert({
        currency_pair: 'KSH_KRYPTO',
        rate: rate,
        account_email: currentAccount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'currency_pair,account_email'
      });

      if (error) throw error;
      
      toast({
        title: "Exchange rate updated",
        description: "Exchange rate has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      toast({
        title: "Update failed",
        description: "Failed to update exchange rate in database",
        variant: "destructive",
      });
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