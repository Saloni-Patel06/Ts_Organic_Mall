# Fix Duplicate Verify OTP - Progress Tracker

## Plan Steps:
- [x] Step 1: Update backend/controllers/authController.js (fix register to use consistent `otp`/`otpExpires`, enhance verifyOTP with expiry)
- [x] Step 2: Update frontend/src/pages/VerifyOtp.jsx (send `{email, otp}` from localStorage)
- [x] Step 3: Update frontend/src/pages/Register.jsx (remove premature localStorage login, use returned user ID)
- [x] Step 4: Update backend/server.js (remove verifyOtpRoutes import/use)
- [x] Step 5: Update backend/routes/authRoutes.js (confirm /verify-otp route)
- [x] Step 6: Delete duplicate files: backend/controllers/verifyotpController.js, backend/routes/verifyotpRoutes.js
- [ ] Step 7: Test full flow + restart backend

Current progress: Steps 1-6 complete. Ready for testing.
