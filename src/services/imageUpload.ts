/**
 * Image Upload Service
 * Handles image uploads to ImgBB (simple and reliable)
 */

// ImgBB Configuration
const IMGBB_API_KEY = '9d2395e8d8d24e31ae31267920db33c0';

/**
 * Convert image to base64
 */
const imageToBase64 = async (imageUri: string): Promise<string> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload image to ImgBB
 * @param imageUri - Local file URI from expo-image-picker
 * @param imageName - Optional name for the image
 * @returns Promise<string> - Uploaded image URL
 */
export const uploadImage = async (imageUri: string, imageName?: string): Promise<string> => {
  try {
    console.log('📤 Starting image upload to ImgBB...');
    console.log('📤 Image URI:', imageUri);
    console.log('📤 Image name:', imageName || 'auto-generated');

    // Convert image to base64
    console.log('📤 Converting image to base64...');
    const base64Image = await imageToBase64(imageUri);
    console.log('📤 Base64 conversion complete');

    // Create form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Image);
    if (imageName) {
      formData.append('name', imageName);
    }

    console.log('📤 Uploading to ImgBB...');
    const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await uploadResponse.json();
    console.log('📤 ImgBB response status:', uploadResponse.status);
    console.log('📤 ImgBB response:', JSON.stringify(result, null, 2));

    if (result.success && result.data && result.data.url) {
      console.log('✅✅✅ IMAGE UPLOADED SUCCESSFULLY TO IMGBB! ✅✅✅');
      console.log('✅ Image URL:', result.data.url);
      console.log('✅ Display URL:', result.data.display_url);
      console.log('✅ Delete URL:', result.data.delete_url);
      console.log('✅ Image ID:', result.data.id);
      
      // Return the direct URL (works reliably)
      return result.data.url;
    } else {
      console.error('❌ ImgBB upload failed!');
      console.error('❌ Response status:', uploadResponse.status);
      console.error('❌ Full response:', result);
      throw new Error(result.error?.message || 'Upload failed');
    }
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Validate if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false;
  
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return validExtensions.some(ext => path.endsWith(ext)) || url.includes('imgbb.com') || url.includes('ibb.co') || url.includes('placeholder');
  } catch {
    return false;
  }
};

/**
 * Get placeholder image URL with text
 */
export const getPlaceholderUrl = (text: string, color: string = '274290'): string => {
  const cleanColor = color.replace('#', '');
  return `https://via.placeholder.com/150/${cleanColor}/FFFFFF?text=${encodeURIComponent(text)}`;
};

/**
 * Check if URL is an ImgBB uploaded image
 */
export const isImgBBUrl = (url: string): boolean => {
  return !!(url && (url.includes('imgbb.com') || url.includes('ibb.co')));
};

/**
 * Legacy function - kept for compatibility
 * @deprecated Use isImgBBUrl instead
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return false; // No longer using Cloudinary
};

/**
 * Track old image when business updates logo
 * Note: ImgBB doesn't support automatic deletion via API
 * Old images will remain on ImgBB but are no longer referenced
 */
export const trackOldImage = async (oldUrl: string, businessId: string): Promise<void> => {
  console.log('📝 Tracking old image for business:', businessId);
  console.log('📝 Old URL:', oldUrl);
  
  if (isImgBBUrl(oldUrl)) {
    console.log('ℹ️ Old image is from ImgBB');
    console.log('ℹ️ Note: ImgBB images cannot be deleted via API');
    console.log('ℹ️ Old image will remain on ImgBB but is no longer used in the app');
  } else if (isCloudinaryUrl(oldUrl)) {
    console.log('ℹ️ Old image is from Cloudinary (legacy)');
    console.log('ℹ️ No automatic deletion - please clean up Cloudinary manually if needed');
  } else {
    console.log('ℹ️ Old URL is not from an image hosting service:', oldUrl);
  }
  
  console.log('✅ Image tracking complete');
};

