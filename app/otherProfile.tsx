import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function OtherProfile() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const [profile, setProfile] = useState<{
		username: string | null;
		avatar_url: string | null;
		created_at: string | null;
		bio: string | null;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!params.userId) {
				setProfile(null);
				setLoading(false);
				return;
			}
			const { data, error } = await supabase
				.from('profiles')
				.select('username, bio, avatar_url, created_at')
				.eq('id', params.userId)
				.single();
			if (error) {
				setProfile(null);
			} else {
				setProfile(data);
			}
			setLoading(false);
		};
		fetchProfile();
	}, [params.userId]);

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
				<Text>Profile not found.</Text>
			</View>
		);
	}

	const joinDate = profile.created_at
		? new Date(profile.created_at).toLocaleDateString()
		: 'Unknown';

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollContainer}
				contentContainerStyle={{ alignItems: 'center' }}
			>
				<Image
					source={
						profile.avatar_url
							? { uri: profile.avatar_url }
							: require('@/assets/images/react-logo.png')
					}
					style={styles.avatar}
				/>
				<Text style={styles.username}>{profile.username || 'No username'}</Text>
				<Text style={styles.bio}>{profile.bio || ''}</Text>
				<Text style={styles.joinDate}>Joined: {joinDate}</Text>
			</ScrollView>
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
	scrollContainer: {
		flexGrow: 1,
		padding: 20,
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 20,
		backgroundColor: '#333',
	},
	username: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#eee',
		marginBottom: 8,
	},
	bio: {
		fontSize: 18,
		color: '#ccc',
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
	backButton: {
		marginTop: 16,
		marginBottom: 16,
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: '#333',
		alignSelf: 'flex-start',
	},
	backButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});
