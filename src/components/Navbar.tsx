import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Menu, LogOut, Shield, Edit, BookMarked } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, hasRole, signOut } = useAuth();
  
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Books" },
    { to: "/drafts", label: "Draft Stories" },
    { to: "/blog", label: "Blog" },
    { to: "/talk-zone", label: "Talk Zone" },
    { to: "/founders", label: "Founders" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-writer-amber bg-clip-text text-transparent">
              Pixel & Prose
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasRole("admin") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard" className="flex items-center cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/writer-dashboard" className="flex items-center cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Writer Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/reader-dashboard" className="flex items-center cursor-pointer">
                          <BookMarked className="h-4 w-4 mr-2" />
                          Reader Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {!hasRole("admin") && hasRole("writer") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/writer-dashboard" className="flex items-center cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Writer Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/reader-dashboard" className="flex items-center cursor-pointer">
                          <BookMarked className="h-4 w-4 mr-2" />
                          Reader Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {!hasRole("admin") && !hasRole("writer") && hasRole("reader") && (
                    <DropdownMenuItem asChild>
                      <Link to="/reader-dashboard" className="flex items-center cursor-pointer">
                        <BookMarked className="h-4 w-4 mr-2" />
                        Reader Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-primary to-writer-amber">
                  <Link to="/auth?mode=register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  {user ? (
                    <>
                      {hasRole("admin") && (
                        <>
                          <Button variant="outline" asChild>
                            <Link to="/admin-dashboard">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/writer-dashboard">
                              <Edit className="h-4 w-4 mr-2" />
                              Writer
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/reader-dashboard">
                              <BookMarked className="h-4 w-4 mr-2" />
                              Reader
                            </Link>
                          </Button>
                        </>
                      )}
                      {!hasRole("admin") && hasRole("writer") && (
                        <>
                          <Button variant="outline" asChild>
                            <Link to="/writer-dashboard">
                              <Edit className="h-4 w-4 mr-2" />
                              Writer
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/reader-dashboard">
                              <BookMarked className="h-4 w-4 mr-2" />
                              Reader
                            </Link>
                          </Button>
                        </>
                      )}
                      {!hasRole("admin") && !hasRole("writer") && hasRole("reader") && (
                        <Button variant="outline" asChild>
                          <Link to="/reader-dashboard">
                            <BookMarked className="h-4 w-4 mr-2" />
                            Reader
                          </Link>
                        </Button>
                      )}
                      <Button variant="destructive" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/auth">Login</Link>
                      </Button>
                      <Button asChild className="bg-gradient-to-r from-primary to-writer-amber">
                        <Link to="/auth?mode=register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
