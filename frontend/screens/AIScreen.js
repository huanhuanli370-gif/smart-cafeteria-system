import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

const suggestedPrompts = [
  { text: "What do we have today?", icon: "today-outline" },
  { text: "Recommend a vegetarian dish", icon: "leaf-outline" },
  { text: "Do you have spicy Chinese food?", icon: "restaurant-outline" },
  { text: "Tell me about the Cheeseburger", icon: "fast-food-outline" },
];

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessageToAI = async (messageText) => {
    if (loading) return;

    const userMessage = { id: Date.now().toString(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', { message: messageText });
      const aiReply = response.data?.data?.reply;

      if (aiReply) {
        const aiMessage = { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    const messageText = input.trim();
    if (messageText.length === 0) return;
    setInput('');
    sendMessageToAI(messageText);
  }, [input]);
  
  const handlePromptPress = (prompt) => {
    sendMessageToAI(prompt.text);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isError = item.text.startsWith("Sorry,");
    
    const messageStyle = [
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer,
    ];
    const textStyle = [
        styles.messageText,
        isUser ? styles.userMessageText : styles.aiMessageText,
        isError && styles.errorMessageText
    ];

    return (
      <View style={messageStyle}>
        <Text style={textStyle}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}
        
        {!loading && (
          <View style={styles.suggestionContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 16}}>
              {suggestedPrompts.map((prompt) => (
                <TouchableOpacity key={prompt.text} style={styles.suggestionChip} onPress={() => handlePromptPress(prompt)}>
                  <Ionicons name={prompt.icon} size={16} color="#555" />
                  <Text style={styles.suggestionText}>{prompt.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask something..."
            editable={!loading}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || input.trim().length === 0}>
            <Ionicons name="arrow-up-circle" size={36} color={input.trim().length > 0 ? "#007AFF" : "#d1d1d6"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userMessageContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#000',
  },
  errorMessageText: {
    color: '#c41c1c',
  },
  suggestionContainer: {
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginTop: 8,
  },
  suggestionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dcdcdc'
  },
  sendButton: {
    marginLeft: 8,
  },
});

