import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("zenkart_token")
  );
  const queryClient = useQueryClient();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("zenkart_token", newToken);
    } else {
      localStorage.removeItem("zenkart_token");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    queryClient.clear();
  };

  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
