
const Claim = require("../models/Claim");
const Item = require("../models/Item");

// CREATE A CLAIM
const createClaim = async (req, res) => {
    try {
        const { itemId, message } = req.body;

        if (!itemId || !message) {
            return res.status(400).json({
                message: "Item ID and message are required"
            });
        }

        const item = await Item.findById(itemId);

        if (!item || item.approvalStatus !== "approved") {
            return res.status(404).json({
                message: "Approved item not found"
            });
        }

        if (item.reportedBy.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot claim your own item"
            });
        }

        if (item.itemStatus !== "open") {
            return res.status(400).json({
                message: "This item is no longer available"
            });
        }

        const existingClaim = await Claim.findOne({
            item: itemId,
            claimant: req.user.id
        });

        if (existingClaim) {
            return res.status(400).json({
                message: "You have already claimed this item"
            });
        }

        const claim = await Claim.create({
            item: itemId,
            claimant: req.user.id,
            message
        });

        res.status(201).json({
            message: "Claim submitted successfully",
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET MY CLAIMS
const getMyClaims = async (req, res) => {
    try {
        const claims = await Claim.find({
            claimant: req.user.id
        })
        .populate("item")
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ADMIN: GET ALL CLAIMS
const getAllClaims = async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate("item")
            .populate("claimant", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// APPROVE OR REJECT CLAIM
const updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const claim = await Claim.findById(req.params.id)
            .populate("item");

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        const isOwner =
            claim.item.reportedBy.toString() === req.user.id;

        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized to review this claim"
            });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({
                message: "This claim has already been reviewed"
            });
        }

        claim.status = status;
        claim.reviewedBy = req.user.id;

        await claim.save();

        if (status === "approved") {
            await Item.findByIdAndUpdate(claim.item._id, {
                itemStatus: "claimed"
            });
        }

        res.status(200).json({
            message: `Claim ${status} successfully`,
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createClaim,
    getMyClaims,
    getAllClaims,
    updateClaimStatus
};
