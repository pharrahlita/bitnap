import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
	const router = useRouter();
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [currentMonth, setCurrentMonth] = useState<string>('');
	const [refreshing, setRefreshing] = useState(false);
	const [journals, setJournals] = useState<any[]>([]);
	const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const flatListRef = useRef<FlatList<any>>(null);
	const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
	const flatListDateRef = useRef<FlatList<any>>(null);

	const fetchJournals = async () => {
		try {
			const { data, error } = await supabase
				.from('journals')
				.select('*')
				.order('date', { ascending: true });

			if (error) {
				console.error('Error fetching journals:', error);
				return;
			}

			setJournals(data);
		} catch (err) {
			console.error('Unexpected error:', err);
		}
	};

	useEffect(() => {
		fetchJournals();
	}, []);

	const scrollToDate = (date: string) => {
		const index = journals.findIndex(
			(journal) => format(new Date(journal.date), 'yyyy-MM-dd') === date
		);

		if (index !== -1 && flatListRef.current) {
			try {
				flatListRef.current.scrollToIndex({ index, animated: true });
			} catch (error) {
				console.warn('scrollToIndex failed:', error);
			}
		}

		scrollToDateInHorizontalList(date);
	};

	const scrollToDateInHorizontalList = (date: string) => {
		const index = weekDates.findIndex((d) => d.formattedDate === date);

		if (index !== -1 && flatListDateRef.current) {
			try {
				flatListDateRef.current.scrollToIndex({ index, animated: true });
			} catch (error) {
				console.warn('scrollToIndex failed:', error);
			}
		}
	};

	const handleMomentumScrollEnd = ({
		nativeEvent,
	}: {
		nativeEvent: { contentOffset: { x: number } };
	}) => {
		const visibleIndex = Math.round(
			nativeEvent.contentOffset.x / 100 // Adjust based on item width
		);

		if (visibleIndex >= 0 && visibleIndex < journals.length) {
			const visibleDate = format(
				new Date(journals[visibleIndex].date),
				'yyyy-MM-dd'
			);
			setHighlightedDate(visibleDate); // Highlight the date after scrolling ends
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchJournals();
		setRefreshing(false);
	};

	const journalEntries = journals.map((journal) => ({
		id: journal.id,
		date: journal.date,
		title: journal.title,
		content: journal.content,
		tags: journal.dream_type ? [journal.dream_type] : [],
	}));

	const generateDates = () => {
		const sortedEntries = journalEntries.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		const uniqueDates = new Set();
		const dates: {
			day: string;
			date: string;
			month: string;
			moonPhase: string;
			formattedDate: string;
		}[] = [];

		sortedEntries.forEach((entry) => {
			const entryDate = format(new Date(entry.date), 'yyyy-MM-dd'); // Use full date for uniqueness
			if (!uniqueDates.has(entryDate)) {
				uniqueDates.add(entryDate);
				dates.push({
					day: format(new Date(entry.date), 'EEE'),
					date: format(new Date(entry.date), 'dd'),
					month: format(new Date(entry.date), 'MM'),
					formattedDate: format(new Date(entry.date), 'yyyy-MM-dd'), // ADD THIS
					moonPhase: 'moon.full',
				});
			}
		});

		return dates;
	};

	const weekDates = generateDates();

	useEffect(() => {
		const todayIndex = weekDates.findIndex(
			(date) => date.date === format(new Date(), 'dd')
		);
		if (todayIndex !== -1 && flatListRef.current) {
			flatListRef.current.scrollToIndex({
				index: todayIndex,
				animated: true,
			});
		}
	}, []);

	const getItemLayout = (data: any, index: number) => ({
		length: 60, // Assuming each item has a fixed width of 60
		offset: 60 * index,
		index,
	});

	const onViewableItemsChanged = ({
		viewableItems,
	}: {
		viewableItems: { item: any }[];
	}) => {
		if (viewableItems.length > 0) {
			const visibleDate = format(
				new Date(viewableItems[0].item.date),
				'yyyy-MM-dd'
			);
			const index = weekDates.findIndex((d) => d.formattedDate === visibleDate);
			setSelectedDate(visibleDate);
			setCurrentMonth(
				format(new Date(viewableItems[0].item.date), 'MMMM yyyy')
			);

			if (index !== -1 && flatListDateRef.current) {
				try {
					flatListDateRef.current.scrollToIndex({ index, animated: true });
				} catch (error) {
					console.warn('scrollToIndex failed:', error);
				}
			}
		}
	};

	// Filter journals based on search
	const filteredEntries = journalEntries.filter(
		(entry) =>
			entry.title.toLowerCase().includes(search.toLowerCase()) ||
			entry.content.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<SafeAreaView style={styles.container}>
			{/* Month Header with Search Icon */}
			<View style={styles.header}>
				<Text style={styles.monthHeader}>{currentMonth}</Text>
				<TouchableOpacity
					onPress={() => {
						if (showSearch) setSearch('');
						setShowSearch((prev) => !prev);
					}}
				>
					<Icon
						name={showSearch ? 'close' : 'magnify'}
						size={28}
						color="#fff"
					/>
				</TouchableOpacity>
			</View>

			{/* Search Bar (conditionally rendered) */}
			{showSearch && (
				<View style={styles.searchBarContainer}>
					<TextInput
						style={styles.searchBar}
						placeholder="Search your dreams..."
						placeholderTextColor="#aaa"
						value={search}
						onChangeText={setSearch}
						autoFocus
					/>
				</View>
			)}

			{/* Date Scroller */}
			<View style={styles.dateScroller}>
				<View style={{ position: 'relative' }}>
					<FlatList
						ref={flatListDateRef}
						horizontal
						data={weekDates}
						keyExtractor={(item, index) => index.toString()}
						viewabilityConfig={viewabilityConfig.current}
						showsHorizontalScrollIndicator={false} // Hides the scroll bar on iOS
						getItemLayout={getItemLayout} // Ensures scrollToIndex works correctly
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => {
									scrollToDate(item.formattedDate);
								}}
								style={[
									styles.dateItem,
									selectedDate === item.formattedDate && styles.selectedDate,
								]}
							>
								<Text style={styles.dateText}>{item.day}</Text>
								<Icon style={styles.moonPhase} name={'moon-waxing-gibbous'} />
								<Text style={styles.dateText}>{item.date}</Text>
							</TouchableOpacity>
						)}
						onMomentumScrollEnd={handleMomentumScrollEnd}
						style={{ paddingHorizontal: 15 }}
					/>
				</View>
			</View>

			{/* Journal Entries List */}
			<FlatList
				ref={flatListRef}
				data={filteredEntries}
				keyExtractor={(item) => item.id}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig.current}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							router.push({
								pathname: '/journalContents',
								params: {
									title: item.title,
									content: item.content,
									tags: item.tags,
								},
							})
						}
					>
						<View style={styles.entryItemOuter}>
							<Text style={styles.entryDate}>
								{new Date(item.date).toDateString()}
							</Text>
							<View style={styles.entryItem}>
								<Text style={styles.entryTitle}>{item.title}</Text>
								<Text style={styles.entryContent}>{item.content}</Text>
								{/* Tag square at the bottom right */}
								{item.tags && item.tags.length > 0 && (
									<View style={styles.tagSquareContainer}>
										<Text style={styles.tagSquare}>{item.tags}</Text>
									</View>
								)}
							</View>
						</View>
					</TouchableOpacity>
				)}
				style={styles.entryList}
				refreshing={refreshing}
				onRefresh={onRefresh}
				getItemLayout={(data, index) => ({
					length: 100, // Approximate height of each item
					offset: 100 * index, // Offset based on item height
					index,
				})}
			/>

			{/* Add Button */}
			<TouchableOpacity
				style={styles.addButton}
				onPress={() => navigation.navigate('createJournalEntry')}
			>
				<Text style={styles.addButtonText}>+</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 5,
		backgroundColor: '#1c1c1c',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		justifyContent: 'space-between',
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	monthHeader: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	searchBarContainer: {
		width: '100%',
		paddingHorizontal: 16,
	},
	searchBar: {
		backgroundColor: '#2e2e2e',
		color: '#fff',
		borderRadius: 10,
		padding: 10,
		marginBottom: 12,
		width: '100%',
	},
	dateScroller: {
		marginBottom: 16,
		maxHeight: 80, // Prevents stretching on mobile
		flexShrink: 1, // Ensures the content doesn't stretch unnecessarily
		alignItems: 'flex-start', // Aligns content to the start
		overflow: 'hidden',
	},
	dateItem: {
		marginRight: 4,
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		width: 60,
		justifyContent: 'space-between',
	},
	dateText: {
		color: '#fff',
		fontSize: 16,
	},
	moonPhase: {
		fontSize: 24,
		color: '#fff',
	},
	entryList: {
		flex: 1, // Ensures the list takes up remaining space
		width: '100%',
		marginBottom: 48,
	},
	entryItemOuter: {
		marginBottom: 24,
		marginHorizontal: 16,
	},
	entryItem: {
		backgroundColor: '#222',
		padding: 16,
		borderRadius: 8,
	},
	entryDate: {
		color: '#aaa',
		marginBottom: 8,
		textAlign: 'right',
	},
	entryTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	entryContent: {
		color: '#aaa',
		marginTop: 8,
	},
	tagsContainer: {
		flexDirection: 'row',
		marginTop: 8,
	},
	tag: {
		backgroundColor: '#333',
		color: '#fff',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		marginRight: 8,
	},
	selectedDate: {
		backgroundColor: Colors.primary,
		borderRadius: 8,
	},
	addButton: {
		position: 'absolute',
		bottom: 100,
		right: 20,
		width: 60,
		height: 60,
		borderRadius: 12,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	addButtonText: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
	},
	tagSquareContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 8,
	},
	tagSquare: {
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: '#333',
		color: '#fff',
		fontSize: 12,
		overflow: 'hidden',
	},
});
