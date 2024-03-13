import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState, useEffect } from 'react';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';
import { useDispatch, useSelector } from 'react-redux';

import {
    Divider,
    EmptyListing,
    Listing,
} from '@snippr/snipprui';

import {
    Basket,
    LocationPicker,
    Screen,
    SnipperCard,
    useLoading,
} from '@snippr/ui';

import { features } from '@snippr/redux';

const SnipperComparison = ({ navigation }) => {
    const dispatch = useDispatch();
    const app = useSelector((state) => state.app);
    const locations = useSelector((state) => state.locations);
    const snipper = useSelector((state) => state.snipper);
    const user = useSelector((state) => state.user);
    const { basket: { contents, summary } } = useContext(Basket.Context);
    const snippr = new SNIPPR(app.tenant);
    
    const [available_snippers, set_available_snippers] = useState(false);
    
    const [init, init_loading] = useLoading(async () => {
        await snippr.users(user.uid).get_users_by_coverage(
            locations.current[CONSTANTS.FIELDS.LOCATIONS.LATITUDE],
            locations.current[CONSTANTS.FIELDS.LOCATIONS.LONGITUDE],
            user.uid,
            true
        ).then((local_competent_users) => {
            set_available_snippers(local_competent_users);
        });
    });

    useEffect(() => {
        if (summary?.count) {
            init();
        } else {
            handle_back();
        }
    }, [contents, summary, locations.current]);

    const handle_snipper_select = (selected_snipper) => {
        dispatch(features.snipper.actions.setSnipper(selected_snipper));
        navigation.navigate('Schedule Snip');
    }

    const handle_back = () => {
        dispatch(features.snipper.actions.setSnipper(null));
        navigation.goBack();
    }

    return (
        <Screen
            init={init}
            refresh={init}
            onBack={snipper ? handle_back : null}
            title='Choose your Snipper'
            text="If you'd like to take a closer look, tap on a Snipper to view their full profile"
        >
            <LocationPicker style={{marginTop: layout.spacing_sizes.xsmall}} />

            <Divider style={{marginVertical: layout.spacing_sizes.standard}} />

            <Listing
                data={available_snippers}
                component={<SnipperCard action={handle_snipper_select} comparison />}
                emptyComponent={<EmptyListing title='No Snippers available' text='No compatible Snippers found, try changing your location.' />}
            />
        </Screen>
    );
}

export default SnipperComparison;