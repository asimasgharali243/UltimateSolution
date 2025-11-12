import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

/**
 * Generates a unique filename using a generic base name ('file') and the current timestamp.
 * e.g., 'file_20251019_092349.jpg'
 * @returns {string} The unique, timestamped filename.
 */
const generateUniqueFilename = () => {
  // 1. Get the current date and time
  const now = new Date();

  // 2. Format the date/time (YYYYMMDD_HHmmss)
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    '_' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  // 3. Define a generic name and extension
  const baseName = 'file';
  const extension = 'jpg'; // Using 'jpg' as a common default for images

  // 4. Combine base name, timestamp, and extension
  return `${baseName}_${timestamp}.${extension}`;
};


/**
 * Saves a file to Downloads (Android) or Documents (iOS) folder using a dynamic,
 * timestamped filename (e.g., 'file_20251019_092349.jpg').
 *
 * @param {string} imageUri - Source image URI (e.g., 'file:///data/.../temp.png').
 * @returns {Promise<string | null>} - Destination path if saved, null otherwise.
 */
const saveImageToDownloads = async (imageUri) => { // Removed the 'filename' parameter
  try {
    if (!imageUri) {
      console.warn('No image URI provided');
      return null;
    }

    // ⭐ GENERATE THE FULLY AUTOMATIC DYNAMIC FILENAME HERE
    const dynamicFilename = generateUniqueFilename();

    // Remove file:// prefix if present
    const sourcePath = imageUri.startsWith('file://') ? imageUri.replace('file://', '') : imageUri;

    // Check if source file exists
    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      console.warn('Source image does not exist:', sourcePath);
      return null;
    }

    // Determine destination path using the dynamic name
    const destPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${dynamicFilename}`
        : `${RNFS.DocumentDirectoryPath}/${dynamicFilename}`;

    // Copy file
    await RNFS.copyFile(sourcePath, destPath);
    console.log(`✅ File saved to: ${destPath}`);
    return destPath;

  } catch (err) {
    console.error('❌ Error saving file:', err);
    return null;
  }
};

export default saveImageToDownloads;