const BookCategory = require("../models/category.model");
const User = require("../models/auth.model");

exports.CreateBookCategory = async (req, res) => {
    const { name, description, status, featured } = req.body;
    if (!name) {
        return res.status(400).json({
            message: 'Name is required'
        })
    }
    try {
        const categoryExists = await BookCategory.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({
                message: 'Category already exists'
            })
        }

        // req.user is set by protect middleware, contains logged-in user info
        const createdBy = {
            userId: req.user._id,
            role: req.user.role
        };

        const category = await BookCategory.create({
            name,
            description,
            status: status !== undefined ? status : true,
            featured: featured !== undefined ? featured : false,
            createdBy
        })
        await category.save();
        res.status(201).json({
            message: 'Category created successfully',
            data: category,
            success: true
        })

    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: 'Server error while creating category', success: false });
    }
}

exports.getAllCategories = async (req, res) => {
    try {
        // Fetch all categories with status true (active ones only)
        const categories = await BookCategory.find({ deleted_at: null, status: true }).sort({ createdAt: -1 })
            .populate('createdBy.userId', 'role');
        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories
        })

    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching categories' });
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await BookCategory.findById(categoryId, { deleted_at: null, status: true })
            .populate('role');

        if (!category || !category.status) {
            return res.status(404).json({ success: false, message: 'Category not found or inactive' });
        }

        res.status(200).json({ success: true, message: 'Category fetched successfully', data: category });

    }
    catch (error) {
        console.error('Get Category By ID Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching category' });
    }


}

exports.updateCategoryStatus = async (req, res) => {
    const categoryId = req.params.id;
    const { status } = req.body;
    try {
        // Validation: status should be boolean
        if (typeof status !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Status must be true or false' });
        }

        const updateCategoryStatus = await BookCategory.findByIdAndUpdate(categoryId, { status }, { new: true });

        if (!updateCategoryStatus) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Category status updated successfully',
            data: updateCategoryStatus
        });

    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating status' });
    }
}

exports.updateCategoryFeature = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { featured } = req.body;

        // Validation: featured must be boolean
        if (typeof featured !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Featured must be true or false' });
        }

        const updateCategoryFeatured = await BookCategory.findByIdAndUpdate(categoryId, { featured }, { new: true });

        if (!updateCategoryFeatured) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Category featured status updated successfully',
            data: updateCategoryFeatured
        })

    } catch (error) {

    }
}

exports.updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, description, status, featured } = req.body;

    try {
        // Find if category exists
        const category = await BookCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Update fields if provided
        if (name) category.name = name;
        if (description) category.description = description;
        if (status !== undefined) category.status = status;
        if (featured !== undefined) category.featured = featured;

        await category.save();
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });

    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating category',

        })
    }
}

exports.softDeleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await BookCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' })
        }
        // already soft deleted
        if (category.deleted_at) {
            return res.status(400).json({ success: false, message: 'Category already deleted' });
        }

        category.deleted_at = new Date();
        await category.save();

        res.status(200).json({ success: true, message: 'Category soft deleted successfully' });

    } catch (error) {
        console.error('Soft Delete Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.getDeletedCategories = async (req, res) => {
    try {
        const deletedCategories = await BookCategory.find({ deleted_at: { $ne: null } }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'Deleted categories fetched successfully', data: deletedCategories });

    } catch (error) {
        console.error('Fetch Soft Deleted Categories Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching soft deleted categories'
        });
    }
}

exports.restoreCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await BookCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        if (!category.deleted_at) {
            return res.status(400).json({
                success: false,
                message: 'Category is not deleted'
            });
        }
        category.deleted_at = null;
        await category.save();
        res.status(200).json({ success: true, message: 'Category restored successfully' });
    } catch (error) {
        console.error('Restore Category Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while restoring category'
        });
    }
}

exports.hardDeleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const deleteCategory = await BookCategory.findByIdAndDelete(categoryId);
        if (!deleteCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });

    } catch (error) {
        console.error('Hard Delete Category Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category'
        });
    }
}

exports.hardDeleteMultipleCategories = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of category IDs' });
        }
        const result = await BookCategory.deleteMany({ _id: { $in: ids } });
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} categories deleted successfully`,
        });


    } catch (error) {
        console.error('Multi Delete Categories Error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting categories' });
    }
}

exports.searchCategories = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please provide a search keyword' });
        }

        const regex = new RegExp(keyword, 'i'); // case-insensitive search

        const results = await BookCategory.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ],
            deleted_at: null
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Search results fetched successfully',
            data: results
        });

    } catch (error) {
        console.error('Search Categories Error:', error);
        res.status(500).json({ success: false, message: 'Server error while searching categories' });
    }
}
