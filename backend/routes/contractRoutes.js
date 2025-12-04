const express = require('express');
const router = express.Router();
const { createContracts } = require('../controllers/contractController');

router.post('/generate', createContracts);

module.exports = router;
