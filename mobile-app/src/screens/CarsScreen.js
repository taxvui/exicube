import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native'
import { colors } from '../common/theme'
import { useSelector, useDispatch } from 'react-redux';
import i18n from 'i18n-js';
import { MaterialIcons} from '@expo/vector-icons';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from 'common';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';
const { height, width } = Dimensions.get("window");
import { useColorScheme } from 'react-native';

export default function CarsScreen(props) {
    const {editCar} = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const carlistdata = useSelector(state => state.carlistdata);
    const [data, setData] = useState([]);
    const params = props.route.params;

    const fromPage = params && params.fromPage? params.fromPage: "";

    const auth = useSelector(state => state.auth);
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

    useEffect(() => {
        if (carlistdata.cars) {
            setData(carlistdata.cars);
        } else {
            setData([]);
        }
    }, [carlistdata.cars]);

    const onPress = (car) => {
        props.navigation.navigate('CarEdit', { car: car })
    }

    const onPressBack = () => {
        if(fromPage == 'DriverTrips'){
            props.navigation.navigate('TabRoot', { screen: fromPage });
        }else{
            props.navigation.goBack() 
        }
    }

    const lCom = () => {
        return (
          <TouchableOpacity style={{ marginLeft: 10}} onPress={onPressBack}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
          </TouchableOpacity>
        );
    }
    
    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);

    React.useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return (
                    <TouchableOpacity onPress={() => props.navigation.navigate('CarEdit')} style={{ marginEnd: 8, alignItems: 'flex-end', padding: 5 }}><Text style={[styles.headerTitleStyle, { color: colors.WHITE, transform: [{ scaleX: isRTL ? -1 : 1 }]}]}>{t('add')}</Text></TouchableOpacity>
                )
            }
        });
    }, [props.navigation]);


    const deleteCar = async (item) => {
        if(!item.active){
            Alert.alert(
                t('alert'),
                t('delete_your_car'),
                [
                    {
                        text: t('cancel'),
                        onPress: () => {},
                        style: 'cancel',
                        
                    },
                    {
                        text: t('yes'), onPress: () => {
                            dispatch(editCar(item,"Delete"));

                        }
                    },
                ],
                { cancelable: true }
            );
        }else{
            Alert.alert(t('alert'), t('active_car_delete'))
        }
    }

    return (

        <View style={[styles.container, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <View style={{flex: 1, position: 'absolute',backgroundColor: colors.TRANSPARENT, height:'100%', width: '100%' }}>
                <ScrollView styles={styles.container} showsVerticalScrollIndicator={false}>
                    {data && data.length > 0 ?
                        data.map((c, i) => {
                            return (
                                <TouchableWithoutFeedback key={"index" + i} onPress={() => onPress(c)}>
                                    <View style={[styles.card, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                        <View style={{ width: '100%', flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 5, alignItems: 'center' ,flex: 1}}>
                                            <View style={{width: width-160,alignItems:'center',height:160, borderRadius: 10, overflow:'hidden'}}>
                                                <Image source={{ uri:c.car_image }} style={{width:  width*2/3, height:160, borderRadius: 10, overflow:'hidden'}} resizeMode='cover' />
                                            </View>

                                            <View style={{height: 160, flex: 1, justifyContent: 'space-between', padding:3, alignItems: isRTL? 'flex-start' : 'flex-end'}}>
                                                <TouchableOpacity onPress={() => deleteCar(c)}>
                                                    <MaterialIcons name="delete" size={24} color={colors.RED} />
                                                </TouchableOpacity>

                                                <View style={[styles.statusBox,{borderColor: c.approved ? colors.GREEN : SECONDORY_COLOR, borderWidth: 2,width:'100%'}]}>
                                                    <Text style={[styles.statusBoxText,{color: c.approved ? colors.GREEN : colors.RED}]}>{c.approved ? t('approved') : t('pending')}</Text>
                                                </View>
                                                <View style={[styles.statusBox,{borderColor: c.active ? colors.GREEN : SECONDORY_COLOR, borderWidth: 2, width:'100%', maxHeight: 70}]}>
                                                    <Text style={[styles.statusBoxText,{color:  c.active ? colors.GREEN : colors.RED}]}>{c.active ? t('active') : t('inactive')}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {c && c.carType ?
                                        <View style={{ flexDirection: 'column', marginBottom: 5 }}>
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, alignItems: 'center', marginBottom: 10 }}>
                                                <Text style={[styles.textStyleBold, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}> {isRTL ? ": " : null}{t('car_type')} {isRTL ? null : " :"}</Text>
                                                <View style={{ alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', marginHorizontal: 10}}>
                                                   
                                                    {c.carType ?
                                                        <View style={{alignItems: 'center', marginHorizontal:10 }}>
                                                            <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t(getLangKey(c.carType))}</Text>
                                                        </View>
                                                    : null}
                                                </View>
                                            </View>

                                            <View style={[styles.vehicleDetails,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                {c.vehicleModel ?
                                                    <View style={{ flex:1, alignItems:'center'}}>
                                                        <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_model')}</Text>
                                                        <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{c.vehicleModel}</Text>
                                                    </View>
                                                : null}

                                                {c.vehicleMake ?
                                                    <View style={[styles.hbox2, { minHeight: 35, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                                : null}
                                                {c.vehicleMake ?
                                                    <View style={{ flex:1, marginHorizontal: 3, alignItems:'center'}}>
                                                        <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_make')}</Text>
                                                        <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{c.vehicleMake}</Text>
                                                    </View>
                                                : null}             
                                                {c.vehicleNumber ?
                                                    <View style={[styles.hbox2, { minHeight: 35, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                                                : null}
                                                {c.vehicleNumber ?
                                                    <View style={{ flex:1, marginHorizontal: 3, alignItems:'center'}}>
                                                        <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('vehicle_number')}</Text>
                                                        <Text style={[styles.textStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{c.vehicleNumber}</Text>
                                                    </View>
                                                :
                                                    <View style={{ flex: 1}}>
                                                        <Text style={[styles.textStyleBold, { textAlign: isRTL ? "right" : "left" , marginBottom: 5, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}> {t('car_no_not_found')}</Text>
                                                    </View>
                                                }
                                            </View>
                                        </View>
                                        : null}

                                        {c.other_info ?
                                        <View style={{ marginTop: 5}}>
                                            <Text style={[mode === 'dark' ? styles.textDark : styles.text,{ textAlign: isRTL ? 'right' : 'left'},{fontSize:16}]}>{t('info')}: {c.other_info}</Text>
                                        </View>
                                        : null }
                                    
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        })
                    :
                    <View style={{flex: 1, justifyContent:'center', alignItems:'center', height: height/2, padding: 10}}>
                        <Text style={{fontSize: 23, fontFamily:fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('car_add')}</Text>
                    </View>
                    }
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily:fonts.Bold,
        fontSize: 20,
        marginEnd: '10%'
    },
    card: {
        backgroundColor: colors.WHITE,
        margin: 10,
        marginVertical: 5,
        borderRadius: 10,
        padding: 5,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
        gap: 5
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    carImage: {
        width: '90%', 
        height: '100%'
    },
    text: {
        color: colors.BLACK,
        fontSize: 16,
        fontFamily:fonts.Medium
    },
    textDark: {
        color: colors.WHITE,
        fontSize: 16, 
        //marginHorizontal: 15,
        fontFamily:fonts.Medium
    },
    textInfo: {
        color: colors.BLACK,
        fontSize: 16, 
        marginHorizontal: 15,
        fontFamily:fonts.Regular
    },
    textInfoDark: {
        color: colors.WHITE,
        fontSize: 16, 
        marginHorizontal: 15,
        fontFamily:fonts.Regular
    },
    statusBox: {
        //height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10
    },
    statusBoxText:{
        color: colors.HEADER,
        fontSize: 18,
        fontFamily:fonts.Regular,
        fontWeight: '800'
    },
    hbox2: {
        width: 1
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
})