const express = require('express');
const { createChat } = require("../src/controllers/UserControllers/chatController");

const router = express.Router();

router.post('/', createChat)

module.exports = router;
