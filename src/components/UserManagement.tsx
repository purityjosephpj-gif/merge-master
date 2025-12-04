import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Edit, Trash2, User, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface UserData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  writer_approved: boolean | null;
  user_roles: { role: string }[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (role)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch users");
      return;
    }

    setUsers(data || []);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "writer":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-3 w-3" />;
      case "writer":
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const addRoleToUser = async (userId: string, role: string) => {
    setLoading(true);
    // Use security definer function to bypass RLS
    const { error } = await supabase
      .rpc("assign_user_role", { _user_id: userId, _role: role as "admin" | "writer" | "reader" });

    if (error) {
      console.error("Role assignment error:", error);
      toast.error("Failed to add role: " + error.message);
    } else {
      toast.success(`${role} role added successfully`);
      fetchUsers();
    }
    setLoading(false);
  };

  const removeRoleFromUser = async (userId: string, role: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role as "admin" | "writer" | "reader");

    if (error) {
      toast.error("Failed to remove role");
    } else {
      toast.success(`${role} role removed successfully`);
      fetchUsers();
    }
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted successfully");
      fetchUsers();
    }
    setLoading(false);
  };

  const approveWriter = async (userId: string) => {
    setLoading(true);
    
    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ writer_approved: true })
      .eq("id", userId);

    if (profileError) {
      toast.error("Failed to approve writer");
      setLoading(false);
      return;
    }

    // Add writer role if not exists
    await addRoleToUser(userId, "writer");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, edit, and manage user accounts and their roles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.user_roles?.map((ur, idx) => (
                      <Badge key={idx} variant={getRoleBadgeVariant(ur.role)} className="flex items-center gap-1">
                        {getRoleIcon(ur.role)}
                        {ur.role}
                      </Badge>
                    ))}
                    {(!user.user_roles || user.user_roles.length === 0) && (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>
                </TableCell>
              <TableCell>
                  {user.writer_approved === false && user.user_roles?.some(r => r.role === "writer") ? (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                      Pending Approval
                    </Badge>
                  ) : user.writer_approved === true ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      Approved Writer
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setEditDialogOpen(open);
                      if (open) setSelectedUser(user);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage User: {selectedUser?.full_name}</DialogTitle>
                          <DialogDescription>
                            Add or remove roles for this user
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Current Roles</label>
                            <div className="flex gap-2 flex-wrap">
                              {selectedUser?.user_roles?.map((ur, idx) => (
                                <Badge
                                  key={idx}
                                  variant={getRoleBadgeVariant(ur.role)}
                                  className="cursor-pointer"
                                  onClick={() => removeRoleFromUser(selectedUser.id, ur.role)}
                                >
                                  {ur.role} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Add Role</label>
                            <Select
                              onValueChange={(value) => addRoleToUser(selectedUser!.id, value as "admin" | "writer" | "reader")}
                              disabled={loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role to add" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reader">Reader</SelectItem>
                                <SelectItem value="writer">Writer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedUser?.writer_approved === false && (
                            <Button
                              onClick={() => approveWriter(selectedUser.id)}
                              disabled={loading}
                              className="w-full"
                            >
                              Approve as Writer
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
