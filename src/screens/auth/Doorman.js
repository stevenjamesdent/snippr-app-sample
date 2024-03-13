import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { View } from 'react-native';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Button,
    GraphicBanner,
} from '@snippr/snipprui';

import {
    Form,
    LocationInput,
    Prompt,
    Screen,
    useLoading,
} from '@snippr/ui';

const Doorman = ({ navigation }) => {
    const app = useSelector((state) => state.app);
    const snippr = new SNIPPR(app.tenant);

    const [location, set_location] = useState(null);
    const [coverage, set_coverage] = useState(null);
    const [notify, set_notify] = useState(false);
    const [submitted, set_submitted] = useState(false);

    const [check_coverage, coverage_loading] = useLoading(async () => {
        await snippr.areas().is_covered(
            location[CONSTANTS.FIELDS.LOCATIONS.LATITUDE],
            location[CONSTANTS.FIELDS.LOCATIONS.LONGITUDE]
        ).then((location_covered) => set_coverage(location_covered));
    });

    const [submit, submit_loading] = useLoading(async ([submission, legal_data]) => {
        await snippr.submissions().create_submission(
            CONSTANTS.SETTINGS.FORMS.FORMS.COVERAGE_NOTIFICATION,
            {...submission, ...location},
            legal_data
        );

        set_submitted(true);
    });

    const handle_cancel = () => {
        set_location(null);
        set_coverage(null);
    }

    return (
        <Screen>
            <Prompt
                active={coverage !== null && !notify}
                text={coverage ? 'We\'re in your area and excited to have you on board, let\'s get you signed up!' : "Sorry about that! We're working hard to expand our coverage, you can sign up to be notified and we'll let you know when we're in your area."}
                title={coverage ? 'Come on in!' : 'We\'re not in your area yet'}
                actions={
                    coverage ? [
                        { title: 'Cancel', handler: handle_cancel },
                        { title: 'Continue', handler: () => navigation.navigate('Signup'), theme: global_styles.buttons.secondary }
                    ] : [
                        { title: 'Cancel', handler: () => set_coverage(null) },
                        { title: 'Get Notified', handler: () => set_notify(true), theme: global_styles.buttons.primary }
                    ]
                }
            />

            <GraphicBanner
                graphic={graphics.curly}
                text={notify
                    ? "Since we're not in your area yet, you can fill out the form below and we'll drop you a line once we've expanded to cover you."
                    : "Let's make sure we're in your area, just enter your address below and we'll check for Snippers local to you."
                }
                title={notify ? "Get Notified" : "Welcome to SNIPPR!"}
            />

            {
                notify ?
                    <Form
                        legalChecks
                        onSubmit={submit}
                        requiredPreferences={[CONSTANTS.SETTINGS.MARKETING.EMAIL.IDENTIFIER]}
                        submitted={submitted}
                    >
                        <Form.Wrapper style={{ marginTop: layout.spacing_sizes.standard }} title={null} intro={null} submitLabel='Get Notified'>
                            <Form.Text
                                label='Name'
                                name={CONSTANTS.SETTINGS.FORMS.FIELDS.NAME_OR_COMPANY}
                                required
                            />
                            <Form.Email
                                label='Email address'
                                name={CONSTANTS.SETTINGS.FORMS.FIELDS.EMAIL}
                                required
                            />
                        </Form.Wrapper>
                    </Form>
                :
                    <>
                        <LocationInput
                            key={location?.[CONSTANTS.FIELDS.LOCATIONS.LOQATE_ID]}
                            label={null}
                            onChange={set_location}
                            style={{ margin: layout.spacing_sizes.standard }}
                            data={location}
                        />
                        <View style={[global_styles.layout.flex_center, {justifyContent: 'center'}]}>
                            <Button
                                collapse
                                disabled={!location}
                                onPress={check_coverage}
                                title="Let me in!"
                            />
                        </View>
                    </>
            }
        </Screen>
    );
}

export default Doorman;