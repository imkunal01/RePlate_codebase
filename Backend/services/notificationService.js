const admin = require('firebase-admin');

/**
 * Firebase Admin SDK initialization
 * The service account credentials should be stored in the environment variables
 * or as a JSON file referenced by GOOGLE_APPLICATION_CREDENTIALS
 */
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    // Check if firebase-admin is already initialized
    if (admin.apps.length === 0) {
      // In production, use a service account JSON file or environment variables
      // For development, we check if FIREBASE_SERVICE_ACCOUNT_JSON is set
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Use application default credentials (for GCP / local with gcloud CLI)
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      }
    }
    firebaseInitialized = true;
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error.message);
    // App still works without notifications
  }
};

/**
 * Send a push notification to a single device
 * @param {string} fcmToken - The recipient's FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 */
const sendNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.warn('sendNotification: No FCM token provided, skipping');
    return null;
  }

  try {
    initializeFirebase();

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: { ...data }, // All values must be strings in FCM data payloads
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log(`Notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    console.error(`Failed to send notification: ${error.message}`);
    return null;
  }
};

/**
 * Send notifications to multiple devices at once
 * @param {string[]} fcmTokens - Array of FCM device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 */
const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
  if (!fcmTokens || fcmTokens.length === 0) {
    console.warn('sendMulticastNotification: No FCM tokens provided, skipping');
    return null;
  }

  // Filter out empty/null tokens
  const validTokens = fcmTokens.filter(Boolean);
  if (validTokens.length === 0) return null;

  try {
    initializeFirebase();

    const message = {
      tokens: validTokens,
      notification: { title, body },
      data: { ...data },
      android: {
        priority: 'high',
        notification: { sound: 'default' }
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 }
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(
      `Multicast notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`
    );
    return response;
  } catch (error) {
    console.error(`Failed to send multicast notification: ${error.message}`);
    return null;
  }
};

// ─── Pre-built notification templates ──────────────────────────────────────

/**
 * Notify nearby NGOs when a new food donation is posted
 * @param {Object[]} recipients - Array of user objects with fcmToken
 * @param {Object} foodPost - The food post object
 */
const notifyNewDonation = async (recipients, foodPost) => {
  const tokens = recipients.map((r) => r.fcmToken).filter(Boolean);
  if (tokens.length === 0) return;

  return sendMulticastNotification(
    tokens,
    '🍽️ New Food Available Nearby!',
    `${foodPost.name} (${foodPost.quantity.amount} ${foodPost.quantity.unit}) available near you. Expires soon!`,
    {
      type: 'NEW_DONATION',
      foodId: foodPost._id.toString(),
      foodName: foodPost.name
    }
  );
};

/**
 * Notify the donor when their donation has been claimed
 * @param {string} donorFcmToken - Donor's FCM token
 * @param {Object} foodPost - The food post object
 * @param {Object} recipient - The recipient user object
 */
const notifyDonationClaimed = async (donorFcmToken, foodPost, recipient) => {
  return sendNotification(
    donorFcmToken,
    '✅ Your Donation Has Been Claimed!',
    `${recipient.name || recipient.email} will pick up your "${foodPost.name}" donation. Please keep it ready!`,
    {
      type: 'DONATION_CLAIMED',
      foodId: foodPost._id.toString(),
      foodName: foodPost.name,
      recipientName: recipient.name || ''
    }
  );
};

/**
 * Notify both parties when a donation is completed
 * @param {string} donorFcmToken - Donor's FCM token
 * @param {string} recipientFcmToken - Recipient's FCM token
 * @param {Object} foodPost - The food post object
 */
const notifyDonationCompleted = async (donorFcmToken, recipientFcmToken, foodPost) => {
  const promises = [];

  if (donorFcmToken) {
    promises.push(
      sendNotification(
        donorFcmToken,
        '🎉 Donation Completed!',
        `Your "${foodPost.name}" donation has been successfully collected. Thank you for fighting food waste!`,
        { type: 'DONATION_COMPLETED', foodId: foodPost._id.toString() }
      )
    );
  }

  if (recipientFcmToken) {
    promises.push(
      sendNotification(
        recipientFcmToken,
        '🎉 Pickup Confirmed!',
        `"${foodPost.name}" has been marked as collected. Thank you for rescuing this food!`,
        { type: 'DONATION_COMPLETED', foodId: foodPost._id.toString() }
      )
    );
  }

  return Promise.all(promises);
};

/**
 * Notify an NGO when their verification status changes
 * @param {string} fcmToken - NGO user's FCM token
 * @param {boolean} isApproved - Whether they were approved or rejected
 */
const notifyVerificationUpdate = async (fcmToken, isApproved) => {
  return sendNotification(
    fcmToken,
    isApproved ? '✅ NGO Verification Approved!' : '❌ NGO Verification Update',
    isApproved
      ? 'Congratulations! Your organization has been verified on RePlate. You can now claim food donations.'
      : 'Your NGO verification requires additional information. Please update your profile.',
    { type: 'VERIFICATION_UPDATE', approved: isApproved ? 'true' : 'false' }
  );
};

module.exports = {
  sendNotification,
  sendMulticastNotification,
  notifyNewDonation,
  notifyDonationClaimed,
  notifyDonationCompleted,
  notifyVerificationUpdate
};
