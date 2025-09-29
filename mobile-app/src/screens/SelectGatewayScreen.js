import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableWithoutFeedback, Text, Alert, TouchableOpacity, Dimensions, Linking, useColorScheme } from 'react-native';
import i18n from 'i18n-js';
import { colors } from '../common/theme';
import PaymentWebView from '../components/PaymentWebView';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { api } from 'common';
import { FirebaseConfig } from '../../config/FirebaseConfig';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

export default function SelectGatewayPage(props) {
  const {
    clearMessage,
    RequestPushMsg
  } = api;
  const dispatch = useDispatch();
  const url = FirebaseConfig.databaseURL.split('.').length===4?FirebaseConfig.databaseURL.split('.')[1]:'us-central1';
  const serverUrl = `https://${url}-${FirebaseConfig.projectId}.cloudfunctions.net`;

  const auth = useSelector((state) => state.auth);
  let colorScheme = useColorScheme();
  const [mode, setMode] = useState();

  const { t } = i18n;

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

  const icons = {
    'paypal': require('../../assets/payment-icons/paypal-logo.png'),
    'braintree': require('../../assets/payment-icons/braintree-logo.png'),
    'stripe': require('../../assets/payment-icons/stripe-logo.png'),
    'payulatam': require('../../assets/payment-icons/payulatam-logo.png'),
    'flutterwave': require('../../assets/payment-icons/flutterwave-logo.png'),
    'paystack': require('../../assets/payment-icons/paystack-logo.png'),
    'securepay': require('../../assets/payment-icons/securepay-logo.png'),
    'payfast': require('../../assets/payment-icons/payfast-logo.png'),
    'liqpay': require('../../assets/payment-icons/liqpay-logo.png'),
    'culqi': require('../../assets/payment-icons/culqi-logo.png'),
    'mercadopago': require('../../assets/payment-icons/mercadopago-logo.png'),
    'squareup': require('../../assets/payment-icons/squareup-logo.png'),
    'wipay': require('../../assets/payment-icons/wipay-logo.png'),
    'razorpay': require('../../assets/payment-icons/razorpay-logo.png'),
    'iyzico': require('../../assets/payment-icons/iyzico-logo.png'),
    'slickpay': require('../../assets/payment-icons/slickpay-logo.png'),
    'paymongo': require('../../assets/payment-icons/paymongo-logo.png'),
    'test': require('../../assets/payment-icons/test-logo.png'),
    'xendit': require('../../assets/payment-icons/xendit-logo.png'),
    'tap': require('../../assets/payment-icons/tap-logo.png')
  }

  const { payData, providers, userdata, settings, booking } = props.route.params;

  const [state, setState] = useState({
    payData: payData,
    providers: providers,
    userdata: userdata,
    settings: settings,
    booking: booking,
    selectedProvider: null
  });

  const paymentmethods = useSelector(state => state.paymentmethods);
  useEffect(() => {
    if (paymentmethods.message) {
      Alert.alert(t('alert'), paymentmethods.message);
      dispatch(clearMessage());
    }
  }, [paymentmethods.message]);


  const onSuccessHandler = (order_details) => {
    if (state.booking) {
      if (state.booking.status == "PAYMENT_PENDING") {
        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookedCab', params: { bookingId: state.booking.id } }] }));
      } else {
        if (state.booking.customer_token) {
          RequestPushMsg(
            state.booking.customer_token,
            {
              title: t('notification_title'),
              msg: t('success_payment'),
              screen: 'BookedCab',
              params: { bookingId: state.booking.id }
            }
          );
        }
        if (state.booking.driver_token) {
          RequestPushMsg(
            state.booking.driver_token,
            {
              title: t('notification_title'),
              msg: t('success_payment'),
              screen: 'BookedCab',
              params: { bookingId: state.booking.id }
            }
          );
        }
        if (state.booking.status == 'NEW') {
          props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookedCab', params: { bookingId: state.booking.id } }] }));
        } else {
          props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'DriverRating', params: { bookingId: state.booking } }] }));
        }

      }
    } else {
      props.navigation.navigate('TabRoot', { screen: 'Wallet' });
    }
  };

  const onCanceledHandler = () => {
    if (state.booking) {
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'PaymentDetails', params: { booking: booking } }] }));
    } else {
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
    }
  };


  const selectProvider = (provider) => {
    if((provider && provider.name == 'slickpay') && (state.payData && state.payData.amount <=100)){
      Alert.alert(t('alert'), t('amount_must_be_gereater_than_100'));
    }else{
      setState({ ...state, selectedProvider: provider });
    }
  };      // Handle MercadoPago URL callbacks
  useEffect(() => {
    const routeParams = props.route.params;
    if (routeParams?.mercadopago_status) {
      if (routeParams.mercadopago_status === 'success') {
        const orderDetails = {
          transaction_id: routeParams.payment_id || 'no transaction id',
          gateway: 'mercadopago'
        };
        onSuccessHandler(orderDetails);
      } else if (routeParams.mercadopago_status === 'cancel') {
        onCanceledHandler();
      }
    }
  }, [props.route.params]);

  const handleMercadoPagoPayment = async () => {
    try {
      // Create form data
      const formData = new URLSearchParams();
      formData.append('order_id', state.payData.order_id);
      formData.append('amount', state.payData.amount);
      formData.append('currency', state.payData.currency);
      formData.append('product_name', state.payData.product_name);
      formData.append('quantity', state.payData.quantity);
      formData.append('cust_id', state.payData.cust_id);
      formData.append('mobile_no', state.payData.mobile_no);
      formData.append('email', state.payData.email);
      formData.append('first_name', state.payData.first_name);
      formData.append('last_name', state.payData.last_name);
      formData.append('platform', 'mobile');
      // Add success and cancel URLs for deep linking
      formData.append('success_url', `${FirebaseConfig.projectId}://payment?mercadopago_status=success`);
      formData.append('cancel_url', `${FirebaseConfig.projectId}://payment?mercadopago_status=cancel`);

      // Make the request to get checkout URL
      const response = await fetch(serverUrl + '/mercadopago-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Payment request failed');
      }

      const result = await response.json();
      
      if (result.url || result.init_point) {
        // Open the URL in device browser
        await Linking.openURL(result.url || result.init_point);
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('MercadoPago payment error:', error);
      Alert.alert(t('alert'), t('payment_error'));
      onCanceledHandler();
    }
  };

  useEffect(() => {
    if (state.selectedProvider?.name === 'mercadopago') {
      handleMercadoPagoPayment();
      setState({ ...state, selectedProvider: null });
    }
  }, [state.selectedProvider]);

  return (
    <View style={[styles.container,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
      {state.selectedProvider && state.selectedProvider.name !== 'mercadopago' ? 
        <PaymentWebView 
          serverUrl={serverUrl} 
          provider={state.selectedProvider} 
          payData={state.payData} 
          onSuccess={onSuccessHandler} 
          onCancel={onCanceledHandler} 
        /> 
      : null}
      {state.providers && state.selectedProvider == null ?
    <ScrollView>
      {
        state.providers.map((provider) => {
          return (
            <TouchableOpacity activeOpacity={0.92} style={styles.paymentmethodContainer} onPress={() => { selectProvider(provider) }} key={provider.name}>
              <View style={[styles.box, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, { marginTop: 6 }]} underlayColor={colors.BLUE}>
                <Image
                  style={styles.thumb}
                  source={icons[provider.name]}
                />
              </View>
            </TouchableOpacity>

          );
        })
      }

    </ScrollView>
    : null
  }
</View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 5
  },
  paymentmethodContainer: {
    alignItems: "center"
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Roboto-Bold',
    fontSize: 20
  },
  box: {
    height: 75,
    width: "95%",
    justifyContent: 'center',
    paddingLeft: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    marginTop: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
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
  thumb: {
    height: 35,
    width: 100,
    resizeMode: 'contain'
  }
});
