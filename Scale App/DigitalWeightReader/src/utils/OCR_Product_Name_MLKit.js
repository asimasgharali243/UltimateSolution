// src/utils/OCR_Product_Name_MLKit.js
import TextRecognition from '@react-native-ml-kit/text-recognition';

const OCR_Product_Name = async (imageUri) => {
  try {
    console.log('🔍 Recognizing text from image:', imageUri);

    const result = await TextRecognition.recognize(imageUri);

    // result.text contains full recognized text
    console.log('Full text:', result.text);

    // Optional: log blocks & lines
    result.blocks.forEach((block, i) => {
      console.log(`Block ${i}:`, block.text);
      block.lines.forEach((line, j) => {
        console.log(`Line ${j}:`, line.text);
      });
    });

    // Return full recognized text
    return result.text;
  } catch (err) {
    console.error('Error recognizing text:', err);
    return '';
  }
};

export default OCR_Product_Name;
