import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Screen,
    useLoading,
    SnipperProfile,
} from '@snippr/ui';

const SnipperProfileScreen = ({ navigation, route }) => {
    const app = useSelector((state) => state.app);
    const snippr = new SNIPPR(app.tenant);
    const snipper_id = route.params.user;

    const [snipper_profile, set_snipper_profile] = useState(null);

    useEffect(() => {
        init();
    }, [snipper_id]);

    const [init, init_loading] = useLoading(async () => {
        if (snipper_id) {
            await snippr.users(snipper_id).get_profile()
                .then((user_profile) => set_snipper_profile(user_profile))
                .catch((error) => {
                    console.error(error);
                    navigation.navigate('Not Found');
                });
        }
    });

    return (
        <Screen
            gutter={false}
            init={init}
            loading={init_loading}
            refresh={init}
        >
            {snipper_profile && <SnipperProfile data={snipper_profile} />}
        </Screen>
    );
}

export default SnipperProfileScreen;