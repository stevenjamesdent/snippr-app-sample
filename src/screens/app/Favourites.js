import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Listing,
} from '@snippr/snipprui';

import {
    Screen,
    SnipperCard,
    useLoading,
} from '@snippr/ui';

const Favourites = ({ navigation }) => {
    const app = useSelector((state) => state.app);
    const user = useSelector((state) => state.user);
    const snippr = new SNIPPR(app.tenant);

    const [profiles, set_profiles] = useState(null);

    const [init, init_loading] = useLoading(async () => {
        await snippr.favourites(user.uid).get_favourite_profiles()
            .then((favourite_profiles) => set_profiles(favourite_profiles));
    });

    return (
        <Screen
            init={init}
            loading={init_loading}
            refresh={init}
            title='Favourite Snippers'
            text='View and manage your favourite Snippers below'
        >
            <Listing
                data={profiles}
                component={<SnipperCard />}
            />
        </Screen>
    );
}

export default Favourites;