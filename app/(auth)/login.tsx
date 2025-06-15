import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			Alert.alert('Login error', error.message);
			setLoading(false);
			return;
		}

		// After login, check if profile exists and insert if missing
		const user = data.user;
		if (!user) {
			Alert.alert('Login error', 'No user returned');
			setLoading(false);
			return;
		}

		const { data: profiles, error: profileError } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', user.id);

		if (profileError) {
			Alert.alert('Error checking profile', profileError.message);
			setLoading(false);
			return;
		}

		if (!profiles || profiles.length === 0) {
			// Insert profile row with default or empty username
			const { error: insertError } = await supabase.from('profiles').insert({
				id: user.id,
				username: '', // or you could prompt for username here
			});

			if (insertError) {
				Alert.alert('Error creating profile', insertError.message);
				setLoading(false);
				return;
			}
		}

		setLoading(false);
		router.replace('/'); // Navigate to main app screen
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Log In</Text>

			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				autoCapitalize="none"
				style={styles.input}
			/>

			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.input}
			/>

			<TouchableOpacity
				style={styles.button}
				onPress={handleLogin}
				disabled={loading}
			>
				{loading ? (
					<ActivityIndicator color={Colors.dark.text} />
				) : (
					<Text style={styles.buttonText}>Log In</Text>
				)}
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.replace('/signup')}>
				<Text style={styles.linkText}>Don't have an account? Sign up</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 24,
		backgroundColor: '#1c1c1c',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: Colors.dark.text,
		marginBottom: 20,
		textAlign: 'center',
	},
	input: {
		backgroundColor: '#2e2e2e',
		color: Colors.dark.text,
		padding: 12,
		borderRadius: 10,
		marginBottom: 16,
	},
	button: {
		backgroundColor: Colors.dark.primary,
		padding: 14,
		borderRadius: 10,
	},
	buttonText: {
		color: Colors.dark.text,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	linkText: {
		color: Colors.dark.primary,
		textAlign: 'center',
		marginTop: 16,
	},
});
