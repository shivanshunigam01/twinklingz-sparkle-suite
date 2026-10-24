import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import {
  clearCustomerSession,
  getCustomerProfile,
  getCustomerToken,
  setCustomerSession,
  type CustomerProfile,
} from "@/lib/customer-auth";

type CustomerAuthContextValue = {
  customer: CustomerProfile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(() => getCustomerProfile());
  const [token, setToken] = useState<string | null>(() => getCustomerToken());
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    setToken(getCustomerToken());
    setCustomer(getCustomerProfile());
  }, []);

  const refresh = useCallback(async () => {
    const t = getCustomerToken();
    if (!t) {
      setCustomer(null);
      setToken(null);
      return;
    }
    try {
      const res = await apiFetch<{ customer: CustomerProfile }>("/customer/me", { token: t });
      setCustomerSession(t, res.customer);
      setCustomer(res.customer);
      setToken(t);
    } catch {
      clearCustomerSession();
      setCustomer(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const onAuth = () => syncFromStorage();
    window.addEventListener("twinklingz-customer-auth", onAuth);
    return () => window.removeEventListener("twinklingz-customer-auth", onAuth);
  }, [refresh, syncFromStorage]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; customer: CustomerProfile }>("/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setCustomerSession(res.token, res.customer);
    setToken(res.token);
    setCustomer(res.customer);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; customer: CustomerProfile }>("/customer/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setCustomerSession(res.token, res.customer);
    setToken(res.token);
    setCustomer(res.customer);
  }, []);

  const signOut = useCallback(() => {
    clearCustomerSession();
    setToken(null);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ customer, token, loading, signIn, register, signOut, refresh }),
    [customer, token, loading, signIn, register, signOut, refresh],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("CustomerAuthProvider missing");
  return ctx;
}
