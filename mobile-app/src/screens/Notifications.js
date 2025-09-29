import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet, TouchableOpacity, Alert, useColorScheme, Animated } from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SECONDORY_COLOR, MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Notifications(props) {
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const notificationdata = useSelector(state => state.notificationdata);
    const [data, setData] = useState();
    const auth = useSelector((state) => state.auth);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();
    const fadeAnim = useRef({}).current;

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
        if (notificationdata.notifications) {
            const notifications = notificationdata.notifications;
            // Initialize animation values for each notification
            notifications.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
            
            // Stagger animations
            const animations = notifications.map((_, index) => {
                return Animated.timing(fadeAnim[index], {
                    toValue: 1,
                    duration: 500,
                    delay: index * 150, // Stagger delay between each item
                    useNativeDriver: true
                });
            });
            
            Animated.stagger(100, animations).start();
            setData(notifications);
        } else {
            setData([]);
        }
    }, [notificationdata.notifications]);

    const show = (item) => {
        Alert.alert(
            item.title,
            item.msg,
            [
                {
                    text: "ok",
                    onPress: () => { },
                    style: "ok",
                },
            ],
            { cancelable: false }
        );
    };

    const getNotificationIcon = (msg) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('booking') || lowerMsg.includes('ride')) {
            return 'car';
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('wallet') || lowerMsg.includes('paid')) {
            return 'cash';
        } else if (lowerMsg.includes('cancel')) {
            return 'close-circle';
        } else if (lowerMsg.includes('driver') || lowerMsg.includes('captain')) {
            return 'account-check';
        } else if (lowerMsg.includes('chat') || lowerMsg.includes('message')) {
            return 'message-text';
        } else if (lowerMsg.includes('rating') || lowerMsg.includes('review')) {
            return 'star';
        } else if (lowerMsg.includes('location') || lowerMsg.includes('address')) {
            return 'map-marker';
        } else if (lowerMsg.includes('offer') || lowerMsg.includes('discount')) {
            return 'tag-percent';
        } else {
            return 'bell-ring';
        }
    };

    const getIconColor = (msg) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('cancel')) {
            return colors.RED;
        } else if (lowerMsg.includes('success') || lowerMsg.includes('completed')) {
            return colors.GREEN;
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('wallet')) {
            return colors.YELLOW;
        } else {
            return mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR;
        }
    };

    const newData = ({ item, index }) => {
        const scale = new Animated.Value(1);
        
        const onPressIn = () => {
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };
        
        const onPressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View 
                style={[
                    styles.card, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,
                    { 
                        opacity: fadeAnim[index] || 1,
                        transform: [
                            { scale },
                            { 
                                translateY: fadeAnim[index] ? 
                                    fadeAnim[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0]
                                    }) : 0
                            }
                        ]
                    }
                ]}
            >
                <TouchableOpacity 
                    onPress={() => show(item)}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    activeOpacity={0.9}
                    style={[styles.cardContent,{flexDirection: isRTL ? 'row-reverse' : 'row', alignItems :'center' }]}
                >
                    <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.msg) + '20', marginRight:  isRTL ? 0 : 5, marginLeft:  isRTL ? 5 : 0}]}>
                        <MaterialCommunityIcons 
                            name={getNotificationIcon(item.msg)} 
                            size={26} 
                            color={getIconColor(item.msg)} 
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.titleText, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {item.title} </Text>
                        <Text style={[styles.messageText, { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}> {item.msg} </Text>
                        <View style={[styles.timeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='clock'
                                type='octicon'
                                size={14}
                                color={mode === 'dark' ? colors.WHITE : colors.GREY}
                            />
                            <Text style={[styles.timeText, { 
                                marginLeft: isRTL ? 0 : 5,
                                marginRight: isRTL ? 5 : 0,
                                color: mode === 'dark' ? colors.WHITE : colors.GREY
                            }]}>
                                {moment(item.dated).format('lll')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
         <View style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
            <AnimatedFlatList
                data={data}
                renderItem={newData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
         </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER_BACKGROUND,
    },
    headerText: {
        fontSize: 20,
        fontFamily: fonts.Bold,
        marginLeft: 10,
    },
    listContainer: {
        padding: 5,
    },
    notificationCard: {
        marginBottom: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    lightCard: {
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        borderBottomWidth: 1,
        borderColor: colors.SHADOW,
    },
    darkCard: {
        backgroundColor: colors.PAGEBACK,
        borderBottomWidth: 1,
        borderColor: colors.SHADOW,
    },
    cardContent: {
        padding: 5,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        opacity: 0.8,
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        opacity: 0.6,
    },
    card: {
        marginVertical: 5,
        borderRadius: 10,
        padding: 5,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
        gap: 2
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
});