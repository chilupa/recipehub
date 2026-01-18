import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem('recipe-logger-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (name: string, email?: string) => {
    console.log('Login function called with:', { name, email });
    const newUser: User = {
      id: Date.now().toString(),
      name,
    };
    console.log('Setting user:', newUser);
    localStorage.setItem('recipe-logger-user', JSON.stringify(newUser));
    setUser(() => newUser);
    console.log('User set and stored');
  };

  const logout = () => {
    localStorage.removeItem('recipe-logger-user');
    localStorage.removeItem('recipe-logger-recipes');
    setUser(() => null);
  };

  return { user, login, logout, isLoading };
};