import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
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

function getRelativeTime(timestamp) {
  if (!timestamp) return '1w';
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInHours / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w`;
}

export default function ThreadScreen({ route, navigation }) {
  const { post } = route.params;
  const { appState } = useContext(AppContext);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const groupInitial = (post.group_name || appState?.schoolGroupName || 'M')
    .charAt(0)
    .toUpperCase();
  const groupTitle = post.group_name || appState?.schoolGroupName || 'McGill';
  const postTime = getRelativeTime(post.created_at);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      if (appState?.API?.getPostComments) {
        const res = await appState.API.getPostComments(post.id);
        setComments(res.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      if (appState?.API?.createComment) {
        await appState.API.createComment({
          post_id: post.id,
          text: replyText.trim(),
        });
        setReplyText('');
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({ item }) => {
    const commentTime = getRelativeTime(item.created_at);
    const voteCount = item.vote_total ?? item.score ?? 0;

    return (
      <View style={styles.commentRow}>
        <View style={styles.commentAvatar}>
          <Ionicons name="person" size={14} color="#8E8E93" />
        </View>

        <View style={styles.commentBody}>
          <View style={styles.commentMeta}>
            <Text style={styles.commentAuthor}>Anonymous</Text>
            <Text style={styles.commentTimestamp}>{commentTime}</Text>
          </View>
          <Text style={styles.commentText}>{item.content || item.text}</Text>

          <View style={styles.commentActions}>
            <View style={styles.commentVotePill}>
              <TouchableOpacity style={styles.voteBtn}>
                <Ionicons name="arrow-up" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.commentVoteCount}>{voteCount}</Text>
              <TouchableOpacity style={styles.voteBtn}>
                <Ionicons name="arrow-down" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 1. Nav Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{groupTitle}</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* 2. Scrollable Thread (Main Post + Comments List) */}
        <FlatList
          ref={listRef}
          data={comments}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderComment}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.mainPost}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{groupInitial}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{groupTitle}</Text>
                  <Text style={styles.postTimestamp}>{postTime}</Text>
                </View>
              </View>

              <Text style={styles.postBody}>{post.content}</Text>

              <View style={styles.postFooter}>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.statCount}>{comments.length}</Text>
                </View>
                <View style={styles.votePill}>
                  <TouchableOpacity style={styles.voteBtn}>
                    <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.voteTotal}>
                    {post.vote_total ?? post.score ?? 0}
                  </Text>
                  <TouchableOpacity style={styles.voteBtn}>
                    <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#EE2A35" style={{ marginTop: 20 }} />
            ) : (
              <Text style={styles.emptyText}>No replies yet. Be the first!</Text>
            )
          }
        />

        {/* 3. Reply Input Bar */}
        <View style={styles.replyBar}>
          <TextInput
            style={styles.replyInput}
            placeholder="Reply anonymously..."
            placeholderTextColor="#555555"
            value={replyText}
            onChangeText={setReplyText}
            selectionColor="#EE2A35"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !replyText.trim() && styles.sendBtnDisabled,
            ]}
            disabled={!replyText.trim() || sending}
            onPress={handleSendComment}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
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
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161616',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  mainPost: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EE2A35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  postTimestamp: {
    color: '#8E8E93',
    fontSize: 12,
  },
  postBody: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  votePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 10,
  },
  voteBtn: {
    padding: 2,
  },
  voteTotal: {
    color: '#20D09B',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#1C1C1E',
    marginTop: 4,
    marginBottom: 8,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#121212',
  },
  commentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  commentAuthor: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  commentTimestamp: {
    color: '#555555',
    fontSize: 12,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  commentVotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 6,
  },
  commentVoteCount: {
    color: '#20D09B',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#555555',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#161616',
    backgroundColor: '#000000',
    gap: 10,
  },
  replyInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EE2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#262626',
  },
});
