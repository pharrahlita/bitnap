import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
	Alert,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function CreateJournalEntry() {
	const navigation = useNavigation();
	const [title, setTitle] = useState('');
	const [contents, setContents] = useState('');
	const [dreamType, setDreamType] = useState('Standard');
	const [date, setDate] = useState(new Date());
	const [feelings, setFeelings] = useState('');
	const [interpretation, setInterpretation] = useState('');
	const [isDatePickerVisible, setDatePickerVisible] = useState(false);

	const scrollViewRef = useRef<ScrollView>(null);

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
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAwareScrollView style={styles.container}>
				<TextInput
					style={styles.input}
					placeholder="Title"
					placeholderTextColor="#aaa"
					value={title}
					onChangeText={setTitle}
				/>

				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Contents"
					placeholderTextColor="#aaa"
					value={contents}
					onChangeText={setContents}
					multiline
				/>

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

				<TextInput
					style={[styles.input, styles.textArea]}
					multiline
					textAlignVertical="top"
					placeholder="How did the dream make you feel?"
					placeholderTextColor="#aaa"
					value={feelings}
					onChangeText={setFeelings}
				/>

				{/* Interpretation Input */}
				<TextInput
					style={[styles.input, styles.textArea]}
					multiline
					textAlignVertical="top"
					placeholder="What do you think it meant?"
					placeholderTextColor="#aaa"
					value={interpretation}
					onChangeText={setInterpretation}
				/>

				<TouchableOpacity style={styles.button} onPress={handleSave}>
					<Text style={styles.buttonText}>Save</Text>
				</TouchableOpacity>
			</KeyboardAwareScrollView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#1c1c1c',
	},
	title: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	input: {
		backgroundColor: '#2e2e2e',
		color: Colors.dark.text,
		padding: 12,
		borderRadius: 10,
		marginBottom: 16,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	horizontalPickerContainer: {
		backgroundColor: '#333',
		borderRadius: 10,
		marginBottom: 16,
		padding: 8,
	},
	horizontalPickerItem: {
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	selectedPickerItem: {
		backgroundColor: Colors.dark.primary,
		borderRadius: 10,
	},
	pickerItemText: {
		color: '#fff',
	},
	button: {
		backgroundColor: Colors.dark.primary,
		padding: 14,
		borderRadius: 10,
		marginBottom: 16,
	},
	buttonText: {
		color: Colors.dark.text,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	datePickerContainer: {
		backgroundColor: '#2e2e2e',
		borderRadius: 10,
		marginBottom: 16,
		padding: 12,
	},
	datePickerButtonText: {
		color: '#fff',
	},
});
