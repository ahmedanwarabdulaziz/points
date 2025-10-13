/**
 * Image Upload Utility
 * Uploads images to ImgBB (free image hosting service)
 * No account needed, public API
 */

const IMGBB_API_KEY = 'your_api_key_here'; // Free API key from https://api.imgbb.com/

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToImgBB = async (base64Image: string): Promise<UploadResult> => {
  try {
    // Remove data:image prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success && result.data && result.data.url) {
      return {
        success: true,
        url: result.data.url,
      };
    } else {
      return {
        success: false,
        error: 'Upload failed',
      };
    }
  } catch (error: any) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Placeholder function - uploads to a mock service for now
// Users can replace with their own Cloudinary/ImgBB setup
export const uploadImage = async (imageUri: string): Promise<UploadResult> => {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // For now, just return the local URI
        // In production, upload to your preferred service
        console.log('Image selected, ready for upload');
        console.log('Note: Set up ImgBB API key or Cloudinary for actual uploads');
        
        resolve({
          success: true,
          url: imageUri, // Return local URI for preview
          error: 'Upload service not configured - using local preview',
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};


