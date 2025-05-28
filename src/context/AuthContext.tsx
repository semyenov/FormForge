import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { gql } from "graphql-request";
import graphqlClient from "../hooks/useGraphqlClient";

type Session = {
  id: string;
  userId: string;
  activeOrganizationId: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_QUERY = gql`
  query Session {
    session {
      id
      userId
      activeOrganizationId
    }
  }
`;

// GraphQL queries and mutations
const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      name
      email
      role
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      name
      email
      role
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchUser = async () => {
    try {
      const data = await graphqlClient.request<{ me: User | null }>(ME_QUERY);
      setUser(data.me);
      return data.me;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      return null;
    }
  };

  const fetchSession = async () => {
    try {
      const data = await graphqlClient.request<{ session: Session | null }>(SESSION_QUERY);
      setSession(data.session);
      return data.session;
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if there's a session
        const sessionData = await fetchSession();

        // If there's a session, fetch the user data
        if (sessionData) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await graphqlClient.request<{ login: User | null }>(
      LOGIN_MUTATION,
      { input: { email, password } }
    );

    if (data.login) {
      setUser(data.login);
      await fetchSession(); // Fetch session after successful login
    }
  };

  const logout = async () => {
    await graphqlClient.request(LOGOUT_MUTATION);
    setUser(null);
    setSession(null);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await graphqlClient.request<{ register: User | null }>(
      REGISTER_MUTATION,
      { input: { name, email, password } }
    );

    if (data.register) {
      setUser(data.register);
      await fetchSession(); // Fetch session after successful registration
    }
  };

  const refetchUser = async () => {
    await fetchUser();
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, login, logout, register, refetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
