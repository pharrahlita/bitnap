import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
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
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.container}>
					<Image
						source={require('@/assets/images/bitnap_highres_logo.png')}
						style={{ width: 200, height: 200, marginBottom: 25 }}
						resizeMode="contain"
					/>

					<Text style={styles.title}>Log In</Text>

					<TextInput
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

					<TextInput
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

					<TouchableOpacity
						style={styles.button}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color={Colors.text} />
						) : (
							<Text style={styles.buttonText}>Log In</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity onPress={() => router.replace('/signup')}>
						<Text style={styles.linkText}>
							Don't have an account?
							<Text style={{ color: Colors.primary }}> Sign up</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		backgroundColor: Colors.background,
	},
	title: {
		fontSize: FontSizes.extraLarge,
		fontFamily: Fonts.dogicaPixelBold,
		color: Colors.title,
		marginBottom: 24,
	},
	input: {
		backgroundColor: '#fff',
		color: Colors.textAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		width: '100%',
		fontSize: FontSizes.small,
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 12,
		borderRadius: 8,
		width: '100%',
	},
	buttonText: {
		color: Colors.button,
		fontSize: FontSizes.medium,
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixelBold,
	},
	linkText: {
		color: Colors.textAlt,
		textAlign: 'center',
		marginTop: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
});
