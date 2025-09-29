import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator
} from "react-native";
import { colors } from "../common/theme";
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import DeviceInfo from 'react-native-device-info';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';

const hasNotch = DeviceInfo.hasNotch();

export default function OnlineChat(props) {
  const dispatch = useDispatch();
  const { bookingId, status } = props.route.params;
  const activeBookings = useSelector(state => state.bookinglistdata.active);
  const auth = useSelector(state => state.auth);
  const chats = useSelector(state => state.chatdata.messages);
  
  const [messages, setMessages] = useState([]);
  const deviceColorScheme = useColorScheme();
  const [mode, setMode] = useState(auth?.profile?.mode === 'system' ? deviceColorScheme : auth?.profile?.mode || 'light');
  const messageRef = useRef([]);
  const role = auth?.profile?.usertype;

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  // Update mode when system theme or auth profile changes
  useEffect(() => {
    if (auth?.profile?.mode) {
      setMode(auth.profile.mode === 'system' ? deviceColorScheme : auth.profile.mode);
    }else {
      setMode('light');
    }
  }, [deviceColorScheme, auth?.profile?.mode]);

  // Format and set messages when chats or role changes
  useEffect(() => {
    if (chats?.length >= 1 && role) {
      const formattedMessages = chats.map((chat) => ({
        _id: chat.smsId,
        text: chat.message,
        createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date(),
        user: {
          _id: role === "driver" ? 
            (chat.source === "customer" ? 2 : 1) : 
            (chat.source === "customer" ? 1 : 2),
        }
      })).reverse();

      messageRef.current = formattedMessages;
      setMessages(formattedMessages);
    } else {
      messageRef.current = [];
      setMessages([]);
    }
  }, [chats, role]);

  // Handle navigation focus/blur
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
      if (isMounted && bookingId) {
        dispatch(api.fetchChatMessages(bookingId));
      }
    });
    
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      if (isMounted && bookingId) {
        dispatch(api.stopFetchMessages(bookingId));
      }
    });

    // Initial fetch
    if (bookingId) {
      dispatch(api.fetchChatMessages(bookingId));
    }

    return () => {
      isMounted = false;
      unsubscribeFocus();
      unsubscribeBlur();
      if (bookingId) {
        dispatch(api.stopFetchMessages(bookingId));
      }
    };
  }, [bookingId]);

  const onSend = useCallback(async (newMessages = []) => {
    if (!bookingId || !role || !newMessages[0]?.text) return;

    const currentBooking = activeBookings?.find(b => b.id === bookingId);
    if (!currentBooking) return;

    try {
      await dispatch(api.sendMessage({
        booking: currentBooking,
        role: role,
        message: newMessages[0].text
      }));
      dispatch(api.fetchChatMessages(bookingId));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [bookingId, role, activeBookings]);

  const renderBubble = useCallback((props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: SECONDORY_COLOR,
          marginLeft: -45,
        },
        right: {
          backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
          marginLeft: -45,
        }
      }}
      textStyle={{
        left: {
          color: colors.BLACK
        }
      }}
    />
  ), [mode]);

  const renderSend = useCallback((props) => (
    <Send
      {...props}
      containerStyle={{
        height: 50,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <MaterialCommunityIcons name="send-circle" size={36} color={colors.BLUE} />
    </Send>
  ), []);

  const scrollToBottomComponent = useCallback(() => (
    <FontAwesome name="angle-double-down" size={30} color={colors.BLUE} />
  ), []);

  const chatProps = {
    messages,
    onSend,
    user: { _id: 1 },
    renderBubble,
    renderSend,
    scrollToBottom: true,
    scrollToBottomComponent,
    placeholder: status === "COMPLETE" ? `${t('booking_is')} ${status}. ${t('not_chat')}` : t('chat_input_title'),
    textInputProps: {
      editable: status !== "COMPLETE"
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}}>
      {Platform.OS === 'android' ? (
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{flex: 1}}
      >
          <GiftedChat {...chatProps} />
        </KeyboardAvoidingView>
      ) : (
        <View style={{flex: 1, marginBottom: hasNotch ? 30 : null, marginTop: -20}}>
         <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: 1 }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderLoading={() => <ActivityIndicator size="large" color={colors.BLUE} />}
          scrollToBottom
          scrollToBottomStyle={{
            backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
            opacity: 0.8,
            padding: 8,
            borderRadius: 20
          }}
          placeholder={status === "COMPLETE" ? `${t('booking_is')} ${status}. ${t('not_chat')}` : t('chat_input_title')}
          textInputProps={{
            editable: status !== "COMPLETE"
          }}
        />
        </View>
      )}
    </View>
  );
}
