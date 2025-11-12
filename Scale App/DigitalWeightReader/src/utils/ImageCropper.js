// src/utils/ImageCropper.js
import PhotoManipulator from 'react-native-photo-manipulator';
import { Image as RNImage } from 'react-native';
import RNFS from 'react-native-fs';
/**
 * Crops the captured image into product name and weight regions
 * using full width and 30% of height for each crop
 */
const ImageCropper = async (imageUri) => {
  try {
    console.log('Cropping image:', imageUri);

    // Get image dimensions dynamically
    const { width: imageWidth, height: imageHeight } = await new Promise((resolve, reject) => {
      RNImage.getSize(imageUri, (width, height) => resolve({ width, height }), reject);
    });
 // Paths setup
    const timestamp = Date.now();
    const dirPath = `${RNFS.DocumentDirectoryPath}/ocr_images`;

    // Ensure folder exists
    const exists = await RNFS.exists(dirPath);
    if (!exists) await RNFS.mkdir(dirPath);

    // Filenames
    const productFile = `${dirPath}/product_name_${timestamp}.jpg`;
    const weightFile = `${dirPath}/weight_${timestamp}.jpg`;




console.log('Image dimensions:', imageWidth, imageHeight);

    // Crop top 30% for product name
    const product_name_image = await PhotoManipulator.crop(imageUri, {
      x: 0,
      y: 0,
      width: imageWidth,
      height: Math.round(imageHeight * 0.3),
    });

 const { width: product_imageWidth, height: product_imageHeight } = await new Promise((resolve, reject) => {
      RNImage.getSize(product_name_image, (width, height) => resolve({ width, height }), reject);
    });

    console.log('Product Name Image dimensions:', product_imageWidth, product_imageHeight);
    // Crop next 30% for weight (or bottom 30% if you prefer)
  const weight_image = await PhotoManipulator.crop(imageUri, {
  x: 0,
  y: Math.round(imageHeight * 0.3),
  width: imageWidth - imageWidth / 7,
  height: Math.round(imageHeight * 0.3),
}, {
  width:320, 
  height:240,
  format: 'webp',   
  quality: 0.5,     
});


 // Save both crops locally
    // await RNFS.copyFile(product_name_image, productFile);
    // await RNFS.copyFile(weight_image, weightFile);

    console.log('✅ Cropped and saved:');
    console.log('📦 Product:', productFile);
    console.log('⚖️ Weight:', weightFile);



return { product_name_image, weight_image: weight_image };

  } catch (error) {
    console.error("Image cropping error:", error);
    // Return original image as fallback
    return { product_name_image: imageUri, weight_image: imageUri };
  }
};

export default ImageCropper;
