import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { gql } from "@apollo/client";
import {
  Session,
  User,
} from "../__generated__/types.generated";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useSessionQuery
} from './__generated__/AuthContext.generated.tsx';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

export const SESSION_QUERY = gql`
  query Session {
    session {
      id
      userId
      activeOrganizationId
      expiresAt
      createdAt
      updatedAt
      ipAddress
      userAgent
      token
      impersonatedBy
    }
  }
`;

// GraphQL queries and mutations
export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      emailVerified
      banExpires
      banReason
      banned
      createdAt
      updatedAt
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      name
      email
      role
      emailVerified
      banExpires
      banReason
      banned
      createdAt
      updatedAt
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      name
      email
      role
      banExpires
      banReason
      emailVerified
      banned
      createdAt
      updatedAt
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const AuthContext = createContext<AuthContextType>(undefined!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();

  const { refetch: refetchSession } = useSessionQuery({skip: true,});

  const login = async (email: string, password: string) => {
    const { data: loginData,  } = await loginMutation({ variables: { input: { email, password } } });
    if (loginData?.login) {
      setUser(loginData.login);
      const { data: sessionData } = await refetchSession();
      setSession(sessionData?.session);
    }
  };

  const logout = async () => {
    await logoutMutation();
    setUser(null);
    setSession(null);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data: registerData } = await registerMutation({
      variables: {
        input: {
          name,
          email,
          password,
        },
      },
    });
    if (registerData?.register) {
      setUser(registerData.register);

      const { data: sessionData } = await refetchSession();
      setSession(sessionData?.session);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, login, logout, register }}
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
