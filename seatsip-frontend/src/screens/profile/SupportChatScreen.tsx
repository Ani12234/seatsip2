import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  ImageBackground,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/ui/AppIcon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function SupportChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm your support assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAiResponse(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getAiResponse = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('order') || t.includes('track') || t.includes('where') || t.includes('status')) {
      return "You can track your live orders in the 'My Orders' section of your profile. Just tap on any active order to see its current status!";
    }
    if (t.includes('cancel') || t.includes('refund') || t.includes('money') || t.includes('return')) {
      return "Orders can be cancelled within 5 minutes of placement for a full refund. For reservations, please cancel at least 2 hours in advance to avoid fees.";
    }
    if (t.includes('point') || t.includes('loyalty') || t.includes('reward') || t.includes('coin')) {
      return "You earn points on every completed order! Check your 'Rewards' tab to see your current balance and available offers.";
    }
    if (t.includes('payment') || t.includes('upi') || t.includes('card') || t.includes('wallet')) {
      return "We accept UPI, Credit/Debit Cards, and Net Banking. You can also use your internal Wallet for faster one-tap payments!";
    }
    if (t.includes('hello') || t.includes('hi') || t.includes('hey')) {
      return "Hello! I'm here to help. You can ask me about orders, reservations, payments, or rewards.";
    }
    return "I'm not quite sure I understand. Could you please provide more details? Or you can ask about tracking orders, cancellation policies, or your rewards points.";
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  return (
    <ImageBackground
      source={require('../../assets/images/app_bg.png')}
      style={styles.safe}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <AppIcon name="back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Support Assistant</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Always Online</Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow, 
                msg.sender === 'user' ? styles.userRow : styles.aiRow
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                  <AppIcon name="support" size={16} color="#fff" />
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.aiText
                ]}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.timeText,
                  msg.sender === 'user' ? styles.userTime : styles.aiTime
                ]}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.aiAvatar}>
                <AppIcon name="support" size={16} color="#fff" />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#8B6F47" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <AppIcon name="›" size={24} color="#fff" style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8E0',
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerInfo: { marginLeft: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
  onlineText: { fontSize: 12, color: '#666', fontWeight: '600' },

  chatContent: { padding: 20, paddingBottom: 30 },
  messageRow: { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3E2723',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#3E2723',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  messageText: { fontSize: 15, lineHeight: 21 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  userTime: { color: 'rgba(255,255,255,0.6)' },
  aiTime: { color: '#999' },

  inputArea: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EDE8E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F2EE',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    color: '#333',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E2723',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CCC',
  },
});
