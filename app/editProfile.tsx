import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { pickImage } from '@/utils/pickImage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');
	const [loading, setLoading] = useState(false);

	const PLACEHOLDER_AVATAR_URL =
		'https://vpbgjvtouzmiuunlvwff.supabase.co/storage/v1/object/public/avatars/default/default_avatar.png';
	const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_AVATAR_URL);

	useEffect(() => {
		const fetchProfile = async () => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) return;

			const { data, error } = await supabase
				.from('profiles')
				.select('username, bio, avatar_url')
				.eq('id', user.id)
				.single();

			if (data) {
				setUsername(data.username || '');
				setBio(data.bio || '');
				setAvatarUrl(data.avatar_url || '');
			} else if (error) {
				console.error('Error loading profile:', error.message);
			}
		};

		fetchProfile();
	}, []);

	const handleSave = async () => {
		setLoading(true);
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			Alert.alert('Unable to fetch user');
			setLoading(false);
			return;
		}

		const { error } = await supabase
			.from('profiles')
			.update({
				username,
				bio,
				avatar_url: avatarUrl,
			})
			.eq('id', user.id);

		setLoading(false);

		if (error) {
			Alert.alert('Update failed', error.message);
		} else {
			router.back();
		}
	};

	const handlePick = async () => {
		const publicUrl = await pickImage();
		if (publicUrl) setAvatarUrl(publicUrl);
		else alert('Failed to get public URL');
	};

	return (
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				style={styles.avatarButton}
				onPress={handlePick}
				disabled={loading}
				activeOpacity={0.7}
			>
				<Image
					source={
						avatarUrl ? { uri: avatarUrl } : { uri: PLACEHOLDER_AVATAR_URL }
					}
					style={styles.avatar}
				/>
			</TouchableOpacity>
			<Text style={styles.avatarHint}>Tap avatar to change</Text>

			<Text style={styles.label}>Username</Text>
			<TextInput
				style={styles.input}
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
			/>

			<Text style={styles.label}>Bio</Text>
			<TextInput
				style={[styles.input, { height: 80 }]}
				multiline
				value={bio}
				onChangeText={setBio}
				placeholder="Tell us about yourself"
			/>

			<TouchableOpacity
				style={styles.button}
				onPress={handleSave}
				disabled={loading}
			>
				<Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: Colors.background,
	},
	label: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
		marginBottom: 8,
	},
	input: {
		backgroundColor: Colors.backgroundAlt,
		color: Colors.textOther,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 10,
		marginBottom: 16,
	},
	buttonText: {
		color: Colors.text,
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
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
