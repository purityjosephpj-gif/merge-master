import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { UserCheck, UserX, Clock } from "lucide-react";

interface WriterRequest {
  id: string;
  full_name: string;
  writer_requested_at: string;
  writer_approved: boolean;
}

export const WriterApprovals = () => {
  const [requests, setRequests] = useState<WriterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to new requests
    const channel = supabase
      .channel("writer-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, writer_requested_at, writer_approved")
      .not("writer_requested_at", "is", null)
      .order("writer_requested_at", { ascending: false });

    if (data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const approveWriter = async (userId: string) => {
    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ writer_approved: true })
      .eq("id", userId);

    if (profileError) {
      toast.error("Failed to approve writer");
      return;
    }

    // Check if user already has writer role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "writer")
      .maybeSingle();

    // Add writer role if not exists
    if (!existingRole) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "writer",
      });

      if (roleError) {
        toast.error("Failed to assign writer role");
        return;
      }
    }

    toast.success("Writer approved successfully");
    fetchRequests();
  };

  const rejectWriter = async (userId: string) => {
    // Remove writer role
    const { error: roleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "writer");

    if (roleError) {
      toast.error("Failed to reject writer");
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        writer_approved: false,
        writer_requested_at: null,
      })
      .eq("id", userId);

    if (profileError) {
      toast.error("Failed to update profile");
      return;
    }

    toast.success("Writer request rejected");
    fetchRequests();
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Writer Approval Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending writer requests</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.full_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.writer_requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.writer_approved ? "default" : "secondary"
                      }
                    >
                      {request.writer_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!request.writer_approved && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveWriter(request.id)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectWriter(request.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
