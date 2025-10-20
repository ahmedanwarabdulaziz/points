#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Admin SDK Configuration
# Real credentials from Firebase service account

# Project ID
FIREBASE_PROJECT_ID=cadeala-cd61d

# Service Account Email
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@cadeala-cd61d.iam.gserviceaccount.com

# Private Key (properly formatted for environment variables)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDVsMdhucUcFSz\\nGwJSFCfbPwEqJf2DZIXtfxKFgdZbHXUQn7x/oERgVBsXU4KzVOgjPQmIEBX2Glko\\njq8kiBrUlXDDVqQYXtLy399DjOZsBFeikBWeeDEVhkbfE3tQPj0F2PL3Z9/UXFtW\\ntr5TXc+44XaWIwPDilX4TyxSrSSC1GtiJroa4m7I/kWxEJxGU37zQEDF+SsHKj2l\\nXlbsOgwvT4G9uyrbKHrgjpp8XygsHJaA/iYGosaD7hoynwXpf5iaH7Zvp7XaVB5A\\nMUJmve31RQGWEZooNhkZa7hh2NQUn5U+9pgXfQyjTOKR6hWsSUe8BhzsbJvMSbB2\\n6ICYjSV1AgMBAAECggEAIcSRobzUnRSnG7gvUEOSOUU8vQ3Is6pQuaPmLoSpquIe\\nftNySUjKETHw5fkmhrxGjfLq/yWyujLHV2rFDaZmpvm3ftkvMFRSGLDJPnrwyVr9\\n0Ekip5yk9ZDbFwyd3FsJ/wUISWsgRyx5ELYyFCTLOC1nq+AdMjQrlOuQ4LD0NxZW\\njnh7oUoFyrbb+MiS64YiTgxbUex2rvtkFjGkjXsK4Yh8IvpKNW+YgNH+IkYR3iG/\\nNRcEoFDJgSUiROUU/4Byn3RVVoMbGA07Zf5fpFJJeVJ4mpWSFg7M1PCIkS3jtUgS\\nh0dzYeKZBl0+w/Fz6AnpPsf4E0pDhjMjEPAuIa2euQKBgQDtdsNCrnbpgfDVQuiV\\nmSVDZOGAuIeS97lcH79ewXz1B9IIB849BwafcPtIT9dq8/S53cL/+o3mq/DDPUIt\\nCkWLXNtGOal8b9S8jKN0rOx86okoxf7NRjHKe85N7gQveMy6fgviA0pXPqXGtZrU\\n6dY3YzZ/2OjdyIZbPcQ5Yh5lSQKBgQDSljdcm1UQSm7R2H/gTj2edkXokS98YYgq\\nOsJ36DlbUIRS7jKidvGNmsHahphD46MT8LburbQ+u6rmE92R4L9ibJoiVgNuK1ms\\n0WRWEWc+Q/GCZEYC22jyvTJGY7WHxCVtC77GS6Zo4fjJQVmZkELqdbIT5Lcrjp6o\\nm5gd7qe6zQKBgQCleLCv8qriJK4RrcItHL6eq9mHvQ6cFwuPaoAMI4BTrtNozSel\\n1xOCX1R7G0fdO4o5SpLrlUj0iLQJGNLYV+QGLPqPgPbdw3/Ws5njX+ybT0OsqevY\\nVyWzF3q3SziXa/Idsl/NasWO7hTO1xXBcADaL8R2akw639TgF7Z41iqgIQKBgHIt\\n/Ip7tl2E3h1tc7hc89ANdM4qmkKoZznubi6xfRfjyjtk55NrRoFu3ZjszXZR4MQZ\\nCjbTfB1fh8QEFWjZISvukov3cxiy7IZlai+4c/AwyqvWTpeR+49RwgakXXLliR1c\\n9u1xayMHEuucQUagD4gslIdwxVgali/5XTstgUgpAoGBAJI6e1j8kNcKrQMZTSi0\\noSe+y8p8iW9UIfZcgrLTqBmpOw7nyABGK3hNFOFgQt0yN2Y6SrL8getLGQvhGGDk\\nr/sFHWw2A5piEmCr7++hH5mK195HVWWlmMknDzpn9HcL8ebMFxpud7mYcTpwjswj\\nVHxhvsGTMkzBS6jwQDnb0TKR\\n-----END PRIVATE KEY-----\\n"

# Security Note: Keep this file secure and never commit to version control
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file updated successfully with real Firebase credentials!');
  console.log('');
  console.log('🎉 Complete customer deletion is now enabled!');
  console.log('🗑️ Customers will be deleted from both Firestore and Firebase Auth');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Restart your development server (if running)');
  console.log('2. Test deleting a customer');
  console.log('3. Check Firebase Console > Authentication to verify user is deleted');
  console.log('');
  console.log('🔒 Security reminder: Never commit .env.local to version control!');
} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
}
