
const Item = require("../models/Item");

// CREATE LOST OR FOUND ITEM
const createItem = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            location,
            type,
            image
        } = req.body;

        if (!title || !description || !category || !location || !type) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        if (!["lost", "found"].includes(type)) {
            return res.status(400).json({
                message: "Type must be lost or found"
            });
        }

        const item = await Item.create({
            title,
            description,
            category,
            location,
            type,
            image: req.file ? `/uploads/${req.file.filename}` : (image || ""),
            reportedBy: req.user.id
        });

        res.status(201).json({
            message: "Item reported successfully",
            item
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET ALL APPROVED ITEMS
const getItems = async (req, res) => {
    try {
        const items = await Item.find({
            approvalStatus: "approved"
        })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET LOGGED-IN USER'S ITEMS
const getMyItems = async (req, res) => {
    try {
        const items = await Item.find({
            reportedBy: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// Get all pending items (Admin)
const getPendingItems = async (req, res) => {
    try {
        const items = await Item.find({
            approvalStatus: "pending"
        }).populate("reportedBy", "name email");

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Approve or Reject Item (Admin)
const updateItemApproval = async (req, res) => {
    try {
        const { approvalStatus } = req.body;

        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                message: "Invalid approval status"
            });
        }

        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        item.approvalStatus = approvalStatus;
        await item.save();

        res.status(200).json({
            message: `Item ${approvalStatus} successfully`,
            item
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ADMIN: GET DASHBOARD STATISTICS
const getItemStats = async (req, res) => {
    try {
        const totalItems = await Item.countDocuments();

        const pendingItems = await Item.countDocuments({
            approvalStatus: "pending"
        });

        const approvedItems = await Item.countDocuments({
            approvalStatus: "approved"
        });

        const rejectedItems = await Item.countDocuments({
            approvalStatus: "rejected"
        });

        res.status(200).json({
            totalItems,
            pendingItems,
            approvedItems,
            rejectedItems
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createItem,
    getItems,
    getMyItems,
    getPendingItems,
    updateItemApproval,
    getItemStats
};