const Book = require("../models/book.model");
const getDataUri = require("../utils/datauri");
const cloudinary = require("../utils/cloudinary");
const getAudioDuration = require("../utils/getAudioDuration");
const  mongoose = require("mongoose");


exports.addEpisode = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, description, episodeNumber } = req.body;

        const audioFile = req.files && req.files.audio ? req.files.audio[0] : null;
        if (!audioFile) {
            return res.status(400).json({ message: "Audio file is required" });
        }

        //Get duration before uploading
        const duration = await getAudioDuration(audioFile.buffer);

        const fileUri = getDataUri(audioFile);
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: `books/audio`,
            resource_type: "video" // audio bhi video type me count hota hai
        });
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const newEpisode = {
            title,
            description,
            episodeNumber,
            audioUrl: result.secure_url,
            audioPublicId: result.public_id,
            duration,
        }

        book.episodes.push(newEpisode);
        await book.save();
        res.status(200).json({ success: true, message: "Episode added successfully", episode: newEpisode });


    } catch (error) {
        console.error("Add Episode Error:", error);
        res.status(500).json({ message: "Server error while adding episode" });
    }
}

exports.getEpisodesByBook = async (req, res) => {
    const { bookId } = req.params;
    try {
        const book = await Book.findById(bookId).select("episodes");
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ success: true, episodes: book.episodes });

    } catch (error) {
        console.error("Get Episodes Error:", error);
        res.status(500).json({ message: "Server error while fetching episodes" });
    }
}

exports.toggleLikeEpisode = async (req, res) => {
    try {
        const { bookId, episodeId } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const episode = book.episodes.id(episodeId);
        if (!episode) return res.status(404).json({ message: "Episode not found" });

        if (!episode.likes) episode.likes = [];

        const index = episode.likes.findIndex(id => id.toString() === userId.toString());

        if (index === -1) {
            episode.likes.push(userId);
        } else {
            episode.likes.splice(index, 1);
        }

        await book.save();

        res.status(200).json({ 
            success: true, 
            likesCount: episode.likes.length, 
            likedByUser: index === -1 
        });

    } catch (error) {
        console.error("Toggle Like Episode Error:", error);
        res.status(500).json({ message: "Server error while toggling like" });
    }
}

exports.deleteEpisode = async (req, res) => {
    try {
        const { bookId, episodeId } = req.params;
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const episode = book.episodes.id(episodeId);
        if (!episode) return res.status(404).json({ message: "Episode not found" });

        if (episode.audioPublicId) {
            await cloudinary.uploader.destroy(episode.audioPublicId, { resource_type: 'video' });
        }

        episode.remove();
        await book.save();
        res.status(200).json({ success: true, message: "Episode deleted successfully" });

    } catch (error) {

    }
}

exports.multiDeleteEpisodes = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { episodeIds } = req.body;

        if (!Array.isArray(episodeIds) || episodeIds.length === 0) {
            return res.status(400).json({ message: "Please provide episodeIds array" });
        }

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        for (const id of episodeIds) {
            const ep = book.episodes.id(id);
            if (ep) {
                if (ep.audioPublicId) {
                    await cloudinary.uploader.destroy(ep.audioPublicId, { resource_type: 'video' });
                }
                ep.remove();
            }
        }

        await book.save();

        res.status(200).json({ success: true, message: `${episodeIds.length} episodes deleted successfully` });
    } catch (error) {
        console.error("Multi Delete Episodes Error:", error);
        res.status(500).json({ message: "Server error while deleting episodes" });
    }
};
