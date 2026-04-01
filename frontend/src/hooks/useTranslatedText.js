import { useEffect, useMemo, useState } from "react";

import { useSession } from "@/context/SessionContext";
import { translateBatch } from "@/lib/api";

const LOCAL_TRANSLATIONS = {
  hi: {
    Dashboard: "डैशबोर्ड",
    "AI Workspace": "एआई कार्यक्षेत्र",
    Pricing: "मूल्य निर्धारण",
    Analytics: "विश्लेषण",
    Settings: "सेटिंग्स",
    "Document scanner": "दस्तावेज़ स्कैनर",
    "Case intelligence": "मामला अनुसंधान",
    "Lawyer connect": "वकील संपर्क",
    "Case lookup": "मामला खोज",
    "Protect mode": "सुरक्षा मोड",
    "Cloud workspace": "क्लाउड कार्यक्षेत्र",
    Core: "मुख्य",
    Workflows: "वर्कफ़्लो",
    "Cloud deployed and Railway-ready": "क्लाउड पर तैनात और Railway तैयार",
    "Live service": "लाइव सेवा",
    "Sign out": "साइन आउट",
    "Sign in": "साइन इन",
    Join: "जुड़ें",
    "Built for clarity under pressure.": "दबाव के समय स्पष्टता के लिए बनाया गया।",
    "Legal intelligence": "कानूनी बुद्धिमत्ता",
    "Workspace overview": "कार्यस्थल अवलोकन",
    "Legal intelligence dashboard": "कानूनी बुद्धिमत्ता डैशबोर्ड",
    "Reviewer control center": "समीक्षक नियंत्रण केंद्र",
    "Member workspace": "सदस्य कार्यक्षेत्र",
    "Reviewer workspace": "समीक्षक कार्यक्षेत्र",
    "Open AI workspace": "एआई कार्यक्षेत्र खोलें",
    "Track a case": "मामला ट्रैक करें",
    "Workspace principle": "कार्यस्थल सिद्धांत",
    "One dashboard, many dedicated workflows": "एक डैशबोर्ड, कई समर्पित वर्कफ़्लो",
    "Core platform": "मुख्य मंच",
    "Launch the workflows": "वर्कफ़्लो शुरू करें",
    History: "इतिहास",
    "Recent legal activity": "हाल की कानूनी गतिविधि",
    "Queue visibility": "क्यू दृश्यता",
    "Saved intelligence": "सहेजी गई जानकारी",
    "Pinned cases": "पिन किए गए मामले",
    "Manage billing": "बिलिंग प्रबंधित करें",
    "Subscription status": "सदस्यता स्थिति",
    "Usage this month": "इस महीने का उपयोग",
    "Language + notifications": "भाषा और सूचनाएं",
    "Workspace translation": "कार्यस्थल अनुवाद",
    "AI legal assistant": "एआई कानूनी सहायक",
    "Ask a legal question in natural language": "प्राकृतिक भाषा में कानूनी प्रश्न पूछें",
    "Dedicated workflow": "समर्पित कार्यप्रवाह",
    "Clause heatmaps": "क्लॉज हीटमैप",
    "Clause-level contract risk analysis": "क्लॉज स्तर का अनुबंध जोखिम विश्लेषण",
    "Search landmark cases and judgments": "महत्वपूर्ण मामलों और निर्णयों को खोजें",
    "Dedicated research": "समर्पित शोध",
    "Precedent search": "नज़ीर खोज",
    "Find the right legal expert faster": "सही कानूनी विशेषज्ञ जल्दी खोजें",
    "Consultation routing": "परामर्श रूटिंग",
    "Emergency workflow": "आपातकालीन कार्यप्रवाह",
    "Live safety tools": "लाइव सुरक्षा उपकरण",
    "Keep emergency tools one tap away": "आपातकालीन उपकरण एक टैप की दूरी पर रखें",
    "Case status lookup": "मामला स्थिति खोज",
    "Email status updates": "ईमेल स्थिति अपडेट",
    "Track hearing progress without leaving the workspace": "कार्यस्थल छोड़े बिना सुनवाई प्रगति ट्रैक करें",
    "Account control": "खाता नियंत्रण",
    "Language preferences": "भाषा प्राथमिकताएं",
    "Profile, preferences, and billing": "प्रोफ़ाइल, प्राथमिकताएं और बिलिंग",
    "Natural language intake": "प्राकृतिक भाषा इनटेक",
    Language: "भाषा",
    "Search by case details": "मामले के विवरण से खोजें",
    "Lookup form": "खोज फ़ॉर्म",
    "Case type": "मामले का प्रकार",
    "Case number": "मामला संख्या",
    "Filing year": "दाखिल वर्ष",
    "Court complex": "अदालत परिसर",
    "Check case status": "मामले की स्थिति देखें",
    "Checking status...": "स्थिति देखी जा रही है...",
    "Load demo input": "डेमो इनपुट भरें",
    "Result panel": "परिणाम पैनल",
    "Latest lookup": "नवीनतम खोज",
    "Tracked case": "ट्रैक किया गया मामला",
    "Next hearing": "अगली सुनवाई",
    "Notification status": "सूचना स्थिति",
    "Demo quick references": "डेमो त्वरित संदर्भ",
    "Sample case numbers": "नमूना मामला संख्याएँ",
    Pending: "लंबित",
    Disposed: "निस्तारित",
    Adjourned: "स्थगित",
    "Under Review": "समीक्षा में",
    "Awaiting lookup": "खोज की प्रतीक्षा",
    Ready: "तैयार",
    Disabled: "अक्षम",
    Sent: "भेजा गया",
    "Not Scheduled": "निर्धारित नहीं",
    "Hearing scheduled": "सुनवाई निर्धारित",
    "Final order issued": "अंतिम आदेश जारी",
    "New date awaited": "नई तारीख की प्रतीक्षा",
    "Control center": "नियंत्रण केंद्र",
    "Emergency state": "आपात स्थिति",
    "Elapsed time": "बीता समय",
    "Voice watch": "वॉइस वॉच",
    "GPS location": "जीपीएस स्थान",
    "Location not captured yet.": "स्थान अभी तक प्राप्त नहीं हुआ।",
    "SOS delivery": "एसओएस डिलीवरी",
    "Not sent yet.": "अभी तक नहीं भेजा गया।",
    "Arm protection": "सुरक्षा सक्रिय करें",
    "Stop protection": "सुरक्षा रोकें",
    "Enable voice watch": "वॉइस वॉच चालू करें",
    "Disable voice watch": "वॉइस वॉच बंद करें",
    "Refresh location": "स्थान रीफ्रेश करें",
    "Send SOS now": "अभी SOS भेजें",
    "Voice command phrases": "वॉइस कमांड वाक्यांश",
    'Say "protect me" to arm protection, and "stop protection" to end the session. Manual controls stay available if voice watch pauses.':
      'सुरक्षा सक्रिय करने के लिए "protect me" कहें, और सत्र समाप्त करने के लिए "stop protection" कहें। यदि वॉइस वॉच रुक जाए तो मैनुअल कंट्रोल उपलब्ध रहेंगे।',
    "Quick-response AI": "त्वरित प्रतिक्रिया AI",
    "Get a fast protect briefing": "त्वरित सुरक्षा ब्रीफिंग प्राप्त करें",
    Scenario: "परिस्थिति",
    "Generate quick protect guidance": "त्वरित सुरक्षा मार्गदर्शन तैयार करें",
    "Preparing guidance...": "मार्गदर्शन तैयार हो रहा है...",
    "Latest advisory": "नवीनतम सलाह",
    "Run a quick guidance request to populate this panel with backend-ready emergency advice.":
      "इस पैनल में बैकएंड-तैयार आपातकालीन सलाह दिखाने के लिए एक त्वरित मार्गदर्शन अनुरोध चलाएँ।",
    "Live transcript": "लाइव ट्रांसक्रिप्ट",
    "Recent emergency events": "हाल की आपात घटनाएँ",
    "Current status": "वर्तमान स्थिति",
    "Safety note": "सुरक्षा नोट",
    "LexGuard can support the flow, but emergencies still need direct help from local authorities, a trusted contact, or qualified legal counsel.":
      "LexGuard सहायता दे सकता है, लेकिन आपात स्थिति में स्थानीय प्राधिकरण, किसी भरोसेमंद संपर्क, या योग्य कानूनी सलाहकार से सीधे मदद लेना अभी भी ज़रूरी है।",
    Armed: "सक्रिय",
    Standby: "तत्पर",
    Live: "लाइव",
    Off: "बंद",
    "Protection is on standby.": "सुरक्षा स्टैंडबाय पर है।",
    "Location capture failed. Using fallback coordinates.": "स्थान कैप्चर नहीं हो सका। बैकअप निर्देशांक उपयोग किए जा रहे हैं।",
    "Emergency SMS sent.": "आपातकालीन SMS भेज दिया गया।",
    "Sending emergency SMS...": "आपातकालीन SMS भेजा जा रहा है...",
    "Emergency mode enabled. Audio recording started.": "आपातकालीन मोड सक्रिय हो गया है। ऑडियो रिकॉर्डिंग शुरू कर दी गई है।",
    "Email delivery is unavailable until RESEND_API_KEY is configured.":
      "ईमेल डिलीवरी तब तक उपलब्ध नहीं है जब तक RESEND_API_KEY कॉन्फ़िगर नहीं किया जाता।",
    "Email delivery is unavailable until RESEND_FROM_EMAIL is configured with a verified Resend sender.":
      "ईमेल डिलीवरी तब तक उपलब्ध नहीं है जब तक RESEND_FROM_EMAIL को सत्यापित Resend प्रेषक के साथ कॉन्फ़िगर नहीं किया जाता।",
    "Email delivery failed because the sending domain is not verified in Resend. Update RESEND_FROM_EMAIL to a verified sender.":
      "ईमेल डिलीवरी विफल रही क्योंकि भेजने वाला डोमेन Resend में सत्यापित नहीं है। RESEND_FROM_EMAIL को सत्यापित प्रेषक पर अपडेट करें।",
    "Email delivery failed because the sender address is not verified in Resend. Update RESEND_FROM_EMAIL to a verified sender.":
      "ईमेल डिलीवरी विफल रही क्योंकि प्रेषक पता Resend में सत्यापित नहीं है। RESEND_FROM_EMAIL को सत्यापित प्रेषक पर अपडेट करें।",
    "Voice monitoring hit an error. You can still use the manual controls.":
      "वॉइस मॉनिटरिंग में त्रुटि आई। आप अभी भी मैनुअल कंट्रोल का उपयोग कर सकते हैं।",
    "Speech recognition is not supported in this browser.": "इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।",
    "Voice monitoring paused. Click the button again if needed.": "वॉइस मॉनिटरिंग रुकी हुई है। ज़रूरत हो तो बटन फिर दबाएँ।",
    "Voice monitoring could not start. Check microphone permissions and try again.":
      "वॉइस मॉनिटरिंग शुरू नहीं हो सकी। माइक्रोफ़ोन अनुमति जाँचें और फिर प्रयास करें।"
  },
  ta: {
    Dashboard: "டாஷ்போர்டு",
    "AI Workspace": "ஏஐ பணிமனை",
    Pricing: "விலை திட்டங்கள்",
    Analytics: "பகுப்பாய்வு",
    Settings: "அமைப்புகள்",
    "Document scanner": "ஆவண ஸ்கேனர்",
    "Case intelligence": "வழக்கு நுண்ணறிவு",
    "Lawyer connect": "வழக்கறிஞர் இணைப்பு",
    "Case lookup": "வழக்கு தேடல்",
    "Protect mode": "பாதுகாப்பு நிலை",
    "Cloud workspace": "கிளவுட் பணிமனை",
    Core: "முக்கியம்",
    Workflows: "செயலோட்டங்கள்",
    "Cloud deployed and Railway-ready": "கிளவுடில் இயக்கத்தில், Railway தயார்",
    "Live service": "நேரடி சேவை",
    "Sign out": "வெளியேறு",
    "Sign in": "உள்நுழை",
    Join: "சேரவும்",
    "Built for clarity under pressure.": "அழுத்த நேரத்திலும் தெளிவுக்காக உருவாக்கப்பட்டது.",
    "Legal intelligence": "சட்ட நுண்ணறிவு",
    "Workspace overview": "பணிமனை மேலோட்டம்",
    "Legal intelligence dashboard": "சட்ட நுண்ணறிவு டாஷ்போர்டு",
    "Reviewer control center": "மதிப்பாய்வாளர் கட்டுப்பாட்டு மையம்",
    "Member workspace": "உறுப்பினர் பணிமனை",
    "Reviewer workspace": "மதிப்பாய்வாளர் பணிமனை",
    "Open AI workspace": "ஏஐ பணிமனையைத் திறக்கவும்",
    "Track a case": "வழக்கை கண்காணிக்கவும்",
    "Workspace principle": "பணிமனை கோட்பு",
    "One dashboard, many dedicated workflows": "ஒரு டாஷ்போர்டு, பல தனிப்பட்ட செயல்வழிகள்",
    "Core platform": "முக்கிய தளம்",
    "Launch the workflows": "செயலோட்டங்களைத் தொடங்குங்கள்",
    History: "வரலாறு",
    "Recent legal activity": "சமீபத்திய சட்ட செயல்பாடு",
    "Queue visibility": "வரிசை தெளிவு",
    "Saved intelligence": "சேமித்த நுண்ணறிவு",
    "Pinned cases": "நிறுவப்பட்ட வழக்குகள்",
    "Manage billing": "பில்லிங்கை நிர்வகிக்கவும்",
    "Subscription status": "சந்தா நிலை",
    "Usage this month": "இந்த மாத பயன்பாடு",
    "Language + notifications": "மொழி மற்றும் அறிவிப்புகள்",
    "Workspace translation": "பணிமனை மொழிபெயர்ப்பு",
    "AI legal assistant": "ஏஐ சட்ட உதவியாளர்",
    "Ask a legal question in natural language": "இயல்பான மொழியில் சட்டக் கேள்வியை கேளுங்கள்",
    "Dedicated workflow": "தனிப்பட்ட செயல்வழி",
    "Clause heatmaps": "கிளாஸ் ஹீட்மேப்",
    "Clause-level contract risk analysis": "கிளாஸ் நிலை ஒப்பந்த அபாய பகுப்பாய்வு",
    "Search landmark cases and judgments": "முக்கிய வழக்குகள் மற்றும் தீர்ப்புகளைத் தேடுங்கள்",
    "Dedicated research": "தனிப்பட்ட ஆராய்ச்சி",
    "Precedent search": "முன்மாதிரி தேடல்",
    "Find the right legal expert faster": "சரியான சட்ட நிபுணரை வேகமாக கண்டுபிடிக்கவும்",
    "Consultation routing": "ஆலோசனை வழிமுறை",
    "Emergency workflow": "அவசர செயல்வழி",
    "Live safety tools": "நேரடி பாதுகாப்பு கருவிகள்",
    "Keep emergency tools one tap away": "அவசர கருவிகளை ஒரு தொட்டிலே வைத்திருங்கள்",
    "Case status lookup": "வழக்கு நிலை தேடல்",
    "Email status updates": "மின்னஞ்சல் நிலை புதுப்பிப்புகள்",
    "Track hearing progress without leaving the workspace": "பணிமனையை விட்டு செல்லாமல் விசாரணை முன்னேற்றத்தை கண்காணிக்கவும்",
    "Account control": "கணக்கு கட்டுப்பாடு",
    "Language preferences": "மொழி விருப்பங்கள்",
    "Profile, preferences, and billing": "சுயவிவரம், விருப்பங்கள் மற்றும் கட்டணம்",
    "Natural language intake": "இயல்பான மொழி உள்ளீடு",
    Language: "மொழி",
    "Search by case details": "வழக்கு விவரங்களால் தேடவும்",
    "Lookup form": "தேடல் படிவம்",
    "Case type": "வழக்கு வகை",
    "Case number": "வழக்கு எண்",
    "Filing year": "தாக்கல் ஆண்டு",
    "Court complex": "நீதிமன்ற வளாகம்",
    "Check case status": "வழக்கு நிலையை சரிபார்க்கவும்",
    "Checking status...": "நிலை சரிபார்க்கப்படுகிறது...",
    "Load demo input": "டெமோ உள்ளீட்டை ஏற்று",
    "Result panel": "முடிவு பலகம்",
    "Latest lookup": "சமீபத்திய தேடல்",
    "Tracked case": "கண்காணிக்கப்படும் வழக்கு",
    "Next hearing": "அடுத்த விசாரணை",
    "Notification status": "அறிவிப்பு நிலை",
    "Demo quick references": "டெமோ விரைவு குறிப்புகள்",
    "Sample case numbers": "மாதிரி வழக்கு எண்கள்",
    Pending: "நிலுவையில்",
    Disposed: "தீர்க்கப்பட்டது",
    Adjourned: "ஒத்திவைக்கப்பட்டது",
    "Under Review": "மதிப்பாய்வில்",
    "Awaiting lookup": "தேடல் நிலுவையில்",
    Ready: "தயார்",
    Disabled: "முடக்கப்பட்டது",
    Sent: "அனுப்பப்பட்டது",
    "Not Scheduled": "திட்டமிடப்படவில்லை",
    "Hearing scheduled": "விசாரணை திட்டமிடப்பட்டது",
    "Final order issued": "இறுதி உத்தரவு வெளியிடப்பட்டது",
    "New date awaited": "புதிய தேதி காத்திருக்கிறது",
    "Control center": "கட்டுப்பாட்டு மையம்",
    "Emergency state": "அவசர நிலை",
    "Elapsed time": "கழிந்த நேரம்",
    "Voice watch": "குரல் கண்காணிப்பு",
    "GPS location": "GPS இருப்பிடம்",
    "Location not captured yet.": "இருப்பிடம் இன்னும் பெறப்படவில்லை.",
    "SOS delivery": "SOS அனுப்பல்",
    "Not sent yet.": "இன்னும் அனுப்பப்படவில்லை.",
    "Arm protection": "பாதுகாப்பை இயக்கவும்",
    "Stop protection": "பாதுகாப்பை நிறுத்தவும்",
    "Enable voice watch": "குரல் கண்காணிப்பை இயக்கவும்",
    "Disable voice watch": "குரல் கண்காணிப்பை முடக்கவும்",
    "Refresh location": "இருப்பிடத்தை புதுப்பிக்கவும்",
    "Send SOS now": "இப்போது SOS அனுப்பு",
    "Voice command phrases": "குரல் கட்டளை சொற்கள்",
    'Say "protect me" to arm protection, and "stop protection" to end the session. Manual controls stay available if voice watch pauses.':
      '"protect me" என்று சொன்னால் பாதுகாப்பு இயக்கப்படும்; அமர்வை முடிக்க "stop protection" என்று சொல்லுங்கள். குரல் கண்காணிப்பு நின்றாலும் கைமுறை கட்டுப்பாடுகள் கிடைக்கும்.',
    "Quick-response AI": "விரைவு பதில் AI",
    "Get a fast protect briefing": "விரைவு பாதுகாப்பு விளக்கத்தை பெறுங்கள்",
    Scenario: "நிலைமை",
    "Generate quick protect guidance": "விரைவு பாதுகாப்பு வழிகாட்டலை உருவாக்கவும்",
    "Preparing guidance...": "வழிகாட்டல் தயாராகிறது...",
    "Latest advisory": "சமீபத்திய அறிவுரை",
    "Run a quick guidance request to populate this panel with backend-ready emergency advice.":
      "இந்த பலகையில் பின்னணி அமைப்பு தயாரான அவசர ஆலோசனையை காண விரைவு வழிகாட்டல் கோரிக்கையை இயக்கவும்.",
    "Live transcript": "நேரடி பதிவேடு",
    "Recent emergency events": "சமீபத்திய அவசர நிகழ்வுகள்",
    "Current status": "தற்போதைய நிலை",
    "Safety note": "பாதுகாப்பு குறிப்பு",
    "LexGuard can support the flow, but emergencies still need direct help from local authorities, a trusted contact, or qualified legal counsel.":
      "LexGuard உதவிக்கரமாக இருக்கும், ஆனால் அவசர சூழலில் உள்ளூர் அதிகாரிகள், நம்பகமான தொடர்பு, அல்லது தகுதியான சட்ட ஆலோசகரின் நேரடி உதவி இன்னும் அவசியம்.",
    Armed: "இயக்கப்பட்டது",
    Standby: "காத்திருப்பு",
    Live: "நேரலை",
    Off: "ஆஃப்",
    "Protection is on standby.": "பாதுகாப்பு காத்திருப்பில் உள்ளது.",
    "Location capture failed. Using fallback coordinates.": "இருப்பிடத்தை பெற முடியவில்லை. மாற்று கோஆர்டினேட்டுகள் பயன்படுத்தப்படுகின்றன.",
    "Emergency SMS sent.": "அவசர SMS அனுப்பப்பட்டது.",
    "Sending emergency SMS...": "அவசர SMS அனுப்பப்படுகிறது...",
    "Emergency mode enabled. Audio recording started.": "அவசர நிலை இயக்கப்பட்டது. ஒலி பதிவு தொடங்கப்பட்டது.",
    "Email delivery is unavailable until RESEND_API_KEY is configured.":
      "RESEND_API_KEY அமைக்கப்படும் வரை மின்னஞ்சல் அனுப்பல் கிடைக்காது.",
    "Email delivery is unavailable until RESEND_FROM_EMAIL is configured with a verified Resend sender.":
      "சரிபார்க்கப்பட்ட Resend அனுப்புநருடன் RESEND_FROM_EMAIL அமைக்கப்படும் வரை மின்னஞ்சல் அனுப்பல் கிடைக்காது.",
    "Email delivery failed because the sending domain is not verified in Resend. Update RESEND_FROM_EMAIL to a verified sender.":
      "அனுப்பும் டொமைன் Resend இல் சரிபார்க்கப்படாததால் மின்னஞ்சல் அனுப்பல் தோல்வியடைந்தது. RESEND_FROM_EMAIL ஐ சரிபார்க்கப்பட்ட அனுப்புநருக்கு மாற்றுங்கள்.",
    "Email delivery failed because the sender address is not verified in Resend. Update RESEND_FROM_EMAIL to a verified sender.":
      "அனுப்புநர் முகவரி Resend இல் சரிபார்க்கப்படாததால் மின்னஞ்சல் அனுப்பல் தோல்வியடைந்தது. RESEND_FROM_EMAIL ஐ சரிபார்க்கப்பட்ட அனுப்புநருக்கு மாற்றுங்கள்.",
    "Voice monitoring hit an error. You can still use the manual controls.":
      "குரல் கண்காணிப்பில் பிழை ஏற்பட்டது. நீங்கள் இன்னும் கைமுறை கட்டுப்பாடுகளை பயன்படுத்தலாம்.",
    "Speech recognition is not supported in this browser.": "இந்த உலாவியில் குரல் அடையாளம் ஆதரிக்கப்படவில்லை.",
    "Voice monitoring paused. Click the button again if needed.": "குரல் கண்காணிப்பு நிறுத்தப்பட்டுள்ளது. தேவைப்பட்டால் மீண்டும் பொத்தானை அழுத்துங்கள்.",
    "Voice monitoring could not start. Check microphone permissions and try again.":
      "குரல் கண்காணிப்பை தொடங்க முடியவில்லை. மைக்ரோஃபோன் அனுமதிகளை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
  }
};

export function useTranslatedText(input, options = {}) {
  const { session } = useSession();
  const { allowRemote = false } = options;
  const texts = useMemo(
    () =>
      (Array.isArray(input) ? input : [input]).map((item) => {
        if (item === null || item === undefined) {
          return "";
        }

        return String(item);
      }),
    [input]
  );
  const signature = useMemo(() => JSON.stringify(texts), [texts]);
  const [translated, setTranslated] = useState(texts);

  useEffect(() => {
    let cancelled = false;
    const dictionary = LOCAL_TRANSLATIONS[session.lang] || {};
    const localized = texts.map((item) => dictionary[item] || item);
    const unresolved = texts.filter((item) => item.trim() && !dictionary[item]);

    if (session.lang === "en" || !texts.some((item) => item.trim())) {
      setTranslated(texts);
      return () => {
        cancelled = true;
      };
    }

    if (!unresolved.length) {
      setTranslated(localized);
      return () => {
        cancelled = true;
      };
    }

    setTranslated(localized);

    if (!allowRemote) {
      return () => {
        cancelled = true;
      };
    }

    const runTranslation = async () => {
      try {
        const payload = await translateBatch(unresolved);
        if (!cancelled) {
          const resolved = payload?.translations || unresolved;
          let unresolvedIndex = 0;
          setTranslated(
            texts.map((item) => {
              if (dictionary[item]) {
                return dictionary[item];
              }
              const nextValue = resolved[unresolvedIndex] || item;
              unresolvedIndex += 1;
              return nextValue;
            })
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTranslated(localized);
        }
      }
    };

    runTranslation();

    return () => {
      cancelled = true;
    };
  }, [allowRemote, session.lang, signature]);

  return Array.isArray(input) ? translated : translated[0] || "";
}
