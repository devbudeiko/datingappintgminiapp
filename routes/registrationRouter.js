const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const multer = require("multer");
const mysql = require("mysql");
const Joi = require("joi");
const registrationController = require("../controllers/registrationController.js");
const registrationRouter = express.Router();
const { queryAsync } = require("../utils/db");

const upload = multer({
    dest: "uploads/verification/",
    limits: {
        fileSize: 30 * 1024 * 1024,
    },
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profile");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const uploadProfileImg = multer({
    storage: storage,
    limits: { fileSize: 30 * 1024 * 1024 },
});

// Рендеринг страницы
registrationRouter.get("/registration", registrationController.index);
// Верификация личности
registrationRouter.post(
    "/compare",
    upload.fields([{ name: "image1" }, { name: "image2" }]),
    async (req, res) => {
        const apiKey = process.env.FACEPP_API_KEY;
        const apiSecret = process.env.FACEPP_API_SECRET;

        const { image1, image2 } = req.files;
        const userId = req.body.userId;

        if (!image1 || !image2) {
            return res
                .status(400)
                .send("Отсутствуют изображения для сравнения");
        }

        try {
            // Функция для сжатия изображения с использованием Sharp и сохранения во временный файл
            const compressAndSaveImage = async (imageFile) => {
                try {
                    const imagePath = path.resolve(imageFile[0].path);
                    const compressedImageBuffer = await sharp(imagePath)
                        .rotate()
                        .resize({ width: 800 })
                        .jpeg({ quality: 90 })
                        .toBuffer();

                    const timestamp = Date.now();
                    const randomSuffix = Math.random()
                        .toString(36)
                        .substring(7); // Генерируем уникальный случайный суффикс
                    const compressedImagePath = `compressed_image_${timestamp}_${randomSuffix}.jpg`;
                    const compressedImagePathOnServer = path.join(
                        __dirname,
                        "../uploads/verification",
                        compressedImagePath
                    );

                    fs.writeFileSync(
                        compressedImagePathOnServer,
                        compressedImageBuffer
                    );
                    return compressedImagePathOnServer;
                } catch (error) {
                    throw error;
                }
            };

            // Сжимаем и сохраняем оба изображения
            const compressedImage1Path = await compressAndSaveImage(image1);
            const compressedImage2Path = await compressAndSaveImage(image2);

            fs.unlinkSync(image1[0].path);
            fs.unlinkSync(image2[0].path);

            // Функция для загрузки изображения на сервер и получения URL
            const uploadImageAndGetUrl = async (compressedImagePath) => {
                try {
                    const imageData = fs.readFileSync(compressedImagePath);
                    const timestamp = Date.now();
                    const date = new Date(timestamp);

                    const day = date.getDate(); // Получаем день месяца (1-31)
                    const month = date.getMonth() + 1; // Получаем месяц (0-11, поэтому добавляем 1)
                    const year = date.getFullYear(); // Получаем год (четыре цифры)

                    const formattedDate = `${day}_${month}_${year}`;
                    const randomSuffix = Math.random().toString(5).substring(5);
                    const imageName = `userid_${userId}_${formattedDate}_${randomSuffix}.jpg`;
                    const imagePathOnServer = path.join(
                        __dirname,
                        "../uploads/verification",
                        imageName
                    );
                    fs.writeFileSync(imagePathOnServer, imageData);

                    const publicUrl = `https://wondy.online/uploads/verification/${imageName}`;
                    return publicUrl;
                } catch (error) {
                    throw error;
                }
            };

            // Загружаем оба изображения и получаем URL
            const imageUrl1 = await uploadImageAndGetUrl(compressedImage1Path);
            const imageUrl2 = await uploadImageAndGetUrl(compressedImage2Path);

            const payload = {
                api_key: apiKey,
                api_secret: apiSecret,
                image_url1: imageUrl1,
                image_url2: imageUrl2,
            };

            const response = await axios.post(
                "https://api-us.faceplusplus.com/facepp/v3/compare",
                payload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Удаление временных файлов
            fs.unlink(compressedImage1Path, (err) => {
                if (err) {
                    console.error(
                        "Ошибка при удалении файла compressedImage1Path:",
                        err
                    );
                }
            });

            fs.unlink(compressedImage2Path, (err) => {
                if (err) {
                    console.error(
                        "Ошибка при удалении файла compressedImage2Path:",
                        err
                    );
                }
            });

            res.json(response.data);
        } catch (error) {
            console.log(error);
            res.status(500).send("Произошла ошибка при запросе к API");
        }
    }
);

registrationRouter.post(
    "/register",
    uploadProfileImg.single("profileImage"),
    async (req, res) => {
        // Определение схемы валидации данных
        const schema = Joi.object({
            name: Joi.string().required(),
            age: Joi.number().integer().min(2).required(),
            city: Joi.string().required(),
            tg_user_id: Joi.string().required(),
            tg_user_username: Joi.string().allow(""),
            text: Joi.string().allow(""),
            gender: Joi.string().required(),
            gender_category: Joi.string().required(),
        });

        try {
            // Валидация данных из запроса
            const validatedData = await schema.validateAsync(req.body);

            // Обработка и сжатие изображения, если оно загружено
            if (req.file) {
                const inputPath = req.file.path;
                const outputPath = `uploads/profile/userid_${validatedData.tg_user_id}_${req.file.filename}`;

                await sharp(inputPath)
                    .rotate()
                    .resize({ width: 800 })
                    .jpeg({ quality: 90 })
                    .toFile(outputPath);

                // Удаление оригинального файла после сжатия
                fs.unlinkSync(inputPath);

                // Ссылка на сжатое изображение
                const profileImageUrl = outputPath;

                // SQL запрос для вставки данных пользователя в базу данных
                const sql = `
                    INSERT INTO users (
                        name, age, city, city_search, tg_user_id, tg_user_username, text, gender, gender_category, profile_image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                try {
                    const result = await queryAsync(sql, [
                        validatedData.name,
                        validatedData.age,
                        validatedData.city,
                        validatedData.city, // Устанавливаем city_search равным city
                        validatedData.tg_user_id,
                        validatedData.tg_user_username || null,
                        validatedData.text || null,
                        validatedData.gender,
                        validatedData.gender_category,
                        profileImageUrl,
                    ]);

                    res.sendStatus(200);
                } catch (error) {
                    console.log(error);

                    res.status(500).send("Server error");
                }
            } else {
                res.status(400).send("No image uploaded");
            }
        } catch (error) {
            console.log("Ошибка", error);

            res.status(400).send("Validation or processing error");
        }
    }
);

module.exports = registrationRouter;
