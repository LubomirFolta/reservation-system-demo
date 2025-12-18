import { createContext, useContext, useState, useEffect } from 'react';
import { ID } from 'appwrite';
import { account, OAuthProvider } from '../lib/appwrite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      // Delete any existing session before creating a new one
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, continue with login
      }

      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setUser(session);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to login',
      };
    }
  }

  async function register(email, password, name) {
    try {
      // Delete any existing session before registration
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, continue with registration
      }

      await account.create(ID.unique(), email, password, name);
      // Automatically log in after registration
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setUser(session);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to register',
      };
    }
  }

  async function logout() {
    try {
      await account.deleteSession('current');
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to logout',
      };
    }
  }

  async function updateProfile(name) {
    try {
      await account.updateName(name);
      const session = await account.get();
      setUser(session);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  async function updatePassword(password, oldPassword) {
    try {
      await account.updatePassword(password, oldPassword);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update password',
      };
    }
  }

  function loginWithGoogle() {
    account.createOAuth2Session(
      OAuthProvider.Google,
      window.location.origin + '/', // Success redirect
      window.location.origin + '/login' // Failure redirect
    );
  }

  // Check if user has admin label
  const isAdmin = user?.labels?.includes('admin') || false;

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    updatePassword,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
