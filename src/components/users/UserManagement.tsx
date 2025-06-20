
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Download, CreditCard } from 'lucide-react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@school.com',
      role: 'student',
      balance: 150,
      barcode: '1234567890',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@school.com',
      role: 'student',
      balance: 75,
      barcode: '1234567891',
      createdAt: new Date().toISOString(),
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', balance: 0 });
  const { toast } = useToast();

  const generateBarcode = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      balance: newUser.balance,
      barcode: generateBarcode(),
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', balance: 0 });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Student ${user.name} added successfully`,
    });
  };

  const handleEditBalance = (userId: string, newBalance: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, balance: newBalance } : user
    ));
    setIsEditDialogOpen(false);
    setEditingUser(null);
    
    toast({
      title: "Success",
      description: "Balance updated successfully",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "Student deleted successfully",
    });
  };

  const downloadBarcode = (user: User) => {
    // Generate a simple barcode image URL (in real app, this would be a proper barcode generator)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 100;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 100);
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(user.name, 10, 30);
      ctx.fillText(`K$ ${user.balance}`, 10, 50);
      ctx.fillText(user.barcode || '', 10, 70);
    }
    
    const link = document.createElement('a');
    link.download = `${user.name}-card.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Success",
      description: "Student card downloaded",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage student accounts and balances</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student account with initial balance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter student email"
                />
              </div>
              <div>
                <Label htmlFor="balance">Initial Balance (K$)</Label>
                <Input
                  id="balance"
                  type="number"
                  value={newUser.balance}
                  onChange={(e) => setNewUser({ ...newUser, balance: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleAddUser} className="w-full gradient-bg">
                Create Student Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Manage student accounts, balances, and generate student cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gradient-bg text-white">
                      K$ {user.balance}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.barcode}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBarcode(user)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Balance - {editingUser?.name}</DialogTitle>
            <DialogDescription>
              Update the student's Krypto Bucks balance
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Current Balance</Label>
                <div className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
                  K$ {editingUser.balance}
                </div>
              </div>
              <div>
                <Label htmlFor="newBalance">New Balance (K$)</Label>
                <Input
                  id="newBalance"
                  type="number"
                  defaultValue={editingUser.balance}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, balance: Number(e.target.value) });
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => editingUser && handleEditBalance(editingUser.id, editingUser.balance)}
                className="w-full gradient-bg"
              >
                Update Balance
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
