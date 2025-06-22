
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

interface Worker {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const WorkerManagement: React.FC = () => {
  const { workers, addWorker, updateWorker, deleteWorker } = useAppData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '' });
  const { toast } = useToast();

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.email || !newWorker.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (workers.some(w => w.email === newWorker.email)) {
      toast({
        title: "Error",
        description: "Email already exists. Please use a different email.",
        variant: "destructive",
      });
      return;
    }

    const worker: Worker = {
      id: Date.now().toString(),
      name: newWorker.name,
      email: newWorker.email,
      password: newWorker.password,
      createdAt: new Date().toISOString(),
    };

    addWorker(worker);
    setNewWorker({ name: '', email: '', password: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Worker ${worker.name} added successfully`,
    });
  };

  const handleEditWorker = () => {
    if (!editingWorker) return;

    updateWorker(editingWorker.id, editingWorker);
    setIsEditDialogOpen(false);
    setEditingWorker(null);
    
    toast({
      title: "Success",
      description: "Worker updated successfully",
    });
  };

  const handleDeleteWorker = (workerId: string) => {
    deleteWorker(workerId);
    toast({
      title: "Success",
      description: "Worker deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Worker Management</h1>
          <p className="text-muted-foreground">Manage worker accounts and permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
              <DialogDescription>
                Create a new worker account for system access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workerName">Name</Label>
                <Input
                  id="workerName"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  placeholder="Enter worker name"
                />
              </div>
              <div>
                <Label htmlFor="workerEmail">Email</Label>
                <Input
                  id="workerEmail"
                  type="email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  placeholder="Enter worker email"
                />
              </div>
              <div>
                <Label htmlFor="workerPassword">Password</Label>
                <Input
                  id="workerPassword"
                  type="password"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                  placeholder="Enter worker password"
                />
              </div>
              <Button onClick={handleAddWorker} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Create Worker Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold">{workers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold">{workers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-2xl font-bold">Worker</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workers</CardTitle>
          <CardDescription>
            Manage worker accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workers registered yet.</p>
              <p className="text-sm text-muted-foreground">Add your first worker to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell className="font-mono">{'*'.repeat(worker.password.length)}</TableCell>
                    <TableCell>{new Date(worker.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWorker(worker);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteWorker(worker.id)}
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
            <DialogTitle>Edit Worker - {editingWorker?.name}</DialogTitle>
            <DialogDescription>
              Update worker information and credentials
            </DialogDescription>
          </DialogHeader>
          {editingWorker && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingWorker.email}
                  onChange={(e) => setEditingWorker({ ...editingWorker, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPassword">Password</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={editingWorker.password}
                  onChange={(e) => setEditingWorker({ ...editingWorker, password: e.target.value })}
                />
              </div>
              <Button
                onClick={handleEditWorker}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Worker
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerManagement;
