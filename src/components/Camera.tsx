import React, {memo, useState} from "react";
import {
	StyleSheet,
	View,
	Text
} from "react-native";
import PropTypes from "prop-types";
import { RNCamera } from 'react-native-camera';
import { systemWeights } from "react-native-typography";
import EvilIcon from "react-native-vector-icons/EvilIcons";
import XButton from "./XButton";

const {
	Constants: {
		colors
	}
} = require("../../ProjectData.json");

interface CameraComponent {
	onBarCodeRead: Function,
	onClose: Function
}
const _Camera = ({ onBarCodeRead = () => null, onClose = () => null }: CameraComponent) => {
	const [_data, setData] = useState("");
	const notAuthorizedView = (
		<View style={styles.notAuthorizedView}>
			<EvilIcon name={"exclamation"} size={60} />
			<Text style={[styles.boldText, { marginVertical: 10 }]}>カメラにアクセスすることができませんでした...</Text>
			<Text style={styles.text}>機能を有効にするにはアプリ設定からアクセスを許可してください。</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<RNCamera
				captureAudio={false}
				ref={ref => {
					// @ts-ignore
					this.camera = ref;
				}}
				style={styles.container}
				onBarCodeRead={({ data }) => {
					if (_data !== data) {
						setData(data);
						onBarCodeRead(data);
					}
				}}
				onMountError={() => {
					alert("カメラのロードに失敗しました。端末の設定からアプリの権限を確認してください。");
					onClose();
				}}
				notAuthorizedView={notAuthorizedView}
				type={RNCamera.Constants.Type.back}
				flashMode={RNCamera.Constants.FlashMode.on}
				androidCameraPermissionOptions={{
					title: "カメラ使用を許可",
					message: "カメラ！使わせて！",
					buttonPositive: "いいよぉ！",
					buttonNegative: "ノォォォ！",
				}}
			/>
			<View style={styles.xButton}>
				<XButton onPress={onClose} />
			</View>
		</View>
	);
};

_Camera.propTypes = {
	onBarCodeRead: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eee",
		zIndex: 999
	},
	notAuthorizedView: {
		flex: 1,
		top: -40,
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20
	},
	xButton: {
		position: "absolute",
		alignItems: "center",
		left: 0,
		right: 0,
		bottom: 10,
		zIndex: 1000
	},
	text: {
		...systemWeights.regular,
		fontSize: 18,
		textAlign: "center"
	},
	boldText: {
		...systemWeights.bold,
		fontSize: 18,
		textAlign: "center"
	},
});

//ComponentShouldNotUpdate
const Camera = memo(
	_Camera,
	() => true
);

export default Camera;

