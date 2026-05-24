const messageService = require("../services/messageService");

function respond(res, data) {
  res.json({ success: true, data });
}

function createConversation(req, res) {
  const result = messageService.createOrGetConversation(
    req.session.userId,
    req.body.targetUserId
  );
  respond(res, result);
}

function listConversations(req, res) {
  respond(res, messageService.listConversations(req.session.userId));
}

function getMessages(req, res) {
  const result = messageService.getMessages(
    req.session.userId,
    req.params.conversationId,
    req.query.afterMessageId
  );
  respond(res, result);
}

function sendMessage(req, res) {
  const { conversationId, body } = req.body;
  const result = messageService.sendMessage(req.session.userId, conversationId, body);
  respond(res, result);
}

function markRead(req, res) {
  const result = messageService.markConversationRead(
    req.session.userId,
    req.params.conversationId,
    req.body.lastReadMessageId
  );
  respond(res, result);
}

function unreadSummary(req, res) {
  respond(res, messageService.getUnreadSummary(req.session.userId));
}

module.exports = {
  createConversation,
  listConversations,
  getMessages,
  sendMessage,
  markRead,
  unreadSummary,
};
