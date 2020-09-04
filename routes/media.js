const express = require("express");
const router = express.Router();
const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const fs = require("fs");

// Models
const { Media } = require("../models");

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const imageRes = await Media.findOne({
    where: { id },
  });
  res.json({ data: imageRes });

  if (!imageRes) {
    return res
      .status(404)
      .json({ status: "error", message: "image not found" });
  }

  fs.unlink(`./public/${imageRes.imageUrl}`, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ status: "error", message: "failed to delete image" });
    }

    await imageRes.destroy();
    return res
      .status(201)
      .json({ status: "success", message: "image deleted" });
  });
});

router.post("/", async (req, res) => {
  const { image } = req.body;

  if (!isBase64(image, { mimeRequired: true })) {
    res.status(400).json({
      status: "error",
      message: "image must be base64 data",
    });
  }

  // Convert base 64 data to image file
  base64Img.img(
    image,
    "./public/images",
    new Date().getTime(),
    async (err, filepath) => {
      if (err) {
        return res.status(400).json({ status: "error", message: err.message });
      }

      let imageName = filepath.split("/").pop();
      const mediaRes = await Media.create({ imageUrl: `images/${imageName}` });

      res.status(201).json({
        status: "success",
        data: {
          id: mediaRes.id,
          imageUrl: `${req.get("host")}/images/${imageName}`,
        },
      });
    }
  );
});

router.get("/", async (req, res) => {
  try {
    const imagesRes = await Media.findAll({
      attributes: ["id", "imageUrl"],
    });
    const mappingImages = imagesRes.map((image, i) => {
      image.imageUrl = `${req.get("host")}/images/${image.imageUrl
        .split("/")
        .pop()}`;

      return image;
    });

    res.status(200).json({
      status: "success",
      data: mappingImages,
    });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
});

module.exports = router;
