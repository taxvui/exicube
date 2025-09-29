import React, { useEffect, useState } from 'react';
import { WTransactionHistory } from '../components';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Alert,
  TouchableOpacity
} from 'react-native';
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { MAIN_COLOR,MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function WalletDetails(props) {

  const auth = useSelector(state => state.auth);
  const walletHistory = useSelector(state => state.auth.walletHistory);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [profile, setProfile] = useState();
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  var { height, width } = Dimensions.get('window');
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
    if (auth.profile && auth.profile.uid) {
      setProfile(auth.profile);
    } else {
      setProfile(null);
    }
  }, [auth.profile]);

  const doReacharge = () => {
    if (!(profile.mobile && profile.mobile.length > 6 && profile.email && profile.firstName)) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes:[{ name: 'Profile', params: { fromPage: 'Wallet'}}]}));
    } else {
      if (providers) {
        props.navigation.push('addMoney', { userdata: profile, providers: providers });
      } else {
        Alert.alert(t('alert'), t('provider_not_found'))
      }
    }
  }

  const doWithdraw = () => {
    if (!(profile.mobile && profile.mobile.length > 6) && profile.email && profile.firstName) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes:[{ name: 'Profile', params: { fromPage: 'Wallet'}}]}));
    } else {
      if (parseFloat(profile.walletBalance) > 0) {
        props.navigation.push('withdrawMoney', { userdata: profile });
      } else {
        Alert.alert(t('alert'), t('wallet_bal_low'))
      }
    }
  }


  return (
    <View style={[styles.mainView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
      <View style={styles.Vew}>

        <View style={styles.View6}>
          <View style={[styles.walletCard, {backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK + '40' : MAIN_COLOR + '40'}]}>
            <Text style={[styles.balanceLabel,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: 'center'}]}>{t('wallet_balance')}</Text>
            {settings.swipe_symbol === false ?
            isRTL ?
              <Text style={[styles.balanceText,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK,}]}>{profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}{settings.symbol}</Text>
              :
              <Text style={[styles.balanceText,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK,}]}>{settings.symbol}{profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}</Text>
            :
            isRTL ?
              <Text style={[styles.balanceText,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK,}]}>{profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}{settings.symbol}</Text>
              :   
              <Text style={[styles.balanceText,{ color: mode === 'dark' ? colors.WHITE : colors.BLACK,}]}>{settings.symbol} {profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}</Text>
            }
          </View>
          
          {profile && (profile.usertype == 'driver' || (profile.usertype == 'customer' && settings && settings.RiderWithDraw)) ?
            <View style={[styles.buttonContainer, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
              <TouchableOpacity onPress={doReacharge} style={[styles.button, styles.addButton,{flexDirection: isRTL ? 'row-reverse' : 'row',}]}>
                <MaterialIcons name="add" size={24} color={colors.WHITE} style={{marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0}} />
                <Text style={styles.buttonText}>{t('add_money').toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doWithdraw} style={[styles.button, styles.withdrawButton,{flexDirection: isRTL ? 'row-reverse' : 'row',}]}>
                <MaterialIcons name="payments" size={24} color={colors.WHITE} style={{marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0}} />
                <Text style={styles.buttonText}>{t('withdraw').toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
            :
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={doReacharge} style={[styles.button, styles.addButton,{flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                <MaterialIcons name="add" size={24} color={colors.WHITE} style={{marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0}} />
                <Text style={styles.buttonText}>{t('add_money').toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </View>
    
      <View style={styles.Vew4}>
        <Text style={[styles.View5, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('transaction_history_title')}</Text>
        <WTransactionHistory walletHistory={walletHistory ? walletHistory : []} role={auth.profile && auth.profile.usertype? auth.profile.usertype:null}/>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  Vew4: {
    flex: 1,
    padding: 5,
  },
  Vew: {
    width: '100%',
    height: 'auto',
  },
  View5: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontFamily: fonts.Medium,
    marginTop: 10
  },
  View6: {
    width: '100%',
    alignSelf: 'flex-end',
    padding: 20,
  },
  walletCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 5
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  balanceLabel: {
    opacity: 0.9,
    fontSize: 16,
    fontFamily: fonts.Regular,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  balanceText: {
    fontSize: 35,
    fontFamily: fonts.Bold,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    //paddingHorizontal: 10,
    marginTop: 10,
    gap: 5
  },
  button: {
    flex: 1,
    height: 50,
    //minWidth: 150,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: colors.GREEN
  },
  withdrawButton: {
    backgroundColor: colors.RED
  },
  buttonIcon: {
    
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 15,
    fontFamily: fonts.Bold,
    letterSpacing: 0.5,
  }
});