import React, { useState, useEffect } from 'react';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    Animated,
    Dimensions,
    TextInput,
    Alert,
    FlatList,
    useColorScheme
} from 'react-native';
import i18n from 'i18n-js';
import { Button } from 'react-native-elements'
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment/min/moment-with-locales';
import { api } from 'common';
import { MAIN_COLOR, MAIN_COLOR_DARK } from "../common/sharedFunctions";
import { fonts } from '../common/font';

var { width } = Dimensions.get('window');

export default function Complain() {

    const {
        editComplain
    } = api;

    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector((state) => state.auth);
    const complaindata = useSelector(state => state.complaindata.list);
    const [scaleAnim] = useState(new Animated.Value(0))
    const [fadeAnim] = useState(new Animated.Value(0))
    const [data, setData] = useState();
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
        Animated.spring(
            scaleAnim,
            {
                toValue: 1,
                friction: 3,
                useNativeDriver: true
            }
        ).start();
        setTimeout(() => {
            Animated.timing(
                fadeAnim,
                {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true
                }
            ).start();
        }, 500)
    }, []);

    useEffect(() => {
        if (complaindata && auth) {
            let arr = [];
            let uid = auth.profile.uid;
            for (let i = 0; i < complaindata.length; i++) {
                if (complaindata[i].uid == uid) {
                    arr.push(complaindata[i])
                }
            }
            setData(arr);
        } else {
            setData([]);
        }
    }, [complaindata]);

    const [state, setState] = useState({
        subject: '',
        body: '',
        check: false
    });

    const submitComplain = () => {
        if (auth.profile.mobile || auth.profile.email) {
            if (state.subject && state.body) {
                let obj = { ...state };
                obj.uid = auth.profile.uid;
                obj.complainDate = new Date().getTime();
                obj.firstName = auth.profile.firstName ? auth.profile.firstName : '';
                obj.lastName = auth.profile.lastName ? auth.profile.lastName : '';
                obj.email = auth.profile.email ? auth.profile.email : '';
                obj.mobile = auth.profile.mobile ? auth.profile.mobile : '';
                obj.role = auth.profile.usertype;
                dispatch(editComplain(obj, "Add"));
                setState({
                    subject: '',
                    body: '',
                    check: false
                });
            } else {
                Alert.alert(t('alert'), t('no_details_error'));
            }
        } else {
            Alert.alert(t('alert'), t('email_phone'));
        }
    }

    const renderInputField = (placeholder, value, onChangeText, multiline = false) => (
        <Animated.View 
            style={[
                styles.textInputContainer,
                mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,
                { transform: [{ scale: scaleAnim }] }
            ]}
        >
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                style={[
                    styles.textInput,
                    multiline && { height: 100, textAlignVertical: 'top' },
                    { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }
                ]}
                placeholderTextColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
            />
        </Animated.View>
    );

    const renderComplaintCard = ({ item }) => (
        <Animated.View 
            style={[
                styles.complaintCard,
                mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,
                { opacity: fadeAnim }
            ]}
        >
            <View style={[styles.complaintHeader,{flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10}]}>
                <View style={styles.subjectContainer}>
                    <Text style={[styles.label, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('subject')}
                    </Text>
                    <Text style={[styles.subject, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                        {item.subject}
                    </Text>
                </View>
                <View style={[styles.statusContainer,{alignItems:'center'}]}>
                    <Text style={[styles.date, { color: item.check ? colors.GREEN : colors.RED, textAlign: isRTL ? 'right' : 'left' }]}>
                        {moment(item.complainDate).format('ll')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.check ? colors.GREEN : colors.RED }]}>
                        <Text style={styles.statusText}>
                            {item.check ? t('solved') : t('pending')}
                        </Text>
                    </View>
                </View>
            </View>
            <View>
                <Text style={[styles.label, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('message_text')}
                </Text>
                <Text style={[styles.message, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                    {item.body}
                </Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
            <View style={styles.formContainer}>
                {renderInputField(t('subject'), state.subject, (text) => setState({ ...state, subject: text }))}
                {renderInputField(t('chat_blank'), state.body, (text) => setState({ ...state, body: text }), true)}
                      
                <View style={{ alignItems: 'center' }}>
                    <Button
                        onPress={submitComplain}
                        title={t('submit')}
                        titleStyle={styles.buttonTitle}
                        buttonStyle={[styles.goHomeButton,{backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
                    />
                </View> 
            </View>

            <FlatList
                data={data}
                renderItem={renderComplaintCard}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        width: width,
    },
    formContainer: {
        padding: 10,
    },
    textInputContainer: {
        borderRadius: 12,
        marginBottom: 15,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    textInput: {
        padding: 15,
        fontFamily: fonts.Regular,
        fontSize: 16,
        minHeight: 50,
    },
    submitButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    submitButtonText: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: fonts.Bold,
    },
    listContainer: {
        padding: 10,
        paddingTop: 0,
    },
    complaintCard: {
        borderRadius: 15,
        padding: 10,
        marginTop: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    complaintHeader: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    subjectContainer: {
        flex: 1,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        marginBottom: 5,
    },
    subject: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    date: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: colors.WHITE,
        fontSize: 12,
        fontFamily: fonts.Bold,
    },

    message: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    buttonTitle: {
        fontFamily:fonts.Bold,
        fontSize: 18
    },
    goHomeButton: {
        width: 150,
        minHeight: 50,
        borderRadius: 10,
    },
})