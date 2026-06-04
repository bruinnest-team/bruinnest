const conversationRepository = require("../repositories/conversationRepository");
const messageRepository = require("../repositories/messageRepository");
const userRepository = require("../repositories/userRepository");
const profileRepository = require("../repositories/profileRepository");
const notificationService = require("./notificationService");
const NotFoundError = require("../errors/NotFoundError");
const ValidationError = require("../errors/ValidationError");
const {
  optionalNonNegativeInteger,
  requireMessageBody,
  requirePositiveInteger,
} = require("../validations/messageValidation");

function validateUserId(value, fieldName = "userId") {
  return requirePositiveInteger(value, fieldName);
}

function ensureUserExists(userId, message) {
  const user = userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError(message);
  }

  return user;
}

function findParticipantOrThrow(conversationId, userId) {
  const participant = conversationRepository.findParticipant(conversationId, userId);

  if (!participant) {
    throw new NotFoundError("Conversation not found.");
  }

  return participant;
}

function getUserDisplayName(userId) {
  const profile = profileRepository.findByUserId(userId);
  const user = userRepository.findById(userId);

  return profile?.displayName ?? user?.email ?? "Someone";
}

function createMessageNotifications({ conversationId, senderUserId, body }) {
  const senderName = getUserDisplayName(senderUserId);
  const preview = body.length > 120 ? `${body.slice(0, 117)}...` : body;
  const recipients = conversationRepository
    .listParticipants(conversationId)
    .filter((participant) => participant.userId !== senderUserId);

  for (const recipient of recipients) {
    notificationService.createNotification({
      userId: recipient.userId,
      type: "new_message",
      title: `New message from ${senderName}`,
      body: preview,
      referenceType: "conversation",
      referenceId: conversationId,
    });
  }
}

function messageBelongsToConversation(conversationId, messageId) {
  const message = messageRepository.findMessageById(messageId);

  return message?.conversationId === conversationId;
}

function createDirectConversation(userAId, userBId) {
  const conversation = conversationRepository.createConversation();

  conversationRepository.addParticipant({
    conversationId: conversation.id,
    userId: userAId,
  });
  conversationRepository.addParticipant({
    conversationId: conversation.id,
    userId: userBId,
  });

  return conversation;
}

function createOrGetConversation(currentUserId, targetUserId) {
  const userId = validateUserId(currentUserId, "currentUserId");
  const otherUserId = validateUserId(targetUserId, "targetUserId");

  if (userId === otherUserId) {
    throw new ValidationError("Cannot message yourself.");
  }

  ensureUserExists(otherUserId, "Target user not found.");

  const existingConversation = conversationRepository.findDirectConversation(
    userId,
    otherUserId
  );

  if (existingConversation) {
    return {
      conversationId: existingConversation.id,
    };
  }

  const conversation = createDirectConversation(userId, otherUserId);

  return {
    conversationId: conversation.id,
  };
}

function listConversations(currentUserId) {
  const userId = validateUserId(currentUserId, "currentUserId");

  return {
    items: conversationRepository.listConversationsForUser(userId),
  };
}

function getMessages(currentUserId, conversationId, afterMessageId = null) {
  const userId = validateUserId(currentUserId, "currentUserId");
  const safeConversationId = requirePositiveInteger(
    conversationId,
    "conversationId"
  );
  const safeAfterMessageId = optionalNonNegativeInteger(
    afterMessageId,
    "afterMessageId"
  );

  findParticipantOrThrow(safeConversationId, userId);

  const items =
    safeAfterMessageId === null
      ? messageRepository.listMessages(safeConversationId)
      : messageRepository.listMessagesAfter(
          safeConversationId,
          safeAfterMessageId
        );

  return {
    items,
  };
}

function sendMessage(currentUserId, conversationId, body) {
  const userId = validateUserId(currentUserId, "currentUserId");
  const safeConversationId = requirePositiveInteger(
    conversationId,
    "conversationId"
  );
  const safeBody = requireMessageBody(body);

  findParticipantOrThrow(safeConversationId, userId);

  const message = messageRepository.createMessage({
    conversationId: safeConversationId,
    senderUserId: userId,
    body: safeBody,
  });

  conversationRepository.touchConversation(safeConversationId);
  createMessageNotifications({
    conversationId: safeConversationId,
    senderUserId: userId,
    body: safeBody,
  });

  return {
    messageId: message.id,
  };
}

function markConversationRead(currentUserId, conversationId, lastReadMessageId) {
  const userId = validateUserId(currentUserId, "currentUserId");
  const safeConversationId = requirePositiveInteger(
    conversationId,
    "conversationId"
  );
  const safeLastReadMessageId = requirePositiveInteger(
    lastReadMessageId,
    "lastReadMessageId"
  );
  const participant = findParticipantOrThrow(safeConversationId, userId);

  if (
    !messageBelongsToConversation(safeConversationId, safeLastReadMessageId)
  ) {
    throw new ValidationError(
      "lastReadMessageId must belong to the conversation."
    );
  }

  const nextLastReadMessageId = Math.max(
    participant.lastReadMessageId ?? 0,
    safeLastReadMessageId
  );
  const updatedParticipant = conversationRepository.updateLastReadMessage({
    conversationId: safeConversationId,
    userId,
    lastReadMessageId: nextLastReadMessageId,
  });

  return {
    conversationId: updatedParticipant.conversationId,
    lastReadMessageId: updatedParticipant.lastReadMessageId,
  };
}

function getUnreadSummary(currentUserId) {
  const userId = validateUserId(currentUserId, "currentUserId");

  return {
    unreadCount: messageRepository.countAllUnreadMessagesForUser(userId),
  };
}

module.exports = {
  createOrGetConversation,
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  getUnreadSummary,
};
