import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, UserCheck, X } from "lucide-react";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
}

export const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch all users with their profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name");

    if (!profilesData) return;

    // Fetch auth users
    const userPromises = profilesData.map(async (profile) => {
      // Get user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id);

      // Get email from auth.users (using a workaround since we can't query auth directly)
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);

      return {
        id: profile.id,
        email: user?.email || "N/A",
        full_name: profile.full_name,
        roles: rolesData?.map((r) => r.role) || [],
      };
    });

    const usersData = await Promise.all(userPromises);
    setUsers(usersData);
    setLoading(false);
  };

  const addRole = async (userId: string, role: "admin" | "writer" | "reader") => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
      return;
    }

    toast.success("Role added successfully");
    fetchUsers();
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role as "admin" | "writer" | "reader");

    if (error) {
      toast.error("Failed to remove role");
      return;
    }

    toast.success("Role removed successfully");
    fetchUsers();
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead>Add Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {user.roles.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        No roles
                      </span>
                    ) : (
                      user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={
                            role === "admin"
                              ? "destructive"
                              : role === "writer"
                              ? "default"
                              : "secondary"
                          }
                          className="gap-1"
                        >
                          {role}
                          <button
                            onClick={() => removeRole(user.id, role)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(role) => addRole(user.id, role as "admin" | "writer" | "reader")}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="reader">Reader</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
