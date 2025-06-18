import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Profile() {
	const [profile, setProfile] = useState<{
		username: string | null;
		avatar_url: string | null;
		created_at: string | null;
		bio: string | null;
	} | null>(null);
	const [buddyCount, setBuddyCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

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
			.select('username, bio, avatar_url, created_at')
			.eq('id', user.id)
			.single();

		if (error) {
			console.error('Error loading profile:', error.message);
			setProfile(null);
		} else {
			setProfile(data);
		}

		// Fetch buddy count
		const { count, error: buddyError } = await supabase
			.from('buddies')
			.select('*', { count: 'exact', head: true })
			.or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
			.eq('status', 'accepted');
		if (!buddyError) setBuddyCount(count || 0);

		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		fetchProfile();
	};

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
			<ScrollView
				contentContainerStyle={{ alignItems: 'center', marginTop: 40 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
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
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/buddies')}
				>
					<Text style={styles.editButtonText}>Buddies: {buddyCount || 0}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/editProfile')}
				>
					<Text style={styles.editButtonText}>Edit Profile</Text>
				</TouchableOpacity>
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
	editButton: {
		marginTop: 24,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: '#333',
	},
	editButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});
