const express = require('express');
const router = express.Router();
const { getSyllabi, createSyllabus } = require('../controllers/syllabusController');

router.route('/').get(getSyllabi).post(createSyllabus);

module.exports = router;
