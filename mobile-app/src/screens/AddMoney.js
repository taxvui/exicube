
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  FlatList,
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { api } from 'common';

export default function AddMoneyScreen(props) {

  const settings = useSelector(state => state.settingsdata.settings);
  const { userdata, providers, tipamount } = props.route.params;
  const { parseNumberInput, formatNumberInput } = api;

  const [state, setState] = useState({
    userdata: userdata,
    providers: providers,
    amount: '',
    displayAmount: '',
    qickMoney: [],
    payAuto: false
  });

  const defaultAmount = ['5', '10', '20', '50', '100'];
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

  useEffect(() => {
      let arr = [];
      if( settings && settings.walletMoneyField && settings.walletMoneyField != ""){
        const moneyField = settings.walletMoneyField.split(",");
        for (let i = 0; i < moneyField.length; i++) {
          arr.push({ amount: moneyField[i], selected: false });
        }
        
      }
    else {
        for (let i = 0; i < defaultAmount.length; i++) {
          arr.push({ amount: defaultAmount[i], selected: false });
        } 
      }
    if (tipamount && tipamount > 0) {
      const isVietnamese = settings.country === "Vietnam";
      const displayAmount = isVietnamese ? formatNumberInput(tipamount, true) : tipamount.toString();
      setState({ ...state, amount: tipamount.toString(), displayAmount: displayAmount, qickMoney: arr, payAuto: true });
      } else {
      const isVietnamese = settings.country === "Vietnam";
      const displayAmount = isVietnamese ? formatNumberInput(arr[0].amount, true) : arr[0].amount;
      setState({ ...state, amount: arr[0].amount, displayAmount: displayAmount, qickMoney: arr });
      }
  }, [settings, tipamount, setTimeout, payNow]);

  useEffect(() => {
    if (state.payAuto) {
      setState({ ...state, payAuto: false });
      payNow()
    }

  }, [state.payAuto]);

  const quckAdd = (index) => {
    let quickM = state.qickMoney;
    for (let i = 0; i < quickM.length; i++) {
      quickM[i].selected = false;
      if (i == index) {
        quickM[i].selected = true;
      }
    }
    const amount = quickM[index].amount;
    const isVietnamese = settings.country === "Vietnam";
    const displayAmount = isVietnamese ? formatNumberInput(amount, true) : amount;

    setState({
      ...state,
      amount: amount,
      displayAmount: displayAmount,
      qickMoney: quickM
    })
  }

  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const reference = [...Array(4)].map(_ => c[~~(Math.random() * c.length)]).join('');

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

  const payNow = () => {
    const actualAmount = parseFloat(state.amount);
    if (actualAmount >= 1) {
      var d = new Date();
      var time = d.getTime();
      let payData = {
        email: state.userdata.email,
        amount: actualAmount,
        order_id: "wallet-" + state.userdata.uid + "-" + reference,
        name: t('add_money'),
        description: t('wallet_ballance'),
        currency: settings.code,
        quantity: 1,
        paymentType: 'walletCredit'
      }
      if (payData) {
        props.navigation.navigate("paymentMethod", {
          payData: payData,
          userdata: state.userdata,
          settings: state.settings,
          providers: state.providers
        });
      }
    } else {
      Alert.alert(t('alert'), t('valid_amount'));
    }
  }

  const newData = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.boxView, { borderColor: item.selected ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : SECONDORY_COLOR, borderWidth: 1 }]} onPress={() => { quckAdd(index); }}>
        {settings.swipe_symbol === false ?
          <Text style={[styles.quckMoneyText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >{settings.symbol}{formatAmount(item.amount, settings.decimal, settings.country)}</Text>
          :
          <Text style={[styles.quckMoneyText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >{formatAmount(item.amount, settings.decimal, settings.country)}{settings.symbol}</Text>
        }
      </TouchableOpacity>
    )
  }

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  return (
    <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>

      <View style={styles.bodyContainer}>
        <View style={[isRTL?{flexDirection:'row-reverse',alignItems: 'center'}:{flexDirection:'row',alignItems: 'center'}]}>
        <Text style={[styles.walletbalText,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('Balance')} </Text>
        <Text style={{color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>- </Text> 
        {settings.swipe_symbol===false?
          <Text style={[styles.ballance,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{settings.symbol}{state.userdata ? formatAmount(state?.userdata?.walletBalance, settings.decimal, settings.country) : ''}</Text>
          :
          <Text style={[styles.ballance,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{state.userdata ? formatAmount(state?.userdata?.walletBalance, settings.decimal, settings.country) : ''}{settings.symbol}</Text>
        }
      </View>
      <View >
        <TextInput
          style={[styles.inputTextStyle1,{textAlign: isRTL ? 'right': 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}
          placeholder={t('addMoneyTextInputPlaceholder') + " (" + settings.symbol + ")"}
          keyboardType={'number-pad'}
          onChangeText={handleAmountChange}
          value={state.displayAmount || state.amount}
          placeholderTextColor={mode === 'dark' ? colors.WHITE : colors.BLACK}

        />
        </View>
        <View style={styles.quickMoneyContainer}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={state.qickMoney}
              renderItem={newData}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
        </View>
        <TouchableOpacity
          style={[styles.buttonWrapper2,{  backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
          onPress={payNow}>
          <Text style={styles.buttonTitle}>{t('add_money').toUpperCase()}</Text>
        </TouchableOpacity>
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
  inputTextStyle1: {
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
  },
  quickMoneyContainer: {
    marginTop: 18,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 4,
  },
  boxView: {
    height: 40,
    minWidth: 60,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 5
  },
  quckMoneyText: {
    fontSize: 16,
    fontFamily: fonts.Regular
  }
});