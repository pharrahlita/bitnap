import { supabase } from '@/lib/supabase';
import { checkServerConnection } from '@/utils/checkServerConnection';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
	user: null,
	loading: true,
	serverDown: false,
});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [serverDown, setServerDown] = useState(false);

	useEffect(() => {
		const getSession = async () => {
			try {
				setLoading(true);
				console.log('AuthContext: Starting server connection check...');

				// First check if server is reachable
				const isServerUp = await checkServerConnection();
				console.log('AuthContext: Server connection check result:', isServerUp);

				if (!isServerUp) {
					console.log(
						'AuthContext: Server is down, setting serverDown to true'
					);
					setServerDown(true);
					setLoading(false);
					return;
				}

				setServerDown(false);
				console.log('AuthContext: Server is up, checking session...');

				// Retrieve the session from Supabase
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error('Error retrieving session:', error.message);
				} else {
					setUser(session?.user || null);
					console.log(
						'AuthContext: Session check complete, user:',
						session?.user ? 'logged in' : 'not logged in'
					);
				}
			} catch (err) {
				console.error('Unexpected error during session retrieval:', err);
				setServerDown(true);
			} finally {
				setLoading(false);
			}
		};

		getSession();

		// Listen for auth state changes
		const { subscription } = supabase.auth.onAuthStateChange(
			(event, session) => {
				setUser(session?.user || null);
			}
		);

		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, serverDown }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
