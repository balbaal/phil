const express = require("express");
const router = express.Router();
const isBase64 = require("is-base64");
const base64Img = require("base64-img");

// Models
const { Media } = require("../models");

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
