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
    "Natural language intake": "प्राकृतिक भाषा इनटेक"
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
    "Natural language intake": "இயல்பான மொழி உள்ளீடு"
  }
};

export function useTranslatedText(input) {
  const { session } = useSession();
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
  }, [session.lang, signature]);

  return Array.isArray(input) ? translated : translated[0] || "";
}
