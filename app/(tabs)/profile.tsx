import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Profile() {
	const [profile, setProfile] = useState<{
		username: string | null;
		avatar_url: string | null;
		created_at: string | null;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setProfile(null);
				setLoading(false);
				return;
			}

			const { data, error } = await supabase
				.from('profiles')
				.select('username, avatar_url, created_at')
				.eq('id', user.id)
				.single();

			if (error) {
				console.error('Error loading profile:', error.message);
				setProfile(null);
			} else {
				setProfile(data);
			}

			setLoading(false);
		};

		fetchProfile();
	}, []);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!profile) {
		return (
			<View style={styles.center}>
				<Text>No profile found.</Text>
			</View>
		);
	}

	const joinDate = profile.created_at
		? new Date(profile.created_at).toLocaleDateString()
		: 'Unknown';

	return (
		<SafeAreaView style={styles.container}>
			<Image
				source={
					profile.avatar_url
						? { uri: profile.avatar_url }
						: require('@/assets/images/react-logo.png')
				}
				style={styles.avatar}
			/>
			<Text style={styles.username}>{profile.username || 'No username'}</Text>
			<Text style={styles.joinDate}>Joined: {joinDate}</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 40,
		backgroundColor: '#1c1c1c',
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 20,
		backgroundColor: '#444', // fallback bg
	},
	username: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#eee',
		marginBottom: 8,
	},
	joinDate: {
		fontSize: 16,
		color: '#aaa',
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
