import React, { createContext, useState, useEffect, useCallback } from 'react';

// --- Embedded Translations ---
const enTranslations = {
    "header.brand": "Masmoo",
    "header.welcome": "Welcome, {{name}}",
    "header.dashboard": "Dashboard",
    "header.profile": "Profile",
    "header.logout": "Logout",
    "header.home": "Home",
    "header.features": "Features",
    "header.pricing": "Pricing",
    "header.loginOrSignUp": "Login / Sign Up",
    "header.language": "Language",
    "header.textCheck": "Text Check",
    "authModal.login": "Login",
    "authModal.signUp": "Sign Up",
    "sidebar.dashboard": "Dashboard",
    "sidebar.textCheck": "Text Check",
    "sidebar.textToSpeech": "Text-to-Speech",
    "sidebar.dictionary": "Dictionary",
    "sidebar.settings": "Settings",
    "sidebar.subscription": "Subscription",
    "experimental.uploadKeys": "Upload Keys File",
    "footer.copyright": "Masmoo. All rights reserved.",
    "form.name": "Name",
    "form.email": "Email Address",
    "form.password": "Password",
    "form.currentPassword": "Current Password",
    "form.newPassword": "New Password (optional)",
    "form.rememberMe": "Remember me",
    "login.title": "Sign in to your account",
    "login.signingIn": "Signing In...",
    "login.signInButton": "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.signUpLink": "Sign up",
    "login.forgotPassword": "Forgot password?",
    "login.branding.title": "Welcome Back to Masmoo",
    "login.branding.subtitle": "Perfect your Arabic texts and transform them into masterfully audible content.",
    "login.success": "Login successful.",
    "login.invalidCredentials": "Invalid email or password.",
    "login.emailNotConfirmed": "Please confirm your email address before logging in. Check your inbox for the confirmation link.",
    "signup.title": "Create your new account",
    "signup.creatingAccount": "Creating Account...",
    "signup.signUpButton": "Create Account",
    "signup.hasAccount": "Already have an account?",
    "signup.loginLink": "Login",
    "signup.branding.title": "Join Masmoo Today",
    "signup.branding.subtitle": "Join us to transform your written words into perfectly prepared audio content.",
    "signup.success": "Registration successful! Please check your email for a confirmation link.",
    "signup.emailExists": "An account with this email already exists.",
    "signup.error.weakPassword": "Password is too weak. It should be at least 6 characters long.",
    "dashboard.welcome": "Welcome back, {{name}}!",
    "dashboard.subtitle": "Here's your personal activity snapshot.",
    "dashboard.statCards.checksThisMonth": "Checks This Month",
    "dashboard.statCards.totalCorrections": "Total Corrections",
    "dashboard.statCards.dictionaryWords": "Dictionary Words",
    "dashboard.statCards.currentPlan": "Current Plan",
    "dashboard.usageChart.title": "Tool Usage (Last 7 Days)",
    "dashboard.recentActivity.title": "Recent Activity",
    "dashboard.recentActivity.empty": "No recent activity to show. Try using the Text Check tool!",
    "dashboard.userManagement.title": "User Management",
    "dashboard.userManagement.subtitle": "Manage user roles and permissions.",
    "activity.textAnalysis.step1": "Spelling & Cleanup: {{count}} corrections made.",
    "activity.textAnalysis.step2": "Diacritics: {{count}} words vocalized.",
    "activity.textAnalysis.step3": "Dictionary: {{count}} words replaced.",
    "activity.textAnalysis.unknown": "Text analysis performed.",
    "home.hero.title": "Make Your Words Heard, Perfectly.",
    "home.hero.subtitle": "Masmoo transforms your written scripts, articles, or speeches into perfectly prepared content, ready for flawless audio performance.",
    "home.hero.cta": "Get Started for Free",
    "home.features.title": "An All-in-One Platform",
    "home.features.subtitle": "Everything you need to analyze and perfect your text, efficiently and effectively.",
    "home.features.card1.title": "Perfect Pronunciation",
    "home.features.card1.description": "From precise diacritics on complex words to grammatical perfection, we prepare your text for an impeccable audio delivery.",
    "home.features.card2.title": "Secure & Reliable",
    "home.features.card2.description": "Your data is safe with us. We use industry-standard security protocols to protect your information around the clock.",
    "home.features.card3.title": "Customizable Engine",
    "home.features.card3.description": "Use your own custom dictionary and choose from different AI models to tailor the analysis to your needs.",
    "home.testimonials.title": "Trusted by Creators",
    "home.testimonials.subtitle": "Hear what podcasters, educators, and creators are saying about Masmoo.",
    "home.testimonials.card1.quote": "Masmoo has revolutionized how we process our content. The accuracy is invaluable, and the interface is incredibly user-friendly.",
    "home.testimonials.card1.role": "Editor, Digital Publications",
    "home.testimonials.card2.quote": "The ability to use a custom dictionary and correct diacritics in real-time has given us a significant competitive edge. Highly recommended!",
    "home.testimonials.card2.role": "Content Strategist, Creative Solutions",
    "home.pricing.title": "Choose Your Plan",
    "home.pricing.subtitle": "Start with our generous free plan or upgrade for more power and features.",
    "home.pricing.cta": "Sign Up Now",
    "home.cta.title": "Ready to Have Your Voice Heard?",
    "home.cta.subtitle": "Join thousands of users already using Masmoo to achieve their goals. Sign up in minutes.",
    "home.cta.button": "Sign Up Now",
    "notFound.title": "Page Not Found",
    "notFound.message": "Sorry, the page you are looking for does not exist.",
    "notFound.goHome": "Go Home",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "profile.title": "My Profile",
    "profile.subtitle": "Manage your personal information and password.",
    "profile.updateButton": "Update Profile",
    "profile.updating": "Updating...",
    "profile.updateSuccess": "Profile updated successfully!",
    "profile.invalidPassword": "The current password you entered is incorrect.",
    "profile.emailExists": "This email is already in use by another account.",
    "profile.userNotFound": "Could not find user data.",
    "forgotPassword.title": "Forgot Password",
    "forgotPassword.subtitle": "Enter your email address and we'll send you a link to reset your password.",
    "forgotPassword.sendButton": "Send Reset Link",
    "forgotPassword.sending": "Sending...",
    "forgotPassword.emailSent": "If an account with that email exists, a password reset link has been sent.",
    "forgotPassword.backToLogin": "Back to login",
    "userManagement.table.name": "Name",
    "userManagement.table.email": "Email",
    "userManagement.table.role": "Role",
    "userManagement.table.actions": "Actions",
    "userManagement.role.admin": "Admin",
    "userManagement.role.moderator": "Moderator",
    "userManagement.role.member": "Member",
    "userManagement.update": "Update",
    "userManagement.delete": "Delete",
    "userManagement.deleteConfirm": "Are you sure you want to delete this user? This action cannot be undone.",
    "userManagement.updateSuccess": "User role updated successfully.",
    "userManagement.deleteSuccess": "User deleted successfully.",
    "userManagement.error.fetch": "Failed to fetch users.",
    "userManagement.error.update": "Failed to update user role.",
    "userManagement.error.delete": "Failed to delete user.",
    "userManagement.error.cannotDeleteSelf": "You cannot delete your own account.",
    "userManagement.error.cannotChangeSelf": "You cannot change your own role.",
    "auth.unauthorized": "You are not authorized to perform this action.",
    "textCheck.title": "Text Analysis Tool",
    "textCheck.subtitle": "Improve your text through a 3-step process powered by AI.",
    "textCheck.step1.title": "1. Spelling & Cleanup",
    "textCheck.step2.title": "2. Diacritics Correction",
    "textCheck.step3.title": "3. Dictionary Replacement",
    "textCheck.step1.description": "The AI will correct spelling, remove symbols, and convert numbers to words.",
    "textCheck.step2.description": "The AI will add diacritics to words that might be mispronounced.",
    "textCheck.step3.description": "The final step replaces words based on your custom dictionary.",
    "textCheck.inputText": "Input Text",
    "textCheck.outputText": "Output Text",
    "textCheck.button.process": "Process Text",
    "textCheck.button.processing": "Processing...",
    "textCheck.button.nextStep": "Next Step",
    "textCheck.button.previousStep": "Previous Step",
    "textCheck.button.startOver": "Start Over",
    "textCheck.error": "An error occurred during analysis. Please try again.",
    "textCheck.error.noApiKey": "API key for the selected model is not configured. Please add it in the settings.",
    "textCheck.finalResult": "Final Result",
    "textCheck.stats": "{{count}} changes made",
    "textCheck.noCorrections": "No changes were needed in this step.",
    "textCheck.step3.noMatches": "No words from your dictionary were found in the text.",
    "textCheck.copySuccess": "Text copied to clipboard!",
    "textCheck.button.copy": "Copy Text",
    "textCheck.button.download": "Download .txt",
    "textCheck.button.upload": "Upload .txt file",
    "textCheck.error.fileRead": "Failed to read the file.",
    "textCheck.error.fileType": "Please upload a valid .txt file.",
    "textCheck.button.tts": "Convert to Speech",
    "dictionary.title": "Custom Dictionary",
    "dictionary.subtitle": "Manage the words that will be automatically replaced in the final step of the text check.",
    "dictionary.add.title": "Add New Word",
    "dictionary.add.original": "Original Word",
    "dictionary.add.replacement": "Replacement Word",
    "dictionary.add.button": "Add Word",
    "dictionary.import.title": "Import from File",
    "dictionary.import.description": "Upload a .txt or .csv file. Each line should contain 'original,replacement'.",
    "dictionary.import.button": "Import Words",
    "dictionary.import.processing": "Importing...",
    "dictionary.import.success": "{{count}} words imported successfully.",
    "dictionary.import.error": "Failed to read or parse the file.",
    "dictionary.table.original": "Original",
    "dictionary.table.replacement": "Replacement",
    "dictionary.table.actions": "Actions",
    "dictionary.delete": "Delete",
    "dictionary.edit": "Edit",
    "dictionary.save": "Save",
    "dictionary.empty": "Your dictionary is empty. Add a word to get started.",
    "dictionary.error.alreadyExists": "This word already exists in your dictionary.",
    "settings.title": "Settings",
    "settings.subtitle": "Manage application and administrative settings.",
    "settings.save.button": "Save Changes",
    "settings.save.saving": "Saving...",
    "settings.save.success": "Settings saved successfully!",
    "settings.tabs.general": "General",
    "settings.tabs.users": "User Management",
    "settings.tabs.plans": "Plan Management",
    "settings.tabs.payment": "Payment Gateways",
    "settings.textAnalysis.title": "Text Analysis Models",
    "settings.textAnalysis.description": "Choose the AI model and provide the API key for the text analysis tool.",
    "settings.textAnalysis.model": "AI Model",
    "settings.apiKey.label": "{{modelName}} API Key",
    "settings.apiKey.placeholder": "Enter your API key here",
    "settings.apiKey.testButton": "Test",
    "settings.apiKey.test.testing": "Testing...",
    "settings.apiKey.test.success": "Key is valid and working.",
    "settings.apiKey.test.error": "Key is invalid or failed to connect.",
    "settings.payment.title": "Payment Gateways",
    "settings.payment.description": "Configure your payment provider credentials.",
    "settings.payment.paypal.clientId": "PayPal Client ID",
    "settings.payment.paypal.clientSecret": "PayPal Client Secret",
    "quickAccess.title": "Quick Access",
    "tts.title": "Text-to-Speech Converter",
    "tts.subtitle": "Convert your text into high-quality audio, segment by segment.",
    "tts.upload.cta": "Upload a file",
    "tts.upload.dragDrop": "or drag and drop",
    "tts.upload.description": ".TXT up to 5MB",
    "tts.inputText": "Enter Text",
    "tts.inputText.placeholder": "Type or paste your text here...",
    "tts.apiKeyManagement.title": "API Key Management",
    "tts.apiKeyManagement.enterNew": "Enter new API key here...",
    "tts.apiKeyManagement.add": "Add",
    "tts.apiKeyManagement.checkAll": "Check All Keys",
    "tts.apiKeyManagement.checking": "Checking...",
    "tts.apiKeyManagement.uploadKeys": "Upload Keys",
    "tts.apiKeyManagement.deleteSelected": "Delete Selected ({{count}})",
    "tts.apiKeyManagement.deleteAll": "Delete All",
    "tts.apiKeyManagement.table.select": "Select",
    "tts.apiKeyManagement.table.key": "Key",
    "tts.apiKeyManagement.table.balance": "Balance",
    "tts.apiKeyManagement.table.status": "Status",
    "tts.apiKeyManagement.status.active": "Active",
    "tts.apiKeyManagement.status.inactive": "Inactive",
    "tts.apiKeyManagement.status.error": "Error",
    "tts.apiKeyManagement.toast.enterKey": "Please enter an API key",
    "tts.apiKeyManagement.toast.keyExists": "This key already exists!",
    "tts.apiKeyManagement.toast.selectKeyToDelete": "Please select at least one key to delete",
    "tts.apiKeyManagement.toast.confirmDeleteAll": "Are you sure you want to delete all keys? This action cannot be undone.",
    "tts.apiKeyManagement.log.keyAdded": "Key added: {{key}}...",
    "tts.apiKeyManagement.log.keysDeleted": "{{count}} keys deleted.",
    "tts.apiKeyManagement.log.allKeysDeleted": "All keys have been deleted.",
    "tts.apiKeyManagement.log.checkingBalances": "Checking key balances...",
    "tts.apiKeyManagement.log.validKey": "✅ Valid key {{key}}...: {{balance}} characters remaining",
    "tts.apiKeyManagement.log.balanceCheckFailed": "❌ Balance check failed: {{error}}",
    "tts.apiKeyManagement.log.keysUploaded": "{{count}} new keys uploaded",
    "tts.apiKeyManagement.toast.noNewKeys": "No new keys found in the file",
    "tts.apiKeyManagement.toast.noKeysToCheck": "No API keys to check",
    "tts.controls.title": "Conversion Controls",
    "tts.controls.start": "Start",
    "tts.controls.stop": "Stop",
    "tts.controls.placeholder": "Or paste full text here...",
    "tts.statsAndSettings.title": "Chunking Settings & Stats",
    "tts.statsAndSettings.totalChars": "Total Chars",
    "tts.statsAndSettings.chunkCount": "Chunk Count",
    "tts.statsAndSettings.totalKeys": "Total Keys",
    "tts.statsAndSettings.totalBalance": "Total Balance",
    "tts.statsAndSettings.chunkMin": "Min Chunk Size",
    "tts.statsAndSettings.chunkMax": "Max Chunk Size",
    "tts.statsAndSettings.startFrom": "Start From",
    "tts.advancedAudio.title": "Advanced Audio Settings",
    "tts.advancedAudio.resetDefaults": "Reset Defaults",
    "tts.advancedAudio.saveSettings": "Save Settings",
    "tts.advancedAudio.speed": "Speed",
    "tts.advancedAudio.speed.unavailable": "Speed control is only available for the v3 model.",
    "tts.toast.settingsSaved": "Settings saved successfully",
    "tts.toast.defaultsRestored": "Audio defaults restored",
    "tts.progress.title": "Process Progress",
    "tts.progress.currentChunk": "Current Chunk: {{current}} / {{total}}",
    "tts.convertedChunks.title": "Converted Chunks",
    "tts.convertedChunks.selectAll": "Select All",
    "tts.convertedChunks.mergeAndDownload": "Merge & Download ({{count}})",
    "tts.convertedChunks.merging": "Merging...",
    "tts.convertedChunks.chunk": "Chunk #{{id}}",
    "tts.convertedChunks.retry": "Retry",
    "tts.convertedChunks.download": "Download",
    "tts.convertedChunks.placeholder": "Chunks will appear here after conversion.",
    "tts.toast.selectToMerge": "Please select at least one chunk to merge",
    "tts.logs.title": "Operation Log",
    "tts.logs.copy": "Copy",
    "tts.logs.export": "Export",
    "tts.logs.clear": "Clear",
    "tts.toast.logCopied": "Log copied to clipboard",
    "tts.general.toast.selectTextFirst": "Please select or enter text first",
    "tts.general.toast.addKeyFirst": "Please add at least one API key",
    "tts.general.log.apiFormatUpdate": "Automatically updating API key format.",
    "tts.general.log.textSelected": "Text file selected: {{name}}",
    "tts.general.log.noValidKeys": "⚠️ No valid API keys with remaining balance available.",
    "tts.general.log.tryingKey": "🔑 Trying key {{key}}... (Balance: {{balance}})",
    "tts.general.log.apiFail": "❌ API Fail: {{error}}",
    "tts.general.log.keyMarkedInvalid": "🔑 Key {{key}}... marked as invalid for this session.",
    "tts.general.log.networkError": "❌ Network Error: {{error}}",
    "tts.general.log.convertingChunk": "\nConverting chunk {{current}} of {{total}}...",
    "tts.general.log.chunkSuccess": "✅ Chunk {{id}} converted successfully",
    "tts.general.log.chunkFail": "❌ Failed to convert chunk {{id}}",
    "tts.general.log.conversionComplete": "\nConversion complete. Success: {{success}} | Fail: {{fail}}",
    "tts.general.log.retryingChunk": "\nRetrying chunk {{id}}...",
    "tts.general.log.retrySuccess": "✅ Retry for chunk {{id}} successful",
    "tts.general.log.retryFail": "❌ Retry for chunk {{id}} failed",
    "tts.general.log.mergeStart": "🚀 Starting chunk merge process...",
    "tts.general.log.mergeSuccess": "✅ File merged and downloaded successfully!",
    "tts.general.log.mergeFail": "❌ Merge process failed: {{error}}",
    "tts.general.log.conversionStopped": "Conversion stopped by user.",
    "tts.general.log.logCopiedFail": "❌ Copy failed: {{error}}",
    "tts.general.log.logExported": "📁 Log exported.",
    "tts.general.log.logCleared": "🗑️ Log cleared.",
    "tts.general.log.textLoadedFromCheck": "✅ Text loaded successfully from the Text Check tool.",
    "tts.settings.voice": "Voice",
    "tts.settings.model": "Model",
    "tts.settings.outputFormat": "Output Format",
    "tts.voiceTuning.title": "Voice Fine-tuning (ElevenLabs API)",
    "tts.voiceTuning.stability": "Voice Stability",
    "tts.voiceTuning.stability.description": "Increasing stability makes the voice more consistent but can sound more robotic. (Default: 0.75)",
    "tts.voiceTuning.similarityBoost": "Similarity Boost",
    "tts.voiceTuning.similarityBoost.description": "High values make the voice more similar to the original but can introduce artifacts. (Default: 0.75)",
    "tts.voiceTuning.styleExaggeration": "Style Exaggeration",
    "tts.voiceTuning.styleExaggeration.description": "Higher values are recommended unless you are trying to reproduce a specific style of the speaker. (Default: 0.0)",
    "tts.voiceTuning.speakerBoost": "Speaker Boost",
    "tts.voiceTuning.speakerBoost.description": "Boost the similarity of the synthesized speech to the original voice. (Default: On)",
    "tts.voiceTuning.unavailable": "This setting is not available for the selected model.",
    "tts.model.eleven_multilingual_v2": "Eleven Multilingual v2",
    "tts.model.eleven_v3_alpha": "Eleven v3 Alpha",
    "tts.model.eleven_turbo_v2_5": "Eleven Turbo v2.5",
    "tts.model.eleven_flash_v2_5": "Flash v2.5",
    "tts.model.nonMultilingualWarning": "Warning: This model may not support non-English languages and could result in an error.",
    "tts.output.mp3_64": "MP3 64 kbps",
    "tts.output.mp3_128": "MP3 128 kbps (Standard)",
    "tts.output.mp3_192": "MP3 192 kbps (High Quality)",
    "tts.button.convert": "Generate Audio",
    "tts.button.converting": "Generating...",
    "tts.button.download": "Download",
    "tts.generatedAudio.title": "Generated Audio",
    "tts.generatedAudio.empty.title": "No audio generated yet.",
    "tts.generatedAudio.empty.description": "Your generated audio segments will appear here.",
    "tts.error.noKeys": "The Text-to-Speech feature is not configured or is currently disabled.",
    "tts.error.voiceFetchFailed": "Failed to fetch available voices.",
    "tts.error.conversionFailed": "Conversion failed",
    "tts.error.allKeysFailed": "Conversion failed. All available API keys were unsuccessful or have insufficient balance.",
    "tts.error.apiError": "Conversion failed with an API error: {{message}}",
    "tts.error.segmentEmpty": "Cannot generate audio: Calculated segment is empty.",
    "tts.error.minCharsTailOverride": "MinChars validation overridden for tail segment.",
    "tts.addToDictionary.button": "Add to Dictionary",
    "tts.addToDictionary.title": "Add Word to Dictionary",
    "tts.addToDictionary.success": "Word added to dictionary.",
    "tts.addToDictionary.error": "Failed to add word.",
    "tts.addToDictionary.log": "Added '{{original}}' -> '{{replacement}}' to dictionary.",
    "planManagement.title": "Subscription Plan Management",
    "planManagement.subtitle": "Create, edit, and delete subscription plans for your users.",
    "planManagement.addPlan": "Add New Plan",
    "planManagement.editPlan": "Edit Plan",
    "planManagement.table.name": "Plan Name",
    "planManagement.table.price": "Price (USD)",
    "planManagement.table.features": "Features",
    "planManagement.table.actions": "Actions",
    "planManagement.form.name": "Plan Name",
    "planManagement.form.price": "Price per month",
    "planManagement.form.features": "Features (one per line)",
    "planManagement.form.isDefault": "Make this the default (free) plan for new users",
    "planManagement.save": "Save Plan",
    "planManagement.saving": "Saving...",
    "planManagement.delete": "Delete",
    "planManagement.edit": "Edit",
    "planManagement.cancel": "Cancel",
    "planManagement.deleteConfirm": "Are you sure you want to delete this plan? This cannot be undone.",
    "planManagement.success.create": "Plan created successfully.",
    "planManagement.success.update": "Plan updated successfully.",
    "planManagement.success.delete": "Plan deleted successfully.",
    "planManagement.error.fetch": "Failed to fetch plans.",
    "planManagement.error.mutate": "Failed to save plan.",
    "subscriptionPage.title": "Subscription Plans",
    "subscriptionPage.subtitle": "Choose the plan that's right for you.",
    "subscriptionPage.currentPlan": "Current Plan",
    "subscriptionPage.upgrade": "Upgrade",
    "subscriptionPage.getStarted": "Get Started",
    "subscriptionPage.price.month": "/month",
    "checkoutPage.title": "Complete Your Purchase",
    "checkoutPage.orderSummary": "Order Summary",
    "checkoutPage.plan": "Plan",
    "checkoutPage.price": "Price",
    "checkoutPage.payWithPayPal": "Pay with PayPal",
    "checkoutPage.processing": "Processing...",
    "checkoutPage.error": "Failed to create payment order. Please try again.",
    "paymentSuccess.title": "Payment Successful!",
    "paymentSuccess.message": "Thank you for your purchase. Your subscription has been upgraded.",
    "paymentSuccess.backToDashboard": "Back to Dashboard",
    "paymentCancelled.title": "Payment Cancelled",
    "paymentCancelled.message": "Your payment process was cancelled. You can try again from the subscription page.",
    "paymentCancelled.backToSubscription": "Back to Subscription Plans"
};
const arTranslations = {
    "header.brand": "مسموع",
    "header.welcome": "أهلاً، {{name}}",
    "header.dashboard": "لوحة التحكم",
    "header.profile": "الملف الشخصي",
    "header.logout": "تسجيل الخروج",
    "header.home": "الرئيسية",
    "header.features": "الميزات",
    "header.pricing": "الأسعار",
    "header.loginOrSignUp": "تسجيل الدخول / إنشاء حساب",
    "header.language": "اللغة",
    "header.textCheck": "فحص النص",
    "authModal.login": "تسجيل الدخول",
    "authModal.signUp": "إنشاء حساب",
    "sidebar.dashboard": "لوحة التحكم",
    "sidebar.textCheck": "فحص النص",
    "sidebar.textToSpeech": "تحويل النص إلى صوت",
    "sidebar.dictionary": "القاموس",
    "sidebar.settings": "الإعدادات",
    "sidebar.subscription": "الاشتراك",
    "experimental.uploadKeys": "تحميل ملف مفاتيح",
    "footer.copyright": "مسموع. جميع الحقوق محفوظة.",
    "form.name": "الاسم",
    "form.email": "البريد الإلكتروني",
    "form.password": "كلمة المرور",
    "form.currentPassword": "كلمة المرور الحالية",
    "form.newPassword": "كلمة المرور الجديدة (اختياري)",
    "form.rememberMe": "تذكرني",
    "login.title": "سجل الدخول إلى حسابك",
    "login.signingIn": "جارِ تسجيل الدخول...",
    "login.signInButton": "تسجيل الدخول",
    "login.noAccount": "ليس لديك حساب؟",
    "login.signUpLink": "أنشئ حساباً",
    "login.forgotPassword": "نسيت كلمة السر؟",
    "login.branding.title": "أهلاً بعودتك إلى مسموع",
    "login.branding.subtitle": "أتقن نصوصك العربية وحولها إلى محتوى مسموع بإتقان.",
    "login.success": "تم تسجيل الدخول بنجاح.",
    "login.invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "login.emailNotConfirmed": "يرجى تأكيد عنوان بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الوارد للحصول على رابط التأكيد.",
    "signup.title": "أنشئ حسابك الجديد",
    "signup.creatingAccount": "جارِ إنشاء الحساب...",
    "signup.signUpButton": "إنشاء حساب",
    "signup.hasAccount": "هل لديك حساب بالفعل؟",
    "signup.loginLink": "سجل الدخول",
    "signup.branding.title": "انضم إلى مسموع اليوم",
    "signup.branding.subtitle": "انضم إلينا لتحويل كلماتك المكتوبة إلى محتوى صوتي مُعد بإتقان.",
    "signup.success": "تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك عبر رابط التأكيد.",
    "signup.emailExists": "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.",
    "signup.error.weakPassword": "كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.",
    "dashboard.welcome": "أهلاً بعودتك، {{name}}!",
    "dashboard.subtitle": "إليك لمحة سريعة عن نشاطك الشخصي.",
    "dashboard.statCards.checksThisMonth": "عمليات الفحص هذا الشهر",
    "dashboard.statCards.totalCorrections": "إجمالي الكلمات المصححة",
    "dashboard.statCards.dictionaryWords": "كلمات القاموس",
    "dashboard.statCards.currentPlan": "الخطة الحالية",
    "dashboard.usageChart.title": "استخدام الأداة (آخر 7 أيام)",
    "dashboard.recentActivity.title": "النشاط الأخير",
    "dashboard.recentActivity.empty": "لا يوجد نشاط حديث لعرضه. جرب استخدام أداة فحص النص!",
    "dashboard.userManagement.title": "إدارة المستخدمين",
    "dashboard.userManagement.subtitle": "إدارة صلاحيات وأذونات المستخدمين.",
    "activity.textAnalysis.step1": "التصحيح والتنظيف: تم تصحيح {{count}} كلمة.",
    "activity.textAnalysis.step2": "التشكيل: تم تشكيل {{count}} كلمة.",
    "activity.textAnalysis.step3": "القاموس: تم استبدال {{count}} كلمة.",
    "activity.textAnalysis.unknown": "تم إجراء تحليل للنص.",
    "home.hero.title": "اجعل كلماتك مسموعة، بإتقان.",
    "home.hero.subtitle": "يقوم 'مسموع' بتحويل نصوصك، مقالاتك، أو خطبك المكتوبة إلى محتوى مُعد بإتقان، وجاهز لأداء صوتي لا تشوبه شائبة.",
    "home.hero.cta": "ابدأ الآن مجاناً",
    "home.features.title": "منصة متكاملة",
    "home.features.subtitle": "كل ما تحتاجه لتحليل وإتقان نصوصك بكفاءة وفعالية.",
    "home.features.card1.title": "نطق متقن",
    "home.features.card1.description": "بدءاً من التشكيل الدقيق للكلمات المعقدة وصولاً إلى الكمال النحوي، نحن نُعد نصك لتقديم صوتي لا تشوبه شائبة.",
    "home.features.card2.title": "آمن وموثوق",
    "home.features.card2.description": "بياناتك في أمان معنا. نستخدم بروتوكولات أمان قياسية لحماية معلوماتك على مدار الساعة.",
    "home.features.card3.title": "محرك قابل للتخصيص",
    "home.features.card3.description": "استخدم قاموسك المخصص واختر من بين نماذج الذكاء الاصطناعي المختلفة لتكييف التحليل حسب احتياجاتك.",
    "home.testimonials.title": "موثوق به من قبل المبدعين",
    "home.testimonials.subtitle": "استمع لما يقوله صناع البودكاست والمعلمون والمبدعون عن 'مسموع'.",
    "home.testimonials.card1.quote": "لقد أحدث 'مسموع' ثورة في طريقة معالجتنا للمحتوى. الدقة لا تقدر بثمن، والواجهة سهلة الاستخدام بشكل لا يصدق.",
    "home.testimonials.card1.role": "محرر، المنشورات الرقمية",
    "home.testimonials.card2.quote": "القدرة على استخدام قاموس مخصص وتصحيح التشكيل في الوقت الفعلي منحتنا ميزة تنافسية كبيرة. موصى به بشدة!",
    "home.testimonials.card2.role": "استراتيجي محتوى، الحلول الإبداعية",
    "home.pricing.title": "اختر خطتك",
    "home.pricing.subtitle": "ابدأ بخطتنا المجانية السخية أو قم بالترقية لمزيد من القوة والميزات.",
    "home.pricing.cta": "سجل الآن",
    "home.cta.title": "هل أنت مستعد ليُسمع صوتك؟",
    "home.cta.subtitle": "انضم إلى آلاف المستخدمين الذين يستخدمون 'مسموع' بالفعل لتحقيق أهدافهم. سجل في دقائق.",
    "home.cta.button": "سجل الآن",
    "notFound.title": "الصفحة غير موجودة",
    "notFound.message": "عذراً، الصفحة التي تبحث عنها غير موجودة.",
    "notFound.goHome": "العودة للرئيسية",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "النظام",
    "profile.title": "ملفي الشخصي",
    "profile.subtitle": "إدارة معلوماتك الشخصية وكلمة المرور.",
    "profile.updateButton": "تحديث الملف الشخصي",
    "profile.updating": "جارِ التحديث...",
    "profile.updateSuccess": "تم تحديث الملف الشخصي بنجاح!",
    "profile.invalidPassword": "كلمة المرور الحالية التي أدخلتها غير صحيحة.",
    "profile.emailExists": "هذا البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر.",
    "profile.userNotFound": "تعذر العثور على بيانات المستخدم.",
    "forgotPassword.title": "نسيت كلمة المرور",
    "forgotPassword.subtitle": "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.",
    "forgotPassword.sendButton": "إرسال رابط إعادة التعيين",
    "forgotPassword.sending": "جارِ الإرسال...",
    "forgotPassword.emailSent": "إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور.",
    "forgotPassword.backToLogin": "العودة لتسجيل الدخول",
    "userManagement.table.name": "الاسم",
    "userManagement.table.email": "البريد الإلكتروني",
    "userManagement.table.role": "الصلاحية",
    "userManagement.table.actions": "الإجراءات",
    "userManagement.role.admin": "مدير",
    "userManagement.role.moderator": "مشرف",
    "userManagement.role.member": "عضو",
    "userManagement.update": "تحديث",
    "userManagement.delete": "حذف",
    "userManagement.deleteConfirm": "هل أنت متأكد من أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.",
    "userManagement.updateSuccess": "تم تحديث صلاحية المستخدم بنجاح.",
    "userManagement.deleteSuccess": "تم حذف المستخدم بنجاح.",
    "userManagement.error.fetch": "فشل في جلب المستخدمين.",
    "userManagement.error.update": "فشل في تحديث صلاحية المستخدم.",
    "userManagement.error.delete": "فشل في حذف المستخدم.",
    "userManagement.error.cannotDeleteSelf": "لا يمكنك حذف حسابك الخاص.",
    "userManagement.error.cannotChangeSelf": "لا يمكنك تغيير صلاحيتك الخاصة.",
    "auth.unauthorized": "غير مصرح لك بتنفيذ هذا الإجراء.",
    "textCheck.title": "أداة تحليل النصوص",
    "textCheck.subtitle": "حسّن نصوصك عبر عملية من 3 خطوات مدعومة بالذكاء الاصطناعي.",
    "textCheck.step1.title": "1. التصحيح والتنظيف",
    "textCheck.step2.title": "2. تصحيح التشكيل",
    "textCheck.step3.title": "3. الاستبدال من القاموس",
    "textCheck.step1.description": "سيقوم الذكاء الاصطناعي بتصحيح الإملاء وإزالة الرموز وتحويل الأرقام إلى كلمات.",
    "textCheck.step2.description": "سيقوم الذكاء الاصطناعي بإضافة التشكيل للكلمات التي قد يُساء نطقها.",
    "textCheck.step3.description": "الخطوة الأخيرة تقوم باستبدال الكلمات بناءً على قاموسك المخصص.",
    "textCheck.inputText": "النص المدخل",
    "textCheck.outputText": "النص الناتج",
    "textCheck.button.process": "معالجة النص",
    "textCheck.button.processing": "جارِ المعالجة...",
    "textCheck.button.nextStep": "الخطوة التالية",
    "textCheck.button.previousStep": "الخطوة السابقة",
    "textCheck.button.startOver": "البدء من جديد",
    "textCheck.error": "حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.",
    "textCheck.error.noApiKey": "مفتاح API للنموذج المختار غير مهيأ. يرجى إضافته في الإعدادات.",
    "textCheck.finalResult": "النتيجة النهائية",
    "textCheck.stats": "تم إجراء {{count}} تغييرات",
    "textCheck.noCorrections": "لم تكن هناك حاجة لأي تغييرات في هذه الخطوة.",
    "textCheck.step3.noMatches": "لم يتم العثور على أي كلمات من قاموسك في النص.",
    "textCheck.copySuccess": "تم نسخ النص إلى الحافظة!",
    "textCheck.button.copy": "نسخ النص",
    "textCheck.button.download": "تنزيل ملف txt.",
    "textCheck.button.upload": "رفع ملف txt.",
    "textCheck.error.fileRead": "فشل في قراءة الملف.",
    "textCheck.error.fileType": "يرجى رفع ملف txt. صالح.",
    "textCheck.button.tts": "تحويل النص إلى صوت",
    "dictionary.title": "القاموس المخصص",
    "dictionary.subtitle": "إدارة الكلمات التي سيتم استبدالها تلقائياً في الخطوة الأخيرة من فحص النص.",
    "dictionary.add.title": "إضافة كلمة جديدة",
    "dictionary.add.original": "الكلمة الأصلية",
    "dictionary.add.replacement": "الكلمة البديلة",
    "dictionary.add.button": "إضافة كلمة",
    "dictionary.import.title": "استيراد من ملف",
    "dictionary.import.description": "ارفع ملف .txt أو .csv. يجب أن يحتوي كل سطر على 'الكلمة الأصلية,الكلمة البديلة'.",
    "dictionary.import.button": "استيراد الكلمات",
    "dictionary.import.processing": "جارِ الاستيراد...",
    "dictionary.import.success": "تم استيراد {{count}} كلمات بنجاح.",
    "dictionary.import.error": "فشل في قراءة أو تحليل الملف.",
    "dictionary.table.original": "الأصلية",
    "dictionary.table.replacement": "البديلة",
    "dictionary.table.actions": "الإجراءات",
    "dictionary.delete": "حذف",
    "dictionary.edit": "تعديل",
    "dictionary.save": "حفظ",
    "dictionary.empty": "قاموسك فارغ. أضف كلمة للبدء.",
    "dictionary.error.alreadyExists": "هذه الكلمة موجودة بالفعل في قاموسك.",
    "settings.title": "الإعدادات",
    "settings.subtitle": "إدارة إعدادات التطبيق والإعدادات الإدارية.",
    "settings.save.button": "حفظ التغييرات",
    "settings.save.saving": "جارِ الحفظ...",
    "settings.save.success": "تم حفظ الإعدادات بنجاح!",
    "settings.tabs.general": "عام",
    "settings.tabs.users": "إدارة المستخدمين",
    "settings.tabs.plans": "إدارة الخطط",
    "settings.tabs.payment": "بوابات الدفع",
    "settings.textAnalysis.title": "نماذج تحليل النص",
    "settings.textAnalysis.description": "اختر نموذج الذكاء الاصطناعي وقدم مفتاح API لأداة تحليل النص.",
    "settings.textAnalysis.model": "نموذج الذكاء الاصطناعي",
    "settings.apiKey.label": "مفتاح API لـ {{modelName}}",
    "settings.apiKey.placeholder": "أدخل مفتاح API الخاص بك هنا",
    "settings.apiKey.testButton": "اختبار",
    "settings.apiKey.test.testing": "جارِ الاختبار...",
    "settings.apiKey.test.success": "المفتاح صالح ويعمل.",
    "settings.apiKey.test.error": "المفتاح غير صالح أو فشل الاتصال.",
    "settings.payment.title": "بوابات الدفع",
    "settings.payment.description": "تهيئة بيانات اعتماد مزود الدفع الخاص بك.",
    "settings.payment.paypal.clientId": "معرف العميل (Client ID) لـ PayPal",
    "settings.payment.paypal.clientSecret": "المفتاح السري (Client Secret) لـ PayPal",
    "quickAccess.title": "اختصارات الوصول السريع",
    "tts.title": "تحويل النص إلى صوت",
    "tts.subtitle": "حول نصوصك إلى صوت عالي الجودة، مقطعًا تلو الآخر.",
    "tts.apiKeyManagement.title": "إدارة مفاتيح API",
    "tts.apiKeyManagement.enterNew": "أدخل مفتاح API الجديد هنا...",
    "tts.apiKeyManagement.add": "إضافة",
    "tts.apiKeyManagement.checkAll": "فحص كل المفاتيح",
    "tts.apiKeyManagement.checking": "جارِ الفحص...",
    "tts.apiKeyManagement.uploadKeys": "تحميل المفاتيح",
    "tts.apiKeyManagement.deleteSelected": "حذف المحدد ({{count}})",
    "tts.apiKeyManagement.deleteAll": "حذف الكل",
    "tts.apiKeyManagement.table.select": "تحديد",
    "tts.apiKeyManagement.table.key": "المفتاح",
    "tts.apiKeyManagement.table.balance": "الرصيد",
    "tts.apiKeyManagement.table.status": "الحالة",
    "tts.apiKeyManagement.status.active": "نشط",
    "tts.apiKeyManagement.status.inactive": "غير نشط",
    "tts.apiKeyManagement.status.error": "خطأ",
    "tts.apiKeyManagement.toast.enterKey": "الرجاء إدخال مفتاح API",
    "tts.apiKeyManagement.toast.keyExists": "هذا المفتاح موجود بالفعل!",
    "tts.apiKeyManagement.toast.selectKeyToDelete": "الرجاء تحديد مفتاح واحد على الأقل للحذف",
    "tts.apiKeyManagement.toast.confirmDeleteAll": "هل أنت متأكد من رغبتك في حذف جميع المفاتيح؟ لا يمكن التراجع عن هذا الإجراء.",
    "tts.apiKeyManagement.log.keyAdded": "تم إضافة مفتاح: {{key}}...",
    "tts.apiKeyManagement.log.keysDeleted": "تم حذف {{count}} مفاتيح.",
    "tts.apiKeyManagement.log.allKeysDeleted": "تم حذف جميع المفاتيح.",
    "tts.apiKeyManagement.log.checkingBalances": "جاري فحص أرصدة المفاتيح...",
    "tts.apiKeyManagement.log.validKey": "✅ مفتاح صالح {{key}}...: {{balance}} حرف متبقي",
    "tts.apiKeyManagement.log.balanceCheckFailed": "❌ فشل فحص الرصيد: {{error}}",
    "tts.apiKeyManagement.log.keysUploaded": "تم تحميل {{count}} مفاتيح جديدة",
    "tts.apiKeyManagement.toast.noNewKeys": "لا توجد مفاتيح جديدة في الملف",
    "tts.apiKeyManagement.toast.noKeysToCheck": "لا توجد مفاتيح API لفحصها",
    "tts.controls.title": "ضوابط التحويل",
    "tts.controls.start": "بدء",
    "tts.controls.stop": "إيقاف",
    "tts.controls.placeholder": "أو الصق النص الكامل هنا...",
    "tts.statsAndSettings.title": "إعدادات التقطيع والإحصائيات",
    "tts.statsAndSettings.totalChars": "إجمالي الأحرف",
    "tts.statsAndSettings.chunkCount": "عدد المقاطع",
    "tts.statsAndSettings.totalKeys": "إجمالي المفاتيح",
    "tts.statsAndSettings.totalBalance": "إجمالي الرصيد",
    "tts.statsAndSettings.chunkMin": "أدنى حد للقطعة",
    "tts.statsAndSettings.chunkMax": "أقصى حد للقطعة",
    "tts.statsAndSettings.startFrom": "ابدأ من",
    "tts.advancedAudio.title": "إعدادات الصوت المتقدمة",
    "tts.advancedAudio.resetDefaults": "استعادة الافتراضيات",
    "tts.advancedAudio.saveSettings": "حفظ الإعدادات",
    "tts.advancedAudio.speed": "السرعة",
    "tts.advancedAudio.speed.unavailable": "التحكم بالسرعة متوفر فقط لموديل v3.",
    "tts.toast.settingsSaved": "تم حفظ الإعدادات بنجاح",
    "tts.toast.defaultsRestored": "تمت استعادة الإعدادات الافتراضية للصوت",
    "tts.progress.title": "تقدم العملية",
    "tts.progress.currentChunk": "المقطع الحالي: {{current}} / {{total}}",
    "tts.convertedChunks.title": "المقاطع المحولة",
    "tts.convertedChunks.selectAll": "تحديد الكل",
    "tts.convertedChunks.mergeAndDownload": "دمج وتنزيل ({{count}})",
    "tts.convertedChunks.merging": "جارِ الدمج...",
    "tts.convertedChunks.chunk": "المقطع #{{id}}",
    "tts.convertedChunks.retry": "إعادة المحاولة",
    "tts.convertedChunks.download": "تحميل",
    "tts.convertedChunks.placeholder": "ستظهر المقاطع هنا بعد التحويل.",
    "tts.toast.selectToMerge": "الرجاء تحديد مقطع واحد على الأقل للدمج",
    "tts.logs.title": "سجل العمليات",
    "tts.logs.copy": "نسخ",
    "tts.logs.export": "تصدير",
    "tts.logs.clear": "مسح",
    "tts.toast.logCopied": "تم نسخ السجل",
    "tts.general.toast.selectTextFirst": "الرجاء اختيار أو كتابة نص أولاً",
    "tts.general.toast.addKeyFirst": "الرجاء إضافة مفتاح API واحد على الأقل",
    "tts.general.log.apiFormatUpdate": "تحديث تنسيق مفتاح API تلقائيًا.",
    "tts.general.log.textSelected": "تم اختيار ملف النص: {{name}}",
    "tts.general.log.noValidKeys": "⚠️ لا توجد مفاتيح API صالحة أو ذات رصيد متبقٍ.",
    "tts.general.log.tryingKey": "🔑 تجربة المفتاح {{key}}... (رصيد: {{balance}})",
    "tts.general.log.apiFail": "❌ فشل API: {{error}}",
    "tts.general.log.keyMarkedInvalid": "🔑 تم تمييز المفتاح {{key}}... كغير صالح لهذه الجلسة.",
    "tts.general.log.networkError": "❌ خطأ شبكة: {{error}}",
    "tts.general.log.convertingChunk": "\nجاري تحويل المقطع {{current}} من {{total}}...",
    "tts.general.log.chunkSuccess": "✅ تم تحويل المقطع {{id}} بنجاح",
    "tts.general.log.chunkFail": "❌ فشل في تحويل المقطع {{id}}",
    "tts.general.log.conversionComplete": "\nتم الانتهاء. نجاح: {{success}} | فشل: {{fail}}",
    "tts.general.log.retryingChunk": "\nإعادة محاولة المقطع {{id}}...",
    "tts.general.log.retrySuccess": "✅ نجحت إعادة محاولة المقطع {{id}}",
    "tts.general.log.retryFail": "❌ فشلت إعادة محاولة المقطع {{id}}",
    "tts.general.log.mergeStart": "🚀 بدء عملية دمج المقاطع...",
    "tts.general.log.mergeSuccess": "✅ تم دمج وتنزيل الملف بنجاح!",
    "tts.general.log.mergeFail": "❌ فشلت عملية الدمج: {{error}}",
    "tts.general.log.conversionStopped": "تم إيقاف التحويل من قبل المستخدم.",
    "tts.general.log.logCopiedFail": "❌ فشل النسخ: {{error}}",
    "tts.general.log.logExported": "📁 تم تصدير السجل.",
    "tts.general.log.logCleared": "🗑️ تم مسح السجل.",
    "tts.general.log.textLoadedFromCheck": "✅ تم تحميل النص بنجاح من أداة فحص النص.",
    "tts.addToDictionary.button": "إضافة إلى القاموس",
    "tts.addToDictionary.title": "إضافة كلمة إلى القاموس",
    "tts.addToDictionary.success": "تمت إضافة الكلمة إلى القاموس.",
    "tts.addToDictionary.error": "فشل في إضافة الكلمة.",
    "tts.addToDictionary.log": "تمت إضافة '{{original}}' -> '{{replacement}}' إلى القاموس.",
    "tts.settings.voice": "الصوت",
    "tts.settings.model": "موديل",
    "tts.settings.outputFormat": "تنسيق الإخراج",
    "tts.voiceTuning.title": "ضبط دقيق للصوت (ElevenLabs API)",
    "tts.voiceTuning.stability": "استقرار الصوت",
    "tts.voiceTuning.stability.description": "زيادة الاستقرار تجعل الصوت أكثر ثباتًا ولكن قد يبدو آليًا. (الافتراضي: 0.75)",
    "tts.voiceTuning.similarityBoost": "تحسين التشابه",
    "tts.voiceTuning.similarityBoost.description": "القيم العالية تجعل الصوت أكثر تشابهًا مع الأصلي ولكن قد تسبب تشوهات. (الافتراضي: 0.75)",
    "tts.voiceTuning.styleExaggeration": "المبالغة في الأسلوب",
    "tts.voiceTuning.styleExaggeration.description": "يوصى بالقيم الأعلى ما لم تكن تحاول إعادة إنتاج أسلوب معين للمتحدث. (الافتراضي: 0.0)",
    "tts.voiceTuning.speakerBoost": "تحسين السماعة",
    "tts.voiceTuning.speakerBoost.description": "يعزز تشابه الكلام المركب مع الصوت الأصلي. (الافتراضي: تشغيل)",
    "tts.voiceTuning.unavailable": "هذا الإعداد غير متوفر للنموذج المختار.",
    "tts.model.eleven_multilingual_v2": "Eleven Multilingual v2",
    "tts.model.eleven_v3_alpha": "Eleven v3 Alpha",
    "tts.model.eleven_turbo_v2_5": "Eleven Turbo v2.5",
    "tts.model.eleven_flash_v2_5": "Flash v2.5",
    "tts.model.nonMultilingualWarning": "تنبيه: هذا النموذج قد لا يدعم اللغات غير الإنجليزية وقد يؤدي إلى حدوث خطأ.",
    "tts.output.mp3_64": "MP3 64 kbps",
    "tts.output.mp3_128": "MP3 128 kbps (قياسي)",
    "tts.output.mp3_192": "MP3 192 kbps (جودة عالية)",
    "tts.button.convert": "إنشاء الصوت",
    "tts.button.converting": "جارٍ الإنشاء...",
    "tts.button.download": "تحميل",
    "tts.generatedAudio.title": "الصوت المُنشأ",
    "tts.generatedAudio.empty.title": "لم يتم إنشاء أي صوت بعد.",
    "tts.generatedAudio.empty.description": "ستظهر مقاطع الصوت التي تم إنشاؤها هنا.",
    "tts.error.noKeys": "ميزة تحويل النص إلى كلام غير مهيأة أو معطلة حاليًا.",
    "tts.error.voiceFetchFailed": "فشل في جلب الأصوات المتاحة.",
    "tts.error.conversionFailed": "فشل التحويل",
    "tts.error.allKeysFailed": "فشل التحويل. جميع مفاتيح API المتاحة لم تنجح أو رصيدها غير كافٍ.",
    "tts.error.apiError": "فشل التحويل بسبب خطأ في الواجهة البرمجية: {{message}}",
    "tts.error.segmentEmpty": "لا يمكن إنشاء الصوت: المقطع المحسوب فارغ.",
    "tts.error.minCharsTailOverride": "تم تجاوز التحقق من الحد الأدنى للأحرف للمقطع الأخير.",
    "planManagement.title": "إدارة خطط الاشتراك",
    "planManagement.subtitle": "إنشاء وتعديل وحذف خطط الاشتراك لمستخدميك.",
    "planManagement.addPlan": "إضافة خطة جديدة",
    "planManagement.editPlan": "تعديل الخطة",
    "planManagement.table.name": "اسم الخطة",
    "planManagement.table.price": "السعر (دولار أمريكي)",
    "planManagement.table.features": "الميزات",
    "planManagement.table.actions": "الإجراءات",
    "planManagement.form.name": "اسم الخطة",
    "planManagement.form.price": "السعر شهرياً",
    "planManagement.form.features": "الميزات (واحدة في كل سطر)",
    "planManagement.form.isDefault": "اجعل هذه الخطة الافتراضية (المجانية) للمستخدمين الجدد",
    "planManagement.save": "حفظ الخطة",
    "planManagement.saving": "جارِ الحفظ...",
    "planManagement.delete": "حذف",
    "planManagement.edit": "تعديل",
    "planManagement.cancel": "إلغاء",
    "planManagement.deleteConfirm": "هل أنت متأكد من أنك تريد حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.",
    "planManagement.success.create": "تم إنشاء الخطة بنجاح.",
    "planManagement.success.update": "تم تحديث الخطة بنجاح.",
    "planManagement.success.delete": "تم حذف الخطة بنجاح.",
    "planManagement.error.fetch": "فشل في جلب الخطط.",
    "planManagement.error.mutate": "فشل في حفظ الخطة.",
    "subscriptionPage.title": "خطط الاشتراك",
    "subscriptionPage.subtitle": "اختر الخطة المناسبة لك.",
    "subscriptionPage.currentPlan": "الخطة الحالية",
    "subscriptionPage.upgrade": "ترقية",
    "subscriptionPage.getStarted": "ابدأ الآن",
    "subscriptionPage.price.month": "/شهرياً",
    "checkoutPage.title": "أكمل عملية الشراء",
    "checkoutPage.orderSummary": "ملخص الطلب",
    "checkoutPage.plan": "الخطة",
    "checkoutPage.price": "السعر",
    "checkoutPage.payWithPayPal": "الدفع بواسطة PayPal",
    "checkoutPage.processing": "جارِ المعالجة...",
    "checkoutPage.error": "فشل في إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.",
    "paymentSuccess.title": "تم الدفع بنجاح!",
    "paymentSuccess.message": "شكراً لشرائك. تم ترقية اشتراكك.",
    "paymentSuccess.backToDashboard": "العودة إلى لوحة التحكم",
    "paymentCancelled.title": "تم إلغاء الدفع",
    "paymentCancelled.message": "تم إلغاء عملية الدفع الخاصة بك. يمكنك المحاولة مرة أخرى من صفحة الاشتراكات.",
    "paymentCancelled.backToSubscription": "العودة إلى خطط الاشتراك"
};
// --- End Embedded Translations ---

type Language = 'en' | 'ar';
type Translations = Record<string, string>;

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

declare global {
    interface Window {
        translations: Record<Language, Translations>;
    }
}

const loadedTranslations = { en: enTranslations, ar: arTranslations };
window.translations = loadedTranslations;


export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = loadedTranslations[language][key as keyof typeof loadedTranslations.en] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [language]);


  const value = { language, setLanguage, t };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};