import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../App';
import UserContent from './UserContent';

/**
 * Helper to compute short relative timestamps (e.g. 1w, 8w, 12w)
 */
function getRelativeTime(timestamp) {
  if (!timestamp) return '1w';
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w`;
}

export default function Post({ post, navigation, onVote }) {
  const { appState } = useContext(AppContext);

  const groupInitial = (post.group_name || appState?.schoolGroupName || 'M')
    .charAt(0)
    .toUpperCase();
  const groupTitle = post.group_name || appState?.schoolGroupName || 'McGill';
  const timeAgo = getRelativeTime(post.created_at);
  const voteCount = post.vote_total ?? post.score ?? 0;

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation?.navigate('Thread', { post })}
    >
      {/* 1. Header: Avatar, Name + Timestamp, More Options */}
      <View style={styles.headerRow}>
        <View style={styles.authorContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{groupInitial}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{groupTitle}</Text>
            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>
        </View>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {}}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* 2. Post Content Body */}
      <View style={styles.contentContainer}>
        {post.content ? (
          <Text style={styles.postText}>{post.content}</Text>
        ) : (
          <UserContent content={post} />
        )}
      </View>

      {/* 3. Action Toolbar & Vote Pill */}
      <View style={styles.actionsRow}>
        {/* Left Action Cluster: Comments, Send, Repost, Share, Medal */}
        <View style={styles.actionCluster}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation?.navigate('Comments', { post })}
          >
            <Ionicons name="chatbubble-outline" size={19} color="#FFFFFF" />
            <Text style={styles.actionCount}>{post.comment_count ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="paper-plane-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="repeat-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="share-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="ribbon-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Right Action Cluster: Mint Green Vote Pill */}
        <View style={styles.votePill}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => onVote && onVote(post.id, 1)}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.voteCount}>{voteCount}</Text>

          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => onVote && onVote(post.id, -1)}
          >
            <Ionicons name="arrow-down" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161616',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  contentContainer: {
    marginVertical: 4,
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  votePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 8,
  },
  voteButton: {
    padding: 2,
  },
  voteCount: {
    color: '#20D09B',
    fontSize: 14,
    fontWeight: '700',
  },
});
