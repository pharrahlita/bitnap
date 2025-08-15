import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
	const router = useRouter();

	const handleCreateJournal = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push('/createJournalEntry');
	};

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors.tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: () => (
					<View
						style={{
							backgroundColor: Colors.backgroundAlt,
							flex: 1,
						}}
					/>
				),
				tabBarShowLabel: false,
				tabBarStyle: Platform.select({
					ios: {
						position: 'absolute',
						borderTopColor: 'transparent',
					},
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Journal',
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('@/assets/images/icons/journal.png')}
							style={{
								width: 36,
								height: 36,
								marginTop: 25,
								tintColor: focused ? '#fff' : undefined,
							}}
							resizeMode="contain"
						/>
					),
				}}
			/>

			{/* Create Journal Button as Center Tab */}
			<Tabs.Screen
				name="create"
				options={{
					title: 'Create',
					tabBarIcon: () => (
						<View
							style={{
								backgroundColor: Colors.backgroundAlt,
								width: 80,
								height: 80,
								borderRadius: 40,
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 20,
							}}
						>
							<View
								style={{
									backgroundColor: Colors.primary,
									width: 64,
									height: 64,
									borderRadius: 32,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Image
									source={require('@/assets/images/icons/edit.png')}
									style={{
										width: 36,
										height: 36,
										tintColor: Colors.button,
									}}
									resizeMode="contain"
								/>
							</View>
						</View>
					),
					tabBarButton: (props) => (
						<TouchableOpacity
							style={props.style}
							onPress={handleCreateJournal}
							activeOpacity={0.7}
						>
							{props.children}
						</TouchableOpacity>
					),
				}}
				listeners={{
					tabPress: (e) => {
						e.preventDefault();
						handleCreateJournal();
					},
				}}
			/>

			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('@/assets/images/icons/user.png')}
							style={{
								width: 36,
								height: 36,
								marginTop: 25,
								tintColor: focused ? '#fff' : undefined,
							}}
							resizeMode="contain"
						/>
					),
				}}
			/>
		</Tabs>
	);
}
