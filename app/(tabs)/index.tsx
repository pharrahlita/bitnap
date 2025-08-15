import { default as closeIcon } from '@/assets/images/icons/close.png';
import { default as searchIcon } from '@/assets/images/icons/search.png';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
	const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
	const flatListRef = useRef<FlatList<any>>(null);
	const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
	const flatListDateRef = useRef<FlatList<any>>(null);

	const fetchJournals = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const userId = user?.id;

		if (!userId) {
			setJournals([]); // or show a message, or redirect to login
			return;
		}

		try {
			const { data, error } = await supabase
				.from('journals')
				.select('*')
				.eq('user_id', userId)
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
		...journal,
		tags: journal.tags ? journal.tags.split(',').filter(Boolean) : [],
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
					formattedDate: format(new Date(entry.date), 'yyyy-MM-dd'),
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
			{/* Month Header with Search and Layout Icon */}
			<View style={styles.header}>
				<Text style={styles.monthHeader}>{currentMonth}</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<TouchableOpacity
						onPress={() =>
							setLayoutMode(layoutMode === 'list' ? 'grid' : 'list')
						}
						accessibilityLabel="Toggle layout"
						style={{ marginRight: 12 }}
					>
						<Image
							source={
								layoutMode === 'list'
									? require('@/assets/images/icons/grid.png')
									: require('@/assets/images/icons/analytics.png')
							}
							style={{ width: 32, height: 32, tintColor: '#fff' }}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							if (showSearch) setSearch('');
							setShowSearch((prev) => !prev);
						}}
					>
						<Image
							source={showSearch ? closeIcon : searchIcon}
							style={{ width: 32, height: 32, tintColor: '#fff' }}
						/>
					</TouchableOpacity>
				</View>
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
							activeOpacity={1}
							onPress={() => {
								scrollToDate(item.formattedDate);
							}}
							style={[
								styles.dateItem,
								selectedDate === item.formattedDate && styles.selectedDate,
							]}
						>
							<Text style={styles.dateText}>{item.day}</Text>
							<Text style={styles.dateText}>{item.date}</Text>
						</TouchableOpacity>
					)}
					onMomentumScrollEnd={handleMomentumScrollEnd}
					style={{ paddingHorizontal: 15 }}
				/>
			</View>

			{/* Journal Entries List or Grid */}
			{layoutMode === 'list' ? (
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
									params: item,
								})
							}
						>
							<View style={styles.entryItemOuter}>
								<View style={styles.entryRow}>
									{/* Thumbnail */}
									<Image
										source={
											item.thumbnail
												? { uri: item.thumbnail }
												: require('@/assets/images/bitnap_highres_logo.png')
										}
										style={styles.thumbnail}
									/>
									{/* Text */}
									<View style={styles.entryContentCol}>
										<Text style={styles.entryTitle}>{item.title}</Text>
										<Text style={styles.entryContent}>{item.content}</Text>
									</View>
								</View>
								{/* Date and tags on the same row at the bottom */}
								<View style={styles.entryFooter}>
									<View style={styles.tagContainer}>
										{item.tags &&
											item.tags.length > 0 &&
											item.tags.map((tag: string, idx: number) => (
												<Text style={styles.tag} key={idx}>
													{tag}
												</Text>
											))}
									</View>
									<Text style={styles.entryDate}>
										{format(new Date(item.date), 'MMM dd, yyyy')} {'    >>'}
									</Text>
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
					key={layoutMode}
				/>
			) : (
				<FlatList
					data={filteredEntries}
					keyExtractor={(item) => item.id}
					numColumns={2}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() =>
								router.push({
									pathname: '/journalContents',
									params: item,
								})
							}
							style={styles.gridItem}
						>
							<Image
								source={
									item.thumbnail
										? { uri: item.thumbnail }
										: require('@/assets/images/bitnap_highres_logo.png')
								}
								style={styles.gridImage}
								resizeMode="cover"
							/>
						</TouchableOpacity>
					)}
					style={styles.gridList}
					contentContainerStyle={{ padding: 8 }}
					key={layoutMode}
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
		fontSize: FontSizes.extraLarge,
		fontFamily: Fonts.dogicaPixelBold,
	},
	searchBarContainer: {
		width: '100%',
		paddingHorizontal: 16,
	},
	searchBar: {
		backgroundColor: '#fff',
		color: Colors.textAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		width: '100%',
	},
	dateScroller: {
		marginBottom: 16,
		maxHeight: 80,
		borderRadius: 8,
		flexShrink: 1,
		alignItems: 'flex-start',
		overflow: 'hidden',
		backgroundColor: Colors.backgroundAlt,
		marginHorizontal: 16,
		paddingVertical: 8,
	},
	dateItem: {
		alignItems: 'center',
		padding: 8,
		width: 60,
		justifyContent: 'space-between',
		marginRight: 8,
	},
	dateText: {
		color: Colors.text,
		fontSize: FontSizes.medium,
		fontFamily: Fonts.dogicaPixelBold,
	},
	entryList: {
		flex: 1,
		width: '100%',
		marginBottom: 48,
	},
	entryItemOuter: {
		marginBottom: 16,
		marginHorizontal: 16,
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 8,
		padding: 12,
	},
	entryDateRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginBottom: 4,
		marginRight: 16,
	},
	entryRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	entryTitle: {
		color: Colors.primary,
		fontSize: FontSizes.medium,
		lineHeight: LineHeights.medium,
		fontWeight: 'bold',
		fontFamily: Fonts.dogicaPixelBold,
		marginBottom: 4,
	},
	entryContent: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		lineHeight: LineHeights.medium,
		fontFamily: Fonts.dogicaPixel,
	},
	thumbnail: {
		width: 64,
		height: 64,
		borderRadius: 8,
		marginRight: 12,
	},
	entryContentCol: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	tagContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 6,
	},
	tag: {
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: Colors.primary,
		color: Colors.text,
		fontSize: FontSizes.small,
		overflow: 'hidden',
		fontFamily: Fonts.dogicaPixel,
		marginRight: 6,
		marginBottom: 4,
	},
	entryFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between', // tags left, date right
		marginTop: 8,
	},
	entryDate: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		textAlign: 'right',
		fontFamily: Fonts.dogicaPixel,
	},
	selectedDate: {
		backgroundColor: Colors.primary,
		borderRadius: 8,
	},
	gridList: {
		flex: 1,
		width: '100%',
		marginBottom: 48,
	},
	gridItem: {
		flex: 1 / 2,
		aspectRatio: 1,
		marginHorizontal: 6,
		marginBottom: 12,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: Colors.backgroundAlt,
		padding: 8,
	},
	gridImage: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
});
