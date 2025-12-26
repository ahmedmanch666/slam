import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'https://slam-lake.vercel.app';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        try {
            const stored = localStorage.getItem('tcrm_auth_v1');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    const saveAuth = (authData) => {
        if (authData) {
            localStorage.setItem('tcrm_auth_v1', JSON.stringify(authData));
        } else {
            localStorage.removeItem('tcrm_auth_v1');
        }
        setAuth(authData);
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');

            const authData = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                role: data.role,
                email
            };
            saveAuth(authData);
            return authData;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');

            const authData = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                role: data.role,
                email
            };
            saveAuth(authData);
            return authData;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (auth?.refreshToken) {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: auth.refreshToken })
                });
            } catch { }
        }
        saveAuth(null);
    };

    const apiFetch = async (path, options = {}) => {
        const headers = new Headers(options.headers || {});
        if (!headers.has('Content-Type') && options.body) {
            headers.set('Content-Type', 'application/json');
        }
        if (auth?.accessToken) {
            headers.set('Authorization', `Bearer ${auth.accessToken}`);
        }

        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        if (res.status === 401 && auth?.refreshToken) {
            // Try to refresh token
            const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: auth.refreshToken })
            });
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAuth = { ...auth, accessToken: refreshData.accessToken };
                saveAuth(newAuth);
                headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
                return fetch(`${API_BASE}${path}`, { ...options, headers });
            }
        }

        return res;
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, loading, apiFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
