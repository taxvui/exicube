import React,{useState, useEffect} from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ImageBackground,
  Alert,
  useColorScheme
} from "react-native";
import { Avatar, Button } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { fonts } from '../common/font';
import { getLangKey } from "common/src/other/getLangKey";
var { width, height } = Dimensions.get('window');

export default function PromoComp(props) {

  const settings = useSelector(state => state.settingsdata.settings);
  const promos = useSelector(state => state.promodata.promos);
  const auth = useSelector(state => state.auth);
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

  const onPressButton = (item, index) => {
    const { onPressButton } = props;
    onPressButton(item, index)
  }

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  const [state, setState] = useState('');

  const onPromoButton = () => {
    if (promos && promos.length > 0) {
      let count = true;
      for(let i = 0; i < promos.length; i++){
        if(promos[i].promo_code == state.toUpperCase()){
            count=false;
            onPressButton(promos[i], i);
            break;
        }
      }
      if(count){
        Alert.alert(t('alert'),t('promo_not_found'));
      }
    }
  };


  const renderData = ({ item, index }) => {
    return (
      <View style={[styles.container,{flexDirection:isRTL?'row-reverse':'row'}]} >
        <View style={[styles.fare, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, {height: 'auto', flexDirection: isRTL?'row-reverse':'row'}]}>
            <View style={[styles.textViewStyle, {justifyContent:'space-around'}]}>
              <View style={{flexDirection: 'column'}}>
                <Text style={[styles.couponCode,{textAlign: isRTL? "right":"left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t(getLangKey(item.promo_name))}</Text>
                <Text style={[styles.textStyle,{textAlign: isRTL? "right":"left", color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t(getLangKey(item.promo_description))}</Text>
                <Text style={[styles.textStyleBold,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('code')}: {item.promo_code}</Text>
              </View>
              {settings.swipe_symbol===false?
                <Text style={[styles.timeTextStyle,{textAlign: isRTL? "right":"left", color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{ isRTL? settings.symbol : null}{ isRTL? formatAmount(item.min_order, settings.decimal, settings.country) : null}{isRTL? " - " : null}{t('min_order_value')}{!isRTL? " - " : null}{ !isRTL? settings.symbol : null}{ !isRTL? formatAmount(item.min_order, settings.decimal, settings.country) : null}</Text>
                :
                <Text style={[styles.timeTextStyle,{textAlign: isRTL? "right":"left", color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('min_order_value')} {formatAmount(item.min_order, settings.decimal, settings.country)}{settings.symbol}</Text> 
              }
              
            </View>
            <View style={styles.applyBtnPosition} >
              <View style={[styles.avatarPosition,{justifyContent:isRTL?'flex-end':'flex-start', paddingVertical: 10}]}>
                <Avatar
                  size={40}
                  rounded
                  source={{
                    uri: item.promo_discount_type ?
                      item.promo_discount_type == 'flat' ? "https://cdn1.iconfinder.com/data/icons/service-maintenance-icons/512/tag_price_label-512.png" :
                        "https://cdn4.iconfinder.com/data/icons/icoflat3/512/discount-512.png" : null
                  }}
                />
              </View>
              <Button
                title={t('apply')}
                TouchableComponent={TouchableOpacity}
                titleStyle={[styles.buttonTitleStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
                buttonStyle={[styles.confButtonStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
                onPress={() => onPressButton(item, index)}
              />
            </View>
          </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}}>
       <View style={[styles.fare, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, {paddingHorizontal: 5, flexDirection:'row', alignItems: 'center', minHeight: 60, margin: 10, justifyContent: 'space-between'}]}>
        <View style={[styles.boxView,{width: width - 155}]}>
          <TextInput
            style={[isRTL? styles.textInputRtl : styles.textInput,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}
            placeholder={t('promo_code')}
            onChangeText={(text) => setState(text)}
            name={state}
            placeholderTextColor={colors.SHADOW}
          />
        </View>
        <View style={{width:135, alignItems: 'center'}}>
          <Button
            title={t('apply')}
            TouchableComponent={TouchableOpacity}
            titleStyle={[styles.buttonTitleStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
            buttonStyle={[styles.confButtonStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
            onPress={() => onPromoButton()}
            disabled={ state && state.length > 0 ? false : true}
          />
        </View>
      </View>
      <View style={{flex: 1, flexDirection:'row'}}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={promos.filter(item => (item.promo_show))}
          renderItem={renderData}
          showsVerticalScrollIndicator={false}
        /> 
        {/* <View style={{ height:25, width: '100%', position: 'absolute', bottom: 0 }}>
          <ImageBackground source={require('../../assets/images/white-grad.png')} style={{ width: width, height: 25, transform: [{ rotate: '180deg'}] }}/>
        </View> */}
      </View>
    </View>
  );

}
//Screen Styling
const styles = StyleSheet.create({
  container: {
    width: width,
    alignItems:'center',
    justifyContent:"center",
  },
  viewStyle: {
    flexDirection: "row",
    backgroundColor: colors.WHITE
  },
  borderBottomStyle: {
    borderBottomWidth: 1,
    marginTop: 5,
    borderBottomColor: colors.SHADOW,
    opacity: 0.3
  },
  promoViewStyle: {
    flex: 1
  },
  promoPosition: {
    flexDirection: "row"
  },
  avatarPosition: {
    justifyContent: "flex-start",
    flex: 1.5
  },
  textViewStyle: {
    justifyContent: "center",
    flex: 1,
    paddingLeft:10
  },
  fare:{
    width:width-20,
    marginTop: 5,
    backgroundColor: colors.WHITE,
    margin: 5,
    borderRadius:10,
    justifyContent:"center",
    padding: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 5,
  },
  shadowBack: {
    shadowColor: colors.SHADOW,
    backgroundColor: colors.WHITE,
  },
  shadowBackDark: {
      shadowColor: colors.SHADOW,
      backgroundColor: colors.PAGEBACK,
  },
  applyBtnPosition: {
    justifyContent: 'center',
    alignItems:'center',
    width: 115
  },
  textStyle: {
    fontSize: 15,
    flexWrap: "wrap",
    fontFamily:fonts.Regular
  },
  couponCode: {
    fontFamily:fonts.Bold
  },
  timeTextStyle: {
    color: colors.SHADOW,
    marginTop: 2,
    fontFamily:fonts.Regular
  },
  buttonTitleStyle: {
    textAlign: "center",
    color: colors.WHITE,
    fontSize: 15,
    fontFamily:fonts.Bold
  },
  confButtonStyle: {
    borderRadius: 6,
    width: 100,
    padding:5,
    alignSelf: 'flex-end',
    backgroundColor:colors.GREEN
  },
  deleteButtonStyle: {
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    height: 29,
    marginLeft: 8,
    borderColor: colors.HEADER,
    borderWidth: 1,
    width: 85
  },
  deleteBtnTitleStyle: {
    color: colors.RED,
    textAlign: "center",
    fontSize: 11,
    paddingBottom: 0,
    paddingTop: 0
  },
  boxView:{
    height: 50,
    justifyContent: 'center',
    borderRadius: 4,
    marginVertical: 5
  },
  textInputRtl:{
    textAlign:'right',
    fontSize: 14,
    marginRight: 5,
    fontFamily: fonts.Bold
  },
  textInput:{
      textAlign:'left',
      fontSize: 14,
      marginLeft: 5,
      fontFamily: fonts.Bold
  },
  textStyleBold: {
    fontSize: 15,
    fontFamily: fonts.Bold
  }
});