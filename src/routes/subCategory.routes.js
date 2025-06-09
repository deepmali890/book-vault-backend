const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/restrictTo');
const subCategoryController = require('../controllers/subCategory.controller');
const fileHandle = require('../middlewares/multer');

const router = express.Router();

router.post('/create',protect, restrictTo('admin', 'moderator'),fileHandle, subCategoryController.createSubCategory)
//search api
router.get('/subcategories/search', protect, subCategoryController.searchSubCategories)
router.get('/deletedSubCategory', protect, restrictTo('admin', 'moderator'), subCategoryController.getDeletedSubCategories)
router.get('/all',protect,  subCategoryController.getAllSubCategories)
router.get('/:id',protect,  subCategoryController.getSubCategoryById)

// change status and feature
router.put('/status/:id',protect,restrictTo('admin', 'moderator'),  subCategoryController.updateSubCategoryStatus)
router.put('/featured/:id',protect,restrictTo('admin','moderator'),  subCategoryController.updateSubCategoryFeature)
router.put('/:id/update',protect,restrictTo('admin','moderator'),fileHandle,  subCategoryController.updateSubCategory)

// soft delete and restore
router.patch('/:id/softDelete', protect, restrictTo('admin', 'moderator'), subCategoryController.softDeleteSubCategory)
router.delete('/hard-multiple-delete', protect, restrictTo('admin','moderator'), subCategoryController.hardDeleteMultipleSubCategories)
//restore category
router.patch('/:id/restore', protect, restrictTo('admin', 'moderator'), subCategoryController.restoreSubCategory)

// delete category
router.delete('/:id/delete', protect, restrictTo('admin','moderator'), subCategoryController.hardDeleteSubCategory)



module.exports = router;