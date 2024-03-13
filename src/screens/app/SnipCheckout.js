import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState } from 'react';
import { View, Text } from 'react-native';
import * as Sentry from 'sentry-expo';
import { useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Button,
    Divider,
    FloatingPanel,
    Location,
} from '@snippr/snipprui';

import {
    Basket,
    Bookings,
    BottomSheet,
    Celebration,
    Form,
    Links,
    Receipt,
    Screen,
    SnipperCard,
    useLoading,
    usePaymentSheet,
} from '@snippr/ui';

const SnipCheckout = ({ navigation }) => {
    const app = useSelector((state) => state.app);
    const locations = useSelector((state) => state.locations);
    const snipper = useSelector((state) => state.snipper);
    const user = useSelector((state) => state.user);
    
    const { basket, checkout_basket } = useContext(Basket.Context);
    const snippr = new SNIPPR(app.tenant);

    const [cancellation_policy_active, set_cancellation_policy_active] = useState(false);
    const [checkout_config, set_checkout_config] = useState(null);
    const [checkout_complete, set_checkout_complete] = useState(false);
    const [comments, set_comments] = useState(null);
    const [bookings, set_bookings] = useState(null);
    const [error, set_error] = useState(null);

    const [init, init_loading] = useLoading(async () => {
        await Promise.all([
            snippr.snips().get_snip_checkout_config(user.uid),
            snippr.schedules(user.uid).get_schedule_bookings(),
        ]).then(([snip_checkout_config, snip_bookings]) => {
            set_checkout_config(snip_checkout_config);
            set_bookings(snip_bookings);
        });
    });

    const handle_exit = () => checkout_basket(() => {
        set_checkout_complete(null);
        navigation.navigate('Home');
    });

    const [handle_payment_complete, checkout_loading] = useLoading(async () => {
        if (comments?.length) {
            await snippr.snips().add_checkout_metadata(
                checkout_config.stripe_config.stripe_payment_intent_id,
                {
                    [CONSTANTS.SETTINGS.METADATA.CHECKOUT.COMMENTS]: comments,
                }
            ).catch((error) => console.error(error));
        }

        set_checkout_complete(true);
    });

    const handle_payment_error = (error) => {
        console.error(error);
        Sentry.Native.captureException(error);
        set_error(error.message ?? CONSTANTS.ERRORS.DEFAULT);
    }

    const [checkout_ready, present_checkout] = usePaymentSheet(
        checkout_config?.stripe_config,
        handle_payment_complete,
        handle_payment_error
    );
    
    return (
        <Screen
            cta={{
                action: present_checkout,
                label: 'Checkout',
                disabled: checkout_ready ? false : true,
            }}
            errors={error}
            init={init}
            onBack={checkout_complete ? handle_exit : null}
            refresh={init}
            text="Just give your Snip a quick check over before you confirm and pay:"
            title="Almost There"
        >
            <View style={{ gap: layout.spacing_sizes.standard }}>
                <Links>
                    <Links.Link
                        icon={icons.icon_info}
                        label={CONSTANTS.BUSINESS.DISCLAIMERS.CANCELLATIONS.POLICY.BRIEF}
                        onPress={() => set_cancellation_policy_active(true)}
                        style={{ width: '100%', justifyContent: 'space-between', backgroundColor: colors.brand_colors.cyan_x_light }}
                    />
                </Links>

                <Divider />

                <SnipperCard data={snipper} />

                <FloatingPanel padding={layout.spacing_sizes.small}>
                    <Location data={locations.current} />
                </FloatingPanel>

                {bookings && <Bookings style={{ marginHorizontal: layout.screen_gutter * -1 }} data={bookings} basket={basket} />}

                {checkout_config && <Receipt data={checkout_config.receipt} /> }

                <Divider />
                
                <Form onChange={(data) => set_comments(data[CONSTANTS.SETTINGS.METADATA.CHECKOUT.COMMENTS])}>
                    <Form.Text
                        label="Additional Info"
                        multiline
                        name={CONSTANTS.SETTINGS.METADATA.CHECKOUT.COMMENTS}
                        placeholder="Anything else you'd like your Snipper to know regarding this Snip?"
                    />
                </Form>
            </View>

            <Celebration
                active={checkout_complete}
                text="That's all booked for you, thanks for using SNIPPR!"
                title="All sorted!"
            >
                <View style={[global_styles.layout.flex_center, {justifyContent: 'center'}]}>
                    <Button
                        collapse
                        onPress={handle_exit}
                        theme={global_styles.buttons.tertiary}
                        title="Take Me Home"
                    />
                </View>
            </Celebration>

            <BottomSheet active={cancellation_policy_active} onDismiss={() => set_cancellation_policy_active(false)}>
                <Text style={global_styles.typography.heading_four}>SNIPPR LTD Cancellation Policy</Text>
                <Text style={global_styles.typography.body_text}>{CONSTANTS.BUSINESS.DISCLAIMERS.CANCELLATIONS.POLICY.DETAIL}</Text>
            </BottomSheet>
        </Screen>
    );
}

export default SnipCheckout;