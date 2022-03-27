import React, {useEffect, memo} from "react";
import {StyleSheet, View, LayoutAnimation, Platform, Image, Linking, Dimensions, PixelRatio} from "react-native";
import {systemWeights} from "react-native-typography";
import Button from "./Button";
import { Text } from "../styles/components";

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale 
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

const updates = [
	"Cloned github://coreyphillips/moonshine",
	"Added support for Canada eCoin.",
	"Themed with Canada eCoin colours.",
];

const _Welcome = ({ onClose = () => null, children = <View /> } = {}) => {

	if (Platform.OS === "ios") useEffect(() => LayoutAnimation.easeInEaseOut());
	return (
		<View style={styles.container}>
			<Text style={styles.header}>moonshine Coin Mobile</Text>
			<Image
				style={styles.icon}
				source={require("../assets/logo/main_icon.png")}
			/>
			<View style={{ width: "100%" }}>
				{children}

				<Text style={[styles.subHeader, { textAlign: "center" }]}>Thank you for trying the Canada eCoin experience.</Text>

				<Text style={styles.subHeader}>BETA TESTERS ONLY</Text>
				<Text style={styles.text}>This software is currently in the beta testing phase.  Please refrain from storing any value in this software while not testing it.  </Text>
				<Text style={styles.subHeader}>Will you join us?</Text>

				<Text style={styles.text}>Find us in our community social channels:</Text>
				<Text
					onPress={() => Linking.openURL("https://twitter.com/CanadaeCoin").catch((e) => console.log(e))}
					style={[styles.text, { marginTop: 5 }]}
				>
					<Text style={styles.semiBoldText}>Twitter: </Text>@CanadaeCoin
				</Text>
				<Text
					onPress={() => Linking.openURL("https://discord.gg/Z8DufnQ").catch((e) => console.log(e))}
					style={[styles.text, { marginTop: 5 }]}
				>
					<Text style={styles.semiBoldText}>Discord:</Text>discord.gg/Z8DufnQ
				</Text>
				<Text
					onPress={() => Linking.openURL("http://keybase.io/team/CanadaeCoin").catch((e) => console.log(e))}
					style={[styles.text, { marginTop: 5 }]}
				>
					<Text style={styles.semiBoldText}>Keybase: </Text>keybase.io/team/CanadaeCoin
				</Text>
				<Text
					onPress={() => Linking.openURL("mailto:support@canadaecoin.foundation?subject=Requesting some help RE: the moonshine wallet.").catch((e) => console.log(e))}
					style={[styles.text, { marginTop: 5 }]}
				>
					<Text style={styles.semiBoldText}>Email: </Text>support@canadaecoin.foundation
				</Text>
			</View>
			<Button text="continue" style={{marginVertical: 30}} onPress={onClose} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		margin: 10,
		paddingBottom: 20
	},
	icon: {
		width: 80, height: 80, marginBottom: 20
	},
	header: {
		...systemWeights.semibold,
		textAlign: "center",
		margin: 20,
		marginTop: 30,
		fontSize: normalize(24)
	},
	text: {
		...systemWeights.regular,
		fontSize: normalize(15),
		alignSelf: "flex-start",
		textAlign: "left",
		marginTop: 10
	},
	semiBoldText: {
		...systemWeights.semibold,
		fontSize: normalize(13),
		alignSelf: "flex-start",
		textAlign: "left",
		marginTop: 10
	},
	subHeader: {
		...systemWeights.light,
		marginTop: 30,
		fontSize: normalize(15),
		alignSelf: "flex-start",
		textAlign: "left",
		...systemWeights.semibold
	}
});

//ComponentShouldNotUpdate
const Welcome = memo(
	_Welcome,
	(prevProps, nextProps) => {
		if (!prevProps || !nextProps) return true;
		return prevProps === nextProps;
	}
);

export default Welcome;
