import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from './uploadAvatar';

/**
 * Opens the image picker, uploads the selected image, and returns the public URL.
 * Returns null if the user cancels or upload fails.
 */
export async function pickImage(): Promise<string | null> {
	try {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			console.log('Picked image URI:', uri);
			const publicUrl = await uploadAvatar(uri);
			return publicUrl ?? null;
		}
		return null;
	} catch (err: any) {
		console.error('Image pick/upload error:', err);
		return null;
	}
}
