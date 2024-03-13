import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Hint,
} from '@snippr/snipprui';

import {
    Customer,
    CustomerProfileForm,
    Screen,
    useLoading,
    useUpload,
} from '@snippr/ui';

import { features } from '@snippr/redux';

const ProfileSettings = ({ navigation }) => {
    const dispatch = useDispatch();
    const app = useSelector((state) => state.app);
    const profile = useSelector((state) => state.profile);
    const user = useSelector((state) => state.user);
    const snippr = new SNIPPR(app.tenant);

    const [edit_form_active, set_edit_form_active] = useState(false);

    const [init, init_loading] = useLoading(async () => {
        await snippr.users(user.uid).get_user()
            .then((user_data) => {
                dispatch(features.profile.actions.setProfile(user_data.profile));
            });
    });

    const [upload_avatar, avatar_uploading, avatar_progress] = useUpload();

    const [handle_submit, submit_loading] = useLoading(async (data) => {
        if (data?.avatar === null) {
            await snippr.media(user.uid).delete_asset(
                null,
                CONSTANTS.SETTINGS.MEDIA.FILES.AVATAR
            );
        } else if (data?.avatar) {
            await upload_avatar(
                null,
                data.avatar,
                CONSTANTS.SETTINGS.MEDIA.FILES.AVATAR,
            );
        }

        await snippr.users(user.uid).update_user(
            null,
            null,
            null,
            data.preferences
        ).then((user_data) => {
            dispatch(features.profile.actions.setProfile(user_data.profile));
        });

        set_edit_form_active(false);
    });

    return (
        <Screen
            init={init}
            progress={avatar_progress}
            refresh={init}
            text='Control what your Snippers will see when you book a Snip'
            title='Profile Settings'
        >
            <TouchableOpacity onPress={() => set_edit_form_active(true)}>
                <Customer data={profile} />
                <View style={global_styles.layout.flex_center}>
                    <Hint hint='Tap to edit' icon={icons.icon_touch} style={{marginLeft: 'auto', marginTop: layout.spacing_sizes.small}} />
                </View>
            </TouchableOpacity>

            <CustomerProfileForm
                data={profile}
                active={edit_form_active}
                onDismiss={() => set_edit_form_active(false)}
                onSubmit={handle_submit}
            />
        </Screen>
    );
}

export default ProfileSettings;