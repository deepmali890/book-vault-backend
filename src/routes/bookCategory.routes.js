const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/restrictTo');
const bookCategoryController = require('../controllers/bookCategory.controller');


const router = express.Router();

router.post('/create', protect, restrictTo('admin', 'moderator'), bookCategoryController.CreateBookCategory)

// search category
router.get('/search', protect, bookCategoryController.searchCategories) // for public

router.get('/admin/search', protect, restrictTo('admin', 'moderator, user'), bookCategoryController.searchCategories) // for adminpanel
router.get('/deleted', protect, restrictTo('admin', 'moderator'), bookCategoryController.getDeletedCategories)
router.get('/', bookCategoryController.getAllCategories)
router.get('/:id', bookCategoryController.getCategoryById)

// change status and feature and category
router.put('/:id/status', protect, restrictTo('admin', 'moderator'), bookCategoryController.updateCategoryStatus)
router.put('/:id/feature', protect, restrictTo('admin', 'moderator'), bookCategoryController.updateCategoryFeature)
router.put('/:id/updateCategory', protect, restrictTo('admin', 'moderator'), bookCategoryController.updateCategory)

//delete category 
router.patch('/:id/softDelete', protect, restrictTo('admin', 'moderator'), bookCategoryController.softDeleteCategory)


router.delete('/:id/delete', protect, restrictTo('admin', 'moderator'), bookCategoryController.hardDeleteCategory)
router.delete('/multi-delete', protect, restrictTo('admin', 'moderator'), bookCategoryController.hardDeleteMultipleCategories)



//restore category
router.patch('/:id/restore', protect, restrictTo('admin', 'moderator'), bookCategoryController.restoreCategory)




module.exports = router;