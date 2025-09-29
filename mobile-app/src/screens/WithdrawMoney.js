import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  useColorScheme
} from 'react-native';
import { Header, Button } from 'react-native-elements';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';

export default function WithdrawMoneyScreen(props) {
  const {
    withdrawBalance,
  } = api;
  const { parseNumberInput, formatNumberInput } = api;
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settingsdata.settings);
  const { userdata } = props.route.params;
  const [state, setState] = useState({
    userdata: userdata,
    amount: null,
    displayAmount: ''
  });
  const [loading, setLoading] = useState(false);

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
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
      if (auth.profile.mode === 'system') {
        setMode(colorScheme);
      } else {
        setMode(auth.profile.mode);
      }
    } else {
      setMode('light');
    }
  }, [auth, colorScheme]);

  const handleAmountChange = (text) => {
    const isVietnamese = settings.country === "Vietnam";

    if (isVietnamese) {
      // Parse Vietnamese input and get actual numeric value
      const numericValue = parseNumberInput(text, true);
      // Format for display
      const displayValue = formatNumberInput(numericValue, true);

      setState({
        ...state,
        amount: numericValue.toString(),
        displayAmount: displayValue
      });
    } else {
      setState({
        ...state,
        amount: text,
        displayAmount: text
      });
    }
  }

  const withdrawNow = () => {
    if (parseFloat(state.userdata.walletBalance) > 0 && parseFloat(state.amount) > 0 && parseFloat(state.amount) <= parseFloat(state.userdata.walletBalance)) {
      dispatch(withdrawBalance(state.userdata, state.amount));
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        props.navigation.navigate('TabRoot', { screen: 'Wallet' });
      }, 2000);
    } else {
      if (parseFloat(state.amount) > parseFloat(state.userdata.walletBalance)) {
        Alert.alert(t('alert'), t('withdraw_more'));
      }
      else if (parseFloat(state.amount) <= 0) {
        Alert.alert(t('alert'), t('withdraw_below_zero'));
      } else {
        Alert.alert(t('alert'), t('valid_amount'));
      }
    }
  }

  return (
    <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>

      <View style={styles.bodyContainer}>
        {settings.swipe_symbol === false ?
          <Text style={[styles.walletbalText, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('Balance')} - <Text style={styles.ballance}>{settings.symbol}{state.userdata ? formatAmount(state.userdata.walletBalance, settings.decimal, settings.country) : ''}</Text></Text>
          :
          <Text style={[styles.walletbalText, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('Balance')} - <Text style={styles.ballance}>{state.userdata ? formatAmount(state.userdata.walletBalance, settings.decimal, settings.country) : ''}{settings.symbol}</Text></Text>
        }
        <TextInput
          style={[styles.inputTextStyle, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
          placeholder={t('amount') + " (" + settings.symbol + ")"}
          keyboardType={'number-pad'}
          onChangeText={handleAmountChange}
          value={state.displayAmount || state.amount}
          placeholderTextColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
        />
        <Button
          title={t('withdraw')}
          loading={loading}
          titleStyle={styles.buttonTitle}
          onPress={withdrawNow}
          buttonStyle={[styles.buttonWrapper2, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
          containerStyle={{ height: '100%' }}
        />
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  mainView: {
    flex: 1
  },
  bodyContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    paddingHorizontal: 12
  },
  walletbalText: {
    fontSize: 17,
    fontFamily: fonts.Regular
  },
  ballance: {
    fontFamily: fonts.Bold
  },
  inputTextStyle: {
    marginTop: 10,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    fontSize: 20,
    fontFamily:fonts.Regular
  },
  buttonWrapper2: {
    marginBottom: 10,
    marginTop: 18,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 18,
    fontFamily: fonts.Bold
  }
});