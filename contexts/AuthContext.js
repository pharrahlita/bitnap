import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [session, setSession] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);

			supabase.auth.onAuthStateChange((_event, session) => {
				setSession(session);
				setUser(session?.user ?? null);
			});
		};

		init();
	}, []);

	return (
		<AuthContext.Provider value={{ session, user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
