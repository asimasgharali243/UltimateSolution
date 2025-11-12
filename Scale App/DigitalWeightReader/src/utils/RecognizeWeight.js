import TextRecognition from '@react-native-ml-kit/text-recognition';
import PhotoManipulator from 'react-native-photo-manipulator';

const RecognizeWeight = async (imageUri) => {
  try {
    console.log('🔍 Starting text recognition on:', imageUri);

    if (!imageUri || typeof imageUri !== 'string' || imageUri.trim() === '') {
      throw new Error('Invalid image URI');
    }

    // Run ML Kit OCR
    const result = await TextRecognition.recognize(imageUri);
    console.log('Raw OCR result:', result);

    if (!result.blocks || result.blocks.length === 0) {
      return { weight: 'Unknown', croppedUri: null };
    }

    // Filter numeric blocks
    const numericBlocks = result.blocks.filter(block => /[0-9]/.test(block.text));
    if (numericBlocks.length === 0) return { weight: 'Unknown', croppedUri: null };

    // Pick block with most digits
    const digitBlock = numericBlocks.reduce((prev, curr) =>
      (curr.text.replace(/[^0-9]/g, '').length > prev.text.replace(/[^0-9]/g, '').length ? curr : prev)
    );

    const weight = digitBlock.text.replace(/[^0-9.]/g, '');
    console.log('Filtered weight:', weight);

    const { frame } = digitBlock;
    console.log('Cropping frame:', frame);

    // Crop using PhotoManipulator
    const croppedUri = await PhotoManipulator.crop(imageUri, {
      x: frame.left,
      y: frame.top,
      width: frame.width,
      height: frame.height,
    });

    console.log('Cropped image URI:', croppedUri);

    return { weight, croppedUri };
  } catch (err) {
    console.error('❌ OCR Error:', err);
    return { weight: 'Unknown', croppedUri: null };
  }
};

export default RecognizeWeight;
