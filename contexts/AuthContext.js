import { supabase } from '@/lib/supabase';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check for existing session on mount
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
			setLoading(false);
		});

		// Listen for auth state changes (login/logout)
		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
			}
		);

		return () => {
			listener?.subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
