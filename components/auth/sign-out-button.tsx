"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function SignOutButton({ 
  variant = "default" 
}: SignOutButtonProps) {
  return (
    <Button 
      variant={variant} 
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
