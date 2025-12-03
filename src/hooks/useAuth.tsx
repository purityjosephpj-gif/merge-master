import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "admin" | "writer" | "reader";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
   const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // When auth state changes to a logged-in user, refresh roles
          setRolesLoaded(false);
          setLoading(true);
          setTimeout(() => {
            fetchUserRoles(session.user.id).finally(() => {
              setRolesLoaded(true);
              setLoading(false);
            });
          }, 0);
        } else {
          // When user logs out or session is cleared
          setUserRoles([]);
          setRolesLoaded(true);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setRolesLoaded(false);
        setLoading(true);
        await fetchUserRoles(session.user.id);
        setRolesLoaded(true);
        setLoading(false);
      } else {
        setUserRoles([]);
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!error && data) {
      setUserRoles(data.map(r => r.role as UserRole));
    } else if (error) {
      console.error("Failed to fetch user roles", error.message);
      setUserRoles([]);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    // Insert the role after user is created
    if (data.user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role });

      if (roleError) {
        toast.error("Failed to assign role");
        return { error: roleError };
      }
    }

    toast.success("Account created successfully!");
    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Signed in successfully!");
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    setUserRoles([]);
    toast.success("Signed out successfully");
    navigate("/");
  };

  const hasRole = (role: UserRole) => {
    // Admins have all privileges including writer
    if (userRoles.includes("admin") && (role === "writer" || role === "reader")) {
      return true;
    }
    // Writers also have reader privileges
    if (userRoles.includes("writer") && role === "reader") {
      return true;
    }
    return userRoles.includes(role);
  };

  return {
    user,
    session,
    loading,
    userRoles,
    rolesLoaded,
    hasRole,
    signUp,
    signIn,
    signOut,
  };
};
