import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal
} from 'react-native';
import { TouchableOpacity as OldTouch } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { SECONDORY_COLOR, MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';

export function OptionModal(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0; 
    const { settings, tripdata, optionModalStatus, onPressCancel, handleGetEstimate, handleOptionSelection, handleParcelTypeSelection,instructionData,option, radioParcel, mode, formatAmount} = props;

    return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={optionModalStatus}
    >
        <View style={styles.centeredView}>
            <View style={[styles.modalView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                {tripdata.carType && tripdata.carType.parcelTypes ?
                    <View style={{width:'100%'}}>
                        <Text style={{ color: colors.BLACK, fontFamily:fonts.Bold, fontSize: 16,textAlign:isRTL? 'right':'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('parcel_type')}</Text>
                        <RadioForm
                            initial={0}
                            formHorizontal={false}
                            labelHorizontal={true}
                            buttonColor={colors.SHADOW}
                            labelColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
                            style={{ marginTop: 10 }}
                            labelStyle={{ marginLeft: 0 }}
                            selectedButtonColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
                            selectedLabelColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
                        >
                            {
                                tripdata.carType.parcelTypes.map((obj, i) => (
                                    <RadioButton labelHorizontal={true} key={i} style={{flexDirection:isRTL?'row-reverse':'row'}}>
                                        <RadioButtonInput
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + formatAmount(obj.amount, settings.decimal, settings.country) + ' - ' + t(getLangKey(obj.description)): formatAmount(obj.amount, settings.decimal, settings.country) + ' ' + settings.symbol + ' - ' + t(getLangKey(obj.description)), value: i }}
                                            index={i}
                                            isSelected={instructionData.parcelTypeIndex === i}
                                            onPress={handleParcelTypeSelection}
                                            buttonSize={15}
                                            buttonOuterSize={26} 
                                            buttonWrapStyle={{marginLeft: 10}}
                                            buttonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                        />
                                        <RadioButtonLabel
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + formatAmount(obj.amount, settings.decimal, settings.country) + ' - ' + t(getLangKey(obj.description)): formatAmount(obj.amount, settings.decimal, settings.country) + ' ' + settings.symbol + ' - ' + t(getLangKey(obj.description)), value: i }}
                                            index={i}
                                            labelHorizontal={true}
                                            onPress={handleParcelTypeSelection}
                                            labelColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                        />
                                    </RadioButton>
                                ))
                            }
                        </RadioForm>
                    </View>
                    : null}
                {tripdata.carType && tripdata.carType.options ?
                    <View style={{ marginTop: 20,width:'100%'}}>
                        <Text style={{ color: colors.BLACK, fontWeight: 'bold', fontSize: 16,textAlign:isRTL? 'right':'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('options')}</Text>
                        <RadioForm
                            initial={0}
                            formHorizontal={false}
                            labelHorizontal={true}
                            buttonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                            labelColor={colors.BLACK}
                            style={{ marginTop: 10 }}
                            labelStyle={{ marginLeft: 0 }}
                            selectedButtonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                            selectedLabelColor={colors.BLACK}
                        >
                            {
                                tripdata.carType.options.map((obj, i) => (
                                    <RadioButton labelHorizontal={true} key={i} style={{flexDirection:isRTL?'row-reverse':'row'}}>
                                        <RadioButtonInput
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + formatAmount(obj.amount, settings.decimal, settings.country) + ' - ' + t(getLangKey(obj.description)): formatAmount(obj.amount, settings.decimal, settings.country) + ' ' + settings.symbol + ' - ' + t(getLangKey(obj.description)), value: i }}
                                            index={i}
                                            isSelected={instructionData.optionIndex === i}
                                            onPress={handleOptionSelection}
                                            buttonSize={15}
                                            buttonOuterSize={26} 
                                            buttonWrapStyle={{marginLeft: 10}}
                                            buttonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                        />
                                        <RadioButtonLabel
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + formatAmount(obj.amount, settings.decimal, settings.country) + ' - ' + t(getLangKey(obj.description)): formatAmount(obj.amount, settings.decimal, settings.country) + ' ' + settings.symbol + ' - ' + t(getLangKey(obj.description)), value: i }}
                                            index={i}
                                            labelHorizontal={true}
                                            onPress={handleOptionSelection}
                                            labelColor={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                        />
                                    </RadioButton>
                                ))
                            }
                        </RadioForm>
                    </View>
                    : null}
                <View style={{ flexDirection:isRTL?'row-reverse':'row', marginTop: 20, alignSelf: 'center', height: 40, }}>
                    <OldTouch
                        loading={false}
                        onPress={onPressCancel}
                        style={[styles.modalButtonStyle,[isRTL?{marginLeft:5,backgroundColor:colors.RED}:{ marginRight: 5,backgroundColor:colors.RED}]]}
                    >
                        <Text style={[styles.modalButtonTextStyle]}>{t('cancel')}</Text>
                    </OldTouch>
                    <OldTouch
                        loading={false}
                        onPress={handleGetEstimate}
                        style={[styles.modalButtonStyle, [isRTL?{marginRight:5,backgroundColor: colors.GREEN }:{ marginLeft: 5,backgroundColor:colors.GREEN}]]}
                    >
                        <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                    </OldTouch>
                </View>
            </View>
        </View>
    </Modal>
    );

}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.BACKGROUND
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: SECONDORY_COLOR,
        width: 100,
        height: 40,
        elevation: 0,
        borderRadius: 10
    },
    modalButtonTextStyle: {
        color: colors.WHITE,
        fontFamily: fonts.Bold,
        fontSize: 18
    }
});