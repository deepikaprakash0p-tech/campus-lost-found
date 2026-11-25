
const express = require("express");
const router = express.Router();

const {
    createClaim,
    getMyClaims,
    updateClaimStatus,
    getAllClaims
} = require("../controllers/claimController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Submit a claim
router.post("/", protect, createClaim);

// View my claims
router.get("/my-claims", protect, getMyClaims);

// Admin: View all claims
router.get("/all", protect, adminOnly, getAllClaims);

// Approve or reject a claim
router.put("/:id", protect, updateClaimStatus);

module.exports = router;
