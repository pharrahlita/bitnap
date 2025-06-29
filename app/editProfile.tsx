import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import * as ImagePicker from 'expo-image-picker';
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
	const [avatarUrl, setAvatarUrl] = useState('');
	const [loading, setLoading] = useState(false);

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

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			const publicUrl = await uploadAvatar(uri);

			if (publicUrl) setAvatarUrl(publicUrl);
			alert('Avatar updated successfully');
		}
	};

	const uploadAvatar = async (uri: string) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('No user');

		const fileExt = uri.split('.').pop();
		const fileName = `${user.id}_${Date.now()}.${fileExt}`;
		const contentType =
			fileExt === 'png'
				? 'image/png'
				: fileExt === 'jpg' || fileExt === 'jpeg'
				? 'image/jpeg'
				: 'application/octet-stream';

		// Use fetch to get the Blob from the local file URI
		const response = await fetch(uri);
		const blob = await response.blob();

		// Check blob size for debugging
		console.log('Blob size:', blob.size);

		const { error: uploadError } = await supabase.storage
			.from('avatars')
			.upload(fileName, blob, {
				upsert: true,
				contentType,
			});

		if (uploadError) throw uploadError;

		const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
		return data.publicUrl;
	};

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
			Alert.alert('Profile updated');
			router.back();
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				style={styles.avatarButton}
				onPress={pickImage}
				disabled={loading}
				activeOpacity={0.7}
			>
				<Image
					source={
						avatarUrl
							? { uri: avatarUrl }
							: require('../assets/images/react-logo.png')
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
		marginTop: 16,
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
		width: 100,
		height: 100,
		borderRadius: 50,
		alignSelf: 'center',
		marginTop: 16,
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
		marginBottom: 8,
	},
});
