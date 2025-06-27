import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
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
	const [isDatePickerVisible, setDatePickerVisible] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);

	// Character limits
	const TITLE_LIMIT = 50;
	const CONTENTS_LIMIT = 1000;
	const INTERPRETATION_LIMIT = 200;
	const FEELINGS_LIMIT = 200;

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
					interpretation,
					mood_before: moodBefore,
					mood_after: moodAfter,
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

					<Collapsible title="Additional Dream Information">
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
										<Text style={styles.pickerItemText}>{type}</Text>
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
										<Text style={styles.pickerItemText}>{type}</Text>
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
		fontFamily: 'PixelifySans',
	},
	inputTitle: {
		color: Colors.primary,
		fontSize: 18,
	},
	subHeading: {
		margin: 4,
		color: Colors.textOther,
		fontFamily: 'PixelifySans',
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	horizontalPickerContainer: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 10,
		marginBottom: 16,
		padding: 8,
	},
	horizontalPickerItem: {
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	selectedPickerItem: {
		backgroundColor: Colors.primary,
		borderRadius: 10,
	},
	pickerItemText: {
		color: Colors.text,
		fontFamily: 'PixelifySans',
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 10,
		marginBottom: 16,
	},
	buttonText: {
		color: Colors.text,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	datePickerContainer: {
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 10,
		marginBottom: 16,
		padding: 12,
	},
	datePickerButtonText: {
		color: Colors.text,
		fontFamily: 'PixelifySans',
	},
	counterContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: -12,
		marginBottom: 8,
	},
	counterText: {
		color: Colors.textOther,
		fontSize: 12,
		fontFamily: 'PixelifySans',
	},
});
