import RNFS from 'react-native-fs';

const IMAGEKIT_PUBLIC_KEY = 'public_OIxm8AO3RryqTX6rTbk3MW5xClo='; // ✅ your actual ImageKit public key
const SERVER_URL = 'http://192.168.0.115:5172/api/imagekit/get-signature'; // ✅ your .NET backend endpoint

// Function to get signature from your backend
const getSignatureFromServer = async () => {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Failed to get signature from server');

    const data = await response.json();
    // Your backend should return { signature, expire, token }
    return data;
  } catch (error) {
    console.error('❌ Error fetching signature:', error);
    throw error;
  }
};

// Function to upload file to ImageKit
const uploadToImageKit = async (fileUri) => {
  try {
    // Step 1: Get signature details from backend
    const { signature, expire, token } = await getSignatureFromServer();
console.log('Signature data:', { signature, expire, token });
    // Step 2: Convert image file to Base64
    const base64 = await RNFS.readFile(fileUri, 'base64');

    // Step 3: Prepare FormData
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('fileName', `weight_image_${Date.now()}.jpg`);
    formData.append('token', token);
    formData.append('expire', expire);
    formData.append('signature', signature);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);

    // Step 4: Upload to ImageKit
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ImageKit upload failed: ${errorText}`);
    }

    // Step 5: Parse result
    const result = await response.json();
    console.log('✅ Uploaded URL:', result.url);

    return result.url;l
  } catch (error) {
    console.error('❌ Upload to ImageKit failed:', error);
    throw error;
  }
};

export default uploadToImageKit;
