# SmartVest AI — Real Firebase Authentication Setup Guide

This guide explains how to configure and connect your real **Firebase Authentication** project with **SmartVest AI** for Google OAuth, GitHub OAuth, and Email/Password authentication.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and name it (e.g. `smartvest-ai-advisor`).
3. (Optional) Disable Google Analytics or enable it according to your preference, then click **"Create project"**.

---

## 2. Enable Authentication Providers

1. In your Firebase project dashboard, open the left sidebar and select **Build > Authentication**.
2. Click **"Get Started"**.
3. Open the **"Sign-in method"** tab and configure the following providers:

### A. Email / Password
- Click **Email/Password**.
- Toggle **Enable** to ON (leave "Email link (passwordless sign-in)" disabled).
- Click **Save**.

### B. Google OAuth
- Click **Google** in the provider list.
- Toggle **Enable** to ON.
- Set a **Project support email** (e.g. your Gmail address).
- Click **Save**.

### C. GitHub OAuth
- Click **GitHub** in the provider list.
- Toggle **Enable** to ON.
- Copy the **Authorization callback URL** provided by Firebase (e.g. `https://<project-id>.firebaseapp.com/__/auth/handler`).
- Open [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers) in a new tab:
  - Click **"New OAuth App"**.
  - Application name: `SmartVest AI Advisory`.
  - Homepage URL: `http://localhost:5173/`.
  - Authorization callback URL: Paste the callback URL copied from Firebase.
  - Click **"Register application"**.
  - Copy the **Client ID** and generate a **Client Secret**.
- Return to the Firebase Console, paste your GitHub **Client ID** and **Client Secret**, and click **Save**.

---

## 3. Configure Authorized Domains

1. In **Authentication > Settings > Authorized domains**, ensure the following domains are listed:
   - `localhost`
   - `127.0.0.1`
   - `<your-production-domain.com>` (when deploying live)

---

## 4. Get Firebase Web App Credentials

1. Go to **Project Settings** (gear icon in top left next to Project Overview).
2. Under **"Your apps"**, click the **Web icon (`</>`)**.
3. Register app with nickname `SmartVest Web`.
4. Copy your Firebase SDK configuration object.

---

## 5. Add Credentials to Frontend Environment File

Create or update `frontend/.env` with your real keys:

```env
# SmartVest AI - Firebase Authentication Config
VITE_FIREBASE_API_KEY=AIzaSyYourActualApiKeyFromFirebaseConsole
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 6. How the Authentication Lifecycle Works

1. **Popup OAuth**:
   - `loginWithGoogle()` triggers `signInWithPopup(auth, googleProvider)`.
   - `loginWithGitHub()` triggers `signInWithPopup(auth, githubProvider)`.
2. **Session Persistence**:
   - Handled reactively by `onAuthStateChanged(auth, callback)` in [useFintechStore.ts](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/store/useFintechStore.ts).
   - Session tokens and profile parameters persist safely in localStorage under `smartvest_user_${uid}`.
3. **Smart Routing**:
   - **New Users**: When an account has `onboardingCompleted === false`, they are immediately directed to the **7-Step Institutional Onboarding Wizard**.
   - **Returning Users**: Automatically directed to their personalized **Dashboard**.
4. **Logout**:
   - `logout()` executes `signOut(auth)` and clears all cached state.

---

## 7. Build and Run

```bash
# In the frontend directory
cd frontend
npm install
npm run build
npm run dev
```

Visit `http://localhost:5173/` in your browser.
