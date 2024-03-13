import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Button,
    Cutout,
    Divider,
    EmptyListing,
    Listing,
    Logo,
} from '@snippr/snipprui';

import {
    Screen,
    Snip,
    useLoading,
} from '@snippr/ui';

const Home = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const app = useSelector((state) => state.app);

    const snippr = new SNIPPR(app.tenant);

    const [upcoming_snips, set_upcoming_snips] = useState(false);

    const lookup_range_days = 30;

    const [init, init_loading] = useLoading(async () => {
        await snippr.snips().get_snips(
                user.uid,
                moment().format(CONSTANTS.SETTINGS.MOMENT.FORMATS.DATE.UTIL),
                moment().add(lookup_range_days, 'days').format(CONSTANTS.SETTINGS.MOMENT.FORMATS.DATE.UTIL)
            ).then((user_snips) => {
                set_upcoming_snips(user_snips);
            });
    });

    return (
        <Screen
            dark
            gutter={false}
            init={init}
            logo={false}
            navbarBg={colors.brand_colors.navy}
            refresh={init}
        >
            <View style={styles.banner}>
                <Logo theme="light" scale={0.65} />
                <Text style={styles.tagline}>
                    Snips made simple
                </Text>
                <Cutout position="bottom left" theme="light" />
            </View>

            <View style={{paddingTop: layout.screen_gutter, paddingHorizontal: layout.screen_gutter}}>
                <Cutout position="top right" />

                <Text style={global_styles.typography.heading_three}>Need a Snip quick?</Text>
                <Text style={global_styles.typography.body_text}>
                    Get that mop sorted before slots run out!
                </Text>
                <View style={[global_styles.layout.button_list, {marginTop: layout.spacing_sizes.small}]}>
                    <Button theme={global_styles.buttons.secondary} collapse={true} title="Book a new Snip" onPress={() => navigation.navigate('Book a Snip')} />
                </View>

                <Divider style={{marginVertical: layout.spacing_sizes.standard}} />
                
                <Text style={global_styles.typography.heading_four}>Your Upcoming Snips</Text>
                <Text style={[global_styles.typography.body_text, {marginBottom: layout.spacing_sizes.small}]}>In the next {lookup_range_days} days</Text>
                
                {upcoming_snips &&
                    <Listing
                        component={<Snip onCancellation={init} />}
                        data={upcoming_snips}
                        emptyComponent={<EmptyListing icon={icons.icon_scissors} text='Time to book your next Snip!' />}
                        spacing={layout.spacing_sizes.standard}
                    />
                }
            </View>
        </Screen>
    );
}

export default Home;

const styles = StyleSheet.create({
    banner: {
        backgroundColor: colors.brand_colors.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: layout.spacing_sizes.xxlarge,
    },
    tagline: {
        fontFamily: fonts.font_styles.script,
        fontSize: fonts.font_sizes.heading_three,
        color: colors.base_colors.grey_light,
        marginTop: layout.spacing_sizes.small,
    },
})