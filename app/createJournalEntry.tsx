import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DRAFT_KEY = 'journal_draft';
const DRAFT_SAVE_DELAY = 2000; // Save draft 2 seconds after user stops typing

export default function CreateJournalEntry() {
	const navigation = useNavigation();
	const [title, setTitle] = useState('');
	const [contents, setContents] = useState('');
	const [dreamType, setDreamType] = useState('Standard');
	const [date, setDate] = useState(new Date());
	const [interpretation, setInterpretation] = useState('');
	const [moodBefore, setMoodBefore] = useState('');
	const [moodAfter, setMoodAfter] = useState('');
	const [feelings, setFeelings] = useState('');
	const [sleepTime, setSleepTime] = useState<Date | null>(null);
	const [wakeTime, setWakeTime] = useState<Date | null>(null);
	const [isSleepPickerVisible, setSleepPickerVisible] = useState(false);
	const [isWakePickerVisible, setWakePickerVisible] = useState(false);
	const [tags, setTags] = useState<string>('');
	const [tagList, setTagList] = useState<string[]>([]);
	const [sleepQuality, setSleepQuality] = useState<number>(0);
	const [isDatePickerVisible, setDatePickerVisible] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const [visibility, setVisibility] = useState<'private' | 'buddies'>(
		'private'
	);

	// Draft saving states
	const [isDraftLoaded, setIsDraftLoaded] = useState(false);
	const [hasDraft, setHasDraft] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const draftSaveTimeoutRef = useRef<any>(null);
	const [isSavingEntry, setIsSavingEntry] = useState(false);

	// Character limits
	const TITLE_LIMIT = 50;
	const CONTENTS_LIMIT = 1000;
	const INTERPRETATION_LIMIT = 200;
	const FEELINGS_LIMIT = 200;

	const clearDraft = useCallback(async () => {
		try {
			await AsyncStorage.removeItem(DRAFT_KEY);
			setHasDraft(false);
			setLastSaved(null);
			console.log('Draft cleared successfully');
		} catch (error) {
			console.error('Error clearing draft:', error);
		}
	}, []);

	const restoreDraft = useCallback((draft: any) => {
		setTitle(draft.title || '');
		setContents(draft.contents || '');
		setDreamType(draft.dreamType || 'Standard');
		setDate(draft.date ? new Date(draft.date) : new Date());
		setInterpretation(draft.interpretation || '');
		setMoodBefore(draft.moodBefore || '');
		setMoodAfter(draft.moodAfter || '');
		setFeelings(draft.feelings || '');
		setSleepTime(draft.sleepTime ? new Date(draft.sleepTime) : null);
		setWakeTime(draft.wakeTime ? new Date(draft.wakeTime) : null);
		setTagList(draft.tagList || []);
		setSleepQuality(draft.sleepQuality || 0);
		setVisibility(draft.visibility || 'private');
	}, []);

	const loadDraft = useCallback(async () => {
		try {
			const draftData = await AsyncStorage.getItem(DRAFT_KEY);
			console.log(
				'Loading draft data:',
				draftData ? 'Draft found' : 'No draft found'
			);
			if (draftData) {
				const draft = JSON.parse(draftData);
				console.log('Draft content:', {
					title: draft.title,
					hasContent: !!draft.content,
				});
				// Auto-load the draft without asking
				restoreDraft(draft);
				setHasDraft(true);
				setLastSaved(new Date(draft.savedAt));
			}
		} catch (error) {
			console.error('Error loading draft:', error);
		} finally {
			setIsDraftLoaded(true);
		}
	}, [restoreDraft]);

	// Auto-save draft using refs to avoid infinite loops
	const autoSaveDraft = useCallback(() => {
		// Clear existing timeout
		if (draftSaveTimeoutRef.current) {
			clearTimeout(draftSaveTimeoutRef.current);
		}

		// Don't auto-save if we're currently saving an entry or draft not loaded
		if (!isDraftLoaded || isSavingEntry) return;

		const hasContent =
			title.trim() ||
			contents.trim() ||
			interpretation.trim() ||
			feelings.trim();
		if (!hasContent) return;

		// Set new timeout
		draftSaveTimeoutRef.current = setTimeout(async () => {
			try {
				const draftData = {
					title,
					contents,
					dreamType,
					date: date.toISOString(),
					interpretation,
					moodBefore,
					moodAfter,
					feelings,
					sleepTime: sleepTime?.toISOString(),
					wakeTime: wakeTime?.toISOString(),
					tagList,
					sleepQuality,
					visibility,
					savedAt: new Date().toISOString(),
				};

				await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
				setHasDraft(true);
				setLastSaved(new Date());
			} catch (error) {
				console.error('Error auto-saving draft:', error);
			}
		}, DRAFT_SAVE_DELAY);
	}, [
		isDraftLoaded,
		isSavingEntry,
		title,
		contents,
		interpretation,
		feelings,
		dreamType,
		date,
		moodBefore,
		moodAfter,
		sleepTime,
		wakeTime,
		tagList,
		sleepQuality,
		visibility,
	]);

	// Trigger auto-save when content changes
	useEffect(() => {
		autoSaveDraft();
		// Cleanup timeout on unmount
		return () => {
			if (draftSaveTimeoutRef.current) {
				clearTimeout(draftSaveTimeoutRef.current);
			}
		};
	}, [autoSaveDraft]);

	// Load draft on component mount
	useEffect(() => {
		loadDraft();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Intentionally empty - only run once on mount

	// Auto-save when screen loses focus (user navigates away)
	useFocusEffect(
		useCallback(() => {
			return () => {
				// This runs when screen loses focus
				// Don't save if we're currently saving an entry or have no content
				if (isSavingEntry) return;

				const hasContent =
					title.trim() ||
					contents.trim() ||
					interpretation.trim() ||
					feelings.trim();
				if (hasContent && isDraftLoaded) {
					const saveDraftOnBlur = async () => {
						try {
							const draftData = {
								title,
								contents,
								dreamType,
								date: date.toISOString(),
								interpretation,
								moodBefore,
								moodAfter,
								feelings,
								sleepTime: sleepTime?.toISOString(),
								wakeTime: wakeTime?.toISOString(),
								tagList,
								sleepQuality,
								visibility,
								savedAt: new Date().toISOString(),
							};
							await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
						} catch (error) {
							console.error('Error saving draft on blur:', error);
						}
					};
					saveDraftOnBlur();
				}
			};
		}, [
			title,
			contents,
			dreamType,
			date,
			interpretation,
			moodBefore,
			moodAfter,
			feelings,
			sleepTime,
			wakeTime,
			tagList,
			sleepQuality,
			visibility,
			isDraftLoaded,
			isSavingEntry,
		])
	);

	const handleTagInput = (text: string) => {
		// Only add tag if user types a comma
		if (text.endsWith(',')) {
			const newTag = text.replace(/,+$/, '').trim();
			if (newTag && !tagList.includes(newTag)) {
				setTagList([...tagList, newTag]);
			}
			setTags('');
		} else {
			setTags(text);
		}
	};

	const handleRemoveTag = (tag: string) => {
		setTagList(tagList.filter((t) => t !== tag));
	};

	const handleSave = async () => {
		// Set flag to prevent auto-saving while we're saving
		setIsSavingEntry(true);

		// Validation for mandatory fields
		const missingFields = [];
		if (!title.trim()) missingFields.push('Title');
		if (!contents.trim()) missingFields.push('Contents');
		if (!date) missingFields.push('Date');
		if (!dreamType) missingFields.push('Type');

		if (missingFields.length > 0) {
			setIsSavingEntry(false);
			Alert.alert(
				'Missing Required Fields',
				`Please fill in the following: ${missingFields.join(', ')}`
			);
			return;
		}

		try {
			const { data: userData, error: userError } =
				await supabase.auth.getUser();
			if (userError || !userData?.user) {
				console.error('User not authenticated:', userError);
				return;
			}
			const { error } = await supabase.from('journals').insert([
				{
					user_id: userData.user.id,
					title,
					content: contents,
					dream_type: dreamType,
					date,
					feelings,
					interpretation,
					mood_before: moodBefore,
					mood_after: moodAfter,
					sleep_time: sleepTime ? sleepTime.toISOString() : null,
					wake_time: wakeTime ? wakeTime.toISOString() : null,
					tags: tagList.join(','),
					sleep_quality: sleepQuality,
					visibility,
				},
			]);

			if (error) {
				console.error('Error inserting journal:', error);
				setIsSavingEntry(false);
				Alert.alert('Error', 'Failed to save journal entry. Please try again.');
				return;
			}

			// Clear auto-save timeout to prevent saving after successful submission
			if (draftSaveTimeoutRef.current) {
				clearTimeout(draftSaveTimeoutRef.current);
			}

			// Clear draft after successful save
			await clearDraft();

			// Reset form to initial state
			setTitle('');
			setContents('');
			setDreamType('Standard');
			setDate(new Date());
			setInterpretation('');
			setMoodBefore('');
			setMoodAfter('');
			setFeelings('');
			setSleepTime(null);
			setWakeTime(null);
			setTagList([]);
			setSleepQuality(0);
			setVisibility('private');
			setTags('');

			Alert.alert('Success', 'Journal entry saved successfully!', [
				{
					text: 'OK',
					onPress: () => {
						setIsSavingEntry(false); // Reset flag after navigation
						navigation.goBack();
					},
				},
			]);
		} catch (err) {
			console.error('Unexpected error:', err);
			setIsSavingEntry(false);
			Alert.alert('Error', 'An unexpected error occurred. Please try again.');
		}
	};

	if (!isDraftLoaded) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: 'center', alignItems: 'center' },
				]}
			>
				<Text style={styles.subHeading}>Loading...</Text>
			</View>
		);
	}

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
					{/* Draft Status Indicator */}
					{hasDraft && lastSaved && (
						<View style={styles.draftIndicator}>
							<Text style={styles.draftText}>
								Draft loaded from {lastSaved.toLocaleTimeString()}
							</Text>
						</View>
					)}

					<TextInput
						style={[styles.input, styles.inputTitle]}
						placeholder="Title"
						placeholderTextColor={Colors.primary}
						value={title}
						onChangeText={(text) => setTitle(text.slice(0, TITLE_LIMIT))}
						maxLength={TITLE_LIMIT}
						multiline={false}
					/>
					<View style={styles.counterContainer}>
						<Text style={styles.counterText}>
							{title.length}/{TITLE_LIMIT}
						</Text>
					</View>

					<TextInput
						style={[styles.input, styles.textArea]}
						placeholder="Contents"
						placeholderTextColor={Colors.textAlt}
						value={contents}
						onChangeText={(text) => setContents(text.slice(0, CONTENTS_LIMIT))}
						maxLength={CONTENTS_LIMIT}
						multiline
						autoFocus
					/>
					<View style={styles.counterContainer}>
						<Text style={styles.counterText}>
							{contents.length}/{CONTENTS_LIMIT}
						</Text>
					</View>

					<View style={styles.horizontalPickerContainer}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							ref={scrollViewRef}
						>
							{['Standard', 'Nightmare', 'Lucid', 'Daydream', 'Other'].map(
								(type, index) => (
									<TouchableOpacity
										key={type}
										style={[
											styles.horizontalPickerItem,
											dreamType === type && styles.selectedPickerItem,
										]}
										onPress={() => {
											setDreamType(type);
											scrollViewRef.current?.scrollTo({
												x: index * 100, // Adjust based on item width
												animated: true,
											});
										}}
									>
										<Text style={styles.pickerItemText}>{type}</Text>
									</TouchableOpacity>
								)
							)}
						</ScrollView>
					</View>

					<View style={styles.datePickerContainer}>
						<TouchableOpacity onPress={() => setDatePickerVisible(true)}>
							<Text style={styles.datePickerButtonText}>
								{date.toDateString()}
							</Text>
						</TouchableOpacity>

						<DateTimePickerModal
							isVisible={isDatePickerVisible}
							mode="date"
							onConfirm={(selectedDate) => {
								setDatePickerVisible(false);
								setDate(selectedDate);
							}}
							onCancel={() => setDatePickerVisible(false)}
						/>
					</View>

					{/* Tags Input */}
					<View style={styles.tagsContainer}>
						<Text style={styles.subHeading}>
							Custom Tags (seperate with commas):
						</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<TextInput
								style={[styles.input, { flex: 1, marginBottom: 0 }]}
								placeholder="e.g. flying, recurring, nightmare"
								placeholderTextColor={Colors.textAlt}
								value={tags}
								onChangeText={handleTagInput}
								returnKeyType="done"
							/>
						</View>
						<View style={styles.tagList}>
							{tagList.map((tag) => (
								<View key={tag} style={styles.tagItem}>
									<Text style={styles.tagText}>{tag}</Text>
									<TouchableOpacity onPress={() => handleRemoveTag(tag)}>
										<Text style={styles.removeTagText}>×</Text>
									</TouchableOpacity>
								</View>
							))}
						</View>
					</View>

					<Collapsible title="Additional Dream Information">
						{/* Sleep and Wake Time Pickers */}
						<View style={styles.timePickerRow}>
							<View style={{ flex: 1, marginRight: 8 }}>
								<Text style={styles.subHeading}>Sleep Time:</Text>
								<TouchableOpacity
									style={styles.timeButton}
									onPress={() => setSleepPickerVisible(true)}
								>
									<Text style={styles.timeButtonText}>
										{sleepTime
											? sleepTime.toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
											  })
											: 'Set Sleep Time'}
									</Text>
								</TouchableOpacity>
								<DateTimePickerModal
									isVisible={isSleepPickerVisible}
									mode="time"
									onConfirm={(selectedTime) => {
										setSleepPickerVisible(false);
										setSleepTime(selectedTime);
									}}
									onCancel={() => setSleepPickerVisible(false)}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.subHeading}>Wake Time:</Text>
								<TouchableOpacity
									style={styles.timeButton}
									onPress={() => setWakePickerVisible(true)}
								>
									<Text style={styles.timeButtonText}>
										{wakeTime
											? wakeTime.toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
											  })
											: 'Set Wake Time'}
									</Text>
								</TouchableOpacity>
								<DateTimePickerModal
									isVisible={isWakePickerVisible}
									mode="time"
									onConfirm={(selectedTime) => {
										setWakePickerVisible(false);
										setWakeTime(selectedTime);
									}}
									onCancel={() => setWakePickerVisible(false)}
								/>
							</View>
						</View>

						<View style={styles.horizontalPickerContainer}>
							<Text style={styles.subHeading}>Mood before sleep:</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								ref={scrollViewRef}
							>
								{['😁', '☺️', '😑', '🙁', '😟', '😖'].map((type, index) => (
									<TouchableOpacity
										key={type}
										style={[
											styles.horizontalPickerItem,
											moodBefore === type && styles.selectedPickerItem,
										]}
										onPress={() => {
											if (moodBefore === type) {
												setMoodBefore(''); // Deselect if already selected
											} else {
												setMoodBefore(type);
											}
										}}
									>
										<Text style={styles.pickerItemEmoji}>{type}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						<TextInput
							style={[styles.input, styles.textArea]}
							multiline
							textAlignVertical="top"
							placeholder="Was there anything on your mind before sleeping?"
							placeholderTextColor={Colors.textAlt}
							value={feelings}
							onChangeText={(text) =>
								setFeelings(text.slice(0, FEELINGS_LIMIT))
							}
							maxLength={FEELINGS_LIMIT}
						/>
						<View style={styles.counterContainer}>
							<Text style={styles.counterText}>
								{feelings.length}/{FEELINGS_LIMIT}
							</Text>
						</View>

						<View style={styles.horizontalPickerContainer}>
							<Text style={styles.subHeading}>Mood after waking:</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								ref={scrollViewRef}
							>
								{['😁', '☺️', '😑', '🙁', '😟', '😖'].map((type, index) => (
									<TouchableOpacity
										key={type}
										style={[
											styles.horizontalPickerItem,
											moodAfter === type && styles.selectedPickerItem,
										]}
										onPress={() => {
											if (moodAfter === type) {
												setMoodAfter(''); // Deselect if already selected
											} else {
												setMoodAfter(type);
											}
										}}
									>
										<Text style={styles.pickerItemEmoji}>{type}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						<TextInput
							style={[styles.input, styles.textArea]}
							multiline
							textAlignVertical="top"
							placeholder="What do you think it meant?"
							placeholderTextColor={Colors.textAlt}
							value={interpretation}
							onChangeText={(text) =>
								setInterpretation(text.slice(0, INTERPRETATION_LIMIT))
							}
							maxLength={INTERPRETATION_LIMIT}
						/>
						<View style={styles.counterContainer}>
							<Text style={styles.counterText}>
								{interpretation.length}/{INTERPRETATION_LIMIT}
							</Text>
						</View>
					</Collapsible>

					{/* Sleep Quality Rating */}
					<View style={styles.sleepQualityContainer}>
						<Text style={styles.subHeading}>Sleep Quality (optional):</Text>
						<View style={{ flexDirection: 'row', marginTop: 4 }}>
							{[1, 2, 3, 4, 5].map((num) => (
								<TouchableOpacity
									key={num}
									onPress={() =>
										setSleepQuality(num === sleepQuality ? 0 : num)
									}
									style={
										sleepQuality >= num ? styles.starSelected : styles.star
									}
								>
									<Text style={styles.starText}>
										{sleepQuality >= num ? '★' : '☆'}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							marginBottom: 16,
						}}
					>
						<Text
							style={{
								color: Colors.textOther,
								fontFamily: Fonts.dogicaPixel,
								fontSize: FontSizes.medium,
								marginRight: 12,
							}}
						>
							Share with dream buddies
						</Text>
						<Switch
							value={visibility === 'buddies'}
							onValueChange={(val) =>
								setVisibility(val ? 'buddies' : 'private')
							}
							thumbColor={
								visibility === 'buddies' ? Colors.primary : Colors.backgroundAlt
							}
							trackColor={{
								false: Colors.backgroundAlt,
								true: Colors.backgroundAlt,
							}}
						/>
					</View>

					<TouchableOpacity style={styles.button} onPress={handleSave}>
						<Text style={styles.buttonText}>Save</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: Colors.background,
	},
	draftIndicator: {
		backgroundColor: Colors.backgroundAlt,
		padding: 8,
		borderRadius: 6,
		marginBottom: 16,
		alignItems: 'center',
	},
	draftText: {
		color: Colors.textAlt,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	input: {
		backgroundColor: Colors.backgroundAlt,
		color: Colors.textOther,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontSize: 16, // Use regular font for inputs
	},
	inputTitle: {
		color: Colors.primary,
		fontSize: FontSizes.large,
		fontFamily: Fonts.dogicaPixel, // Keep pixel font for title
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
		lineHeight: LineHeights.medium,
	},
	subHeading: {
		margin: 4,
		color: Colors.textOther,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
	},
	horizontalPickerContainer: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 10,
		marginBottom: 16,
		padding: 8,
	},
	horizontalPickerItem: {
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	selectedPickerItem: {
		backgroundColor: Colors.primary,
		borderRadius: 10,
	},
	pickerItemText: {
		color: Colors.text,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	pickerItemEmoji: {
		fontSize: 16,
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 10,
		marginBottom: 16,
	},
	draftButton: {
		backgroundColor: Colors.backgroundAlt,
		marginBottom: 20,
	},
	buttonText: {
		color: Colors.text,
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
	},
	datePickerContainer: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 10,
		marginBottom: 16,
		padding: 12,
	},
	datePickerButtonText: {
		color: Colors.text,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	counterContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: -12,
		marginBottom: 8,
	},
	counterText: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		fontFamily: Fonts.dogicaPixel,
	},
	timePickerRow: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	timeButton: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 8,
		padding: 12,
		alignItems: 'center',
		marginTop: 4,
	},
	timeButtonText: {
		color: Colors.text,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	tagsContainer: {
		marginBottom: 16,
	},
	tagList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 8,
	},
	tagItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 16,
		paddingHorizontal: 10,
		paddingVertical: 4,
		marginRight: 8,
		marginBottom: 8,
	},
	tagText: {
		color: Colors.textOther,
		fontFamily: Fonts.dogicaPixel,
		marginRight: 4,
		fontSize: FontSizes.small,
	},
	removeTagText: {
		color: Colors.primary,
		fontWeight: 'bold',
		fontSize: FontSizes.large,
	},
	sleepQualityContainer: {
		marginBottom: 16,
		alignItems: 'center',
	},
	star: {
		padding: 8,
	},
	starSelected: {
		padding: 8,
	},
	starText: {
		fontSize: FontSizes.extraExtraLarge,
		color: Colors.primary,
	},
});
