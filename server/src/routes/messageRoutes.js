const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const controller = require("../controllers/messageController");

const conversationsRouter = express.Router();
const messagesRouter = express.Router();

conversationsRouter.use(requireAuth);
messagesRouter.use(requireAuth);

conversationsRouter.post("/", controller.createConversation);
conversationsRouter.get("/", controller.listConversations);
conversationsRouter.get("/:conversationId/messages", controller.getMessages);
conversationsRouter.post("/:conversationId/read", controller.markRead);

messagesRouter.post("/", controller.sendMessage);
messagesRouter.get("/unread-summary", controller.unreadSummary);

module.exports = { conversationsRouter, messagesRouter };
