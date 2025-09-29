import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Share,
    TextInput,
    useColorScheme
} from 'react-native';
import { Icon, Input } from 'react-native-elements'
import ActionSheet from "react-native-actions-sheet";
import { colors } from '../common/theme';
import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { api, FirebaseContext } from 'common';
import StarRating from 'react-native-star-rating-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from '../components/RNPickerSelect';
import moment from 'moment/min/moment-with-locales';
import { MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import Dialog from "react-native-dialog";
import { FontAwesome5 } from '@expo/vector-icons';
import rnauth from '@react-native-firebase/auth';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';

export default function ProfileScreen(props) {
    const { authRef, mobileAuthCredential, updatePhoneNumber } = useContext(FirebaseContext);
    const { t } = i18n;
    const [isRTL, setIsRTL] = useState();
    const {
        updateProfileImage,
        deleteUser,
        updateProfile,
        updateProfileWithEmail,
        checkUserExists,
        requestMobileOtp,
        updateAuthMobile,
        countries
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);
    const actionSheetRef = useRef(null);
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    const pickerRef1 = React.createRef();
    const pickerRef2 = React.createRef();
    const [countrycodeFocus, setCountryCodeFocus] = useState(false)
    const [countryCode, setCountryCode] = useState();
    const [userMobile, setUserMobile] = useState('');

    const fromPage = props.route.params && props.route.params.fromPage ? props.route.params.fromPage : null;

    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

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

    const formatCountries = useMemo(() => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = "(+" + countries[i].phone + ") " + countries[i].label ;
            arr.push({ label: txt, value: txt, key: txt, inputLabel: " +" + countries[i].phone});
        }
        return arr;
    }, [countries]); 

    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setCountryCode("(+" + countries[i].phone + ") " + countries[i].label );
                    setUserMobile("")
                }
            }
        }
        
    }, [settings]);


    const upDateCountry = (text) => {
        setCountryCode(text);
        setProfileData({ ...profileData, mobile: "" })
    }


    useEffect(() => {
        setLangSelection(i18n.locale);
        setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0);
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }
    }, [auth.profile]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.SHADOW, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.SHADOW, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3]
            });
            actionSheetRef.current?.setModalVisible(false);
            if (!result.canceled) {
                setProfileData({
                    ...profileData,
                    profile_image: result.assets[0].uri
                })
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    updateProfileImage(blob);
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    };

    const deleteAccount = () => {
        setDLoading(true)
        Alert.alert(
            t('delete_account_modal_title'),
            t('delete_account_modal_subtitle'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { setDLoading(false) },
                    style: 'cancel',

                },
                {
                    text: t('yes'), onPress: () => {
                        dispatch(deleteUser(auth.profile.uid));

                    }
                },
            ],
            { cancelable: false },
        );
    }

    const [otp, setOtp] = useState("");
    const [editName, setEditName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editMobile, setEditMobile] = useState(false);
    const [confirmCode, setConfirmCode] = useState(null);

    const [updateCalled, setUpdateCalled] = useState(false);
    const [otpCalled, setOtpCalled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dloading, setDLoading] = useState(false);

    const [emailLoading,setEmailLoading] = useState(false)
    const [mobileLoading,setmobileLoading] = useState(false)
    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
            if (updateCalled) {
            
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [
                        {
                            text: t('ok'), onPress: () => {
                                setUpdateCalled(false);
                                setEmailLoading(false);
                                setmobileLoading(false);
                            }
                        }
                    ],
                    { cancelable: true }
                );
                setUpdateCalled(false);
            }
        }
    }, [auth.profile, updateCalled]);

    const saveName = async () => {

        if (profileData.firstName.length > 0 && profileData.lastName.length > 0) {
            let userData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName
            }
            setUpdateCalled(true);
            dispatch(updateProfile(userData));
            setEditName(false);
        } else {
            setEditName(true)
            Alert.alert(
                t('alert'),
                t('proper_input_name'),
                [
                    {
                        text: t('cancel'),
                        onPress: () => { setEditName(false) },
                        style: 'cancel',

                    },
                    { text: t('ok'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        }
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email)
        return emailValid;
    }

    const completeSubmit = () => {
        setLoading(true);
        let userData = {
            mobile: profileData.mobile,
            email: profileData.email
        }
        setUpdateCalled(true);
        dispatch(updateProfile(userData));
        setLoading(false);
        setEditMobile(false);
    }

    

    const saveProfile = async (set) => {
        // setLoading(true)
        if (profileData.email === auth.profile.email && set === 1) {
            setEditEmail(false);
            setLoading(false)
            setEmailLoading(false)
        } else if (profileData.mobile === auth.profile.mobile && set === 2) {
            setEditMobile(false);
            setLoading(false)
            setmobileLoading(false)
            setUserMobile("")
        } else if (profileData.email !== auth.profile.email) {
            if (validateEmail(profileData.email)) {
                setEmailLoading(true)
                checkUserExists({ email: profileData.email }).then((res) => {
                    if (res.users && res.users.length > 0) {
                        Alert.alert(t('alert'), t('user_exists'));
                        setLoading(false)
                        setEmailLoading(false)
                    }
                    else if (res.error) {
                        Alert.alert(t('alert'), t('email_or_mobile_issue'));
                        setLoading(false)
                        setEmailLoading(false)
                    } else {
                        setEditEmail(false);
                        profileData['uid'] = auth.profile.uid;
                        dispatch(updateProfileWithEmail(profileData));
                        setUpdateCalled(true);
                        setEmailLoading(false)
                    }
                });
            } else {
                Alert.alert(t('alert'), t('proper_email'));
                setLoading(false);
            }
        } else {
            if (profileData.mobile !== auth.profile.mobile && profileData.mobile && profileData.mobile.length > 6) {
                checkUserExists({ mobile: profileData.mobile }).then(async (res) => {
                    setmobileLoading(true)
                    if (res.users && res.users.length > 0) {
                        Alert.alert(t('alert'), t('user_exists'));
                        setLoading(false);
                        setmobileLoading(false)
                        setEditMobile(false);
                    }
                    else if (res.error) {
                        Alert.alert(t('alert'), t('email_or_mobile_issue'));
                        setLoading(false);
                        setEditMobile(false);
                        setEmailLoading(false)
                    } else {
                        if (settings.customMobileOTP) {
                            setOtpCalled(true);
                            dispatch(requestMobileOtp(profileData.mobile));
                            if(!settings.AllowCriticalEditsAdmin){
                                Alert.alert(t('alert'), t('in_demo_mobile_login'));
                            }
                            setmobileLoading(false)
                        } else {
                            const snapshot = await rnauth()
                                .verifyPhoneNumber(profileData.mobile)
                                .on('state_changed', (phoneAuthSnapshot) => {
                                        if(phoneAuthSnapshot && phoneAuthSnapshot.state === "error"){
                                            setLoading(false);
                                            setEditMobile(false);
                                            setEmailLoading(false);
                                            setmobileLoading(false);
                                            Alert.alert(t('alert'), t('email_or_mobile_issue'));
                                        }
                                });
                            if (snapshot) {
                                setConfirmCode(snapshot);
                                setOtpCalled(true);
                            }
                        }
                        setUserMobile("")
                    }
                });
            } else {
                Alert.alert(t('alert'), t('mobile_no_blank_error'))
                setLoading(false)
                setEditMobile(false);
            }
        }
    }

    const handleVerify = async () => {
        setOtpCalled(false);
        if (otp && otp.length === 6 && !isNaN(otp)) {
            if (settings.customMobileOTP) {
                const res = await updateAuthMobile(profileData.mobile, otp);
                if (res.success) {
                    completeSubmit();
                } else {
                    setOtp('');
                    setUserMobile("")
                    setLoading(false);
                    setEmailLoading(false)
                    if (res.error === 'Error updating user') {
                        Alert.alert(t('alert'), t('user_exists'));
                    } else {
                        Alert.alert(t('alert'), t('otp_validate_error'));
                    }
                }
            } else {
                const credential = await mobileAuthCredential(
                    confirmCode.verificationId,
                    otp
                );
                updatePhoneNumber(authRef().currentUser, credential).then((res) => {
                    completeSubmit();
                }).catch((error) => {
                    setOtp('');
                    setOtpCalled(true);
                    Alert.alert(t('alert'), t('otp_validate_error'));
                });
            }
        } else {
            setOtp('');
            setOtpCalled(true);
            Alert.alert(t('alert'), t('otp_validate_error'));
        }
    }

    const handleClose = () => {
        setOtpCalled(false);
        setLoading(false);
        setEmailLoading(false);
        setEditMobile(false);
        setmobileLoading(false);
    }
    const cancle = (set) => {
        if (set === 0) {
            setEditName(false);
            setProfileData({ ...profileData, firstName: auth.profile.firstName, lastName: auth.profile.lastName})
        } else if (set === 1) {
            setEditEmail(false);
            setProfileData({ ...profileData, email: auth.profile.email})
        } else if (set === 2) {
            setEditMobile(false);
            setProfileData({ ...profileData, mobile: auth.profile.mobile})
            setUserMobile('')
        }
    }

    const onPressBack = () => {
        if (fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet') {
            props.navigation.navigate('TabRoot', { screen: fromPage });
        } else {
            props.navigation.goBack()
        }
    }

    const lCom = () => {
        return (
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={onPressBack}>
                <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
            </TouchableOpacity>
        );
    }

    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);


    return (
        <View style={styles.mainView}>
            <View style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}>
                <View style={[styles.profileInfo,{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
                    <View style={styles.imageViewStyle} >
                        {loader ?
                            <View style={[styles.loadingcontainer, styles.horizontal]}>
                                <ActivityIndicator size="large" color={colors.BLUE} />
                            </View>
                            : <TouchableOpacity onPress={showActionSheet}>
                                <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ width: 95, height: 95, alignSelf: 'center', borderRadius: 95 / 2 }} />
                            </TouchableOpacity>
                        }

                    </View>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginHorizontal: 20, paddingRight: 15, }}>
                        {editName ?
                            <View style={[isRTL ? { flexDirection: 'row-reverse', width: '100%' } : { flexDirection: 'row', marginLeft: 0, width: '100%', height: 50 }]}>
                                <Input
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={t('first_name_placeholder')}
                                    placeholderTextColor={colors.SHADOW}
                                    value={profileData && profileData.firstName ? profileData.firstName : ""}
                                    keyboardType={'email-address'}
                                    inputStyle={[styles.inputTextStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13 }]}
                                    onChangeText={(text) => { setProfileData({ ...profileData, firstName: text }) }}
                                    secureTextEntry={false}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={{ width: "50%" }}
                                />
                                <Input
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={t('last_name_placeholder')}
                                    placeholderTextColor={colors.SHADOW}
                                    value={profileData && profileData.lastName ? profileData.lastName : ""}
                                    keyboardType={'email-address'}
                                    inputStyle={[styles.inputTextStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { textAlign: 'right', fontSize: 13 } : { textAlign: 'left', fontSize: 13 }]}
                                    onChangeText={(text) => { setProfileData({ ...profileData, lastName: text }) }}
                                    secureTextEntry={false}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={isRTL ? { marginLeft: 0, width: "50%" } : { marginRight: 0, width: "50%" }}
                                />
                            </View>
                            :
                            <View style={{ width: '100%' }}>
                                {isRTL ?
                                    <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.lastName.toUpperCase() + " " + auth.profile.firstName.toUpperCase() : t('no_name')}</Text>
                                    :
                                    <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.firstName.toUpperCase() + " " + auth.profile.lastName.toUpperCase() : t('no_name')}</Text>
                                }
                            </View>
                        }
                        {editName ?
                            <View style={{ marginTop: -18,paddingLeft:isRTL?15:0, }}>
                                <Entypo name="cross" size={24} color={colors.RED} onPress={() => cancle(0)} />
                                <MaterialIcons onPress={saveName} name="check" size={24} style={{ marginTop: 10 }} color={colors.BLUE} />
                            </View>
                            :
                            <TouchableOpacity onPress={() => setEditName(true)}  style={[{marginLeft:isRTL?20:0}]}>
                                <Feather name="edit-3" size={22} color={colors.SHADOW} style={{ marginTop: 10 }} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollStyle, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                {
                    uploadImage()
                }
                <View style={[styles.newViewStyle,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>

                    <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row', height: editEmail ? 74 : 64 }]}>
                        <View style={styles.iconViewStyle}>
                            <Entypo name="email" size={25} color={colors.SHADOW} />
                        </View>
                        <View style={[isRTL ? { marginRight: 15, width: width - 70 } : { width: width - 70}]}>
                            <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]}>{t('email_placeholder')}</Text>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingRight: 15, }}>
                                {editEmail ?
                                    <View style={{ width: width - 140 }}>
                                        <TextInput
                                            style={[mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, { borderBottomColor: colors.SHADOW, borderBottomWidth: 1, height: editEmail ? 40 : null }]}
                                            placeholder={t('email_placeholder')}
                                            placeholderTextColor={colors.SHADOW}
                                            value={profileData && profileData.email ? profileData.email : ''}
                                            keyboardType={'email-address'}
                                            onChangeText={(text) => { setProfileData({ ...profileData, email: text }) }}
                                            secureTextEntry={false}
                                            blurOnSubmit={true}
                                            errorStyle={styles.errorMessageStyle}
                                            inputContainerStyle={[styles.inputContainerStyle, { height: 50 }]}
                                            autoCapitalize='none'
                                        />
                                    </View>
                                    :
                                    <View style={{ marginTop: 1, width: width - 140, }}>
                                        <Text style={[mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]} numberOfLines={1}>{profileData && profileData.email ? profileData.email : t('email_placeholder')}</Text>
                                    </View>
                                }

                                {editEmail ?
                                    <View style={[{marginLeft:isRTL?15:0,width:'auto'}]}>
                                        {emailLoading ?
                                            <ActivityIndicator color={mode === 'dark' ? colors.WHITE : colors.BLACK} size='small' />
                                            :
                                            <View style={{ marginTop: -18, }}>
                                                <Entypo name="cross" size={24} color={colors.RED} onPress={() => cancle(1)} />
                                                <MaterialIcons onPress={() => saveProfile(1)} name="check" size={24} style={{ marginTop: 10 }} color={colors.BLUE} />
                                            </View>
                                        }
                                    </View>
                                    :
                                    <TouchableOpacity onPress={() => setEditEmail(true)} style={[{marginLeft:isRTL?20:10}]}>
                                        <Feather name="edit-3" size={22} color={colors.SHADOW} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>

                    <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row', height: editMobile ? 74 : 64 }]}>
                        <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='phone-call'
                                type='feather'
                                size={25}
                                color={colors.SHADOW}
                            />

                        </View>
                        <View style={[{ marginVertical:2 },[isRTL ? { marginRight: 15, width: width - 70 } : { width: width - 70 }]]}>
                            
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems:"center", paddingRight: 15, marginVertical:3}}>
                                {editMobile ?
                                    <View style={{ width: width - 140, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems:"center", justifyContent:"space-between" }}>

                                        <View style={{ width: "35%", height:"100%", flexDirection: "column", justifyContent:"space-around" }}>
                                            <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }, {fontSize:12}]}>{t('select_country')}</Text>
                                            <TouchableOpacity activeOpacity={0.5} style={[styles.RnpickerBox, { flexDirection: isRTL ? 'row-reverse' : "row",               justifyContent:'space-between', }]} 
                                                disabled={settings.AllowCountrySelection}
                                                >
                                                <View style={{ overflow: "hidden", height: '100%', width: "100%",}} >
                                                    <RNPickerSelect
                                                        numberOfLines={1}
                                                        pickerRef={pickerRef2}
                                                        onFocus={() => setCountryCodeFocus(!countrycodeFocus)}
                                                        onBlur={() => setCountryCodeFocus(!countrycodeFocus)}
                                                        key={countryCode}
                                                        placeholder={{ label: t('select_country'), value: t('select_country') }}
                                                        value={countryCode}
                                                        textInputProps={{
                                                            maxLength: 40,
                                                            styles: {
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }
                                                        }}
                                                        
                                                        useNativeAndroidPickerStyle={false}
                                                        style={{
                                                            inputIOS: [styles.pickerStyle, { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start', color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (countrycodeFocus === true) ? styles.pickerFocus
                                                                : styles.pickerStyle],
                                                            placeholder: {
                                                                color: colors.SHADOW
                                                            },
                                                            inputAndroid: [styles.pickerStyle, { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start', color: mode === 'dark' ? colors.WHITE : colors.fbgf }, (countrycodeFocus === true) ? styles.pickerFocus
                                                                : styles.pickerStyle]
                                                        }}
                                                        onTap={() => {
                                                            if(settings){
                                                                if(settings.AllowCountrySelection){
                                                                    pickerRef2.current.focus() 
                                                                }
                                                            }
                                                    
                                                        }}
                                                        onValueChange={(text) => { upDateCountry(text); }}
                                                        items={formatCountries}
                                                        disabled={settings.AllowCountrySelection ? false : true}
                                                        Icon={() => { return <Ionicons name="arrow-down" size={18} color={colors.SHADOW} style={[isRTL ? { marginLeft: -(width - 80) } : { marginRight: Platform.OS == "ios" ? -1 : 1  }, {margin:5}]} />; }}
                                                        mode={mode}
                                                    />

                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ width: "60%", height:"100%", flexDirection: "column", justifyContent:"space-around",  }}>
                                            <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }, {fontSize:12}]}>{t('mobile')}</Text>
                                            <TextInput
                                                style={[
                                                    mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, 
                                                    { borderBottomColor: colors.SHADOW, borderBottomWidth: 1, width:"100%" }, 
                                                    isRTL ? { textAlign: 'right', fontSize: 16 } : { textAlign: 'left', fontSize: 16 }
                                                ]}
                                                placeholder={t('mobile')}
                                                placeholderTextColor={colors.SHADOW}
                                                value={userMobile?.replace(`+${countryCode.replace(/[^0-9]/g, '')}`, '')}
                                                keyboardType={'phone-pad'}
                                                onChangeText={(text) => {
                                                    let extNum = countryCode.replace(/[^0-9]/g, '');
                                                    setUserMobile(`+${extNum}${text}`)
                                                    setProfileData({ ...profileData, mobile: `+${extNum}${text}` });
                                                }}
                                                secureTextEntry={false}
                                                errorStyle={styles.errorMessageStyle}
                                                inputContainerStyle={[styles.inputContainerStyle, { height: 50 }]}
                                            />
                                        </View>
                                    </View>
                                    :
                                    <View style={{ width: width - 140, marginVertical: 1 }}>
                                        <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]}>{t('mobile')}</Text>
                                        <Text style={[mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }, {}]} >{auth?.profile?.mobile ? auth.profile.mobile : t('mobile')}</Text>
                                    </View>
                                }
                                {editMobile ?
                                    <TouchableOpacity onPress={() => saveProfile(2)} style={[{marginLeft:isRTL?15:0}]}>
                                        {mobileLoading ?
                                            <ActivityIndicator color={mode === 'dark' ? colors.WHITE : colors.BLACK} size='small' />
                                            :
                                            <View style={{  }}>
                                                <Entypo name="cross" size={24} color={colors.RED} onPress={() => cancle(2)} />
                                                <MaterialIcons onPress={() => saveProfile(2)} name="check" size={24} style={{ marginTop: 10 }} color={colors.BLUE} />
                                            </View>
                                        }
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={() => setEditMobile(true)}  style={[{marginLeft:isRTL?20:0}]}>
                                        <Feather name="edit-3" size={22} color={colors.SHADOW} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>

                    {langSelection && languagedata && languagedata.langlist && languagedata.langlist.length > 1 ?
                        <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={styles.iconViewStyle}>
                                <Ionicons name="language-sharp" size={25} color={colors.SHADOW} />
                            </View>
                            <View style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, [isRTL ? { textAlign: 'right', marginRight: 15 } : { textAlign: 'left', marginRight: 15 }]]}>{t('lang')}</Text>
                                {langSelection ?
                                    <RNPickerSelect
                                        pickerRef={pickerRef1}
                                        placeholder={{}}
                                        value={langSelection}
                                        useNativeAndroidPickerStyle={false}
                                        style={{
                                            inputIOS: [styles.pickerStyle,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK }, [isRTL ? { marginRight: 0, textAlign: 'right' } : { marginLeft: 15, textAlign: 'left' }]],
                                            inputAndroid: [styles.pickerStyleAndroid,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK }, [isRTL ? { marginRight: 0, textAlign: 'right' } : { marginLeft: 10, textAlign: 'left' }]],
                                            placeholder: {
                                                color: colors.SECONDARY
                                            }
                                        }}
                                        onTap={() => { pickerRef1.current.focus() }}
                                        onValueChange={
                                            (text) => {
                                                let defl = null;
                                                for (const value of Object.values(languagedata.langlist)) {
                                                    if (value.langLocale == text) {
                                                        defl = value;
                                                    }
                                                }
                                                setLangSelection(text);
                                                i18n.locale = text;
                                                moment.locale(defl.dateLocale);
                                                setIsRTL(text == 'he' || text == 'ar')
                                                AsyncStorage.setItem('lang', JSON.stringify({ langLocale: text, dateLocale: defl.dateLocale }));
                                                dispatch(updateProfile({ lang: { langLocale: text, dateLocale: defl.dateLocale } }));
                                            }
                                        }
                                        label={"Language"}
                                        items={Object.values(languagedata.langlist).map(function (value) { return { label: value.langName, value: value.langLocale }; })}
                                        Icon={() => { return <Ionicons name="arrow-down" size={20} color={colors.SHADOW} style={[isRTL ? { marginLeft: -(width - 80) } : { marginRight: Platform.OS == "ios" ? -8 : 10 }]} />; }}
                                        mode={mode}
                                    />
                                    : null}
                            </View>
                        </View>
                        : null}

                    {profileData && profileData.referralId ?
                        <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Icon
                                    name='award'
                                    type='feather'
                                    color={colors.SHADOW}
                                    size={25}
                                />
                            </View>
                            <View style={[isRTL ? { marginRight: 15 } : null]}>
                                <Text style={mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader}>{t('referralId')}</Text>
                                <Text style={[mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]} >{profileData.referralId}</Text>
                            </View>
                            <TouchableOpacity
                                style={[isRTL ? { marginRight: 10, marginTop: 15 } : { marginLeft: 10, marginTop: 15 }]}
                                onPress={() => {
                                    settings.bonus > 0 ?
                                        Share.share({
                                            message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                        :
                                        Share.share({
                                            message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                }}
                            >
                                <Icon
                                    name={Platform.OS == 'android' ? 'share-social' : 'share'}
                                    type='ionicon'
                                    color={colors.BLUE}
                                />
                            </TouchableOpacity>
                        </View>
                        : null}
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Ionicons name="car-sport-outline" size={25} color={colors.SHADOW} />
                            </View>
                            <View style={[isRTL ? { marginRight: 15 } : null]}>
                                <Text style={mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader}>{t('car_type')}</Text>
                                <Text style={mode === 'dark' ? styles.dataInfoDark : styles.dataInfo}>{profileData.carType && t(getLangKey(profileData.carType))}</Text>
                            </View>
                        </View>
                        : null}
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={[styles.myViewStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <MaterialCommunityIcons name="star-shooting-outline" size={25} color={colors.SHADOW} />
                            </View>
                            <View style={[isRTL ? { marginRight: 15 } : null]}>
                                <Text style={[mode === 'dark' ? styles.dataHeaderDark : styles.dataHeader, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]}>{t('you_rated_text')}</Text>
                                <View style={[{ flex: 1 }, isRTL ? { alignSelf: 'flex-end', flexDirection: 'row-reverse' } : { alignSelf: 'flex-start', flexDirection: 'row' }]}>
                                    <Text style={[mode === 'dark' ? styles.dataInfoDark : styles.dataInfo, isRTL ? { color: mode === 'dark' ? colors.WHITE : colors.BLACK } : { left: 10, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{profileData && profileData.usertype && profileData.rating ? profileData.rating : 0}</Text>
                                    <StarRating
                                        maxStars={5}
                                        starSize={15}
                                        enableHalfStar={true}
                                        color={colors.STAR}
                                        emptyColor={colors.STAR}
                                        rating={profileData && profileData.usertype && profileData.rating ? (Math.round(parseFloat(profileData.rating) * 2) / 2) : 0}
                                        style={[styles.contStyle, isRTL ? { marginRight: 10, transform: [{ scaleX: -1 }] } : { marginLeft: 10 }]}
                                        onChange={() => {
                                            //console.log('hello')
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        : null}
                </View>

                <TouchableOpacity onPress={deleteAccount} style={styles.deleteBtn}>
                    {dloading ?
                        <ActivityIndicator color={mode === 'dark' ? colors.WHITE : colors.BLACK} size='small' />
                        :
                        <Text style={[styles.deleteBtnText, { color: colors.WHITE, paddingHorizontal: 10 }]}>{t('delete_account_lebel')}</Text>
                    }
                </TouchableOpacity>
                <Dialog.Container visible={otpCalled}>
                    <Dialog.Description style={{ color: colors.HEADER, fontWeight: 'bold' }}>{auth.profile && profileData && (auth.profile.mobile != profileData.mobile) ? t('check_mobile') : t('check_email')}</Dialog.Description>
                    <Dialog.Input placeholder={t('otp_here')} placeholderTextColor={colors.HEADER} keyboardType='numeric' onChangeText={(otp) => setOtp(otp)} style={{ color: colors.HEADER, textAlign: isRTL ? 'right' : 'left' }}></Dialog.Input>
                    <Dialog.Button label={t('cancel')} onPress={handleClose} style={{ marginRight: 15, color: colors.HEADER }} />
                    <Dialog.Button label={t('ok')} onPress={handleVerify} style={{ marginRight: 10, color: colors.BLUE }} />
                </Dialog.Container>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollStyle: {
        height: height
    },
    profileInfo: {
        width: '100%',
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center'
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
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 100 / 2,
        marginTop: -45,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontFamily: fonts.Bold,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 10
    },
    newViewStyle: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 10,
    },
    myViewStyle: {
        flex: 1,
        borderBottomColor: colors.SHADOW,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 10,
        height: 64,
        borderRadius: 15,
        width: '100%',
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    iconViewStyle: {
        alignSelf: 'center',
        padding: 10,
        width: 50
    },
    deleteBtn: {
        flexDirection: 'row',
        height: 40,
        minWidth: 150,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.RED,
        borderRadius: 10,
        marginVertical: 15
    },
    deleteBtnText: {
        fontSize: 17,
        color: colors.BLACK,
        fontFamily:fonts.Bold,
        textAlign: 'center',
        marginVertical: 5
    },
    dataHeader: {
        fontSize: 17,
        color: colors.BLACK,
        fontFamily: fonts.Bold
    },
    dataHeaderDark: {
        fontSize: 17,
        color: colors.WHITE,
        fontFamily: fonts.Bold
    },
    dataInfo: {
        fontSize: 15,
        color: colors.BLACK,
        fontFamily:fonts.Regular,
    },
    dataInfoDark: {
        fontSize: 15,
        color: colors.WHITE,
        fontFamily:fonts.Regular,
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    contStyle: {
        width: 90,
    },
    pickerStyle: {
        width: width - 100,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
        padding:2
    },
    pickerStyleAndroid: {
        color: colors.SHADOW,
        width: width - 80,
        fontSize: 15,
        //height: 30,
        fontFamily:fonts.Bold
    },
    errorMessageStyle: {
        fontSize: 12,
        fontFamily:fonts.Bold,
        marginLeft: 0
    },
    inputContainerStyle: {
        width: "100%",
    },
    inputTextStyle: {
        color: colors.HEADER,
        fontSize: 13,
        height: 32,
        fontFamily:fonts.Regular
    },
    RnpickerBox: {
        width: "100%",
        height:"50%",
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.SHADOW,
        borderRadius: 10,
        alignItems: 'center',
        marginRight:5,
        paddingHorizontal:5
    },
});