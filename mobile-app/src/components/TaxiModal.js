import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal,
    StatusBar,
    ScrollView
} from 'react-native';
import { Icon, Button, Input } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import RadioForm from 'react-native-simple-radio-button';
import OtherPerson from './OtherPerson';
import { fonts } from '../common/font';
import DeviceInfo from 'react-native-device-info';

const hasNotch = DeviceInfo.hasNotch();

export const MAIN_COLOR = colors.TAXIPRIMARY;
export const MAIN_COLOR_DARK = colors.TAXIPRIMARYDARK;
export const SECONDORY_COLOR = colors.TAXISECONDORY;

export default function TaxiModal(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const { settings, tripdata, estimate, bookingModalStatus, onPressCancel, bookNow, payment_mode, setPaymentMode, radioProps, profileData, setProfileData, auth, bookModelLoading, instructionData, setInstructionData, otherPerson, setOtherPerson, mode, formatAmount } = props;

    const mapRef = useRef(null);

    const runFitCoords = () => {
        mapRef.current.fitToCoordinates([{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }, { latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }], {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
        });
    };

    return (
        <View>
            <StatusBar
                hidden={false}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={bookingModalStatus}
                onShow={runFitCoords}
            >
                <View style={styles.container}>
                    <View style={styles.mapcontainer}>
                        {tripdata && tripdata.pickup && tripdata.drop ?
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: (tripdata.pickup.lat),
                                    longitude: (tripdata.pickup.lng),
                                    latitudeDelta: 0.9922,
                                    longitudeDelta: 1.9421
                                }}
                                minZoomLevel={3}
                            >
                                <Marker
                                    coordinate={{ latitude: (tripdata.pickup.lat), longitude: (tripdata.pickup.lng) }}
                                    title={tripdata.pickup.add}
                                    pinColor={colors.GREEN}
                                >
                                </Marker>
                                <Marker
                                    coordinate={{ latitude: (tripdata.drop.lat), longitude: (tripdata.drop.lng) }}
                                    title={tripdata.drop.add}
                                >
                                </Marker>

                                {estimate && estimate.waypoints ?
                                    <Polyline
                                        coordinates={estimate.waypoints}
                                        strokeWidth={5}
                                        strokeColor={colors.INDICATOR_BLUE}
                                    />
                                    : null}

                                {tripdata.drop && tripdata.drop.waypoints && tripdata.drop.waypoints.length > 0 ? tripdata.drop.waypoints.map((item, index) => {
                                    return (
                                        <Marker
                                            coordinate={{ latitude: item.lat, longitude: item.lng }}
                                            pinColor={colors.RED}
                                            title={item.add}
                                            key={index}
                                        >
                                        </Marker>

                                    )
                                })
                                    : null}
                            </MapView>
                            : null}
                    </View>
                    {tripdata.drop && tripdata.drop.waypoints && tripdata.drop.waypoints.length > 0 ? 
                        <View style={[styles.addressBarMul, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row', height:tripdata.drop.waypoints.length == 1 ? 100 : 120}]}>
                            {tripdata && tripdata.pickup && tripdata.drop ?
                                <ScrollView style={[styles.contentStyleMul]} showsVerticalScrollIndicator={false} >
                                    <View style={{flexDirection: isRTL ? 'row-reverse' : 'row', alignItems:'center', marginTop: 10}}>
                                        <View style={styles.hbox1} />
                                        <Text numberOfLines={1} style={[styles.textStyle, { flexDirection: isRTL ? "row-reverse" : "row", marginHorizontal: 5, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{tripdata.pickup.add}</Text>
                                    </View>
                                    {tripdata.drop && tripdata.drop.waypoints && tripdata.drop.waypoints.length > 0 ? tripdata.drop.waypoints.map((item, index) => {
                                        return (
                                            <View key={"key" + index} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop:10 }}>
                                                <View style={styles.hboxMul} />
                                                <Text numberOfLines={1} style={[styles.textStyle, { textAlign: isRTL ? 'right' : 'left', marginHorizontal: 5, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{item.add}</Text>
                                            </View>
                                        ) 
                                        })
                                    : null}
                                    <View style={{flexDirection: isRTL ? 'row-reverse' : 'row', alignItems:'center', marginTop: 10, marginBottom: 10}}>
                                        <View style={styles.hbox3} />
                                        <Text numberOfLines={1} style={[styles.textStyle, { flexDirection: isRTL ? "row-reverse" : "row", marginHorizontal: 5, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{tripdata.drop.add}</Text>
                                    </View>
                                </ScrollView>
                            : null}
                        </View>
                    :
                        <View style={[styles.addressBar, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={styles.ballandsquare}>
                                <View style={styles.hbox1} /><View style={styles.hbox2} /><View style={styles.hbox3} />
                            </View>
                            {tripdata && tripdata.pickup && tripdata.drop ?
                                <View style={[styles.contentStyle, isRTL ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                                    <TouchableOpacity style={styles.addressStyle1}>
                                        <Text numberOfLines={1} style={[styles.textStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{tripdata.pickup.add}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.addressStyle2}>
                                        <Text numberOfLines={1} style={[styles.textStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{tripdata.drop.add}</Text>
                                    </TouchableOpacity>
                                </View>
                                : null}
                        </View>
                    }
                    <View style={[styles.menuIcon,{backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE}, isRTL ? { right: 15 } : { left: 15 }]}>
                        <TouchableOpacity onPress={onPressCancel} style={styles.menuIconButton} >
                            <Icon
                                name={isRTL ? 'arrow-right' : 'arrow-left'}
                                type='font-awesome'
                                color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                size={25}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, height: (auth && auth.profile && auth.profile.firstName && auth.profile.lastName && auth.profile.email ? 250 : (auth.profile.firstName && auth.profile.lastName) ? 350 : auth.profile.email ? 350 : 400) + (otherPerson ? 75 : 10)}} showsVerticalScrollIndicator={false}>
                        {auth && auth.profile && !(auth.profile.firstName && auth.profile.lastName && auth.profile.email) ?
                            <View style={[styles.vew,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                                <Text style={{ textAlign: 'center', fontFamily:fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('no_details_error')}</Text>
                                <View style={{ flexDirection: 'row', width: '100%' }}>
                                    {auth && auth.profile && !auth.profile.firstName ?
                                        <View style={{ width: '50%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('first_name_placeholder')}
                                                placeholderTextColor={colors.SHADOW}
                                                value={profileData.firstName}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15, fontFamily:fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
                                                onChangeText={(text) => { setProfileData({ ...profileData, firstName: text }) }}
                                                inputContainerStyle={[styles.inputContainerStyle]}
                                            />
                                        </View>
                                        : null}
                                    {auth && auth.profile && !auth.profile.lastName ?
                                        <View style={{ width: '50%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('last_name_placeholder')}
                                                placeholderTextColor={colors.SHADOW}
                                                value={profileData.lastName}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15, fontFamily:fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
                                                onChangeText={(text) => { setProfileData({ ...profileData, lastName: text }) }}
                                                inputContainerStyle={styles.inputContainerStyle}
                                            />
                                        </View>
                                        : null}
                                </View>
                                {auth && auth.profile && !auth.profile.email ?
                                    <Input
                                        editable={true}
                                        underlineColorAndroid={colors.TRANSPARENT}
                                        placeholder={t('email_placeholder')}
                                        placeholderTextColor={colors.SHADOW}
                                        value={profileData.email}
                                        keyboardType={'email-address'}
                                        inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15, fontFamily:fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
                                        onChangeText={(text) => { setProfileData({ ...profileData, email: text }) }}
                                        inputContainerStyle={styles.inputContainerStyle}
                                        autoCapitalize='none'
                                    />
                                    : null}

                            </View>
                        : null}

                        <OtherPerson
                            otherPerson = {otherPerson}
                            setOtherPerson={setOtherPerson}
                            setInstructionData={setInstructionData}
                            instructionData={instructionData}
                            auth={auth}
                            mode={mode}
                        />

                        <View style={[auth && auth.profile && (auth.profile.firstName && auth.profile.lastName && auth.profile.email) ? styles.bottomContainer : styles.bottomContainer1, {marginTop: - 10, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                            <View style={[styles.offerContainer,{borderBottomColor:mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}>
                                <TouchableOpacity >
                                    <Text style={[styles.offerText,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {t('estimate_fare_text')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.priceDetailsContainer,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                                <View style={styles.priceDetailsLeft}>
                                    <View style={styles.priceDetails}>
                                        <View style={styles.totalFareContainer}>
                                            <Text style={styles.totalFareText}>{t('total_fare')}</Text>
                                        </View>
                                        {/* <Icon
                                            name='info'
                                            color={colors.WHITE}
                                            type='simple-line-icon'
                                            size={15}
                                            containerStyle={styles.infoIcon}
                                        /> */}
                                    </View>

                                    <View style={styles.iconContainer}>
                                        {settings.swipe_symbol === false ?
                                            <Text style={[styles.priceText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {settings ? settings.symbol : null} {estimate ? formatAmount(estimate.estimateFare, settings.decimal, settings.country) : null}</Text>
                                            :
                                            <Text style={[styles.priceText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {estimate ? formatAmount(estimate.estimateFare, settings.decimal, settings.country) : null} {settings ? settings.symbol : null}</Text>
                                        }
                                    </View>
                                </View>
                                <View style={styles.priceDetailsLeft}>
                                    <View style={styles.priceDetails}>
                                        <View style={styles.totalFareContainer}>
                                            <Text style={styles.totalFareText}>{estimate && estimate.estimateDistance ? formatAmount(estimate.estimateDistance, settings.decimal, settings.country) : 0} {settings && settings.convert_to_mile ? t('mile') : t('km')} </Text>
                                        </View>
                                        {/* <Icon
                                            name='info'
                                            color={colors.WHITE}
                                            type='simple-line-icon'
                                            size={15}
                                            containerStyle={styles.infoIcon}
                                        /> */}
                                    </View>
                                    <View style={styles.iconContainer}>
                                        <Text style={[styles.priceText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{estimate ? parseFloat(estimate.estimateTime / 60).toFixed(0) : 0} {t('mins')}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                borderStyle: 'solid',
                                borderWidth: 0.3,
                                borderRadius: 1,
                                width: '90%',
                                borderColor: colors.SHADOW
                            }}>
                            </View>
                            <View style={{ width: width, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                                <Text style={[styles.offerText, { paddingTop: 2, paddingBottom: 5, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('payment_mode')}</Text>
                            </View>
                            <View style={{ width: width, paddingBottom: 5, justifyContent: 'center', alignItems: 'center', borderBottomColor: colors.YELLOW, }}>
                                <RadioForm
                                    radio_props={radioProps}
                                    initial={payment_mode}
                                    animation={false}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                    selectedButtonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                    buttonSize={15}
                                    buttonOuterSize={25}
                                    style={styles.radioContainerStyle}
                                    labelStyle={[styles.radioText,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}
                                    radioStyle={{ flexDirection: isRTL ? 'row-reverse' : 'row', margin: 10, colors: 'black' }}
                                    onPress={(value) => { setPaymentMode(value); }}
                                />
                            </View>
                            <View style={styles.flexView}>
                                <Button
                                    title={t('confirm')}
                                    loading={bookModelLoading}
                                    loadingProps={{ size: "large", color: colors.BLUE }}
                                    titleStyle={{ color: colors.WHITE, fontFamily:fonts.Bold, fontSize: 16 }}
                                    onPress={bookNow}
                                    buttonStyle={{ height: '100%', backgroundColor:mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10, }}
                                    containerStyle={styles.buttonStyle}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE
    },
    vew: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        padding: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity:Platform.OS == 'ios'? 0.1: 0.8,
        shadowRadius: 3,
        elevation:Platform.OS == 'ios'? 2: 8,
        marginTop: 5
    },
    square: {
        height: 14,
        width: 14,
        backgroundColor: colors.SHADOW
    },
    iconContainer: { flex: 1 },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    bottomContainer: { alignItems: 'center', overflow: 'hidden' },
    bottomContainer1: {
        alignItems: 'center',
        overflow: 'hidden',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        shadowColor: 'black',
        shadowOffset: { width: -12, height: -18 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 8
    },
    offerContainer: { height: 30, width: width, justifyContent: 'center', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0 },
    offerText: { alignSelf: 'center', fontSize: 14, fontFamily:fonts.Regular },
    priceDetailsContainer: { flexDirection: 'row', position: 'relative', zIndex: 1, },
    priceDetailsLeft: { flex: 19, height: 90 },
    priceDetailsMiddle: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    priceDetails: { flex: 1, flexDirection: 'row' },
    totalFareContainer: { flex: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
    totalFareText: { color: colors.SHADOW, fontFamily:fonts.Bold, fontSize: 15, marginLeft: 40 },
    infoIcon: { flex: 2, alignItems: 'center', justifyContent: 'center' },
    priceText: { alignSelf: 'center', fontFamily: fonts.Bold, fontSize: 20 },
    buttonStyle: {
        width: '80%',
        height: '100%',
        alignSelf: 'center',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3
    },
    flexView: {
        height: 50,
        width: '100%',
        marginVertical: 10,
    },
    addressStyle2: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
    },
    addressStyle1: {
        borderBottomColor: colors.SHADOW,
        borderBottomWidth: 1,
        height: 48,
        width: width - 84,
        justifyContent: 'center',
        paddingTop: 2
    },
    textStyle: {
        fontFamily: fonts.Regular,
        fontSize: 14,
        color: colors.BLACK
    },
    addressBar: {
        position: 'absolute',
        marginHorizontal: 20,
        top: Platform.OS == 'android' ? (__DEV__ ? 60 : (hasNotch? 50: 40)) : (hasNotch ? 70 : 60),
        height: 100,
        width: width - 40,
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 3
    },
    addressBarMul: {
        position: 'absolute',
        marginHorizontal: 20,
        top: Platform.OS == 'android' ? (__DEV__ ? 60 : 100) : (hasNotch ? 100 : 80),
        width: width - 40,
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 3
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN
    },
    hbox2: {
        height: 36,
        width: 1,
        backgroundColor: colors.SHADOW
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.RED
    },
    hboxMul: {
        height: 12,
        width: 12,
        backgroundColor: colors.SHADOW
    },
    contentStyle: {
        justifyContent: 'center',
        width: width - 74,
        height: 100
    },
    contentStyleMul: {
        width: width - 74
    },
    inputContainerStyle: {
        marginBottom: -15,
    },
    menuIcon: {
        height: 40,
        width: 40,
        borderRadius: 25,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center', marginTop: -80, marginBottom: 5
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        justifyContent: 'center',
    },
    radioText:{
        fontSize: 16,
        fontFamily:fonts.Bold
    }
});