import { Provider } from 'react-redux';
import { SnipprApp } from '@snippr/ui';
import { store } from '@snippr/redux';
import * as Linking from 'expo-linking';
import * as Sentry from 'sentry-expo';
import screens from './src/screens';

const prefix = Linking.createURL('/');

Sentry.init({
    debug: process.env.ENVIRONMENT !== 'production',
    dsn: '',
    environment: process.env.ENVIRONMENT,
    enableInExpoDevelopment: true,
});

export default function App() {
    const linking = {
        prefixes: [prefix],
        config: {
            initialRouteName: 'Home',
            screens: {
                'Profile Settings': { path: 'profile-settings' },
                'Address Book': { path: 'address-book' },
                'Book a Snip': { path: 'book-a-snip' },
                'Snipper Profile': { path: 'profile' },
                'Not Found': '*',
            },
        } 
    }

    return (
        <Provider store={store}>
            <SnipprApp
                linking={linking}
                screens={screens}
                tenant={process.env.CUSTOMER_AUTH_TENANT}
            />
        </Provider>
    );
}