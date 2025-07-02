
import { User, Product } from '@/types';

export const initialUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@student.com',
    role: 'student',
    balance: 100,
    barcode: '123456789',
    grade: 'Grade 10',
    secretCode: '123456',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@student.com',
    role: 'student',
    balance: 75,
    barcode: '987654321',
    grade: 'Grade 9',
    secretCode: '654321',
    createdAt: new Date().toISOString(),
  }
];

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Notebook',
    price: 5,
    stock: 50,
    category: 'Stationery',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Pen',
    price: 2,
    stock: 100,
    category: 'Stationery',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Eraser',
    price: 1,
    stock: 75,
    category: 'Stationery',
    createdAt: new Date().toISOString(),
  }
];
