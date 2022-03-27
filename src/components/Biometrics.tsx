import React, { memo } from "react";
import PropTypes from "prop-types";
import {
	StyleSheet,
	View,
	TouchableOpacity
} from "react-native";
import { systemWeights } from "react-native-typography";
import { Text, Ionicons, MaterialCommunityIcons } from "../styles/components";

interface General {
	biometricTypeSupported: string, //FaceID or TouchID
	retryAuthentication: (boolean) => void
}
const GetIcon = ({ biometricTypeSupported = "", retryAuthentication = () => null }: General) => {
	try {
		if (biometricTypeSupported === "FaceID") {
			return (
				<TouchableOpacity activeOpacity={0.6} onPress={retryAuthentication} style={styles.container}>
					<MaterialCommunityIcons type="white" name={"face"} size={65} />
					<Text type="white" style={styles.text}>
						顔認証成功！イケメン！
					</Text>
					<Text type="white" style={styles.smallText}>もう一度</Text>
				</TouchableOpacity>
			);
		}
		if (biometricTypeSupported === "TouchID") {
			return (
				<TouchableOpacity activeOpacity={0.6} onPress={retryAuthentication} style={styles.container}>
					<Ionicons type="white" name={"ios-finger-print"} size={65} />
					<Text type="white" style={styles.text}>
						指紋認証成功
					</Text>
					<Text type="white" style={styles.smallText}>もう一度</Text>
				</TouchableOpacity>
			);
		}
		return(
			<TouchableOpacity activeOpacity={0.6} onPress={retryAuthentication} style={styles.container}>
				<Ionicons type="white" name={"ios-finger-print"} size={65} />
				<Text type="white" style={styles.text}>
					あなたのデバイスは生体認証機能に対応していないかも...
				</Text>
				<Text type="white" style={styles.smallText}>もう一度</Text>
			</TouchableOpacity>
		);
	} catch (e) {
		return(
			<View style={styles.container}>
				<Ionicons type="white" name={"ios-finger-print"} size={65} />
				<Text type="white" style={styles.text}>
				あなたのデバイスは生体認証機能に対応していないかも...
				</Text>
			</View>
		);
	}
};

interface BiometricsComponent extends General {
	style?: object
}
const _Biometrics = ({ style = {}, biometricTypeSupported = "", retryAuthentication = () => null }: BiometricsComponent) => {
	return (
		<View style={[styles.container, { ...style }]}>
			<GetIcon biometricTypeSupported={biometricTypeSupported} retryAuthentication={() => retryAuthentication(true)} />
		</View>
	);
};

_Biometrics.protoTypes = {
	biometricTypeSupported: PropTypes.bool.isRequired,
	retryAuthentication: PropTypes.func.isRequired,
	style: PropTypes.object
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "center"
	},
	text: {
		...systemWeights.regular,
		fontSize: 18,
		textAlign: "center",
		marginHorizontal: 20
	},
	smallText: {
		...systemWeights.light,
		fontSize: 16,
		textAlign: "center",
		marginHorizontal: 20,
		marginTop: 5
	}
});

//ComponentShouldNotUpdate
const Biometrics = memo(
	_Biometrics,
	() => true
);
export default Biometrics;
