import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { gql } from "@apollo/client";
import { Session, User } from "../__generated__/types.generated";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useSessionQuery,
  useMeQuery,
} from "./__generated__/AuthContext.generated.tsx";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
};

// GraphQL queries and mutations
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();

  const { refetch: refetchSession } = useSessionQuery({
    onCompleted: (data) => {
      if (data?.session) {
        setAuthState((prev) => ({ ...prev, session: data.session }));
      }
    },
    onError: (error) => {
      setAuthState((prev) => ({ ...prev, error }));
    },
  });

  const { refetch: refetchMe } = useMeQuery({
    onCompleted: (data) => {
      if (data?.me) {
        setAuthState((prev) => ({ ...prev, user: data.me }));
      }
    },
    onError: (error) => {
      setAuthState((prev) => ({ ...prev, error }));
    },
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: sessionData } = await refetchSession();

        if (sessionData?.session) {
          const { data: userData } = await refetchMe();

          setAuthState({
            user: userData?.me || null,
            session: sessionData.session,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error:
            error instanceof Error ? error : new Error("Authentication failed"),
        });
      }
    };

    initializeAuth();
  }, [refetchMe, refetchSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { data: loginData } = await loginMutation({
          variables: { input: { email, password } },
        });

        if (loginData?.login) {
          const { data: sessionData } = await refetchSession();

          setAuthState({
            user: loginData.login,
            session: sessionData?.session || null,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Login failed");
        }
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Login failed"),
        });
        throw error;
      }
    },
    [loginMutation, refetchSession],
  );

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await logoutMutation();

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error("Logout failed"),
      }));
      throw error;
    }
  }, [logoutMutation]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
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
          const { data: sessionData } = await refetchSession();

          setAuthState({
            user: registerData.register,
            session: sessionData?.session || null,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Registration failed");
        }
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error:
            error instanceof Error ? error : new Error("Registration failed"),
        });
        throw error;
      }
    },
    [registerMutation, refetchSession],
  );

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    isAuthenticated: !!authState.user && !!authState.session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
