const base64Img = require('base64-img');
const fs = require('fs');

const IMAGES_DIR = 'images';
const base64Images = [];

const files = fs.readdirSync(IMAGES_DIR);
for (const file of files) {
    base64Images.push(base64Img.base64Sync(`${IMAGES_DIR}/${file}`));
}
const JSON_DATA = {
    images: base64Images
}
fs.writeFileSync('images.json', JSON.stringify(JSON_DATA));