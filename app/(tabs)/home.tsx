import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

export default function Profile() {
	const [refreshing, setRefreshing] = useState(false);
	const [dreams, setDreams] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchFeed();
		setRefreshing(false);
	};

	const fetchFeed = async () => {
		setLoading(true);

		// 1. Get current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const userId = user?.id;
		if (!user) {
			setDreams([]);
			setLoading(false);
			return;
		}

		// 2. Get buddy user IDs
		const { data: buddies } = await supabase
			.from('buddies')
			.select('user_id, buddy_id, status')
			.or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
			.eq('status', 'accepted');
		const buddyIds = buddies
			? buddies.map((b) => (b.user_id === userId ? b.buddy_id : b.user_id))
			: [];

		const buddyAndSelfIds = [...buddyIds, userId];

		// 3. Fetch dreams from buddies
		const { data: dreamsData, error } = await supabase
			.from('journals')
			.select('id, title, content, created_at, user_id')
			.in('user_id', buddyAndSelfIds)
			.eq('visibility', 'buddies')
			.order('created_at', { ascending: false });

		if (!error) setDreams(dreamsData || []);

		setLoading(false);
	};

	useEffect(() => {
		fetchFeed();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" color="#fff" />
			) : (
				<FlatList
					data={dreams}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16 }}
					ListEmptyComponent={
						<Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
							No dreams from your buddies yet.
						</Text>
					}
					renderItem={({ item }) => (
						<View style={styles.dreamCard}>
							<Text style={styles.dreamTitle}>{item.title}</Text>
							<Text style={styles.dreamContent}>{item.content}</Text>
							<Text style={styles.dreamDate}>
								{new Date(item.created_at).toLocaleString()}
							</Text>
						</View>
					)}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 5,
		backgroundColor: Colors.background,
	},
	dreamCard: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	dreamTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 6,
	},
	dreamContent: {
		color: '#eee',
		marginBottom: 8,
	},
	dreamDate: {
		color: '#aaa',
		fontSize: 12,
		textAlign: 'right',
	},
});
