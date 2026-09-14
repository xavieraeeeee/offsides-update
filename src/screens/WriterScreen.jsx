import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../App';

const MAX_CHARS = 300;

export default function WriterScreen({ navigation }) {
  const { appState } = useContext(AppContext);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupName = appState?.schoolGroupName || 'McGill';
  const remainingChars = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && remainingChars >= 0 && !isSubmitting;

  const handlePost = async () => {
    if (!canPost) return;
    setIsSubmitting(true);
    try {
      if (appState?.API?.createPost) {
        await appState.API.createPost({
          group_id: appState.groupID || appState.schoolGroupID,
          text: content.trim(),
        });
      }
      navigation.goBack();
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 1. Header: Close Button, Target Community, Post Action Pill */}
        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.communityBadge}>
            <View style={styles.communityDot} />
            <Text style={styles.communityText}>{groupName}</Text>
          </View>

          <TouchableOpacity
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            disabled={!canPost}
            onPress={handlePost}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.postButtonText, !canPost && styles.postButtonTextDisabled]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Text Input Body */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            autoFocus
            maxLength={MAX_CHARS}
            placeholder="What's happening on campus?"
            placeholderTextColor="#555555"
            value={content}
            onChangeText={setContent}
            selectionColor="#EE2A35"
          />
        </View>

        {/* 3. Bottom Toolbar & Media Triggers */}
        <View style={styles.bottomToolbar}>
          <View style={styles.toolIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="image-outline" size={24} color="#8E8E93" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="stats-chart-outline" size={22} color="#8E8E93" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="pricetag-outline" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.counterText,
              remainingChars < 20 && styles.counterWarning,
              remainingChars < 0 && styles.counterDanger,
            ]}
          >
            {remainingChars}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161616',
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
  },
  communityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EE2A35',
  },
  communityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#EE2A35',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    minWidth: 64,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#262626',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postButtonTextDisabled: {
    color: '#666666',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#161616',
    backgroundColor: '#000000',
  },
  toolIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  counterText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  counterWarning: {
    color: '#F59E0B',
  },
  counterDanger: {
    color: '#EF4444',
  },
});
