import { registerRootComponent } from 'expo';
import { init_notifications } from '@snippr/ui';

import App from './App';

init_notifications();

registerRootComponent(App);