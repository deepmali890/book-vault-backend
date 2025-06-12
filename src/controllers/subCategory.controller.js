const BookCategory = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");
const getDataUri = require("../utils/datauri");
const cloudinary = require('../utils/cloudinary');
const mongoose = require("mongoose");
const getCloudinaryPublicId = require("../utils/getCloudinaryPublicId");

exports.createSubCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, status, featured } = req.body;

        // Validation
        if (!name || !description || !parentCategory) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if parent category exists
        const parentCategoryExists = await BookCategory.findById(parentCategory);
        if (!parentCategoryExists) {
            return res.status(400).json({ success: false, message: 'Parent category does not exist' });
        }

        // Check duplicate sub-category
        const duplicateSubCategory = await SubCategory.findOne({ name: name.trim() });
        if (duplicateSubCategory) {
            return res.status(409).json({ success: false, message: 'Sub-category already exists' });
        }

        // handleImageOptiuon
        const SubCategoryImage = req.files && req.files.SubCategoryImage ? req.files.SubCategoryImage[0] : null;

        let cloudResponse;
        if (SubCategoryImage) {
            const fileUri = getDataUri(SubCategoryImage);
            cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: "subcategories",
            });
        }
        // req.user is set by protect middleware, contains logged-in user info
        const createdBy = {
            userId: req.user._id,
            role: req.user.role
        };


        // Create new sub-category
        const subCategory = await SubCategory.create({
            name: name.trim(),
            description: description.trim(),
            parentCategory,
            status: status !== undefined ? status : true,
            featured: featured !== undefined ? featured : false,
            SubCategoryImage: cloudResponse ? cloudResponse.secure_url : null,
            createdBy
        })
        res.status(201).json({
            success: true,
            message: "Sub-category created successfully",
            data: subCategory
        });


    } catch (error) {
        console.error("Create SubCategory Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating sub-category"
        });
    }
}

exports.getAllSubCategories = async (req, res) => {
    try {
        const sunCategories = await SubCategory.find({ deleted_at: null, status:true })
            .populate('parentCategory', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Sub-categories fetched successfully",
            data: sunCategories
        });
    } catch (error) {
        console.error("Get All SubCategories Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching sub-categories"
        });

    }
}

exports.getAllActiveSubCategories = async (req, res) => {
    try {
        const sunCategories = await SubCategory.find({ deleted_at: null })
            .populate('parentCategory', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Sub-categories fetched successfully",
            data: sunCategories
        });
    } catch (error) {
        console.error("Get All SubCategories Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching sub-categories"
        });

    }
}

exports.getSubCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid SubCategory ID'
            });
        }

        const subCategory = await SubCategory.findById(id)
            .populate('parentCategory', 'name')

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'SubCategory not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'SubCategory fetched successfully',
            data: subCategory
        });
    } catch (error) {
        console.error('Get SubCategory By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sub-category'
        });
    }
}

exports.updateSubCategoryStatus = async (req, res) => {
    const subcategoryId = req.params.id;
    const { status } = req.body;
    try {
        // Validation: status should be boolean
        if (typeof status !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Status must be true or false' });
        }

        const updateSubCategoryStatus = await SubCategory.findByIdAndUpdate(subcategoryId, { status }, { new: true });

        if (!updateSubCategoryStatus) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }
        res.status(200).json({
            success: true,
            message: 'SubCategory status updated successfully',
            data: updateSubCategoryStatus
        });

    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating status' });
    }
}

exports.updateSubCategoryFeature = async (req, res) => {
    try {
        const subCategoryId = req.params.id;
        const { featured } = req.body;

        // Validation: featured must be boolean
        if (typeof featured !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Featured must be true or false' });
        }

        const updateSubCategoryFeatured = await SubCategory.findByIdAndUpdate(subCategoryId, { featured }, { new: true });

        if (!updateSubCategoryFeatured) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }

        res.status(200).json({
            success: true,
            message: 'SubCategory featured status updated successfully',
            data: updateSubCategoryFeatured
        })

    } catch (error) {
        console.error('Update Featured Error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating featured' });

    }
}

exports.updateSubCategory = async (req, res) => {
    try {
        const subCategoryId = req.params.id;
        const { name, description, parentCategory, status, featured } = req.body;

        // Find sub-category
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub-category not found' });
        }
        // Validate parent category if it's updated
        if (parentCategory) {
            const parentExists = await BookCategory.findById(parentCategory);
            if (!parentExists) {
                return res.status(400).json({ success: false, message: 'Invalid parent category' });
            }
        }

        // Handle image update
        const newImage = req.files && req.files.SubCategoryImage ? req.files.SubCategoryImage[0] : null;

        if (newImage) {
            // 🗑️ Delete old image from Cloudinary
            if (subCategory.SubCategoryImage) {
                const publicId = getCloudinaryPublicId(subCategory.SubCategoryImage);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            // 📤 Upload new image
            const fileUri = getDataUri(newImage);
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'subcategories', // Optional: helps organize your images in Cloudinary
            });

            subCategory.SubCategoryImage = cloudResponse.secure_url;
        }
        // Update sub-category fields
        if (name) subCategory.name = name.trim();
        if (description) subCategory.description = description.trim();
        if (parentCategory) subCategory.parentCategory = parentCategory;
        if (status !== undefined) subCategory.status = status;
        if (featured !== undefined) subCategory.featured = featured;
        // Save updated sub-category
        await subCategory.save();

        res.status(200).json({
            success: true,
            message: "Sub-category updated successfully",
            data: subCategory
        });

    } catch (error) {
        console.error("Update SubCategory Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating sub-category"
        });
    }
}

exports.softDeleteSubCategory = async (req, res) => {
    const subCategoryId = req.params.id;
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' })
        }
        // already soft deleted
        if (subCategory.deleted_at) {
            return res.status(400).json({ success: false, message: 'SubCategory already deleted' });
        }

        subCategory.deleted_at = new Date();
        await subCategory.save();

        res.status(200).json({ success: true, message: 'SubCategory soft deleted successfully' });

    } catch (error) {
        console.error('Soft Delete Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.getDeletedSubCategories = async (req, res) => {
    try {
        const deletedSubs = await SubCategory.find({ deleted_at: { $ne: null } });

        res.status(200).json({
            success: true,
            data: deletedSubs
        });
    } catch (error) {
        console.error("Get Deleted Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.restoreSubCategory = async (req, res) => {
    const subCategoryId = req.params.id;
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        if (!subCategory.deleted_at) {
            return res.status(400).json({
                success: false,
                message: 'Category is not deleted'
            });
        }
        subCategory.deleted_at = null;
        await subCategory.save();
        res.status(200).json({ success: true, message: 'SubCategory restored successfully' });
    } catch (error) {
        console.error('Restore SubCategory Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while restoring category'
        });
    }
}

exports.hardDeleteSubCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        // 🧹 Delete image from Cloudinary
        if (subCategory.SubCategoryImage) {
            const publicId = getCloudinaryPublicId(subCategory.SubCategoryImage);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        // 💥 Hard delete from DB
        await SubCategory.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Sub-category and its image deleted permanently"
        });

    } catch (error) {
        console.error("Hard Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

exports.hardDeleteMultipleSubCategories = async (req, res) => {
    try {
        const { ids } = req.body; // 👈 Expecting an array of IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "IDs are required as array" });
        }

        const subCategories = await SubCategory.find({ _id: { $in: ids } });

        // 🔁 Delete each image from Cloudinary
        for (const subCategory of subCategories) {
            if (subCategory.SubCategoryImage) {
                const publicId = getCloudinaryPublicId(subCategory.SubCategoryImage);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        // 💥 Delete all from DB
        await SubCategory.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: "Selected sub-categories and their images deleted permanently"
        });

    } catch (error) {
        console.error("Multi Hard Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.searchSubCategories = async (req, res) => {
    try {
        const {
            keyword = '',
            parentCategory,
            status,
            featured,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {
            $and: [
                {
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { description: { $regex: keyword, $options: 'i' } },
                    ]
                }
            ]
        };

        // Optional filters
        if (parentCategory) {
            query.$and.push({ parentCategory });
        }

        if (status !== undefined) {
            query.$and.push({ status: status === 'true' });
        }

        if (featured !== undefined) {
            query.$and.push({ featured: featured === 'true' });
        }

        const subCategories = await SubCategory.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await SubCategory.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Search results fetched successfully',
            data: subCategories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching sub-categories',
        });
    }
};

