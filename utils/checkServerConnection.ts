import { supabase } from '@/lib/supabase';

/**
 * Checks if the Supabase server is reachable
 * @returns Promise<boolean> - true if server is reachable, false otherwise
 */
export async function checkServerConnection(): Promise<boolean> {
	try {
		// Set a timeout for the connection check
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Connection timeout')), 10000); // 10 second timeout
		});

		// Try to make an actual API call to check connectivity
		const connectionPromise = supabase
			.from('profiles')
			.select('count', { count: 'exact', head: true })
			.limit(1);

		const { error } = await Promise.race([connectionPromise, timeoutPromise]);

		// Check for specific network/server errors
		if (error) {
			const errorMessage = error.message.toLowerCase();
			if (
				errorMessage.includes('failed to fetch') ||
				errorMessage.includes('network') ||
				errorMessage.includes('fetch') ||
				errorMessage.includes('timeout') ||
				errorMessage.includes('connection') ||
				error.code === 'NETWORK_ERROR' ||
				error.code === 'FETCH_ERROR'
			) {
				console.log('Server connection failed:', error.message);
				return false;
			}
		}

		return true;
	} catch (err: any) {
		// Any network-related error means server is unreachable
		console.error('Server connection check failed:', err);

		// Check if it's a network error
		if (
			err.message.includes('timeout') ||
			err.message.includes('fetch') ||
			err.message.includes('network') ||
			err.name === 'TypeError' ||
			err.name === 'NetworkError'
		) {
			return false;
		}

		// For other errors, assume server is up but there's a different issue
		return true;
	}
}
