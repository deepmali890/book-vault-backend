const Slider = require("../models/slider.model");
const cloudinary = require("../utils/cloudinary");
const getDataUri = require("../utils/datauri");

exports.createSlider = async (req, res) => {
    try {
        const { title, subtitle, description, link, order } = req.body;

        let imageUrl = "";
        let imagePublicId = "";

        if (!req.files || !req.files.sliderImage) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const imageFile = req.files.sliderImage[0];
        const fileUri = getDataUri(imageFile);
        const result = await cloudinary.uploader.upload(fileUri, { folder: "home/sliders" });

        imageUrl = result.secure_url;
        imagePublicId = result.public_id;

        const createdBy = {
            userId: req.user._id,
            role: req.user.role
        };

        const slider = new Slider({
            title,
            subtitle,
            description,
            imageUrl,
            imagePublicId,
            link,
            order,
            createdBy
        });

        await slider.save();
        res.status(201).json({ success: true, message: "Slider created", data:slider });
    } catch (error) {
        console.error("Create Slider Error:", error);
        res.status(500).json({ message: "Server error while creating slider" });
    }
};

exports.getSliders = async (req, res) => {
    try {
        const sliders = await Slider.find({ deleted_at: null, status: true }).sort({ order: 1 });
        res.status(200).json({ success: true, sliders });
    } catch (error) {
        console.error("Get Sliders Error:", error);
        res.status(500).json({ message: "Server error while fetching sliders" });
    }
};

// Soft Delete
exports.softDeleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const slider = await Slider.findById(id);
        if (!slider) return res.status(404).json({ message: "Slider not found" });

        slider.deleted_at = new Date();
        await slider.save();
        res.status(200).json({ success: true, message: "Slider soft deleted" });
    } catch (error) {
        console.error("Soft Delete Error:", error);
        res.status(500).json({ message: "Server error while soft deleting slider" });
    }
};

// Get Deleted Sliders
exports.getDeletedSliders = async (req, res) => {
    try {
        const sliders = await Slider.find({ deleted_at: { $ne: null } });
        res.status(200).json({ success: true, sliders });
    } catch (error) {
        console.error("Fetch Deleted Sliders Error:", error);
        res.status(500).json({ message: "Server error while fetching deleted sliders" });
    }
};

exports.restoreSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const slider = await Slider.findById(id);
        if (!slider) return res.status(404).json({ message: "Slider not found" });

        slider.deleted_at = null;
        await slider.save();
        res.status(200).json({ success: true, message: "Slider restored successfully" });
    } catch (error) {
        console.error("Restore Slider Error:", error);
        res.status(500).json({ message: "Server error while restoring slider" });
    }
};

exports.permanentDeleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const slider = await Slider.findById(id);
        if (!slider) return res.status(404).json({ message: "Slider not found" });

        if (slider.imagePublicId) {
            await cloudinary.uploader.destroy(slider.imagePublicId);
        }

        await slider.deleteOne();
        res.status(200).json({ success: true, message: "Slider permanently deleted" });
    } catch (error) {
        console.error("Permanent Delete Error:", error);
        res.status(500).json({ message: "Server error while permanently deleting slider" });
    }
};

exports.permanentDeleteMultipleSliders = async (req, res) => {
    try {
        const { sliderIds } = req.body;
        if (!Array.isArray(sliderIds) || sliderIds.length === 0) {
            return res.status(400).json({ message: "sliderIds must be a non-empty array" });
        }

        const sliders = await Slider.find({ _id: { $in: sliderIds } });
        const deletePromises = sliders.map(async (slider) => {
            if (slider.imagePublicId) {
                await cloudinary.uploader.destroy(slider.imagePublicId);
            }
            await slider.deleteOne();
        });

        await Promise.all(deletePromises);
        res.status(200).json({ success: true, message: "Multiple sliders permanently deleted" });
    } catch (error) {
        console.error("Multi Permanent Delete Error:", error);
        res.status(500).json({ message: "Server error while permanently deleting multiple sliders" });
    }
};

exports.searchSliders = async (req, res) => {
    try {
        const { keyword } = req.query;
        const sliders = await Slider.find({
            deleted_at: null,
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { subTitle: { $regex: keyword, $options: "i" } },
            ],
        });
        res.status(200).json({ success: true, sliders });
    } catch (error) {
        console.error("Search Sliders Error:", error);
        res.status(500).json({ message: "Server error while searching sliders" });
    }
};



