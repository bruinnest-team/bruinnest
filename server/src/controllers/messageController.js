const messageService = require("../services/messageService");
const { success } = require("../utils/apiResponse");

async function createConversation(req, res, next) {
  try {
    const result = await messageService.createOrGetConversation(
      req.session.userId,
      req.body.targetUserId
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const result = await messageService.listConversations(req.session.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const result = await messageService.getMessages(
      req.session.userId,
      req.params.conversationId,
      req.query.afterMessageId
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { conversationId, body } = req.body;
    const result = await messageService.sendMessage(
      req.session.userId,
      conversationId,
      body
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const result = await messageService.markConversationRead(
      req.session.userId,
      req.params.conversationId,
      req.body.lastReadMessageId
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function unreadSummary(req, res, next) {
  try {
    const result = await messageService.getUnreadSummary(req.session.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createConversation,
  listConversations,
  getMessages,
  sendMessage,
  markRead,
  unreadSummary,
};
