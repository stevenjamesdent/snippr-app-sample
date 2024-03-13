import * as CONSTANTS from '@snippr/constants';

import { icons } from "@snippr/snipprui";

import AddressBook from "./app/AddressBook";
import Favourites from './app/Favourites';
import Home from "./app/Home";
import ProfileSettings from "./app/ProfileSettings";
import ScheduleSnip from "./app/ScheduleSnip";
import SnipCheckout from "./app/SnipCheckout";
import SnipperComparison from "./app/SnipperComparison";
import SnipperProfileScreen from "./app/SnipperProfile";
import SnipperStorefront from "./app/SnipperStorefront";
import SnipPriority from "./app/SnipPriority";

import Doorman from "./auth/Doorman";

import {
    Login,
    SnipHistory,
} from '@snippr/snipprui';

import {
    Account,
    Contact,
    Inbox,
    Signup,
} from '@snippr/ui';

const screens = {
    auth_screens: [
        {
            component: Login,
            name: 'Login'
        },
        {
            component: Signup,
            name: 'Signup'
        },
        {
            component: Doorman,
            name: 'Doorman'
        },
    ],
    app_screens: [
        {
            component: Home,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.CORE, 
            icon: icons.icon_home,
            name: 'Home',
        },
        {
            component: SnipPriority,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.CORE,
            icon: icons.icon_scissors,
            name: 'Book a Snip',
        },
        {
            component: Favourites,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.CORE,
            icon: icons.icon_heart_solid,
            name: 'Favourites',
        },
        {
            component: SnipHistory,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.CORE,
            icon: icons.icon_clock_recurring,
            name: 'Snip History',
        },
        {
            component: SnipperComparison,
            name: 'Snipper Comparison',
        },
        {
            component: ScheduleSnip,
            name: 'Schedule Snip',
        },
        {
            component: SnipCheckout,
            name: 'Snip Checkout',
        },
        {
            component: SnipperStorefront,
            name: 'Snipper Storefront',
        },
        {
            component: SnipperProfileScreen,
            name: 'Snipper Profile',
        },
        {
            component: ProfileSettings,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.SETTINGS,
            icon: icons.icon_profile,
            name: 'Profile Settings',
        },
        {
            component: AddressBook,
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.SETTINGS,
            icon: icons.icon_cog,
            name: 'Address Book',
        },
        {
            component: Inbox,
            name: 'Inbox',
        },
        {
            component: Account,
            display_name: 'Account & Support',
            group: CONSTANTS.SETTINGS.NAVIGATION.GROUPS.SETTINGS, 
            icon: icons.icon_chat,
            name: 'Account',
            onboarding: true,
        },
        {
            component: Contact,
            name: 'Contact',
            onboarding: true,
        },
    ]
};

export default screens;