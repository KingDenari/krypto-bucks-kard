
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'student';
  balance: number;
  barcode?: string;
  grade?: string;
  secretCode?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // in Krypto Bucks
  stock: number;
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  type: 'purchase' | 'deposit' | 'deduction' | 'transfer';
  amount: number;
  description: string;
  products?: { productId: string; productName: string; quantity: number; price: number }[];
  transferTo?: string;
  transferFrom?: string;
  createdAt: string;
  createdBy: string;
}

export interface AuthUser {
  email: string;
  role: 'admin' | 'worker';
}

export interface ExchangeRate {
  kshToKrypto: number;
  lastUpdated: string;
  updatedBy: string;
}
