import React from "react"
import { UserApi } from "../api/UserApi"

interface AuthContextType {
  user: UserApi.User | null;
  loaded: boolean;
  set: (data: Partial<AuthContextType>) => void
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loaded: false,
  set: () => { /** void */ }
})

interface AuthProviderProps {
  children?: React.ReactNode;
}

export function AuthProvider (props: AuthProviderProps) {
  const [ data, setData ] = React.useState<Omit<AuthContextType, 'set'>>({
    user: null,
    loaded: false
  });

  const set = React.useCallback((data: Partial<AuthContextType>) => {
    setData(state => {
      return {
        ...state,
        ...data
      }
    })
  }, []);

  const value = React.useMemo(() => {
    return {
      ...data,
      set
    }
  }, [ data, set ]);

  React.useEffect(() => {
    const api = new UserApi();
    (async () => {
      let user: UserApi.User | null = null;
      try {
        user = await api.me();
      } finally {
        set({
          user,
          loaded: true
        })
      }
    })();
  }, [ set ])

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  return React.useContext(AuthContext);
}
