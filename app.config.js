import 'dotenv/config';

export default {
	expo: {
		name: 'bitnap',
		slug: 'bitnap',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/images/bitnap_highres_logo.png',
		scheme: 'bitnap',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			bundleIdentifier: 'com.nuhm.bitnap',
			supportsTablet: true,
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
				NSPhotoLibraryUsageDescription:
					'Allow Bitnap to access your photos for profile picture uploads.',
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/images/adaptive-icon.png',
				backgroundColor: '#3E3748',
			},
			edgeToEdgeEnabled: true,
		},
		web: {
			bundler: 'metro',
			output: 'static',
			favicon: './assets/images/bitnap_highres_logo.png',
		},
		plugins: [
			'expo-router',
			[
				'expo-splash-screen',
				{
					image: './assets/images/bitnap_highres_logo.png',
					imageWidth: 240,
					resizeMode: 'contain',
					backgroundColor: '#3E3748',
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
			eas: {
				projectId: 'b08b2ca9-d3fe-4f2b-8a27-7c591dfe0cc5',
			},
		},
	},
};
