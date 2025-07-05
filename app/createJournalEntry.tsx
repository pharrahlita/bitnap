import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
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

	// Character limits
	const TITLE_LIMIT = 50;
	const CONTENTS_LIMIT = 1000;
	const INTERPRETATION_LIMIT = 200;
	const FEELINGS_LIMIT = 200;

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
		// Validation for mandatory fields
		const missingFields = [];
		if (!title.trim()) missingFields.push('Title');
		if (!contents.trim()) missingFields.push('Contents');
		if (!date) missingFields.push('Date');
		if (!dreamType) missingFields.push('Type');

		if (missingFields.length > 0) {
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
			const { data, error } = await supabase.from('journals').insert([
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
				return;
			}

			navigation.goBack();
		} catch (err) {
			console.error('Unexpected error:', err);
		}
	};

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
	input: {
		backgroundColor: Colors.backgroundAlt,
		color: Colors.textOther,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	inputTitle: {
		color: Colors.primary,
		fontSize: FontSizes.large,
	},
	subHeading: {
		margin: 4,
		color: Colors.textOther,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
		lineHeight: LineHeights.medium,
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
