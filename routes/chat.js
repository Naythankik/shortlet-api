const express = require('express');
const { createChat, readChat, readMessages} = require("../src/controllers/UserControllers/chatController");

const router = express.Router();

router.post('/', createChat)
router.get('/', readChat)
router.get('/:chatId', readMessages)

module.exports = router;
