import QRCode from &apos;qrcode';

export interface QRCodeOptions {
  businessId: string;
  classId: string;
  businessName: string;
  className: string;
  type: &apos;class&apos; | &apos;referral';
  expiry?: Date;
}

export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
  const { businessId, classId, businessName, className, type, expiry } = options;
  
  // Create the data object for the QR code
  const qrData = {
    businessId,
    classId,
    businessName,
    className,
    type,
    expiry: expiry?.toISOString(),
    timestamp: new Date().toISOString(),
  };

  // Convert to JSON string
  const qrString = JSON.stringify(qrData);
  
  // Generate QR code as data URL
  const qrCodeDataURL = await QRCode.toDataURL(qrString, {
    width: 300,
    margin: 2,
    color: {
      dark: &apos;#1e3a8a&apos;, // Navy blue
      light: &apos;#ffffff&apos;, // White
    },
    errorCorrectionLevel: &apos;M',
  });

  return qrCodeDataURL;
};

export const generateQRCodeWithLogo = async (
  options: QRCodeOptions,
  logoUrl?: string
): Promise<string> => {
  const { businessId, classId, businessName, className, type, expiry } = options;
  
  const qrData = {
    businessId,
    classId,
    businessName,
    className,
    type,
    expiry: expiry?.toISOString(),
    timestamp: new Date().toISOString(),
  };

  const qrString = JSON.stringify(qrData);
  
  // Generate QR code with logo
  const qrCodeDataURL = await QRCode.toDataURL(qrString, {
    width: 300,
    margin: 2,
    color: {
      dark: &apos;#1e3a8a&apos;,
      light: &apos;#ffffff&apos;,
    },
    errorCorrectionLevel: &apos;M',
  });

  // If logo is provided, we can overlay it on the QR code
  // This would require canvas manipulation
  return qrCodeDataURL;
};

export const parseQRCode = (qrString: string): QRCodeOptions | null => {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.businessId || !data.classId || !data.type) {
      return null;
    }

    // Check if QR code has expired
    if (data.expiry && new Date(data.expiry) < new Date()) {
      return null;
    }

    return data as QRCodeOptions;
  } catch (error) {
    console.error(&apos;Error parsing QR code:&apos;, error);
    return null;
  }
};

export const generateQRCodeForClass = async (
  businessId: string,
  classId: string,
  businessName: string,
  className: string,
  expiry?: Date
): Promise<string> => {
  return generateQRCode({
    businessId,
    classId,
    businessName,
    className,
    type: &apos;class&apos;,
    expiry,
  });
};

export const generateQRCodeForReferral = async (
  businessId: string,
  classId: string,
  businessName: string,
  className: string,
  expiry?: Date
): Promise<string> => {
  return generateQRCode({
    businessId,
    classId,
    businessName,
    className,
    type: &apos;referral&apos;,
    expiry,
  });
};
