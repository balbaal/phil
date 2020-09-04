const express = require("express");
const router = express.Router();

// Controllers
const MediaController = require("../controllers/Media");

router.get("/", MediaController.findAllImage);
router.post("/", MediaController.uploadImage);
router.delete("/:id", MediaController.deleteImage);

module.exports = router;
