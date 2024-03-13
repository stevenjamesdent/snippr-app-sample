import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Scheduler,
} from '@snippr/snipprui';

import {
    Screen,
    useLoading,
} from '@snippr/ui';

const ScheduleSnip = ({ navigation }) => {
    const app = useSelector((state) => state.app);
    const locations = useSelector((state) => state.locations);
    const snipper = useSelector((state) => state.snipper);
    const user = useSelector((state) => state.user);
    const snippr = new SNIPPR(app.tenant);

    const [config, set_config] = useState(null);
    const [active_slots, set_active_slots] = useState(config?.step?.slot ?? null);
    
    const back_from_checkout = app.screen.previous?.name === 'Snip Checkout';
    
    const current_step = config?.step?.step ?? null;
    const step_themes = {
        [CONSTANTS.TERMS.BOOKINGS.TYPES.PRE.ID]: {
            accent: colors.brand_colors.red_light,
            background: colors.brand_colors.navy_dark,
            foreground: colors.base_colors.white,
        },
        [CONSTANTS.TERMS.BOOKINGS.TYPES.SNIP.ID]: {
            accent: colors.brand_colors.red_light,
            background: colors.brand_colors.navy,
            foreground: colors.base_colors.white,
        },
        [CONSTANTS.TERMS.BOOKINGS.TYPES.POST.ID]: {
            accent: colors.brand_colors.red_light,
            background: colors.brand_colors.navy_dark,
            foreground: colors.base_colors.white,
        },
    }
    
    const [init, init_loading] = useLoading(async () => {
        await snippr.schedules(user.uid).init_schedule(
            snipper.id,
            locations.current
        ).then((scheduler_config) => {
            set_config(scheduler_config);
        });
    });

    const [set_date, set_date_loading] = useLoading(async (date) => {
        clear_proceeding_steps();
        await snippr.schedules(user.uid).progress(
            date
        ).then((scheduler_config) => {
            set_config({...scheduler_config});
        });
    });

    const [regress, regression_loading] = useLoading(async () => {
        if (!config?.step?.previous) {
            navigation.goBack();
        } else {
            await snippr.schedules(user.uid).regress().then((scheduler_config) => {
                set_config({...scheduler_config});
            });
        }
    });

    const [progress, progression_loading] = useLoading(async () => {
        await snippr.schedules(user.uid).progress(
            config.step.date,
            active_slots[config.step.step_int][config.step.date]
        ).then((scheduler_config) => {
            if (scheduler_config) {
                set_config({...scheduler_config});
            } else {
                navigation.navigate('Snip Checkout');
            }
        });
    });

    const clear_proceeding_steps = () => {
        const current_step_int = config.step.step_int;
        let current_active_slots = active_slots;

        for (const step_int in active_slots) {
            if (step_int > current_step_int) {
                delete current_active_slots[step_int];
            }
        }

        set_active_slots(current_active_slots);
    }

    const handle_slot_change = (slot) => {
        set_active_slots({
            ...active_slots,
            [config.step.step_int]: {
                [config.step.date]: slot
            }
        });
    }
    
    return (
        <Screen
            dark={true}
            gutter={false}
            init={back_from_checkout ? regress : init}
            navbarBg={step_themes[current_step]?.background}
            onBack={regress}
            scroll={false}
            onContinue={progress}
            continueDisabled={config?.step?.date && active_slots?.[config?.step?.step_int]?.[config?.step?.date] ? false : true}
        >
            {config &&
                <Scheduler
                    accentColor={step_themes[current_step]?.accent}
                    activeDate={config?.step?.date ?? null}
                    activeSlot={active_slots?.[config?.step?.step_int]?.[config?.step?.date] ?? null}
                    backgroundColor={step_themes[current_step]?.background}
                    dates={config?.step?.dates ?? null}
                    foregroundColor={step_themes[current_step]?.foreground}
                    intro={`Step ${config?.step?.step_int} of ${config?.step?.step_count}`}
                    onDateChange={set_date}
                    onSlotChange={handle_slot_change}
                    slots={config?.step?.slots ?? null}
                    text={CONSTANTS.SETTINGS.SCHEDULER[current_step].TEXT}
                    title={CONSTANTS.SETTINGS.SCHEDULER[current_step].TITLE}
                />
            }
        </Screen>
    );
}

export default ScheduleSnip;