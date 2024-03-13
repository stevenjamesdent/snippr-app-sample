import * as CONSTANTS from '@snippr/constants';
import SNIPPR from '@snippr/sdk';

import React, { useContext, useState } from 'react';
import { Text } from 'react-native';
import { isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { colors, fonts, global_styles, graphics, icons, layout } from '@snippr/snipprui';

import {
    Button,
    Divider,
    GraphicBanner,
    Listing,
    Location,
} from '@snippr/snipprui';

import {
    LocationForm,
    Screen,
    useLoading,
    useUpload,
} from '@snippr/ui';

import { features } from '@snippr/redux';

const AddressBook = ({ navigation }) => {
    const dispatch = useDispatch();
    const app = useSelector((state) => state.app);
    const locations = useSelector((state) => state.locations);
    const user = useSelector((state) => state.user);
    const snippr = new SNIPPR(app.tenant);

    const [focused_address, set_focused_address] = useState(null);
    const [address_form_active, set_address_form_active] = useState(false);

    const [init, init_loading] = useLoading(async () => {
        await snippr.locations().get_user_locations(user.uid)
            .then((user_locations) => handle_update_locations(user_locations));
    });

    const [upload_photo, photo_uploading, photo_progress] = useUpload();

    const [handle_address_submit, address_submit_loading] = useLoading(async (data) => {
        const label = data.label?.length ? data.label : null;

        if (focused_address) {
            if (data?.photo === null) {
                await snippr.media(user.uid).delete_asset(
                    CONSTANTS.SETTINGS.MEDIA.DIRECTORIES.LOCATIONS,
                    focused_address.id
                );
            } else if (data?.photo) {
                await upload_photo(
                    CONSTANTS.SETTINGS.MEDIA.DIRECTORIES.LOCATIONS,
                    data.photo,
                    focused_address.id,
                );
            }
            await snippr.locations().update_location(
                user.uid,
                focused_address.id,
                label,
                data.latitude,
                data.longitude,
                data.postcode,
                data.address,
                data.loqate_id,
                data.geocode_id
            ).then((user_locations) => handle_update_locations(user_locations));
        } else {
            await snippr.locations().add_location(
                user.uid,
                label,
                data.latitude,
                data.longitude,
                data.postcode,
                data.address,
                data.loqate_id,
                data.geocode_id
            ).then(async (user_locations) => {
                if (data?.photo) {
                    const added_location = user_locations.find(
                        (location) => location[CONSTANTS.FIELDS.LOCATIONS.LOQATE_ID] === data.loqate_id
                    );

                    await upload_photo(
                        CONSTANTS.SETTINGS.MEDIA.DIRECTORIES.LOCATIONS,
                        data.photo,
                        added_location.id,
                    );
                }

                init();
            });
        }
    });

    const handle_update_locations = (locations) => {
        dispatch(features.locations.actions.setAvailableLocations(locations));
        handle_dismiss_address_form();
    }

    const [handle_address_delete, address_delete_loading] = useLoading(async () => {
        if (focused_address) {
            if (isEqual(locations.current, focused_address)) {
                dispatch(features.locations.actions.setCurrentLocation(null));
            }
            
            await snippr.locations().delete_location(user.uid, focused_address.id).then((user_locations) => {
                handle_update_locations(user_locations);
                handle_dismiss_address_form();
            });
        }
    });
    
    const handle_open_address_form = (address = null) => {
        set_focused_address(address);
        set_address_form_active(true);
    }

    const handle_dismiss_address_form = () => {
        set_focused_address(null);
        set_address_form_active(false);
    }

    return (
        <Screen
            init={init}
            progress={photo_progress}
            refresh={init}
        >
            <GraphicBanner
                graphic={graphics.route}
                graphicHeight={100}
                graphicWidth={100}
                horizontal
                text="Manage your saved locations for future Snips"
                title="Address Book"
            />

            <Listing
                style={{ marginVertical: layout.spacing_sizes.standard }}
                data={locations.available}
                component={<Location onPress={(address) => handle_open_address_form(address)} />}
            />

            <Button
                collapse
                icon={icons.icon_plus}
                onPress={() => handle_open_address_form()}
                title="Add Address"
            />

            <LocationForm
                active={address_form_active}
                data={focused_address}
                onDelete={handle_address_delete}
                onDismiss={handle_dismiss_address_form}
                onSubmit={handle_address_submit}
            />
        </Screen>
    );
}

export default AddressBook;