
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");



const {
    createItem,
    getItems,
    getMyItems,
    getPendingItems,
    updateItemApproval,
    getItemStats
} = require("../controllers/itemController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
// Create a lost or found item
router.post("/", protect, upload.single("image"), createItem);
// Get all items
router.get("/", getItems);

router.get("/pending", protect, adminOnly, getPendingItems);
// Admin: Get dashboard statistics
router.get("/stats", protect, adminOnly, getItemStats);
router.put("/:id/approval", protect, adminOnly, updateItemApproval);

// Get logged-in user's items
router.get("/my-items", protect, getMyItems);

module.exports = router;
