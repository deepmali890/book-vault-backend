const express = require('express');
const fileHandle = require('../middlewares/multer');
const restrictTo = require('../middlewares/restrictTo');
const protect = require('../middlewares/authMiddleware');
const sliderController = require('../controllers/slider.controller');


const router = express.Router();

router.post('/create', protect, restrictTo('admin', 'moderator'), fileHandle, sliderController.createSlider);
router.get('/all', protect, sliderController.getSliders);
router.get('/deleted', protect, restrictTo('admin', 'moderator'), sliderController.getDeletedSliders);
// router.put('/status/:id', protect, restrictTo('admin', 'moderator'), sliderController.updateSliderStatus);
router.patch('/:id/softDelete', protect, restrictTo('admin', 'moderator'), sliderController.softDeleteSlider);
router.patch('/:id/restore', protect, restrictTo('admin', 'moderator'), sliderController.restoreSlider);
router.delete('/:id/permanentDelete', protect, restrictTo('admin', 'moderator'), sliderController.permanentDeleteSlider);
router.delete('/permanent-delete-multiple', protect, restrictTo('admin', 'moderator'), sliderController.permanentDeleteMultipleSliders);
router.get('/search', protect, sliderController.searchSliders);

module.exports = router;
