import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function Buddies() {
	const [refreshing, setRefreshing] = useState(false);
	const [buddies, setBuddies] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [showAdd, setShowAdd] = useState(false);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [adding, setAdding] = useState(false);
	const router = useRouter();

	const fetchBuddies = async () => {
		setLoading(true);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			setBuddies([]);
			setUserId(null);
			setLoading(false);
			return;
		}
		setUserId(user.id);
		// Fetch pending and accepted buddy requests involving the user
		const { data, error } = await supabase
			.from('buddies')
			.select('id, user_id, buddy_id, status')
			.or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`);
		if (error) {
			setBuddies([]);
		} else {
			setBuddies(data || []);
		}
		setLoading(false);
		setRefreshing(false);
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchBuddies();
	};

	useEffect(() => {
		fetchBuddies();
	}, []);

	// Helper to get the other user's id
	const getOtherUserId = (item: any) =>
		item.user_id === userId ? item.buddy_id : item.user_id;

	// Fetch profile info for all buddies
	const [profiles, setProfiles] = useState<Record<string, any>>({});
	useEffect(() => {
		const fetchProfiles = async () => {
			const uniqueIds = Array.from(new Set(buddies.map(getOtherUserId)));
			if (uniqueIds.length === 0) return;
			const { data, error } = await supabase
				.from('profiles')
				.select('id, username, avatar_url')
				.in('id', uniqueIds);
			if (!error && data) {
				const map: Record<string, any> = {};
				data.forEach((p: any) => {
					map[p.id] = p;
				});
				setProfiles(map);
			}
		};
		fetchProfiles();
	}, [buddies]);

	const handleAccept = async (buddyId: string) => {
		const buddy = buddies.find((b) => b.id === buddyId);
		if (!buddy) return;
		await supabase
			.from('buddies')
			.update({ status: 'accepted' })
			.eq('id', buddyId);
		setBuddies(
			buddies.map((b) => (b.id === buddyId ? { ...b, status: 'accepted' } : b))
		);
		fetchBuddies();
	};

	const handleDecline = async (buddyId: string) => {
		await supabase.from('buddies').delete().eq('id', buddyId);
		setBuddies(buddies.filter((b) => b.id !== buddyId));
		fetchBuddies();
	};

	// Collect all user IDs that are already buddies (accepted)
	const acceptedBuddyUserIds = new Set([
		...buddies
			.filter((b) => b.status === 'accepted')
			.map((b) => (b.user_id === userId ? b.buddy_id : b.user_id)),
		userId, // always exclude self
	]);
	// Collect all user IDs with pending requests
	const pendingBuddyUserIds = new Set(
		buddies
			.filter((b) => b.status === 'pending')
			.map((b) => (b.user_id === userId ? b.buddy_id : b.user_id))
	);

	const handleSearch = async () => {
		if (!search.trim()) return;
		setAdding(true);
		const { data, error } = await supabase
			.from('profiles')
			.select('id, username, avatar_url')
			.ilike('username', `%${search.trim()}%`);
		// Exclude users already buddies (accepted)
		const filtered = (data || []).filter(
			(item) => !acceptedBuddyUserIds.has(item.id)
		);
		setSearchResults(filtered);
		setAdding(false);
	};

	const handleAddBuddy = async (buddyId: string) => {
		setAdding(true);
		await supabase
			.from('buddies')
			.insert({ user_id: userId, buddy_id: buddyId, status: 'pending' });
		setAdding(false);
		setShowAdd(false);
		setSearch('');
		setSearchResults([]);
		fetchBuddies();
	};

	const handleRemoveBuddy = (buddyId: string, username: string) => {
		Alert.alert(
			'Remove Buddy',
			`Are you sure you want to remove ${username} from being a buddy?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					style: 'destructive',
					onPress: async () => {
						const { error } = await supabase
							.from('buddies')
							.delete()
							.eq('id', buddyId);
						if (!error) {
							setBuddies(buddies.filter((b) => b.id !== buddyId));
						} else {
							alert('Failed to remove buddy: ' + error.message);
						}
					},
				},
			]
		);
	};

	if (loading) {
		return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.addBuddyBtn}
				onPress={() => setShowAdd(!showAdd)}
			>
				<Text style={styles.addBuddyBtnText}>
					{showAdd ? 'Close' : 'Add Buddy'}
				</Text>
			</TouchableOpacity>
			{showAdd && (
				<View style={styles.addBuddyContainer}>
					<TextInput
						style={styles.input}
						placeholder="Search username..."
						placeholderTextColor="#888"
						value={search}
						onChangeText={setSearch}
						onSubmitEditing={handleSearch}
						editable={!adding}
					/>
					<TouchableOpacity
						style={styles.searchBtn}
						onPress={handleSearch}
						disabled={adding}
					>
						<Text style={styles.btnText}>
							{adding ? 'Searching...' : 'Search'}
						</Text>
					</TouchableOpacity>
					<FlatList
						data={searchResults}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => {
							const isPending = pendingBuddyUserIds.has(item.id);
							return (
								<View style={styles.row}>
									{item.avatar_url ? (
										<Image
											source={{ uri: item.avatar_url }}
											style={styles.avatar}
										/>
									) : (
										<View
											style={[styles.avatar, { backgroundColor: '#444' }]}
										/>
									)}
									<Text style={styles.username}>{item.username}</Text>
									{isPending ? (
										<Text style={styles.pendingText}>Pending</Text>
									) : (
										<TouchableOpacity
											style={styles.acceptBtn}
											onPress={() => handleAddBuddy(item.id)}
											disabled={adding}
										>
											<Text style={styles.btnText}>Add</Text>
										</TouchableOpacity>
									)}
								</View>
							);
						}}
					/>
				</View>
			)}
			<FlatList
				data={buddies}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					const otherId = getOtherUserId(item);
					const profile = profiles[otherId];
					return (
						<View style={styles.row}>
							<TouchableOpacity
								style={{
									flex: 1,
									flexDirection: 'row',
									alignItems: 'center',
								}}
								onPress={() =>
									router.push({
										pathname: '../otherProfile',
										params: { userId: otherId },
									})
								}
							>
								{profile?.avatar_url ? (
									<Image
										source={{ uri: profile.avatar_url }}
										style={styles.avatar}
									/>
								) : (
									<View style={[styles.avatar]} />
								)}
								<Text style={styles.username}>
									{profile?.username || 'Unknown'}
								</Text>
							</TouchableOpacity>
							{item.status === 'pending' && item.buddy_id === userId && (
								<>
									<TouchableOpacity
										style={styles.acceptBtn}
										onPress={() => handleAccept(item.id)}
									>
										<Text style={styles.btnText}>Accept</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.declineBtn}
										onPress={() => handleDecline(item.id)}
									>
										<Text style={styles.btnText}>Decline</Text>
									</TouchableOpacity>
								</>
							)}
							{item.status === 'pending' && item.user_id === userId && (
								<Text style={styles.pendingText}>Pending</Text>
							)}
							{item.status === 'accepted' && (
								<TouchableOpacity
									onPress={() => handleRemoveBuddy(item.id, profile?.username)}
								>
									<Text style={styles.accepted}>Buddy</Text>
								</TouchableOpacity>
							)}
						</View>
					);
				}}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				ListEmptyComponent={<Text style={styles.text}>No buddies found.</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: Colors.background,
	},
	text: {
		color: '#fff',
		fontSize: FontSizes.medium,
		fontFamily: Fonts.dogicaPixel,
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 8,
		padding: 8,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
		backgroundColor: Colors.backgroundAlt,
	},
	username: {
		fontFamily: Fonts.dogicaPixel,
		color: Colors.textOther,
		fontSize: FontSizes.medium,
		flex: 1,
	},
	acceptBtn: {
		backgroundColor: '#4caf50',
		padding: 8,
		borderRadius: 6,
		marginRight: 8,
	},
	declineBtn: {
		backgroundColor: '#f44336',
		padding: 8,
		borderRadius: 6,
	},
	btnText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: Colors.text,
	},
	accepted: {
		marginHorizontal: 8,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: '#4caf50',
	},
	addBuddyBtn: {
		backgroundColor: Colors.primary,
		padding: 10,
		borderRadius: 8,
		marginBottom: 16,
		alignSelf: 'flex-end',
	},
	addBuddyBtnText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: Colors.text,
	},
	addBuddyContainer: {
		backgroundColor: Colors.backgroundAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	input: {
		backgroundColor: '#fff',
		color: Colors.textAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		width: '100%',
	},
	searchBtn: {
		backgroundColor: Colors.primary,
		padding: 8,
		borderRadius: 6,
		marginBottom: 8,
		alignSelf: 'flex-end',
	},
	pendingText: {
		marginHorizontal: 8,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: '#ffa500',
	},
});
