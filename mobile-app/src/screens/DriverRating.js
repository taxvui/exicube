import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Modal,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Alert,
    useColorScheme
} from 'react-native';
import { Button } from 'react-native-elements';
import StarRating from 'react-native-star-rating-widget';
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useDispatch, useSelector } from 'react-redux';
import { api } from 'common';
import { MAIN_COLOR, MAIN_COLOR_DARK , SECONDORY_COLOR } from '../common/sharedFunctions';
import DownloadReceipt from '../components/DownloadReceipt';
import { fonts } from '../common/font'

export default function DriverRating(props) {
    const { updateBooking } = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [starCount, setStarCount] = useState(0);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const settings = useSelector(state => state.settingsdata.settings);
    const [booking, setBooking] = useState();
    const { bookingId } = props.route.params;
    const onChangeText = { onChangeText };
    const [amount, setAmount] = useState(0);
    const auth = useSelector(state=> state.auth);
    const providers = useSelector(state => state.paymentmethods.providers);
    const [tipAmount, setTipAmount] = useState(['5', '10', '20']);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

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

    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let bookingData = activeBookings.filter(item => item.id == bookingId.id)[0];
            if (bookingData) {
                setBooking(bookingData);
            }
        }
    }, [activeBookings]);

    useEffect(() => {
        if (settings && settings.tipMoneyField) {
          const moneyField = settings.tipMoneyField.split(",");
          if (moneyField.length > 0) {
            setTipAmount(moneyField);
          }
        }
    }, [settings]);

    const onStarRatingPress = (rating) => {
        setStarCount(rating);
    }

    const skipRating = () => {
        let curBooking = { ...bookingId };
        curBooking.status = 'COMPLETE';
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('TabRoot', { name: "RideList", params: { "fromBooking": true } });
    }

    const initData = {
        feedback: ''
    };

    const [state, setState] = useState(initData);

    const submitNow = () => {
        let curBooking = { ...booking };
        curBooking.rating = starCount;
        curBooking.feedback = state.feedback;
        curBooking.status = 'COMPLETE';
        curBooking.tipamount = amount >= 0? amount: null;
        if(amount >0){
            if(amount && auth.profile.walletBalance > amount){
                dispatch(updateBooking(curBooking));
                props.navigation.navigate('TabRoot', { name: "RideList", params: { "fromBooking": true } });
            }else{
               
                Alert.alert(
                    t('alert'),
                    t('wallet_tips'),
                    [
                        { text: t('cancel'), onPress: () => { }, style: 'cancel' },
                        { text: t('ok'), onPress: () =>   
                            props.navigation.push('addMoney', { userdata: auth.profile, providers: providers, tipamount: amount })
                        }
                    ],
                    { cancelable: false }
                );
            }
        }
        else{
            dispatch(updateBooking(curBooking));
                    props.navigation.navigate('TabRoot', { name: "RideList", params: { "fromBooking": true } });
        }
    }

    const newData = ({ item, index }) => {
        return (
          <TouchableOpacity key={"key" + index} style={[styles.boxView, {borderColor: amount== item? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : SECONDORY_COLOR,borderWidth:1,borderRadius: 6,}]} onPress={() => { setAmount(parseFloat(item)) }}>
            {settings.swipe_symbol===false?
              <Text style={[styles.quckMoneyText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >{settings.symbol}{formatAmount(item, settings.decimal, settings.country)}</Text>
              :
              <Text style={[styles.quckMoneyText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >{formatAmount(item, settings.decimal, settings.country)}{settings.symbol}</Text>
            }
          </TouchableOpacity>
        )
    }

    return (
        <View style={[styles.mainViewStyle, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
            <View style={{ height: 20 }} />
            <View style={[styles.vew,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                <View style={[isRTL?{flexDirection:'row-reverse',marginRight:-3}:{flexDirection:'row',marginLeft:-3}]}>
                    {booking ? booking.driver_image != '' ?
                        <Image source={{ uri: booking.driver_image }} style={{ height: 85, width: 85, marginTop: -25, borderWidth: 5, borderColor: "white", borderRadius: 50 }} />
                        :
                        <Image source={require('../../assets/images/profilePic.png')} style={{ height: 85, width: 85, marginTop: -20, borderWidth: 3, borderColor:MAIN_COLOR, borderRadius: 50 }} />
                    : null}
                    <View>
                        <Text style={[styles.drivername,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{booking ? booking.driver_name : null}</Text>
                        <View style={[styles.ratingViewStyle,{alignSelf:isRTL?'flex-end':'flex-start'}]}>
                            <StarRating
                                maxStars={5}
                                starSize={18}
                                enableHalfStar={true}
                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                emptyColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                rating={booking && booking.driverRating ? (Math.round(parseFloat(booking.driverRating) * 2) / 2) : 0}
                                onChange={() => {
                                    //console.log('hello')
                                }}
                                style={[isRTL ? { transform: [{ scaleX: -1 }] } : null]}
                            />
                        </View>
                        <DownloadReceipt booking={booking} settings={settings}/>
                    </View>
                </View>
                <KeyboardAvoidingView style={styles.form} behavior={Platform.OS == "ios" ? "padding" : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 0}>
                    <ScrollView showsVerticalScrollIndicator={false} >
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 10, width: "100%"}}>
                            {booking && booking.vehicleModel ?
                                <View style={{ width: width / 3.25, alignItems: 'center', padding: 2 }}>
                                    <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_model')}</Text>
                                    <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{booking.vehicleModel}</Text>
                                </View>
                                : null}

                            {booking && booking.vehicleMake ?
                                <View style={[styles.hbox2, { minHeight: 35,  backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                : null}
                            {booking && booking.vehicleMake ?
                                <View style={{ width: width / 3.25, marginHorizontal: 3, alignItems: 'center' }}>
                                    <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_make')}</Text>
                                    <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{booking.vehicleMake}</Text>
                                </View>
                                : null}
                            {booking && booking.vehicle_number ?
                                <View style={[styles.hbox2, { minHeight: 35,  backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                : null}
                            {booking && booking.vehicle_number ?
                                <View style={{ width: width / 3.25, marginHorizontal: 2, alignItems: 'center' }}>
                                    <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_number')}</Text>
                                    <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{booking.vehicle_number}</Text>
                                </View>
                                :
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", marginBottom: 5 }]}> {t('car_no_not_found')}</Text>
                                </View>
                            }
                        </View>

                        <View style={{  borderColor: colors.SHADOW, margin: 5,borderWidth:1}} />
                        <Text style={[{ textAlign: 'center', fontSize: 25, marginTop: 10, color: mode === 'dark' ? colors.WHITE : colors.BLACK },styles.textStyleBold]}>{t('how_your_trip')}</Text>
                        <Text style={[{ textAlign: 'center', marginTop: 10, color: mode === 'dark' ? colors.WHITE : colors.BLACK },styles.textStyle]}>{t('your_feedback_test')}</Text>
                       

                        <View style={[styles.ratingViewStyle, { marginVertical:5 }]}>
                            <StarRating
                                maxStars={5}
                                starSize={50}
                                enableHalfStar={true}
                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                emptyColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                rating={starCount}
                                onChange={(rating) => onStarRatingPress(rating)}
                                style={[isRTL ? { marginRight: 0, transform: [{ scaleX: -1 }] } : { scaleX: 1 }]}
                            />
                        </View>
                        <View style={{ borderColor: colors.SHADOW, borderWidth: 1, borderRadius: 5, marginVertical: 5, margin: 10 }}>
                            <TextInput
                                multiline={true}
                                style={[styles.textInput, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK },styles.textStyleBold]}
                                placeholder={t('your_feedback')}
                                placeholderTextColor={colors.SHADOW}
                                onChangeText={(text) => setState({ ...state, feedback: text })}
                                value={state.feedback}
                                numberOfLines={10}
                            />
                        </View>
                        {!settings.disable_tips && (
                            <>
                                <Text style={{ marginTop: 5, textAlign: 'center', fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize', color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                    {t('addtip')}
                                </Text>
                                <View style={styles.quickMoneyContainer}>
                                    <FlatList
                                        keyExtractor={(item, index) => index.toString()}
                                        data={tipAmount}
                                        renderItem={newData}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                </View>
                                <View style={{alignItems: 'center',flexDirection:isRTL?'row-reverse':'row',justifyContent:'center'}}>
                                    <Text style={[styles.walletbalText,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('wallet_balance')} </Text>
                                    <Text style={{color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>- </Text>
                                    {settings.swipe_symbol===false?
                                    <Text style={[styles.ballance,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{settings.symbol}{auth.profile ? formatAmount(auth.profile.walletBalance, settings.decimal, settings.country) : ''}</Text>
                                    :
                                    <Text style={[styles.ballance,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{auth.profile ? formatAmount(auth.profile.walletBalance, settings.decimal, settings.country) : ''}{settings.symbol}</Text>
                                    }
                                </View>
                                <View style={{borderColor: colors.SHADOW, borderWidth: 1, borderRadius: 5, marginVertical: 8, margin: 10, }}>
                                    <TextInput
                                        style={[{color: mode === 'dark' ? colors.WHITE : colors.BLACK},isRTL?{textAlign:'center',fontSize:20,padding:3}:{textAlign:'center',fontSize:20,padding:3}]}
                                        placeholder={t('tipamount') + " (" + settings.symbol + ")"}
                                        placeholderTextColor={colors.SHADOW}
                                        keyboardType={'number-pad'}
                                        onChangeText={(text) => setAmount(parseFloat(text))}
                                        value={amount? amount.toString(): ""}
                                    />
                                </View>
                            </>
                        )}
                        <View style={{ marginHorizontal: 10, }}>
                            <Button
                                title={t('submit_rating')}
                                titleStyle={{ fontFamily:fonts.Bold }}
                                onPress={() => submitNow()}
                                buttonStyle={[styles.myButtonStyle,{backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
                                disabled={starCount > 0 ? false : true}
                            />
                            <TouchableOpacity onPress={() => skipRating()}><Text style={[styles.skip,styles.textStyle]}>{t('skip')}</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    tripMainView: {
       
    },
    ratingViewStyle: {
        flexDirection: "row",
        alignSelf: 'center',
    },
    drivername: {
        fontSize: 20,
        textAlign: "center",
        fontFamily: fonts.Bold,
        textTransform: 'uppercase',
       marginHorizontal:3
    },
    Vehicalnumber: {
        fontSize: 15,
       fontFamily:fonts.Regular,
        padding: 2,
    },
    vew: {
        flex: 1,
        borderRadius: 10,
    },
    mainViewStyle: {
        flex: 1
    },
    textInput: {
        textAlign: 'left',
        fontSize: 14,
        marginLeft: 5,
        width: width - 50,
        height: 90,
        flexDirection: 'column',
        textAlignVertical: 'top',
        padding: 5,
        justifyContent: 'flex-start'
    },
    form:{
        justifyContent:'space-between',
        flex:1
    },
    skip: {
        fontSize: 16,
        padding: 10,
        textAlign: 'center',
        color: colors.SHADOW
    },
    myButtonStyle: {
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        height: 50,
        padding: 5,
        borderRadius: 10,
        marginTop: 10
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
    hbox2: {
        width: 1
    },
    signInTextStyle:{
        fontFamily:fonts.Regular
    },
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: fonts.Bold, fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.PAGEBACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: fonts.Regular, fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    inputTextStyle: {
        marginTop: 10,
        marginHorizontal: 20,
        alignItems:'center'
      },
      buttonTitle: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily:'Roboto-Bold'
      },
      quickMoneyContainer: {
        marginHorizontal: 10,
        marginVertical:8,
        alignItems: 'center',
        justifyContent: 'center'
      },
      boxView: {
        height: 35,
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal:5
      },
      quckMoneyText: {
        fontSize: 16,
      },
      ballance: {
        fontFamily:fonts.Bold
      },
      walletbalText: {
        fontSize: 17,
        fontFamily:fonts.Regular
      },
});