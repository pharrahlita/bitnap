import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors.tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarShowLabel: false,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: 'absolute',
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
								marginTop: 15,
								tintColor: focused ? '#fff' : undefined, // White when focused
							}}
							resizeMode="contain"
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('@/assets/images/icons/user.png')}
							style={{
								width: 36,
								height: 36,
								marginTop: 15,
								tintColor: focused ? '#fff' : undefined, // White when focused
							}}
							resizeMode="contain"
						/>
					),
				}}
			/>
		</Tabs>
	);
}
