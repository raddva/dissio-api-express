import * as admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";
let dbInstance: admin.firestore.Firestore;

const connect = async (): Promise<string> => {
  try {
    if (admin.apps.length > 0) {
      dbInstance = admin.firestore();
      return Promise.resolve("Database already initialized.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    dbInstance = admin.firestore();

    console.log("Firebase Admin SDK initialized.");
    return Promise.resolve("Database connected successfully");
  } catch (error) {
    let errorMessage = "Database connection failed";
    if (error instanceof Error) {
      errorMessage += ": " + error.message;
    }
    return Promise.reject(errorMessage);
  }
};

export const getDb = (): admin.firestore.Firestore => {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connect() first.");
  }
  return dbInstance;
};

export default connect;
