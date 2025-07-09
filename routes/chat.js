const express = require('express');
const { createChat, readChat} = require("../src/controllers/UserControllers/chatController");

const router = express.Router();

router.post('/', createChat)
router.get('/', readChat)

module.exports = router;
