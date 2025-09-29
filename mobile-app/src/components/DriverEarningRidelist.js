import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
var { width, height } = Dimensions.get('window');
import moment from 'moment/min/moment-with-locales';
import { fonts } from '../common/font';
import { Ionicons, AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function DriverEarningRidelist(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const settings = useSelector(state => state.settingsdata.settings);
    const [tabIndex, setTabIndex] = useState(props.tabIndex);
    const auth = useSelector(state => state.auth);
    const [mode, setMode] = useState();
    let colorScheme = useColorScheme();
    
    // Animation related states
    const [scrollY] = useState(new Animated.Value(0));
    const fadeAnim = useRef({}).current;
    const [tabChangeAnim] = useState(new Animated.Value(1));

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

    // Initialize animations when data changes
    useEffect(() => {
        if (props.data && props.data.length > 0) {
            // Initialize animation values for each item
            props.data.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
            
            // Start staggered animations
            props.data.forEach((_, index) => {
                Animated.sequence([
                    Animated.delay(index * 100),
                    Animated.timing(fadeAnim[index], {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true
                    })
                ]).start();
            });
        }
    }, [props.data]);

    const animateTabChange = () => {
        // Reset animation values for new tab content
        if(props.data) {
            props.data.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
        }

        // Animate tab change
        Animated.sequence([
            Animated.timing(tabChangeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(tabChangeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();

        // Start staggered animations for new items
        if(props.data) {
            props.data.forEach((_, index) => {
                Animated.sequence([
                    Animated.delay(index * 70),
                    Animated.spring(fadeAnim[index], {
                        toValue: 1,
                        friction: 6,
                        tension: 40,
                        useNativeDriver: true
                    })
                ]).start();
            });
        }
    };

    const handleTabPress = (index) => {
        setTabIndex(index);
        animateTabChange();
    };

    const renderData = ({ item, index }) => {
        const scale = scrollY.interpolate({
            inputRange: [-1, 0, (80 * index), (80 * (index + 2))],
            outputRange: [1, 1, 1, 0.98]
        });

        if (!fadeAnim[index]) {
            fadeAnim[index] = new Animated.Value(0);
        }

        return (
            <Animated.View style={[
                styles.BookingContainer,
                mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,
                {
                    opacity: Animated.multiply(fadeAnim[index] || 1, tabChangeAnim),
                    transform: [
                        { scale },
                        {
                            translateY: fadeAnim[index] ? 
                                fadeAnim[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0]
                                }) : 0
                        }
                    ]
                }
            ]}>
                <View style={[styles.box,{  padding: 5 },]}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, margin: 10, justifyContent:'space-between'}}>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{item.endTime ? moment(item.endTime).format('lll') : ''}</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            {item.payment_mode == 'cash' ?
                                <MaterialCommunityIcons name="cash" size={28} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                                : item.payment_mode == 'card' ?
                                    <Feather name="credit-card" size={24} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                                    :
                                    <AntDesign name="wallet" size={24} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                            }
                        </View>
                        <View style={{ justifyContent: 'center'}}>
                            {settings.swipe_symbol === false ?
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark :styles.textStyleBold}>{settings.symbol}{item.driver_share? formatAmount(item.driver_share, settings.decimal, settings.country) :'0'}</Text>
                            :
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark :styles.textStyleBold}>{item.driver_share? formatAmount(item.driver_share, settings.decimal, settings.country) :'0'}{settings.symbol}</Text>
                            }
                        </View>
                    </View>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, marginTop: 5 }}>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.GREEN} />
                                    <View style={[styles.hbox, { flex: 1, minHeight: 5 }]} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.pickup.add} </Text>
                                </View>
                            </View>

                            {item && item.waypoints && item.waypoints.length > 0 ?
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <View style={{ width: 30, alignItems: 'center' }}>
                                        <Ionicons name="location-outline" size={24} color={colors.YELLOW} />
                                        <View style={[styles.hbox, { flex: 1, minHeight: 5 }]} />
                                    </View>
                                    <View style={{ flex: 1, marginBottom: 10 }}>
                                        <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.waypoints.length} {t('stops')}</Text>
                                    </View>
                                </View>
                                : null}

                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.ORANGE} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.drop.add}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </Animated.View>
        )
    }

    return (
        <View style={{flex: 1}}>
            <SegmentedControlTab
                values={[t('daily'), t('thismonth'), t('thisyear')]}
                selectedIndex={tabIndex}
                onTabPress={handleTabPress}
                borderRadius={0}
                tabsContainerStyle={[styles.segmentcontrol, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                tabStyle={{
                    borderWidth: 0,
                    backgroundColor: 'transparent',
                    borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                }}
                activeTabStyle={{ borderBottomColor: colors.RED, backgroundColor: 'transparent', borderBottomWidth: 1.5 }}
                tabTextStyle={{ color: colors.SHADOW, fontFamily:fonts.Bold }}
                activeTabTextStyle={{ color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
            />

            <View style={{flex: 1}}>
                <AnimatedFlatList
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    data={tabIndex === 0 
                        ? props.data.filter(item => ((new Date(item.endTime).getDate() == new Date().getDate()) && (item.status === 'PAID' || item.status === 'COMPLETE'))) 
                        : (tabIndex === 1 
                            ? props.data.filter(item => ((new Date(item.endTime).getMonth() == new Date().getMonth()) && (item.status === 'PAID' || item.status === 'COMPLETE'))) 
                            : props.data.filter(item => ((new Date(item.endTime).getFullYear() == new Date().getFullYear()) && (item.status === 'PAID' || item.status === 'COMPLETE'))))}
                    renderItem={renderData}
                    ListEmptyComponent={
                        <View style={{marginTop: height/3.5, justifyContent:'center', alignItems:'center' }}>
                            <View style={{height: 50, minWidth: 150, borderRadius: 10, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, justifyContent:'center', alignItems:'center' }}>
                                <Text style={[styles.textStyleBold,{color: colors.WHITE}]}>{t('no_data_available')}</Text>
                            </View>
                        </View>
                    }
                />
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    BookingContainer:{
        margin:10,
        borderRadius:10,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 1,
        backgroundColor: colors.WHITE,
        elevation:2
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    box: {
        borderRadius: 10,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily:fonts.Regular,
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    fare: {
        width: (width - 35) / 4,
        backgroundColor: colors.WHITE,
        borderRadius: 5,
        paddingHorizontal: 3,
        height: 'auto',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 5
    },
    hbox: {
        width: 1,
        backgroundColor: colors.SHADOW
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular
    },
    textStyleDark: {
        fontSize: 15,
        fontFamily: fonts.Regular,
        color: colors.WHITE
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
    textStyleBoldDark: {
        fontSize: 15,
        fontFamily: fonts.Bold,
        color: colors.WHITE
    },
});