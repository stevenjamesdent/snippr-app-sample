import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Screen,
    Storefront,
    useLoading,
} from '@snippr/ui';

const SnipperStorefront = ({ navigation }) => {
    const app = useSelector((state) => state.app);
    const snipper = useSelector((state) => state.snipper);
    const snippr = new SNIPPR(app.tenant);
    
    const [storefront_data, set_storefront_data] = useState(false);

    const [init, init_loading] = useLoading(async () => {
        await snippr.storefronts(snipper.id).get_storefront().then((storefront) => {
            set_storefront_data(storefront);
        });
    });

    return (
        <Screen
            gutter={false}
            init={init}
            refresh={init}
        >
            <Storefront data={storefront_data} />
        </Screen>
    );
}

export default SnipperStorefront;