import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Alert, Share, Pressable, Linking, ActivityIndicator, Dimensions, Platform, useColorScheme, Modal, Image, Animated } from "react-native";
import { Icon } from "react-native-elements";
import i18n from 'i18n-js';
import { colors } from '../common/theme';
import { useSelector, useDispatch } from "react-redux";
import { api } from 'common';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from "../common/sharedFunctions";
import { appConsts } from '../common/sharedFunctions';
var { width, height } = Dimensions.get('window');
import { fonts } from "../common/font";
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen(props) {
    const { t } = i18n;
    const { signOff, updateProfile,editSos } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [theme, setTheme] = useState(false);

    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
                setTheme('system');
            }else{
                setMode(auth.profile.mode);
                setTheme(auth.profile.mode);
            }
        } else {
            setMode('light');
            setTheme('light');
        }
    }, [auth, colorScheme]);

    const menuList = [
        // { name: t('profile_setting_menu'), navigationName: 'Profile', icon: 'account-cog-outline', type: 'material-community' },
        { name: t('documents'), navigationName: 'editUser', icon: 'description', type: 'materialIcons' },
        { name: t('incomeText'), navigationName: 'MyEarning', icon: 'attach-money', type: 'materialIcons' },
        { name: auth.profile && auth.profile && auth.profile.usertype == "driver" ? t('convert_to_rider') : t('convert_to_driver'), navigationName: 'Convert', icon: 'account-convert-outline', type: 'material-community' },
        { name: t('cars'), navigationName: 'Cars', icon: 'car-cog', type: 'material-community' },
        { name: t('refer_earn'), navigationName: 'Refer', icon: 'cash-outline', type: 'ionicon' },
        { name: t('sos'), navigationName: 'Sos', icon: 'radio-outline', type: 'ionicon' },
        { name: t('push_notification_title'), navigationName: 'Notifications', icon: 'notifications-outline', type: 'ionicon' },
        { name: t('complain'), navigationName: 'Complain', icon: 'chatbox-ellipses-outline', type: 'ionicon' },
        { name: t('theme'), navigationName: 'Theme', icon: 'sun', type: 'feather' },
        { name: t('about_us_menu'), navigationName: 'About', icon: 'info', type: 'entypo' },
        { name: t('logout'), icon: 'logout', navigationName: 'Logout', type: 'antdesign' }
    ];

    const fadeAnims = useRef({}).current;
    const profileAnim = useRef(new Animated.Value(0)).current;
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        // Initialize animations
        menuList.forEach((_, index) => {
            fadeAnims[index] = new Animated.Value(0);
        });

        // Animate everything together
        Animated.parallel([
            // Profile animation
            Animated.spring(profileAnim, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true
            }),
            // Menu items animation - all at once
            ...menuList.map((_, index) => 
                Animated.spring(fadeAnims[index], {
                    toValue: 1,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true
                })
            )
        ]).start();
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }else{
            setLoader(true);
        }
    }, [auth.profile]);

    const sos = () => {
        Alert.alert(
            t('panic_text'),
            t('panic_question'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: t('ok'), onPress: async () => {
                        let call_link = Platform.OS == 'android' ? 'tel:' + settings.panic : 'telprompt:' + settings.panic;
                        Linking.openURL(call_link);

                        let obj = {};
                        obj.bookingId = null,
                            obj.user_name = auth.profile && auth.profile && auth.profile.firstName ? auth.profile.firstName + " " + auth.profile.lastName : null;
                        obj.contact = auth.profile && auth.profile && auth.profile.mobile ? auth.profile.mobile : null;
                        obj.user_type = auth.profile && auth.profile && auth.profile.usertype ? auth.profile.usertype : null;
                        obj.complainDate = new Date().getTime();
                        dispatch(editSos(obj, "Add"));
                    }
                }
            ],
            { cancelable: false }
        )
    }

    const convert = () => {
        Alert.alert(
            t('convert_button'),
            auth.profile && auth.profile.usertype == "driver" ? t('convert_to_rider') : t('convert_to_driver'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: t('ok'), onPress: async () => {
                        let userData = {
                            approved: (auth.profile && auth.profile.usertype == "driver" ? true : auth.profile && auth.profile.adminApprovedTrue == true ? true : settings && settings.driver_approval ? false : true),
                            usertype: auth.profile && auth.profile.usertype == "driver" ? "customer" : "driver",
                            queue: (auth.profile && auth.profile.queue === true) ? true : false,
                            driverActiveStatus: false
                        }
                        dispatch(updateProfile(userData));
                        setTimeout(() => {
                            if (userData.usertype == 'driver') {
                                dispatch(api.fetchBookings());
                                dispatch(api.fetchTasks());
                                dispatch(api.fetchCars());
                            } else {
                                StopBackgroundLocation();
                                dispatch(api.fetchAddresses());
                                dispatch(api.fetchBookings());
                            }
                        }, 3000);
                    }
                }
            ],
            { cancelable: false }
        )
    }

    const StopBackgroundLocation = async () => {
        TaskManager.getRegisteredTasksAsync().then((res) => {
            if (res.length > 0) {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].taskName == 'background-location-task') {
                        Location.stopLocationUpdatesAsync('background-location-task');
                        break;
                    }
                }
            }
        });
    }

    const refer = () => {
        settings.bonus > 0 ?
            Share.share({
                message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
            })
            :
            Share.share({
                message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
            })
    }

    const logOff = () => {
        auth && auth.profile && auth.profile.usertype == 'driver' ? StopBackgroundLocation() : null;
        setLoading(true);
        if (auth && auth.profile && auth.profile.usertype === 'driver') { StopBackgroundLocation() };

        setTimeout(() => {
            if (auth && auth.profile && auth.profile.pushToken) {
                dispatch(updateProfile({ pushToken: null }));
            }
            dispatch(signOff());
        }, 1000);
    }

    const themeModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => {
                    setThemeModalVisible(false);
                }}>
                <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: width - 70, borderRadius: 10, flex: 1, maxHeight: 225, marginTop: 15, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, padding: 10}}>
                        <Text style={{fontWeight:'700', fontSize: 18, color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left'}}>{t('theme')}</Text>
                        <TouchableOpacity onPress={() => setTheme('light')} style={{borderTopWidth: 1, flexDirection : isRTL ? 'row-reverse' : 'row', paddingVertical: 10, gap: 5, borderColor: mode === 'dark' ? colors.SHADOW : colors.BLACK}}>
                            <Entypo name="light-down" size={24} color={theme === 'light' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK} />
                            <Text style={{fontWeight:'700', fontSize: 14, color: theme === 'light' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('light')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTheme('dark')} style={{borderTopWidth: 1, flexDirection : isRTL ? 'row-reverse' : 'row', paddingVertical: 10, gap: 5, borderColor: mode === 'dark' ? colors.SHADOW : colors.BLACK}}>
                            <MaterialIcons name="dark-mode" size={22} color={theme === 'dark' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK} />
                            <Text style={{fontWeight:'700', fontSize: 14, color: theme === 'dark' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('dark')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTheme('system')} style={{borderTopWidth: 1, flexDirection : isRTL ? 'row-reverse' : 'row', paddingVertical: 10, gap: 5, borderColor: mode === 'dark' ? colors.SHADOW : colors.BLACK}}>
                            <Ionicons name="settings-outline" size={22} color={theme === 'system' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK} />
                            <Text style={{fontWeight:'700', fontSize: 14, color: theme === 'system' ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('system')}</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1, flexDirection : isRTL ? 'row-reverse' : 'row', marginTop: 10, gap: 5 }}>
                       
                            <TouchableOpacity 
                                onPress={() => setThemeModalVisible(false)}
                                style={[styles.clearButton, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}
                            >
                                <Ionicons 
                                    name="close-circle-outline" 
                                    size={24} 
                                    color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                />
                            </TouchableOpacity>

                            <Button
                                title={t('ok')}
                                loading={false}
                                loadingColor={{ color: colors.GREEN }}
                                buttonStyle={[styles.textStyleBold, { color: colors.WHITE }]}
                                style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,  flex: 1, borderRadius: 10, height: 40 }}
                                textStyle={{ fontSize: 16, fontFamily: fonts.Bold }}
                                btnClick={() => { 
                                    setThemeModalVisible(false);
                                    dispatch(updateProfile({ mode: theme }))
                                    AsyncStorage.setItem('theme', JSON.stringify({ mode: theme }));
                                }}
                            />
                         </View>
                    </View>
                </View>
            </Modal>
        )
    }

    return (
        <View style={[styles.mainView,{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <Animated.View 
                style={{
                    opacity: profileAnim,
                    transform: [{
                        translateY: profileAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0]
                        })
                    }]
                }}
            >
                <Pressable onPress={() => props.navigation.navigate("Profile")} 
                    style={{flexDirection: isRTL ? 'row-reverse' : 'row', padding: 5, gap: 10, alignItems: 'center', marginHorizontal: 15}}
                >
                    <>
                        <View style={styles.imageViewStyle} >
                            {loader ?
                                <View style={[styles.loadingcontainer, styles.horizontal]}>
                                    <ActivityIndicator size="large" color={colors.INDICATOR_BLUE} />
                                </View>
                                : <View>
                                    <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ width: 70, height: 70, alignSelf: 'center', borderRadius: 70 / 2 }} />
                                </View>
                            }
                        </View>
                        <Text numberOfLines={1} style={[styles.textPropStyle,{textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK}]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.firstName.toUpperCase() + " " + auth.profile.lastName.toUpperCase()  : t('no_name')}</Text>
                    </>
                    <MaterialIcons name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} size={30} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                </Pressable> 
            </Animated.View>
            
            <View style={[styles.bigbox,{paddingVertical: 5, flex: 1, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={menuList}
                    scrollEnabled={true}
                    initialNumToRender={13}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Cars" || item.navigationName == "MyEarning")) {
                            return null;
                        }
                        else if (auth.profile && (auth.profile.usertype == "driver") && (item.navigationName == "Sos") && !(settings && settings.panic && settings.panic.length > 0)) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Sos") && appConsts.hasOptions) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Sos") && !(settings && settings.panic && settings.panic.length > 0)) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "editUser") && !(settings && ((settings.bank_fields && settings.RiderWithDraw) || settings.imageIdApproval))) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "driver" && (item.navigationName == "editUser") && !(settings && (settings.bank_fields || settings.imageIdApproval || settings.license_image_required))) {
                            return null;
                        } else {
                            return (
                                <Animated.View 
                                    style={[
                                        styles.vew,
                                        {
                                            opacity: fadeAnims[index] || 1,
                                            transform: [
                                                {
                                                    translateY: fadeAnims[index] ? 
                                                        fadeAnims[index].interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [50, 0]
                                                        }) : new Animated.Value(0)
                                                }
                                            ]
                                        }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={{ height: '100%', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}
                                        key={item.navigationName}
                                        onPress={() => {
                                            // Add press animation
                                            Animated.sequence([
                                                Animated.timing(fadeAnims[index], {
                                                    toValue: 0.8,
                                                    duration: 100,
                                                    useNativeDriver: true
                                                }),
                                                Animated.timing(fadeAnims[index], {
                                                    toValue: 1,
                                                    duration: 100,
                                                    useNativeDriver: true
                                                })
                                            ]).start(() => {
                                                if (item.navigationName === 'Sos') {
                                                    sos();
                                                } else if (item.navigationName === 'Refer') {
                                                    refer();
                                                } else if (item.navigationName === 'Logout') {
                                                    logOff('Logout');
                                                } else if (item.navigationName === 'Theme') {
                                                    setThemeModalVisible(true);
                                                } else if (item.navigationName === 'Convert') {
                                                    convert();
                                                } else {
                                                    props.navigation.navigate(item.navigationName)
                                                }
                                            });
                                        }}
                                    >
                                         <View style={[styles.vew2,{backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK + '20' : MAIN_COLOR + '20'}]}>
                                            <Icon
                                                name={item.icon}
                                                type={item.type}
                                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                                size={23}
                                            />
                                        </View>
                                        <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
                                            {loading && item.navigationName === 'Logout' ?
                                                <ActivityIndicator color={mode === 'dark' ? colors.WHITE : colors.BLACK} size='large' style={{ marginLeft: isRTL ? 0 : 50, marginRight: isRTL ? 50 : 0 }} />
                                                : <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontFamily:fonts.Regular, textAlign: isRTL ? 'right' : 'left' }}>{item.name}</Text>
                                            }
                                        </View>
                                        <View style={{ height: '100%', width: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <MaterialIcons name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} size={30} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        }
                    }}
                />
            </View>
            {themeModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1
    },
    vew: {
        flex: 1,
        height: 50,
        width: width - 20,
        marginVertical: 6,
        alignSelf: 'center'
    },
    vew1: {
        width: '88%',
        backgroundColor: colors.WHITE,
        height: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderRadius: 10,
    },
    vew2: {
        padding: 6,
        marginHorizontal: 5,
        backgroundColor: colors.BGTAXIPRIMARY,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center'
    },
    pickerStyle: {
        color: colors.BLACK,
        width: 45,
        marginRight: 3,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    pickerStyle1: {
        color: colors.BLACK,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
    },
    imageViewStyle: {
        backgroundColor: colors.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        width: 70,
        height: 70,
        alignSelf: 'center',
        borderRadius: 70 / 2,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    textPropStyle: {
        flex: 1,
        fontSize: 21,
        fontFamily: fonts.Bold
    },
    box:{
        width: (width-30)/3,
        height: (width-60)/3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        marginVertical: 6,
        alignItems: 'center',
        justifyContent:'space-evenly',
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        padding: 5
    },
    darkBox:{
        width: (width-30)/3,
        height: (width-60)/3,
        shadowColor: "#fff",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        marginVertical: 6,
        alignItems: 'center',
        justifyContent:'space-evenly',
        backgroundColor: colors.BLACK,
        borderRadius: 10,
        padding: 5
    },
    bigbox:{
        width: width-10,
        alignItems: 'center',
        justifyContent:'space-evenly',
        borderRadius: 10,
        margin: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    pickerStyle: {
        color: colors.BLACK,
        width: width - 100,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
        padding:2

    },
    pickerStyle1: {
        color: colors.HEADER,
        width: width - 80,
        fontSize: 15,
        height: 30,
        fontFamily:fonts.Bold
    },
    RnpickerBox: {
        width: "100%",
        height:"50%",
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.CONVERTDRIVER_TEXT,
        borderRadius: 10,
        alignItems: 'center',
        marginRight:5,
        paddingHorizontal:5
    },
    myViewStyle: {
        flex: 1,
        borderBottomColor: colors.BORDER_TEXT,
        height: 54,
        width: width-30
    },
    // okButtonContainer: {
    //     width:'100%',
    //     height: 50,
    //     flexDirection: 'row',
    //     alignSelf: 'center',
    // },
    okButtonContainerStyle: {
        width: '100%',
        height: 45,
        backgroundColor: MAIN_COLOR,
        borderRadius: 10
    },
    okButtonStyle: {
        flexDirection: 'row',
        backgroundColor: MAIN_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
    },
    clearButton:{
        padding: 5,
        borderRadius: 10,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.SHADOW,
    }
})