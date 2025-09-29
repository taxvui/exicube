import React, { useState, useEffect } from 'react';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    useColorScheme
} from 'react-native';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { DriverEarningRidelist } from '../components';
import { fonts } from '../common/font';

export default function DriverIncomeScreen(props) {

    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const settings = useSelector(state => state.settingsdata.settings);
    const [totalEarning, setTotalEarning] = useState(0);
    const [today, setToday] = useState(0);
    const [thisMonth, setThisMonth] = useState(0);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const [bookingData,setBookingData] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const auth = useSelector((state) => state.auth);
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

    useEffect(()=>{
        if(bookings){
            setBookingData(bookings);
            setTabIndex(0);
        }else{
            setBookingData([]);
            setTabIndex(0);
        }
    },[bookings]);

    const [bookingCount, setBookingCount] = useState();

    useEffect(() => {
        if (bookings) {
            let today = new Date();
            let tdTrans = 0;
            let mnTrans = 0;
            let totTrans = 0;
            let count = 0;
            for (let i = 0; i < bookings.length; i++) {
                if (bookings[i].status === 'PAID' || bookings[i].status === 'COMPLETE') {
                    const { tripdate, driver_share } = bookings[i];
                    let tDate = new Date(tripdate);
                    if (driver_share != undefined) {
                        if (tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth()) {
                            tdTrans = tdTrans + parseFloat(driver_share);
                        }
                        if (tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                            mnTrans = mnTrans + parseFloat(driver_share);
                        }
                        totTrans = totTrans + parseFloat(driver_share);
                        count = count + 1;
                    }
                }
            }
            setTotalEarning(totTrans.toFixed(settings.decimal));
            setToday(tdTrans.toFixed(settings.decimal));
            setThisMonth(mnTrans.toFixed(settings.decimal));
            setBookingCount(count);
        } else {
            setTotalEarning(0);
            setToday(0);
            setThisMonth(0);
            setBookingCount(0);
        }
    }, [bookings]);

    return (
        <View style={[styles.mainView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <View style={[styles.bookingInfo, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,{marginBottom: 5, alignSelf:'center', alignContent:'center', alignItems:'center'}]}>     
               
                <View style={{flexDirection:isRTL? 'row-reverse':'row', width:'100%', justifyContent:'space-around', padding: 10, borderBottomWidth: 1, borderBlockColor: colors.SHADOW}}>
                    <View style={{ justifyContent:'center', alignItems:'center'}}>
                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('booking_count')}</Text>
                        <View>
                            <Text style={[mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold]}>{bookingCount}</Text>
                        </View>
                    </View>

                    <View style={{justifyContent:'center', alignItems:'center'}}>
                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('today_text')}</Text>
                        <View >
                            {settings.swipe_symbol === false ?
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{settings.symbol}{today ? formatAmount(today, settings.decimal, settings.country) : '0'}</Text>
                            :
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{today ? formatAmount(today, settings.decimal, settings.country) : '0'}{settings.symbol}</Text>
                            }
                        </View>
                    </View>

                    <View style={{justifyContent:'center', alignItems:'center' }}>
                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('thismonth')}</Text>
                        <View>
                            {settings.swipe_symbol === false ?
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{settings.symbol}{thisMonth? formatAmount(thisMonth, settings.decimal, settings.country) : '0'}</Text>
                            :
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{thisMonth? formatAmount(thisMonth, settings.decimal, settings.country) : '0'}{settings.symbol}</Text>
                            }
                        </View>
                    </View>
                </View> 

                <View style={{ flexDirection: isRTL ? 'row-reverse' :'row', alignItems:'center', justifyContent: 'space-around', alignItems:'center',minWidth: 250, paddingVertical: 15}}>
                    <View>
                        <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{t('totalearning')}</Text>
                    </View>
                    <View>
                        {settings.swipe_symbol === false ?
                            <Text style={styles.textStyleBoldColor}>{settings.symbol}{totalEarning? formatAmount(totalEarning, settings.decimal, settings.country) : '0'}</Text>
                        :
                            <Text style={styles.textStyleBoldColor}>{totalEarning? formatAmount(totalEarning, settings.decimal, settings.country) : '0'}{settings.symbol}</Text>
                        }
                    </View>
                </View>
            </View>
            <View style={{flex: 1}}>
                {tabIndex>=0?
                    <DriverEarningRidelist data={bookingData} tabIndex={tabIndex} ></DriverEarningRidelist>
                :null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        padding: 5
    },
    bookingInfo: {
        width: '100%',
        borderRadius: 10,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        backgroundColor: colors.WHITE,
        padding: 5,
        borderWidth: .5,
        borderColor: colors.SHADOW
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    todayEarningHeaderText: {
        fontSize: 20,
        color: colors.BLACK
    },
    todayEarningMoneyText: {
        fontSize: 30,
        color: colors.GREEN,
        fontFamily:fonts.Bold
    },
    todayEarningHeaderText2: {
        fontSize: 24,
        color: colors.WHITE
    },
    todayEarningMoneyText2: {
        fontSize: 30,
        color: colors.WHITE,
        fontFamily:fonts.Bold
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular,
        color: colors.BLACK
    },
    textStyleDark: {
        fontSize: 15,
        fontFamily: fonts.Regular,
        color: colors.WHITE
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold,
        color: colors.BLACK
    },
    textStyleBoldDark: {
        fontSize: 15,
        fontFamily: fonts.Bold,
        color: colors.WHITE
    },
    textStyleBoldColor: {
        fontSize: 22,
        fontFamily: fonts.Bold,
        color: colors.GREEN
    }
})