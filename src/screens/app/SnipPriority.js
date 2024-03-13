import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import { features } from '@snippr/redux';

import {
    Button,
    Divider,
    EmptyListing,
    GraphicBanner,
    Listing,
} from '@snippr/snipprui';

import {
    Basket,
    LocationPicker,
    Prompt,
    Screen,
    SnipperCard,
    Storefront,
    useLoading,
} from '@snippr/ui';

const SnipPriority = ({ navigation }) => {
    const dispatch = useDispatch();
    const app = useSelector((state) => state.app);
    const locations = useSelector((state) => state.locations);
    const user = useSelector((state) => state.user);
    const snippr = new SNIPPR(app.tenant);
    
    const snip_priority = 'snip';
    const snipper_priority = 'snipper';
    const default_priority = snipper_priority;

    const { clear_basket } = useContext(Basket.Context);

    const [available_snippers, set_available_snippers] = useState(false);
    const [active_storefront_category, set_active_storefront_category] = useState(null);
    const [selected_snipper, set_selected_snipper] = useState(null);
    const [confirm_discard, set_confirm_discard] = useState(false);

    const [init, init_loading] = useLoading(async () => {
        if (app.priority === snipper_priority && locations.current) {
            await snippr.users(user.uid).get_users_by_coverage(
                locations.current[CONSTANTS.FIELDS.LOCATIONS.LATITUDE],
                locations.current[CONSTANTS.FIELDS.LOCATIONS.LONGITUDE],
                user.uid
            ).then((local_snippers) => {
                set_available_snippers(local_snippers);
            });
        }
    });

    useEffect(() => {
        init();
    }, [locations.current]);

    useEffect(() => {
        if (!app.priority) {
            dispatch(features.app.actions.setPriority(default_priority));
        }
    }, [app.priority]);

    useEffect(() => {
        selected_snipper && confirm_snipper();
    }, [selected_snipper]);

    const [confirm_snipper, confirm_snipper_loading] = useLoading(async (confirmed = false) => {
        const snipper_suitability = await snippr.users(user.uid).get_users_suitability(
            selected_snipper.id
        );

        if (snipper_suitability?.suitable || confirmed) {
            if (!snipper_suitability?.suitable) {
                clear_basket(
                    snipper_suitability.unsupported?.snippets ?? null,
                    snipper_suitability.unsupported?.extras ?? null
                );
            }
            
            set_confirm_discard(false);
            dispatch(features.snipper.actions.setSnipper(selected_snipper));
            set_selected_snipper(null);
            navigation.navigate('Snipper Storefront');
        } else {
            set_confirm_discard(true);
        }
    });

    const handle_continue = async (data) => {
        switch (app.priority) {
            case snip_priority :
                dispatch(features.snipper.actions.setSnipper(null));
                navigation.navigate('Snipper Comparison');
                break;
            case snipper_priority :
                set_selected_snipper(data);
                break;
        }
    }

    const handle_cancel_snipper_select = () => {
        set_confirm_discard(false);
        set_selected_snipper(null);
    }

    const handle_priority_change = (selected_priority) => {
        selected_priority === snip_priority && dispatch(features.snipper.actions.setSnipper(null));
        dispatch(features.app.actions.setPriority(selected_priority));
    }

    return (
        <Screen
            init={init}
            onBack={active_storefront_category ? () => set_active_storefront_category(null) : null}
            refresh={init}
        >
            <Prompt
                active={confirm_discard}
                text="Some of the items currently in your basket are not offered by this Snipper, would you like to continue with this Snipper and remove the incompatible items?"
                title="Unsupported Basket Contents"
                actions={[
                    {title: 'Cancel', handler: handle_cancel_snipper_select},
                    {title: 'Continue with Snipper', theme: global_styles.buttons.primary, handler: () => confirm_snipper(true)}
                ]}
            />

            <LocationPicker style={{marginBottom: layout.spacing_sizes.small}} />

            {locations.available?.length > 0 &&
                <>
                    <View style={styles.priority}>
                        <Button
                            theme={app.priority === snip_priority ? styles.active_priority : styles.inactive_priority}
                            title="By Snip"
                            onPress={() => handle_priority_change(snip_priority)}
                        />
                        <Button style={{marginHorizontal: layout.spacing_sizes.xxsmall}}
                            theme={app.priority === snipper_priority ? styles.active_priority : styles.inactive_priority}
                            title="By Snipper"
                            onPress={() => handle_priority_change(snipper_priority)}
                        />
                    </View>

                    {
                        app.priority === snip_priority ? 
                            <Storefront snipperless />
                        :
                        app.priority === snipper_priority &&
                            <>
                                <GraphicBanner
                                    horizontal
                                    graphic={graphics.haircut}
                                    graphicHeight={100}
                                    graphicWidth={100}
                                    title='Start with your Snipper'
                                    text='Choose your Snipper then you can organise the what, when and where'
                                />
                                <Divider style={{marginVertical: layout.spacing_sizes.standard}} />
                                <Listing
                                    data={available_snippers}
                                    component={<SnipperCard action={handle_continue} />}
                                    emptyComponent={<EmptyListing title='No Snippers available' text='No compatible Snippers found, try changing your location.' />}
                                />
                            </>
                    }
                </>
            }
        </Screen>
    );
}

export default SnipPriority;

const styles = StyleSheet.create({
    priority: {
        ...global_styles.layout.button_list,
        ...global_styles.misc.mega_rounded,
        backgroundColor: colors.base_colors.off_white,
        marginBottom: layout.spacing_sizes.standard,
        padding: layout.spacing_sizes.xxsmall,
    },
    active_priority: {
        ...global_styles.buttons.primary,
    },
    inactive_priority: {
        ...global_styles.buttons.tertiary,
        button: { opacity: 0.75 }
    },
})