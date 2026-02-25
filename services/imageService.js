const multer = require('multer')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const connection = require('../database/mariadb')

const uploadDir = 'app/images/meta'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const saveImage = async (file, ownerType, ownerId) => {
    if (!file) return null

    const fileName = `${ownerType}-${ownerId}-${Date.now()}.webp`
    const filePath = path.join(uploadDir, fileName)

    
    await sharp(file.path)
        .resize(1080)
        .webp({ quality: 80})
        .toFile(filePath)
    
    await connection.query(`INSERT INTO image_metadata (owner_type, owner_id, image_path) 
        VALUES (?, ?, ?)`, [ownerType, ownerId, fileName])
    
    return fileName;
}

const getImagePath = async (ownerId, ownerType) => {
    const [rows] = await connection.query(`SELECT image_path FROM image_metadata 
        WHERE owner_id = ? AND owner_type = ?`, [ownerId, ownerType])
        console.log(rows)
    if (!rows || rows.length === 0) {
        return {}
    }

    const imageUrls = rows.map(row => {
        return `/app/images/${row.image_path}`
    })
    return {
        success: true,
        images: imageUrls
    }
}


module.exports = { saveImage, getImagePath } 