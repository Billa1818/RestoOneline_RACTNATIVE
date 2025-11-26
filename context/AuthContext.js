// ============================================
// context/AuthContext.js
// ============================================
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// 🔴 VARIABLE À MODIFIER POUR TESTER LES DIFFÉRENTS RÔLES
// Valeurs possibles: 'admin', 'gestionnaire', 'livreur', null
// null = Client (non connecté) - App standard de commande
const CURRENT_USER_TYPE = null; // ⭐ CHANGE ICI POUR TESTER

// Données mockées des utilisateurs
const MOCK_USERS = {
  admin: {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin Plateforme',
    role: 'admin',
    phone: '97 11 11 11',
  },
  gestionnaire: {
    id: 3,
    email: 'gestionnaire@example.com',
    password: 'gestionnaire123',
    name: 'Pierre Gestionnaire',
    role: 'gestionnaire',
    phone: '97 22 22 22',
    restaurant: 'Restaurant Chez Mariam',
  },
  livreur: {
    id: 4,
    email: 'livreur@example.com',
    password: 'livreur123',
    name: 'Mohamed Livreur',
    role: 'livreur',
    phone: '97 33 33 33',
    latitude: 6.4969,
    longitude: 2.6289,
  },
};

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(CURRENT_USER_TYPE !== null);
  const [currentUser, setCurrentUser] = useState(
    CURRENT_USER_TYPE ? MOCK_USERS[CURRENT_USER_TYPE] : null
  );
  const [users, setUsers] = useState(Object.values(MOCK_USERS));

  const login = (email, password, role) => {
    const user = MOCK_USERS[role];
    if (user && user.email === email && user.password === password) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Admin uniquement : créer nouvel utilisateur
  const createUser = (newUserData) => {
    if (currentUser?.role !== 'admin') {
      console.error('Seul un admin peut créer des utilisateurs');
      return false;
    }
    const newUser = {
      id: users.length + 1,
      ...newUserData,
    };
    setUsers([...users, newUser]);
    return true;
  };

  // Admin uniquement : modifier rôle utilisateur
  const updateUserRole = (userId, newRole) => {
    if (currentUser?.role !== 'admin') {
      console.error('Seul un admin peut modifier les rôles');
      return false;
    }
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    return true;
  };

  // Admin uniquement : supprimer utilisateur
  const deleteUser = (userId) => {
    if (currentUser?.role !== 'admin') {
      console.error('Seul un admin peut supprimer des utilisateurs');
      return false;
    }
    setUsers(users.filter((user) => user.id !== userId));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        users,
        login,
        logout,
        createUser,
        updateUserRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
