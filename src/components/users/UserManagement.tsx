import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Download, FileDown } from 'lucide-react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAppData();
  const [students, setStudents] = useState<User[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', balance: 0, grade: '', barcode: '', secretCode: '' });
  const { toast } = useToast();

  // Update students list when users change
  useEffect(() => {
    setStudents(users.filter(user => user.role === 'student'));
  }, [users]);

  const generateBarcode = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  };

  const generateSecretCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.grade) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if barcode already exists
    if (newUser.barcode && users.some(u => u.barcode === newUser.barcode)) {
      toast({
        title: "Error",
        description: "Barcode already exists. Please use a different barcode.",
        variant: "destructive",
      });
      return;
    }

    // Check if secret code already exists
    if (newUser.secretCode && users.some(u => u.secretCode === newUser.secretCode)) {
      toast({
        title: "Error",
        description: "Secret code already exists. Please use a different secret code.",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      balance: Number(newUser.balance),
      grade: newUser.grade,
      barcode: newUser.barcode || generateBarcode(),
      secretCode: newUser.secretCode || generateSecretCode(),
      createdAt: new Date().toISOString(),
    };

    try {
      addUser(user);
      setNewUser({ name: '', email: '', balance: 0, grade: '', barcode: '', secretCode: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Student ${user.name} added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleEditBalance = async (userId: string, newBalance: number) => {
    try {
      await updateUser(userId, { balance: newBalance });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      
      toast({
        title: "Success",
        description: "Balance updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update balance",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      deleteUser(userId);
      toast({
        title: "Success",
        description: `${userName} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student", 
        variant: "destructive",
      });
    }
  };

  const downloadBarcode = (user: User) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 120;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 120);
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(user.name, 10, 30);
      ctx.fillText(`Grade: ${user.grade || 'N/A'}`, 10, 50);
      ctx.fillText(`K$ ${user.balance}`, 10, 70);
      ctx.fillText(user.barcode || '', 10, 90);
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
        
        <div className="flex gap-2">
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter student email"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Input
                    id="grade"
                    value={newUser.grade}
                    onChange={(e) => setNewUser({ ...newUser, grade: e.target.value })}
                    placeholder="Enter student grade (e.g., Grade 5, 10th Grade)"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">Barcode (optional)</Label>
                  <Input
                    id="barcode"
                    value={newUser.barcode}
                    onChange={(e) => setNewUser({ ...newUser, barcode: e.target.value })}
                    placeholder="Enter custom barcode or leave empty for auto-generated"
                  />
                </div>
                <div>
                  <Label htmlFor="secretCode">Secret Code (optional)</Label>
                  <Input
                    id="secretCode"
                    value={newUser.secretCode}
                    onChange={(e) => setNewUser({ ...newUser, secretCode: e.target.value })}
                    placeholder="Enter custom secret code or leave empty for auto-generated"
                  />
                </div>
                <div>
                  <Label htmlFor="balance">Initial Balance (K$)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={newUser.balance}
                    onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={handleAddUser} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Create Student Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Manage student accounts, balances, and generate student cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students registered yet.</p>
              <p className="text-sm text-muted-foreground">Add your first student to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Secret Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.grade || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        K$ {user.balance}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.barcode}</TableCell>
                    <TableCell className="font-mono text-sm">{user.secretCode}</TableCell>
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
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
                <div className="text-2xl font-bold text-blue-600">
                  K$ {editingUser.balance}
                </div>
              </div>
              <div>
                <Label htmlFor="newBalance">New Balance (K$)</Label>
                <Input
                  id="newBalance"
                  type="number"
                  step="0.01"
                  defaultValue={editingUser.balance}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) || 0 });
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => editingUser && handleEditBalance(editingUser.id, editingUser.balance)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
