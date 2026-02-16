export interface User {
  id: string;
  email: string;
  googleId: string;
  createdAt: string;
  lastLogin?: string;
  name?: string;
  picture?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<string | null>;
  checkAuthStatus: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
