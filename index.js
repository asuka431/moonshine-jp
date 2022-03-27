/**

https://reactnative.dev/docs/appregistry
AppRegistry is the JS entry point to running all React Native apps. App root components should register themselves with 
AppRegistry.registerComponent, then the native system can load the bundle for the app and then actually run the app when 
it's ready by invoking


 */

import {AppRegistry} from 'react-native';
import Root from './Root';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Root);
