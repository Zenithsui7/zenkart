import { useState } from "react";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const loginMut = useLoginUser();
  const registerMut = useRegisterUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast.success("Logged in successfully!");
        setLocation("/");
      },
      onError: () => toast.error("Login failed")
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMut.mutate({ data: { email, password, name } }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast.success("Registered successfully!");
        setLocation("/");
      },
      onError: () => toast.error("Registration failed")
    });
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading font-bold text-3xl text-primary">ZenKart</h1>
        <p className="text-muted-foreground">Shop. Sell. Discover.</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <Button type="submit" className="w-full" disabled={loginMut.isPending}>
              {loginMut.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4 mt-4">
            <Input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <Button type="submit" className="w-full" disabled={registerMut.isPending}>
              {registerMut.isPending ? "Registering..." : "Register"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
