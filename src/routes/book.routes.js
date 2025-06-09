const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/restrictTo');
const bookController = require('../controllers/book.controller');
const fileHandle = require('../middlewares/multer');

const router = express.Router();

// Fixed routes first - no param routes
router.post('/create', protect, restrictTo('admin', 'moderator'), fileHandle, bookController.createBook);
router.get('/deleted', protect, restrictTo('admin', 'moderator'), bookController.deletedBooks);
router.get('/allBooks', protect, bookController.getAllBooks);
router.get('/allBookMarks', protect, bookController.getBookmarkedBook);

// Category based routes - fixed prefixes
router.get('/category/:categoryId', protect, bookController.booksByCategory);
router.get('/subCategory/:subCategoryId', protect, bookController.booksBySubCategory);

// Status updates, soft deletes, feature update, permanent deletes
router.put('/:id/status', protect, restrictTo('admin', 'moderator'), bookController.updateBookStatus);
router.put('/:id/feature', protect, restrictTo('admin', 'moderator'), bookController.updateBookFeature);
router.put('/:id/update', protect, restrictTo('admin', 'moderator'), fileHandle, bookController.updateBook);

router.patch('/:id/book', protect, restrictTo('admin', 'moderator'), bookController.softDeletBook);
router.patch('/:id/restore', protect, restrictTo('admin', 'moderator'), bookController.restoreBook);

router.delete('/:id/delete', protect, restrictTo('admin', 'moderator'), bookController.deleteBook);
router.delete('/multiDelete', protect, restrictTo('admin', 'moderator'), bookController.deleteMultipleBooks);

// Like and bookmark (these are param based, so after fixed routes)
router.put('/:id/like', protect, bookController.toggleLikeBook);
router.put('/:id/bookmark', protect, bookController.toggleBookmark);

// seacrh routes
router.get('/search', protect, bookController.searchBooks);

// Finally, GET book by id (always last param route)
router.get('/:id', protect, bookController.getBookById);

module.exports = router;
