import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Linking, Alert, Animated, useColorScheme, Platform } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment/min/moment-with-locales';
import DatePicker from 'react-native-date-picker';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
var { width, height } = Dimensions.get('window');
import { Ionicons, Fontisto, Octicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-elements';
import StarRating from 'react-native-star-rating-widget';
import Button from '../components/Button';
import { appConsts } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';
import { MaterialIcons } from '@expo/vector-icons';

export default function RideList(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const settings = useSelector(state => state.settingsdata.settings);
    const [tabIndex, setTabIndex] = useState(props.tabIndex);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [filteredData, setFilteredData] = useState(props.data || []);
    const defaultDate = new Date();
    const auth = useSelector(state => state.auth);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    // Animation states
    const [fadeAnims, setFadeAnims] = useState({});
    const [slideAnims, setSlideAnims] = useState({});
    const [scaleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
            }else{
            setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    function formatAmount(value, decimal, country) {
        const number = parseFloat(value || 0);
        if (country === "Vietnam") {
          return number.toLocaleString("vi-VN", {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
          });
        } else {
          return number.toLocaleString("en-US", {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
          });
        }
    }

    useEffect(() => {
        Animated.spring(
            scaleAnim,
            {
                toValue: 1,
                friction: 3,
                useNativeDriver: true
            }
        ).start();
    }, []);

    // Handle data filtering and animations
    useEffect(() => {
        if (props.data) {
            const filtered = props.data.filter(item => {
                if (!startDate && !endDate) return true;
                
                const bookingDate = item.bookingDate ? new Date(item.bookingDate) : null;
                if (!bookingDate) return false;
                
                // Set time to midnight for date-only comparison
                const compareDate = new Date(bookingDate);
                compareDate.setHours(0, 0, 0, 0);
                
                const startDateMidnight = startDate ? new Date(startDate) : null;
                if (startDateMidnight) startDateMidnight.setHours(0, 0, 0, 0);
                
                const endDateMidnight = endDate ? new Date(endDate) : null;
                if (endDateMidnight) endDateMidnight.setHours(23, 59, 59, 999);
                
                if (startDate && endDate) {
                    return compareDate >= startDateMidnight && compareDate <= endDateMidnight;
                } else if (startDate) {
                    return compareDate >= startDateMidnight;
                } else if (endDate) {
                    return compareDate <= endDateMidnight;
                }
                return true;
            });
            
            setFilteredData(filtered);

            // Reset and create new animations
            const newFadeAnims = {};
            const newSlideAnims = {};
            filtered.forEach((_, index) => {
                newFadeAnims[index] = new Animated.Value(0);
                newSlideAnims[index] = new Animated.Value(50);
            });

            setFadeAnims(newFadeAnims);
            setSlideAnims(newSlideAnims);

            // Start staggered animations for all items
            filtered.forEach((_, index) => {
                Animated.sequence([
                    Animated.delay(index * 100),
                    Animated.parallel([
                        Animated.timing(newFadeAnims[index], {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.spring(newSlideAnims[index], {
                            toValue: 0,
                            friction: 7,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start();
            });
        }
    }, [props.data, startDate, endDate]);

    // Date picker handlers
    const onStartDateChange = (date) => {
        setStartDate(date);
        setShowStartDatePicker(false);
    };

    const onEndDateChange = (date) => {
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        setEndDate(endOfDay);
        setShowEndDatePicker(false);
    };

    const clearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const onPressButton = (item, index) => {
        props.onPressButton(item, index)
    }

    const onPressAction = (item, index) => {
        props.onPressAction(item, index)
    }

    const onChatAction = (item, index) => {
        props.onChatAction(item, index)
    }

    const [role, setRole] = useState();

    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        } else {
            setRole(null);
        }
    }, [auth.profile]);

    const onPressCall = (phoneNumber) => {
        let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
        Linking.openURL(call_link);
    }

    const onAlert = (item) => {
        if(item.status==="COMPLETE") Alert.alert(t('alert'), t('booking_is') + t('COMPLETE') + "." + t('not_call'));
        if(item.status==="CANCELLED") Alert.alert(t('alert'), t('booking_is') + t('CANCELLED') + "." + t('not_call'));
        if(item.status==="PAID") Alert.alert(t('alert'), t('booking_is') + t('PAID') + "." + t('not_call'));
    }
    
    const onChatAlert = (item) => {
       if(item.status==="COMPLETE") Alert.alert(t('alert'), t('booking_is') + t('COMPLETE') + "." + t('not_chat'));
       if(item.status==="CANCELLED") Alert.alert(t('alert'), t('booking_is') + t('CANCELLED') + "." + t('not_chat'));
       if(item.status==="PAID") Alert.alert(t('alert'), t('booking_is') + t('PAID') + "." + t('not_chat'));
    }

    const goHome = () => {
        props.goHome()
    }

    const renderItem = ({ item, index }) => (
        <Animated.View style={[{
            opacity: fadeAnims[index] || 0,
            transform: [{
                translateY: slideAnims[index] || 50
            }]
        }]}>
            <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => onPressButton(item, index)} 
                style={[styles.BookingContainer, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]} 
            >
                <View style={{ padding: 15 }}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1 }}>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.GREEN} />
                                    <View style={[styles.hbox2, { flex: 1, minHeight: 5, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[styles.textStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.pickup.add}</Text>
                                </View>
                            </View>

                            {item?.waypoints?.length > 0 && (
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <View style={{ width: 30, alignItems: 'center' }}>
                                        <Ionicons name="location-outline" size={24} color={colors.YELLOW} />
                                        <View style={[styles.hbox2, { flex: 1, minHeight: 5, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                    </View>
                                    <View style={{ flex: 1, marginBottom: 10 }}>
                                        <Text style={[styles.textStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.waypoints.length} {t('stops')}</Text>
                                    </View>
                                </View>
                            )}

                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.ORANGE} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[styles.textStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.drop.add}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'column', flex: 1, minHeight: 60 }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, minHeight: 60 }}>
                            <View style={[styles.details, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                <Text style={{ fontFamily:fonts.Bold, fontSize: 24, color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, opacity: 0.8 }}>{settings.symbol}</Text>
                                <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item.deliveryWithBid && (['NEW','PAYMENT_PENDING'].indexOf(item.status) != -1) ?  t('bid') : item && item.trip_cost > 0  ? formatAmount(item.trip_cost, settings.decimal, settings.country) : item && item.estimate ? formatAmount(item.estimate, settings.decimal, settings.country) : 0}</Text>
                            </View>
                            <View style={[styles.hbox2, { minHeight: 5, width: 1, margin: 2, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                            <View style={[styles.details, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                <Fontisto name="map" size={26} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} style={{ opacity: 0.8 }} />
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.distance > 0 ? formatAmount(item.distance, settings.decimal, settings.country) : 0}</Text>
                                    <Text style={[styles.textStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {settings && settings.convert_to_mile ? t("mile") : t("km")} </Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, minHeight: 60 }}>
                            <View style={[styles.details, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomWidth: 0, borderBottomColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                <Octicons name="clock" size={26} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} style={{ opacity: 0.8 }} />
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{(item && item.total_trip_time && item.total_trip_time > 0 ? parseFloat(item.total_trip_time / 60).toFixed(0) == 0 ? "1" : parseFloat(item.total_trip_time / 60).toFixed(0) : parseFloat(item.estimateTime / 60).toFixed(0))}</Text>
                                    <Text style={[styles.textStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {t("mins")} </Text>
                                </View>
                            </View>
                            <View style={[styles.hbox2, { minHeight: 5, width: 1, margin: 2, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                <View style={[styles.clock, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    {item && item.trip_start_time && item.trip_end_time ?
                                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                            <View style={[styles.section, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <Ionicons name="location-outline" size={28} color={colors.GREEN} />
                                                <View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_start_time ? (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))).length == 2 ? (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))) : "0" + (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))) : ""}</Text>
                                                        <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_start_time ? (item.trip_start_time).substring(((item.trip_start_time).indexOf(":") + 1), ((item.trip_start_time).lastIndexOf(":"))).length == 2 ? (item.trip_start_time).substring(((item.trip_start_time).indexOf(":")), ((item.trip_start_time).lastIndexOf(":"))) : ":0" + (item.trip_start_time).substring(((item.trip_start_time).indexOf(":") + 1), ((item.trip_start_time).lastIndexOf(":"))) : ""}</Text>
                                                    </View>
                                                    <Text style={{ textAlign: isRTL ? "right" : "left", fontSize: 8, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{item.startTime ? moment(item.startTime).format('ll') : ''}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.section, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <Ionicons name="location-outline" size={28} color={colors.ORANGE} />
                                                <View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_end_time ? (item.trip_end_time).substring(0, ((item.trip_end_time).indexOf(":"))).length == 2 ? (item.trip_end_time).substring(0, ((item.trip_end_time).indexOf(":"))) : "0" + (item.trip_end_time).substring(0, ((item.trip_end_time).indexOf(":"))) : ""}</Text>
                                                        <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_end_time ? (item.trip_end_time).substring(((item.trip_end_time).indexOf(":") + 1), ((item.trip_end_time).lastIndexOf(":"))).length == 2 ? (item.trip_end_time).substring(((item.trip_end_time).indexOf(":")), ((item.trip_end_time).lastIndexOf(":"))) : ":0" + (item.trip_end_time).substring(((item.trip_end_time).indexOf(":") + 1), ((item.trip_end_time).lastIndexOf(":"))) : ""}</Text>
                                                    </View>
                                                    <Text style={{ textAlign: isRTL ? "right" : "left", fontSize: 8, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{item.endTime ? moment(item.endTime).format('ll') : ''}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        : item && item.trip_start_time ?
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <View style={[styles.section, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                    <Ionicons name="location-outline" size={28} color={colors.GREEN} />
                                                    <View>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_start_time ? (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))).length == 2 ? (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))) : "0" + (item.trip_start_time).substring(0, ((item.trip_start_time).indexOf(":"))) : ""}</Text>
                                                            <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.trip_start_time ? (item.trip_start_time).substring(((item.trip_start_time).indexOf(":") + 1), ((item.trip_start_time).lastIndexOf(":"))).length == 2 ? (item.trip_start_time).substring(((item.trip_start_time).indexOf(":")), ((item.trip_start_time).lastIndexOf(":"))) : ":0" + (item.trip_start_time).substring(((item.trip_start_time).indexOf(":") + 1), ((item.trip_start_time).lastIndexOf(":"))) : ""}</Text>
                                                        </View>
                                                        <Text style={{ textAlign: isRTL ? "right" : "left", fontSize: 8, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{item.startTime ? moment(item.startTime).format('ll') : ''}</Text>
                                                    </View>
                                                </View>
                                                <View style={[styles.section, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                    <Ionicons name="location-outline" size={28} color={colors.ORANGE} />
                                                    <Image source={require('../../assets/images/clock.gif')} style={{ width: 25, height: 25, alignSelf: 'center', resizeMode: 'center', borderRadius: 13 }} />
                                                </View>
                                            </View>
                                            :
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{item && item.reason ? t(getLangKey(item.reason)) : t(item.status).toUpperCase()}</Text>
                                            </View>
                                    }
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 10 }}>
                            <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('booking_date')}- {item && item.bookingDate ? moment(item.bookingDate).format('lll') : ""}</Text>
                        </View>

                        {item ?
                        <View style={[styles.driverDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
                                {item ?
                                    (!(item.driver_image == '' || item.driver_image == null || item.driver_image == 'undefined') && auth.profile.usertype == 'customer') ?
                                        <Avatar
                                            size="medium"
                                            rounded
                                            source={{ uri: item.driver_image }}
                                            activeOpacity={0.7}
                                        />
                                        :
                                        (!(item.customer_image == '' || item.customer_image == null || item.customer_image == 'undefined') && auth.profile.usertype == 'driver') ?
                                            <Avatar
                                                size="medium"
                                                rounded
                                                source={{ uri: item.customer_image }}
                                                activeOpacity={0.7}
                                            />
                                            : item.driver_name != '' ?

                                                <Avatar
                                                    size="medium"
                                                    rounded
                                                    source={require('../../assets/images/profilePic.png')}
                                                    activeOpacity={0.7}
                                                /> : null
                                    : null}
                                <View style={[styles.userView, { flex: 1, marginHorizontal: 5 }]}>
                                    {item && item.driver_name != '' && auth.profile.usertype == 'customer' ? <Text style={[styles.textStyleBold, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{item.driver_name ? item.driver_name : t('no_name')}</Text> : null}

                                    {item && item.customer_name != '' && auth.profile.usertype == 'driver' ? <Text style={[styles.textStyleBold, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{item.customer_name ? item.customer_name : t('no_name')}</Text> : null}

                                    {item && item.rating > 0 && item.driver_name && auth.profile.usertype == 'customer'?
                                        <View>
                                            <StarRating
                                                maxStars={5}
                                                starSize={15}
                                                enableHalfStar={true}
                                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                                emptyColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                                rating={item && item.rating ? (Math.round(parseFloat(item.rating) * 2) / 2) : 0}
                                                style={[styles.contStyle, isRTL ? { marginRight: 0, transform: [{ scaleX: -1 }] } : { marginLeft: -8 }]}
                                                onChange={() => {
                                                    //console.log('hello')
                                                }}
                                            />
                                        </View>
                                        : null}
                                </View>
                            </View>
                            {item && ((item.driver_contact || item.customer_contact)) ?
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => (['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING'].indexOf(item.status) != -1) ? role == 'customer' ? 
                                            onPressCall(item.driver_contact) : (item.otherPersonPhone && item.otherPersonPhone.length > 0 ? onPressCall(item.otherPersonPhone) : onPressCall(item.customer_contact)) : onAlert(item)} 
                                            style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, height: 40, width: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', margin: 3 }}>
                                        <Ionicons name="call" size={24} color={colors.WHITE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => (['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'COMPLETE'].indexOf(item.status) != -1) ? onChatAction(item, index) : onChatAlert(item)} style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, height: 40, width: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', margin: 3 }}>
                                        <Ionicons name="chatbubble-ellipses-sharp" size={24} color={colors.WHITE} />
                                    </TouchableOpacity>
                                </View>
                                : null}
                        </View>
                        : null}

                        {(item && item.status && auth.profile && auth.profile.uid &&
                            (((['PAYMENT_PENDING', 'NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'PAID'].indexOf(item.status) != -1) && auth.profile.usertype == 'customer') ||
                            ((['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED'].indexOf(item.status) != -1) && auth.profile.usertype == 'driver'))) ?
                            <Button
                                title={item.status == 'PAID' ? t('add_to_review') : item.status == 'PAYMENT_PENDING' ? t('paynow_button') : t('go_to_booking')}
                                loading={false}
                                loadingColor={{ color: colors.GREEN }}
                                buttonStyle={[styles.textStyleBold, { color: colors.WHITE }]}
                                style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, marginVertical: 10 }}
                                btnClick={() => { onPressAction(item, index) }}
                            />
                        : null}
                </View>
            </TouchableOpacity>     
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    onPress={() => setShowStartDatePicker(true)}
                    style={[styles.dateButton, { 
                        backgroundColor: colors.WHITE,
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 5
                    }]}
                >
                    <Ionicons 
                        name="calendar-outline" 
                        size={20} 
                        color={colors.BLACK}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.dateText, { color: colors.BLACK }]}>
                        {startDate ? moment(startDate).format('ll') : t('start_date')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setShowEndDatePicker(true)}
                    style={[styles.dateButton, { 
                        backgroundColor: colors.WHITE,
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginHorizontal: 5
                    }]}
                >
                    <Ionicons 
                        name="calendar-outline" 
                        size={20} 
                        color={colors.BLACK}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.dateText, { color: colors.BLACK }]}>
                        {endDate ? moment(endDate).format('ll') : t('end_date')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={clearDateFilter}
                    style={[styles.clearButton, {backgroundColor: colors.WHITE, opacity: startDate || endDate ? 1 : 0.5}]}
                    disabled={!startDate && !endDate}
                >
                    <Ionicons 
                        name="close-circle-outline" 
                        size={24} 
                        color={colors.BLACK}
                    />
                </TouchableOpacity>
            </View>

            <DatePicker
                title={t("select_date")}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                modal
                open={showStartDatePicker}
                date={startDate || defaultDate}
                mode="date"
                onConfirm={onStartDateChange}
                onCancel={() => setShowStartDatePicker(false)}
            />

            <DatePicker
                title={t("select_date")}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                modal
                open={showEndDatePicker}
                date={endDate || defaultDate}
                mode="date"
                minimumDate={startDate || undefined}
                onConfirm={onEndDateChange}
                onCancel={() => setShowEndDatePicker(false)}
            />
            <View style={{ height: '100%' }}>
                <View style={{ height: 5 }} />
                <View style={[styles.listView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                    <SegmentedControlTab
                        values={[t('active_booking'), t('COMPLETE'), t('CANCELLED')]}
                        selectedIndex={tabIndex}
                        onTabPress={setTabIndex}
                        //borderRadius={25}
                        tabsContainerStyle={[styles.tabsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                        tabStyle={[styles.tab, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                        activeTabStyle={[styles.activeTab, { borderBottomWidth: 2, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                        tabTextStyle={[styles.tabText, {color: colors.SHADOW}]}
                        activeTabTextStyle={[styles.activeTabText,{color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
                    />

                    <View style={{ marginTop: 5, flex: 1, marginBottom: 50 }}>
                        <Animated.FlatList
                        showsVerticalScrollIndicator={false}
                        data={tabIndex === 0 
                            ? filteredData.filter(item => !['CANCELLED', 'COMPLETE'].includes(item.status))
                            : tabIndex === 1 
                                ? filteredData.filter(item => item.status === 'COMPLETE')
                                : filteredData.filter(item => item.status === 'CANCELLED')
                        }
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialIcons 
                                    name="list-alt" 
                                    size={40} 
                                    color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} 
                                />
                                <Text style={[styles.emptyText, { 
                                    color: mode === 'dark' ? colors.WHITE : colors.BLACK 
                                }]}>
                                    {t('no_data_available')}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </View>
         </View>
    );
};

const styles = StyleSheet.create({
    dateButton: {
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 5,
        borderRadius: 8,
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dateText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    BookingContainer: {
        margin: 5,
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 1,
        elevation: 2
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily:fonts.Regular,
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    hbox2: {
        width: 1
    },
    textStyle: {
        fontSize: 16,
        fontFamily:fonts.Regular
    },
    textStyleBold: {
        fontSize: 16,
        fontFamily: fonts.Bold
    },
    details: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: .6
    },
    clock: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: 60
    },
    section: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    driverDetails: {
        flex: 1,
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 10
    },
    listView: {
        flex: 1,
        width: '100%',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    emptyListContainer: {
        width: width,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyBox: {
        backgroundColor: MAIN_COLOR,
        borderRadius: 10
    },
    emptyText: {
        fontFamily: fonts.Bold,
        color: colors.WHITE,
        padding: 15,
        fontSize: 18
    },
    clearButton:{
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginHorizontal: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Dimensions.get('window').height / 4,
    },

    tabsContainer: {
        marginTop: 5,
        height: 45,
        backgroundColor: 'transparent',
    },
    tab: {
        borderWidth: 0,
        marginHorizontal: 5,

    },
    activeTab: {
        borderWidth: 0,
    },
    activeTab: {
        borderWidth: 0,
    },
    tabText: {
        fontFamily: fonts.Bold,
        fontSize: 14,
    },
    activeTabText: {
        fontFamily: fonts.Bold,
        fontSize: 14,
    },
});