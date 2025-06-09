const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/restrictTo');
const fileHandle = require('../middlewares/multer');
const bookController = require('../controllers/episode.controller');

const router = express.Router();

router.post('/book/:bookId/episode',protect, restrictTo('admin', 'moderator'),fileHandle,bookController.addEpisode)
router.get('/book/:bookId/episode', protect, bookController.getEpisodesByBook)

// like un like episode 
router.put('/book/:bookId/episode/:episodeId/like',protect, bookController.toggleLikeEpisode)


// delete episode by book
router.delete('/book/:bookId/episode/:episodeId', protect, bookController.deleteEpisode)

module.exports = router;