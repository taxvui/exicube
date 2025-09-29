import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet, Animated } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import moment from 'moment/min/moment-with-locales';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function WTransactionHistory(props) {
    const [data, setData] = useState(null);
    const settings = useSelector(state => state.settingsdata.settings);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [tabIndex, setTabIndex] = useState(0);
    const auth = useSelector(state => state.auth);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();
    const [scrollY] = useState(new Animated.Value(0));
    const fadeAnim = useRef({}).current;
    const [tabChangeAnim] = useState(new Animated.Value(1));

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
        if(props.walletHistory && props.walletHistory.length>0){
            const transactions = props.walletHistory;
            // Initialize animation values for each transaction
            transactions.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
            
            // Start staggered animations
            transactions.forEach((_, index) => {
                Animated.sequence([
                    Animated.delay(index * 100),
                    Animated.timing(fadeAnim[index], {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true
                    })
                ]).start();
            });
            
            setData(transactions);
        } else{
            setData([]);
        }
    },[props.walletHistory]);

    useEffect(()=>{
        if(data && data.length > 0){
            const lastStatus = data[0].type;
            if(lastStatus == 'Debit') setTabIndex(1);
            if(lastStatus == 'Withdraw' && settings.RiderWithDraw) setTabIndex(2);
        }else{
            setTabIndex(0);
        }
    },[data]);

    const animateTabChange = () => {
        // Reset animation values for new tab content
        if(data) {
            data.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
        }

        // Animate tab change
        Animated.sequence([
            Animated.timing(tabChangeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(tabChangeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();

        // Start staggered animations for new items
        if(data) {
            data.forEach((_, index) => {
                Animated.sequence([
                    Animated.delay(index * 70),
                    Animated.spring(fadeAnim[index], {
                        toValue: 1,
                        friction: 6,
                        tension: 40,
                        useNativeDriver: true
                    })
                ]).start();
            });
        }
    };

    const handleTabPress = (index) => {
        setTabIndex(index);
        animateTabChange();
    };

    const getTransactionIcon = (type) => {
        switch(type) {
            case 'Credit':
                return {
                    name: 'arrow-downward',
                    color: colors.GREEN,
                    background: colors.WHITE,
                    label: t('credited')
                };
            case 'Debit':
                return {
                    name: 'arrow-upward',
                    color: colors.RED,
                    background: colors.WHITE,
                    label: t('debited')
                };
            case 'Withdraw':
                return {
                    name: 'account-balance-wallet',
                    color: colors.YELLOW,
                    background: colors.WHITE,
                    label: t('withdrawn')
                };
            default:
                return {
                    name: 'help',
                    color: colors.GREY,
                    background: colors.WHITE,
                    label: ''
                };
        }
    };

    const renderTransaction = ({ item, index }) => {
        const transactionInfo = getTransactionIcon(item.type);
        const scale = scrollY.interpolate({
            inputRange: [-1, 0, (80 * index), (80 * (index + 2))],
            outputRange: [1, 1, 1, 0.98]
        });

        // Ensure animations are properly initialized
        if (!fadeAnim[index]) {
            fadeAnim[index] = new Animated.Value(0);
        }

        return (
            <Animated.View 
                style={[
                    styles.container, 
                    { 
                        opacity: Animated.multiply(fadeAnim[index] || 1, tabChangeAnim),
                        transform: [
                            { scale },
                            {
                                translateY: fadeAnim[index] ? 
                                    fadeAnim[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0]
                                    }) : new Animated.Value(0)
                            }
                        ]
                    }
                ]}
            >
                <View style={[styles.card, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack, {flexDirection: isRTL ? 'row-reverse' : 'row', paddingVertical: 10, alignItems :'center'}]}>
                    <View style={[styles.iconWrapper, { backgroundColor: transactionInfo.color + '15', marginRight:  isRTL ? 0 : 5, marginLeft:  isRTL ? 5 : 0}]}>
                        <MaterialIcons name={transactionInfo.name} size={24} color={transactionInfo.color} />
                    </View>
                    
                    <View style={[styles.detailsContainer]}>
                        <View style={[styles.amountRow,{flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                            {isRTL ? 
                                <Text style={[styles.amount, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                    {settings.swipe_symbol === false ? 
                                        formatAmount(item.amount, settings.decimal, settings.country) + " " + settings.symbol  :
                                        settings.symbol + " " + formatAmount(item.amount, settings.decimal, settings.country)
                                    }
                                </Text>
                            :
                                <Text style={[styles.amount, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                    {settings.swipe_symbol === false ? 
                                        settings.symbol + " " + formatAmount(item.amount, settings.decimal, settings.country) :
                                        formatAmount(item.amount, settings.decimal, settings.country) + " " + settings.symbol
                                    }
                                </Text>
                            }
                            <Text style={[styles.type, { color: transactionInfo.color }]}>
                                {transactionInfo.label}
                            </Text>
                        </View>

                        <View style={{flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row'}}>
                            <Text style={[styles.transactionId, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                                {t('transaction_id')} {" "}
                            </Text>
                            <View style={{flex: 1}}>
                                <Text style={[styles.transactionId, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {item.txRef.startsWith('wallet') ? item.transaction_id : item.txRef}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={[styles.date, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                            {moment(item.date).format('lll')}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const EmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons 
                name="account-balance-wallet" 
                size={40} 
                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} 
            />
            <Text style={[styles.emptyText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                {t('no_data_available')}
            </Text>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <SegmentedControlTab
                values={props.role && props.role == 'driver' || settings.RiderWithDraw ? 
                    [t('credited'), t('debited'), t('withdrawn')] : 
                    [t('credited'), t('debited')]
                }
                selectedIndex={tabIndex}
                onTabPress={handleTabPress}
                tabsContainerStyle={[styles.tabsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                tabStyle={[styles.tab, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                activeTabStyle={[styles.activeTab, { borderBottomWidth: 2, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                tabTextStyle={[styles.tabText, {color: colors.SHADOW}]}
                activeTabTextStyle={[styles.activeTabText,{color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
            />

            <AnimatedFlatList
                data={data && data.length > 0 ? 
                    (tabIndex === 0 ? data.filter(item => item.type === 'Credit') :
                    (tabIndex === 1 ? data.filter(item => item.type === 'Debit') :
                    data.filter(item => item.type === 'Withdraw'))) : []
                }
                renderItem={renderTransaction}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                ListEmptyComponent={EmptyComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        marginTop: 5,
    },
    tabsContainer: {
        height: 45,
        backgroundColor: 'transparent',
    },
    tab: {
        borderWidth: 0,
        marginHorizontal: 5,
    },
    activeTab: {
        borderWidth: 0,
    },
    tabText: {
        fontFamily: fonts.Bold,
        fontSize: 14,
    },
    activeTabText: {
        fontFamily: fonts.Bold,
        fontSize: 14,
    },
    transactionCard: {
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10
    },
    lightCard: {
        backgroundColor: colors.WHITE,
        shadowColor: colors.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    darkCard: {
        backgroundColor: colors.PAGEBACK,
        shadowColor: colors.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    amountRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    amount: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    type: {
        fontSize: 14,
        fontFamily: fonts.Bold,
    },
    transactionId: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginBottom: 3,
    },
    date: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        color: colors.GREY,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Dimensions.get('window').height / 5,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    card: {
        marginVertical: 5,
        borderRadius: 10,
        marginHorizontal: 5,
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