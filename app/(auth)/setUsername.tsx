import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
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

export default function SetUsernameScreen() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [newUsername, setNewUsername] = useState('');

	const PLACEHOLDER_AVATAR_URL =
		'https://vpbgjvtouzmiuunlvwff.supabase.co/storage/v1/object/public/avatars/default/default_avatar.png';

	const isValidUsername = (name: string) => /^[a-zA-Z0-9_]{3,15}$/.test(name);

	const handleSetUsername = async () => {
		if (!isValidUsername(newUsername)) {
			Alert.alert(
				'Invalid username',
				'Username must be 3-15 characters and contain only letters, numbers, or underscores.'
			);
			return;
		}

		if (!params) return;

		setLoading(true);

		const { error: upsertError } = await supabase.from('profiles').upsert({
			id: params.userId,
			username: newUsername,
			avatar_url: PLACEHOLDER_AVATAR_URL,
		});

		if (upsertError) {
			Alert.alert('Error creating profile', upsertError.message);
			setLoading(false);
			return;
		}

		setNewUsername('');
		setLoading(false);
		router.replace('/');
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
					<Text style={styles.title}>Set Username</Text>

					<TextInput
						placeholder="Username"
						value={newUsername}
						onChangeText={setNewUsername}
						style={styles.input}
						autoCapitalize="none"
					/>

					<TouchableOpacity
						style={styles.button}
						onPress={handleSetUsername}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color={Colors.text} />
						) : (
							<Text style={styles.buttonText}>Set Username</Text>
						)}
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
	avatar: {
		width: 125,
		height: 125,
		borderRadius: 360,
		alignSelf: 'center',
		marginTop: 16,
		backgroundColor: Colors.backgroundAlt,
	},
	avatarButton: {
		alignSelf: 'center',
		marginTop: 24,
		marginBottom: 8,
	},
	avatarHint: {
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
		marginBottom: 48,
	},
});
