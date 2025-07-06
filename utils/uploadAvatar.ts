import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';

export async function uploadAvatar(
	uri: string,
	userId?: string
): Promise<string> {
	let user_id = userId;
	if (!user_id) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('No user');
		user_id = user.id;
	}

	let fileExt = uri.split('.').pop();
	if (!fileExt || fileExt.length > 5) fileExt = 'jpg';
	const fileName = `${user_id}/avatar_${Date.now()}.${fileExt}`;
	const contentType =
		fileExt === 'png'
			? 'image/png'
			: fileExt === 'jpg' || fileExt === 'jpeg'
			? 'image/jpeg'
			: 'image/jpeg';

	console.log('Uploading avatar:', { uri, fileName, contentType });

	const { data: signedUrlData, error: signedUrlError } = await supabase.storage
		.from('avatars')
		.createSignedUploadUrl(fileName);

	if (signedUrlError) {
		console.error('Signed URL error:', signedUrlError);
		throw signedUrlError;
	}

	const uploadRes = await FileSystem.uploadAsync(signedUrlData.signedUrl, uri, {
		httpMethod: 'PUT',
		headers: {
			'Content-Type': contentType,
		},
		uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
	});

	console.log('Upload response:', uploadRes);

	if (uploadRes.status !== 200) {
		throw new Error('Failed to upload avatar');
	}

	const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
	console.log('Public URL:', data?.publicUrl);
	return data.publicUrl;
}
