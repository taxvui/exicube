import React, { useState, useEffect} from 'react';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    Animated,
    Dimensions,
    useColorScheme
} from 'react-native';
import i18n from 'i18n-js';
import { useSelector } from "react-redux";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fonts } from '../common/font';
var { width} = Dimensions.get('window');

export default function AboutPage(props) {

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector((state) => state.auth);
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

    return (
        <View style={[styles.mainView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height:'100%'}}>
                <View style={{flex:1}}>
                    <View style={styles.logo}>
                        <Image
                            style={{ width: width/2.5, height: width/2.5, borderRadius: 10 }}
                            source={require('../../assets/images/logo1024x1024.png')}
                        />
                    </View>
                </View>
                <Text style={{ textAlign: isRTL? 'right' : 'left', fontSize: 16, marginHorizontal:20,marginBottom:20, fontFamily:fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>
                    {t('about_us_content1') + ' ' + t('about_us_content2')}
                </Text>
                {settings && (settings.CompanyPhone || settings.contact_email || settings.CompanyWebsite)?
                <View style={{ marginBottom: 20}}>
                    {settings.CompanyPhone ?
                        <View style={[styles.vew, {flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center'}]}>
                            <View style={[styles.vewLogo, mode === 'dark'? styles.shadowBackDark : styles.shadowBack]}>
                                <Ionicons name="call" size={30} color= {mode === 'dark'? colors.WHITE : colors.BLACK} />
                            </View>
                            <View style={styles.textpart}>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 14, textAlign: isRTL ? "right" : "left" }}>{t('contact_us')}</Text>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 12, textAlign: isRTL ? "right" : "left" }}>{settings.CompanyPhone}</Text>
                            </View>
                        </View>
                    : null }
                    {settings.contact_email ?
                        <View style={[styles.vew, {flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center'}]}>
                            <View style={[styles.vewLogo, mode === 'dark'? styles.shadowBackDark : styles.shadowBack]}>
                                <MaterialIcons name="email" size={30} color= {mode === 'dark'? colors.WHITE : colors.BLACK} />
                            </View>
                            <View style={styles.textpart}>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 14, textAlign: isRTL ? "right" : "left" }}>{t('email')}</Text>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 12, textAlign: isRTL ? "right" : "left" }}>{settings.contact_email}</Text>
                            </View>
                        </View>
                    : null }
                    {settings.CompanyWebsite ?
                        <View style={[styles.vew, {flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center'}]}>
                            <View style={[styles.vewLogo, mode === 'dark'? styles.shadowBackDark : styles.shadowBack]}>
                                <MaterialCommunityIcons name="web" size={30} color= {mode === 'dark'? colors.WHITE : colors.BLACK} />
                            </View>
                            <View style={styles.textpart}>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 14, textAlign: isRTL ? "right" : "left" }}>{t('CompanyWebsite')}</Text>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK , fontFamily:fonts.Bold, fontSize: 12, textAlign: isRTL ? "right" : "left" }}>{settings.CompanyWebsite}</Text>
                            </View>
                        </View>
                    : null }
                </View>
                : null }
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1
    },
    vew: {
        flex: 1,
        height: 55,
        width: width-40,
        marginVertical: 6,
        alignSelf: 'center'
    },
    logo:{
        width: width/2.5,
        height: width/2.5,
        marginTop: 10,
        marginBottom: 25,
        alignSelf: 'center',
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
        borderRadius: 10
    },
    vewLogo: {
        width: 50,
        alignItems: 'center',
        borderRadius: 10,
        marginHorizontal: 2,
        padding: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
    textpart: {
        width: width-110,
        marginHorizontal: 2,
        padding: 10 ,
        flexDirection: 'column'
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
})