const getDataUri = require("../utils/datauri");
const cloudinary = require("../utils/cloudinary");
const Book = require("../models/book.model");

exports.createBook = async (req, res) => {
    try {
        const { name, bookCategory, subCategory, author, price, mrp, accessType, featured, status, availableForOrder } = req.body;

        const coverImage = req.files && req.files.coverImage ? req.files.coverImage[0] : null;
        const bookPdf = req.files && req.files.bookPdf ? req.files.bookPdf[0] : null;

        let coverImageUrl = "", bookPdfUrl = "";

        // upload cover image
        if (coverImage) {
            const fileUri = getDataUri(coverImage);
            const result = await cloudinary.uploader.upload(fileUri, { folder: "books/cover" });
            coverImageUrl = result.secure_url;
        }

        // ✅ Upload PDF (IMPORTANT FIXES BELOW)
        if (bookPdf) {
            const fileUri = getDataUri(bookPdf);

            const result = await cloudinary.uploader.upload(fileUri, {
                folder: "books/pdf",
                resource_type: "raw", // raw needed for non-image files
                public_id: `book_${Date.now()}`, // no `.pdf` needed here
                format: "pdf", // ✅ force the format
                use_filename: true,
                unique_filename: false,
            });

            bookPdfUrl = result.secure_url;
            bookPdfPublicId = result.public_id;
        }

        const createdBy = {
            userId: req.user._id,
            role: req.user.role
        };

        const book = await Book.create({
            name,
            bookCategory,
            subCategory,
            author,
            coverImage: coverImageUrl,
            bookPdf: bookPdfUrl,
            bookPdfPublicId,
            price,
            mrp,
            accessType,
            featured: featured ?? false,
            status: status ?? true,
            availableForOrder: availableForOrder ?? true,
            createdBy
        });
        res.status(201).json({
            success: true,
            message: "Book created successfully",
            data: book
        });

    } catch (error) {
        console.error("Create Book Error:", error);
        res.status(500).json({ success: false, message: "Server error while creating book" });
    }
}

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({ deleted_at: null })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Books fetched successfully",
            count: books.length,
            data: books
        })

    } catch (error) {
        console.error("Get All Books Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching books" });

    }
}

exports.getActiveBooks = async (req, res) => {
    try {
        const books = await Book.find({ deleted_at: null, status: true })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Books fetched successfully",
            count: books.length,
            data: books
        })
    } catch (error) {
        console.error("Get Active Books Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching active books" });
    }
}

exports.getBookById = async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId, { deleted_at: null, status: true })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({
            success: true,
            message: "Book fetched successfully",
            data: book
        })

    } catch (error) {
        console.error("Get Book By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching book" });
    }
}

exports.updateBookStatus = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { status } = req.body;
        // Validation: status should be boolean

        console.log("Received body:", req.body); // 👀 Debug karne ke liye
        console.log("Book ID:", bookId);

        if (status === 'true') status = true;
        else if (status === 'false') status = false;

        if (typeof status !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Status must be true or false' });
        }

        const book = await Book.findByIdAndUpdate(bookId, { status }, { new: true });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({
            success: true,
            message: "Book status updated successfully",
            data: book
        })
    } catch (error) {
        console.error("Update Book Status Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating book status" });

    }
}

exports.updateBookFeature = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { featured } = req.body;
        // Validation: status should be boolean
        if (typeof featured !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Featured must be true or false' });
        }
        const book = await Book.findByIdAndUpdate(bookId, { featured }, { new: true });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({
            success: true,
            message: "Book featured status updated successfully",
            data: book
        })

    } catch (error) {
        console.error("Update Book Featured Status Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating book featured status" });

    }
}

exports.booksByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const books = await Book.find({ bookCategory: categoryId, status: true })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        if (!books || books.length === 0) {
            return res.status(404).json({ success: false, message: "Books not found for this category" });
        }

        res.status(200).json({
            success: true,
            message: "Books fetched successfully",
            count: books.length,
            data: books
        })
    } catch (error) {
        console.error("Books By Category Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching books" });

    }
}

exports.booksBySubCategory = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;
        const books = await Book.find({ subCategory: subCategoryId, status: true })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        if (!books || books.length === 0) {
            return res.status(404).json({ success: false, message: "Books not found for this sub category" });
        }

        res.status(200).json({
            success: true,
            message: "Books fetched successfully",
            count: books.length,
            data: books
        })
    } catch (error) {
        console.error("Books By Sub Category Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching books  " });
    }

}

exports.updateBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const { name, description, bookCategory, subCategory, author, price, mrp, accessType, featured, status, availableForOrder } = req.body;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        const coverImage = req.files && req.files.coverImage ? req.files.coverImage[0] : null;
        const bookPdf = req.files && req.files.bookPdf ? req.files.bookPdf[0] : null;

        if (coverImage) {
            const publicId = book.coverImage?.split("/").pop().split(".")[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`books/cover/${publicId}`);
            }

            const fileUri = getDataUri(coverImage);
            const result = await cloudinary.uploader.upload(fileUri, {
                folder: "books/cover"
            });
            book.coverImage = result.secure_url;
        }

        // Update PDF & delete old one from Cloudinary
        if (bookPdf) {
            const oldPdfPublicId = book.bookPdfPublicId;

            if (oldPdfPublicId) {
                try {
                    await cloudinary.uploader.destroy(oldPdfPublicId, { resource_type: "raw" });
                } catch (err) {
                    console.error("Error deleting old PDF:", err);
                }
            }

            const fileUri = getDataUri(bookPdf);
            const result = await cloudinary.uploader.upload(fileUri, {
                folder: "books/pdf",
                resource_type: "raw",
                public_id: `book_${Date.now()}`,
                format: "pdf",
            });

            book.bookPdf = result.secure_url;
            book.bookPdfPublicId = result.public_id;
        }


        if (name) book.name = name;
        if (description) book.description = description;
        if (bookCategory) book.bookCategory = bookCategory;
        if (subCategory) book.subCategory = subCategory;
        if (author) book.author = author;
        if (price) book.price = price;
        if (mrp) book.mrp = mrp;
        if (accessType) book.accessType = accessType;
        if (featured !== undefined) book.featured = featured;
        if (status !== "undefined") book.status = status;
        if (availableForOrder !== undefined) book.availableForOrder = availableForOrder;

        await book.save();

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: book
        })
    } catch (error) {
        console.error("Update Book Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating book" });
    }
}

exports.softDeletBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        book.deleted_at = Date.now();
        await book.save();

        res.status(200).json({
            success: true,
            message: "Book deleted successfully",
            data: book
        })
    } catch (error) {
        console.error("Delete Book Error:", error);
        res.status(500).json({
            success: false, message: "Server error while deleting book"
        });
    }
}

exports.deletedBooks = async (req, res) => {
    try {
        const books = await Book.find({ deleted_at: { $ne: null } })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        if (!books || books.length === 0) {
            return res.status(404).json({ success: false, message: "No deleted books found" });
        }

        res.status(200).json({
            success: true,
            message: "Deleted books fetched successfully",
            count: books.length,
            data: books
        })

    } catch (error) {
        console.error("Error fetching deleted books:", error);
        res.status(500).json({ success: false, message: "Server error while fetching deleted books" });

    }
}

exports.restoreBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        book.deleted_at = null;
        await book.save();

        res.status(200).json({
            success: true,
            message: "Book restored successfully",
            data: book
        })

    } catch (error) {
        console.error("Error restoring book:", error);
        res.status(500).json({ success: false, message: "Server error while restoring book" });

    }
}

exports.deleteBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        if (book.coverImage) {
            const publicId = book.coverImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`books/cover/${publicId}`);
        }

        if (book.bookPdfPublicId) {
            await cloudinary.uploader.destroy(book.bookPdfPublicId, {
                resource_type: "raw"
            });
        }


        await Book.findByIdAndDelete(bookId);

        res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        })

    } catch (error) {
        console.error("Delete Book Error:", error);
        res.status(500).json({ success: false, message: "Server error while deleting book" });
    }
}

exports.deleteMultipleBooks = async (req, res) => {
    const { bookIds } = req.body;
    try {
        if (!Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({ success: false, message: "No book IDs provided" });
        }

        const books = await Book.find({ _id: { $in: bookIds } });

        for (const book of books) {
            if (book.coverImage) {
                const publicId = book.coverImage.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`books/cover/${publicId}`);
            }

            if (book.bookPdfPublicId) {
                await cloudinary.uploader.destroy(book.bookPdfPublicId, {
                    resource_type: "raw"
                });
            }
        }
        await Book.deleteMany({ _id: { $in: bookIds } });

        res.status(200).json({
            success: true,
            message: "Books deleted successfully"
        })

    } catch (error) {
        console.error("Multi Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error while deleting multiple books" });
    }
}

exports.searchBooks = async (req, res) => {
    try {
        const {
            name,
            author,
            category,
            subCategory,
            minPrice,
            maxPrice,
            accessType,
            sortBy,
            page = 1,
            limit = 10
        } = req.query;

        let query = { deleted_at: null };

        if (name) query.name = { $regex: name, $options: "i" };
        if (author) query.author = { $regex: author, $options: "i" };
        if (category) query.bookCategory = category;
        if (subCategory) query.subCategory = subCategory;
        if (accessType) query.accessType = accessType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        let sort = { createdAt: -1 }; // default: latest
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'name') sort = { name: 1 };

        const books = await Book.find(query)
            .populate('bookCategory subCategory')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            books
        });

    } catch (error) {
        console.error("Search Books Error:", error);
        res.status(500).json({ success: false, message: "Server error during book search" });
    }
}

exports.toggleLikeBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user._id;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        const isLiked = await book.likes.includes(userId);

        if (isLiked) {
            book.likes.pull(userId);
        } else {
            book.likes.push(userId); // Like
        }
        await book.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Book unliked successfully" : "Book liked successfully",
            // data: book
        });


    } catch (error) {
        console.error("Toggle Like Book Error:", error);
        res.status(500).json({ success: false, message: "Server error during book toggle " });

    }

}

exports.toggleBookmark = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user._id;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        const isBookmarked = await book.bookmarks.includes(userId);
        if (isBookmarked) {
            // remove book marked
            book.bookmarks.pull(userId);
            await book.save();
            return res.status(200).json({ success: true, message: "Bookmark removed" });
        } else {
            // add book marked
            book.bookmarks.push(userId);
            await book.save();
            return res.status(200).json({ success: true, message: "Bookmark added" });
        }

    } catch (error) {
        console.error("Toggle Bookmark Error:", error);
        res.status(500).json({ success: false, message: "Server error while toggling bookmark" });
    }

}

exports.getBookmarkedBook = async (req, res) => {
    try {
        const userId = req.user._id;
        const books = await Book.find({ bookmarks: userId, deleted_at: null })
            .populate("bookCategory", "name")
            .populate("subCategory", "name")
            .populate("createdBy.userId", "name email")
            .sort({ createdAt: -1 });

        if (!books || books.length === 0) {
            return res.status(404).json({ success: false, message: "No bookmarked books found" });
        }
        res.status(200).json({ success: true, data: books });

    } catch (error) {
        console.error("Get Bookmarked Book Error:", error);
        res.status(500).json({ success: false, message: "Server error while getting bookmarked books" });

    }
}
