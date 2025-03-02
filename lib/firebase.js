const config = require("../config");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const { FIREBASE_CONFIG } = require("../config");

// Initialize Firebase Admin once
admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CONFIG),
  databaseURL: `https://${FIREBASE_CONFIG.projectId}.firebaseio.com`, // Use the project ID from config
});

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },
  provider: { type: String, default: "google" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

// Handle Google Login with Firebase ID Token
const handleGoogleLogin = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken); // Use admin.auth() to verify the token
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, name, picture });
      await user.save();
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = { admin, User, handleGoogleLogin };
