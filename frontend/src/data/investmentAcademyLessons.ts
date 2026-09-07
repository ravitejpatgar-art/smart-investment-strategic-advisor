/**
 * SMARTVEST ACADEMY — LESSON CATALOGUE
 * 12 structured, beginner-friendly investing lessons with comprehensive educational transcripts,
 * learning points, key takeaways, multiple-choice quizzes, AI video prompts, and 8-language multilingual support.
 * All master videos are >= 120 seconds in duration.
 */

import type { InvestmentLesson, InvestmentLessonCategory } from '../types/investmentAcademy';

export interface AcademyCategoryOption {
  id: InvestmentLessonCategory;
  label: string;
}

export const ACADEMY_CATEGORIES: AcademyCategoryOption[] = [
  { id: 'Fundamentals', label: 'Fundamentals' },
  { id: 'Investment Products', label: 'Products' },
  { id: 'Investing Strategy', label: 'Strategy' },
  { id: 'India Investing', label: 'India' },
  { id: 'Core Principles', label: 'Principles' },
];

export const INVESTMENT_LESSONS: InvestmentLesson[] = [
  // ── 01. WHAT IS INVESTMENT? ──
  {
    id: 'what-is-investment',
    number: 1,
    title: 'What is Investment?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/investment.mp4',
    thumbnailUrl: '/academy/investment.webp',
    description: 'Learn the difference between saving and investing, and how putting capital to work in productive assets helps outpace inflation over time.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is Investment?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `Have you ever wondered why simply saving money in a bank account or cash locker is no longer enough to secure your financial future?\n\nSaving means keeping your unspent income safe in low-risk places. While saving preserves your nominal rupees, it suffers from a hidden threat called inflation. Over time, inflation causes prices of everyday goods, housing, and healthcare to rise, which constantly reduces the purchasing power of your idle cash.

Investing, on the other hand, means deploying your money into productive assets—such as company stocks, government and corporate bonds, mutual funds, or real estate—with the expectation that they will generate income, pay dividends, or appreciate in value over time.\n\nLet us look at a practical example. Imagine you have ₹10,000 today. If you keep this ₹10,000 in a zero-interest locker for 10 years, you will still have exactly ₹10,000. However, if inflation averages 6% per year, things that cost ₹10,000 today will cost nearly ₹18,000 in a decade. Your saved cash lost nearly half its real purchasing power.

If, instead, you invest that ₹10,000 into productive businesses or diversified mutual funds earning potential economic returns, your capital works alongside economic expansion to outpace inflation.\n\nA common beginner misunderstanding is thinking that investing is just gambling or speculative trading. That is incorrect. Speculation is betting on short-term price swings without regard to intrinsic value. Genuine investing is providing capital to real, productive businesses that create goods, employ people, and generate long-term profits.\n\nRemember: investing carries risk and never provides guaranteed returns. Asset prices fluctuate, and market downturns are a natural part of economic cycles. The goal of investing is to thoughtfully balance risk and time horizon so that your wealth grows sustainably over the long run.\n\nSaving preserves cash for today's emergencies; investing puts your capital to work to protect and grow your purchasing power for tomorrow.`,
    learningPoints: [
      "The key difference between saving (capital preservation) and investing (wealth creation).",
      "How inflation silently reduces the purchasing power of idle cash.",
      "Core asset classes: equities, fixed income, real estate, and commodities.",
      "Why risk and potential return are always linked in economic assets."
],
    keyTakeaway: 'Saving preserves cash for today; investing puts capital to work to help beat inflation over tomorrow.',
    quiz: [
      {
            "id": "q1-1",
            "question": "What is the primary difference between saving and investing?",
            "options": [
                  "Saving involves high risk, while investing has zero risk.",
                  "Saving preserves nominal money in safe cash equivalents, while investing puts capital into productive assets for potential growth.",
                  "Saving is only for retirees, while investing is only for students.",
                  "There is no difference; they are the exact same thing."
            ],
            "correctAnswer": 1,
            "explanation": "Saving focuses on capital preservation with immediate liquidity, whereas investing allocates capital into assets that have the potential to grow over time."
      },
      {
            "id": "q1-2",
            "question": "Why can leaving money idle in cash be a silent risk over long time horizons?",
            "options": [
                  "Banks might run out of paper currency.",
                  "Inflation gradually reduces the real purchasing power of your idle money.",
                  "Cash automatically expires after 5 years.",
                  "Stock markets will take your cash away."
            ],
            "correctAnswer": 1,
            "explanation": "Inflation causes prices of goods and services to rise, meaning the same nominal cash buys less over time."
      }
],
    relatedLessons: ["what-is-a-stock", "what-are-shares", "why-long-term-investing"],
    vestiqPrompt: 'Explain the difference between saving and investing using a simple real-world example.',
    languages: {
      en: {
        videoUrl: '/academy/en/investment.mp4',
        thumbnailUrl: '/academy/en/investment.webp',
        captionUrl: '/academy/en/investment.vtt',
        transcript: `Have you ever wondered why simply saving money in a bank account or cash locker is no longer enough to secure your financial future?\n\nSaving means keeping your unspent income safe in low-risk places. While saving preserves your nominal rupees, it suffers from a hidden threat called inflation. Over time, inflation causes prices of everyday goods, housing, and healthcare to rise, which constantly reduces the purchasing power of your idle cash.

Investing, on the other hand, means deploying your money into productive assets—such as company stocks, government and corporate bonds, mutual funds, or real estate—with the expectation that they will generate income, pay dividends, or appreciate in value over time.\n\nLet us look at a practical example. Imagine you have ₹10,000 today. If you keep this ₹10,000 in a zero-interest locker for 10 years, you will still have exactly ₹10,000. However, if inflation averages 6% per year, things that cost ₹10,000 today will cost nearly ₹18,000 in a decade. Your saved cash lost nearly half its real purchasing power.

If, instead, you invest that ₹10,000 into productive businesses or diversified mutual funds earning potential economic returns, your capital works alongside economic expansion to outpace inflation.\n\nA common beginner misunderstanding is thinking that investing is just gambling or speculative trading. That is incorrect. Speculation is betting on short-term price swings without regard to intrinsic value. Genuine investing is providing capital to real, productive businesses that create goods, employ people, and generate long-term profits.\n\nRemember: investing carries risk and never provides guaranteed returns. Asset prices fluctuate, and market downturns are a natural part of economic cycles. The goal of investing is to thoughtfully balance risk and time horizon so that your wealth grows sustainably over the long run.\n\nSaving preserves cash for today's emergencies; investing puts your capital to work to protect and grow your purchasing power for tomorrow.`,
        keyTakeaway: 'Saving preserves cash for today; investing puts capital to work to help beat inflation over tomorrow.'
      },
      hi: {
        videoUrl: '/academy/hi/investment.mp4',
        thumbnailUrl: '/academy/hi/investment.webp',
        captionUrl: '/academy/hi/investment.vtt',
        transcript: `नमस्ते! क्या आपने कभी सोचा है कि केवल बैंक खाते या घर में नकदी बचाकर रखना आपके वित्तीय भविष्य को सुरक्षित करने के लिए पर्याप्त क्यों नहीं है?\n\nबचत का अर्थ है अपनी बची हुई आय को कम जोखिम वाले बैंक खाते या लॉकर में सुरक्षित रखना। बचत आपके मूल रुपयों को तो सुरक्षित रखती है, लेकिन यह 'मुद्रास्फीति' यानी महंगाई के अदृश्य खतरे से नहीं बच पाती। समय के साथ, महंगाई के कारण रोजमर्रा की वस्तुओं, भोजन, शिक्षा और स्वास्थ्य सेवाओं की कीमतें लगातार बढ़ती हैं, जिससे आपकी रखी हुई नकदी की वास्तविक क्रय शक्ति घटती जाती है।

दूसरी ओर, निवेश का अर्थ है अपने धन को उत्पादक संपत्तियों—जैसे कि कंपनियों के शेयर, म्यूचुअल फंड, सरकारी बॉन्ड या रियल एस्टेट—में लगाना। इसका उद्देश्य समय के साथ नियमित आय, लाभांश प्राप्त करना या पूंजी में वृद्धि हासिल करना है ताकि आपका पैसा अर्थव्यवस्था के विकास के साथ बढ़ सके।\n\nआइए इसे एक सरल और व्यावहारिक उदाहरण से समझें। मान लीजिए आज आपके पास ₹10,000 हैं। यदि आप इस ₹10,000 को 10 वर्षों तक बिना किसी ब्याज के लॉकर में रखते हैं, तो 10 साल बाद भी आपके पास ₹10,000 ही रहेंगे। लेकिन अगर महंगाई की दर 6% प्रति वर्ष रहे, तो जो सामान आज ₹10,000 में मिलता है, 10 साल बाद उसकी कीमत लगभग ₹18,000 हो जाएगी। आपकी रखी हुई नकदी ने अपनी क्रय शक्ति का लगभग 45% हिस्सा खो दिया।

इसके विपरीत, यदि आप उस ₹10,000 को उत्पादक व्यवसायों, इंडेक्स फंड या म्यूचुअल फंड में समझदारी से निवेश करते हैं, तो आपकी पूंजी आर्थिक विस्तार के साथ बढ़ती है और महंगाई को आसानी से पीछे छोड़ सकती है।\n\nशुरुआती निवेशकों में एक आम गलतफहमी यह होती है कि निवेश करना सट्टेबाजी या जुआ है। यह बिल्कुल गलत है। सट्टेबाजी का मतलब बिना किसी आंतरिक मूल्य के अल्पकालिक मूल्य के उतार-चढ़ाव पर दांव लगाना है। जबकि वास्तविक निवेश वास्तविक व्यवसायों में पूंजी लगाना है जो उत्पाद बनाते हैं, रोजगार देते हैं और दीर्घकालिक लाभ कमाते हैं।\n\nध्यान रखें: निवेश में गारंटीड रिटर्न नहीं होता। संपत्तियों की कीमतें घटती-बढ़ती रहती हैं और बाजार में उतार-चढ़ाव आर्थिक चक्र का एक स्वाभाविक हिस्सा है। निवेश का उद्देश्य जोखिम और समय सीमा को संतुलित करना है ताकि आपकी संपत्ति लंबे समय में लगातार बढ़ सके।\n\nयाद रखें: बचत आज की आपात स्थितियों के लिए नकदी सुरक्षित रखती है; निवेश कल के लिए आपकी क्रय शक्ति को बढ़ाने और वित्तीय स्वतंत्रता पाने के लिए पूंजी को काम पर लगाता है।`,
        keyTakeaway: 'बचत आज की सुरक्षा के लिए है; निवेश कल की महंगाई को मात देकर संपत्ति बढ़ाने के लिए है।'
      },
      kn: {
        videoUrl: '/academy/kn/investment.mp4',
        thumbnailUrl: '/academy/kn/investment.webp',
        captionUrl: '/academy/kn/investment.vtt',
        transcript: `ನಮಸ್ಕಾರ! ಬ್ಯಾಂಕ್ ಖಾತೆಯಲ್ಲಿ ಅಥವಾ ಮನೆಯಲ್ಲಿ ಕೇವಲ ಹಣವನ್ನು ಉಳಿತಾಯ ಮಾಡುವುದರಿಂದ ಮಾತ್ರ ನಿಮ್ಮ ಆರ್ಥಿಕ ಭವಿಷ್ಯ ಸುರಕ್ಷಿತವಾಗಿರಲು ಸಾಧ್ಯವಿಲ್ಲ ಏಕೆ ಎಂದು ನೀವು ಎಂದಾದರೂ ಯೋಚಿಸಿದ್ದೀರಾ?\n\nಉಳಿತಾಯ ಎಂದರೆ ನಿಮ್ಮ ಉಳಿದ ಆದಾಯವನ್ನು ಕಡಿಮೆ ಅಪಾಯವಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಥವಾ ಲಾಕರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಇಡುವುದು. ಉಳಿತಾಯವು ನಿಮ್ಮ ಮೂಲ ರೂಪಾಯಿಗಳನ್ನು ಸಂರಕ್ಷಿಸುತ್ತದೆ, ಆದರೆ ಇದು 'ಹಣದುಬ್ಬರ' ಅಥವಾ ಬೆಲೆ ಏರಿಕೆಯ ಅದೃಶ್ಯ ಅಪಾಯವನ್ನು ಎದುರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಕಾಲಾನಂತರದಲ್ಲಿ, ಹಣದುಬ್ಬರದಿಂದಾಗಿ ದಿನನಿತ್ಯದ ವಸ್ತುಗಳು, ಆಹಾರ, ಶಿಕ್ಷಣ ಮತ್ತು ಆರೋಗ್ಯ ವೆಚ್ಚಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆ, ಇದರಿಂದ ನಿಮ್ಮ ಬಳಿಯಿರುವ ನಗದು ಹಣದ ಕೊಳ್ಳುವ ಶಕ್ತಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.

ಮತ್ತೊಂದೆಡೆ, ಹೂಡಿಕೆ ಎಂದರೆ ನಿಮ್ಮ ಹಣವನ್ನು ಉತ್ಪಾದಕ ಆಸ್ತಿಗಳಲ್ಲಿ—ಉದಾಹರಣೆಗೆ ಕಂಪನಿಗಳ ಷೇರುಗಳು, ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳು, ಬಾಂಡ್‌ಗಳು ಅಥವಾ ರಿಯಲ್ ಎಸ್ಟೇಟ್‌ನಲ್ಲಿ ತೊಡಗಿಸುವುದು. ಕಾಲಾನಂತರದಲ್ಲಿ ಲಾಭಾಂಶ, ನಿಯಮಿತ ಆದಾಯ ಮತ್ತು ಬಂಡವಾಳದ ಬೆಳವಣಿಗೆಯನ್ನು ಗಳಿಸುವುದು ಇದರ ಮುಖ್ಯ ಉದ್ದೇಶವಾಗಿದೆ.\n\nಇದನ್ನು ಒಂದು ಸರಳ ಉದಾಹರಣೆಯ ಮೂಲಕ ಅರ್ಥಮಾಡಿಕೊಳ್ಳೋಣ. ಇಂದು ನಿಮ್ಮ ಬಳಿ ₹10,000 ಇದೆ ಎಂದು ಭಾವಿಸೋಣ. ಈ ₹10,000 ಹಣವನ್ನು ಯಾವುದೇ ಬಡ್ಡಿಯಿಲ್ಲದ ಲಾಕರ್‌ನಲ್ಲಿ 10 ವರ್ಷಗಳ ಕಾಲ ಇಟ್ಟರೆ, 10 ವರ್ಷಗಳ ನಂತರವೂ ನಿಮ್ಮ ಬಳಿ ₹10,000 ಮಾತ್ರ ಇರುತ್ತದೆ. ಆದರೆ ಹಣದುಬ್ಬರವು ವಾರ್ಷಿಕವಾಗಿ 6% ಇದ್ದರೆ, ಇಂದು ₹10,000 ಗೆ ಸಿಗುವ ವಸ್ತುಗಳು 10 ವರ್ಷಗಳ ನಂತರ ಸುಮಾರು ₹18,000 ಆಗುತ್ತವೆ. ನಿಮ್ಮ ನಗದಿನ ಕೊಳ್ಳುವ ಶಕ್ತಿ ಸುಮಾರು 45% ಕಡಿಮೆಯಾಯಿತು.

ಅದೇ ₹10,000 ಹಣವನ್ನು ನೀವು ಉತ್ಪಾದಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಥವಾ ವೈವಿಧ್ಯಮಯ ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ಜಾಣ್ಮೆಯಿಂದ ಹೂಡಿಕೆ ಮಾಡಿದರೆ, ನಿಮ್ಮ ಬಂಡವಾಳವು ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಯೊಂದಿಗೆ ಬೆಳೆದು ಹಣದುಬ್ಬರವನ್ನು ಮೀರಿಸುತ್ತದೆ.\n\nಹೊಸ ಹೂಡಿಕೆದಾರರಲ್ಲಿ ಹೂಡಿಕೆ ಎಂದರೆ ಜೂಜು ಅಥವಾ ಊಹಾಪೋಹ ಎಂಬ ತಪ್ಪು ಕಲ್ಪನೆ ಇರುತ್ತದೆ. ಇದು ತಪ್ಪು. ಅಲ್ಪಾವಧಿಯ ಬೆಲೆ ಏರಿಳಿತಗಳ ಮೇಲೆ ಪಣತೊಡುವುದು ಊಹಾಪೋಹ. ಆದರೆ ನಿಜವಾದ ಹೂಡಿಕೆ ಎಂದರೆ ನೈಜ ಕಂಪನಿಗಳಲ್ಲಿ ಬಂಡವಾಳ ಹೂಡುವುದು, ಅವು ಉತ್ಪಾದನೆ ಮಾಡುತ್ತವೆ, ಉದ್ಯೋಗ ನೀಡುತ್ತವೆ ಮತ್ತು ದೀರ್ಘಾವಧಿಯ ಲಾಭ ತರುತ್ತವೆ.\n\nನೆನಪಿಡಿ: ಹೂಡಿಕೆಯಲ್ಲಿ ಖಚಿತವಾದ ಲಾಭದ ಗ್ಯಾರಂಟಿ ಇರುವುದಿಲ್ಲ. ಮಾರುಕಟ್ಟೆಯ ಬೆಲೆಗಳು ಏರಿಳಿತಗೊಳ್ಳುತ್ತವೆ. ಹೂಡಿಕೆಯ ಮುಖ್ಯ ಉದ್ದೇಶವೆಂದರೆ ಅಪಾಯ ಮತ್ತು ಸಮಯವನ್ನು ಸಮತೋಲನಗೊಳಿಸಿ ದೀರ್ಘಾವಧಿಯಲ್ಲಿ ಸ್ಥಿರವಾಗಿ ಸಂಪತ್ತನ್ನು ಹೆಚ್ಚಿಸುವುದು.\n\nನೆನಪಿಡಿ: ಉಳಿತಾಯವು ಇಂದಿನ ತುರ್ತು ರಕ್ಷಣೆಗೆ ನಗದನ್ನು ಕಾಯ್ದಿರಿಸುತ್ತದೆ; ಹೂಡಿಕೆಯು ನಾಳಿನ ಕೊಳ್ಳುವ ಶಕ್ತಿಯನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ ಪಡೆಯಲು ಬಂಡವಾಳವನ್ನು ಕೆಲಸಕ್ಕೆ ಹಚ್ಚುತ್ತದೆ.`,
        keyTakeaway: 'ಉಳಿತಾಯವು ಇಂದಿನ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ; ಹೂಡಿಕೆಯು ನಾಳಿನ ಹಣದುಬ್ಬರವನ್ನು ಸೋಲಿಸಿ ಸಂಪತ್ತು ಬೆಳೆಸಲು.'
      },
      te: {
        videoUrl: '/academy/te/investment.mp4',
        thumbnailUrl: '/academy/te/investment.webp',
        captionUrl: '/academy/te/investment.vtt',
        transcript: `నమస్కారం! కేవలం బ్యాంక్ ఖాతాలో లేదా ఇంట్లో నగదు రూపంలో డబ్బును దాచుకోవడం మీ ఆర్థిక భవిష్యత్తుకు ఎందుకు సరిపోదో మీరు ఎప్పుడైనా ఆలోచించారా?\n\nపొదుపు అంటే మీ మిగులు ఆదాయాన్ని తక్కువ రిస్క్ ఉండే బ్యాంక్ ఖాతా లేదా లాకర్‌లో భద్రపరచడం. పొదుపు మీ అసలు రూపాయలను భద్రంగా ఉంచుతుంది, కానీ ఇది 'ద్రవ్యోల్బణం' అంటే నిత్యావసర వస్తువుల ధరల పెరుగుదల అనే కనిపించని ముప్పును ఎదుర్కోలేదు. కాలక్రమేణా ద్రవ్యోల్బణం వల్ల సరుకులు, ఆహారం, విద్య, వైద్య ఖర్చులు నిరంతరం పెరుగుతాయి, దీనివల్ల మీ వద్ద ఉన్న నగదు కొనుగోలు శక్తి తగ్గుతుంది.

మరోవైపు, పెట్టుబడి అంటే మీ డబ్బును ఉత్పాదక ఆస్తులలో—అంటే కంపెనీల షేర్లు, మ్యూచువల్ ఫండ్లు, బాండ్లు లేదా రియల్ ఎస్టేట్‌లో పెట్టడం. దీర్ఘకాలంలో డివిడెండ్లు, స్థిరమైన ఆదాయం మరియు మూలధన వృద్ధిని సాధించడమే పెట్టుబడి ముఖ్య ఉద్దేశం.\n\nదీనిని ఒక సరళమైన ఉదాహరణతో అర్థం చేసుకుందాం. ఈ రోజు మీ వద్ద ₹10,000 ఉన్నాయనుకుందాం. ఈ ₹10,000 ని ఎలాంటి వడ్డీ లేని లాకర్‌లో 10 సంవత్సరాలు ఉంచితే, పదేళ్ల తర్వాత కూడా మీ వద్ద ₹10,000 మాత్రమే ఉంటాయి. కానీ ద్రవ్యోల్బణం రేటు సంవత్సరానికి 6% ఉంటే, ఈ రోజు ₹10,000 కు వచ్చే వస్తువులు 10 సంవత్సరాల తర్వాత దాదాపు ₹18,000 అవుతాయి. మీ వద్ద ఉన్న నగదు కొనుగోలు శక్తి దాదాపు 45% తగ్గిపోయింది.

అదే ₹10,000 ని మీరు ఉత్పాదక వ్యాపారాలలో లేదా వైవిధ్యభరితమైన మ్యూచువల్ ఫండ్లలో తెలివిగా పెట్టుబడి పెడితే, మీ మూలధనం ఆర్థిక వృద్ధితో పాటు పెరిగి ద్రవ్యోల్బణాన్ని సులభంగా అధిగమిస్తుంది.\n\nకొత్తగా పెట్టుబడి పెట్టేవారిలో పెట్టుబడి అంటే జూదం లేదా ఊహాగానాలు అనే అపోహ ఉంటుంది. ఇది చాలా తప్పు. స్వల్పకాలిక ధరల మార్పులపై పందెం కాయడం ఊహాగానం. కానీ అసలైన పెట్టుబడి అంటే ఉత్పత్తులను తయారు చేస్తూ, ఉద్యోగాలను సృష్టిస్తూ, దీర్ఘకాలిక లాభాలను ఆర్జించే నిజమైన వ్యాపారాలకు మూలధనాన్ని అందించడం.\n\nగుర్తుంచుకోండి: పెట్టుబడిలో ఎటువంటి గ్యారెంటీ రిటర్న్స్ ఉండవు. మార్కెట్ ధరలు హెచ్చుతగ్గులకు లోనవుతాయి. నష్టభయాన్ని మరియు కాలాన్ని సరిగ్గా సమతుల్యం చేసుకుని దీర్ಘకాలంలో సంపదను స్థిరంగా వృద్ధి చేసుకోవడమే పెట్టుబడి లక్ష్యం.\n\nగుర్తుంచుకోండి: పొదుపు నేటి అత్యవసరాలకు నగదును భద్రపరుస్తుంది; పెట్టుబడి రేపటి కొనుగోలు శక్తిని కాపాడటానికి మరియు ఆర్థిక స్వాతంత్ర్యం పొందడానికి మూలధనాన్ని పనిలో పెడుతుంది.`,
        keyTakeaway: 'పొదుపు నేటి అత్యవసరాలకు రక్షణ ఇస్తుంది; పెట్టుబడి రేపటి ద్రవ్యోల్బణాన్ని అధిగమించి సంపదను పెంచుతుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/investment.mp4',
        thumbnailUrl: '/academy/ta/investment.webp',
        captionUrl: '/academy/ta/investment.vtt',
        transcript: `வணக்கம்! வங்கிக் கணக்கிலோ அல்லது வீட்டிலோ பணத்தைச் சேமித்து வைப்பது மட்டும் உங்கள் நிதி எதிர்காலத்தைப் பாதுகாக்கப் போதுமானதாக இருக்காது என்பது பற்றி நீங்கள் எப்போதாவது யோசித்திருக்கிறீர்களா?\n\nசேமிப்பு என்பது உங்களின் உபரி வருமானத்தை குறைந்த ஆபத்துள்ள வங்கிக் கணக்கு அல்லது லாக்கரில் பாதுகாப்பாக வைப்பதாகும். சேமிப்பு உங்கள் மூல ரூபாய்களைப் பாதுகாக்கிறது, ஆனால் அது 'பணவீக்கம்' என்ற மறைமுக அச்சுறுத்தலை எதிர்கொள்ள முடியாது. காலப்போக்கில் பணவீக்கத்தால் உணவு, கல்வி, மருத்துவம் மற்றும் அத்தியாவசியப் பொருட்களின் விலைகள் தொடர்ந்து உயர்ந்து, உங்கள் பணத்தின் வாங்கும் சக்தியைக் குறைக்கிறது.

மறுபுறம், முதலீடு என்பது உங்கள் பணத்தை நிறுவனங்களின் பங்குகள், மியூச்சுவல் ஃபண்டுகள், அரசுப் பத்திரங்கள் அல்லது ரியல் எஸ்டேட் போன்ற உற்பத்தி சொத்துக்களில் ஈடுபடுத்துவதாகும். காலப்போக்கில் ஈவுத்தொகை, வழக்கமான வருமானம் மற்றும் மூலதன வளர்ச்சியை அடைவதே இதன் முக்கிய நோக்கமாகும்.\n\nஇதை ஒரு எளிய உதாரணத்தின் மூலம் புரிந்து கொள்வோம். இன்று உங்களிடம் ₹10,000 இருக்கிறது என்று வைத்துக்கொள்வோம். இந்த ₹10,000-ஐ வட்டி இல்லாத லாக்கரில் 10 ஆண்டுகள் வைத்திருந்தால், 10 ஆண்டுகளுக்குப் பிறகும் உங்களிடம் ₹10,000 மட்டுமே இருக்கும். ஆனால் பணவீக்கம் ஆண்டுக்கு 6% ஆக இருந்தால், இன்று ₹10,000-க்கு கிடைக்கும் பொருட்கள் 10 ஆண்டுகளுக்குப் பிறகு கிட்டத்தட்ட ₹18,000 ஆகும். உங்கள் பணத்தின் வாங்கும் திறன் 45% குறைந்துவிட்டது.

அதே ₹10,000-ஐ நீங்கள் நிறுவனப் பங்குகள் அல்லது மியூச்சுவல் ஃபண்டுகளில் புத்திசாலித்தனமாக முதலீடு செய்தால், உங்கள் மூலதனம் பொருளாதார வளர்ச்சியுடன் இணைந்து வளர்ந்து பணவீக்கத்தை எளிதாக விஞ்சும்.\n\nபுதிய முதலீட்டாளர்கள் முதலீடு என்பது சூதாட்டம் அல்லது ஊக வணிகம் என்று தவறாக நினைக்கிறார்கள். இது தவறு. குறுகிய கால விலை மாற்றங்களை நம்பி பணம் கட்டுவது ஊக வணிகம். ஆனால் உண்மையான முதலீடு என்பது உற்பத்தி செய்து, வேலைவாய்ப்புகளை உருவாக்கி, நீண்ட கால லாபம் தரும் உண்மையான தொழில்களுக்கு மூலதனம் வழங்குவதாகும்.\n\nநினைவில் கொள்ளுங்கள்: முதலீட்டில் உத்தரவாதமான லாபம் இருக்காது. சந்தை விலைகள் ஏற்ற இறக்கங்களுக்கு உட்பட்டவை. ஆபத்தையும் கால அவகாசத்தையும் சமநிலைப்படுத்தி நீண்ட காலத்தில் செல்வத்தை பெருக்குவதே முதலீட்டின் நோக்கம்.\n\nநினைவில் கொள்ளுங்கள்: சேமிப்பு இன்றைய அவசரத்திற்குப் பணத்தைப் பாதுகாக்கிறது; முதலீடு நாளைய வாங்கும் சக்தியைப் பாதுகாக்கவும் நிதி சுதந்திரம் பெறவும் மூலதனத்தை உழைக்க வைக்கிறது.`,
        keyTakeaway: 'சேமிப்பு என்பது இன்றைய அவசரத் தேவைக்கானது; முதலீடு என்பது நாளைய பணவீக்கத்தை வென்று செல்வத்தை உருவாக்குவது.'
      },
      ml: {
        videoUrl: '/academy/ml/investment.mp4',
        thumbnailUrl: '/academy/ml/investment.webp',
        captionUrl: '/academy/ml/investment.vtt',
        transcript: `നമസ്കാരം! ബാങ്ക് അക്കൗണ്ടിലോ വീട്ടിലോ വെറുതെ പണം സൂക്ഷിക്കുന്നത് നിങ്ങളുടെ സാമ്പത്തിക ഭാവിയെ സുരക്ഷിതമാക്കാൻ പര്യാപ്തമല്ലെന്ന് നിങ്ങൾ എപ്പോഴെങ്കിലും ചിന്തിച്ചിട്ടുണ്ടോ?\n\nസമ്പാദ്യം എന്നാൽ നിങ്ങളുടെ മിച്ചവരുമാനം റിസ്ക് കുറഞ്ഞ ബാങ്ക് അക്കൗണ്ടിലോ ലോക്കറിലോ സൂക്ഷിക്കുക എന്നതാണ്. ഇത് നിങ്ങളുടെ പണത്തെ സംരക്ഷിക്കുന്നുണ്ടെങ്കിലും, 'പണപ്പെരുപ്പം' അഥവാ വിലക്കയറ്റം എന്ന അദൃശ്യ ഭീഷണിയെ തടയാൻ സമ്പാദ്യത്തിന് കഴിയില്ല. കാലക്രമേണ നിത്യോപയോഗ സാധനങ്ങൾ, വിദ്യാഭ്യാസം, ചികിത്സ എന്നിവയുടെ ചിലവ് വർദ്ധിക്കുകയും നിങ്ങളുടെ പണത്തിന്റെ വാങ്ങൽ ശേഷി കുറയുകയും ചെയ്യുന്നു.

മറുവശത്ത്, നിക്ഷേപം എന്നാൽ നിങ്ങളുടെ പണം കമ്പനികളുടെ ഓഹരികൾ, മ്യൂച്വൽ ഫണ്ടുകൾ, ബോണ്ടുകൾ അല്ലെങ്കിൽ റിയൽ എസ്റ്റേറ്റ് തുടങ്ങിയ ഉൽപ്പാദനക്ഷമമായ ആസ്തികളിൽ വിനിയോഗിക്കുക എന്നതാണ്. ദീർഘകാലാടിസ്ഥാനത്തിൽ ലാഭവിഹിതം, വരുമാനം, മൂലധന വളർച്ച എന്നിവ നേടുകയാണ് ഇതിന്റെ ലക്ഷ്യം.\n\nഇതൊരു ലളിതമായ ഉദാഹരണത്തിലൂടെ മനസ്സിലാക്കാം. ഇന്ന് നിങ്ങളുടെ പക്കൽ ₹10,000 ഉണ്ടെന്ന് കരുതുക. ഈ തുക പലിശയില്ലാത്ത ലോക്കറിൽ 10 വർഷം സൂക്ഷിച്ചാൽ, 10 വർഷത്തിന് ശേഷവും നിങ്ങളുടെ പക്കൽ ₹10,000 മാത്രമേ ഉണ്ടാകൂ. എന്നാൽ വാർഷിക പണപ്പെരുപ്പം 6% ആണെങ്കിൽ, ഇന്ന് ₹10,000 വിലയുള്ള സാധനങ്ങൾക്ക് 10 വർഷത്തിന് ശേഷം ഏകദേശം ₹18,000 ആകും. നിങ്ങളുടെ പണത്തിന്റെ വാങ്ങൽ ശേഷി 45% കുറഞ്ഞു.

അതേ ₹10,000 നിങ്ങൾ മികച്ച കമ്പനികളിലോ മ്യൂച്വൽ ഫണ്ടുകളിലോ വിവേകപൂർവ്വം നിക്ഷേപിച്ചാൽ, നിങ്ങളുടെ പണം സാമ്പത്തിക വളർച്ചയോടൊപ്പം വർദ്ധിച്ച് പണപ്പെരുപ്പത്തെ എളുപ്പത്തിൽ മറികടക്കും.\n\nപുതിയ നിക്ഷേപകർ നിക്ഷേപത്തെ ചൂതാട്ടമോ ഊഹക്കച്ചവടമോ ആയി തെറ്റിദ്ധരിക്കാറുണ്ട്. ഇത് തെറ്റാണ്. ഹ്രസ്വകാല വിലവ്യതിയാനങ്ങളിൽ പന്തയം വെക്കുന്നതാണ് ഊഹക്കച്ചവടം. എന്നാൽ യഥാർത്ഥ നിക്ഷേപം എന്നത് ഉൽപ്പന്നങ്ങൾ നിർമ്മിക്കുകയും തൊഴിൽ നൽകുകയും ദീർഘകാല ലാഭം നേടുകയും ചെയ്യുന്ന ബിസിനസ്സുകളിൽ പങ്കാളിയാകലാണ്.\n\nഓർക്കുക: നിക്ഷേപത്തിൽ ഗ്യാരണ്ടീഡ് റിട്ടേൺസ് ഉണ്ടാകില്ല. വിപണി വിലകൾ മാറിക്കൊണ്ടിരിക്കും. റിസ്കും സമയവും ശരിയായി ക്രമീകരിച്ച് ദീർഘകാലത്ത് സമ്പത്ത് വർദ്ധിപ്പിക്കുകയാണ് നിക്ഷേപത്തിന്റെ ലക്ഷ്യം.\n\nഓർക്കുക: സമ്പാദ്യം ഇന്നത്തെ അടിയന്തര ആവശ്യങ്ങൾക്ക് പണം നൽകുന്നു; നിക്ഷേപം നാളത്തെ വാങ്ങൽ ശേഷി സംരക്ഷിക്കാനും സാമ്പത്തിക സ്വാതന്ത്ര്യം നേടാനും പണത്തെ ജോലി ചെയ്യിക്കുന്നു.`,
        keyTakeaway: 'സമ്പാദ്യം ഇന്നത്തെ അത്യാവശ്യങ്ങൾക്കുള്ളതാണ്; നിക്ഷേപം നാളത്തെ പണപ്പെരുപ്പത്തെ തോൽപ്പിച്ച് സമ്പത്ത് വളർത്താനാണ്.'
      },
      mr: {
        videoUrl: '/academy/mr/investment.mp4',
        thumbnailUrl: '/academy/mr/investment.webp',
        captionUrl: '/academy/mr/investment.vtt',
        transcript: `नमस्कार! फक्त बँक खात्यात किंवा घरात रोख रक्कम साठवून ठेवणे तुमच्या आर्थिक भविष्यासाठी पुरेसे का नाही, याचा तुम्ही कधी विचार केला आहे का?\n\nबचत म्हणजे तुमचे शिल्लक उत्पन्न कमी जोखीम असलेल्या बँक खात्यात किंवा लॉकरमध्ये सुरक्षित ठेवणे. बचत तुमच्या मूळ रुपयांचे रक्षण करते, परंतु ती 'महागाई' (इन्फ्लेशन) या अदृश्य धोक्यापासून वाचू शकत नाही. कालांतराने महागाईमुळे अन्नधान्य, शिक्षण, आरोग्य आणि रोजच्या वस्तूंच्या किमती सातत्याने वाढतात, ज्यामुळे तुमच्याकडील रोख रकमेची वास्तविक खरेदी क्षमता कमी होते.

दुसरीकडे, गुंतवणूक म्हणजे तुमचे पैसे उत्पादक मालमत्तेमध्ये—जसे की कंपन्यांचे शेअर्स, म्युच्युअल फंड, सरकारी रोखे किंवा रिअल इस्टेटमध्ये गुंतवणे. कालांतराने नियमित लाभांश, उत्पन्न आणि भांडवली वाढ मिळवणे हा गुंतवणुकीचा मुख्य उद्देश आहे.\n\nहे एका सोप्या उदाहरणाने समजून घेऊ. समजा आज तुमच्याकडे ₹10,000 आहेत. हे ₹10,000 तुम्ही 10 वर्षे लॉकरमध्ये ठेवले तर 10 वर्षांनंतरही तुमच्याकडे ₹10,000 च राहतील. पण महागाईचा दर वार्षिक 6% राहिला, तर आज ₹10,000 ला मिळणाऱ्या वस्तू 10 वर्षांनंतर जवळपास ₹18,000 ला मिळतील. तुमच्या रोखीची खरेदी क्षमता जवळपास 45% कमी झाली.

याउलट, जर तुम्ही तेच ₹10,000 चांगल्या कंपन्यांमध्ये किंवा म्युच्युअल फंडात हुशारीने गुंतवले, तर तुमचे भांडवल आर्थिक वाढीसोबत वाढून महागाईला सहज मागे टाकू शकते.\n\nनवीन गुंतवणूकदारांमध्ये गुंतवणूक म्हणजे जुगार किंवा सट्टेबाजी असा गैरसमज असतो. हे चुकीचे आहे. अल्पकालीन किमतीच्या चढ-उतारांवर पैज लावणे म्हणजे सट्टा. पण खरी गुंतवणूक म्हणजे प्रत्यक्ष व्यवसाय करणाऱ्या, उत्पादन करणाऱ्या आणि दीर्घकालीन नफा कमावणाऱ्या कंपन्यांना भांडवल पुरवणे होय.\n\nलक्षात ठेवा: गुंतवणुकीमध्ये हमी परतावा नसतो. बाजारभाव चढ-उतार होतात. जोखीम आणि कालावधीचा समतोल साधून दीर्घकाळात संपत्ती वाढवणे हेच गुंतवणुकीचे उद्दिष्ट आहे.\n\nलक्षात ठेवा: बचत आजच्या आपत्कालीन खर्चासाठी रोख रक्कम सुरक्षित ठेवते; गुंतवणूक उद्याच्या खरेदी क्षमतेचे रक्षण करण्यासाठी आणि आर्थिक स्वातंत्र्य मिळवण्यासाठी भांडवलाला कामाला लावते.`,
        keyTakeaway: 'बचत आजच्या सुरक्षेसाठी आहे; गुंतवणूक उद्याची महागाई मात करून संपत्ती वाढवण्यासाठी आहे.'
      },
      bn: {
        videoUrl: '/academy/bn/investment.mp4',
        thumbnailUrl: '/academy/bn/investment.webp',
        captionUrl: '/academy/bn/investment.vtt',
        transcript: `নমস্কার! আপনি কি কখনও ভেবে দেখেছেন যে কেবল ব্যাংক একাউন্টে বা ঘরে নগদ টাকা জমিয়ে রাখা আপনার আর্থিক ভবিষ্যতের সুরক্ষার জন্য কেন যথেষ্ট নয়?\n\nসঞ্চয় মানে আপনার অতিরিক্ত আয় কম ঝুঁকিপূর্ণ ব্যাংক একাউন্টে বা লকারে নিরাপদে রাখা। সঞ্চয় আপনার মূল টাকাকে নিরাপদ রাখে ঠিকই, কিন্তু এটি 'মুদ্রাস্ফীতি' বা জিনিসপত্রের মূল্যবৃদ্ধির অদৃশ্য বিপদ থেকে বাঁচতে পারে না। সময়ের সাথে সাথে মুদ্রাস্ফীতির কারণে খাদ্য, শিক্ষা, চিকিৎসা এবং নিত্যপ্রয়োজনীয় জিনিসপত্রের দাম ক্রমাগত বৃদ্ধি পায়, যা আপনার জমানো নগদ টাকার প্রকৃত ক্রয়ক্ষমতা কমিয়ে দেয়।

অন্যদিকে, বিনিয়োগ মানে আপনার অর্থকে লাভজনক ও উৎপাদনশীল সম্পদে—যেমন বিভিন্ন কোম্পানির শেয়ার, মিউচুয়াল ফান্ড, সরকারি বন্ড বা রিয়েল এস্টেটে নিয়োজিত করা। সময়ের সাথে সাথে নিয়মিত লভ্যাংশ, আয় এবং মূলধনী বৃদ্ধি অর্জন করাই বিনিয়োগের মূল উদ্দেশ্য।\n\nআসুন এটি একটি সহজ উদাহরণের মাধ্যমে বুঝে নিই। ধরুন আজ আপনার কাছে ₹১০,০০০ রয়েছে। এই ₹১০,০০০ যদি আপনি কোনো সুদ ছাড়া লকারে ১০ বছর রেখে দেন, তবে ১০ বছর পরেও আপনার কাছে ₹১০,০০০ টাকাই থাকবে। কিন্তু মুদ্রাস্ফীতি যদি বার্ষিক ৬% হারে বৃদ্ধি পায়, তবে আজ যে জিনিসপত্র ₹১০,০০০ টাকায় কেনা যায়, ১০ বছর পর তার দাম হবে প্রায় ₹১৮,০০০ টাকা। আপনার জমানো টাকার ক্রয়ক্ষমতা প্রায় ৪৫% হ্রাস পেল।

বিপরীতে, আপনি যদি সেই ₹১০,০০০ টাকা উৎপাদনশীল ব্যবসায় বা বৈচিত্র্যময় মিউচুয়াল ফান্ডে বুদ্ধিমত্তার সাথে বিনিয়োগ করেন, তবে আপনার মূলধন অর্থনৈতিক প্রবৃদ্ধির সাথে বৃদ্ধি পেয়ে মুদ্রাস্ফীতিকে সহজেই অতিক্রম করবে।\n\nনতুন বিনিয়োগকারীদের মধ্যে একটি সাধারণ ভুল ধারণা থাকে যে বিনিয়োগ করা মানে জুয়া খেলা বা ফটকাবাজি। এটি ভুল। স্বল্পমেয়াদী দামের ওঠানামার উপর বাজি ধরা ফটকাবাজি। কিন্তু আসল বিনিয়োগ হলো প্রকৃত উৎপাদনশীল কোম্পানিতে মূলধন প্রদান করা যা কর্মসংস্থান তৈরি করে এবং দীর্ঘমেয়াদে লাভ এনে দেয়।\n\nমনে রাখবেন: বিনিয়োগে কোনো নিশ্চিত রিটার্নের গ্যারান্টি থাকে না। বাজারের দাম ওঠানামা করে। ঝুঁকি এবং সময়সীমার ভারসাম্য বজায় রেখে দীর্ঘমেয়াদে সম্পদ বৃদ্ধি করাই বিনিয়োগের লক্ষ্য।\n\nমনে রাখবেন: সঞ্চয় আজকের জরুরি প্রয়োজনে নগদ টাকা রক্ষা করে; বিনিয়োগ আগামীকালের ক্রয়ক্ষমতা বৃদ্ধি ও আর্থিক স্বাধীনতা অর্জনের জন্য অর্থকে কাজে লাগায়।`,
        keyTakeaway: 'সঞ্চয় আজকের সুরক্ষার জন্য; বিনিয়োগ আগামীকালের মুদ্রাস্ফীতিকে পরাজিত করে সম্পদ বৃদ্ধির জন্য।'
      },
    }
  },
  // ── 02. WHAT IS A STOCK? ──
  {
    id: 'what-is-a-stock',
    number: 2,
    title: 'What is a Stock?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/stock.mp4',
    thumbnailUrl: '/academy/stock.webp',
    description: 'Understand what owning a company stock actually means, how equity works, and how shareholders participate in corporate growth.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is a Stock?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `When you hear about people investing in the stock market, what are they actually buying? Is a stock just a ticker symbol moving up and down on a screen?\n\nA stock—also referred to as equity—represents legal fractional ownership in a real corporation. When a company wants to expand its factories, hire talented engineers, or research new products, it can raise money by issuing stock to the public on organized stock exchanges like the National Stock Exchange of India, BSE, or NASDAQ.

When you purchase even a single stock of a company, you become an official shareholder. That means you own a proportional slice of the company's assets, brand value, and future profits.\n\nConsider a simple example. Imagine a well-known Indian beverage company that has divided its total equity into 10 lakh shares. If you buy 100 shares, you legally own 0.01% of that entire corporation.

As a shareholder, you can benefit in two primary ways:
First, through Capital Appreciation: if the company launches popular drinks, expands into new cities, and doubles its profits, the overall market value of the business rises, making your 100 shares more valuable.
Second, through Dividends: when the company generates surplus profits, its board of directors may distribute a portion of those earnings directly to shareholders as cash payments.\n\nMany beginners view stocks as lottery tickets that should make them rich overnight. In reality, a stock price reflects the underlying performance, competitive moat, and earnings power of a living business.\n\nHowever, investing in individual stocks involves business and market risk. If a company loses customers to competitors, manages debt poorly, or faces industry headwinds, its stock price can decline, resulting in capital loss.\n\nBuying a stock is not gambling on price charts—it is becoming a part-owner of a real business with a stake in its future success.`,
    learningPoints: [
      "A stock represents real partial ownership (equity) in a corporation.",
      "Companies issue stocks to raise capital for expansion, hiring, and research.",
      "Shareholders benefit from capital appreciation and potential dividend payouts.",
      "Stock prices fluctuate based on business performance and macroeconomic conditions."
],
    keyTakeaway: 'Buying a stock is not just trading tickers; it is becoming a part-owner of a real business.',
    quiz: [
      {
            "id": "q2-1",
            "question": "What does owning a stock in a company represent?",
            "options": [
                  "A personal loan you gave to the company CEO.",
                  "Legal fractional ownership in the corporation and a claim on its assets and future profits.",
                  "A guaranteed monthly salary from the company.",
                  "A temporary ticket that expires at the end of the trading day."
            ],
            "correctAnswer": 1,
            "explanation": "A stock represents equity\u2014legal fractional ownership in a business and its future earnings."
      },
      {
            "id": "q2-2",
            "question": "In what two primary ways can a shareholder earn returns?",
            "options": [
                  "Tax refunds and bank interest.",
                  "Capital appreciation (rising stock price) and potential dividends.",
                  "Free company products and store discounts.",
                  "Fixed monthly interest payments from the exchange."
            ],
            "correctAnswer": 1,
            "explanation": "Shareholders benefit from capital gains when share prices increase and cash dividends when companies distribute surplus profits."
      }
],
    relatedLessons: ["what-are-shares", "what-is-an-etf", "what-is-a-mutual-fund"],
    vestiqPrompt: 'How does buying a stock make me a fractional owner of a business?',
    languages: {
      en: {
        videoUrl: '/academy/en/stock.mp4',
        thumbnailUrl: '/academy/en/stock.webp',
        captionUrl: '/academy/en/stock.vtt',
        transcript: `When you hear about people investing in the stock market, what are they actually buying? Is a stock just a ticker symbol moving up and down on a screen?\n\nA stock—also referred to as equity—represents legal fractional ownership in a real corporation. When a company wants to expand its factories, hire talented engineers, or research new products, it can raise money by issuing stock to the public on organized stock exchanges like the National Stock Exchange of India, BSE, or NASDAQ.

When you purchase even a single stock of a company, you become an official shareholder. That means you own a proportional slice of the company's assets, brand value, and future profits.\n\nConsider a simple example. Imagine a well-known Indian beverage company that has divided its total equity into 10 lakh shares. If you buy 100 shares, you legally own 0.01% of that entire corporation.

As a shareholder, you can benefit in two primary ways:
First, through Capital Appreciation: if the company launches popular drinks, expands into new cities, and doubles its profits, the overall market value of the business rises, making your 100 shares more valuable.
Second, through Dividends: when the company generates surplus profits, its board of directors may distribute a portion of those earnings directly to shareholders as cash payments.\n\nMany beginners view stocks as lottery tickets that should make them rich overnight. In reality, a stock price reflects the underlying performance, competitive moat, and earnings power of a living business.\n\nHowever, investing in individual stocks involves business and market risk. If a company loses customers to competitors, manages debt poorly, or faces industry headwinds, its stock price can decline, resulting in capital loss.\n\nBuying a stock is not gambling on price charts—it is becoming a part-owner of a real business with a stake in its future success.`,
        keyTakeaway: 'Buying a stock is not just trading tickers; it is becoming a part-owner of a real business.'
      },
      hi: {
        videoUrl: '/academy/hi/stock.mp4',
        thumbnailUrl: '/academy/hi/stock.webp',
        captionUrl: '/academy/hi/stock.vtt',
        transcript: `जब आप लोगों को शेयर बाजार में निवेश करने की बात करते सुनते हैं, तो वे वास्तव में क्या खरीद रहे होते हैं? क्या स्टॉक केवल स्क्रीन पर ऊपर-नीचे होने वाला कोई नंबर है?\n\nस्टॉक—जिसे इक्विटी या शेयर भी कहा जाता है—किसी वास्तविक कंपनी में कानूनी आंशिक स्वामित्व का प्रतिनिधित्व करता है। जब किसी कंपनी को नए कारखाने खोलने, नए इंजीनियरों को नियुक्त करने या नए उत्पादों पर शोध करने के लिए पूंजी की आवश्यकता होती है, तो वह एनएसई (NSE) या बीएसई (BSE) जैसे स्टॉक एक्सचेंजों पर जनता को स्टॉक जारी करके धन जुटाती है।

जब आप किसी कंपनी का एक भी स्टॉक खरीदते हैं, तो आप उस कंपनी के आधिकारिक शेयरधारक बन जाते हैं। इसका मतलब है कि आप कंपनी की परिसंपत्तियों, ब्रांड मूल्य और भविष्य के मुनाफे के एक हिस्से के कानूनी मालिक बन जाते हैं।\n\nआइए एक व्यावहारिक उदाहरण देखें। मान लीजिए एक जानी-मानी भारतीय कंपनी ने अपनी कुल इक्विटी को 10 लाख शेयरों में विभाजित किया है। यदि आप उस कंपनी के 100 शेयर खरीदते हैं, तो आप उस पूरे निगम के 0.01% हिस्से के कानूनी मालिक हैं।

एक शेयरधारक के रूप में आप दो मुख्य तरीकों से लाभ कमा सकते हैं:
पहला, पूंजी वृद्धि या कैपिटल एप्रिसिएशन: यदि कंपनी बेहतरीन उत्पाद बनाती है, नए शहरों में व्यापार बढ़ाती है और अपना मुनाफा दोगुना करती है, तो उसके शेयर की कीमत बढ़ जाती है, जिससे आपके 100 शेयरों का मूल्य भी बढ़ जाता है।
दूसरा, लाभांश या डिविडेंड: जब कंपनी को अतिरिक्त लाभ होता है, तो उसका निदेशक मंडल उस मुनाफे का एक हिस्सा सीधे शेयरधारकों के बैंक खातों में नकद वितरित कर सकता है।\n\nकई नए निवेशक स्टॉक को लॉटरी टिकट की तरह देखते हैं जो उन्हें रातोंरात अमीर बना देगा। वास्तव में, किसी स्टॉक की कीमत उस व्यवसाय के प्रदर्शन, प्रतिस्पर्धी मजबूती और कमाई की क्षमता को दर्शाती है।\n\nहालांकि, व्यक्तिगत शेयरों में निवेश करने में व्यावसायिक और बाजार जोखिम शामिल होता है। यदि कोई कंपनी ग्राहकों को खो देती है या खराब प्रबंधन का शिकार होती है, तो उसके शेयर की कीमत गिर सकती है और आपको पूंजीगत नुकसान हो सकता है।\n\nस्टॉक खरीदना कोई सट्टा नहीं है—यह एक वास्तविक व्यवसाय का आंशिक मालिक बनना और उसकी भविष्य की सफलता में भागीदारी करना है।`,
        keyTakeaway: 'स्टॉक खरीदना केवल टिकर ट्रेड करना नहीं है; यह एक वास्तविक व्यवसाय का हिस्सेदार बनना है।'
      },
      kn: {
        videoUrl: '/academy/kn/stock.mp4',
        thumbnailUrl: '/academy/kn/stock.webp',
        captionUrl: '/academy/kn/stock.vtt',
        transcript: `ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವ ಬಗ್ಗೆ ಜನರು ಮಾತನಾಡುವುದನ್ನು ನೀವು ಕೇಳಿದಾಗ, ಅವರು ನಿಜವಾಗಿ ಏನನ್ನು ಖರೀದಿಸುತ್ತಿದ್ದಾರೆ? ಸ್ಟಾಕ್ ಎಂದರೆ ಕೇವಲ ಕಂಪ್ಯೂಟರ್ ಪರದೆಯ ಮೇಲಿನ ಸಂಖ್ಯೆಯೇ?\n\nಸ್ಟಾಕ್—ಅಥವಾ ಈಕ್ವಿಟಿ—ಎಂದರೆ ನಿಜವಾದ ಕಂಪನಿಯಲ್ಲಿ ಕಾನೂನುಬದ್ಧ ಭಾಗಶಃ ಮಾಲೀಕತ್ವ. ಒಂದು ಕಂಪನಿಗೆ ತನ್ನ ವ್ಯಾಪಾರ ವಿಸ್ತರಿಸಲು, ಹೊಸ ಕಾರ್ಖಾನೆಗಳನ್ನು ನಿರ್ಮಿಸಲು ಅಥವಾ ಸಂಶೋಧನೆ ಮಾಡಲು ಹಣ ಬೇಕಾದಾಗ, ಅದು ಎನ್‌ಎಸ್‌ಇ (NSE) ಅಥವಾ ಬಿಎಸ್‌ಇ (BSE) ಯಂತಹ ಷೇರು ವಿನಿಮಯ ಕೇಂದ್ರಗಳಲ್ಲಿ ಸಾರ್ವಜನಿಕರಿಗೆ ಷೇರುಗಳನ್ನು ಬಿಡುಗಡೆ ಮಾಡುತ್ತದೆ.

ನೀವು ಒಂದು ಕಂಪನಿಯ ಕೇವಲ ಒಂದು ಸ್ಟಾಕ್ ಖರೀದಿಸಿದರೂ, ನೀವು ಆ ಕಂಪನಿಯ ಅಧಿಕೃತ ಷೇರುದಾರರಾಗುತ್ತೀರಿ. ಇದರರ್ಥ ನೀವು ಕಂಪನಿಯ ಆಸ್ತಿಗಳು, ಬ್ರ್ಯಾಂಡ್ ಮೌಲ್ಯ ಮತ್ತು ಭವಿಷ್ಯದ ಲಾಭದ ಒಂದು ಪಾಲಿನ ಮಾಲೀಕರಾಗುತ್ತೀರಿ.\n\nಒಂದು ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆಯನ್ನು ನೋಡೋಣ. ಒಂದು ಪ್ರಮುಖ ಭಾರತೀಯ ಕಂಪನಿಯು ತನ್ನ ಒಟ್ಟು ಮಾಲೀಕತ್ವವನ್ನು 10 ಲಕ್ಷ ಷೇರುಗಳಾಗಿ ವಿಂಗಡಿಸಿದೆ ಎಂದು ಭಾವಿಸೋಣ. ನೀವು 100 ಷೇರುಗಳನ್ನು ಖರೀದಿಸಿದರೆ, ನೀವು ಆ ಇಡೀ ಕಂಪನಿಯ 0.01% ಮಾಲೀಕರಾಗುತ್ತೀರಿ.

ಷೇರುದಾರರಾಗಿ ನೀವು ಎರಡು ರೀತಿಯಲ್ಲಿ ಲಾಭ ಗಳಿಸಬಹುದು:
ಮೊದಲನೆಯದು, ಬಂಡವಾಳ ವೃದ್ಧಿ (Capital Appreciation): ಕಂಪನಿಯು ಉತ್ತಮ ಪ್ರಗತಿ ಸಾಧಿಸಿ ಲಾಭವನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಿದಾಗ, ಅದರ ಷೇರಿನ ಬೆಲೆ ಹೆಚ್ಚಾಗುತ್ತದೆ, ಇದರಿಂದ ನಿಮ್ಮ ಷೇರುಗಳ ಮೌಲ್ಯವೂ ಹೆಚ್ಚಾಗುತ್ತದೆ.
ಎರಡನೆಯದು, ಲಾಭಾಂಶ (Dividends): ಕಂಪನಿಯು ಹೆಚ್ಚುವರಿ ಲಾಭ ಗಳಿಸಿದಾಗ, ನಿರ್ದೇಶಕರ ಮಂಡಳಿಯು ಆ ಲಾಭದ ಒಂದು ಭಾಗವನ್ನು ಷೇರುದಾರರಿಗೆ ನಗದು ರೂಪದಲ್ಲಿ ವಿತರಿಸಬಹುದು.\n\nಹಲವಾರು ಹೊಸಬರು ಸ್ಟಾಕ್ ಅನ್ನು ರಾತ್ರೋರಾತ್ರಿ ಶ್ರೀಮಂತರಾಗುವ ಲಾಟರಿ ಎಂದು ಭಾವಿಸುತ್ತಾರೆ. ಆದರೆ ನೈಜವಾಗಿ ಸ್ಟಾಕ್ ಬೆಲೆಯು ಆ ಕಂಪನಿಯ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಗಳಿಕೆಯ ಸಾಮರ್ಥ್ಯವನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.\n\nವೈಯಕ್ತಿಕ ಷೇರುಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದರಲ್ಲಿ ವ್ಯವಹಾರದ ಅಪಾಯವಿರುತ್ತದೆ. ಕಂಪನಿಯು ನಷ್ಟ ಅನುಭವಿಸಿದರೆ, ಷೇರು ಬೆಲೆ ಕುಸಿದು ಬಂಡವಾಳ ನಷ್ಟವಾಗಬಹುದು.\n\nಸ್ಟಾಕ್ ಖರೀದಿಸುವುದು ಎಂದರೆ ಬೆಲೆಗಳ ಮೇಲೆ ಜೂಜಾಡುವುದಲ್ಲ—ಅದು ನೈಜ ವ್ಯವಹಾರದ ಪಾಲುದಾರರಾಗುವುದು ಮತ್ತು ಅದರ ಭವಿಷ್ಯದ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ಭಾಗವಹಿಸುವುದು.`,
        keyTakeaway: 'ಸ್ಟಾಕ್ ಖರೀದಿಸುವುದು ಎಂದರೆ ಕೇವಲ ಟ್ರೇಡಿಂಗ್ ಅಲ್ಲ; ಅದು ನೈಜ ವ್ಯವಹಾರದ ಮಾಲೀಕತ್ವವನ್ನು ಪಡೆಯುವುದು.'
      },
      te: {
        videoUrl: '/academy/te/stock.mp4',
        thumbnailUrl: '/academy/te/stock.webp',
        captionUrl: '/academy/te/stock.vtt',
        transcript: `స్టాక్ మార్కెట్లో పెట్టుబడి పెట్టడం గురించి ప్రజలు మాట్లాడటం మీరు విన్నప్పుడు, వారు అసలు ఏమి కొంటున్నారు? స్టాక్ అంటే స్క్రీన్ మీద పైకి కిందకి కదిలే ఒక సంఖ్య మాత్రమేనా?\n\nస్టాక్—దీనినే ఈక్విటీ లేదా షేర్ అని కూడా అంటారు—ఒక నిజమైన కంపెనీలో చట్టబద్ధమైన పాక్షిక యాజమాన్యాన్ని సూచిస్తుంది. ఒక కంపెనీ తన వ్యాపారాన్ని విస్తరించడానికి, కొత్త కర్మాగారాలు నిర్మించడానికి లేదా పరిశోధనల కోసం నిధులు అవసరమైనప్పుడు, అది ఎన్‌ఎస్‌ఈ (NSE) లేదా బిఎస్‌ఈ (BSE) వంటి స్టాక్ ఎక్స్ఛేంజీలలో ప్రజలకు షేర్లను జారీ చేయడం ద్వారా మూలధనాన్ని సేకరిస్తుంది.

మీరు ఒక కంపెనీకి చెందిన ఒక్క స్టాక్ కొనుగోలు చేసినా, మీరు ఆ కంపెనీ అధికారిక వాటాదారు లేదా షేర్‌హోల్డర్ అవుతారు. అంటే కంపెనీ ఆస్తులు, బ్రాండ్ విలువ మరియు భవిష్యత్ లాభాలలో మీరు చట్టబద్ధమైన వాటాను కలిగి ఉంటారు.\n\nఒక ఆచరణాత్మక ఉదాహరణను చూద్దాం. ఒక ప్రముఖ భారతీయ కంపెనీ తన మొత్తం ఈక్విటీని 10 లక్షల షేర్లుగా విభజించిందనుకుందాం. మీరు 100 షేర్లను కొనుగోలు చేస్తే, మీరు ఆ మొత్తం సంస్థలో 0.01% చట్టబద్ధమైన యజమాని అవుతారు.

షేర్‌హోల్డర్‌గా మీరు రెండు మార్గాల్లో లాభపడవచ్చు:
మొదటిది, క్యాపిటల్ అప్రిసియేషన్ (మూలధన వృద్ధి): కంపెనీ వ్యాపారాన్ని విస్తరించి లాభాలను రెట్టింపు చేసినప్పుడు, దాని షేర్ ధర పెరుగుతుంది, దీనివల్ల మీ 100 షేర్ల విలువ కూడా పెరుగుతుంది.
రెండవది, డివిడెండ్లు (లాభాల పంపిణీ): కంపెనీకి మిగులు లాభాలు వచ్చినప్పుడు, డైరెక్టర్ల బోర్డు ఆ లాభాలలో కొంత భాగాన్ని నేరుగా షేర్‌హోల్డర్ల బ్యాంక్ ఖాతాలకు నగదు రూపంలో పంపిణీ చేయవచ్చు.\n\nచాలామంది కొత్తవారు స్టాక్ అంటే రాత్రికి రాత్రే ధనవంతులను చేసే లాటరీ టిక్కెట్ లాంటిదని భావిస్తారు. కానీ నిజానికి స్టాక్ ధర అనేది కంపెనీ పనితీరు మరియు సంపాదన సామర్థ్యాన్ని ప్రతిబింబిస్తుంది.\n\nవ్యక్తిగత షేర్లలో పెట్టుబడి పెట్టడంలో వ్యాపార నష్టభయం ఉంటుంది. కంపెనీ నష్టపోతే షేరు ధర పడిపోయి మూలధన నష్టం కలగవచ్చు.\n\nస్టాక్ కొనడం అనేది ధరలపై జూదం ఆడటం కాదు—ఇది నిజమైన వ్యాపారంలో భాగస్వామి కావడం మరియు దాని భవిష్యత్ విజయాల్లో పాలుపంచుకోవడం.`,
        keyTakeaway: 'స్టాక్ కొనడం అంటే కేవలం ట్రేడింగ్ చేయడం కాదు; అది ఒక నిజమైన వ్యాపారంలో భాగస్వామ్యం పొందడం.'
      },
      ta: {
        videoUrl: '/academy/ta/stock.mp4',
        thumbnailUrl: '/academy/ta/stock.webp',
        captionUrl: '/academy/ta/stock.vtt',
        transcript: `பங்குச் சந்தையில் முதலீடு செய்வது பற்றி மக்கள் பேசுவதைக் கேட்கும்போது, அவர்கள் உண்மையில் எதை வாங்குகிறார்கள்? பங்கு என்பது வெறும் கணிப்பொறித் திரையில் ஏறி இறங்கும் எண்களா?\n\nபங்கு—அல்லது ஈக்விட்டி—என்பது ஒரு உண்மையான நிறுவனத்தில் சட்டப்பூர்வ பகுதி உரிமையைக் குறிக்கிறது. ஒரு நிறுவனம் தனது தொழிலை விரிவாக்க, புதிய தொழிற்சாலைகள் கட்ட அல்லது புதிய ஆராய்ச்சிகளை மேற்கொள்ள நிதி தேவைப்படும்போது, அது என்எஸ்இ (NSE) அல்லது பிஎஸ்இ (BSE) போன்ற பங்குச் சந்தைகளில் பொதுமக்களுக்குப் பங்குகளை வெளியிட்டு மூலதனத்தைத் திரட்டுகிறது.

நீங்கள் ஒரு நிறுவனத்தின் ஒரு பங்கை வாங்கினாலும் கூட, நீங்கள் அந்த நிறுவனத்தின் அதிகாரப்பூர்வ பங்குதாரர் ஆகிறீர்கள். அதாவது நிறுவனத்தின் சொத்துக்கள், பிராண்ட் மதிப்பு மற்றும் எதிர்கால லாபத்தில் நீங்கள் ஒரு பங்கைப் பெறுகிறீர்கள்.\n\nஒரு நடைமுறை உதாரணத்தைப் பார்ப்போம். ஒரு முன்னணி இந்திய நிறுவனம் தனது மொத்த உரிமையை 10 லட்சம் பங்குகளாகப் பிரித்துள்ளது என்று வைத்துக்கொள்வோம். நீங்கள் 100 பங்குகளை வாங்கினால், அந்த நிறுவனத்தின் 0.01% பகுதிக்கு நீங்கள் சட்டப்பூர்வ உரிமையாளர் ஆகிறீர்கள்.

ஒரு பங்குதாரராக நீங்கள் இரண்டு வழிகளில் பயனடையலாம்:
முதலாவதாக, மூலதன வளர்ச்சி (Capital Appreciation): நிறுவனம் சிறப்பாகச் செயல்பட்டு லாபத்தை இரட்டிப்பாக்கும்போது, அதன் பங்கு விலை உயரும், இதனால் உங்கள் பங்குகளின் மதிப்பும் அதிகரிக்கும்.
இரண்டாவதாக, ஈவுத்தொகை (Dividends): நிறுவனத்திற்கு உபரி லாபம் கிடைக்கும்போது, அதன் இயக்குனர் குழு அந்த லாபத்தில் ஒரு பகுதியை பங்குதாரர்களின் வங்கிக் கணக்கில் பணமாக வழங்கலாம்.\n\nபல புதிய முதலீட்டாளர்கள் பங்குகளை ஒரே இரவில் பணக்காரராக்கும் லாட்டரி சீட்டு என்று நினைக்கிறார்கள். உண்மையில் ஒரு பங்கின் விலை என்பது நிறுவனத்தின் உண்மையான செயல்பாடு மற்றும் வருவாய் ஈட்டும் திறனைப் பிரதிபலிக்கிறது.\n\nதனிப்பட்ட நிறுவனப் பங்குகளில் முதலீடு செய்வதில் வணிக ஆபத்துகள் உள்ளன. நிறுவனம் நஷ்டமடைந்தால், பங்கு விலை குறைந்து மூலதன இழப்பு ஏற்படலாம்.\n\nபங்கு வாங்குவது சூதாட்டம் அல்ல—அது ஒரு உண்மையான வணிகத்தின் பங்குதாரராக மாறுவது மற்றும் அதன் எதிர்கால வெற்றியில் பங்கேற்பது.`,
        keyTakeaway: 'பங்கு வாங்குவது என்பது வெறும் வர்த்தகம் மட்டுமல்ல; அது ஒரு உண்மையான நிறுவனத்தின் உரிமையாளராக மாறுவது.'
      },
      ml: {
        videoUrl: '/academy/ml/stock.mp4',
        thumbnailUrl: '/academy/ml/stock.webp',
        captionUrl: '/academy/ml/stock.vtt',
        transcript: `സ്റ്റോക്ക് മാർക്കറ്റിൽ നിക്ഷേപിക്കുന്നതിനെക്കുറിച്ച് ആളുകൾ സംസാരിക്കുന്നത് കേൾക്കുമ്പോൾ, അവർ യഥാർത്ഥത്തിൽ എന്താണ് വാങ്ങുന്നത്? സ്റ്റോക്ക് എന്നാൽ സ്ക്രീനിൽ കയറിയിറങ്ങുന്ന അക്കങ്ങൾ മാത്രമാണോ?\n\nസ്റ്റോക്ക്—അഥവാ ഇക്വിറ്റി—എന്നാൽ ഒരു കമ്പനിയിലെ നിയമപരമായ ഭാഗിക ഉടമസ്ഥാവകാശമാണ്. ഒരു കമ്പനിക്ക് പുതിയ ഫാക്ടറികൾ സ്ഥാപിക്കാനോ പുതിയ ഉൽപ്പന്നങ്ങൾ വികസിപ്പിക്കാനോ പണം ആവശ്യമായി വരുമ്പോൾ, എൻഎസ്ഇ (NSE) അല്ലെങ്കിൽ ബിഎസ്ഇ (BSE) പോലുള്ള സ്റ്റോക്ക് എക്സ്ചേഞ്ചുകൾ വഴി പൊതുജനങ്ങൾക്ക് ഓഹരികൾ വിതരണം ചെയ്ത് മൂലധനം സമാഹരിക്കുന്നു.

നിങ്ങൾ ഒരു കമ്പനിയുടെ ഒരു സ്റ്റോക്ക് വാങ്ങിയാൽ പോലും, നിങ്ങൾ ആ കമ്പനിയുടെ ഔദ്യോഗിക ഷെയർഹോൾഡറായി മാറുന്നു. അതായത് കമ്പനിയുടെ ആസ്തികളിലും ലാഭത്തിലും നിങ്ങൾക്ക് ഒരു വിഹിതം ലഭിക്കുന്നു.\n\nഒരു പ്രായോഗിക ഉദാഹരണം നോക്കാം. ഒരു പ്രമുഖ ഇന്ത്യൻ കമ്പനി അവരുടെ ഉടമസ്ഥാവകാശം 10 ലക്ഷം ഷെയറുകളായി വിഭജിച്ചിരിക്കുന്നു എന്ന് കരുതുക. നിങ്ങൾ 100 ഷെയറുകൾ വാങ്ങിയാൽ, നിങ്ങൾ ആ സ്ഥാപനത്തിന്റെ 0.01% ഉടമയായി മാറുന്നു.

ഒരു ഷെയർഹോൾഡർ എന്ന നിലയിൽ നിങ്ങൾക്ക് രണ്ട് തരത്തിൽ ലാഭം ലഭിക്കാം:
ഒന്ന്, ക്യാപിറ്റൽ അപ്രീസിയേഷൻ (മൂലധന വളർച്ച): കമ്പനി മികച്ച രീതിയിൽ പ്രവർത്തിച്ച് ലാഭം വർദ്ധിപ്പിക്കുമ്പോൾ, അതിന്റെ ഓഹരി വില ഉയരുന്നു, ഇത് നിങ്ങളുടെ ഷെയറുകളുടെ മൂല്യം വർദ്ധിപ്പിക്കുന്നു.
രണ്ട്, ഡിവിഡന്റുകൾ (ലാഭവിഹിതം): കമ്പനിക്ക് അധിക ലാഭം ലഭിക്കുമ്പോൾ, അതിന്റെ ഒരു ഭാഗം ഷെയർഹോൾഡർമാർക്ക് പണമായി നൽകാൻ ഡയറക്ടർ ബോർഡിന് തീരുമാനിക്കാം.\n\nപലരും സ്റ്റോക്കുകളെ ഒറ്റരാത്രികൊണ്ട് പണക്കാരനാക്കുന്ന ലോട്ടറിയായി കാണുന്നു. എന്നാൽ യഥാർത്ഥത്തിൽ സ്റ്റോക്ക് വില പ്രതിഫലിപ്പിക്കുന്നത് കമ്പനിയുടെ പ്രവർത്തനക്ഷമതയെയും വരുമാന സാധ്യതകളെയുമാണ്.\n\nവ്യക്തിഗത സ്റ്റോക്കുകളിൽ നിക്ഷേപിക്കുന്നതിൽ ബിസിനസ് റിസ്ക് ഉണ്ട്. കമ്പനിക്ക് നഷ്ടം സംഭവിച്ചാൽ ഓഹരി വില കുറഞ്ഞ് മൂലധന നഷ്ടം വരാം.\n\nസ്റ്റോക്ക് വാങ്ങുന്നത് വിലകളിൽ ചൂതാട്ടം കളിക്കലല്ല—അതൊരു യഥാർത്ഥ ബിസിനസ്സിന്റെ പങ്കാളിയാകലും അതിന്റെ ഭാവി വിജയത്തിൽ പങ്കുചേരലുമാണ്.`,
        keyTakeaway: 'സ്റ്റോക്ക് വാങ്ങുക എന്നാൽ വെറും ട്രേഡിംഗ് അല്ല; അത് ഒരു യഥാർത്ഥ ബിസിനസ്സിന്റെ ഉടമസ്ഥാവകാശം നേടലാണ്.'
      },
      mr: {
        videoUrl: '/academy/mr/stock.mp4',
        thumbnailUrl: '/academy/mr/stock.webp',
        captionUrl: '/academy/mr/stock.vtt',
        transcript: `जेव्हा लोक शेअर बाजारात गुंतवणूक करण्याबद्दल बोलतात, तेव्हा ते नेमके काय खरेदी करत असतात? स्टॉक म्हणजे फक्त स्क्रीनवर वर-खाली होणारा आकडा असतो का?\n\nस्टॉक—ज्याला इक्विटी किंवा शेअर असेही म्हणतात—एका खऱ्या कंपनीतील कायदेशीर अंशतः मालकी दर्शवतो. जेव्हा एखाद्या कंपनीला नवीन कारखाने उभारण्यासाठी, नवीन अभियंते नियुक्त करण्यासाठी किंवा नवीन उत्पादनांवर संशोधन करण्यासाठी भांडवलाची आवश्यकता असते, तेव्हा ती एनएसई (NSE) किंवा बीएसई (BSE) सारख्या शेअर बाजारात जनतेला शेअर्स जारी करून निधी उभारते.

तुम्ही कंपनीचा एक जरी स्टॉक खरेदी केला तरी तुम्ही त्या कंपनीचे अधिकृत भागधारक (शेअरहोल्डर) बनता. म्हणजेच कंपनीची मालमत्ता, ब्रँड मूल्य आणि भविष्यातील नफ्यावर तुमचा कायदेशीर हक्क असतो.\n\nएक व्यावहारिक उदाहरण पाहू. समजा एका प्रसिद्ध भारतीय कंपनीने तिची एकूण मालकी 10 लाख शेअर्समध्ये विभागली आहे. तुम्ही 100 शेअर्स खरेदी केले तर तुम्ही त्या संपूर्ण कंपनीचे 0.01% कायदेशीर मालक बनता.

शेअरधारक म्हणून तुम्हाला दोन प्रकारे फायदा होऊ शकतो:
पहिले, भांडवली नफा (Capital Appreciation): कंपनीने उत्कृष्ट कामगिरी करून नफा दुप्पट केल्यास शेअरची किंमत वाढते, ज्यामुळे तुमच्या 100 शेअर्सचे मूल्य वाढते.
दुसरे, लाभांश (Dividends): कंपनीला अतिरिक्त नफा झाल्यावर संचालक मंडळ त्या नफ्यातील काही भाग थेट शेअरधारकांच्या बँक खात्यात रोख स्वरूपात वितरित करू शकते.\n\nअनेक नवीन गुंतवणूकदार स्टॉकला एका रात्रीत श्रीमंत करणारी लॉटरी समजतात. प्रत्यक्षात स्टॉकची किंमत त्या व्यवसायाची खरी कामगिरी आणि नफा कमावण्याची क्षमता दर्शवते.\n\nवैयक्तिक शेअर्समध्ये गुंतवणूक करताना व्यावसायिक जोखीम असते. कंपनीचे नुकसान झाल्यास शेअरची किंमत घसरून भांडवली तोटा होऊ शकतो.\n\nस्टॉक खरेदी करणे म्हणजे सट्टा खेळणे नाही—तो एका खऱ्या व्यवसायाचा भागीदार होण्याचा आणि त्याच्या भावी यशात सहभागी होण्याचा मार्ग आहे.`,
        keyTakeaway: 'स्टॉक खरेदी करणे म्हणजे केवळ ट्रेडिंग नाही; ती एका खऱ्या व्यवसायाची मालकी मिळवणे आहे.'
      },
      bn: {
        videoUrl: '/academy/bn/stock.mp4',
        thumbnailUrl: '/academy/bn/stock.webp',
        captionUrl: '/academy/bn/stock.vtt',
        transcript: `যখন মানুষ স্টক মার্কেটে বিনিয়োগের কথা বলে, তখন তারা আসলে কী ক্রয় করে? স্টক কি শুধুই স্ক্রিনে ওঠানামা করা কোনো সংখ্যা?\n\nস্টক—যাকে ইক্যুইটি বা শেয়ারও বলা হয়—একটি বাস্তব কোম্পানিতে আইনগত আংশিক মালিকানা নির্দেশ করে। একটি কোম্পানির যখন ব্যবসা বিস্তার করতে, নতুন কারখানা স্থাপন করতে বা গবেষণার জন্য অর্থের প্রয়োজন হয়, তখন তারা এনএসই (NSE) বা বিএসই (BSE)-এর মতো স্টক এক্সচেঞ্জে সাধারণ মানুষের কাছে শেয়ার ছেড়ে মূলধন সংগ্রহ করে।

আপনি যখন কোনো কোম্পানির একটি মাত্র স্টকও কেনেন, তখন আপনি সেই কোম্পানির একজন অফিসিয়াল শেয়ারহোল্ডার হয়ে ওঠেন। এর অর্থ হলো কোম্পানির সম্পদ, ব্র্যান্ডের মূল্য এবং ভবিষ্যতের লাভের একটি অংশের আপনি আইনগত মালিক।\n\nএকটি বাস্তব উদাহরণ দেখা যাক। ধরুন একটি শীর্ষস্থানীয় ভারতীয় কোম্পানি তাদের মোট মালিকানাকে ১০ লাখ শেয়ারে বিভক্ত করেছে। আপনি যদি ১০০টি শেয়ার কেনেন, তবে আপনি সেই পুরো কোম্পানির ০.০১% অংশের আইনগত মালিক।

একজন শেয়ারহোল্ডার হিসেবে আপনি দুটি প্রধান উপায়ে লাভবান হতে পারেন:
প্রথমত, মূলধন বৃদ্ধি (Capital Appreciation): কোম্পানি ভালো পারফর্ম করে লাভ দ্বিগুণ করলে শেয়ারের দাম বাড়ে, যা আপনার ১০০টি শেয়ারের মূল্য বাড়িয়ে দেয়।
দ্বিতীয়ত, ডিভিডেন্ড বা লভ্যাংশ (Dividends): কোম্পানির অতিরিক্ত লাভ হলে পরিচালনা পর্ষদ সেই লাভের একটি অংশ সরাসরি শেয়ারহোল্ডারদের ব্যাংক একাউন্টে নগদ প্রদান করতে পারে।\n\nঅনেকে স্টককে রাতারাতি ধনী হওয়ার লটারি মনে করেন। প্রকৃতপক্ষে স্টকের দাম ব্যবসার প্রকৃত কর্মক্ষমতা এবং লাভ করার ক্ষমতাকে প্রতিফলিত করে।\n\nব্যক্তিগত স্টকে বিনিয়োগ করার ক্ষেত্রে ব্যবসায়িক ঝুঁকি থাকে। কোম্পানি ক্ষতিগ্রস্ত হলে শেয়ারের দাম কমে মূলধনী ক্ষতি হতে পারে।\n\nস্টক কেনা কোনো জুয়া নয়—এটি একটি বাস্তব ব্যবসার অংশীদার হওয়া এবং তার ভবিষ্যৎ সাফল্যে অংশগ্রহণ করা।`,
        keyTakeaway: 'স্টক কেনা মানে কেবল ট্রেডিং করা নয়; এটি একটি বাস্তব ব্যবসার অংশীদার হওয়া।'
      },
    }
  },
  // ── 03. WHAT ARE SHARES? ──
  {
    id: 'what-are-shares',
    number: 3,
    title: 'What are Shares?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/shares.mp4',
    thumbnailUrl: '/academy/shares.webp',
    description: 'Learn the distinction between stock and shares, the pizza slice analogy, market capitalization, and stock split mechanics.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What are Shares?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `People frequently use the terms 'stock' and 'shares' in financial conversations, but do you know the precise distinction between them?\n\nWhile 'stock' refers to the overarching concept of corporate ownership or equity in general, a 'share' represents the specific, countable unit of that ownership.

Think of a large pizza: the entire pizza represents the company's total equity stock, and each individual slice is a single share. By counting the number of shares an investor holds relative to the total shares issued, you can determine their exact percentage ownership of the business.\n\nLet us understand this with simple numbers and the concept of Market Capitalization.
Suppose an enterprise divides its total ownership into 1 Crore shares, and each share currently trades on the stock exchange at ₹500. The total value of the company—known as its Market Capitalization—is calculated as 1 Crore shares multiplied by ₹500, which equals ₹500 Crore.

If you purchase 100 shares, you have invested ₹50,000 and hold a tangible stake in that ₹500 Crore enterprise.

Now, suppose the company announces a 2-for-1 stock split to make its shares more accessible. You will now receive 200 shares, while the price adjusts to ₹250 per share. Your total investment value remains exactly ₹50,000, but you now hold twice as many ownership units.\n\nA common misconception among beginners is assuming that a stock trading at ₹50 is automatically 'cheaper' than a stock trading at ₹5,000. That is a mistake! Valuation depends on total market cap, corporate earnings, and price-to-earnings ratios, not the nominal per-share price.\n\nBe mindful of share dilution, which happens when a company issues massive numbers of new shares, potentially reducing the value of existing shareholders' stakes.\n\nShares are the countable units of company ownership; multiplying the total share count by share price gives the full market value of the business.`,
    learningPoints: [
      "Shares are the countable units of ownership; stock is the overarching concept of equity.",
      "The Pizza Analogy: total company equity is the pizza; each slice is a share.",
      "Market Capitalization formula: Total Outstanding Shares multiplied by Current Share Price.",
      "Stock splits increase share count and reduce per-share price without changing total investment value."
],
    keyTakeaway: 'Shares are the countable units of company ownership; share price times total shares equals market cap.',
    quiz: [
      {
            "id": "q3-1",
            "question": "If a company has 1 Crore total shares and each share trades at \u20b9500, what is its Market Capitalization?",
            "options": [
                  "\u20b950 Lakhs",
                  "\u20b9500 Crore",
                  "\u20b95 Crore",
                  "\u20b95,000 Crore"
            ],
            "correctAnswer": 1,
            "explanation": "Market Capitalization is calculated as Total Outstanding Shares (1 Crore) multiplied by Share Price (\u20b9500), which equals \u20b9500 Crore."
      },
      {
            "id": "q3-2",
            "question": "What happens to an investor's total invested value during a 2-for-1 stock split?",
            "options": [
                  "Their investment value automatically doubles.",
                  "Their total investment value remains identical, but they hold twice as many shares at half the per-share price.",
                  "They lose half of their money.",
                  "The company buys back all their shares."
            ],
            "correctAnswer": 1,
            "explanation": "A stock split increases the number of shares while proportionally lowering the share price; total invested value remains unchanged."
      }
],
    relatedLessons: ["what-is-a-stock", "what-is-an-etf", "what-is-compounding"],
    vestiqPrompt: 'Explain the difference between stock, shares, and market capitalization.',
    languages: {
      en: {
        videoUrl: '/academy/en/shares.mp4',
        thumbnailUrl: '/academy/en/shares.webp',
        captionUrl: '/academy/en/shares.vtt',
        transcript: `People frequently use the terms 'stock' and 'shares' in financial conversations, but do you know the precise distinction between them?\n\nWhile 'stock' refers to the overarching concept of corporate ownership or equity in general, a 'share' represents the specific, countable unit of that ownership.

Think of a large pizza: the entire pizza represents the company's total equity stock, and each individual slice is a single share. By counting the number of shares an investor holds relative to the total shares issued, you can determine their exact percentage ownership of the business.\n\nLet us understand this with simple numbers and the concept of Market Capitalization.
Suppose an enterprise divides its total ownership into 1 Crore shares, and each share currently trades on the stock exchange at ₹500. The total value of the company—known as its Market Capitalization—is calculated as 1 Crore shares multiplied by ₹500, which equals ₹500 Crore.

If you purchase 100 shares, you have invested ₹50,000 and hold a tangible stake in that ₹500 Crore enterprise.

Now, suppose the company announces a 2-for-1 stock split to make its shares more accessible. You will now receive 200 shares, while the price adjusts to ₹250 per share. Your total investment value remains exactly ₹50,000, but you now hold twice as many ownership units.\n\nA common misconception among beginners is assuming that a stock trading at ₹50 is automatically 'cheaper' than a stock trading at ₹5,000. That is a mistake! Valuation depends on total market cap, corporate earnings, and price-to-earnings ratios, not the nominal per-share price.\n\nBe mindful of share dilution, which happens when a company issues massive numbers of new shares, potentially reducing the value of existing shareholders' stakes.\n\nShares are the countable units of company ownership; multiplying the total share count by share price gives the full market value of the business.`,
        keyTakeaway: 'Shares are the countable units of company ownership; share price times total shares equals market cap.'
      },
      hi: {
        videoUrl: '/academy/hi/shares.mp4',
        thumbnailUrl: '/academy/hi/shares.webp',
        captionUrl: '/academy/hi/shares.vtt',
        transcript: `वित्तीय बातचीत में लोग अक्सर 'स्टॉक' और 'शेयर' शब्दों का इस्तेमाल करते हैं, लेकिन क्या आप उनके बीच का सटीक अंतर जानते हैं?\n\nयद्यपि 'स्टॉक' शब्द किसी कंपनी के समग्र स्वामित्व या इक्विटी के विचार को संदर्भित करता है, लेकिन 'शेयर' उस स्वामित्व की एक विशिष्ट, गणनीय इकाई को दर्शाता है।

इसे एक बड़े पिज्जा की तरह समझें: पूरा पिज्जा कंपनी की कुल इक्विटी या स्टॉक है, और उसका प्रत्येक अलग टुकड़ा एक 'शेयर' है। किसी निवेशक के पास कुल जारी किए गए शेयरों में से कितने शेयर हैं, यह गिनकर आप व्यवसाय में उनके सटीक स्वामित्व प्रतिशत की गणना कर सकते हैं।\n\nआइए इसे सरल आंकड़ों और मार्केट कैपिटलाइजेशन यानी बाजार पूंजीकरण की अवधारणा से समझें।
मान लीजिए एक कंपनी ने अपने कुल स्वामित्व को 1 करोड़ शेयरों में विभाजित किया है, और प्रत्येक शेयर वर्तमान में स्टॉक एक्सचेंज पर ₹500 पर ट्रेड कर रहा है। कंपनी का कुल बाजार मूल्य—जिसे मार्केट कैप कहा जाता है—1 करोड़ शेयर गुणा ₹500, यानी ₹500 करोड़ होगा।

यदि आप 100 शेयर खरीदते हैं, तो आपने ₹50,000 का निवेश किया है और उस ₹500 करोड़ की कंपनी में आपकी प्रत्यक्ष हिस्सेदारी है।

अब, मान लीजिए कंपनी शेयरों को अधिक सुलभ बनाने के लिए 2-फॉर-1 स्टॉक स्प्लिट की घोषणा करती है। अब आपको 100 के बदले 200 शेयर मिलेंगे, जबकि प्रति शेयर कीमत ₹250 हो जाएगी। आपके कुल निवेश का मूल्य ₹50,000 ही रहेगा, लेकिन अब आपके पास दोगुनी स्वामित्व इकाइयाँ होंगी।\n\nशुरुआती निवेशकों में एक आम गलत धारणा यह है कि ₹50 में बिकने वाला स्टॉक ₹5,000 में बिकने वाले स्टॉक से अपने आप 'सस्ता' होता है। यह एक बड़ी भूल है! मूल्यांकन कंपनी के मार्केट कैप, कुल कमाई और पी/ई रेशियो पर निर्भर करता है, न कि केवल प्रति शेयर कीमत पर।\n\nशेयर डाइल्यूशन से सावधान रहें, जो तब होता है जब कोई कंपनी बड़ी संख्या में नए शेयर जारी करती है, जिससे मौजूदा शेयरधारकों की हिस्सेदारी का मूल्य घट सकता है।\n\nशेयर्स स्वामित्व की व्यक्तिगत इकाइयाँ हैं; कुल शेयरों की संख्या को शेयर की कीमत से गुणा करने पर कंपनी का पूरा बाजार मूल्यांकन प्राप्त होता है।`,
        keyTakeaway: 'शेयर्स कंपनी के स्वामित्व की गणनीय इकाइयाँ हैं; कुल शेयर्स गुणा शेयर मूल्य बराबर मार्केट कैप।'
      },
      kn: {
        videoUrl: '/academy/kn/shares.mp4',
        thumbnailUrl: '/academy/kn/shares.webp',
        captionUrl: '/academy/kn/shares.vtt',
        transcript: `ಆರ್ಥಿಕ ಚರ್ಚೆಗಳಲ್ಲಿ ಜನರು 'ಸ್ಟಾಕ್' ಮತ್ತು 'ಷೇರು' ಎಂಬ ಪದಗಳನ್ನು ಬಳಸುತ್ತಾರೆ, ಆದರೆ ಅವುಗಳ ನಡುವಿನ ನಿಖರವಾದ ವ್ಯತ್ಯಾಸ ನಿಮಗೆ ತಿಳಿದಿದೆಯೇ?\n\n'ಸ್ಟಾಕ್' ಎಂಬುದು ಕಂಪನಿಯ ಒಟ್ಟು ಮಾಲೀಕತ್ವ ಅಥವಾ ಈಕ್ವಿಟಿಯ ಪರಿಕಲ್ಪನೆಯನ್ನು ಸೂಚಿಸಿದರೆ, 'ಷೇರು' ಎಂಬುದು ಆ ಮಾಲೀಕತ್ವದ ನಿರ್ದಿಷ್ಟ ಮತ್ತು ಎಣಿಸಬಹುದಾದ ಒಂದು ಘಟಕವಾಗಿದೆ.

ಇದನ್ನು ಒಂದು ದೊಡ್ಡ ಪಿಜ್ಜಾ ಎಂದು ಊಹಿಸಿಕೊಳ್ಳಿ: ಇಡೀ ಪಿಜ್ಜಾ ಕಂಪನಿಯ ಒಟ್ಟು ಸ್ಟಾಕ್ ಆಗಿದ್ದರೆ, ಅದರ ಪ್ರತಿಯೊಂದು ಪ್ರತ್ಯೇಕ ತುಂಡು ಒಂದು 'ಷೇರು' ಆಗಿದೆ. ಹೂಡಿಕೆದಾರರ ಬಳಿ ಎಷ್ಟು ಷೇರುಗಳಿವೆ ಎಂಬುದನ್ನು ಎಣಿಸಿ ಕಂಪನಿಯಲ್ಲಿ ಅವರ ನಿಖರ ಮಾಲೀಕತ್ವದ ಶೇಕಡಾವಾರು ಪ್ರಮಾಣವನ್ನು ತಿಳಿಯಬಹುದು.\n\nಇದನ್ನು ಮಾರ್ಕೆಟ್ ಕ್ಯಾಪಿಟಲೈಸೇಶನ್ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬಂಡವಾಳೀಕರಣದ ಪರಿಕಲ್ಪನೆಯೊಂದಿಗೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳೋಣ.
ಒಂದು ಕಂಪನಿಯು ತನ್ನ ಮಾಲೀಕತ್ವವನ್ನು 1 ಕೋಟಿ ಷೇರುಗಳಾಗಿ ವಿಂಗಡಿಸಿದೆ ಮತ್ತು ಪ್ರತಿ ಷೇರು ಪ್ರಸ್ತುತ ₹500 ಕ್ಕೆ ವಹಿವಾಟು ನಡೆಸುತ್ತಿದೆ ಎಂದು ಭಾವಿಸೋಣ. ಕಂಪನಿಯ ಒಟ್ಟು ಮೌಲ್ಯ 1 ಕೋಟಿ ಷೇರುಗಳು ಗುಣಿಸು ₹500, ಅಂದರೆ ₹500 ಕೋಟಿ ಆಗಿರುತ್ತದೆ.

ನೀವು 100 ಷೇರುಗಳನ್ನು ಖರೀದಿಸಿದರೆ, ನೀವು ₹50,000 ಹೂಡಿಕೆ ಮಾಡಿದ್ದೀರಿ ಮತ್ತು ಆ ₹500 ಕೋಟಿ ಕಂಪನಿಯಲ್ಲಿ ನೇರ ಪಾಲು ಹೊಂದಿದ್ದೀರಿ.

ಈಗ, ಕಂಪನಿಯು 2-ಫಾರ್-1 ಸ್ಟಾಕ್ ಸ್ಪ್ಲಿಟ್ ಘೋಷಿಸಿದರೆ, ನಿಮ್ಮ 100 ಷೇರುಗಳು 200 ಆಗುತ್ತವೆ ಮತ್ತು ಪ್ರತಿ ಷೇರಿನ ಬೆಲೆ ₹250 ಆಗುತ್ತದೆ. ನಿಮ್ಮ ಒಟ್ಟು ಹೂಡಿಕೆಯ ಮೌಲ್ಯ ₹50,000 ರಷ್ಟೇ ಇರುತ್ತದೆ, ಆದರೆ ಘಟಕಗಳು ದ್ವಿಗುಣಗೊಳ್ಳುತ್ತವೆ.\n\n₹50 ರ ಷೇರು ₹5,000 ರ ಷೇರಿಗಿಂತ 'ಅಗ್ಗ' ಎಂದು ಭಾವಿಸುವುದು ತಪ್ಪು. ಕಂಪನಿಯ ಮೌಲ್ಯಮಾಪನವು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ ಮತ್ತು ಗಳಿಕೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ, ಕೇವಲ ಷೇರಿನ ಬೆಲೆಯನ್ನಲ್ಲ.\n\nಕಂಪನಿಯು ಹೊಸ ಷೇರುಗಳನ್ನು ಅಧಿಕ ಪ್ರಮಾಣದಲ್ಲಿ ಬಿಡುಗಡೆ ಮಾಡಿದಾಗ ಷೇರು ದುರ್ಬಲಗೊಳ್ಳುವ ಅಪಾಯವನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಳ್ಳಿ.\n\nಷೇರುಗಳು ಕಂಪನಿಯ ಮಾಲೀಕತ್ವದ ಘಟಕಗಳು; ಒಟ್ಟು ಷೇರುಗಳ ಸಂಖ್ಯೆಯನ್ನು ಷೇರು ಬೆಲೆಯಿಂದ ಗುಣಿಸಿದಾಗ ಇಡೀ ಕಂಪನಿಯ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ ಸಿಗುತ್ತದೆ.`,
        keyTakeaway: 'ಷೇರುಗಳು ಕಂಪನಿಯ ಮಾಲೀಕತ್ವದ ಎಣಿಸಬಹುದಾದ ಘಟಕಗಳು; ಒಟ್ಟು ಷೇರುಗಳು ಗುಣಿಸು ಷೇರು ಬೆಲೆ ಎಂದರೆ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ.'
      },
      te: {
        videoUrl: '/academy/te/shares.mp4',
        thumbnailUrl: '/academy/te/shares.webp',
        captionUrl: '/academy/te/shares.vtt',
        transcript: `ఆర్థిక విషయాల్లో ప్రజలు తరచుగా 'స్టాక్' మరియు 'షేర్' అనే పదాలను వాడుతుంటారు, అయితే వాటి మధ్య ఉన్న ఖచ్చితమైన తేడా మీకు తెలుసా?\n\n'స్టాక్' అనేది కంపెనీ మొత్తం యాజమాన్యం లేదా ఈక్విటీ భావనను సూచిస్తుంది, అయితే 'షేర్' అనేది ఆ యాజమాన్యానికి సంబంధించిన ఒక నిర్దిష్టమైన, లెక్కించదగిన యూనిట్.

దీనిని ఒక పెద్ద పిజ్జాతో పోల్చవచ్చు: మొత్తం పిజ్జా కంపెనీ మొత్తం ఈక్విటీ స్టాక్ అయితే, దానిలోని ప్రతి ఒక్క ముక్క ఒక 'షేర్'. ఒక పెట్టుబడిదారుడి వద్ద ఎన్ని షేర్లు ఉన్నాయో లెక్కించడం ద్వారా కంపెనీలో వారి ఖచ్చితమైన యాజమాన్య శాతాన్ని తెలుసుకోవచ్చు.\n\nదీనిని మార్కెట్ క్యాపిటలైజేషన్ (మార్కెట్ క్యాప్) భావనతో అర్థం చేసుకుందాం.
ఒక కంపెనీ తన యాజమాన్యాన్ని 1 కోటి షేర్లుగా విభజించింది మరియు ప్రతి షేరు ప్రస్తుత మార్కెట్ ధర ₹500 అనుకుందాం. కంపెనీ మొత్తం మార్కెట్ విలువ 1 కోటి షేర్లు గుణకారం ₹500, అంటే ₹500 కోట్లు అవుతుంది.

మీరు 100 షేర్లను కొనుగోలు చేస్తే, మీరు ₹50,000 పెట్టుబడి పెట్టి ఆ ₹500 కోట్ల కంపెనీలో ప్రత్యక్ష వాటాను కలిగి ఉన్నట్లు.

ఇప్పుడు కంపెనీ 2-ఫర్-1 స్టాక్ స్ప్లిట్ ప్రకటిస్తే, మీ 100 షేర్లు 200 షేర్లు అవుతాయి మరియు ప్రతి షేరు ధర ₹250 అవుతుంది. మీ మొత్తం పెట్టుబడి విలువ ₹50,000 గానే ఉంటుంది, కానీ మీ వద్ద రెట్టింపు యూనిట్లు ఉంటాయి.\n\n₹50 లో దొరికే షేరు ₹5,000 షేరు కంటే 'చౌక' అని అనుకోవడం తప్పు. కంపెనీ విలువ అనేది మార్కెట్ క్యాప్ మరియు లాభాలపై ఆధారపడి ఉంటుంది, కేవలం ఒక్కో షేరు ధరపై కాదు.\n\nకంపెనీ భారీ సంఖ్యలో కొత్త షేర్లను విడుదల చేసినప్పుడు షేర్ విలువ పలుచనయ్యే ప్రమాదం ఉంటుంది.\n\nషేర్లు కంపెనీ యాజమాన్య యూనిట్లు; మొత్తం షేర్ల సంఖ్యను షేరు ధరతో గుణించినప్పుడు కంపెనీ మొత్తం మార్కెట్ విలువ వస్తుంది.`,
        keyTakeaway: 'షేర్లు కంపెనీ యాజమాన్యపు లెక్కించదగిన యూనిట్లు; మొత్తం షేర్లు గుణకారం షేర్ ధర సమానం మార్కెట్ క్యాప్.'
      },
      ta: {
        videoUrl: '/academy/ta/shares.mp4',
        thumbnailUrl: '/academy/ta/shares.webp',
        captionUrl: '/academy/ta/shares.vtt',
        transcript: `நிதி தொடர்பான உரையாடல்களில் மக்கள் 'ஸ்டாக்' மற்றும் 'ஷேர்' என்ற வார்த்தைகளைப் பயன்படுத்துகிறார்கள், ஆனால் அவற்றுக்கு இடையேயான துல்லியமான வேறுபாடு உங்களுக்குத் தெரியுமா?\n\n'ஸ்டாக்' என்பது நிறுவனத்தின் ஒட்டுமொத்த உரிமை அல்லது ஈக்விட்டியைக் குறிக்கும் போது, 'ஷேர்' என்பது அந்த உரிமையின் குறிப்பிட்ட, கணக்கிடக்கூடிய ஒரு அலகைக் குறிக்கிறது.

இதை ஒரு பெரிய பீட்சாவுடன் ஒப்பிடலாம்: முழு பீட்சாவும் நிறுவனத்தின் மொத்த மூலதனம் என்றால், அதன் ஒவ்வொரு துண்டும் ஒரு 'ஷேர்' ஆகும். ஒரு முதலீட்டாளரிடம் எத்தனை பங்குகள் உள்ளன என்பதைக் கணக்கிடுவதன் மூலம் நிறுவனத்தில் அவர்களின் உரிமை சதவீதத்தை அறியலாம்.\n\nஇதை சந்தை மூலதனம் (Market Cap) என்ற கருத்தின் மூலம் புரிந்து கொள்வோம்.
ஒரு நிறுவனம் தனது மொத்த உரிமையை 1 கோடி பங்குகளாகப் பிரித்துள்ளது மற்றும் ஒரு பங்கின் தற்போதைய விலை ₹500 என்று வைத்துக்கொள்வோம். நிறுவனத்தின் மொத்த சந்தை மதிப்பு 1 கோடி பங்குகள் பெருக்கல் ₹500, அதாவது ₹500 கோடி ஆகும்.

நீங்கள் 100 பங்குகளை வாங்கினால், நீங்கள் ₹50,000 முதலீடு செய்து அந்த ₹500 கோடி நிறுவனத்தில் நேரடிப் பங்கைப் பெற்றுள்ளீர்கள்.

இப்போது நிறுவனம் 2-க்கு-1 பங்குப் பிரிப்பை (Stock Split) அறிவித்தால், உங்கள் 100 பங்குகள் 200 பங்குகளாக மாறும் மற்றும் ஒரு பங்கின் விலை ₹250 ஆகும். உங்கள் மொத்த முதலீட்டு மதிப்பு ₹50,000 ஆகவே இருக்கும், ஆனால் உங்களிடம் இரட்டிப்பு அலகுகள் இருக்கும்.\n\n₹50 பங்கு ₹5,000 பங்கை விட 'மலிவானது' என்று நினைப்பது தவறு. நிறுவனத்தின் மதிப்பு என்பது சந்தை மதிப்பு மற்றும் லாபத்தைப் பொறுத்தது, வெறும் பங்கு விலையைப் பொறுத்ததல்ல.\n\nநிறுவனம் அதிக அளவில் புதிய பங்குகளை வெளியிடும் போது பங்கு மதிப்பு நீர்த்துப்போகும் அபாயத்தைக் கவனியுங்கள்.\n\nபங்குகள் நிறுவன உரிமையின் அலகுகள்; மொத்த பங்குகளின் எண்ணிக்கையை பங்கு விலையால் பெருக்கினால் நிறுவனத்தின் சந்தை மதிப்பு கிடைக்கும்.`,
        keyTakeaway: 'ஷேர்கள் என்பது நிறுவனத்தின் கணக்கிடக்கூடிய உரிமை அலகுகள்; மொத்த பங்குகள் பெருக்கல் பங்கு விலை சமம் சந்தை மதிப்பு.'
      },
      ml: {
        videoUrl: '/academy/ml/shares.mp4',
        thumbnailUrl: '/academy/ml/shares.webp',
        captionUrl: '/academy/ml/shares.vtt',
        transcript: `സാമ്പത്തിക ചർച്ചകളിൽ ആളുകൾ 'സ്റ്റോക്ക്', 'ഷെയർ' എന്നീ വാക്കുകൾ ഉപയോഗിക്കാറുണ്ട്, എന്നാൽ അവ തമ്മിലുള്ള കൃത്യമായ വ്യത്യാസം നിങ്ങൾക്ക് അറിയാമോ?\n\n'സ്റ്റോക്ക്' എന്നത് കമ്പനിയുടെ മൊത്തം ഉടമസ്ഥാവകാശത്തെ അല്ലെങ്കിൽ ഇക്വിറ്റിയെ സൂചിപ്പിക്കുമ്പോൾ, 'ഷെയർ' എന്നത് ആ ഉടമസ്ഥാവകാശത്തിന്റെ കൃത്യമായി എണ്ണാൻ കഴിയുന്ന ഒരു യൂണിറ്റാണ്.

ഇതൊരു വലിയ പിസ്സ പോലെ സങ്കൽപ്പിക്കുക: മുഴുവൻ പിസ്സയും കമ്പനിയുടെ മൊത്തം ഇക്വിറ്റിയാണെങ്കിൽ, അതിന്റെ ഓരോ കഷ്ണവും ഓരോ 'ഷെയർ' ആണ്. ഒരു നിക്ഷേപകന്റെ പക്കൽ എത്ര ഷെയറുകൾ ഉണ്ടെന്ന് എണ്ണിത്തിട്ടപ്പെടുത്തി കമ്പനിയിലെ അവരുടെ കൃത്യമായ ഉടമസ്ഥാവകാശ ശതമാനം കണ്ടെത്താം.\n\nഇത് മാർക്കറ്റ് ക്യാപിറ്റലൈസേഷൻ അഥവാ വിപണി മൂലധനം എന്ന ആശയത്തിലൂടെ മനസ്സിലാക്കാം.
ഒരു കമ്പനി അവരുടെ ഉടമസ്ഥാവകാശം 1 കോടി ഷെയറുകളായി വിഭജിച്ചിരിക്കുന്നു എന്നും നിലവിലെ ഷെയർ വില ₹500 ആണെന്നും കരുതുക. കമ്പനിയുടെ ആകെ വിപണി മൂല്യം 1 കോടി ഷെയറുകൾ ഗുണം ₹500, അതായത് ₹500 കോടി ആയിരിക്കും.

നിങ്ങൾ 100 ഷെയറുകൾ വാങ്ങിയാൽ, നിങ്ങൾ ₹50,000 നിക്ഷേപിച്ച് ആ ₹500 കോടി കമ്പനിയിൽ നേരിട്ട് പങ്ക് സ്വന്തമാക്കിയിരിക്കുന്നു.

ഇനി കമ്പനി 2-ഫോർ-1 സ്റ്റോക്ക് സ്പ്ലിറ്റ് പ്രഖ്യാപിച്ചാൽ, നിങ്ങളുടെ 100 ഷെയറുകൾ 200 ആയി മാറും, ഷെയർ വില ₹250 ആകും. നിങ്ങളുടെ മൊത്തം നിക്ഷേപ മൂല്യം ₹50,000 ആയിത്തന്നെ തുടരും, എന്നാൽ യൂണിറ്റുകളുടെ എണ്ണം ഇരട്ടിയാകും.\n\n₹50 വിലയുള്ള ഷെയർ ₹5,000 വിലയുള്ള ഷെയറിനേക്കാൾ 'വിലകുറഞ്ഞത്' എന്ന് കരുതുന്നത് തെറ്റാണ്. കമ്പനിയുടെ മൂല്യം മാർക്കറ്റ് ക്യാപ്, ലാഭം എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു, വെറും ഷെയർ വിലയെയല്ല.\n\nകമ്പനി വലിയ തോതിൽ പുതിയ ഷെയറുകൾ പുറത്തിറക്കുമ്പോൾ ഷെയർ മൂല്യം കുറയുന്ന സാഹചര്യം ശ്രദ്ധിക്കുക.\n\nഷെയറുകൾ എന്നത് ഉടമസ്ഥാവകാശത്തിന്റെ യൂണിറ്റുകളാണ്; ആകെ ഷെയറുകളെ ഷെയർ വിലകൊണ്ട് ഗുണിക്കുമ്പോൾ കമ്പനിയുടെ വിപണി മൂല്യം ലഭിക്കുന്നു.`,
        keyTakeaway: 'ഷെയറുകൾ എന്നത് കമ്പനി ഉടമസ്ഥാവകാശത്തിന്റെ എണ്ണാവുന്ന യൂണിറ്റുകളാണ്; ആകെ ഷെയറുകൾ ഗുണം ഷെയർ വില സമം മാർക്കറ്റ് ക്യാപ്.'
      },
      mr: {
        videoUrl: '/academy/mr/shares.mp4',
        thumbnailUrl: '/academy/mr/shares.webp',
        captionUrl: '/academy/mr/shares.vtt',
        transcript: `आर्थिक संभाषणांमध्ये लोक 'स्टॉक' आणि 'शेअर' हे शब्द वापरतात, पण त्यातील नेमका फरक तुम्हाला माहिती आहे का?\n\n'स्टॉक' हा शब्द कंपनीच्या एकूण मालकी किंवा इक्विटीच्या संकल्पनेचा संदर्भ देतो, तर 'शेअर' हे त्या मालकीचे एक विशिष्ट, मोजता येण्याजोगे एकक (युनिट) असते.

याची तुलना एका मोठ्या पिझ्झाशी करा: संपूर्ण पिझ्झा म्हणजे कंपनीची एकूण इक्विटी, आणि त्याचा प्रत्येक तुकडा म्हणजे एक 'शेअर'. गुंतवणूकदाराकडे किती शेअर्स आहेत हे मोजून कंपनीतील त्यांची अचूक मालकी टक्केवारी काढता येते.\n\nहे मार्केट कॅपिटलायझेशन (मार्केट कॅप) च्या संकल्पनेने समजून घेऊ.
एका कंपनीने तिची मालकी 1 कोटी शेअर्समध्ये विभागली आहे आणि सध्या एका शेअरची किंमत ₹500 आहे असे मानू. कंपनीचे एकूण बाजार मूल्य 1 कोटी शेअर्स गुणिले ₹500, म्हणजेच ₹500 कोटी होईल.

तुम्ही 100 शेअर्स खरेदी केल्यास तुम्ही ₹50,000 गुंतवून त्या ₹500 कोटींच्या कंपनीत थेट हिस्सा मिळवला आहे.

आता कंपनीने 2-फॉर-1 स्टॉक स्प्लिट जाहीर केल्यास, तुमचे 100 शेअर्स 200 शेअर्स होतील आणि किंमत ₹250 होईल. तुमची एकूण गुंतवणूक मूल्य ₹50,000 च राहील, पण युनिट्स दुप्पट होतील.\n\n₹50 चा शेअर ₹5,000 च्या शेअरपेक्षा 'स्वस्त' असतो असे मानणे चुकीचे आहे. कंपनीचे मूल्यांकन मार्केट कॅप आणि नफ्यावर अवलंबून असते, केवळ शेअरच्या किमतीवर नाही.\n\nकंपनीने मोठ्या प्रमाणावर नवीन शेअर्स जारी केल्यास शेअरचे मूल्य कमी होण्याचा धोका असतो.\n\nशेअर्स हे मालकीचे युनिट्स आहेत; एकूण शेअर्सच्या संख्येला शेअरच्या किमतीने गुणल्यास कंपनीचे एकूण बाजार मूल्य मिळते.`,
        keyTakeaway: 'शेअर्स म्हणजे कंपनीच्या मालकीचे मोजता येण्याजोगे युनिट्स; एकूण शेअर्स गुणिले शेअर किंमत म्हणजे मार्केट कॅप.'
      },
      bn: {
        videoUrl: '/academy/bn/shares.mp4',
        thumbnailUrl: '/academy/bn/shares.webp',
        captionUrl: '/academy/bn/shares.vtt',
        transcript: `আর্থিক আলোচনায় মানুষ প্রায়শই 'স্টক' এবং 'শেয়ার' শব্দ দুটি ব্যবহার করে, কিন্তু আপনি কি এ দুটির সঠিক পার্থক্য জানেন?\n\n'স্টক' শব্দটি কোম্পানির সামগ্রিক মালিকানা বা ইক্যুইটির ধারণাকে নির্দেশ করে, আর 'শেয়ার' হলো সেই মালিকানার একটি নির্দিষ্ট, পরিমাপযোগ্য একক বা ইউনিট।

একটি বড় পিৎজার কথা ভাবুন: পুরো পিৎজাটি যদি কোম্পানির মোট ইক্যুইটি স্টক হয়, তবে তার প্রতিটি আলাদা টুকরো হলো এক একটি 'শেয়ার'। একজন বিনিয়োগকারীর কাছে মোট কতটি শেয়ার আছে তা গণনা করে কোম্পানিতে তার সঠিক মালিকানার শতকরা হার নির্ধারণ করা যায়।\n\nআসুন এটি মার্কেট ক্যাপিটালাইজেশন বা বাজার মূলধনের ধারণার মাধ্যমে বুঝি।
ধরুন একটি কোম্পানি তার মোট মালিকানাকে ১ কোটি শেয়ারে বিভক্ত করেছে এবং প্রতিটি শেয়ারের বর্তমান দাম ₹৫০০ টাকা। কোম্পানির মোট বাজার মূল্য ১ কোটি শেয়ার গুণ ₹৫০০, অর্থাৎ ₹৫০০ কোটি টাকা।

আপনি যদি ১০০টি শেয়ার কেনেন, তবে আপনি ₹৫০,০০০ টাকা বিনিয়োগ করে সেই ₹৫০০ কোটি টাকার কোম্পানিতে সরাসরি অংশীদারিত্ব লাভ করেছেন।

এখন কোম্পানি যদি ২-ফর-১ স্টক স্প্লিট ঘোষণা করে, তবে আপনার ১০০টি শেয়ার ২০০টি শেয়ারে পরিণত হবে এবং প্রতি শেয়ারের দাম ₹২৫০ টাকা হবে। আপনার মোট বিনিয়োগের মূল্য ₹৫০,০০০ টাকাই থাকবে, কিন্তু আপনার কাছে দ্বিগুণ ইউনিট থাকবে।\n\n₹৫০ টাকার শেয়ার ₹৫,০০০ টাকার শেয়ারের চেয়ে 'সস্তা' বলে মনে করা ভুল। কোম্পানির মূল্যায়ন নির্ভর করে মার্কেট ক্যাপ ও মুনাফার ওপর, শুধু শেয়ারের দামের ওপর নয়।\n\nকোম্পানি যখন বিপুল সংখ্যক নতুন শেয়ার ইস্যু করে তখন শেয়ারের মূল্য কমে যাওয়ার ঝুঁকি মনে রাখবেন।\n\nশেয়ার হলো মালিকানার একক; মোট শেয়ারের সংখ্যাকে শেয়ারের দাম দিয়ে গুণ করলে কোম্পানির মোট বাজার মূল্যায়ন পাওয়া যায়।`,
        keyTakeaway: 'শেয়ার হলো কোম্পানির মালিকানার পরিমাপযোগ্য ইউনিট; মোট শেয়ার গুণ শেয়ারের দাম সমান মার্কেট ক্যাপ।'
      },
    }
  },
  // ── 04. WHAT IS AN ETF? ──
  {
    id: 'what-is-an-etf',
    number: 4,
    title: 'What is an ETF?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/etf.mp4',
    thumbnailUrl: '/academy/etf.webp',
    description: 'Explore Exchange-Traded Funds (ETFs), instant basket diversification, real-time exchange liquidity, and low expense ratios.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is an ETF?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `What if you want to invest in dozens of top companies across India or the world, but you don't have the time or money to research and buy 50 individual stocks?\n\nThis is where an ETF, or Exchange-Traded Fund, becomes a powerful tool for modern investors. An ETF is an investment fund that holds a diversified basket of securities—such as stocks, bonds, or commodities—and trades on a public stock exchange just like an individual stock.

For example, an ETF tracking the NIFTY 50 index holds shares in 50 of India's largest and most established corporations across banking, information technology, consumer goods, energy, and healthcare.\n\nImagine trying to buy all 50 NIFTY companies individually. You would need tens of thousands of rupees, pay multiple brokerage fees, and spend hours balancing your portfolio.
With a NIFTY 50 ETF, you can buy a single unit for just ₹250 to ₹300. In one single trade, your money is automatically spread across giants like Reliance, TCS, HDFC Bank, and Infosys.

ETFs provide three major benefits:
First, instant diversification: if one company has an unexpected decline, the other 49 companies cushion your overall portfolio.
Second, real-time liquidity: you can buy and sell ETF units at prevailing market prices anytime during market trading hours.
Third, ultra-low cost: because most index ETFs passively track an index without active fund manager salaries, their expense ratios are often as low as 0.05% to 0.20% per year.\n\nBeginners often assume that because ETFs are diversified, they cannot lose money. That is incorrect. An ETF eliminates single-company failure risk, but it still reflects broader market downturns when the overall economy experiences volatility.\n\nKeep in mind that ETFs can have minor tracking errors and bid-ask spreads during volatile market sessions.\n\nAn ETF gives you a diversified basket of top companies in a single, low-cost, transparent trade on the stock exchange.`,
    learningPoints: [
      "An ETF is an investment fund that holds a basket of securities and trades on the stock exchange.",
      "Instant diversification across 50+ companies in a single trade (e.g., NIFTY 50 ETF).",
      "Real-time intraday trading and liquidity during market hours.",
      "Ultra-low expense ratios compared to actively managed funds."
],
    keyTakeaway: 'An ETF gives you a diversified basket of many companies in a single, low-cost, liquid trade.',
    quiz: [
      {
            "id": "q4-1",
            "question": "What is an Exchange-Traded Fund (ETF)?",
            "options": [
                  "A bank loan used to trade penny stocks.",
                  "An investment fund holding a diversified basket of assets that trades on a stock exchange like a single stock.",
                  "A government savings certificate with a 10-year lock-in.",
                  "A cryptocurrency trading bot."
            ],
            "correctAnswer": 1,
            "explanation": "An ETF holds a collection of securities (like the NIFTY 50) and trades on the stock exchange throughout market hours."
      },
      {
            "id": "q4-2",
            "question": "Why do index ETFs typically have very low expense ratios?",
            "options": [
                  "They are funded by government subsidies.",
                  "They passively track an index without requiring expensive active fund management teams.",
                  "They only invest in companies with zero employees.",
                  "They do not charge any brokerage fees."
            ],
            "correctAnswer": 1,
            "explanation": "Passive index ETFs mirror a benchmark index mathematically, eliminating expensive active research costs."
      }
],
    relatedLessons: ["what-is-a-mutual-fund", "risk-return-diversification", "what-is-a-stock"],
    vestiqPrompt: 'How does an ETF like NIFTY 50 give me instant diversification?',
    languages: {
      en: {
        videoUrl: '/academy/en/etf.mp4',
        thumbnailUrl: '/academy/en/etf.webp',
        captionUrl: '/academy/en/etf.vtt',
        transcript: `What if you want to invest in dozens of top companies across India or the world, but you don't have the time or money to research and buy 50 individual stocks?\n\nThis is where an ETF, or Exchange-Traded Fund, becomes a powerful tool for modern investors. An ETF is an investment fund that holds a diversified basket of securities—such as stocks, bonds, or commodities—and trades on a public stock exchange just like an individual stock.

For example, an ETF tracking the NIFTY 50 index holds shares in 50 of India's largest and most established corporations across banking, information technology, consumer goods, energy, and healthcare.\n\nImagine trying to buy all 50 NIFTY companies individually. You would need tens of thousands of rupees, pay multiple brokerage fees, and spend hours balancing your portfolio.
With a NIFTY 50 ETF, you can buy a single unit for just ₹250 to ₹300. In one single trade, your money is automatically spread across giants like Reliance, TCS, HDFC Bank, and Infosys.

ETFs provide three major benefits:
First, instant diversification: if one company has an unexpected decline, the other 49 companies cushion your overall portfolio.
Second, real-time liquidity: you can buy and sell ETF units at prevailing market prices anytime during market trading hours.
Third, ultra-low cost: because most index ETFs passively track an index without active fund manager salaries, their expense ratios are often as low as 0.05% to 0.20% per year.\n\nBeginners often assume that because ETFs are diversified, they cannot lose money. That is incorrect. An ETF eliminates single-company failure risk, but it still reflects broader market downturns when the overall economy experiences volatility.\n\nKeep in mind that ETFs can have minor tracking errors and bid-ask spreads during volatile market sessions.\n\nAn ETF gives you a diversified basket of top companies in a single, low-cost, transparent trade on the stock exchange.`,
        keyTakeaway: 'An ETF gives you a diversified basket of many companies in a single, low-cost, liquid trade.'
      },
      hi: {
        videoUrl: '/academy/hi/etf.mp4',
        thumbnailUrl: '/academy/hi/etf.webp',
        captionUrl: '/academy/hi/etf.vtt',
        transcript: `क्या आप भारत या दुनिया की शीर्ष 50 कंपनियों में एक साथ निवेश करना चाहते हैं, लेकिन आपके पास 50 अलग-अलग शेयर खरीदने का समय या लाखों रुपये नहीं हैं?\n\nयहीं पर ईटीएफ, यानी एक्सचेंज-ट्रेडेड फंड (Exchange-Traded Fund), आधुनिक निवेशकों के लिए एक बहुत शक्तिशाली उपकरण साबित होता है। ईटीएफ एक निवेश फंड है जिसमें कई प्रतिभूतियों—जैसे स्टॉक, बॉन्ड या कमोडिटी—की एक विविध बास्केट होती है, और यह स्टॉक एक्सचेंज पर एक सामान्य शेयर की तरह ही खरीदा और बेचा जाता है।

उदाहरण के लिए, निफ्टी 50 (NIFTY 50) इंडेक्स को ट्रैक करने वाला एक ईटीएफ भारत की 50 सबसे बड़ी और सबसे मजबूत कंपनियों के शेयर रखता है, जिसमें बैंकिंग, आईटी, ऊर्जा और ऑटोमोबाइल जैसे प्रमुख क्षेत्र शामिल हैं।\n\nकल्पना कीजिए कि अगर आप इन 50 कंपनियों को अलग-अलग खरीदने की कोशिश करें। आपको लाखों रुपये, बार-बार ब्रोकरेज फीस और बहुत समय की आवश्यकता होगी।
लेकिन निफ्टी 50 ईटीएफ के साथ, आप सिर्फ ₹250 से ₹300 में एक यूनिट खरीद सकते हैं। एक ही ट्रेड में आपका पैसा रिलायंस, टीसीएस, एचडीएफसी बैंक और इन्फोसिस जैसी दिग्गज कंपनियों में स्वतः विभाजित हो जाता है।

ईटीएफ के तीन प्रमुख फायदे हैं:
पहला, तत्काल विविधीकरण: यदि किसी एक कंपनी में गिरावट आती है, तो बाकी 49 कंपनियाँ आपके पोर्टफोलियो को संभाल लेती हैं।
दूसरा, रियल-टाइम लिक्विडिटी: आप बाजार के कारोबारी घंटों के दौरान किसी भी समय प्रचलित बाजार मूल्य पर ईटीएफ यूनिट्स खरीद और बेच सकते हैं।
तीसरा, बेहद कम लागत: क्योंकि इंडेक्स ईटीएफ पैसिव रूप से काम करते हैं, उनका एक्सपेंस रेशियो आमतौर पर केवल 0.05% से 0.20% प्रति वर्ष होता है।\n\nशुरुआती लोग सोचते हैं कि ईटीएफ में विविधीकरण होने के कारण इसमें कभी नुकसान नहीं हो सकता। यह गलत है। ईटीएफ किसी एक कंपनी के डूबने का जोखिम खत्म करता है, लेकिन जब पूरा बाजार गिरता है, तो ईटीएफ का मूल्य भी घटता है।\n\nबाजार में अत्यधिक अस्थिरता के समय ईटीएफ में ट्रैकिंग एरर और बिड-आस्क स्प्रेड का ध्यान रखें।\n\nईटीएफ आपको स्टॉक एक्सचेंज पर एक ही पारदर्शी, कम लागत वाले ट्रेड में देश की शीर्ष कंपनियों का एक विविध बास्केट प्रदान करता है।`,
        keyTakeaway: 'ईटीएफ आपको एक ही कम लागत वाले और लिक्विड ट्रेड में कई कंपनियों की विविधता प्रदान करता है।'
      },
      kn: {
        videoUrl: '/academy/kn/etf.mp4',
        thumbnailUrl: '/academy/kn/etf.webp',
        captionUrl: '/academy/kn/etf.vtt',
        transcript: `ಭಾರತದ ಅಥವಾ ಪ್ರಪಂಚದ ಅಗ್ರ 50 ಕಂಪನಿಗಳಲ್ಲಿ ಏಕಕಾಲದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಲು ಬಯಸುವಿರಾ, ಆದರೆ 50 ಪ್ರತ್ಯೇಕ ಷೇರುಗಳನ್ನು ಖರೀದಿಸಲು ಹಣ ಅಥವಾ ಸಮಯವಿಲ್ಲವೇ?\n\nಇಲ್ಲಿಯೇ ಇಟಿಎಫ್ (ETF - Exchange-Traded Fund) ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸುತ್ತದೆ. ಇಟಿಎಫ್ ಎನ್ನುವುದು ಷೇರುಗಳು, ಬಾಂಡ್‌ಗಳು ಅಥವಾ ಚಿನ್ನದಂತಹ ವಿವಿಧ ಭದ್ರತೆಗಳ ಬುಟ್ಟಿಯನ್ನು ಹೊಂದಿರುವ ಹೂಡಿಕೆ ನಿಧಿಯಾಗಿದೆ ಮತ್ತು ಇದು ಸಾಮಾನ್ಯ ಷೇರಿನಂತೆಯೇ ಸ್ಟಾಕ್ ಎಕ್ಸ್‌ಚೇಂಜ್‌ನಲ್ಲಿ ವ್ಯಾಪಾರವಾಗುತ್ತದೆ.

ಉದಾಹರಣೆಗೆ, ನಿಫ್ಟಿ 50 (NIFTY 50) ಇಟಿಎಫ್ ಭಾರತದ ಪ್ರಮುಖ 50 ಬೃಹತ್ ಕಂಪನಿಗಳ ಷೇರುಗಳನ್ನು ಒಳಗೊಂಡಿರುತ್ತದೆ.\n\nಈ ಎಲ್ಲಾ 50 ಕಂಪನಿಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಖರೀದಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೆ ನಿಮಗೆ ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ಮತ್ತು ಹೆಚ್ಚಿನ ಬ್ರೋಕರೇಜ್ ವೆಚ್ಚ ತಗುಲುತ್ತದೆ.
ಆದರೆ ನಿಫ್ಟಿ 50 ಇಟಿಎಫ್‌ನ ಒಂದು ಯೂನಿಟ್ ಅನ್ನು ಕೇವಲ ₹250 ರಿಂದ ₹300 ಕ್ಕೆ ಖರೀದಿಸಬಹುದು. ಒಂದೇ ವಹಿವಾಟಿನಲ್ಲಿ ನಿಮ್ಮ ಹಣವು ರಿಲಯನ್ಸ್, ಟಿಸಿಎಸ್, ಎಚ್‌ಡಿಎಫ್‌ಸಿ ಬ್ಯಾಂಕ್ ಮತ್ತು ಇನ್ಫೋಸಿಸ್‌ನಂತಹ ದೈತ್ಯ ಕಂಪನಿಗಳಲ್ಲಿ ಹಂಚಿಕೆಯಾಗುತ್ತದೆ.

ಇಟಿಎಫ್‌ನ ಮೂರು ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು:
ಮೊದಲನೆಯದಾಗಿ, ತಕ್ಷಣದ ವೈವಿಧ್ಯತೆ: ಒಂದು ಕಂಪನಿ ಕುಸಿದರೂ ಉಳಿದ 49 ಕಂಪನಿಗಳು ನಷ್ಟವನ್ನು ತಡೆಯುತ್ತವೆ.
ಎರಡನೆಯದಾಗಿ, ರಿಯಲ್-ಟೈಮ್ ಲಿಕ್ವಿಡಿಟಿ: ಮಾರುಕಟ್ಟೆ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಕ್ಷಣದಲ್ಲಿ ಖರೀದಿಸಬಹುದು ಅಥವಾ ಮಾರಾಟ ಮಾಡಬಹುದು.
ಮೂರನೆಯದಾಗಿ, ಅತ್ಯಂತ ಕಡಿಮೆ ವೆಚ್ಚ: ಇಂಡೆಕ್ಸ್ ಇಟಿಎಫ್‌ಗಳ ವಾರ್ಷಿಕ ವೆಚ್ಚ ಕೇವಲ 0.05% ರಿಂದ 0.20% ನಷ್ಟು ಮಾತ್ರ ಇರುತ್ತದೆ.\n\nಇಟಿಎಫ್‌ನಲ್ಲಿ ವೈವಿಧ್ಯತೆ ಇರುವುದರಿಂದ ನಷ್ಟವೇ ಆಗುವುದಿಲ್ಲ ಎಂದು ಕೆಲವರು ಭಾವಿಸುತ್ತಾರೆ. ಇದು ತಪ್ಪು. ಇದು ಒಂದೇ ಕಂಪನಿಯ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ, ಆದರೆ ಇಡೀ ಮಾರುಕಟ್ಟೆ ಕುಸಿದಾಗ ಇಟಿಎಫ್ ಮೌಲ್ಯವೂ ಇಳಿಯುತ್ತದೆ.\n\nಮಾರುಕಟ್ಟೆಯ ತೀವ್ರ ಏರಿಳಿತದ ಸಮಯದಲ್ಲಿ ಟ್ರ್ಯಾಕಿಂಗ್ ದೋಷಗಳನ್ನು ಗಮನಿಸಿ.\n\nಇಟಿಎಫ್ ನಿಮಗೆ ಸ್ಟಾಕ್ ಎಕ್ಸ್‌ಚೇಂಜ್‌ನಲ್ಲಿ ಅತ್ಯಂತ ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಅಗ್ರ ಕಂಪನಿಗಳ ಸಮಗ್ರ ಬುಟ್ಟಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
        keyTakeaway: 'ಇಟಿಎಫ್ ಒಂದೇ ಕಡಿಮೆ ವೆಚ್ಚದ ವಹಿವಾಟಿನಲ್ಲಿ ಅನೇಕ ಕಂಪನಿಗಳ ವೈವಿಧ್ಯಮಯ ಹೂಡಿಕೆಯನ್ನು ನೀಡುತ್ತದೆ.'
      },
      te: {
        videoUrl: '/academy/te/etf.mp4',
        thumbnailUrl: '/academy/te/etf.webp',
        captionUrl: '/academy/te/etf.vtt',
        transcript: `భారతదేశంలోని లేదా ప్రపంచంలోని అగ్రశ్రేణి 50 కంపెనీలలో ఒకేసారి పెట్టుబడి పెట్టాలనుకుంటున్నారా, కానీ 50 వేర్వేరు షేర్లను కొనేంత డబ్బు లేదా సమయం లేదా?\n\nఇక్కడే ఈటీఎఫ్ (ETF - Exchange-Traded Fund) ఆధునిక పెట్టుబడిదారులకు అద్భుతమైన సాధనంగా మారుతుంది. ఇటిఎఫ్ అనేది షేర్లు, బాండ్లు లేదా బంగారం వంటి అనేక సెక్యూరిటీల బుట్టను కలిగి ఉండే ఒక పెట్టుబడి నిధి, ఇది సాధారణ షేరు లాగానే స్టాక్ ఎక్స్ఛేంజ్‌లో వర్తకం అవుతుంది.

ఉదాహరణకు, నిఫ్టీ 50 (NIFTY 50) ఇటిఎఫ్ భారతదేశంలోని బ్యాంకింగ్, ఐటీ, ఇంధనం మరియు ఆటోమొబైల్ వంటి కీలక రంగాల్లోని 50 అతిపెద్ద కంపెనీల షేర్లను కలిగి ఉంటుంది.\n\nఈ 50 కంపెనీల షేర్లను విడివిడిగా కొనాలంటే మీకు లక్షల రూపాయలు, ఎక్కువ బ్రోకరేజ్ ఖర్చులు మరియు సమయం అవసరం.
కానీ నిఫ్టీ 50 ఇటిఎఫ్ ఒక యూనిట్‌ను కేవలం ₹250 నుండి ₹300 కే కొనుగోలు చేయవచ్చు. ఒకే లావాదేవీతో మీ డబ్బు రిలయన్స్, టీసీఎస్, హెచ్‌డీఎఫ్‌సీ బ్యాంక్ మరియు ఇన్ఫోసిస్ వంటి దిగ్గజాలలో ఆటోమేటిక్‌గా విస్తరిస్తుంది.

ఇటిఎఫ్ మూడు ప్రధాన ప్రయోజనాలను అందిస్తుంది:
మొదటిది, తక్షణ డైవర్సిఫికేషన్: ఒక కంపెనీ తగ్గినా మిగిలిన 49 కంపెనీలు మీ పోర్ట్‌ఫోలియోను కాపాడతాయి.
రెండవది, రియల్-టైమ్ లిక్విడిటీ: మార్కెట్ పనివేళల్లో ఎప్పుడైనా ప్రస్తుత ధరకు కొనవచ్చు లేదా అమ్మవచ్చు.
మూడవది, అత్యంత తక్కువ ఖర్చు: ఇండెక్స్ ఇటిఎఫ్‌ల వార్షిక ఖర్చు కేవలం 0.05% నుండి 0.20% మాత్రమే ఉంటుంది.\n\nఇటిఎఫ్‌లో డైవర్సిఫికేషన్ ఉన్నందున ఎప్పటికీ నష్టం రాదు అనుకోవడం తప్పు. ఇది ఒకే కంపెనీ వైఫల్యం రిస్క్‌ను తొలగిస్తుంది, కానీ మార్కెట్ మొత్తం పడిపోయినప్పుడు ఇటిఎఫ్ విలువ కూడా తగ్గుతుంది.\n\nమార్కెట్ ఒడిదుడుకుల సమయంలో ట్రాకింగ్ లోపాలను గమనించండి.\n\nఇటిఎఫ్ మీకు స్టాక్ ఎక్స్ఛేంజ్‌లో అత్యంత తక్కువ ఖర్చుతో అగ్రశ్రేణి కంపెనీల వైవిధ్యభరితమైన పోర్ట్‌ఫోలియోను అందిస్తుంది.`,
        keyTakeaway: 'ఇటిఎఫ్ ఒకే తక్కువ-ఖర్చు ట్రేడ్‌లో అనేక కంపెనీల వైవిధ్యభరితమైన బుట్టను అందిస్తుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/etf.mp4',
        thumbnailUrl: '/academy/ta/etf.webp',
        captionUrl: '/academy/ta/etf.vtt',
        transcript: `இந்தியாவின் அல்லது உலகின் முன்னணி 50 நிறுவனங்களில் ஒரே நேரத்தில் முதலீடு செய்ய விரும்புகிறீர்களா, ஆனால் 50 தனித்தனி பங்குகளை வாங்க நேரமோ பணமோ இல்லையா?\n\nஇங்குதான் இடிஎஃப் (ETF - Exchange-Traded Fund) நவீன முதலீட்டாளர்களுக்கு ஒரு சிறந்த கருவியாக மாறுகிறது. இடிஎஃப் என்பது பங்குகள், பத்திரங்கள் அல்லது தங்கம் போன்ற பல சொத்துக்களின் தொகுப்பைக் கொண்ட ஒரு முதலீட்டு நிதியாகும், மேலும் இது சாதாரண பங்கைப்போலவே பங்குச் சந்தையில் வர்த்தகம் செய்யப்படுகிறது.

உதாரணமாக, நிஃப்டி 50 (NIFTY 50) இடிஎஃப் இந்தியாவின் வங்கி, தகவல் தொழில்நுட்பம், எரிசக்தி மற்றும் நுகர்வோர் பொருட்கள் போன்ற முக்கிய துறைகளில் உள்ள 50 முன்னணி நிறுவனங்களின் பங்குகளைக் கொண்டுள்ளது.\n\nஇந்த 50 நிறுவனங்களை தனித்தனியாக வாங்க முயற்சித்தால் உங்களுக்கு லட்சக்கணக்கான ரூபாய் மற்றும் அதிக தரகு கட்டணம் தேவைப்படும்.
ஆனால் நிஃப்டி 50 இடிஎஃப்-ன் ஒரு யூனிட்டை வெறும் ₹250 முதல் ₹300-க்கு வாங்கலாம். ஒரே வர்த்தகத்தில் உங்கள் பணம் ரிலையன்ஸ், டிசிஎஸ், ஹெச்டிஎஃப்சி வங்கி மற்றும் இன்ஃபோசிஸ் போன்ற முன்னணி நிறுவனங்களில் தானாகவே பிரிக்கப்படுகிறது.

இடிஎஃப் மூன்று முக்கிய நன்மைகளை வழங்குகிறது:
முதலாவதாக, உடனடி பல்வகைப்படுத்தல்: ஒரு நிறுவனம் சரிந்தாலும் மற்ற 49 நிறுவனங்கள் உங்கள் முதலீட்டைப் பாதுகாக்கின்றன.
இரண்டாவதாக, நேரடி பணப்புழக்கம்: சந்தை வர்த்தக நேரங்களில் எந்த நேரத்திலும் தற்போதைய சந்தை விலையில் வாங்கலாம் அல்லது விற்கலாம்.
மூன்றாவதாக, மிகக் குறைந்த செலவு: இன்டெக்ஸ் இடிஎஃப்-களின் வருடாந்திர செலவு விகிதம் வெறும் 0.05% முதல் 0.20% வரை மட்டுமே இருக்கும்.\n\nஇடிஎஃப்-ல் பல்வகைப்படுத்தல் இருப்பதால் நஷ்டமே வராது என்று நினைப்பது தவறு. இது ஒரு நிறுவனத்தின் தோல்வி ஆபத்தைத் தடுக்கிறது, ஆனால் ஒட்டுமொத்த சந்தையும் சரியும்போது இடிஎஃப் மதிப்பும் குறையும்.\n\nசந்தை ஏற்ற இறக்கத்தின் போது டிராக்கிங் பிழைகளைக் கவனியுங்கள்.\n\nஇடிஎஃப் என்பது பங்குச் சந்தையில் குறைந்த செலவில் முன்னணி நிறுவனங்களின் பல்வகைப்பட்ட தொகுப்பைப் பெற உதவும் சிறந்த வழியாகும்.`,
        keyTakeaway: 'இடிஎஃப் ஒரே குறைந்த கட்டண வர்த்தகத்தில் பல நிறுவனங்களின் பல்வகைப்பட்ட தொகுப்பை வழங்குகிறது.'
      },
      ml: {
        videoUrl: '/academy/ml/etf.mp4',
        thumbnailUrl: '/academy/ml/etf.webp',
        captionUrl: '/academy/ml/etf.vtt',
        transcript: `ഇന്ത്യയിലെ മുൻനിര 50 കമ്പനികളിൽ ഒരേസമയം നിക്ഷേപിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുണ്ടോ, എന്നാൽ 50 കമ്പനികളുടെ ഷെയറുകൾ വെവ്വേറെ വാങ്ങാൻ പണമോ സമയമോ ഇല്ലേ?\n\nഇവിടെയാണ് ഇടിഎഫ് (ETF - Exchange-Traded Fund) ആധുനിക നിക്ഷേപകർക്ക് മികച്ചൊരു വഴിയാകുന്നത്. ഓഹരികൾ, ബോണ്ടുകൾ അല്ലെങ്കിൽ സ്വർണ്ണം എന്നിവയുടെ വൈവിധ്യമാർന്ന ശേഖരമുള്ള ഒരു നിക്ഷേപ ഫണ്ടാണ് ഇടിഎഫ്, ഇത് സാധാരണ ഷെയർ പോലെ തന്നെ സ്റ്റോക്ക് എക്സ്ചേഞ്ചിൽ ട്രേഡ് ചെയ്യപ്പെടുന്നു.

ഉദാഹരണത്തിന്, നിഫ്റ്റി 50 (NIFTY 50) ഇടിഎഫ് ഇന്ത്യയിലെ ഏറ്റവും വലിയ 50 മുൻനിര കമ്പനികളുടെ ഓഹരികൾ ഉൾക്കൊള്ളുന്നതാണ്.\n\nഈ 50 കമ്പനികളെ വെവ്വേറെ വാങ്ങാൻ ശ്രമിച്ചാൽ നിങ്ങൾക്ക് ലക്ഷക്കണക്കിന് രൂപയും ഉയർന്ന ബ്രോക്കറേജ് ചിലവും ആവശ്യമായി വരും.
എന്നാൽ നിഫ്റ്റി 50 ഇടിഎഫിന്റെ ഒരു യൂണിറ്റ് വെറും ₹250 മുതൽ ₹300 വരെ വിലയിൽ വാങ്ങാം. ഒറ്റ ഇടപാടിലൂടെ നിങ്ങളുടെ പണം റിലയൻസ്, ടിസിഎസ്, എച്ച്ഡിഎഫ്സി ബാങ്ക്, ഇൻഫോസിസ് തുടങ്ങിയ വമ്പൻ കമ്പനികളിൽ തനിയെ നിക്ഷേപിക്കപ്പെടുന്നു.

ഇടിഎഫിന്റെ മൂന്ന് പ്രധാന നേട്ടങ്ങൾ:
ഒന്ന്, തൽക്ഷണ വൈവിധ്യവൽക്കരണം: ഒരു കമ്പനി നഷ്ടമുണ്ടാക്കിയാലും ബാക്കി 49 കമ്പനികൾ നിങ്ങളുടെ പോർട്ട്ഫോളിയോയെ സംരക്ഷിക്കും.
രണ്ട്, തത്സമയ ലിക്വിഡിറ്റി: വിപണി സമയങ്ങളിൽ എപ്പോൾ വേണമെങ്കിലും നിലവിലെ വിലയിൽ വാങ്ങുകയോ വിൽക്കുകയോ ചെയ്യാം.
മൂന്ന്, കുറഞ്ഞ ചിലവ്: ഇൻഡക്സ് ഇടിഎഫുകളുടെ വാർഷിക ചിലവ് വെറും 0.05% മുതൽ 0.20% വരെ മാത്രമാണ്.\n\nഇടിഎഫിൽ വൈവിധ്യം ഉള്ളതിനാൽ നഷ്ടം വരില്ല എന്ന് കരുതുന്നത് തെറ്റാണ്. ഇത് ഒരൊറ്റ കമ്പനിയുടെ തകർച്ചയിൽ നിന്ന് സംരക്ഷിക്കുമെങ്കിലും, വിപണി മുഴുവനായി ഇടിയുമ്പോൾ ഇടിഎഫ് മൂല്യവും കുറയും.\n\nവിപണിയിലെ ചാഞ്ചാട്ട സമയങ്ങളിൽ ട്രാക്കിംഗ് വ്യത്യാസങ്ങൾ ശ്രദ്ധിക്കുക.\n\nഇടിഎഫ് സ്റ്റോക്ക് എക്സ്ചേഞ്ചിൽ ഏറ്റവും കുറഞ്ഞ ചിലവിൽ മുൻനിര കമ്പനികളുടെ സമഗ്രമായ ബാസ്കറ്റ് നൽകുന്നു.`,
        keyTakeaway: 'ഇടിഎഫ് ഒറ്റ ട്രേഡിലൂടെ കുറഞ്ഞ ചിലവിൽ നിരവധി കമ്പനികളുടെ വൈവിധ്യമാർന്ന ബാസ്കറ്റ് നൽകുന്നു.'
      },
      mr: {
        videoUrl: '/academy/mr/etf.mp4',
        thumbnailUrl: '/academy/mr/etf.webp',
        captionUrl: '/academy/mr/etf.vtt',
        transcript: `तुम्हाला भारतातील किंवा जगातील अव्वल 50 कंपन्यांमध्ये एकाच वेळी गुंतवणूक करायची आहे, पण 50 वेगळे शेअर्स खरेदी करायला पुरेसा वेळ किंवा लाखो रुपये नाहीत का?\n\nयेथेच ईटीएफ (ETF - Exchange-Traded Fund) आधुनिक गुंतवणूकदारांसाठी एक उत्तम साधन ठरतो. ईटीएफ हा शेअर्स, रोखे किंवा सोने यासारख्या अनेक सिक्युरिटीजची बास्केट असलेला फंड आहे, आणि तो सामान्य शेअरप्रमाणेच स्टॉक एक्स्चेंजवर खरेदी-विक्री केला जातो.

उदाहरणार्थ, निफ्टी 50 (NIFTY 50) ईटीएफ भारताच्या बँकिंग, आयटी, ऊर्जा आणि ऑटो अशा आघाडीच्या 50 मोठ्या कंपन्यांचे शेअर्स बाळगतो.\n\nया 50 कंपन्यांचे शेअर्स स्वतंत्रपणे खरेदी करायचे झाल्यास लाखो रुपये आणि मोठा ब्रोकरेज खर्च लागेल.
पण निफ्टी 50 ईटीएफचा एक युनिट तुम्ही फक्त ₹250 ते ₹300 ला खरेदी करू शकता. एकाच ट्रेडमध्ये तुमचे पैसे रिलायन्स, टीसीएस, एचडीएफसी बँक आणि इन्फोसिस सारख्या दिग्गज कंपन्यांमध्ये विभागले जातात.

ईटीएफचे तीन मुख्य फायदे आहेत:
पहिले, त्वरित वैविध्यीकरण (डिव्हर्सिफिकेशन): एक कंपनी घसरली तरी इतर 49 कंपन्या तुमच्या पोर्टफोलिओचा तोटा सावरतात.
दुसरे, रिअल-टाइम लिक्विडिटी: बाजाराच्या वेळेत चालू किमतीला कधीही खरेदी-विक्री करता येते.
तिसरे, अत्यंत कमी खर्च: इंडेक्स ईटीएफचा वार्षिक खर्च फक्त 0.05% ते 0.20% इतकाच असतो.\n\nईटीएफमध्ये वैविध्य असल्याने नुकसान कधीच होणार नाही असा गैरसमज असतो. हे एका कंपनीच्या नुकसानीपासून वाचवते, पण संपूर्ण बाजार घसरल्यास ईटीएफचे मूल्यही कमी होते.\n\nबाजारातील अस्थिरतेच्या वेळी ट्रॅकिंग त्रुटी आणि स्प्रेडकडे लक्ष द्या.\n\nईटीएफ तुम्हाला स्टॉक एक्स्चेंजवर अतिशय कमी खर्चात अव्वल कंपन्यांची वैविध्यपूर्ण बास्केट प्रदान करतो.`,
        keyTakeaway: 'ईटीएफ एकाच कमी खर्चाच्या ट्रेडमध्ये अनेक कंपन्यांची वैविध्यपूर्ण बास्केट प्रदान करतो.'
      },
      bn: {
        videoUrl: '/academy/bn/etf.mp4',
        thumbnailUrl: '/academy/bn/etf.webp',
        captionUrl: '/academy/bn/etf.vtt',
        transcript: `আপনি কি ভারতের বা বিশ্বের শীর্ষ ৫০টি কোম্পানিতে একসাথে বিনিয়োগ করতে চান, কিন্তু ৫০টি আলাদা শেয়ার কেনার মতো অর্থ বা সময় নেই?\n\nএখানেই ইটিএফ (ETF - Exchange-Traded Fund) আধুনিক বিনিয়োগকারীদের জন্য একটি শক্তিশালী মাধ্যম হয়ে ওঠে। ইটিএফ হলো একটি বিনিয়োগ ফান্ড যার মধ্যে শেয়ার, বন্ড বা সোনার মতো বহুবিধ সিকিউরিটির একটি বাস্কেট বা ঝুড়ি থাকে এবং এটি সাধারণ শেয়ারের মতোই স্টক এক্সচেঞ্জে কেনাবেচা করা যায়।

উদাহরণস্বরূপ, নিফটি ৫০ (NIFTY 50) ইটিএফ ভারতের ব্যাংকিং, আইটি, জ্বালানি এবং অটোমোবাইলের মতো শীর্ষ ৫০টি বৃহত্তম কোম্পানির শেয়ার ধারণ করে।\n\nএই ৫০টি কোম্পানির শেয়ার আলাদাভাবে কিনতে গেলে আপনার লাখ লাখ টাকা এবং প্রচুর ব্রোকারেজ চার্জ লাগবে।
কিন্তু একটি নিফটি ৫০ ইটিএফ-এর একক ইউনিট আপনি মাত্র ₹২৫০ থেকে ₹৩০০ টাকায় কিনতে পারেন। একটি মাত্র ট্রেডেই আপনার টাকা রিলায়েন্স, টিসিএস, এইচডিএফসি ব্যাংক এবং ইনফোসিসের মতো জায়ান্ট কোম্পানিতে স্বয়ংক্রিয়ভাবে বণ্টিত হয়ে যায়।

ইটিএফ-এর তিনটি প্রধান সুবিধা রয়েছে:
প্রথমত, তাত্ক্ষণিক বৈচিত্র্যকরণ: একটি কোম্পানি ক্ষতিগ্রস্ত হলেও বাকি ৪৯টি কোম্পানি আপনার পোর্টফোলিওকে রক্ষা করে।
দ্বিতীয়ত, রিয়েল-টাইম তারল্য: বাজার চলাকালীন যেকোনো সময় বর্তমান মূল্যে কেনাবেচা করা যায়।
তৃতীয়ত, অত্যন্ত কম খরচ: ইনডেক্স ইটিএফ-এর বার্ষিক খরচ মাত্র ০.০৫% থেকে ০.২০% এর মধ্যে থাকে।\n\nইটিএফে বৈচিত্র্য থাকার কারণে কখনোই ক্ষতি হবে না বলে ভাবা ভুল। এটি একটি কোম্পানির পতনের ঝুঁকি কমায়, তবে সমগ্র বাজার পতন হলে ইটিএফ-এর মূল্যও কমে।\n\nবাজারের অস্থিরতার সময় ট্র্যাকিং ত্রুটি এবং বিড-আস্ক স্প্রেডের দিকে নজর রাখুন।\n\nইটিএফ স্টক এক্সচেঞ্জে অত্যন্ত কম খরচে শীর্ষ কোম্পানিগুলোর একটি সম্পূর্ণ বাস্কেট প্রদান করে।`,
        keyTakeaway: 'ইটিএফ একটি মাত্র সাশ্রয়ী ট্রেডে অনেকগুলো শীর্ষ কোম্পানির বৈচিত্র্যময় ঝুড়ি প্রদান করে।'
      },
    }
  },
  // ── 05. WHAT IS A MUTUAL FUND? ──
  {
    id: 'what-is-a-mutual-fund',
    number: 5,
    title: 'What is a Mutual Fund?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/mutual-fund.mp4',
    thumbnailUrl: '/academy/mutual-fund.webp',
    description: 'Discover how mutual funds pool investor capital for professional management, NAV calculation, and diversified investing.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is a Mutual Fund?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `Why do tens of millions of Indian households invest their hard-earned money in mutual funds every single month?\n\nA Mutual Fund is an investment trust that pools money from thousands of individual investors to construct a professionally managed portfolio of stocks, bonds, or other securities.

Instead of you having to pick stocks, analyze balance sheets, and monitor quarterly reports, an Asset Management Company hires professional fund managers and dedicated research analysts to manage the pooled capital in accordance with a clearly defined investment objective.\n\nLet us see how this pooling works in practice. Suppose 10,000 investors each contribute ₹1,000 every month. This creates a pooled fund of ₹1 Crore every month. The fund manager deploys this capital into a diversified portfolio of 40 to 60 vetted companies.

When you invest in a mutual fund, you are allocated 'units' based on the scheme's Net Asset Value, or NAV. NAV represents the total market value of the fund's assets minus its liabilities, divided by total outstanding units. NAV is calculated and updated at the close of every business day.

Mutual funds come in diverse categories: Equity Funds for long-term growth, Debt Funds for capital preservation and steady income, Hybrid Funds for a balanced blend, and Passive Index Funds for low-cost market tracking.\n\nA widespread misunderstanding is that a mutual fund with an NAV of ₹20 is cheaper or more attractive than a fund with an NAV of ₹200. NAV simply reflects historical unit division; what matters is the percentage growth of the underlying portfolio.\n\nAlways remember that mutual funds are subject to market risks. Past returns of a fund manager do not guarantee future performance, and fees—known as the expense ratio—affect your net return.\n\nMutual funds pool investor capital for institutional-grade professional management, effortless diversification, and structured recurring investment.`,
    learningPoints: [
      "Mutual funds pool capital from thousands of investors for professional management.",
      "Net Asset Value (NAV): the per-unit market value of fund assets minus liabilities.",
      "Diverse categories: Equity, Debt, Hybrid, and Passive Index funds.",
      "Structured automated investing through Systematic Investment Plans (SIPs)."
],
    keyTakeaway: 'Mutual funds pool collective investor capital for professional management and built-in diversification.',
    quiz: [
      {
            "id": "q5-1",
            "question": "How does a mutual fund work for retail investors?",
            "options": [
                  "It guarantees fixed 15% annual returns backed by the government.",
                  "It pools capital from thousands of investors to create a professionally managed portfolio of stocks and bonds.",
                  "It only buys physical gold bars stored in bank vaults.",
                  "It provides personal loans to individual investors."
            ],
            "correctAnswer": 1,
            "explanation": "A mutual fund pools money from many investors, providing professional management and instant diversification."
      },
      {
            "id": "q5-2",
            "question": "What does NAV (Net Asset Value) represent in a mutual fund?",
            "options": [
                  "The total price of the company's CEO salary.",
                  "The per-unit market value of the fund's total assets minus liabilities, calculated at the end of each trading day.",
                  "A ranking score given by market analysts from 1 to 10.",
                  "The discount percentage offered to new investors."
            ],
            "correctAnswer": 1,
            "explanation": "NAV represents the per-unit net market value of all underlying portfolio assets after subtracting scheme expenses."
      }
],
    relatedLessons: ["what-is-sip", "what-is-swp", "what-is-an-etf"],
    vestiqPrompt: 'How does a mutual fund pool money, and what does NAV mean?',
    languages: {
      en: {
        videoUrl: '/academy/en/mutual-fund.mp4',
        thumbnailUrl: '/academy/en/mutual-fund.webp',
        captionUrl: '/academy/en/mutual-fund.vtt',
        transcript: `Why do tens of millions of Indian households invest their hard-earned money in mutual funds every single month?\n\nA Mutual Fund is an investment trust that pools money from thousands of individual investors to construct a professionally managed portfolio of stocks, bonds, or other securities.

Instead of you having to pick stocks, analyze balance sheets, and monitor quarterly reports, an Asset Management Company hires professional fund managers and dedicated research analysts to manage the pooled capital in accordance with a clearly defined investment objective.\n\nLet us see how this pooling works in practice. Suppose 10,000 investors each contribute ₹1,000 every month. This creates a pooled fund of ₹1 Crore every month. The fund manager deploys this capital into a diversified portfolio of 40 to 60 vetted companies.

When you invest in a mutual fund, you are allocated 'units' based on the scheme's Net Asset Value, or NAV. NAV represents the total market value of the fund's assets minus its liabilities, divided by total outstanding units. NAV is calculated and updated at the close of every business day.

Mutual funds come in diverse categories: Equity Funds for long-term growth, Debt Funds for capital preservation and steady income, Hybrid Funds for a balanced blend, and Passive Index Funds for low-cost market tracking.\n\nA widespread misunderstanding is that a mutual fund with an NAV of ₹20 is cheaper or more attractive than a fund with an NAV of ₹200. NAV simply reflects historical unit division; what matters is the percentage growth of the underlying portfolio.\n\nAlways remember that mutual funds are subject to market risks. Past returns of a fund manager do not guarantee future performance, and fees—known as the expense ratio—affect your net return.\n\nMutual funds pool investor capital for institutional-grade professional management, effortless diversification, and structured recurring investment.`,
        keyTakeaway: 'Mutual funds pool collective investor capital for professional management and built-in diversification.'
      },
      hi: {
        videoUrl: '/academy/hi/mutual-fund.mp4',
        thumbnailUrl: '/academy/hi/mutual-fund.webp',
        captionUrl: '/academy/hi/mutual-fund.vtt',
        transcript: `करोड़ों भारतीय परिवार हर महीने अपनी गाढ़ी कमाई का एक हिस्सा म्यूचुअल फंड में क्यों निवेश करते हैं?\n\nम्यूचुअल फंड एक ऐसा निवेश ट्रस्ट है जो हजारों व्यक्तिगत निवेशकों से पैसा इकट्ठा करता है और उस एकत्रित पूंजी से शेयरों, बॉन्डों और अन्य प्रतिभूतियों का एक पेशेवर रूप से प्रबंधित पोर्टफोलियो बनाता है।

आपको स्वयं कंपनियों का विश्लेषण करने, बैलेंस शीट पढ़ने या तिमाही नतीजों पर नजर रखने की आवश्यकता नहीं होती। एक एसेट मैनेजमेंट कंपनी (AMC) योग्य और अनुभवी फंड प्रबंधकों तथा शोध विश्लेषकों को नियुक्त करती है जो फंड के घोषित उद्देश्य के अनुसार पूंजी का प्रबंधन करते हैं।\n\nआइए देखें कि यह पूलिंग व्यवहार में कैसे काम करती है। मान लीजिए 10,000 निवेशक प्रत्येक महीने ₹1,000 का योगदान करते हैं। इससे हर महीने ₹1 करोड़ का फंड तैयार होता है। फंड मैनेजर इस पूंजी को 40 से 60 अच्छी तरह से परखी गई कंपनियों में निवेश करता है।

जब आप म्यूचुअल फंड में निवेश करते हैं, तो आपको स्कीम के एनएवी (NAV यानी नेट एसेट वैल्यू) के आधार पर 'यूनिट्स' आवंटित की जाती हैं। एनएवी फंड की कुल संपत्तियों में से देनदारियों को घटाकर कुल बकाया यूनिटों से भाग देकर निकाली जाती है, और यह प्रत्येक कारोबारी दिन के अंत में अपडेट होती है।

म्यूचुअल फंड कई प्रकार के होते हैं: दीर्घकालिक विकास के लिए इक्विटी फंड, स्थिरता और नियमित आय के लिए डेट फंड, दोनों के संतुलन के लिए हाइब्रिड फंड, और कम लागत वाले इंडेक्स फंड।\n\nएक आम गलतफहमी यह है कि ₹20 एनएवी वाला म्यूचुअल फंड ₹200 एनएवी वाले फंड से सस्ता या बेहतर होता है। एनएवी केवल ऐतिहासिक यूनिट विभाजन को दर्शाता है; महत्वपूर्ण यह है कि पोर्टफोलियो का प्रतिशत रिटर्न कितना रहा है।\n\nहमेशा याद रखें कि म्यूचुअल फंड बाजार जोखिमों के अधीन होते हैं। फंड मैनेजर का पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं देता, और एक्सपेंस रेशियो आपके शुद्ध रिटर्न को प्रभावित करता है।\n\nम्यूचुअल फंड निवेशकों की पूंजी को एकत्रित करके पेशेवर प्रबंधन, सहज विविधीकरण और नियमित एसआईपी निवेश की सुविधा प्रदान करते हैं।`,
        keyTakeaway: 'म्यूचुअल फंड पेशेवर प्रबंधन और विविधीकरण के लिए हजारों निवेशकों के धन को एक साथ जोड़ते हैं।'
      },
      kn: {
        videoUrl: '/academy/kn/mutual-fund.mp4',
        thumbnailUrl: '/academy/kn/mutual-fund.webp',
        captionUrl: '/academy/kn/mutual-fund.vtt',
        transcript: `ಕೋಟಿಗಟ್ಟಲೆ ಭಾರತೀಯ ಕುಟುಂಬಗಳು ಪ್ರತಿ ತಿಂಗಳು ತಮ್ಮ ಕಷ್ಟಪಟ್ಟು ಗಳಿಸಿದ ಹಣವನ್ನು ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ಏಕೆ ಹೂಡಿಕೆ ಮಾಡುತ್ತವೆ?\n\nಮ್ಯೂಚುವಲ್ ಫಂಡ್ ಎನ್ನುವುದು ಸಾವಿರಾರು ವೈಯಕ್ತಿಕ ಹೂಡಿಕೆದಾರರಿಂದ ಹಣವನ್ನು ಸಂಗ್ರಹಿಸಿ, ಆ ಒಟ್ಟು ಬಂಡವಾಳದಿಂದ ಷೇರುಗಳು ಮತ್ತು ಬಾಂಡ್‌ಗಳ ವೃತ್ತಿಪರವಾಗಿ ನಿರ್ವಹಿಸಲ್ಪಡುವ ಪೋರ್ಟ್‌ಫೋಲಿಯೊವನ್ನು ರಚಿಸುವ ಹೂಡಿಕೆ ಸಂಸ್ಥೆಯಾಗಿದೆ.

ನೀವೇ ಖುದ್ದಾಗಿ ಬ್ಯಾಲೆನ್ಸ್ ಶೀಟ್‌ಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ಅಸೆಟ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ಕಂಪನಿಗಳು (AMC) ನುರಿತ ಫಂಡ್ ಮ್ಯಾನೇಜರ್‌ಗಳನ್ನು ನೇಮಿಸಿ ಈ ನಿಧಿಯನ್ನು ನಿರ್ವಹಿಸುತ್ತವೆ.\n\nಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ಎಂದು ನೋಡೋಣ. 10,000 ಹೂಡಿಕೆದಾರರು ತಿಂಗಳಿಗೆ ₹1,000 ರಂತೆ ನೀಡಿದರೆ, ಪ್ರತಿ ತಿಂಗಳು ₹1 ಕೋಟಿ ನಿಧಿ ಸಂಗ್ರಹವಾಗುತ್ತದೆ. ಫಂಡ್ ಮ್ಯಾನೇಜರ್ ಈ ಹಣವನ್ನು 40 ರಿಂದ 60 ಪ್ರಮುಖ ಕಂಪನಿಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುತ್ತಾರೆ.

ನೀವು ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ನಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿದಾಗ, ಎನ್‌ಎವಿ (NAV - Net Asset Value) ಆಧಾರದ ಮೇಲೆ ನಿಮಗೆ 'ಯೂನಿಟ್‌ಗಳು' ದೊರೆಯುತ್ತವೆ. ಎನ್‌ಎವಿ ಪ್ರತಿ ವಹಿವಾಟು ದಿನದ ಅಂತ್ಯದಲ್ಲಿ ಲೆಕ್ಕಹಾಕಲ್ಪಡುತ್ತದೆ.

ವಿಧಗಳು: ದೀರ್ಘಾವಧಿ ಬೆಳವಣಿಗೆಗೆ ಈಕ್ವಿಟಿ ಫಂಡ್‌ಗಳು, ಸ್ಥಿರತೆಗೆ ಡೆಟ್ ಫಂಡ್‌ಗಳು, ಮತ್ತು ಸಮತೋಲನಕ್ಕೆ ಹೈಬ್ರಿಡ್ ಫಂಡ್‌ಗಳು.\n\n₹20 ಎನ್‌ಎವಿ ಇರುವ ಫಂಡ್ ₹200 ಎನ್‌ಎವಿ ಇರುವ ಫಂಡ್‌ಗಿಂತ ಉತ್ತಮ ಅಥವಾ ಅಗ್ಗ ಎಂಬುದು ತಪ್ಪು ಕಲ್ಪನೆ. ಪೋರ್ಟ್‌ಫೋಲಿಯೊದ ಶೇಕಡಾವಾರು ಬೆಳವಣಿಗೆ ಮಾತ್ರ ಮುಖ್ಯ.\n\nಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳು ಮಾರುಕಟ್ಟೆ ಅಪಾಯಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ. ಹಿಂದಿನ ಆದಾಯವು ಭವಿಷ್ಯದ ಲಾಭದ ಗ್ಯಾರಂಟಿ ನೀಡುವುದಿಲ್ಲ.\n\nಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳು ಹೂಡಿಕೆದಾರರ ಹಣವನ್ನು ಒಗ್ಗೂಡಿಸಿ ವೃತ್ತಿಪರ ನಿರ್ವಹಣೆ ಮತ್ತು ಸುಲಭ ವೈವಿಧ್ಯತೆಯನ್ನು ಒದಗಿಸುತ್ತವೆ.`,
        keyTakeaway: 'ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳು ವೃತ್ತಿಪರ ನಿರ್ವಹಣೆ ಮತ್ತು ವೈವಿಧ್ಯತೆಗಾಗಿ ಸಾವಿರಾರು ಹೂಡಿಕೆದಾರರ ಹಣವನ್ನು ಒಟ್ಟುಗೂಡಿಸುತ್ತವೆ.'
      },
      te: {
        videoUrl: '/academy/te/mutual-fund.mp4',
        thumbnailUrl: '/academy/te/mutual-fund.webp',
        captionUrl: '/academy/te/mutual-fund.vtt',
        transcript: `కోట్లాది భారతీయ కుటుంబాలు ప్రతి నెలా తమ కష్టార్జితాన్ని మ్యూచువల్ ఫండ్లలో ఎందుకు పెట్టుబడి పెడుతున్నాయి?\n\nమ్యూచువల్ ఫండ్ అనేది వేలాది మంది వ్యక్తిగత పెట్టుబడిదారుల నుండి నిధులను సేకరించి, ఆ ఉమ్మడి మూలధనంతో షేర్లు మరియు బాండ్ల యొక్క వృత్తిపరంగా నిర్వహించబడే పోర్ట్‌ఫోలియోను రూపొందించే సంస్థ.

మీరు స్వయంగా కంపెనీల బ్యాలెన్స్ షీట్లను విశ్లేషించాల్సిన అవసరం లేదు. అసెట్ మేనేజ్‌మెంట్ కంపెనీలు (AMC) నిపుణులైన ఫండ్ మేనేజర్లను నియమించి పెట్టుబడులను పర్యవేక్షిస్తాయి.\n\nఈ పూలింగ్ ఎలా పనిచేస్తుందో చూద్దాం. 10,000 మంది పెట్టుబడిదారులు నెలకు ₹1,000 చొప్పున జమ చేస్తే, ప్రతి నెలా ₹1 కోటి నిధి ఏర్పడుతుంది. ఫండ్ మేనేజర్ ఈ మూలధనాన్ని 40 నుండి 60 పరిశోధించబడిన కంపెనీలలో పెట్టుబడి పెడతారు.

మీరు మ్యూచువల్ ఫండ్‌లో పెట్టుబడి పెట్టినప్పుడు, ఎన్ఎవి (NAV - Net Asset Value) ఆధారంగా మీకు 'యూనిట్లు' కేటాయించబడతాయి. ఎన్ఎవి ప్రతి వ్యాపార దినం ముగింపులో లెక్కించబడుతుంది.

రకాలు: దీర్ఘకాలిక వృద్ధి కోసం ఈక్విటీ ఫండ్లు, స్థిరత్వం కోసం డెట్ ఫండ్లు, మరియు సమతుల్యత కోసం హైబ్రిడ్ ఫండ్లు.\n\n₹20 ఎన్ఎవి ఉన్న ఫండ్ ₹200 ఎన్ఎవి ఉన్న ఫండ్ కంటే మెరుగైనది లేదా చౌకైనది అనుకోవడం తప్పు. పోర్ట్‌ఫోలియో సాధించిన వృద్ధి శాతం మాత్రమే ముఖ్యం.\n\nమ్యూచువల్ ఫండ్లు మార్కెట్ రిస్క్‌లకు లోబడి ఉంటాయి. గత లాభాలు భవిష్యత్తు రాబడికి హామీ ఇవ్వవు.\n\nమ్యూచువల్ ఫండ్లు పెట్టుబడిదారుల మూలధనాన్ని ఏకం చేసి నిపుణుల నిర్వహణ మరియు సులభమైన డైవర్సిఫికేషన్‌ను అందిస్తాయి.`,
        keyTakeaway: 'మ్యూచువల్ ఫండ్లు వృత్తిపరమైన నిర్వహణ మరియు డైవర్సిఫికేషన్ కోసం వేలాది మంది పెట్టుబడిదారుల నిధులను ఒకచోట చేర్చుతాయి.'
      },
      ta: {
        videoUrl: '/academy/ta/mutual-fund.mp4',
        thumbnailUrl: '/academy/ta/mutual-fund.webp',
        captionUrl: '/academy/ta/mutual-fund.vtt',
        transcript: `கோடிக்கணக்கான இந்தியக் குடும்பங்கள் ஒவ்வொரு மாதமும் தங்களின் உழைத்த பணத்தை மியூச்சுவல் ஃபண்டுகளில் ஏன் முதலீடு செய்கிறார்கள்?\n\nமியூச்சுவல் ஃபண்ட் என்பது ஆயிரக்கணக்கான தனிப்பட்ட முதலீட்டாளர்களிடமிருந்து பணத்தை ஒன்று திரட்டி, அந்த நிதியைக் கொண்டு பங்குகள் மற்றும் பத்திரங்களின் தொழில்முறை நிர்வகிக்கப்படும் போர்ட்ஃபோலியோவை உருவாக்கும் ஒரு முதலீட்டு அமைப்பாகும்.

நீங்களே நிறுவனங்களை ஆராயவோ அல்லது நிதி அறிக்கைகளைப் படிக்கவோ தேவையில்லை. அசெட் மேனேஜ்மென்ட் கம்பெனிகள் (AMC) தகுதிவாய்ந்த நிதி மேலாளர்களை நியமித்து இந்த நிதியை நிர்வகிக்கின்றன.\n\nஇந்த நிதி திரட்டல் எவ்வாறு செயல்படுகிறது என்பதைப் பார்ப்போம். 10,000 முதலீட்டாளர்கள் மாதம் ₹1,000 வழங்கினால், ஒவ்வொரு மாதமும் ₹1 கோடி நிதி சேர்கிறது. நிதி மேலாளர் இந்த மூலதனத்தை 40 முதல் 60 தரமான நிறுவனங்களில் முதலீடு செய்கிறார்.

நீங்கள் மியூச்சுவல் ஃபண்டில் முதலீடு செய்யும் போது, என்ஏவி (NAV - Net Asset Value) அடிப்படையில் உங்களுக்கு 'யூனிட்டுகள்' ஒதுக்கப்படுகின்றன. என்ஏவி ஒவ்வொரு வணிக நாளின் முடிவிலும் கணக்கிடப்படுகிறது.

வகைகள்: நீண்ட கால வளர்ச்சிக்கு ஈக்விட்டி ஃபண்டுகள், ஸ்திரத்தன்மைக்கு டெப்ட் ஃபண்டுகள், மற்றும் சமநிலைக்கு ஹைப்ரிட் ஃபண்டுகள்.\n\n₹20 என்ஏவி உள்ள ஃபண்ட் ₹200 என்ஏவி உள்ள ஃபண்டை விட மலிவானது அல்லது சிறந்தது என்று நினைப்பது தவறு. போர்ட்ஃபோலியோவின் சதவீத வளர்ச்சி மட்டுமே முக்கியம்.\n\nமியூச்சுவல் ஃபண்டுகள் சந்தை அபாயங்களுக்கு உட்பட்டவை. கடந்த கால வருமானம் எதிர்கால லாபத்திற்கு உத்தரவாதம் அளிக்காது.\n\nமியூச்சுவல் ஃபண்டுகள் முதலீட்டாளர்களின் பணத்தை ஒன்று சேர்த்து தொழில்முறை மேலாண்மை மற்றும் எளிதான பல்வகைப்படுத்தலை வழங்குகின்றன.`,
        keyTakeaway: 'மியூச்சுவல் ஃபண்டுகள் தொழில்முறை மேலாண்மை மற்றும் பல்வகைப்படுத்தலுக்காக ஆயிரக்கணக்கான முதலீட்டாளர்களின் பணத்தை ஒன்று சேர்க்கின்றன.'
      },
      ml: {
        videoUrl: '/academy/ml/mutual-fund.mp4',
        thumbnailUrl: '/academy/ml/mutual-fund.webp',
        captionUrl: '/academy/ml/mutual-fund.vtt',
        transcript: `കോടിക്കണക്കിന് ഇന്ത്യൻ കുടുംബങ്ങൾ എല്ലാ മാസവും കഷ്ടപ്പെട്ട് സമ്പാദിച്ച പണം മ്യൂച്വൽ ഫണ്ടുകളിൽ നിക്ഷേപിക്കുന്നത് എന്തുകൊണ്ടാണ്?\n\nആയിരക്കണക്കിന് വ്യക്തിഗത നിക്ഷേപകരിൽ നിന്ന് പണം സമാഹരിച്ച് ഓഹരികളുടെയും ബോണ്ടുകളുടെയും ഒരു പ്രൊഫഷണൽ പോർട്ട്ഫോളിയോ രൂപീകരിക്കുന്ന സ്ഥാപനമാണ് മ്യൂച്വൽ ഫണ്ട്.

നിങ്ങൾ സ്വയം കമ്പനികളുടെ ബാലൻസ് ഷീറ്റുകൾ പരിശോധിക്കേണ്ടതില്ല. അസറ്റ് മാനേജ്‌മെന്റ് കമ്പനികൾ (AMC) പ്രഗത്ഭരായ ഫണ്ട് മാനേജർമാരെ നിയോഗിച്ച് ഈ പണം കൈകാര്യം ചെയ്യുന്നു.\n\nഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് നോക്കാം. 10,000 നിക്ഷേപകർ മാസംതോറും ₹1,000 വീതം നൽകിയാൽ, ഓരോ മാസവും ₹1 കോടിയുടെ ഫണ്ട് രൂപപ്പെടുന്നു. ഫണ്ട് മാനേജർ ഈ പണം 40 മുതൽ 60 മികച്ച കമ്പനികളിൽ നിക്ഷേപിക്കുന്നു.

നിങ്ങൾ മ്യൂച്വൽ ഫണ്ടിൽ നിക്ഷേപിക്കുമ്പോൾ, എൻഎവി (NAV - Net Asset Value) അടിസ്ഥാനമാക്കി നിങ്ങൾക്ക് 'യൂണിറ്റുകൾ' ലഭിക്കുന്നു. എല്ലാ ദിവസത്തെയും വിപണി അവസാനിക്കുമ്പോൾ എൻഎവി കണക്കാക്കുന്നു.

വിഭാഗങ്ങൾ: ദീർഘകാല വളർച്ചയ്ക്ക് ഇക്വിറ്റി ഫണ്ടുകൾ, സ്ഥിരതയ്ക്ക് ഡെറ്റ് ഫണ്ടുകൾ, രണ്ടിന്റെയും സംയോജനത്തിന് ഹൈബ്രിഡ് ഫണ്ടുകൾ.\n\n₹20 എൻഎവി ഉള്ള ഫണ്ട് ₹200 എൻഎവി ഉള്ള ഫണ്ടിനേക്കാൾ മികച്ചതോ വിലകുറഞ്ഞതോ എന്ന് കരുതുന്നത് തെറ്റാണ്. പോർട്ട്ഫോളിയോയുടെ വളർച്ചാ ശതമാനം മാത്രമാണ് പ്രധാനം.\n\nമ്യൂച്വൽ ഫണ്ടുകൾ മാർക്കറ്റ് റിസ്കുകൾക്ക് വിധേയമാണ്. മുൻകാല നേട്ടങ്ങൾ ഭാവി ലാഭത്തിന് ഉറപ്പുനൽകുന്നില്ല.\n\nമ്യൂച്വൽ ഫണ്ടുകൾ നിക്ഷേപകരുടെ പണം ഒരുമിപ്പിച്ച് പ്രൊഫഷണൽ മാനേജ്‌മെന്റും എളുപ്പമുള്ള വൈവിധ്യവൽക്കരണവും നൽകുന്നു.`,
        keyTakeaway: 'പ്രൊഫഷണൽ മാനേജ്‌മെന്റിനും വൈവിധ്യവൽക്കരണത്തിനുമായി ആയിരക്കണക്കിന് നിക്ഷേപകരുടെ പണം മ്യൂച്വൽ ഫണ്ടുകൾ ഒരുമിപ്പിക്കുന്നു.'
      },
      mr: {
        videoUrl: '/academy/mr/mutual-fund.mp4',
        thumbnailUrl: '/academy/mr/mutual-fund.webp',
        captionUrl: '/academy/mr/mutual-fund.vtt',
        transcript: `कोट्यवधी भारतीय कुटुंबे दरमहा त्यांच्या कष्टाचे पैसे म्युच्युअल फंडात का गुंतवतात?\n\nम्युच्युअल फंड ही एक अशी गुंतवणूक संस्था आहे जी हजारो वैयक्तिक गुंतवणूकदारांकडून पैसा गोळा करते आणि त्या निधीतून शेअर्स आणि रोख्यांचा व्यावसायिकरित्या व्यवस्थापित पोर्टफोलिओ तयार करते.

तुम्हाला स्वतः कंपन्यांचा अभ्यास करण्याची किंवा बॅलन्स शीट तपासण्याची गरज नसते. अ‍ॅसेट मॅनेजमेंट कंपन्या (AMC) अनुभवी फंड मॅनेजर्स नियुक्त करून हा निधी व्यवस्थापित करतात.\n\nहे कसे काम करते ते पाहू. 10,000 गुंतवणूकदारांनी दरमहा ₹1,000 दिले तर दरमहा ₹1 कोटींचा फंड तयार होतो. फंड मॅनेजर हा पैसा 40 ते 60 चांगल्या कंपन्यांमध्ये गुंतवतो.

जेव्हा तुम्ही म्युच्युअल फंडात गुंतवणूक करता, तेव्हा एनएव्ही (NAV - Net Asset Value) च्या आधारे तुम्हाला 'युनिट्स' मिळतात. प्रत्येक व्यावसायिक दिवसाच्या शेवटी एनएव्ही मोजली जाते.

प्रकार: दीर्घकालीन वाढीसाठी इक्विटी फंड, स्थिरतेसाठी डेट फंड, आणि संतुलनासाठी हायब्रिड फंड.\n\n₹20 एनएव्ही असलेला फंड ₹200 एनएव्ही असलेल्या फंडापेक्षा चांगला किंवा स्वस्त असतो हा गैरसमज आहे. पोर्टफोलिओची टक्केवारी वाढ हीच खरी महत्त्वाची असते.\n\nम्युच्युअल फंड बाजार जोखमीच्या अधीन असतात. मागील परतावा भविष्यातील लाभाची हमी देत नाही.\n\nम्युच्युअल फंड गुंतवणूकदारांचा पैसा एकत्र करून व्यावसायिक व्यवस्थापन आणि सहज वैविध्यीकरण देतात.`,
        keyTakeaway: 'म्युच्युअल फंड व्यावसायिक व्यवस्थापन आणि वैविध्यीकरणासाठी हजारो गुंतवणूकदारांचा पैसा एकत्र आणतात.'
      },
      bn: {
        videoUrl: '/academy/bn/mutual-fund.mp4',
        thumbnailUrl: '/academy/bn/mutual-fund.webp',
        captionUrl: '/academy/bn/mutual-fund.vtt',
        transcript: `কোটি কোটি ভারতীয় পরিবার প্রতি মাসে তাদের কষ্টার্জিত অর্থ কেন মিউচুয়াল ফান্ডে বিনিয়োগ করছে?\n\nমিউচুয়াল ফান্ড হলো এমন একটি বিনিয়োগ ট্রাস্ট যা হাজার হাজার সাধারণ বিনিয়োগকারীর কাছ থেকে অর্থ সংগ্রহ করে শেয়ার এবং বন্ডের একটি পেশাদারভাবে পরিচালিত পোর্টফোলিও তৈরি করে।

আপনাকে নিজে থেকে কোম্পানি বিশ্লেষণ বা ব্যালেন্স শিট যাচাই করতে হয় না। অ্যাসেট ম্যানেজমেন্ট কোম্পানি (AMC) দক্ষ ফান্ড ম্যানেজার নিয়োগ করে এই সম্মিলিত তহবিলের সঠিক ব্যবস্থাপনা নিশ্চিত করে।\n\nআসুন দেখি এটি কীভাবে কাজ করে। ১০,০০০ বিনিয়োগকারী প্রতি মাসে ₹১,০০০ করে দিলে প্রতি মাসে ₹১ কোটি টাকার ফান্ড তৈরি হয়। ফান্ড ম্যানেজার এই অর্থ ৪০ থেকে ৬০টি নির্ভরযোগ্য কোম্পানিতে বিনিয়োগ করেন।

আপনি যখন মিউচুয়াল ফান্ডে বিনিয়োগ করেন, তখন এনএভি (NAV - Net Asset Value)-এর ভিত্তিতে আপনাকে 'ইউনিট' বরাদ্দ করা হয়। প্রতিটি কার্যদিবসের শেষে এনএভি নির্ধারিত হয়।

প্রকারভেদ: দীর্ঘমেয়াদী বৃদ্ধির জন্য ইক্যুইটি ফান্ড, স্থিতিশীলতার জন্য ডেট ফান্ড, এবং দুটির সমন্বয়ে হাইব্রিড ফান্ড।\n\n₹২০ এনএভি-এর ফান্ড ₹২০০ এনএভি-এর ফান্ডের চেয়ে সস্তা বা ভালো মনে করা ভুল। পোর্টফোলিওর শতকরা বৃদ্ধিই হলো আসল বিষয়।\n\nমিউচুয়াল ফান্ড বাজারের ঝুঁকির আওতাধীন। অতীতের রিটার্ন ভবিষ্যতের মুনাফার নিশ্চয়তা দেয় না।\n\nমিউচুয়াল ফান্ড সাধারণ মানুষের অর্থ একত্রিত করে পেশাদার ব্যবস্থাপনা ও সহজ বৈচিত্র্যকরণের সুযোগ দেয়।`,
        keyTakeaway: 'মিউচুয়াল ফান্ড পেশাদার ব্যবস্থাপনা এবং বৈচিত্র্যকরণের জন্য হাজার হাজার বিনিয়োগকারীর অর্থ একত্রিত করে।'
      },
    }
  },
  // ── 06. WHY LONG-TERM INVESTING? ──
  {
    id: 'why-long-term-investing',
    number: 6,
    title: 'Why Long-Term Investing?',
    category: 'Investing Strategy',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/long-term.mp4',
    thumbnailUrl: '/academy/long-term.webp',
    description: 'Why time in the market beats timing the market, historical return probabilities, and the power of patience over daily noise.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for Why Long-Term Investing?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `If you follow daily financial headlines, you might believe that investing is about buying and selling every day to predict market tops and bottoms. But what does historical evidence actually show?\n\nHistory consistently demonstrates that the most successful wealth builders are long-term investors. Long-term investing means committing your capital to quality assets for time horizons of 5, 10, 15 years or more.

In the short term, financial markets are driven by emotion, news events, geopolitical tension, and speculative sentiment. Over days or months, market prices can swing unpredictably. However, over multi-year horizons, stock markets reflect the fundamental earnings power, innovation, and economic productivity of underlying businesses.\n\nConsider market history: over any random 1-year holding period, stock market returns can be highly volatile, swinging between positive 30% and negative 20%. But as you extend your investment horizon to 7, 10, or 15 years in diversified market indices, the probability of achieving positive real returns has historically approached 100%.

Long-term investing also offers massive structural advantages: you save significantly on brokerage fees, you avoid high short-term capital gains taxes, and most importantly, you eliminate the emotional stress of trying to time unpredictable daily market noise.\n\nA common mistake is believing long-term investing means buying a stock and ignoring it blindly forever. Sound investing involves patience with the market, combined with annual reviews to ensure your asset allocation remains aligned with your goals.\n\nKeep in mind that holding a single failing company for the long term will not save it from poor fundamentals. Long-term patience must always be paired with broad diversification.\n\nTime in the market consistently beats timing the market; patient discipline allows economic growth and compounding to create lasting wealth.`,
    learningPoints: [
      "Short-term price noise reflects emotion; long-term returns reflect business earnings power.",
      "Historical probability of positive real returns increases with time horizon.",
      "Lower brokerage friction and reduced short-term capital gains tax liabilities.",
      "Why time in the market consistently beats attempting to time market peaks and troughs."
],
    keyTakeaway: 'Time in the market beats timing the market; patience allows businesses and compounding to work for you.',
    quiz: [
      {
            "id": "q6-1",
            "question": "Why does a long-term investment horizon increase the probability of positive returns?",
            "options": [
                  "Short-term daily noise and emotion smooth out, allowing fundamental corporate earnings growth to drive returns.",
                  "Government regulations ban stock prices from falling after 5 years.",
                  "Stock exchanges waive all company taxes after 10 years.",
                  "Long-term investors receive double dividend bonuses."
            ],
            "correctAnswer": 0,
            "explanation": "Over multi-year periods, short-term market sentiment fluctuations fade and returns align with underlying business profits."
      },
      {
            "id": "q6-2",
            "question": "What is a key financial advantage of avoiding frequent short-term trading?",
            "options": [
                  "Zero risk of any market volatility.",
                  "Significant savings on brokerage friction and lower long-term capital gains tax rates.",
                  "Free shares awarded every month by the broker.",
                  "Exemption from all KYC requirements."
            ],
            "correctAnswer": 1,
            "explanation": "Long-term investing drastically reduces transaction costs, avoids high short-term tax rates, and minimizes emotional stress."
      }
],
    relatedLessons: ["what-is-compounding", "what-is-sip", "risk-return-diversification"],
    vestiqPrompt: 'Why does time in the market beat timing the market?',
    languages: {
      en: {
        videoUrl: '/academy/en/long-term.mp4',
        thumbnailUrl: '/academy/en/long-term.webp',
        captionUrl: '/academy/en/long-term.vtt',
        transcript: `If you follow daily financial headlines, you might believe that investing is about buying and selling every day to predict market tops and bottoms. But what does historical evidence actually show?\n\nHistory consistently demonstrates that the most successful wealth builders are long-term investors. Long-term investing means committing your capital to quality assets for time horizons of 5, 10, 15 years or more.

In the short term, financial markets are driven by emotion, news events, geopolitical tension, and speculative sentiment. Over days or months, market prices can swing unpredictably. However, over multi-year horizons, stock markets reflect the fundamental earnings power, innovation, and economic productivity of underlying businesses.\n\nConsider market history: over any random 1-year holding period, stock market returns can be highly volatile, swinging between positive 30% and negative 20%. But as you extend your investment horizon to 7, 10, or 15 years in diversified market indices, the probability of achieving positive real returns has historically approached 100%.

Long-term investing also offers massive structural advantages: you save significantly on brokerage fees, you avoid high short-term capital gains taxes, and most importantly, you eliminate the emotional stress of trying to time unpredictable daily market noise.\n\nA common mistake is believing long-term investing means buying a stock and ignoring it blindly forever. Sound investing involves patience with the market, combined with annual reviews to ensure your asset allocation remains aligned with your goals.\n\nKeep in mind that holding a single failing company for the long term will not save it from poor fundamentals. Long-term patience must always be paired with broad diversification.\n\nTime in the market consistently beats timing the market; patient discipline allows economic growth and compounding to create lasting wealth.`,
        keyTakeaway: 'Time in the market beats timing the market; patience allows businesses and compounding to work for you.'
      },
      hi: {
        videoUrl: '/academy/hi/long-term.mp4',
        thumbnailUrl: '/academy/hi/long-term.webp',
        captionUrl: '/academy/hi/long-term.vtt',
        transcript: `यदि आप दैनिक वित्तीय समाचार देखते हैं, तो आपको लग सकता है कि निवेश का मतलब रोजाना शेयर खरीदना और बेचना है। लेकिन ऐतिहासिक आंकड़े वास्तव में क्या साबित करते हैं?\n\nइतिहास लगातार यह दिखाता है कि सबसे सफल धन निर्माता वे होते हैं जो दीर्घकालिक निवेशक होते हैं। दीर्घकालिक निवेश का अर्थ है अपनी पूंजी को 5, 10, 15 या उससे अधिक वर्षों के लिए गुणवत्तापूर्ण संपत्तियों में निवेशित रखना।

अल्पकाल में, वित्तीय बाजार भावनाओं, समाचारों, वैश्विक घटनाओं और सट्टा प्रवृत्तियों से संचालित होते हैं। कुछ दिनों या महीनों में बाजार अप्रत्याशित रूप से ऊपर या नीचे जा सकता है। लेकिन कई वर्षों की अवधि में, शेयर बाजार अंतर्निहित कंपनियों की कमाई, नवाचार और देश की आर्थिक उत्पादकता को दर्शाता है।\n\nबाजार के इतिहास पर विचार करें: किसी भी 1 वर्ष की अवधि में शेयर बाजार का रिटर्न बहुत अस्थिर हो सकता है, जो +30% से लेकर -20% तक हो सकता है। लेकिन जब आप एक विविध इंडेक्स में अपने निवेश की अवधि को 7, 10 या 15 वर्ष तक बढ़ाते हैं, तो सकारात्मक वास्तविक रिटर्न मिलने की संभावना ऐतिहासिक रूप से लगभग 100% के करीब पहुंच जाती है।

दीर्घकालिक निवेश के कई संरचनात्मक लाभ भी हैं: आप बार-बार ब्रोकरेज फीस से बचते हैं, अल्पकालिक पूंजीगत लाभ कर से बचते हैं, और सबसे महत्वपूर्ण बात, आप रोजमर्रा के बाजार के शोर और तनाव से मुक्त रहते हैं।\n\nएक आम गलतफहमी यह है कि दीर्घकालिक निवेश का मतलब किसी भी शेयर को खरीदकर आंख मूंदकर भूल जाना है। समझदार निवेश का मतलब है बाजार के साथ धैर्य रखना, लेकिन साल में एक बार अपने पोर्टफोलियो की समीक्षा करना ताकि आपकी संपत्ति आपके लक्ष्यों के अनुरूप रहे।\n\nयाद रखें कि किसी कमजोर या डूबती हुई कंपनी को लंबे समय तक रखने से वह अच्छी नहीं बन जाएगी। दीर्घकालिक धैर्य को हमेशा व्यापक विविधीकरण के साथ जोड़ा जाना चाहिए।\n\nबाजार को टाइम करने की कोशिश करने के बजाय बाजार में लंबे समय तक बने रहना ही वास्तविक धन और वित्तीय स्वतंत्रता का निर्माण करता है।`,
        keyTakeaway: 'बाजार को टाइम करने से बेहतर है बाजार में समय बिताना; धैर्य से कंपाउंडिंग आपके लिए काम करती है।'
      },
      kn: {
        videoUrl: '/academy/kn/long-term.mp4',
        thumbnailUrl: '/academy/kn/long-term.webp',
        captionUrl: '/academy/kn/long-term.vtt',
        transcript: `ದೈನಂದಿನ ಸುದ್ದಿಗಳನ್ನು ನೋಡುವಾಗ ಹೂಡಿಕೆ ಎಂದರೆ ಪ್ರತಿದಿನ ಷೇರುಗಳನ್ನು ಖರೀದಿಸುವುದು ಮತ್ತು ಮಾರುವುದು ಎಂದು ಅನಿಸಬಹುದು. ಆದರೆ ಇತಿಹಾಸವು ಏನನ್ನು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ?\n\nಇತಿಹಾಸದ ಪ್ರಕಾರ ದೀರ್ಘಾವಧಿಯ ಹೂಡಿಕೆದಾರರೇ ಅತ್ಯಂತ ಯಶಸ್ವಿ ಸಂಪತ್ತು ಸೃಷ್ಟಿಕರ್ತರು. ದೀರ್ಘಾವಧಿ ಹೂಡಿಕೆ ಎಂದರೆ ನಿಮ್ಮ ಬಂಡವಾಳವನ್ನು 5, 10, 15 ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು ವರ್ಷಗಳ ಕಾಲ ಗುಣಮಟ್ಟದ ಆಸ್ತಿಗಳಲ್ಲಿ ತೊಡಗಿಸುವುದು.

ಅಲ್ಪಾವಧಿಯಲ್ಲಿ ಮಾರುಕಟ್ಟೆಯು ಭಾವನೆಗಳು ಮತ್ತು ಸುದ್ದಿಗಳ ಆಧಾರದ ಮೇಲೆ ತೀವ್ರವಾಗಿ ಏರಿಳಿತಗೊಳ್ಳಬಹುದು. ಆದರೆ ದೀರ್ಘಾವಧಿಯಲ್ಲಿ ಅದು ಆರ್ಥಿಕತೆಯ ನೈಜ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕಂಪನಿಗಳ ಲಾಭದಾಯಕತೆಯನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.\n\nಮಾರುಕಟ್ಟೆಯ ಇತಿಹಾಸವನ್ನು ಗಮನಿಸಿ: ಯಾವುದೇ 1 ವರ್ಷದ ಅವಧಿಯಲ್ಲಿ ಷೇರು ಮಾರುಕಟ್ಟೆಯು +30% ರಿಂದ -20% ವರೆಗೆ ಏರಿಳಿತ ಕಾಣಬಹುದು. ಆದರೆ ವೈವಿಧ್ಯಮಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿಮ್ಮ ಹೂಡಿಕೆಯ ಅವಧಿಯನ್ನು 7, 10 ಅಥವಾ 15 ವರ್ಷಗಳಿಗೆ ವಿಸ್ತರಿಸಿದಾಗ, ಲಾಭ ಗಳಿಸುವ ಸಂಭವನೀಯತೆ ಸುಮಾರು 100% ತಲುಪುತ್ತದೆ.

ದೀರ್ಘಾವಧಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಬ್ರೋಕರೇಜ್ ಶುಲ್ಕಗಳು ಉಳಿಯುತ್ತವೆ, ತೆರಿಗೆ ಹೊರೆ ಕಡಿಮೆಯಾಗುತ್ತದೆ ಮತ್ತು ದೈನಂದಿನ ಮಾನಸಿಕ ಒತ್ತಡವಿರುವುದಿಲ್ಲ.\n\nದೀರ್ಘಾವಧಿ ಹೂಡಿಕೆ ಎಂದರೆ ಷೇರು ಖರೀದಿಸಿ ಸಂಪೂರ್ಣವಾಗಿ ಮರೆತುಬಿಡುವುದು ಎಂಬುದು ತಪ್ಪು ಕಲ್ಪನೆ. ವರ್ಷಕ್ಕೊಮ್ಮೆ ನಿಮ್ಮ ಪೋರ್ಟ್‌ಫೋಲಿಯೊವನ್ನು ಪರಿಶೀಲಿಸುವುದು ಅಗತ್ಯ.\n\nನಷ್ಟದಲ್ಲಿರುವ ಕಂಪನಿಯನ್ನು ದೀರ್ಘಕಾಲ ಇಟ್ಟುಕೊಂಡರೆ ಅದು ಲಾಭ ನೀಡುವುದಿಲ್ಲ. ತಾಳ್ಮೆಯ ಜೊತೆಗೆ ಉತ್ತಮ ವೈವಿಧ್ಯತೆ ಅತ್ಯಗತ್ಯ.\n\nಮಾರುಕಟ್ಟೆಯನ್ನು ಊಹಿಸುವುದಕ್ಕಿಂತ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ದೀರ್ಘಕಾಲ ಉಳಿಯುವುದೇ ನಿಜವಾದ ಸಂಪತ್ತು ಸೃಷ್ಟಿಗೆ ದಾರಿಯಾಗಿದೆ.`,
        keyTakeaway: 'ಮಾರುಕಟ್ಟೆಯನ್ನು ಟೈಮ್ ಮಾಡುವುದಕ್ಕಿಂತ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಸಮಯ ಕಳೆಯುವುದು ಮುಖ್ಯ; ತಾಳ್ಮೆಯಿಂದ ಕಾಂಪೌಂಡಿಂಗ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.'
      },
      te: {
        videoUrl: '/academy/te/long-term.mp4',
        thumbnailUrl: '/academy/te/long-term.webp',
        captionUrl: '/academy/te/long-term.vtt',
        transcript: `రోజూ ఆర్థిక వార్తలను చూసినప్పుడు పెట్టుబడి అంటే రోజూ షేర్లను కొనడం, అమ్మడం అనిపించవచ్చు. కానీ చరిత్ర వాస్తవానికి ఏమి నిరూపిస్తోంది?\n\nచరిత్ర ప్రకారం దీర్ఘకాలిక పెట్టుబడిదారులే అత్యంత విజయవంతమైన సంపద సృష్టికర్తలు. దీర్ఘకాలిక పెట్టుబడి అంటే మీ మూలధనాన్ని 5, 10, 15 లేదా అంతకంటే ఎక్కువ సంవత్సరాల పాటు నాణ్యమైన ఆస్తులలో ఉంచడం.

స్వల్పకాలంలో మార్కెట్ వార్తలు మరియు భావోద్వేగాల వల్ల హెచ్చుతగ్గులకు లోనవుతుంది. కానీ దీర్ఘకాలంలో స్టాక్ మార్కెట్ దేశ ఆర్థిక వృద్ధిని మరియు వ్యాపారాల వాస్తవ లాభాలను ప్రతిబింబిస్తుంది.\n\nమార్కెట్ చరిత్రను పరిశీలించండి: ఏదైనా 1 సంవత్సరం కాలంలో మార్కెట్ రాబడి +30% నుండి -20% వరకు తీవ్రంగా మారవచ్చు. కానీ వైవిధ్యభరితమైన మార్కెట్లలో మీ పెట్టుబడి సమయాన్ని 7, 10 లేదా 15 సంవత్సరాలకు పెంచినప్పుడు, లాభాలు పొందే సంభావ్యత దాదాపు 100% కి చేరుకుంటుంది.

దీర్ఘకాలిక పెట్టుబడితో బ్రోకరేజ్ ఖర్చులు తగ్గుతాయి, పన్నుల భారం తగ్గుతుంది మరియు రోజువారీ మానసిక ఒత్తిడి ఉండదు.\n\nదీర్ఘకాలిక పెట్టుబడి అంటే షేరు కొని పూర్తిగా మరచిపోవడం అనే భావన తప్పు. సంవత్సరానికి ఒకసారి మీ పోర్ట్‌ఫోలియోను సమీక్షించుకోవడం అవసరం.\n\nనష్టాల్లో ఉన్న కంపెనీని దీర్ఘకాలం ఉంచుకుంటే లాభం రాదు. ఓర్పుతో పాటు మంచి డైవర్సిఫికేషన్ ఎంతో ముఖ్యం.\n\nమార్కెట్‌ను ఊహించడం కంటే మార్కెట్‌లో ఎక్కువ కాలం కొనసాగడమే నిజమైన సంపదను నిర్మిస్తుంది.`,
        keyTakeaway: 'మార్కెట్‌ను టైమ్ చేయడం కంటే మార్కెట్‌లో సమయం గడపడమే ముఖ్యం; ఓర్పుతో కాంపౌండింగ్ సంపదను సృష్టిస్తుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/long-term.mp4',
        thumbnailUrl: '/academy/ta/long-term.webp',
        captionUrl: '/academy/ta/long-term.vtt',
        transcript: `தினசரி நிதிச் செய்திகளைப் பார்க்கும்போது முதலீடு என்பது தினமும் பங்குகளை வாங்கி விற்பது என்று தோன்றலாம். ஆனால் வரலாறு உண்மையில் என்ன நிரூபிக்கிறது?\n\nவரலாற்று ரீதியாக நீண்ட கால முதலீட்டாளர்களே மிகப்பெரிய செல்வத்தை உருவாக்கியுள்ளனர். நீண்ட கால முதலீடு என்பது உங்கள் மூலதனத்தை 5, 10, 15 அல்லது அதற்கு மேற்பட்ட ஆண்டுகளுக்குத் தரமான சொத்துக்களில் முதலீடு செய்து வைத்திருப்பதாகும்.

குறுகிய காலத்தில் சந்தை உணர்ச்சிகள் மற்றும் செய்திகளால் ஏற்ற இறக்கங்களைச் சந்திக்கும். ஆனால் நீண்ட காலத்தில் பங்குச் சந்தை நாட்டின் பொருளாதார வளர்ச்சியையும் வணிகங்களின் உண்மையான லாபத்தையும் பிரதிபலிக்கிறது.\n\nசந்தையின் வரலாற்றைக் கவனியுங்கள்: எந்தவொரு 1 வருட காலத்திலும் பங்குச் சந்தை வருமானம் +30% முதல் -20% வரை மாறக்கூடும். ஆனால் பல்வகைப்பட்ட குறியீடுகளில் உங்கள் முதலீட்டுக் காலத்தை 7, 10 அல்லது 15 ஆண்டுகளுக்கு நீட்டிக்கும் போது, லாபம் பெறுவதற்கான நிகழ்தகவு கிட்டத்தட்ட 100% ஆக உயர்கிறது.

நீண்ட கால முதலீட்டில் தரகு கட்டணம் மிச்சமாகிறது, மூலதன ஆதாய வரி குறைகிறது மற்றும் தினசரி மன அழுத்தம் தவிர்க்கப்படுகிறது.\n\nநீண்ட கால முதலீடு என்றால் பங்கை வாங்கிவிட்டு முற்றிலும் மறந்துவிடுவது என்பது தவறு. வருடத்திற்கு ஒருமுறை உங்கள் போர்ட்ஃபோலியோவை ஆய்வு செய்வது அவசியம்.\n\nநலிவடைந்த நிறுவனத்தை நீண்ட காலம் வைத்திருப்பது லாபம் தராது. பொறுமையுடன் சரியான பல்வகைப்படுத்தலும் அவசியம்.\n\nசந்தையைக் கணிக்க முயற்சிப்பதை விட சந்தையில் நீண்ட காலம் நிலைத்து இருப்பதே உண்மையான செல்வத்தை உருவாக்கும்.`,
        keyTakeaway: 'சந்தையை டைம் செய்வதை விட சந்தையில் நீண்ட காலம் இருப்பதே சிறந்தது; பொறுமையுடன் கூட்டு வட்டி உங்களுக்காக உழைக்கும்.'
      },
      ml: {
        videoUrl: '/academy/ml/long-term.mp4',
        thumbnailUrl: '/academy/ml/long-term.webp',
        captionUrl: '/academy/ml/long-term.vtt',
        transcript: `ദൈനംദിന വാർത്തകൾ കാണുമ്പോൾ നിക്ഷേപം എന്നാൽ ദിവസവും ഓഹരികൾ വാങ്ങലും വിൽക്കലുമാണെന്ന് തോന്നാം. എന്നാൽ ചരിത്രം യഥാർത്ഥത്തിൽ എന്താണ് തെളിയിക്കുന്നത്?\n\nചരിത്രപരമായി ദീർഘകാല നിക്ഷേപകരാണ് ഏറ്റവും വലിയ സമ്പത്ത് ഉണ്ടാക്കിയിട്ടുള്ളത്. ദീർഘകാല നിക്ഷേപം എന്നാൽ നിങ്ങളുടെ പണം 5, 10, 15 അല്ലെങ്കിൽ അതിൽ കൂടുതൽ വർഷത്തേക്ക് മികച്ച ആസ്തികളിൽ നിലനിർത്തുക എന്നതാണ്.

ഹ്രസ്വകാലത്ത് വാർത്തകളും വികാരങ്ങളും കാരണം വിപണിയിൽ വലിയ ചാഞ്ചാട്ടങ്ങൾ ഉണ്ടാകാം. എന്നാൽ ദീർഘകാലത്തിൽ ഓഹരി വിപണി പ്രതിഫലിപ്പിക്കുന്നത് രാജ്യത്തിന്റെ സാമ്പത്തിക വളർച്ചയെയും ബിസിനസ്സുകളുടെ യഥാർത്ഥ ലാഭത്തെയുമാണ്.\n\nവിപണിയുടെ ചരിത്രം പരിശോധിക്കുക: ഏതെങ്കിലും ഒരു വർഷത്തെ കാലയളവിൽ വിപണി റിട്ടേൺ +30% മുതൽ -20% വരെ വലിയ വ്യത്യാസം കാണിക്കാം. എന്നാൽ നിക്ഷേപ കാലയളവ് 7, 10 അല്ലെങ്കിൽ 15 വർഷങ്ങളിലേക്ക് നീട്ടുമ്പോൾ ലാഭം നേടാനുള്ള സാധ്യത ഏകദേശം 100% ആയി ഉയരുന്നു.

ദീർഘകാല നിക്ഷേപത്തിൽ ബ്രോക്കറേജ് ചിലവ് കുറയുന്നു, നികുതി ഭാരം കുറയുന്നു, ദിവസേനയുള്ള മാനസിക സമ്മർദ്ദം ഒഴിവാകുന്നു.\n\nദീർഘകാല നിക്ഷേപം എന്നാൽ ഓഹരി വാങ്ങി പൂർണ്ണമായി മറക്കുക എന്നല്ല. വർഷത്തിലൊരിക്കൽ പോർട്ട്ഫോളിയോ പുനഃപരിശോധിക്കുന്നത് അത്യാവശ്യമാണ്.\n\nനഷ്ടത്തിലുള്ള മോശം കമ്പനിയെ ദീർഘകാലം കൈവശം വെച്ചാൽ ലാഭം ലഭിക്കില്ല. ക്ഷമയോടൊപ്പം മികച്ച വൈവിധ്യവൽക്കരണവും വേണം.\n\nവിപണിയെ പ്രവചിക്കാൻ ശ്രമിക്കുന്നതിനേക്കാൾ വിപണിയിൽ കൂടുതൽ കാലം തുടരുന്നതാണ് യഥാർത്ഥ സമ്പത്ത് സൃഷ്ടിക്കുന്നത്.`,
        keyTakeaway: 'മാർക്കറ്റ് ടൈം ചെയ്യുന്നതിനേക്കാൾ മാർക്കറ്റിൽ കൂടുതൽ സമയം തുടരുന്നതാണ് പ്രധാനം; ക്ഷമയോടെയുള്ള കോമ്പൗണ്ടിംഗ് സമ്പത്ത് നൽകും.'
      },
      mr: {
        videoUrl: '/academy/mr/long-term.mp4',
        thumbnailUrl: '/academy/mr/long-term.webp',
        captionUrl: '/academy/mr/long-term.vtt',
        transcript: `दररोजच्या आर्थिक बातम्या पाहिल्यावर गुंतवणूक म्हणजे रोज शेअर्स खरेदी-विक्री करणे असे वाटू शकते. पण इतिहास प्रत्यक्षात काय सिद्ध करतो?\n\nइतिहास सातत्याने दाखवून देतो की दीर्घकालीन गुंतवणूकदारच सर्वात यशस्वी संपत्ती निर्माते असतात. दीर्घकालीन गुंतवणूक म्हणजे तुमचे भांडवल 5, 10, 15 किंवा त्याहून अधिक वर्षे चांगल्या मालमत्तेत गुंतवून ठेवणे.

अल्पकाळात बाजार भावना आणि बातम्यांमुळे तीव्र चढ-उतार अनुभवतो. पण दीर्घकाळात शेअर बाजार देशाची आर्थिक वाढ आणि व्यवसायांचा खरा नफा दर्शवतो.\n\nबाजाराचा इतिहास पहा: कोणत्याही 1 वर्षाच्या कालावधीत बाजार परतावा +30% ते -20% असा अस्थिर असू शकतो. पण वैविध्यपूर्ण निर्देशांकांमध्ये गुंतवणुकीचा कालावधी 7, 10 किंवा 15 वर्षांपर्यंत वाढवल्यास नफा मिळण्याची शक्यता जवळपास 100% होते.

दीर्घकालीन गुंतवणुकीत ब्रोकरेज खर्च वाचतो, कर कमी लागतो आणि रोजचा मानसिक ताण टळतो.\n\nदीर्घकालीन गुंतवणूक म्हणजे शेअर घेऊन पूर्णपणे विसरून जाणे हा गैरसमज आहे. वर्षातून एकदा पोर्टफोलिओचा आढावा घेणे आवश्यक असते.\n\nतोट्यातील कंपनी दीर्घकाळ ठेवून नफा मिळत नाही. संयमासोबत योग्य वैविध्यीकरण अत्यंत आवश्यक आहे.\n\nबाजाराची अचूक वेळ शोधण्यापेक्षा बाजारात दीर्घकाळ टिकून राहणे हीच खरी संपत्ती निर्मितीची गुरुकिल्ली आहे.`,
        keyTakeaway: 'बाजाराची वेळ साधण्यापेक्षा बाजारात वेळ घालवणे महत्त्वाचे; संयमाने चक्रवाढ संपत्ती तयार करते.'
      },
      bn: {
        videoUrl: '/academy/bn/long-term.mp4',
        thumbnailUrl: '/academy/bn/long-term.webp',
        captionUrl: '/academy/bn/long-term.vtt',
        transcript: `প্রতিদিনের আর্থিক খবর দেখলে মনে হতে পারে বিনিয়োগ মানে প্রতিদিন শেয়ার কেনাবেচা করা। কিন্তু ইতিহাস প্রকৃতপক্ষে কী প্রমাণ করে?\n\nইতিহাস ধারাবাহিকভাবে প্রমাণ করে যে দীর্ঘমেয়াদী বিনিয়োগকারীরাই সবচেয়ে সফল সম্পদ নির্মাতা। দীর্ঘমেয়াদী বিনিয়োগ মানে আপনার অর্থ ৫, ১০, ১৫ বা তার বেশি বছরের জন্য ভালো সম্পদে বিনিয়োগ করে রাখা।

স্বল্পমেয়াদে বাজারের আবেগ ও খবরের কারণে তীব্র ওঠানামা হতে পারে। কিন্তু দীর্ঘমেয়াদে স্টক মার্কেট দেশের অর্থনৈতিক প্রবৃদ্ধি ও ব্যবসার প্রকৃত লাভকে প্রতিফলিত করে।\n\nবাজারের ইতিহাস দেখুন: যেকোনো ১ বছরের মেয়াদে বাজার রিটার্ন +৩০% থেকে -২০% পর্যন্ত ওঠানামা করতে পারে। কিন্তু বৈচিত্র্যময় সূচকে বিনিয়োগের মেয়াদ ৭, ১০ বা ১৫ বছর পর্যন্ত বাড়ালে ইতিবাচক রিটার্ন পাওয়ার সম্ভাবনা প্রায় ১০০% এর কাছাকাছি পৌঁছায়।

দীর্ঘমেয়াদী বিনিয়োগে ব্রোকারেজ ফি বাঁচে, কর কম লাগে এবং প্রতিদিনের মানসিক চাপ এড়ানো যায়।\n\nদীর্ঘমেয়াদী বিনিয়োগ মানে শেয়ার কিনে পুরোপুরি ভুলে বসে থাকা নয়। বছরে অন্তত একবার নিজের পোর্টফোলিও পর্যালোচনা করা দরকার।\n\nক্ষতিগ্রস্ত দুর্বল কোম্পানি দীর্ঘদিন ধরে রাখলে লাভ হয় না। ধৈর্যের সাথে ভালো বৈচিত্র্যকরণ থাকা জরুরি।\n\nবাজারের সঠিক সময় খোঁজার চেয়ে বাজারে দীর্ঘ সময় টিকে থাকাই প্রকৃত সম্পদ তৈরির গোপন চাবিকাঠি।`,
        keyTakeaway: 'বাজারের সঠিক সময় অনুমান করার চেয়ে বাজারে দীর্ঘ সময় থাকা বেশি গুরুত্বপূর্ণ; ধৈর্য চক্রবৃদ্ধির মাধ্যমে সম্পদ গড়ে তোলে।'
      },
    }
  },
  // ── 07. WHAT IS COMPOUNDING? ──
  {
    id: 'what-is-compounding',
    number: 7,
    title: 'What is Compounding?',
    category: 'Investing Strategy',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/compounding.mp4',
    thumbnailUrl: '/academy/compounding.webp',
    description: 'The mathematical force of exponential growth: initial principal plus accumulated returns creating momentum over time.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is Compounding?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `Why is compounding often described as the most powerful mathematical force in personal wealth creation?\n\nSimple interest earns returns only on your original principal. Compounding, however, means earning returns on your original principal PLUS all the accumulated returns from previous years.

Think of a snowball rolling down a long snowy mountain. At first, it gathers only a tiny amount of snow. But as it rolls further, its enlarged surface area picks up massive amounts of new snow with every single revolution. That mathematical momentum is compounding.\n\nLet us look at a hypothetical example. Suppose you invest ₹1,00,000 at a hypothetical annual return of 10%.
In Year 1, you earn ₹10,000, bringing your total to ₹1,10,000.
In Year 2, you earn 10% not on your initial ₹1 Lakh, but on ₹1,10,000—giving you ₹11,000 in gains.
By Year 10, without adding any new money, your ₹1 Lakh grows to approximately ₹2.59 Lakhs.
By Year 20, it reaches ₹6.72 Lakhs.
And by Year 30, it surges past ₹17.44 Lakhs! Over 90% of your ultimate wealth was created purely by returns generating their own returns in the final decade.\n\nMany beginners assume that to benefit from compounding, you must start with a huge amount of capital. That is completely false. The most critical variable in the compounding formula is TIME. An investor who starts with ₹2,000 a month in their twenties often accumulates more wealth than someone starting with ₹10,000 a month in their forties.\n\nRemember that compounding requires patience and uninterrupted consistency. Frequent withdrawals or panic-selling during market dips breaks the compounding chain.\n\nCompounding is financial momentum where returns generate returns; starting early and giving time to your investments is the true secret of wealth.`,
    learningPoints: [
      "Compounding means earning returns on principal PLUS accumulated past returns.",
      "The Snowball Effect: growth accelerates exponentially in later years.",
      "Time is the most critical exponent in the wealth creation equation.",
      "Starting early with small amounts outperforms starting late with large sums."
],
    keyTakeaway: 'Compounding is mathematical momentum: returns earning returns over uninterrupted time.',
    quiz: [
      {
            "id": "q7-1",
            "question": "What is the core mathematical principle of compounding?",
            "options": [
                  "Earning returns only on your original deposited principal.",
                  "Earning returns on your principal PLUS all previously accumulated returns over time.",
                  "Doubling your money every 30 days guaranteed.",
                  "Borrowing money at zero interest from banks."
            ],
            "correctAnswer": 1,
            "explanation": "Compounding generates returns on reinvested earnings, creating exponential growth momentum over long horizons."
      },
      {
            "id": "q7-2",
            "question": "Which variable has the greatest exponential impact in the compounding formula?",
            "options": [
                  "The stock broker used.",
                  "Time (the number of years invested).",
                  "The color of the trading app interface.",
                  "The city where the investor resides."
            ],
            "correctAnswer": 1,
            "explanation": "Time is the exponent in compound interest. Starting early allows even modest contributions to outgrow late, large lump sums."
      }
],
    relatedLessons: ["why-long-term-investing", "what-is-sip", "how-to-start-investing"],
    vestiqPrompt: 'Show me a numerical example of compounding with ₹5,000 monthly.',
    languages: {
      en: {
        videoUrl: '/academy/en/compounding.mp4',
        thumbnailUrl: '/academy/en/compounding.webp',
        captionUrl: '/academy/en/compounding.vtt',
        transcript: `Why is compounding often described as the most powerful mathematical force in personal wealth creation?\n\nSimple interest earns returns only on your original principal. Compounding, however, means earning returns on your original principal PLUS all the accumulated returns from previous years.

Think of a snowball rolling down a long snowy mountain. At first, it gathers only a tiny amount of snow. But as it rolls further, its enlarged surface area picks up massive amounts of new snow with every single revolution. That mathematical momentum is compounding.\n\nLet us look at a hypothetical example. Suppose you invest ₹1,00,000 at a hypothetical annual return of 10%.
In Year 1, you earn ₹10,000, bringing your total to ₹1,10,000.
In Year 2, you earn 10% not on your initial ₹1 Lakh, but on ₹1,10,000—giving you ₹11,000 in gains.
By Year 10, without adding any new money, your ₹1 Lakh grows to approximately ₹2.59 Lakhs.
By Year 20, it reaches ₹6.72 Lakhs.
And by Year 30, it surges past ₹17.44 Lakhs! Over 90% of your ultimate wealth was created purely by returns generating their own returns in the final decade.\n\nMany beginners assume that to benefit from compounding, you must start with a huge amount of capital. That is completely false. The most critical variable in the compounding formula is TIME. An investor who starts with ₹2,000 a month in their twenties often accumulates more wealth than someone starting with ₹10,000 a month in their forties.\n\nRemember that compounding requires patience and uninterrupted consistency. Frequent withdrawals or panic-selling during market dips breaks the compounding chain.\n\nCompounding is financial momentum where returns generate returns; starting early and giving time to your investments is the true secret of wealth.`,
        keyTakeaway: 'Compounding is mathematical momentum: returns earning returns over uninterrupted time.'
      },
      hi: {
        videoUrl: '/academy/hi/compounding.mp4',
        thumbnailUrl: '/academy/hi/compounding.webp',
        captionUrl: '/academy/hi/compounding.vtt',
        transcript: `कंपाउंडिंग को व्यक्तिगत धन सृजन में दुनिया की सबसे शक्तिशाली गणितीय शक्ति क्यों कहा जाता है? अल्बर्ट आइंस्टीन ने कथित तौर पर इसे दुनिया का आठवां अजूबा कहा था।\n\nसाधारण ब्याज में आपको केवल अपने मूलधन पर ही रिटर्न मिलता है। लेकिन कंपाउंडिंग यानी चक्रवृद्धि का अर्थ है अपने मूलधन के साथ-साथ पिछले वर्षों में अर्जित किए गए सभी रिटर्न और ब्याज पर भी नया रिटर्न कमाना।

इसे एक बर्फीले पहाड़ से लुढ़कते हुए स्नोबॉल की तरह समझें। शुरुआत में जब यह लुढ़कना शुरू करता है, तो यह केवल थोड़ी सी बर्फ इकट्ठा करता है। लेकिन जैसे-जैसे यह आगे लुढ़कता है, इसका बड़ा आकार हर नए चक्कर में भारी मात्रा में बर्फ जोड़ता जाता है। यही गणितीय रफ्तार और गति कंपाउंडिंग कहलाती है।\n\nआइए इसे एक विस्तृत और व्यावहारिक उदाहरण से समझें। मान लीजिए आप ₹1,00,000 का निवेश करते हैं और उस पर 10% का अनुमानित वार्षिक रिटर्न मिलता है।
पहले वर्ष में आपको ₹10,000 का लाभ मिलता है, जिससे कुल राशि ₹1,10,000 हो जाती है।
दूसरे वर्ष में आपको ₹1,00,000 पर नहीं, बल्कि ₹1,10,000 पर 10% मिलता है—यानी ₹11,000 का लाभ, और कुल राशि ₹1,21,000 हो जाती है।
10 वर्षों में, बिना कोई नया पैसा जोड़े, आपका ₹1 लाख बढ़कर लगभग ₹2.59 लाख हो जाता है।
20 वर्षों में यह ₹6.72 लाख तक पहुंच जाता है।
और 30 वर्षों में यह बढ़कर ₹17.44 लाख को पार कर जाता है! आपकी अंतिम ₹17.44 लाख की कुल संपत्ति में से ₹16.44 लाख विशुद्ध रूप से केवल मुनाफे पर मुनाफा बनने की वजह से बने। आपकी संपत्ति का 90% से अधिक हिस्सा केवल आखिरी दशक में कंपाउंडिंग के कारण बना।\n\nकई नए निवेशक सोचते हैं कि कंपाउंडिंग का लाभ उठाने के लिए भारी पूंजी की आवश्यकता होती है। यह बिल्कुल गलत है। कंपाउंडिंग के सूत्र में सबसे महत्वपूर्ण तत्व 'समय' है। जो व्यक्ति अपनी 20 की उम्र में केवल ₹2,000 प्रति माह से निवेश शुरू करता है, वह अक्सर 40 की उम्र में ₹10,000 प्रति माह शुरू करने वाले व्यक्ति से कहीं अधिक संपत्ति संचित कर लेता है।\n\nयाद रखें कि कंपाउंडिंग के लिए निरंतरता और अटूट धैर्य की आवश्यकता होती है। बाजार में गिरावट के समय घबराकर पैसे निकालना या बार-बार निवेश बदलना कंपाउंडिंग की कड़ी को तोड़ देता है।\n\nकंपाउंडिंग एक वित्तीय रफ्तार है जहाँ लाभ से नया लाभ उत्पन्न होता है; जल्दी शुरुआत करना और अपने निवेश को लंबा समय देना ही धन सृजन का असली रहस्य है।`,
        keyTakeaway: 'कंपाउंडिंग गणितीय गति है: बिना रुकावट के समय के साथ रिटर्न पर रिटर्न कमाना।'
      },
      kn: {
        videoUrl: '/academy/kn/compounding.mp4',
        thumbnailUrl: '/academy/kn/compounding.webp',
        captionUrl: '/academy/kn/compounding.vtt',
        transcript: `ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಜಗತ್ತಿನಲ್ಲಿ ಕಾಂಪೌಂಡಿಂಗ್ ಅನ್ನು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಗಣಿತ ಶಕ್ತಿ ಎಂದು ಏಕೆ ಕರೆಯುತ್ತಾರೆ?\n\nಸರಳ ಬಡ್ಡಿಯಲ್ಲಿ ನೀವು ಕೇವಲ ಅಸಲಿನ ಮೇಲೆ ಮಾತ್ರ ಆದಾಯ ಗಳಿಸುತ್ತೀರಿ. ಆದರೆ ಕಾಂಪೌಂಡಿಂಗ್ ಅಥವಾ ಚಕ್ರಬಡ್ಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಮೂಲ ಅಸಲು ಮತ್ತು ಹಿಂದಿನ ವರ್ಷಗಳಲ್ಲಿ ಗಳಿಸಿದ ಎಲ್ಲಾ ಲಾಭದ ಮೇಲೆಯೂ ಹೊಸ ಲಾಭವನ್ನು ಗಳಿಸುತ್ತೀರಿ.

ಹಿಮಪರ್ವತದಿಂದ ಉರುಳುವ ಹಿಮದ ಚೆಂಡನ್ನು ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ. ಆರಂಭದಲ್ಲಿ ಅದು ಚಿಕ್ಕದಾಗಿರುತ್ತದೆ, ಆದರೆ ಮುಂದೆ ಸಾಗಿದಂತೆ ಪ್ರತಿಯೊಂದು ಸುತ್ತಿನಲ್ಲೂ ಬೃಹತ್ ಪ್ರಮಾಣದ ಹಿಮವನ್ನು ಸೇರಿಸಿಕೊಳ್ಳುತ್ತದೆ. ಇದೇ ಕಾಂಪೌಂಡಿಂಗ್‌ನ ವೇಗ.\n\nಉದಾಹರಣೆಗೆ, ನೀವು ₹1,00,000 ಹಣವನ್ನು ವಾರ್ಷಿಕ 10% ಲಾಭದ ದರದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುತ್ತೀರಿ ಎಂದು ಭಾವಿಸೋಣ.
ವರ್ಷ 1 ರಲ್ಲಿ ನೀವು ₹10,000 ಗಳಿಸುತ್ತೀರಿ, ಒಟ್ಟು ₹1,10,000 ಆಗುತ್ತದೆ.
ವರ್ಷ 2 ರಲ್ಲಿ ₹1,10,000 ಮೇಲೆ 10% ಲಾಭ ಬರುತ್ತದೆ—ಅಂದರೆ ₹11,000 ಗಳಿಕೆ.
10 ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ₹1 ಲಕ್ಷವು ಸುಮಾರು ₹2.59 ಲಕ್ಷ ಆಗುತ್ತದೆ.
20 ವರ್ಷಗಳಲ್ಲಿ ₹6.72 ಲಕ್ಷ ತಲುಪುತ್ತದೆ.
ಮತ್ತು 30 ವರ್ಷಗಳಲ್ಲಿ ₹17.44 ಲಕ್ಷ ದಾಟುತ್ತದೆ! ನಿಮ್ಮ ಅಂತಿಮ ಸಂಪತ್ತಿನ 90% ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಭಾಗ ಕೇವಲ ಕೊನೆಯ ದಶಕದಲ್ಲಿ ಕಾಂಪೌಂಡಿಂಗ್ ಮೂಲಕ ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ.\n\nಕಾಂಪೌಂಡಿಂಗ್ ಲಾಭ ಪಡೆಯಲು ದೊಡ್ಡ ಮೊತ್ತ ಬೇಕು ಎಂದು ಭಾವಿಸುವುದು ತಪ್ಪು. ಕಾಂಪೌಂಡಿಂಗ್‌ನಲ್ಲಿ ಅತ್ಯಂತ ಮುಖ್ಯವಾದದ್ದು 'ಸಮಯ'. 20ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ₹2,000 ಆರಂಭಿಸುವವರು 40ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ₹10,000 ಹೂಡುವವರಿಗಿಂತ ಹೆಚ್ಚು ಸಂಪತ್ತು ಗಳಿಸಬಹುದು.\n\nಕಾಂಪೌಂಡಿಂಗ್‌ಗೆ ಸತತ ತಾಳ್ಮೆ ಅಗತ್ಯ. ಮಾರುಕಟ್ಟೆ ಇಳಿದಾಗ ಭಯಪಟ್ಟು ಹಣ ಹಿಂಪಡೆಯುವುದು ಕಾಂಪೌಂಡಿಂಗ್ ಸರಪಳಿಯನ್ನು ಮುರಿಯುತ್ತದೆ.\n\nಕಾಂಪೌಂಡಿಂಗ್ ಲಾಭದ ಮೇಲೆ ಹೊಸ ಲಾಭವನ್ನು ನೀಡುತ್ತದೆ; ಬೇಗನೆ ಹೂಡಿಕೆ ಆರಂಭಿಸಿ ಸಮಯ ನೀಡುವುದೇ ಸಂಪತ್ತಿನ ರಹಸ್ಯ.`,
        keyTakeaway: 'ಕಾಂಪೌಂಡಿಂಗ್ ಎಂದರೆ ಗಳಿಕೆಯ ಮೇಲೆ ಮತ್ತಷ್ಟು ಗಳಿಕೆಯನ್ನು ಸತತವಾಗಿ ಪಡೆಯುವ ಅದ್ಭುತ ಶಕ್ತಿ.'
      },
      te: {
        videoUrl: '/academy/te/compounding.mp4',
        thumbnailUrl: '/academy/te/compounding.webp',
        captionUrl: '/academy/te/compounding.vtt',
        transcript: `వ్యక్తిగత సంపద సృష్టిలో కాంపౌండింగ్‌ను అత్యంత శక్తివంతమైన గణిత శక్తి అని ఎందుకు అంటారు?\n\nసాధారణ వడ్డీలో మీరు అసలుపై మాత్రమే లాభం పొందుతారు. కానీ కాంపౌండింగ్ లేదా చక్రవడ్డీలో మీ అసలుతో పాటు గత సంవత్సరాల్లో వచ్చిన మొత్తం లాభాలపై కూడా కొత్త లాభాలను పొందుతారు.

మంచుకొండపై నుంచి దొర్లే మంచు బంతిని ఊహించుకోండి. ప్రారంభంలో అది చిన్నదిగా ఉంటుంది, కానీ ముందుకు సాగే కొద్దీ ప్రతి చుట్టుకు భారీ మొత్తంలో మంచును జోడించుకుంటుంది. ఇదే కాంపౌండింగ్ వేగం.\n\nఉదాహరణకు, మీరు ₹1,00,000 ని వార్షిక 10% రాబడితో పెట్టుబడి పెట్టారనుకుందాం.
1వ సంవత్సరంలో ₹10,000 లాభం వచ్చి మొత్తం ₹1,10,000 అవుతుంది.
2వ సంవత్సరంలో ₹1,10,000 పై 10% వస్తుంది—అంటే ₹11,000 లాభం.
10 సంవత్సరాలలో మీ ₹1 లక్ష దాదాపు ₹2.59 లక్షలు అవుతుంది.
20 సంవత్సరాలలో ₹6.72 లక్షలకు చేరుకుంటుంది.
మరియు 30 సంవత్సరాలలో ₹17.44 లక్షలు దాటుతుంది! మీ మొత్తం సంపదలో 90% పైగా కేవలం చివరి దశాబ్దంలో కాంపౌండింగ్ ద్వారానే సమకూరుతుంది.\n\nకాంపౌండింగ్ ప్రయోజనం పొందడానికి భారీ మొత్తం అవసరమని అనుకోవడం తప్పు. కాంపౌండింగ్‌లో అత్యంత ముఖ్యమైనది 'సమయం'. 20 ఏళ్ల వయసులో నెలకు ₹2,000 ప్రారంభించేవారు 40 ఏళ్లలో నెలకు ₹10,000 పెట్టేవారికంటే ఎక్కువ సంపదను సమకూర్చుకోగలరు.\n\nకాంపౌండింగ్‌కు స్థిరమైన ఓర్పు అవసరం. మార్కెట్ తగ్గినప్పుడు భయపడి డబ్బు ఉపసంహరించుకోవడం కాంపౌండింగ్ గొలుసును తెంచుతుంది.\n\nకాంపౌండింగ్ లాభాలపై కొత్త లాభాలను అందిస్తుంది; వీలైనంత త్వరగా ప్రారంభించి ఎక్కువ సమయం ఇవ్వడమే సంపద రహస్యం.`,
        keyTakeaway: 'కాంపౌండింగ్ అనేది లాభాలపై తిరిగి లాభాలను నిరంతరం ఆర్జించే గణిత అద్భుతం.'
      },
      ta: {
        videoUrl: '/academy/ta/compounding.mp4',
        thumbnailUrl: '/academy/ta/compounding.webp',
        captionUrl: '/academy/ta/compounding.vtt',
        transcript: `தனிநபர் நிதி உலகில் கூட்டு வட்டி ஏன் மிகவும் சக்திவாய்ந்த கணித ஆற்றலாகக் கருதப்படுகிறது?\n\nதனி வட்டியில் உங்கள் அசல் தொகைக்கு மட்டுமே வருமானம் கிடைக்கும். ஆனால் கூட்டு வட்டியில் உங்கள் அசல் தொகையுடன் சேர்த்து முந்தைய ஆண்டுகளில் ஈட்டிய அனைத்து லாபங்களுக்கும் புதிய வருமானம் கிடைக்கும்.

பனி மலையிலிருந்து உருண்டு வரும் பனிப்பந்தைக் கற்பனை செய்து பாருங்கள். ஆரம்பத்தில் அது சிறிதாக இருக்கும், ஆனால் முன்னோக்கிச் செல்லும்போது ஒவ்வொரு சுழற்சியிலும் மிகப்பெரிய அளவில் பனியைச் சேர்த்துக் கொள்ளும். இதுவே கூட்டு வட்டியின் வேகம்.\n\nஉதாரணமாக, நீங்கள் ₹1,00,000-ஐ ஆண்டுக்கு 10% லாபத்தில் முதலீடு செய்கிறீர்கள் என்று வைத்துக்கொள்வோம்.
1-ம் ஆண்டில் ₹10,000 லாபம் கிடைத்து மொத்தம் ₹1,10,000 ஆகும்.
2-ம் ஆண்டில் ₹1,10,000 மீது 10% கிடைக்கும்—அதாவது ₹11,000 லாபம்.
10 ஆண்டுகளில் உங்கள் ₹1 லட்சம் சுமார் ₹2.59 லட்சமாக வளரும்.
20 ஆண்டுகளில் ₹6.72 லட்சத்தை எட்டும்.
30 ஆண்டுகளில் ₹17.44 லட்சத்தைத் தாண்டும்! உங்கள் இறுதிச் செல்வத்தில் 90%-க்கும் அதிகமான பகுதி கடைசி தசாப்தத்தில் கூட்டு வட்டியால் மட்டுமே உருவாகிறது.\n\nகூட்டு வட்டியின் பலனைப் பெற பெரிய தொகை தேவை என்று நினைப்பது தவறு. கூட்டு வட்டியில் மிக முக்கியமானது 'காலம்'. 20 வயதில் மாதம் ₹2,000 தொடங்குபவர், 40 வயதில் ₹10,000 தொடங்குபவரை விட அதிக செல்வத்தைச் சேர்க்க முடியும்.\n\nகூட்டு வட்டிக்குத் தொடர்ச்சியான பொறுமை தேவை. சந்தை குறையும் போது பயந்து பணத்தை எடுப்பது கூட்டு வட்டியின் சங்கிலியை உடைத்துவிடும்.\n\nகூட்டு வட்டி லாபத்தின் மீது புதிய லாபத்தை உருவாக்குகிறது; விரைவாகத் தொடங்கி அதிக காலம் கொடுப்பதே செல்வத்தின் ரகசியம்.`,
        keyTakeaway: 'கூட்டு வட்டி என்பது வருமானத்தின் மீதும் தொடர்ந்து வருமானம் ஈட்டும் அற்புத கணித ஆற்றல்.'
      },
      ml: {
        videoUrl: '/academy/ml/compounding.mp4',
        thumbnailUrl: '/academy/ml/compounding.webp',
        captionUrl: '/academy/ml/compounding.vtt',
        transcript: `സാമ്പത്തിക ലോകത്ത് കോമ്പൗണ്ടിംഗിനെ ഏറ്റവും ശക്തമായ ഗണിത ശക്തി എന്ന് വിളിക്കുന്നത് എന്തുകൊണ്ടാണ്?\n\nസാധാരണ പലിശയിൽ നിങ്ങളുടെ മുതൽ തുകയ്ക്ക് മാത്രമേ വരുമാനം ലഭിക്കൂ. എന്നാൽ കോമ്പൗണ്ടിംഗിൽ നിങ്ങളുടെ മുതലിനും മുൻ വർഷങ്ങളിൽ ലഭിച്ച ലാഭത്തിനും ചേർത്ത് പുതിയ ലാഭം ലഭിക്കുന്നു.

മഞ്ഞുമലയിൽ നിന്ന് ഉരുണ്ടുവരുന്ന മഞ്ഞുപന്ത് സങ്കൽപ്പിക്കുക. തുടക്കത്തിൽ ചെറുതാണെങ്കിലും മുന്നോട്ട് ഉരുളുന്തോറും ഓരോ കറക്കത്തിലും വൻതോതിൽ മഞ്ഞ് ചേർത്ത് വലുതാകുന്നു. ഇതാണ് കോമ്പൗണ്ടിംഗിന്റെ വേഗത.\n\nഉദാഹരണത്തിന്, നിങ്ങൾ ₹1,00,000 തുക വാർഷിക 10% ലാഭത്തിൽ നിക്ഷേപിക്കുന്നു എന്ന് കരുതുക.
1-ാം വർഷം ₹10,000 ലാഭം ലഭിച്ച് ആകെ ₹1,10,000 ആകുന്നു.
2-ാം വർഷം ₹1,10,000-ന്മേൽ 10% ലഭിക്കുന്നു—അതായത് ₹11,000 ലാഭം.
10 വർഷം കൊണ്ട് നിങ്ങളുടെ ₹1 ലക്ഷം ഏകദേശം ₹2.59 ലക്ഷം ആകും.
20 വർഷത്തിൽ ₹6.72 ലക്ഷം എത്തും.
30 വർഷത്തിൽ ₹17.44 ലക്ഷം കവിയും! നിങ്ങളുടെ ആകെ സമ്പത്തിന്റെ 90 ശതമാനത്തിലധികവും അവസാന ദശകത്തിലെ കോമ്പൗണ്ടിംഗ് മൂലമാണ് ഉണ്ടാകുന്നത്.\n\nകോമ്പൗണ്ടിംഗ് ഫലം ലഭിക്കാൻ വലിയ തുക വേണം എന്നത് തെറ്റായ ധാരണയാണ്. കോമ്പൗണ്ടിംഗിൽ ഏറ്റവും പ്രധാനം 'സമയം' ആണ്. 20-ാം വയസ്സിൽ ₹2,000 തുടങ്ങുന്നയാൾക്ക് 40-ാം വയസ്സിൽ ₹10,000 തുടങ്ങുന്നയാളേക്കാൾ കൂടുതൽ സമ്പത്ത് ഉണ്ടാക്കാൻ കഴിയും.\n\nകോമ്പൗണ്ടിംഗിന് ക്ഷമ ആവശ്യമാണ്. വിപണി ഇടിയുമ്പോൾ ഭയന്ന് പണം പിൻവലിക്കുന്നത് കോമ്പൗണ്ടിംഗ് ശൃംഖലയെ തകർക്കും.\n\nകോമ്പൗണ്ടിംഗ് ലാഭത്തിന്മേൽ പുതിയ ലാഭം നൽകുന്നു; നേരത്തെ തുടങ്ങി കൂടുതൽ സമയം നൽകുകയാണ് സമ്പത്തിന്റെ രഹസ്യം.`,
        keyTakeaway: 'കോമ്പൗണ്ടിംഗ് എന്നാൽ ലാഭത്തിന്മേൽ വീണ്ടും ലാഭം തുടർച്ചയായി നേടുന്ന അത്ഭുതകരമായ ഗണിത ശക്തിയാണ്.'
      },
      mr: {
        videoUrl: '/academy/mr/compounding.mp4',
        thumbnailUrl: '/academy/mr/compounding.webp',
        captionUrl: '/academy/mr/compounding.vtt',
        transcript: `व्यक्तिगत संपत्ती निर्मितीमध्ये चक्रवाढ म्हणजेच कंपाउंडिंगला जगातील सर्वात शक्तिशाली गणिती शक्ती का म्हटले जाते?\n\nसरळ व्याजात तुम्हाला केवळ मुद्दलावरच परतावा मिळतो. पण कंपाउंडिंगमध्ये तुमच्या मुद्दलासोबतच मागील वर्षांत मिळालेल्या सर्व नफ्यावरही नवीन परतावा मिळतो.

बर्फाच्या डोंगरावरून गडगडणाऱ्या बर्फाच्या गोळ्याची कल्पना करा. सुरुवातीला तो लहान असतो, पण पुढे सरकताना प्रत्येक फेऱ्यात प्रचंड बर्फ गोळा करतो. हीच कंपाउंडिंगची गती आहे.\n\nउदाहरणासाठी, समजा तुम्ही ₹1,00,000 ची गुंतवणूक 10% वार्षिक परताव्याने करता.
पहिल्या वर्षी ₹10,000 नफा मिळून एकूण ₹1,10,000 होतात.
दुसऱ्या वर्षी ₹1,10,000 वर 10% मिळतात—म्हणजेच ₹11,000 चा फायदा.
10 वर्षांत तुमचे ₹1 लाख सुमारे ₹2.59 लाख होतात.
20 वर्षांत ते ₹6.72 लाखांवर पोहोचतात.
आणि 30 वर्षांत ते ₹17.44 लाखांच्या पुढे जातात! तुमच्या अंतिम संपत्तीतील 90% हून अधिक भाग केवळ शेवटच्या दशकातील कंपाउंडिंगमुळे तयार होतो.\n\nकंपाउंडिंगचा फायदा घेण्यासाठी मोठी रक्कम लागते हा गैरसमज आहे. कंपाउंडिंगमध्ये सर्वात महत्त्वाचा घटक 'वेळ' आहे. वयाच्या 20 व्या वर्षी दरमहा ₹2,000 सुरू करणारा व्यक्ती 40 व्या वर्षी ₹10,000 सुरू करणाऱ्यापेक्षा अधिक संपत्ती गोळा करू शकतो.\n\nकंपाउंडिंगसाठी सातत्य आणि संयम आवश्यक आहे. बाजार घसरल्यावर घाबरून पैसे काढल्यास कंपाउंडिंगची साखळी तुटते.\n\nकंपाउंडिंग नफ्यावर नवीन नफा देते; लवकरात लवकर सुरुवात करून वेळ देणे हेच संपत्तीचे खरे रहस्य आहे.`,
        keyTakeaway: 'कंपाउंडिंग ही परताव्यावर सातत्याने नवीन परतावा मिळवण्याची शक्तिशाली गणिती ताकद आहे.'
      },
      bn: {
        videoUrl: '/academy/bn/compounding.mp4',
        thumbnailUrl: '/academy/bn/compounding.webp',
        captionUrl: '/academy/bn/compounding.vtt',
        transcript: `ব্যক্তিগত সম্পদ তৈরিতে কম্পাউন্ডিং অর্থাৎ চক্রবৃদ্ধি সুদকে বিশ্বের সবচেয়ে শক্তিশালী গাণিতিক শক্তি কেন বলা হয়?\n\nসরল সুদে আপনি কেবল মূলধনের ওপর রিটার্ন পান। কিন্তু কম্পাউন্ডিংয়ে আপনি আপনার মূলধনের সাথে সাথে বিগত বছরগুলোতে অর্জিত সমস্ত লাভের ওপরও নতুন লাভ পান।

একটি বরফের পাহাড় থেকে গড়িয়ে পড়া স্নোবলের কথা ভাবুন। শুরুতে এটি ছোট থাকে, কিন্তু সামনে এগোনোর সাথে সাথে প্রতিটি চক্করে বিপুল পরিমাণ বরফ যোগ করে বিশাল আকার ধারণ করে। এটাই কম্পাউন্ডিংয়ের গতি।\n\nধরুন আপনি বার্ষিক ১০% রিটার্নে ₹১,০০,০০০ টাকা বিনিয়োগ করলেন।
১ম বছরে ₹১০,০০০ লাভ পেয়ে মোট হয় ₹১,১০,০০০ টাকা।
২য় বছরে ₹১,১০,০০০ টাকার ওপর ১০% লাভ পাবেন—অর্থাৎ ₹১১,০০০ টাকা।
১০ বছরে আপনার ₹১ লাখ বেড়ে হবে প্রায় ₹২.৫৯ লাখ।
২০ বছরে এটি ₹৬.৭২ লাখে পৌঁছাবে।
এবং ৩০ বছরে এটি ₹১৭.৪৪ লাখ অতিক্রম করবে! আপনার মোট সম্পদের ৯০% এর বেশি অংশ কেবল শেষ দশকে কম্পাউন্ডিংয়ের মাধ্যমেই তৈরি হয়।\n\nকম্পাউন্ডিংয়ের সুবিধা পেতে অনেক বড় অংকের অর্থ লাগে বলে মনে করা ভুল। কম্পাউন্ডিংয়ে সবচেয়ে গুরুত্বপূর্ণ উপাদান হলো 'সময়'। ২০ বছর বয়সে মাসে ₹২,০০০ শুরু করা ব্যক্তি ৪০ বছর বয়সে ₹১০,০০০ শুরু করা ব্যক্তির চেয়ে বেশি সম্পদ গড়তে পারেন।\n\nকম্পাউন্ডিংয়ের জন্য অবিচল ধৈর্য প্রয়োজন। বাজার পতনের সময় ভয়ে টাকা তুলে নেওয়া কম্পাউন্ডিংয়ের শৃঙ্খল ভেঙে দেয়।\n\nকম্পাউন্ডিং লাভের ওপর নতুন লাভ এনে দেয়; দ্রুত বিনিয়োগ শুরু করে বেশি সময় দেওয়াই সম্পদের আসল রহস্য।`,
        keyTakeaway: 'কম্পাউন্ডিং হলো অর্জিত লাভের ওপর পুনরায় অবিচ্ছিন্নভাবে নতুন লাভ তৈরি করার শক্তিশালী গাণিতিক গতিবেগ।'
      },
    }
  },
  // ── 08. WHAT IS SIP? ──
  {
    id: 'what-is-sip',
    number: 8,
    title: 'What is SIP?',
    category: 'India Investing',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/sip.mp4',
    thumbnailUrl: '/academy/sip.webp',
    description: 'Systematic Investment Plans in India: automating monthly discipline and leveraging Rupee Cost Averaging across market cycles.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is SIP?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `How can a salaried professional or student build a multi-lakh portfolio without saving up a massive lump sum or stressing over market timing?\n\nIn India, the most popular and disciplined way to invest is through a SIP—which stands for Systematic Investment Plan. A SIP is NOT a separate investment product or asset class; it is an automated METHOD of investing regularly into mutual funds.

Instead of waiting to accumulate ₹1 Lakh and trying to guess the 'perfect day' to invest, a SIP automatically debits a fixed chosen amount—such as ₹1,000, ₹5,000, or ₹10,000—from your bank account at scheduled intervals, usually once a month.\n\nThe core mathematical superpower of a SIP is Rupee Cost Averaging.
Let us see how it works across market cycles:
When the stock market drops and fund NAV falls from ₹100 to ₹80, your fixed ₹5,000 monthly SIP automatically buys MORE units—62.5 units instead of 50.
When the market rises and NAV climbs to ₹125, your ₹5,000 buys FEWER units—40 units.
Over time, this automatically lowers your average purchase price per unit without you ever having to watch market charts. You naturally buy more when assets are discounted and buy less when they are expensive.\n\nA common mistake is believing that an SIP guarantees positive returns or removes all risk. An SIP manages timing risk and builds habit, but the underlying fund value will still fluctuate with market trends.\n\nThe biggest mistake investors make is stopping their SIPs when markets fall. Stopping during downturns destroys the rupee cost averaging advantage right when units are cheapest.\n\nAn SIP turns regular monthly savings into automated investing, leveraging rupee cost averaging to build long-term wealth with discipline.`,
    learningPoints: [
      "A SIP is an automated method of regular investing, not a separate asset class.",
      "Rupee Cost Averaging: automatically buys more units during market dips and fewer when high.",
      "Disciplined automation aligns investing with monthly income cycles.",
      "Why stopping SIPs during market corrections damages long-term wealth compounding."
],
    keyTakeaway: 'A SIP turns regular savings into automated investing through disciplined Rupee Cost Averaging.',
    quiz: [
      {
            "id": "q8-1",
            "question": "What is a Systematic Investment Plan (SIP)?",
            "options": [
                  "A special high-risk stock that only banks can buy.",
                  "An automated method of investing a fixed amount regularly into mutual funds.",
                  "A government insurance policy for unemployment.",
                  "A lottery system for IPO allocations."
            ],
            "correctAnswer": 1,
            "explanation": "A SIP is an automated investing process that debits a chosen amount monthly to buy mutual fund units consistently."
      },
      {
            "id": "q8-2",
            "question": "How does Rupee Cost Averaging benefit an SIP investor during a market downturn?",
            "options": [
                  "It pauses all investments until the market recovers.",
                  "Your fixed monthly investment automatically buys MORE units at lower NAV prices.",
                  "It converts all equities into cash automatically.",
                  "It guarantees an instant refund of all past losses."
            ],
            "correctAnswer": 1,
            "explanation": "When NAV falls during corrections, a fixed SIP instalment buys more units, lowering your average cost per unit across cycles."
      }
],
    relatedLessons: ["what-is-swp", "what-is-a-mutual-fund", "how-to-start-investing"],
    vestiqPrompt: 'Explain Rupee Cost Averaging in SIP when markets fall and rise.',
    languages: {
      en: {
        videoUrl: '/academy/en/sip.mp4',
        thumbnailUrl: '/academy/en/sip.webp',
        captionUrl: '/academy/en/sip.vtt',
        transcript: `How can a salaried professional or student build a multi-lakh portfolio without saving up a massive lump sum or stressing over market timing?\n\nIn India, the most popular and disciplined way to invest is through a SIP—which stands for Systematic Investment Plan. A SIP is NOT a separate investment product or asset class; it is an automated METHOD of investing regularly into mutual funds.

Instead of waiting to accumulate ₹1 Lakh and trying to guess the 'perfect day' to invest, a SIP automatically debits a fixed chosen amount—such as ₹1,000, ₹5,000, or ₹10,000—from your bank account at scheduled intervals, usually once a month.\n\nThe core mathematical superpower of a SIP is Rupee Cost Averaging.
Let us see how it works across market cycles:
When the stock market drops and fund NAV falls from ₹100 to ₹80, your fixed ₹5,000 monthly SIP automatically buys MORE units—62.5 units instead of 50.
When the market rises and NAV climbs to ₹125, your ₹5,000 buys FEWER units—40 units.
Over time, this automatically lowers your average purchase price per unit without you ever having to watch market charts. You naturally buy more when assets are discounted and buy less when they are expensive.\n\nA common mistake is believing that an SIP guarantees positive returns or removes all risk. An SIP manages timing risk and builds habit, but the underlying fund value will still fluctuate with market trends.\n\nThe biggest mistake investors make is stopping their SIPs when markets fall. Stopping during downturns destroys the rupee cost averaging advantage right when units are cheapest.\n\nAn SIP turns regular monthly savings into automated investing, leveraging rupee cost averaging to build long-term wealth with discipline.`,
        keyTakeaway: 'A SIP turns regular savings into automated investing through disciplined Rupee Cost Averaging.'
      },
      hi: {
        videoUrl: '/academy/hi/sip.mp4',
        thumbnailUrl: '/academy/hi/sip.webp',
        captionUrl: '/academy/hi/sip.vtt',
        transcript: `एक मध्यमवर्गीय वेतनभोगी पेशेवर या छात्र बिना किसी भारी एकमुश्त राशि और बिना बाजार के दैनिक तनाव के लाखों रुपये का बड़ा पोर्टफोलियो कैसे बना सकता है?\n\nभारत में निवेश करने का सबसे लोकप्रिय, सुरक्षित और अनुशासित तरीका एसआईपी है—जिसका पूरा नाम सिस्टेमैटिक इन्वेस्टमेंट प्लान (Systematic Investment Plan) है। एसआईपी कोई अलग उत्पाद या नई परिसंपत्ति नहीं है; यह म्यूचुअल फंड में नियमित और व्यवस्थित रूप से निवेश करने का एक स्वचालित तरीका है।

₹1 लाख इकट्ठा होने और सही दिन का अनुमान लगाने की प्रतीक्षा करने के बजाय, एसआईपी हर महीने एक निश्चित तारीख पर आपके बैंक खाते से चुनी गई छोटी राशि—जैसे ₹1,000, ₹5,000 या ₹10,000—स्वतः म्यूचुअल फंड स्कीम में निवेश कर देता है।\n\nएसआईपी की मुख्य गणितीय ताकत 'रूपी कॉस्ट एवरेजिंग' यानी लागत का औसतीकरण है।
आइए देखें कि यह बाजार के अलग-अलग चक्रों में कैसे काम करता है:
जब शेयर बाजार में गिरावट आती है और फंड का एनएवी ₹100 से घटकर ₹80 हो जाता है, तो आपका वही ₹5,000 का मासिक एसआईपी स्वतः अधिक यूनिट्स खरीदता है—50 की जगह 62.5 यूनिट्स डिस्काउंट पर मिलती हैं।
जब बाजार में तेजी आती है और एनएवी बढ़कर ₹125 हो जाता है, तो आपका वही ₹5,000 कम यूनिट्स—यानी 40 यूनिट्स खरीदता है।
लंबे समय में, यह प्रक्रिया बिना स्क्रीन देखे आपकी प्रति यूनिट औसत खरीद लागत को काफी कम कर देती है। आप स्वाभाविक रूप से सस्ते बाजार में ज्यादा और महंगे बाजार में कम खरीदारी करते हैं।\n\nएक आम गलतफहमी यह है कि एसआईपी में कभी जोखिम नहीं होता या इसमें निश्चित रिटर्न की गारंटी होती है। एसआईपी मार्केट टाइमिंग के जोखिम को प्रबंधित करता है और अनुशासन बनाता है, लेकिन अंतर्निहित फंड का मूल्य बाजार के उतार-चढ़ाव के साथ स्वाभाविक रूप से बदलता है।\n\nनिवेशकों द्वारा की जाने वाली सबसे बड़ी गलती बाजार गिरने पर घबराकर अपनी एसआईपी रोक देना है। गिरावट के समय एसआईपी रोकने से रूपी कॉस्ट एवरेजिंग का सबसे बड़ा लाभ खत्म हो जाता है, ठीक उसी समय जब यूनिट्स सबसे सस्ती मिल रही होती हैं।\n\nएसआईपी आपकी मासिक बचत को स्वचालित, अनुशासित निवेश में बदलता है और रूपी कॉस्ट एवरेजिंग के जरिए दीर्घकालिक संपत्ति का निर्माण करता है।`,
        keyTakeaway: 'एसआईपी नियमित बचत को रूपी कॉस्ट एवरेजिंग के जरिए अनुशासित स्वचालित निवेश में बदल देता है।'
      },
      kn: {
        videoUrl: '/academy/kn/sip.mp4',
        thumbnailUrl: '/academy/kn/sip.webp',
        captionUrl: '/academy/kn/sip.vtt',
        transcript: `ಒಬ್ಬ ಸಂಬಳ ಪಡೆಯುವ ಉದ್ಯೋಗಿ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿ ದೊಡ್ಡ ಮೊತ್ತವಿಲ್ಲದೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯ ಚಿಂತೆಯಿಲ್ಲದೆ ಲಕ್ಷಾಂತರ ರೂಪಾಯಿಗಳ ಪೋರ್ಟ್‌ಫೋಲಿಯೊವನ್ನು ಹೇಗೆ ನಿರ್ಮಿಸಬಹುದು?\n\nಭಾರತದಲ್ಲಿ ಅತ್ಯಂತ ಜನಪ್ರಿಯ ಮತ್ತು ಶಿಸ್ತುಬದ್ಧ ಹೂಡಿಕೆ ವಿಧಾನವೇ ಎಸ್‌ಐಪಿ—ಅಂದರೆ ಸಿಸ್ಟಮ್ಯಾಟಿಕ್ ಇನ್ವೆಸ್ಟ್‌ಮೆಂಟ್ ಪ್ಲಾನ್ (Systematic Investment Plan). ಎಸ್‌ಐಪಿ ಪ್ರತ್ಯೇಕ ಉತ್ಪನ್ನವಲ್ಲ; ಇದು ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ನಿಯಮಿತವಾಗಿ ಹೂಡಿಕೆ ಮಾಡುವ ಒಂದು ಸ್ವಯಂಚಾಲಿತ ವಿಧಾನವಾಗಿದೆ.

ದೊಡ್ಡ ಮೊತ್ತ ಒಟ್ಟಾಗುವವರೆಗೆ ಕಾಯುವ ಬದಲು, ಪ್ರತಿ ತಿಂಗಳು ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ನಿಗದಿತ ಮೊತ್ತ—ಉದಾಹರಣೆಗೆ ₹1,000, ₹5,000 ಅಥವಾ ₹10,000—ನೇರವಾಗಿ ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗೆ ಜಮೆಯಾಗುತ್ತದೆ.\n\nಎಸ್‌ಐಪಿಯ ಪ್ರಮುಖ ಶಕ್ತಿ 'ರೂಪೀ ಕಾಸ್ಟ್ ಆವರೇಜಿಂಗ್' (Rupee Cost Averaging).
ಮಾರುಕಟ್ಟೆ ಇಳಿದಾಗ ಮತ್ತು ಎನ್‌ಎವಿ ₹100 ರಿಂದ ₹80 ಕ್ಕೆ ಕುಸಿದಾಗ, ನಿಮ್ಮ ₹5,000 ಎಸ್‌ಐಪಿ ಹೆಚ್ಚಿನ ಯೂನಿಟ್‌ಗಳನ್ನು—50 ರ ಬದಲಿಗೆ 62.5 ಯೂನಿಟ್‌ಗಳನ್ನು ಖರೀದಿಸುತ್ತದೆ.
ಮಾರುಕಟ್ಟೆ ಏರಿದಾಗ ಮತ್ತು ಎನ್‌ಎವಿ ₹125 ಆದಾಗ, ₹5,000 ಕಡಿಮೆ ಯೂನಿಟ್‌ಗಳನ್ನು (40 ಯೂನಿಟ್) ಖರೀದಿಸುತ್ತದೆ.
ಕಾಲಾನಂತರದಲ್ಲಿ ಇದು ನಿಮ್ಮ ಸರಾಸರಿ ಖರೀದಿ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ. ಬೆಲೆ ಕಡಿಮೆಯಿದ್ದಾಗ ಹೆಚ್ಚು ಮತ್ತು ದುಬಾರಿಯಿದ್ದಾಗ ಕಡಿಮೆ ಯೂನಿಟ್‌ಗಳು ಸಿಗುತ್ತವೆ.\n\nಎಸ್‌ಐಪಿಯಲ್ಲಿ ಅಪಾಯವೇ ಇರುವುದಿಲ್ಲ ಅಥವಾ ಖಚಿತ ಲಾಭ ಸಿಗುತ್ತದೆ ಎಂಬುದು ತಪ್ಪು. ಎಸ್‌ಐಪಿ ಶಿಸ್ತು ಬೆಳೆಸುತ್ತದೆ, ಆದರೆ ಮಾರುಕಟ್ಟೆಯ ಏರಿಳಿತಗಳು ಫಂಡ್ ಮೌಲ್ಯದ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುತ್ತವೆ.\n\nಮಾರುಕಟ್ಟೆ ಕುಸಿದಾಗ ಎಸ್‌ಐಪಿ ನಿಲ್ಲಿಸುವುದು ಹೂಡಿಕೆದಾರರು ಮಾಡುವ ಅತಿ ದೊಡ್ಡ ತಪ್ಪು. ಕುಸಿತದ ಸಮಯದಲ್ಲಿ ಎಸ್‌ಐಪಿ ಮುಂದುವರಿಸುವುದೇ ಗರಿಷ್ಠ ಲಾಭಕ್ಕೆ ದಾರಿ.\n\nಎಸ್‌ಐಪಿ ಮಾಸಿಕ ಉಳಿತಾಯವನ್ನು ಶಿಸ್ತುಬದ್ಧ ಹೂಡಿಕೆಯನ್ನಾಗಿ ಪರಿವರ್ತಿಸಿ ದೀರ್ಘಾವಧಿಯ ಸಂಪತ್ತನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.`,
        keyTakeaway: 'ಎಸ್‌ಐಪಿ ನಿಮ್ಮ ಮಾಸಿಕ ಉಳಿತಾಯವನ್ನು ರೂಪಾಯಿ ವೆಚ್ಚದ ಸರಾಸರಿಯ ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ಹೂಡಿಕೆಯನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.'
      },
      te: {
        videoUrl: '/academy/te/sip.mp4',
        thumbnailUrl: '/academy/te/sip.webp',
        captionUrl: '/academy/te/sip.vtt',
        transcript: `ఒక ఉద్యోగి లేదా విద్యార్థి పెద్ద మొత్తం లేకపోయినా మరియు మార్కెట్ ఒత్తిడి లేకుండా లక్షల రూపాయల పోర్ట్‌ఫోలియోను ఎలా నిర్మించవచ్చు?\n\nభారతదేశంలో అత్యంత ప్రజాదరణ పొందిన క్రమశిక్షణాయుతమైన పెట్టుబడి విధానమే ఎస్ఐపి—అంటే సిస్టమాటిక్ ఇన్వెస్ట్‌మెంట్ ప్లాన్ (Systematic Investment Plan). ఎస్ఐపి అనేది ప్రత్యేక ఉత్పత్తి కాదు; ఇది మ్యూచువల్ ఫండ్లలో క్రమం తప్పకుండా పెట్టుబడి పెట్టే ఆటోమేటెడ్ పద్ధతి.

పెద్ద మొత్తం చేరే వరకు వేచి ఉండకుండా, ప్రతి నెలా మీ బ్యాంక్ ఖాతా నుండి నిర్ణీత మొత్తం—ఉదాహరణకు ₹1,000, ₹5,000 లేదా ₹10,000—నేరుగా మ్యూచువల్ ఫండ్‌కు బదిలీ అవుతుంది.\n\nఎస్ఐపి ప్రధాన బలం 'రూపీ కాస్ట్ యావరేజింగ్' (Rupee Cost Averaging).
మార్కెట్ పడిపోయి ఎన్ఎవి ₹100 నుండి ₹80 కి తగ్గినప్పుడు, మీ ₹5,000 ఎస్ఐపి ఎక్కువ యూనిట్లను—50 కి బదులు 62.5 యూనిట్లను కొనుగోలు చేస్తుంది.
మార్కెట్ పెరిగి ఎన్ఎవి ₹125 అయినప్పుడు, ₹5,000 తక్కువ యూనిట్లను (40 యూనిట్లు) కొంటుంది.
కాలక్రమేణా ఇది మీ సగటు కొనుగోలు ధరను తగ్గిస్తుంది. మార్కెట్ తగ్గినప్పుడు ఎక్కువ, పెరిగినప్పుడు తక్కువ యూనిట్లు లభిస్తాయి.\n\nఎస్ఐపిలో ఎటువంటి రిస్క్ ఉండదు లేదా హామీతో కూడిన లాభం వస్తుంది అనుకోవడం తప్పు. ఎస్ఐపి క్రమశిక్షణను పెంచుతుంది, కానీ మార్కెట్ హెచ్చుతగ్గులు ఫండ్ విలువపై ప్రభావం చూపుతాయి.\n\nమార్కెట్ తగ్గినప్పుడు ఎస్ఐపి ఆపివేయడం పెట్టుబడిదారులు చేసే అతిపెద్ద తప్పు. మార్కెట్ దిద్దుబాటులోనే ఎస్ఐపిని కొనసాగించడం గరిష్ట లాభాన్ని ఇస్తుంది.\n\nఎస్ఐపి నెలవారీ పొదుపును ఆటోమేటెడ్ పెట్టుబడిగా మార్చి దీర్ఘకాలిక సంపదను సమకూరుస్తుంది.`,
        keyTakeaway: 'ఎస్ఐపి మీ నెలవారీ పొదుపును రూపాయి ఖర్చు సగటు ద్వారా క్రమశిక్షణతో కూడిన ఆటోమేటెడ్ పెట్టుబడిగా మారుస్తుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/sip.mp4',
        thumbnailUrl: '/academy/ta/sip.webp',
        captionUrl: '/academy/ta/sip.vtt',
        transcript: `ஒரு மாதச் சம்பளக்காரர் அல்லது மாணவர் பெரிய தொகை இல்லாமலும் சந்தைக் கவலை இல்லாமலும் லட்சக்கணக்கான போர்ட்ஃபோலியோவை உருவாக்குவது எப்படி?\n\nஇந்தியாவில் மிகவும் பிரபலமான மற்றும் ஒழுக்கமான முதலீட்டு முறை எஸ்ஐபி—அதாவது சிஸ்டமேடிக் இன்வெஸ்ட்மென்ட் பிளான் (Systematic Investment Plan). எஸ்ஐபி என்பது தனி தயாரிப்பு அல்ல; இது மியூச்சுவல் ஃபண்டுகளில் தவறாமல் முதலீடு செய்யும் ஒரு தானியங்கி முறையாகும்.

பெரிய தொகை சேரும் வரை காத்திருக்காமல், ஒவ்வொரு மாதமும் உங்கள் வங்கிக் கணக்கிலிருந்து ஒரு குறிப்பிட்ட தொகை—உதாரணமாக ₹1,000, ₹5,000 அல்லது ₹10,000—நேரடியாக மியூச்சுவல் ஃபண்டில் முதலீடு செய்யப்படுகிறது.\n\nஎஸ்ஐபியின் முக்கிய பலம் 'ரூபாய் செலவு சராசரி' (Rupee Cost Averaging).
சந்தை சரிந்து என்ஏவி ₹100-லிருந்து ₹80 ஆகக் குறையும் போது, உங்கள் ₹5,000 எஸ்ஐபி அதிக யூனிட்டுகளை—50-க்கு பதிலாக 62.5 யூனிட்டுகளை வாங்குகிறது.
சந்தை உயர்ந்து என்ஏவி ₹125 ஆகும்போது, ₹5,000 குறைவான யூனிட்டுகளை (40 யூனிட்டுகள்) வாங்குகிறது.
காலப்போக்கில் இது உங்கள் சராசரி கொள்முதல் விலையைக் குறைக்கிறது. விலை குறையும் போது அதிகம், உயரும் போது குறைவாக யூனிட்டுகள் கிடைக்கும்.\n\nஎஸ்ஐபியில் ஆபத்தே இல்லை அல்லது உத்தரவாத லாபம் கிடைக்கும் என்பது தவறான கருத்து. எஸ்ஐபி ஒழுக்கத்தை உருவாக்குகிறது, ஆனால் சந்தை மாற்றங்கள் ஃபண்ட் மதிப்பில் தாக்கத்தை ஏற்படுத்தும்.\n\nசந்தை சரியும்போது எஸ்ஐபியை நிறுத்துவது முதலீட்டாளர்கள் செய்யும் மிகப்பெரிய தவறு. சரிவின் போது எஸ்ஐபியைத் தொடர்வதே அதிக லாபத்தைத் தரும்.\n\nஎஸ்ஐபி மாதாந்திர சேமிப்பை தானியங்கி முதலீடாக மாற்றி நீண்ட கால செல்வத்தை உருவாக்குகிறது.`,
        keyTakeaway: 'எஸ்ஐபி உங்கள் மாதாந்திர சேமிப்பை ரூபாய் செலவு சராசரி மூலம் ஒழுக்கமான தானியங்கி முதலீடாக மாற்றுகிறது.'
      },
      ml: {
        videoUrl: '/academy/ml/sip.mp4',
        thumbnailUrl: '/academy/ml/sip.webp',
        captionUrl: '/academy/ml/sip.vtt',
        transcript: `ഒരു ശമ്പളക്കാരനോ വിദ്യാർത്ഥിക്കോ വലിയ തുകയില്ലാതെയും മാർക്കറ്റ് ടെൻഷൻ ഇല്ലാതെയും വലിയൊരു പോർട്ട്ഫോളിയോ എങ്ങനെ ഉണ്ടാക്കാം?\n\nഇന്ത്യയിലെ ഏറ്റവും ജനപ്രിയവും ചിട്ടയായതുമായ നിക്ഷേപ രീതിയാണ് എസ്ഐപി (SIP - Systematic Investment Plan). ഇതൊരു പ്രത്യേക ഉൽപ്പന്നമല്ല; മറിച്ച് മ്യൂച്വൽ ഫണ്ടുകളിൽ കൃത്യമായി നിക്ഷേപിക്കുന്ന ഒരു ഓട്ടോമേറ്റഡ് രീതിയാണ്.

വലിയ തുക വരുന്നതുവരെ കാത്തിരിക്കാതെ, എല്ലാ മാസവും നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിൽ നിന്ന് നിശ്ചിത തുക—ഉദാഹരണത്തിന് ₹1,000, ₹5,000 അല്ലെങ്കിൽ ₹10,000—നേരിട്ട് മ്യൂച്വൽ ഫണ്ടിലേക്ക് മാറ്റപ്പെടുന്നു.\n\nഎസ്ഐപിയുടെ പ്രധാന ശക്തി 'റുപ്പീ കോസ്റ്റ് ആവറേജിംഗ്' (Rupee Cost Averaging) ആണ്.
വിപണി ഇടിഞ്ഞ് എൻഎവി ₹100-ൽ നിന്ന് ₹80 ആകുമ്പോൾ, നിങ്ങളുടെ ₹5,000 കൂടുതൽ യൂണിറ്റുകൾ—50-ന് പകരം 62.5 യൂണിറ്റുകൾ വാങ്ങുന്നു.
വിപണി ഉയർന്ന് എൻഎവി ₹125 ആകുമ്പോൾ, ₹5,000 കുറവ് യൂണിറ്റുകൾ (40 യൂണിറ്റുകൾ) വാങ്ങുന്നു.
കാലക്രമേണ ഇത് നിങ്ങളുടെ ശരാശരി വാങ്ങൽ ചിലവ് കുറയ്ക്കുന്നു. വില കുറയുമ്പോൾ കൂടുതലും കൂടുമ്പോൾ കുറവും യൂണിറ്റുകൾ ലഭിക്കുന്നു.\n\nഎസ്ഐപിയിൽ റിസ്ക് ഇല്ല അല്ലെങ്കിൽ ഗ്യാരണ്ടീഡ് ലാഭം ലഭിക്കും എന്നത് തെറ്റാണ്. എസ്ഐപി അച്ചടക്കം നൽകുന്നുണ്ടെങ്കിലും വിപണി വ്യതിയാനങ്ങൾ ഫണ്ട് മൂല്യത്തെ ബാധിക്കും.\n\nവിപണി താഴേക്ക് പോകുമ്പോൾ എസ്ഐപി നിർത്തുന്നത് നിക്ഷേപകർ ചെയ്യുന്ന വലിയ തെറ്റാണ്. വിലക്കുറവുള്ള സമയത്ത് എസ്ഐപി തുടരുന്നതാണ് മികച്ച നേട്ടം തരുന്നത്.\n\nഎസ്ഐപി പ്രതിമാസ സമ്പാദ്യത്തെ ഓട്ടോമേറ്റഡ് നിക്ഷേപമാക്കി ദീർഘകാല സമ്പത്ത് സൃഷ്ടിക്കുന്നു.`,
        keyTakeaway: 'എസ്ഐപി നിങ്ങളുടെ പ്രതിമാസ സമ്പാദ്യത്തെ റുപ്പീ കോസ്റ്റ് ആവറേജിംഗ് വഴി ചിട്ടയായ ഓട്ടോമേറ്റഡ് നിക്ഷേപമാക്കുന്നു.'
      },
      mr: {
        videoUrl: '/academy/mr/sip.mp4',
        thumbnailUrl: '/academy/mr/sip.webp',
        captionUrl: '/academy/mr/sip.vtt',
        transcript: `एक नोकरदार किंवा विद्यार्थी मोठ्या रकमेची वाट न पाहता आणि बाजाराची चिंता न करता लाखोंचा पोर्टफोलिओ कसा बनवू शकतो?\n\nभारतात गुंतवणूक करण्याचा सर्वात लोकप्रिय आणि शिस्तबद्ध मार्ग म्हणजे एसआयपी (SIP - Systematic Investment Plan). एसआयपी हे वेगळे उत्पादन नाही; तर म्युच्युअल फंडात नियमितपणे गुंतवणूक करण्याची एक स्वयंचलित पद्धत आहे.

मोठी रक्कम जमा होण्याची वाट न पाहता, दरमहा तुमच्या बँक खात्यातून एक निश्चित रक्कम—उदा. ₹1,000, ₹5,000 किंवा ₹10,000—थेट म्युच्युअल फंडात गुंतवली जाते.\n\nएसआयपीची खरी ताकद 'रुपी कॉस्ट अ‍ॅव्हरेजिंग' (Rupee Cost Averaging) मध्ये आहे.
जेव्हा बाजार घसरतो आणि एनएव्ही ₹100 वरून ₹80 वर येते, तेव्हा तुमची ₹5,000 ची एसआयपी जास्त युनिट्स खरेदी करते—50 ऐवजी 62.5 युनिट्स.
जेव्हा बाजार वाढतो आणि एनएव्ही ₹125 होते, तेव्हा ₹5,000 कमी युनिट्स (40 युनिट्स) खरेदी करते.
कालांतराने यामुळे तुमची सरासरी खरेदी किंमत कमी होते. किंमत कमी असताना जास्त आणि महाग असताना कमी युनिट्स मिळतात.\n\nएसआयपीमध्ये जोखीम नसते किंवा हमी परतावा मिळतो हा गैरसमज आहे. एसआयपी शिस्त निर्माण करते, पण बाजारातील चढ-उतार फंडाच्या मूल्यावर परिणाम करतात.\n\nबाजार घसरल्यावर एसआयपी थांबवणे ही गुंतवणूकदारांची सर्वात मोठी चूक आहे. घसरणीत एसआयपी चालू ठेवल्यानेच सर्वाधिक फायदा होतो.\n\nएसआयपी मासिक बचतीला स्वयंचलित गुंतवणुकीत रूपांतरित करून दीर्घकालीन संपत्ती निर्माण करते.`,
        keyTakeaway: 'एसआयपी तुमच्या मासिक बचतीला रुपी कॉस्ट सरासरीच्या माध्यमातून शिस्तबद्ध स्वयंचलित गुंतवणुकीत बदलते.'
      },
      bn: {
        videoUrl: '/academy/bn/sip.mp4',
        thumbnailUrl: '/academy/bn/sip.webp',
        captionUrl: '/academy/bn/sip.vtt',
        transcript: `একজন চাকুরিজীবী বা শিক্ষার্থী কোনো বড় এককালীন অর্থ ছাড়া এবং বাজারের চিন্তা না করে লাখ লাখ টাকার পোর্টফোলিও কীভাবে গড়তে পারেন?\n\nভারতে সবচেয়ে জনপ্রিয় এবং সুশৃঙ্খল বিনিয়োগের মাধ্যম হলো এসআইপি (SIP - Systematic Investment Plan)। এসআইপি কোনো আলাদা পণ্য নয়; এটি মিউচুয়াল ফান্ডে নিয়মিত বিনিয়োগ করার একটি স্বয়ংক্রিয় পদ্ধতি।

একসাথে বড় টাকা জমার অপেক্ষায় না থেকে, প্রতি মাসে আপনার ব্যাংক একাউন্ট থেকে নির্দিষ্ট পরিমাণ অর্থ—যেমন ₹১,০০০, ₹৫,০০০ বা ₹১০,০০০—স্বয়ংক্রিয়ভাবে মিউচুয়াল ফান্ডে জমা হয়ে যায়।\n\nএসআইপির মূল গাণিতিক শক্তি হলো 'রুপি কস্ট অ্যাভারেজিং' (Rupee Cost Averaging)।
যখন বাজার কমে এবং এনএভি ₹১০০ থেকে কমে ₹৮০ হয়, তখন আপনার ₹৫,০০০ বেশি ইউনিট কেনে—৫০টির বদলে ৬২.৫টি ইউনিট।
যখন বাজার বাড়ে এবং এনএভি ₹১২৫ হয়, তখন ₹৫,০০০ কম ইউনিট কেনে—৪০টি ইউনিট।
সময়ের সাথে সাথে এটি আপনার গড় ক্রয়মূল্য কমিয়ে দেয়। দাম কমলে বেশি এবং বাড়লে কম ইউনিট পাওয়া যায়।\n\nএসআইপিতে কোনো ঝুঁকি নেই বা নিশ্চিত রিটার্ন পাওয়া যায় বলে ভাবা ভুল। এসআইপি শৃঙ্খলা তৈরি করে, তবে বাজারের ওঠানামা ফান্ডের মূল্যকে প্রভাবিত করে।\n\nবাজার কমলে এসআইপি বন্ধ করে দেওয়া বিনিয়োগকারীদের সবচেয়ে বড় ভুল। পতনের সময় এসআইপি চালিয়ে যাওয়াই সবচেয়ে বেশি লাভ দেয়।\n\nএসআইপি মাসিক সঞ্চয়কে সুশৃঙ্খল বিনিয়োগে রূপান্তর করে দীর্ঘমেয়াদে সম্পদ তৈরি করে।`,
        keyTakeaway: 'এসআইপি আপনার মাসিক সঞ্চয়কে রুপি কস্ট অ্যাভারেজিংয়ের মাধ্যমে সুশৃঙ্খল স্বয়ংক্রিয় বিনিয়োগে রূপান্তর করে।'
      },
    }
  },
  // ── 09. WHAT IS SWP? ──
  {
    id: 'what-is-swp',
    number: 9,
    title: 'What is SWP?',
    category: 'India Investing',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/swp.mp4',
    thumbnailUrl: '/academy/swp.webp',
    description: 'Systematic Withdrawal Plans: generating predictable, tax-efficient retirement cash flow while keeping capital invested.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is SWP?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `If a SIP is how you systematically build wealth during your working years, how do you harvest that wealth to generate regular monthly income when you retire?\n\nThe answer is an SWP—which stands for Systematic Withdrawal Plan. An SWP is the exact mirror image of a SIP. Instead of depositing money into a mutual fund each month, an SWP allows you to withdraw a fixed sum—say ₹25,000 every month—directly into your bank account from your accumulated mutual fund corpus.\n\nHere is what happens behind the scenes:
Every month on your chosen date, the mutual fund house redeems just enough units from your folio at the current NAV to pay out your requested cash amount. The rest of your corpus stays invested in the fund, continuing to generate potential returns and dividends.

For example, if you have a retirement corpus of ₹50 Lakhs and set up a monthly SWP of ₹25,000, you receive ₹3 Lakhs annually (a 6% withdrawal rate). If the remaining portfolio grows at 8%, your corpus can sustain regular payouts for decades while potentially keeping pace with inflation.

SWPs also offer significant tax advantages in India compared to traditional fixed deposit interest, because only the capital gain portion of each redeemed unit is subject to tax.\n\nSome investors assume an SWP is a guaranteed interest payout like an annuity. In reality, an SWP redeems units; if you withdraw too aggressively during a prolonged bear market, you risk depleting your principal capital prematurely.\n\nAlways maintain a sensible withdrawal rate (typically 4% to 6% annually) and keep 1 to 2 years of emergency cash in debt funds to protect against longevity and market risks.\n\nAn SWP provides structured, predictable, and tax-efficient monthly cash flow while keeping your remaining wealth productively invested.`,
    learningPoints: [
      "An SWP allows periodic structured cash withdrawals from an accumulated mutual fund corpus.",
      "Only required units are redeemed at prevailing NAV; remaining balance stays invested.",
      "High tax efficiency compared to traditional fixed deposit interest.",
      "Safe withdrawal rates (4%\u20136%) protect against longevity and market risks."
],
    keyTakeaway: 'An SWP provides structured periodic income by systematically redeeming units while keeping your remaining capital invested.',
    quiz: [
      {
            "id": "q9-1",
            "question": "What is a Systematic Withdrawal Plan (SWP) primarily used for?",
            "options": [
                  "Applying for personal bank loans.",
                  "Generating structured, regular cash payouts (e.g., retirement income) while keeping remaining funds invested.",
                  "Automating monthly credit card bill payments.",
                  "Buying speculative cryptocurrency tokens."
            ],
            "correctAnswer": 1,
            "explanation": "An SWP allows investors to systematically withdraw a fixed sum monthly from their mutual fund corpus for living expenses."
      },
      {
            "id": "q9-2",
            "question": "Why is an SWP generally more tax-efficient than traditional Fixed Deposit interest in India?",
            "options": [
                  "SWP withdrawals are completely exempt from all taxes forever.",
                  "Only the capital gain portion of each redeemed unit is subject to tax, rather than the entire withdrawal amount.",
                  "Banks do not report SWP transactions to tax authorities.",
                  "SWPs only invest in tax-free government municipal bonds."
            ],
            "correctAnswer": 1,
            "explanation": "Each SWP redemption consists partly of original principal and partly of capital gains; only the capital gain portion is taxed."
      }
],
    relatedLessons: ["what-is-sip", "what-is-a-mutual-fund", "risk-return-diversification"],
    vestiqPrompt: 'How does an SWP provide monthly income for retirement tax-efficiently?',
    languages: {
      en: {
        videoUrl: '/academy/en/swp.mp4',
        thumbnailUrl: '/academy/en/swp.webp',
        captionUrl: '/academy/en/swp.vtt',
        transcript: `If a SIP is how you systematically build wealth during your working years, how do you harvest that wealth to generate regular monthly income when you retire?\n\nThe answer is an SWP—which stands for Systematic Withdrawal Plan. An SWP is the exact mirror image of a SIP. Instead of depositing money into a mutual fund each month, an SWP allows you to withdraw a fixed sum—say ₹25,000 every month—directly into your bank account from your accumulated mutual fund corpus.\n\nHere is what happens behind the scenes:
Every month on your chosen date, the mutual fund house redeems just enough units from your folio at the current NAV to pay out your requested cash amount. The rest of your corpus stays invested in the fund, continuing to generate potential returns and dividends.

For example, if you have a retirement corpus of ₹50 Lakhs and set up a monthly SWP of ₹25,000, you receive ₹3 Lakhs annually (a 6% withdrawal rate). If the remaining portfolio grows at 8%, your corpus can sustain regular payouts for decades while potentially keeping pace with inflation.

SWPs also offer significant tax advantages in India compared to traditional fixed deposit interest, because only the capital gain portion of each redeemed unit is subject to tax.\n\nSome investors assume an SWP is a guaranteed interest payout like an annuity. In reality, an SWP redeems units; if you withdraw too aggressively during a prolonged bear market, you risk depleting your principal capital prematurely.\n\nAlways maintain a sensible withdrawal rate (typically 4% to 6% annually) and keep 1 to 2 years of emergency cash in debt funds to protect against longevity and market risks.\n\nAn SWP provides structured, predictable, and tax-efficient monthly cash flow while keeping your remaining wealth productively invested.`,
        keyTakeaway: 'An SWP provides structured periodic income by systematically redeeming units while keeping your remaining capital invested.'
      },
      hi: {
        videoUrl: '/academy/hi/swp.mp4',
        thumbnailUrl: '/academy/hi/swp.webp',
        captionUrl: '/academy/hi/swp.vtt',
        transcript: `यदि एसआईपी आपके कामकाजी वर्षों में संपत्ति बनाने का तरीका है, तो रिटायरमेंट के बाद नियमित मासिक आय पाने के लिए उस संपत्ति का उपयोग कैसे किया जाए?\n\nइसका उत्तर है एसडब्ल्यूपी—यानी सिस्टेमैटिक विथड्रॉल प्लान (Systematic Withdrawal Plan)। एसडब्ल्यूपी बिल्कुल एसआईपी का दर्पण रूप है। हर महीने फंड में पैसे जमा करने के बजाय, एसडब्ल्यूपी आपको अपने जमा किए गए म्यूचुअल फंड फंड से हर महीने एक निश्चित राशि—जैसे ₹25,000—सीधे अपने बैंक खाते में निकालने की सुविधा देता है।\n\nयहाँ पर्दे के पीछे क्या होता है:
हर महीने आपकी चुनी हुई तारीख पर, म्यूचुअल फंड कंपनी वर्तमान एनएवी पर उतनी ही यूनिट्स बेचती है जितनी आपकी अनुरोधित राशि के लिए जरूरी होती हैं। आपकी शेष पूंजी फंड में ही निवेशित रहती है और उस पर संभावित रिटर्न और लाभांश मिलते रहते हैं।

उदाहरण के लिए, यदि आपके पास ₹50 लाख का रिटायरमेंट फंड है और आप ₹25,000 प्रति माह का एसडब्ल्यूपी सेट करते हैं, तो आपको सालाना ₹3 लाख (6% विथड्रॉल रेट) मिलते हैं। यदि शेष पोर्टफोलियो 8% की दर से बढ़ता है, तो आपका फंड दशकों तक नियमित भुगतान दे सकता है और महंगाई को भी मात दे सकता है।

पारंपरिक बैंक एफडी ब्याज की तुलना में एसडब्ल्यूपी भारत में कर-कुशल भी है, क्योंकि भुनाई गई प्रत्येक यूनिट के केवल पूंजीगत लाभ वाले हिस्से पर ही कर लगता है।\n\nकुछ निवेशक मानते हैं कि एसडब्ल्यूपी वार्षिकी की तरह एक गारंटीड ब्याज भुगतान है। वास्तव में, एसडब्ल्यूपी यूनिट्स को भुनाता है; यदि आप मंदी के दौरान बहुत आक्रामक रूप से निकासी करते हैं, तो आपकी मूल पूंजी समय से पहले समाप्त हो सकती है।\n\nहमेशा एक सुरक्षित निकासी दर (आमतौर पर सालाना 4% से 6%) बनाए रखें और आपातकालीन खर्चों के लिए 1 से 2 साल का खर्च सुरक्षित डेट फंड में रखें।\n\nएसडब्ल्यूपी आपके शेष धन को बाजार में उत्पादक बनाए रखते हुए एक संरचित, अनुमानित और कर-कुशल मासिक नकदी प्रवाह प्रदान करता है।`,
        keyTakeaway: 'एसडब्ल्यूपी बची हुई पूंजी को निवेशित रखते हुए यूनिट्स भुनाकर संरचित आवधिक मासिक आय देता है।'
      },
      kn: {
        videoUrl: '/academy/kn/swp.mp4',
        thumbnailUrl: '/academy/kn/swp.webp',
        captionUrl: '/academy/kn/swp.vtt',
        transcript: `ನಿಮ್ಮ ಉದ್ಯೋಗದ ದಿನಗಳಲ್ಲಿ ಎಸ್‌ಐಪಿ ಮೂಲಕ ಸಂಪತ್ತು ನಿರ್ಮಿಸಿದ ನಂತರ, ನಿವೃತ್ತಿಯ ನಂತರ ಮಾಸಿಕ ಆದಾಯ ಪಡೆಯಲು ಆ ಸಂಪತ್ತನ್ನು ಹೇಗೆ ಬಳಸಿಕೊಳ್ಳುವುದು?\n\nಇದಕ್ಕೆ ಉತ್ತರವೇ ಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ—ಅಂದರೆ ಸಿಸ್ಟಮ್ಯಾಟಿಕ್ ವಿದ್‌ಡ್ರಾವಲ್ ಪ್ಲಾನ್ (Systematic Withdrawal Plan). ಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ ಎಸ್‌ಐಪಿಯ ನೇರ ಪ್ರತಿರೂಪವಾಗಿದೆ. ಹಣ ಠೇವಣಿ ಮಾಡುವ ಬದಲು, ನಿಮ್ಮ ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ನಿಂದ ಪ್ರತಿ ತಿಂಗಳು ನಿಗದಿತ ಮೊತ್ತವನ್ನು—ಉದಾಹರಣೆಗೆ ₹25,000—ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಹಿಂಪಡೆಯಬಹುದು.\n\nಇಲ್ಲಿ ಏನು ಸಂಭವಿಸುತ್ತದೆ ಎಂದರೆ:
ಪ್ರತಿ ತಿಂಗಳು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ದಿನಾಂಕದಂದು, ನಿಮ್ಮ ಕೋರಿಕೆಯ ಮೊತ್ತಕ್ಕೆ ಸಮನಾದ ಯೂನಿಟ್‌ಗಳನ್ನು ಪ್ರಸ್ತುತ ಎನ್‌ಎವಿ ದರದಲ್ಲಿ ಮಾರಿ ಹಣವನ್ನು ಬ್ಯಾಂಕ್‌ಗೆ ಜಮೆ ಮಾಡಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಉಳಿದ ಬಂಡವಾಳವು ಫಂಡ್‌ನಲ್ಲಿಯೇ ಮುಂದುವರಿದು ಲಾಭ ಗಳಿಸುತ್ತಿರುತ್ತದೆ.

ಉದಾಹರಣೆಗೆ, ₹50 ಲಕ್ಷದ ನಿವೃತ್ತಿ ನಿಧಿಯಿಂದ ತಿಂಗಳಿಗೆ ₹25,000 (ವಾರ್ಷಿಕ 6% ಹಿಂಪಡೆಯುವಿಕೆ) ಪಡೆದರೆ, ಉಳಿದ ಮೊತ್ತ 8% ದರದಲ್ಲಿ ಬೆಳೆದರೆ ನಿಮ್ಮ ನಿಧಿಯು ದಶಕಗಳ ಕಾಲ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.

ಬ್ಯಾಂಕ್ ಎಫ್‌ಡಿ ಬಡ್ಡಿಗೆ ಹೋಲಿಸಿದರೆ ಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ ತೆರಿಗೆ ದೃಷ್ಟಿಯಿಂದಲೂ ಹೆಚ್ಚು ಲಾಭದಾಯಕವಾಗಿದೆ.\n\nಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ ಗ್ಯಾರಂಟಿ ಬಡ್ಡಿ ಎಂದು ಕೆಲವರು ಭಾವಿಸುತ್ತಾರೆ. ಅತಿಯಾದ ಮೊತ್ತವನ್ನು ಹಿಂಪಡೆದರೆ ಬಂಡವಾಳ ಬೇಗನೆ ಖಾಲಿಯಾಗುವ ಅಪಾಯವಿರುತ್ತದೆ.\n\nಸುರಕ್ಷಿತ ವಾರ್ಷಿಕ 4% ರಿಂದ 6% ಹಿಂಪಡೆಯುವಿಕೆಯ ದರವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ ಮತ್ತು 1-2 ವರ್ಷಗಳ ವೆಚ್ಚವನ್ನು ಸುರಕ್ಷಿತ ಡೆಟ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ಇರಿಸಿ.\n\nಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ ನಿಮ್ಮ ಸಂಪತ್ತನ್ನು ಉತ್ಪಾದಕವಾಗಿ ಉಳಿಸಿಕೊಂಡು ನಿಯಮಿತ ಮತ್ತು ತೆರಿಗೆ-ಸ್ನೇಹಿ ಮಾಸಿಕ ಆದಾಯವನ್ನು ನೀಡುತ್ತದೆ.`,
        keyTakeaway: 'ಎಸ್‌ಡಬ್ಲ್ಯೂಪಿ ಉಳಿದ ಬಂಡವಾಳವನ್ನು ಹೂಡಿಕೆಯಲ್ಲಿಯೇ ಇರಿಸಿ ನಿಯಮಿತ ಮಾಸಿಕ ಆದಾಯವನ್ನು ಒದಗಿಸುತ್ತದೆ.'
      },
      te: {
        videoUrl: '/academy/te/swp.mp4',
        thumbnailUrl: '/academy/te/swp.webp',
        captionUrl: '/academy/te/swp.vtt',
        transcript: `ఉద్యోగ విరమణ తర్వాత నెలవారీ ఖర్చుల కోసం ఎస్ఐపి ద్వారా సృష్టించిన సంపదను ఎలా సమర్థవంతంగా ఉపయోగించుకోవాలి?\n\nదీనికి సమాధానమే ఎస్డబ్ల్యూపి—అంటే సిస్టమాటిక్ విత్‌డ్రావల్ ప్లాన్ (Systematic Withdrawal Plan). ఎస్డబ్ల్యూపి అనేది ఎస్ఐపికి పూర్తి వ్యతిరేకం. డబ్బు జమ చేయడానికి బదులుగా, మీ మ్యూచువల్ ఫండ్ నుండి ప్రతి నెలా నిర్ణీత మొత్తాన్ని—ఉదాహరణకు ₹25,000—మీ బ్యాంక్ ఖాతాకు ఉపసంహరించుకోవచ్చు.\n\nఇక్కడ తెరవెనుక ఏమి జరుగుతుందంటే:
ప్రతి నెలా మీరు ఎంచుకున్న తేదీన, ప్రస్తుత ఎన్ఎవి ప్రకారం మీ అభ్యర్థన మొత్తానికి సరిపడా యూనిట్లను విక్రయించి డబ్బును మీ ఖాతాకు జమ చేస్తారు. మిగిలిన మొత్తం ఫండ్‌లోనే ఉండి రాబడులను ఆర్జిస్తూ ఉంటుంది.

ఉదాహరణకు, ₹50 లక్షల రిటైర్మెంట్ ఫండ్ నుండి నెలకు ₹25,000 (వార్షికంగా 6%) ఉపసంహరిస్తే, మిగిలిన మొత్తం 8% వృద్ధి చెందితే మీ నిధి దశాబ్దాల పాటు సురక్షితంగా ఉంటుంది.

బ్యాంక్ ఎఫ్‌డీ వడ్డీతో పోలిస్తే ఎస్డబ్ల్యూపి పన్ను పరంగా కూడా చాలా ప్రయోజనకరమైనది.\n\nఎస్డబ్ల్యూపి గ్యారెంటీ వడ్డీ అని అనుకోవడం తప్పు. మార్కెట్ మందగమనంలో ఉన్నప్పుడు అధికంగా ఉపసంహరించుకుంటే అసలు మూలధనం త్వరగా కరిగిపోయే ప్రమాదం ఉంటుంది.\n\nసురక్షితమైన వార్షిక 4% నుండి 6% ఉపసంహరణ రేటును పాటించండి మరియు 1-2 సంవత్సరాల ఖర్చులను సురక్షిత డెట్ ఫండ్లలో ఉంచండి.\n\nఎస్డబ్ల్యూపి మీ సంపదను మార్కెట్లో ఉంచుతూనే క్రమబద్ధమైన, పన్ను-స్నేహపూర్వక నెలవారీ నగదు ప్రవాహాన్ని అందిస్తుంది.`,
        keyTakeaway: 'ఎస్డబ్ల్యూపి మిగిలిన మూలధనాన్ని పెట్టుబడిలోనే ఉంచుతూ క్రమబద్ధమైన నెలవారీ ఆదాయాన్ని అందిస్తుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/swp.mp4',
        thumbnailUrl: '/academy/ta/swp.webp',
        captionUrl: '/academy/ta/swp.vtt',
        transcript: `பணிக்காலத்தில் எஸ்ஐபி மூலம் செல்வத்தை உருவாக்கிய பிறகு, ஓய்வுக்காலத்தில் மாதாந்திர வருமானம் பெற அந்தச் செல்வத்தை எவ்வாறு பயன்படுத்துவது?\n\nஇதற்கான விடைதான் எஸ்டபிள்யூபி—அதாவது சிஸ்டமேடிக் வித்ட்ராவல் பிளான் (Systematic Withdrawal Plan). எஸ்டபிள்யூபி என்பது எஸ்ஐபியின் நேர் எதிர் வடிவமாகும். பணத்தைச் செலுத்துவதற்குப் பதிலாக, உங்கள் மியூச்சுவல் ஃபண்டிலிருந்து ஒவ்வொரு மாதமும் ஒரு குறிப்பிட்ட தொகையை—உதாரணமாக ₹25,000—உங்கள் வங்கிக் கணக்கில் பெற்றுக்கொள்ளலாம்.\n\nஇங்கு என்ன நடக்கிறது என்றால்:
ஒவ்வொரு மாதமும் நீங்கள் தேர்ந்தெடுத்த தேதியில், உங்கள் தொகைக்குத் தேவையான யூனிட்டுகளை தற்போதைய என்ஏவி விலையில் விற்றுப் பணம் உங்கள் கணக்கில் வரவு வைக்கப்படும். உங்கள் மீதமுள்ள மூலதனம் ஃபண்டிலேயே இருந்து லாபம் ஈட்டிக் கொண்டிருக்கும்.

உதாரணமாக, ₹50 லட்சம் ஓய்வூதிய நிதியிலிருந்து மாதம் ₹25,000 (ஆண்டுக்கு 6%) எடுத்தால், மீதமுள்ள தொகை 8% வளர்ந்தால் உங்கள் நிதி பல தசாப்தங்களுக்குப் பாதுகாப்பாக இருக்கும்.

வங்கி எஃப்டி வட்டியுடன் ஒப்பிடும்போது எஸ்டபிள்யூபி வரி ரீதியாகவும் மிகவும் பயனுள்ளதாக இருக்கும்.\n\nஎஸ்டபிள்யூபி உத்தரவாத வட்டி என்று நினைப்பது தவறு. சந்தை மந்தநிலையில் இருக்கும்போது அதிகமாகப் பணத்தை எடுத்தால் அசல் மூலதனம் விரைவில் குறையும் அபாயம் உள்ளது.\n\nஆண்டுக்கு 4% முதல் 6% வரை பாதுகாப்பான திரும்பப் பெறும் விகிதத்தைப் பின்பற்றுங்கள் மற்றும் 1-2 ஆண்டுகளுக்கான அவசரத் தொகையை டெப்ட் ஃபண்டுகளில் வைத்திருங்கள்.\n\nஎஸ்டபிள்யூபி உங்கள் பணத்தை முதலீட்டில் வைத்துக்கொண்டே ஒழுங்கமைக்கப்பட்ட, வரி-நட்பு மாதாந்திர வருமானத்தை வழங்குகிறது.`,
        keyTakeaway: 'எஸ்டபிள்யூபி மீதமுள்ள மூலதனத்தை முதலீட்டிலேயே வைத்துக்கொண்டு ஒழுங்கமைக்கப்பட்ட மாதாந்திர வருமானத்தை வழங்குகிறது.'
      },
      ml: {
        videoUrl: '/academy/ml/swp.mp4',
        thumbnailUrl: '/academy/ml/swp.webp',
        captionUrl: '/academy/ml/swp.vtt',
        transcript: `എസ്ഐപി വഴി സമ്പത്ത് ഉണ്ടാക്കിയ ശേഷം, റിട്ടയർമെന്റ് കാലത്ത് പ്രതിമാസ വരുമാനം നേടാൻ ആ സമ്പത്ത് എങ്ങനെ ഫലപ്രദമായി ഉപയോഗിക്കാം?\n\nഇതിനുള്ള ഉത്തരമാണ് എസ്ഡബ്ല്യുപി (SWP - Systematic Withdrawal Plan). ഇത് എസ്ഐപിയുടെ നേർ വിപരീത രൂപമാണ്. പണം നിക്ഷേപിക്കുന്നതിന് പകരം, നിങ്ങളുടെ മ്യൂച്വൽ ഫണ്ടിൽ നിന്ന് എല്ലാ മാസവും നിശ്ചിത തുക—ഉദാഹരണത്തിന് ₹25,000—നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിലേക്ക് പിൻവലിക്കാം.\n\nഇവിടെ സംഭവിക്കുന്നത് എന്തെന്നാൽ:
എല്ലാ മാസവും നിങ്ങൾ തിരഞ്ഞെടുത്ത തീയതിയിൽ, നിലവിലെ എൻഎവി പ്രകാരം ആവശ്യമായ യൂണിറ്റുകൾ വിറ്റ് പണം ബാങ്കിലേക്ക് നൽകുന്നു. ബാക്കി തുക ഫണ്ടിൽ തന്നെ തുടർന്ന് ലാഭം നേടിക്കൊണ്ടിരിക്കും.

ഉദാഹരണത്തിന്, ₹50 ലക്ഷത്തിന്റെ റിട്ടയർമെന്റ് ഫണ്ടിൽ നിന്ന് മാസം ₹25,000 (വാർഷികം 6%) പിൻവലിച്ചാൽ, ബാക്കി തുക 8% വളർന്നാൽ നിങ്ങളുടെ ഫണ്ട് പതിറ്റാണ്ടുകളോളം സുരക്ഷിതമായിരിക്കും.

ബാങ്ക് എഫ്ഡി പലിശയുമായി താരതമ്യം ചെയ്യുമ്പോൾ എസ്ഡബ്ല്യുപി നികുതി കാര്യക്ഷമവുമാണ്.\n\nഎസ്ഡബ്ല്യുപി ഉറപ്പുള്ള പലിശയാണെന്ന് കരുതുന്നത് തെറ്റാണ്. വിപണി മോശമായിരിക്കുമ്പോൾ അമിതമായി പണം പിൻവലിച്ചാൽ മൂലധനം വേഗത്തിൽ തീർന്നുപോകാൻ സാധ്യതയുണ്ട്.\n\nവാർഷിക 4% മുതൽ 6% വരെയുള്ള സുരക്ഷിത പിൻവലിക്കൽ നിരക്ക് പാലിക്കുകയും 1-2 വർഷത്തെ ചിലവുകൾ സുരക്ഷിത ഡെറ്റ് ഫണ്ടുകളിൽ സൂക്ഷിക്കുകയും ചെയ്യുക.\n\nഎസ്ഡബ്ല്യുപി നിങ്ങളുടെ പണം നിക്ഷേപത്തിൽ നിലനിർത്തിക്കൊണ്ട് ക്രമവും നികുതി സൗഹൃദവുമായ പ്രതിമാസ വരുമാനം നൽകുന്നു.`,
        keyTakeaway: 'എസ്ഡബ്ല്യുപി ബാക്കി തുക നിക്ഷേപത്തിൽ നിലനിർത്തിക്കൊണ്ട് ക്രമമായ പ്രതിമാസ വരുമാനം നൽകുന്നു.'
      },
      mr: {
        videoUrl: '/academy/mr/swp.mp4',
        thumbnailUrl: '/academy/mr/swp.webp',
        captionUrl: '/academy/mr/swp.vtt',
        transcript: `नोकरीच्या काळात एसआयपीद्वारे संपत्ती निर्माण केल्यानंतर, निवृत्तीनंतर मासिक उत्पन्न मिळवण्यासाठी त्या संपत्तीचा वापर कसा करायचा?\n\nयाचे उत्तर आहे एसडब्ल्यूपी (SWP - Systematic Withdrawal Plan). हा एसआयपीचा अगदी उलट प्रकार आहे. पैसे भरण्याऐवजी, तुमच्या म्युच्युअल फंडातून दरमहा एक निश्चित रक्कम—उदा. ₹25,000—थेट तुमच्या बँक खात्यात काढता येते.\n\nयेथे काय घडते ते पाहू:
दरमहा तुमच्या निवडलेल्या तारखेला, सध्याच्या एनएव्हीनुसार आवश्यक तेवढेच युनिट्स विकून पैसे खात्यात जमा केले जातात. तुमचे उर्वरित भांडवल फंडातच राहून परतावा कमावत राहते.

उदाहरणार्थ, ₹50 लाखांच्या फंडातून दरमहा ₹25,000 (वार्षिक 6%) काढल्यास आणि उर्वरित रक्कम 8% दराने वाढल्यास, तुमचा फंड अनेक दशके सुरक्षित राहू शकतो.

बँक एफडी व्याजाच्या तुलनेत एसडब्ल्यूपी कर बचतीच्या दृष्टीनेही अधिक फायदेशीर ठरतो.\n\nएसडब्ल्यूपी हे हमी व्याज आहे असे मानणे चुकीचे आहे. मंदीच्या काळात जास्त पैसे काढल्यास मूळ भांडवल लवकर संपण्याचा धोका असतो.\n\nवार्षिक 4% ते 6% चा सुरक्षित विड्रॉल दर ठेवा आणि 1-2 वर्षांचा खर्च सुरक्षित डेट फंडात ठेवा.\n\nएसडब्ल्यूपी तुमचे पैसे बाजारात गुंतवून ठेवत नियमित आणि कर-बचत देणारा मासिक रोख प्रवाह प्रदान करतो.`,
        keyTakeaway: 'एसडब्ल्यूपी उर्वरित भांडवल गुंतवणुकीत ठेवून नियमित मासिक उत्पन्न मिळवून देते.'
      },
      bn: {
        videoUrl: '/academy/bn/swp.mp4',
        thumbnailUrl: '/academy/bn/swp.webp',
        captionUrl: '/academy/bn/swp.vtt',
        transcript: `কর্মজীবনে এসআইপির মাধ্যমে সম্পদ গড়ার পর, অবসরের সময় নিয়মিত মাসিক আয়ের জন্য সেই সম্পদ কীভাবে ব্যবহার করবেন?\n\nএর উত্তর হলো এসডব্লিউপি (SWP - Systematic Withdrawal Plan)। এটি এসআইপির সম্পূর্ণ বিপরীত প্রক্রিয়া। টাকা জমা দেওয়ার পরিবর্তে, আপনার মিউচুয়াল ফান্ড থেকে প্রতি মাসে একটি নির্দিষ্ট অংক—যেমন ₹২৫,০০০ টাকা—সরাসরি আপনার ব্যাংক একাউন্টে তুলে নেওয়া যায়।\n\nএখানে যা ঘটে তা হলো:
প্রতি মাসে আপনার পছন্দের তারিখে, বর্তমান এনএভি অনুযায়ী প্রয়োজনীয় সংখ্যক ইউনিট বিক্রি করে টাকা ব্যাংকে দেওয়া হয়। আপনার অবশিষ্ট অর্থ ফান্ডেই বিনিয়োগিত থেকে মুনাফা অর্জন করতে থাকে।

উদাহরণস্বরূপ, ₹৫০ লাখের রিটায়ারমেন্ট ফান্ড থেকে প্রতি মাসে ₹২৫,০০০ (বার্ষিক ৬%) তুললে এবং বাকি ফান্ড ৮% হারে বৃদ্ধি পেলে আপনার তহবিল কয়েক দশক ধরে সুরক্ষিত থাকবে।

ব্যাংক এফডি সুদের তুলনায় এসডব্লিউপি কর সাশ্রয়ীও বটে।\n\nএসডব্লিউপি নিশ্চিত সুদ বলে মনে করা ভুল। মন্দার সময় অতিরিক্ত টাকা তুললে মূলধন দ্রুত শেষ হয়ে যাওয়ার ঝুঁকি থাকে।\n\nবার্ষিক ৪% থেকে ৬% এর নিরাপদ প্রত্যাহার হার বজায় রাখুন এবং ১-২ বছরের খরচ নিরাপদ ডেট ফান্ডে রাখুন।\n\nএসডব্লিউপি আপনার অর্থকে বিনিয়োগে রেখে নিয়মিত ও কর-বান্ধব মাসিক নগদ প্রবাহ নিশ্চিত করে।`,
        keyTakeaway: 'এসডব্লিউপি অবশিষ্ট মূলধন বিনিয়োগে রেখে সুশৃঙ্খল পর্যায়ক্রমিক মাসিক আয় নিশ্চিত করে।'
      },
    }
  },
  // ── 10. WHAT IS A HEDGE FUND? ──
  {
    id: 'what-is-a-hedge-fund',
    number: 10,
    title: 'What is a Hedge Fund?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/hedge-fund.mp4',
    thumbnailUrl: '/academy/hedge-fund.webp',
    description: 'Alternative investment funds (Category III AIFs), long/short strategies, leverage, derivatives, and suitability considerations.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for What is a Hedge Fund?. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `You frequently hear about global hedge funds managing billions of dollars and moving financial markets. But what are they, and how do they differ from retail mutual funds?\n\nA Hedge Fund is an alternative, private pooled investment vehicle designed for institutional investors and ultra-high-net-worth individuals. In India, hedge funds operate under Category III Alternative Investment Funds, or AIFs, regulated by SEBI.

Unlike traditional mutual funds—which primarily buy assets expecting them to rise—hedge funds employ sophisticated, flexible, and aggressive trading strategies designed to generate positive returns in both rising and falling markets.\n\nHedge fund managers utilize advanced financial tools including:
1. Long and Short positions: buying undervalued companies while short-selling overvalued firms to profit when their prices drop.
2. Financial Leverage: borrowing capital to magnify trading positions and return potential.
3. Derivatives & Arbitrage: using complex options, futures, and interest rate swaps to hedge risks or exploit temporary price inefficiencies.

Because of their complexity and risk profile, hedge funds require high minimum investments—typically ₹1 Crore or more in India. They also charge higher fees, traditionally structured as a '2 and 20' model: a 2% annual management fee plus a 20% performance fee on profits earned above a specified hurdle rate.\n\nA common misconception is that the word 'hedge' means the fund is low risk or safe. In truth, the aggressive use of leverage and short positions can lead to sharp volatility and substantial losses if market hypotheses fail.\n\nHedge funds have lock-in periods, high expense structures, and limited liquidity, making them unsuitable for everyday retail investors who are far better served by low-cost index funds.\n\nHedge funds are specialized, high-minimum private funds using complex strategies and leverage to pursue absolute returns across all market conditions.`,
    learningPoints: [
      "Hedge funds are private pooled funds for accredited and institutional investors (Category III AIFs).",
      "Advanced strategies: Long/Short positions, financial leverage, derivatives, and arbitrage.",
      "High minimum ticket sizes (\u20b91 Crore+ in India) and '2 and 20' fee structures.",
      "Why low-cost index funds and mutual funds remain the appropriate choice for retail investors."
],
    keyTakeaway: 'Hedge funds are specialized, high-minimum funds using complex strategies and leverage to pursue returns in all market conditions.',
    quiz: [
      {
            "id": "q10-1",
            "question": "How do hedge funds differ from traditional retail mutual funds?",
            "options": [
                  "They only invest in government savings bonds.",
                  "They employ complex strategies like short-selling, leverage, and derivatives to pursue returns in all market conditions.",
                  "They are completely free of charge with zero management fees.",
                  "They are open to children under 10 years old."
            ],
            "correctAnswer": 1,
            "explanation": "Hedge funds use flexible, aggressive trading techniques including leverage and short positions to generate absolute returns."
      },
      {
            "id": "q10-2",
            "question": "What is the typical minimum investment requirement for Category III AIFs (hedge funds) in India?",
            "options": [
                  "\u20b9500",
                  "\u20b91 Crore",
                  "\u20b910,000",
                  "\u20b950,000"
            ],
            "correctAnswer": 1,
            "explanation": "SEBI mandates a high minimum ticket size (typically \u20b91 Crore) for Alternative Investment Funds due to their risk and complexity."
      }
],
    relatedLessons: ["what-is-a-mutual-fund", "risk-return-diversification", "what-is-an-etf"],
    vestiqPrompt: 'Why are hedge funds restricted to institutional and accredited investors?',
    languages: {
      en: {
        videoUrl: '/academy/en/hedge-fund.mp4',
        thumbnailUrl: '/academy/en/hedge-fund.webp',
        captionUrl: '/academy/en/hedge-fund.vtt',
        transcript: `You frequently hear about global hedge funds managing billions of dollars and moving financial markets. But what are they, and how do they differ from retail mutual funds?\n\nA Hedge Fund is an alternative, private pooled investment vehicle designed for institutional investors and ultra-high-net-worth individuals. In India, hedge funds operate under Category III Alternative Investment Funds, or AIFs, regulated by SEBI.

Unlike traditional mutual funds—which primarily buy assets expecting them to rise—hedge funds employ sophisticated, flexible, and aggressive trading strategies designed to generate positive returns in both rising and falling markets.\n\nHedge fund managers utilize advanced financial tools including:
1. Long and Short positions: buying undervalued companies while short-selling overvalued firms to profit when their prices drop.
2. Financial Leverage: borrowing capital to magnify trading positions and return potential.
3. Derivatives & Arbitrage: using complex options, futures, and interest rate swaps to hedge risks or exploit temporary price inefficiencies.

Because of their complexity and risk profile, hedge funds require high minimum investments—typically ₹1 Crore or more in India. They also charge higher fees, traditionally structured as a '2 and 20' model: a 2% annual management fee plus a 20% performance fee on profits earned above a specified hurdle rate.\n\nA common misconception is that the word 'hedge' means the fund is low risk or safe. In truth, the aggressive use of leverage and short positions can lead to sharp volatility and substantial losses if market hypotheses fail.\n\nHedge funds have lock-in periods, high expense structures, and limited liquidity, making them unsuitable for everyday retail investors who are far better served by low-cost index funds.\n\nHedge funds are specialized, high-minimum private funds using complex strategies and leverage to pursue absolute returns across all market conditions.`,
        keyTakeaway: 'Hedge funds are specialized, high-minimum funds using complex strategies and leverage to pursue returns in all market conditions.'
      },
      hi: {
        videoUrl: '/academy/hi/hedge-fund.mp4',
        thumbnailUrl: '/academy/hi/hedge-fund.webp',
        captionUrl: '/academy/hi/hedge-fund.vtt',
        transcript: `आपने अक्सर वैश्विक हेज फंडों के बारे में सुना होगा जो अरबों डॉलर का प्रबंधन करते हैं और बाजारों को प्रभावित करते हैं। लेकिन वे क्या हैं और सामान्य म्यूचुअल फंड से कैसे अलग हैं?\n\nहेज फंड एक वैकल्पिक, निजी तौर पर एकत्रित निवेश फंड है जिसे बड़े संस्थागत निवेशकों और अत्यधिक उच्च-नेट-वर्थ वाले व्यक्तियों के लिए डिज़ाइन किया गया है। भारत में हेज फंड सेबी (SEBI) द्वारा विनियमित श्रेणी III अल्टरनेटिव इन्वेस्टमेंट फंड्स (AIFs) के तहत काम करते हैं।

पारंपरिक म्यूचुअल फंडों के विपरीत—जो मुख्य रूप से बढ़ती कीमतों की उम्मीद में शेयर खरीदते हैं—हेज फंड परिष्कृत, लचीली और आक्रामक रणनीतियों का उपयोग करते हैं ताकि बढ़ते और गिरते दोनों बाजारों में सकारात्मक रिटर्न उत्पन्न किया जा सके।\n\nहेज फंड मैनेजर उन्नत वित्तीय उपकरणों का उपयोग करते हैं, जिनमें शामिल हैं:
1. लॉन्ग और शॉर्ट पोजीशन: कम मूल्यांकित कंपनियों को खरीदना और अधिक मूल्यांकित कंपनियों को शॉर्ट-सेल करना ताकि कीमतें गिरने पर भी मुनाफा हो।
2. फाइनेंशियल लीवरेज: अपने ट्रेडों और संभावित रिटर्न को बड़ा करने के लिए पूंजी उधार लेना।
3. डेरिवेटिव्स और आर्बिट्राज: जोखिम को हेज करने या कीमतों की विसंगतियों का फायदा उठाने के लिए जटिल ऑप्शंस और फ्यूचर्स का उपयोग करना।

अपनी जटिलता और जोखिम के कारण, भारत में हेज फंडों के लिए न्यूनतम ₹1 करोड़ के निवेश की आवश्यकता होती है। वे उच्च शुल्क भी लेते हैं, जो आमतौर पर '2 और 20' मॉडल होता है: 2% वार्षिक प्रबंधन शुल्क और एक निश्चित सीमा से अधिक मुनाफे पर 20% परफॉर्मेंस शुल्क।\n\nएक आम गलतफहमी यह है कि 'हेज' शब्द का अर्थ कम जोखिम या सुरक्षित फंड है। वास्तव में, लीवरेज और शॉर्ट सेलिंग का आक्रामक उपयोग गलत अनुमानों पर भारी नुकसान का कारण बन सकता है।\n\nहेज फंडों में लॉक-इन अवधि, उच्च लागत और सीमित तरलता होती है, जो उन्हें आम खुदरा निवेशकों के लिए पूरी तरह अनुपयुक्त बनाती है। आम निवेशकों के लिए कम लागत वाले इंडेक्स फंड सर्वश्रेष्ठ होते हैं।\n\nहेज फंड विशेष और उच्च जोखिम वाले निजी फंड हैं जो सभी बाजार परिस्थितियों में पूर्ण रिटर्न हासिल करने के लिए जटिल रणनीतियों का उपयोग करते हैं।`,
        keyTakeaway: 'हेज फंड विशेष, उच्च-न्यूनतम फंड हैं जो सभी बाजार स्थितियों में रिटर्न पाने के लिए लीवरेज का उपयोग करते हैं।'
      },
      kn: {
        videoUrl: '/academy/kn/hedge-fund.mp4',
        thumbnailUrl: '/academy/kn/hedge-fund.webp',
        captionUrl: '/academy/kn/hedge-fund.vtt',
        transcript: `ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆಯನ್ನು ನಿಯಂತ್ರಿಸುವ ಹೆಡ್ಜ್ ಫಂಡ್‌ಗಳ ಬಗ್ಗೆ ನೀವು ಕೇಳಿರಬಹುದು. ಆದರೆ ಅವು ಸಾಮಾನ್ಯ ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗಳಿಗಿಂತ ಹೇಗೆ ಭಿನ್ನವಾಗಿವೆ?\n\nಹೆಡ್ಜ್ ಫಂಡ್ ಎನ್ನುವುದು ದೊಡ್ಡ ಸಾಂಸ್ಥಿಕ ಹೂಡಿಕೆದಾರರು ಮತ್ತು ಶ್ರೀಮಂತ ವ್ಯಕ್ತಿಗಳಿಗಾಗಿ ರೂಪಿಸಲಾದ ಖಾಸಗಿ ಹೂಡಿಕೆ ನಿಧಿಯಾಗಿದೆ. ಭಾರತದಲ್ಲಿ ಇವು ಸೆಬಿ (SEBI) ಅಡಿಯಲ್ಲಿ ವರ್ಗ III ಪರ್ಯಾಯ ಹೂಡಿಕೆ ನಿಧಿಗಳಾಗಿ (AIFs) ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ.

ಸಾಮಾನ್ಯ ಫಂಡ್‌ಗಳಿಗಿಂತ ಭಿನ್ನವಾಗಿ, ಹೆಡ್ಜ್ ಫಂಡ್‌ಗಳು ಮಾರುಕಟ್ಟೆ ಏರಿದಾಗಲೂ ಮತ್ತು ಇಳಿದಾಗಲೂ ಲಾಭ ಗಳಿಸಲು ಸಂಕೀರ್ಣ ಮತ್ತು ಆಕ್ರಮಣಕಾರಿ ತಂತ್ರಗಳನ್ನು ಬಳಸುತ್ತವೆ.\n\nಹೆಡ್ಜ್ ಫಂಡ್ ಮ್ಯಾನೇಜರ್‌ಗಳು ಬಳಸುವ ತಂತ್ರಗಳು:
1. ಲಾಂಗ್ ಮತ್ತು ಶಾರ್ಟ್ ಪೊಸಿಷನ್‌ಗಳು: ಕಡಿಮೆ ಬೆಲೆಯ ಷೇರುಗಳನ್ನು ಖರೀದಿಸುವುದು ಮತ್ತು ಅತಿ ಹೆಚ್ಚು ಬೆಲೆಯ ಷೇರುಗಳನ್ನು ಶಾರ್ಟ್-ಸೆಲ್ ಮಾಡಿ ಬೆಲೆ ಇಳಿದಾಗ ಲಾಭ ಗಳಿಸುವುದು.
2. ಫೈನಾನ್ಷಿಯಲ್ ಲಿವರೇಜ್: ದೊಡ್ಡ ಪ್ರಮಾಣದ ವಹಿವಾಟು ನಡೆಸಲು ಸಾಲದ ಬಂಡವಾಳವನ್ನು ಬಳಸುವುದು.
3. ಡೆರಿವೇಟಿವ್ಸ್ ಮತ್ತು ಆರ್ಬಿಟ್ರೇಜ್: ಆಪ್ಷನ್ಸ್ ಮತ್ತು ಫ್ಯೂಚರ್ಸ್ ಮೂಲಕ ಅಪಾಯವನ್ನು ನಿಯಂತ್ರಿಸುವುದು.

ಭಾರತದಲ್ಲಿ ಇವುಗಳಿಗೆ ಕನಿಷ್ಠ ₹1 ಕೋಟಿ ಹೂಡಿಕೆ ಅಗತ್ಯವಿರುತ್ತದೆ. ಇವುಗಳ ಶುಲ್ಕವು ಸಾಮಾನ್ಯವಾಗಿ '2 ಮತ್ತು 20' ಮಾದರಿಯಾಗಿರುತ್ತದೆ (2% ನಿರ್ವಹಣಾ ಶುಲ್ಕ ಮತ್ತು 20% ಲಾಭದ ಶುಲ್ಕ).\n\n'ಹೆಡ್ಜ್' ಎಂದರೆ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ ಎಂಬುದು ತಪ್ಪು ಕಲ್ಪನೆ. ಲಿವರೇಜ್ ಮತ್ತು ಶಾರ್ಟ್ ಸೆಲ್ಲಿಂಗ್ ತಪ್ಪು ಲೆಕ್ಕಾಚಾರವಾದರೆ ಭಾರೀ ನಷ್ಟಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು.\n\nಲಾಕ್-ಇನ್ ಅವಧಿ ಮತ್ತು ಹೆಚ್ಚಿನ ವೆಚ್ಚದ ಕಾರಣ ಇವು ಸಾಮಾನ್ಯ ಚಿಲ್ಲರೆ ಹೂಡಿಕೆದಾರರಿಗೆ ಸೂಕ್ತವಲ್ಲ. ಸಾಮಾನ್ಯ ಹೂಡಿಕೆದಾರರಿಗೆ ಕಡಿಮೆ ವೆಚ್ಚದ ಇಂಡೆಕ್ಸ್ ಫಂಡ್‌ಗಳೇ ಅತ್ಯುತ್ತಮ.\n\nಹೆಡ್ಜ್ ಫಂಡ್‌ಗಳು ಹೆಚ್ಚಿನ ಅಪಾಯ ಮತ್ತು ಸಂಕೀರ್ಣ ತಂತ್ರಗಳನ್ನು ಬಳಸುವ ದೊಡ್ಡ ಹೂಡಿಕೆದಾರರ ವಿಶೇಷ ನಿಧಿಗಳಾಗಿವೆ.`,
        keyTakeaway: 'ಹೆಡ್ಜ್ ಫಂಡ್‌ಗಳು ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಲಾಭ ಗಳಿಸಲು ಲಿವರೇಜ್ ಬಳಸುವ ವಿಶೇಷ ಖಾಸಗಿ ನಿಧಿಗಳಾಗಿವೆ.'
      },
      te: {
        videoUrl: '/academy/te/hedge-fund.mp4',
        thumbnailUrl: '/academy/te/hedge-fund.webp',
        captionUrl: '/academy/te/hedge-fund.vtt',
        transcript: `ప్రపంచ ఆర్థిక మార్కెట్లను ప్రభావితం చేసే హెడ్జ్ ఫండ్ల గురించి మీరు వినే ఉంటారు. కానీ అవి సాధారణ మ్యూచువల్ ఫండ్ల కంటే ఎలా భిన్నంగా ఉంటాయి?\n\nహెడ్జ్ ఫండ్ అనేది పెద్ద సంస్థాగత పెట్టుబడిదారులు మరియు సంపన్న వ్యక్తుల కోసం రూపొందించబడిన ప్రైవేట్ పెట్టుబడి నిధి. భారతదేశంలో ఇవి సెబీ (SEBI) పరిధిలోని కేటగిరీ III ప్రత్యామ్నాయ పెట్టుబడి నిధులుగా (AIFs) పనిచేస్తాయి.

సాధారణ ఫండ్లలా కాకుండా, హెడ్జ్ ఫండ్లు మార్కెట్ పెరిగినా, తగ్గినా లాభాలను ఆర్జించడానికి సంక్లిష్టమైన మరియు దూకుడు వ్యూహాలను ఉపయోగిస్తాయి.\n\nహెడ్జ్ ఫండ్ మేనేజర్లు ఉపయోగించే వ్యూహాలు:
1. లాంగ్ మరియు షార్ట్ పొజిషన్లు: తక్కువ ధర ఉన్న షేర్లను కొనడం మరియు అధిక ధర ఉన్న షేర్లను షార్ట్-సెల్ చేసి ధరలు పడిపోయినప్పుడు లాభం పొందడం.
2. ఫైనాన్షియల్ లెవరేజ్: ట్రేడింగ్ పరిమాణాన్ని పెంచడానికి రుణం తీసుకుని పెట్టుబడి పెట్టడం.
3. డెరివేటివ్స్ మరియు ఆర్బిట్రేజ్: ఆప్షన్స్ మరియు ఫ్యూచర్స్ ద్వారా నష్టభయాన్ని నివారించడం.

భారతదేశంలో వీటికి కనీస పెట్టుబడి ₹1 కోటి అవసరం. ఇవి సాధారణంగా '2 మరియు 20' మోడల్ ఫీజులను వసూలు చేస్తాయి (2% నిర్వహణ రుసుము మరియు 20% లాభాల రుసుము).\n\n'హెడ్జ్' అంటే పూర్తిగా సురక్షితం అనుకోవడం తప్పు. లెవరేజ్ మరియు షార్ట్ సెల్లింగ్ వ్యూహాలు విఫలమైతే భారీ నష్టాలు రావచ్చు.\n\nలాక్-ఇన్ పీరియడ్ మరియు అధిక ఖర్చుల కారణంగా ఇవి సాధారణ రిటైల్ ఇన్వెస్టర్లకు సరిపోవు. సాధారణ ఇన్వెస్టర్లకు తక్కువ ఖర్చుతో కూడిన ఇండెక్స్ ఫండ్లే శ్రేయస్కరం.\n\nహెడ్జ్ ఫండ్లు అధిక నష్టభయం మరియు సంక్లిష్ట వ్యూహాలను ఉపయోగించే పెద్ద పెట్టుబడిదారుల ప్రత్యేక నిధులు.`,
        keyTakeaway: 'హెడ్జ్ ఫండ్లు అన్ని మార్కెట్ పరిస్థితుల్లో రాబడులను సాధించడానికి లెవరేజ్ ఉపయోగించే ప్రత్యేక ప్రైవేట్ నిధులు.'
      },
      ta: {
        videoUrl: '/academy/ta/hedge-fund.mp4',
        thumbnailUrl: '/academy/ta/hedge-fund.webp',
        captionUrl: '/academy/ta/hedge-fund.vtt',
        transcript: `உலகளாவிய நிதிச் சந்தைகளை ஆட்டிப்படைக்கும் ஹெட்ஜ் ஃபண்டுகள் பற்றி நீங்கள் கேள்விப்பட்டிருக்கலாம். ஆனால் அவை சாதாரண மியூச்சுவல் ஃபண்டுகளிலிருந்து எவ்வாறு வேறுபடுகின்றன?\n\nஹெட்ஜ் ஃபண்ட் என்பது பெரிய நிறுவன முதலீட்டாளர்கள் மற்றும் பெரும் பணக்காரர்களுக்காக வடிவமைக்கப்பட்ட ஒரு பிரத்யேக முதலீட்டு நிதியாகும். இந்தியாவில் இவை செபி (SEBI) ஒழுங்குமுறையின் கீழ் வகை III மாற்று முதலீட்டு நிதிகளாக (AIFs) செயல்படுகின்றன.

சாதாரண ஃபண்டுகளைப் போலன்றி, ஹெட்ஜ் ஃபண்டுகள் சந்தை ஏறும்போதும் இறங்கும்போதும் லாபம் ஈட்ட அதிநவீன மற்றும் ஆக்ரோஷமான உத்திகளைப் பயன்படுத்துகின்றன.\n\nஹெட்ஜ் ஃபண்ட் மேலாளர்கள் பயன்படுத்தும் உத்திகள்:
1. லாங் மற்றும் ஷார்ட் பொசிஷன்கள்: குறைந்த விலை பங்குகளை வாங்குவது மற்றும் அதிக விலை பங்குகளை ஷார்ட்-செல் செய்து விலை சரியும்போது லாபம் பெறுவது.
2. பைனான்சியல் லீவரேஜ்: அதிக அளவில் வர்த்தகம் செய்ய கடன் நிதியைப் பயன்படுத்துவது.
3. டெரிவேடிவ்ஸ் மற்றும் ஆர்பிட்ரேஜ்: ஆபத்தைக் குறைக்க ஆப்ஷன்ஸ் மற்றும் ஃபியூச்சர்ஸ்களைப் பயன்படுத்துவது.

இந்தியாவில் இதில் முதலீடு செய்ய குறைந்தபட்சம் ₹1 கோடி தேவை. இவற்றின் கட்டணம் பொதுவாக '2 மற்றும் 20' மாதிரியாக இருக்கும் (2% மேலாண்மைக் கட்டணம் மற்றும் 20% லாபக் கட்டணம்).\n\n'ஹெட்ஜ்' என்றால் முற்றிலும் பாதுகாப்பானது என்பது தவறு. லீவரேஜ் மற்றும் ஷார்ட் செல்லிங் உத்திகள் தவறினால் மிகப்பெரிய இழப்பு ஏற்படலாம்.\n\nலாக்-இன் காலம் மற்றும் அதிகக் கட்டணங்கள் காரணமாக இவை சாதாரண சில்லறை முதலீட்டாளர்களுக்குப் பொருந்தாது. சாதாரண முதலீட்டாளர்களுக்கு குறைந்த கட்டண இன்டெக்ஸ் ஃபண்டுகளே சிறந்தது.\n\nஹெட்ஜ் ஃபண்டுகள் அதிக ஆபத்து மற்றும் சிக்கலான உத்திகளைப் பயன்படுத்தும் பெரும் முதலீட்டாளர்களின் சிறப்பு நிதிகள்.`,
        keyTakeaway: 'ஹெட்ஜ் ஃபண்டுகள் அனைத்து சந்தை நிலைகளிலும் லாபம் ஈட்ட லீவரேஜைப் பயன்படுத்தும் சிறப்புத் தனியார் நிதிகள்.'
      },
      ml: {
        videoUrl: '/academy/ml/hedge-fund.mp4',
        thumbnailUrl: '/academy/ml/hedge-fund.webp',
        captionUrl: '/academy/ml/hedge-fund.vtt',
        transcript: `ആഗോള സാമ്പത്തിക വിപണികളെ സ്വാധീനിക്കുന്ന ഹെഡ്ജ് ഫണ്ടുകളെക്കുറിച്ച് നിങ്ങൾ കേട്ടിട്ടുണ്ടാകും. എന്നാൽ അവ സാധാരണ മ്യൂച്വൽ ഫണ്ടുകളിൽ നിന്ന് എങ്ങനെ വ്യത്യാസപ്പെട്ടിരിക്കുന്നു?\n\nവൻകിട സ്ഥാപനങ്ങൾക്കും സമ്പന്നരായ വ്യക്തികൾക്കുമായി രൂപകൽപ്പന ചെയ്തിട്ടുള്ള സ്വകാര്യ നിക്ഷേപ ഫണ്ടാണ് ഹെഡ്ജ് ഫണ്ട്. ഇന്ത്യയിൽ ഇവ സെബി (SEBI) നിയന്ത്രണത്തിലുള്ള കാറ്റഗറി III ആൾട്ടർനേറ്റീവ് ഇൻവെസ്റ്റ്‌മെന്റ് ഫണ്ടുകളായി (AIFs) പ്രവർത്തിക്കുന്നു.

സാധാരണ ഫണ്ടുകളിൽ നിന്ന് വ്യത്യസ്തമായി, വിപണി കയറുമ്പോഴും ഇറങ്ങുമ്പോഴും ലാഭമുണ്ടാക്കാൻ സങ്കീർണ്ണവും ശക്തവുമായ തന്ത്രങ്ങൾ ഹെഡ്ജ് ഫണ്ടുകൾ ഉപയോഗിക്കുന്നു.\n\nഹെഡ്ജ് ഫണ്ട് മാനേജർമാർ ഉപയോഗിക്കുന്ന രീതികൾ:
1. ലോംഗ് & ഷോർട്ട് പൊസിഷനുകൾ: കുറഞ്ഞ വിലയുള്ള ഓഹരികൾ വാങ്ങുകയും കൂടിയ വിലയുള്ളവ ഷോർട്ട്-സെൽ ചെയ്ത് വില ഇടിയുമ്പോൾ ലാഭമുണ്ടാക്കുകയും ചെയ്യുക.
2. ഫിനാൻഷ്യൽ ലിവറേജ്: വലിയ ഇടപാടുകൾ നടത്താൻ വായ്പാ തുക ഉപയോഗിക്കുക.
3. ഡെറിവേറ്റീവ്സ് & ആർബിട്രേജ്: ഓപ്ഷനുകൾ, ഫ്യൂച്ചറുകൾ എന്നിവ വഴി റിസ്ക് നിയന്ത്രിക്കുക.

ഇന്ത്യയിൽ ഇതിൽ നിക്ഷേപിക്കാൻ കുറഞ്ഞത് ₹1 കോടി ആവശ്യമാണ്. ഫീസ് സാധാരണയായി '2 & 20' മോഡൽ ആയിരിക്കും (2% മാനേജ്‌മെന്റ് ഫീസും 20% പെർഫോമൻസ് ഫീസും).\n\n'ഹെഡ്ജ്' എന്നാൽ പൂർണ്ണ സുരക്ഷിതം എന്ന് തെറ്റിദ്ധരിക്കരുത്. ലിവറേജും ഷോർട്ട് സെല്ലിംഗും പിഴച്ചാൽ വൻ നഷ്ടം വരാം.\n\nലോക്ക്-ഇൻ കാലയളവും ഉയർന്ന ചിലവുകളും ഉള്ളതിനാൽ സാധാരണ ചെറുകിട നിക്ഷേപകർക്ക് ഇവ അനുയോജ്യമല്ല. സാധാരണക്കാർക്ക് ഇൻഡക്സ് ഫണ്ടുകളാണ് ഏറ്റവും മികച്ചത്.\n\nഹെഡ്ജ് ഫണ്ടുകൾ ഉയർന്ന റിസ്കും സങ്കീർണ്ണമായ തന്ത്രങ്ങളും ഉപയോഗിക്കുന്ന വലിയ നിക്ഷേപകരുടെ പ്രത്യേക ഫണ്ടുകളാണ്.`,
        keyTakeaway: 'എല്ലാ വിപണി സാഹചര്യങ്ങളിലും നേട്ടമുണ്ടാക്കാൻ ലിവറേജ് ഉപയോഗിക്കുന്ന പ്രത്യേക സ്വകാര്യ ഫണ്ടുകളാണ് ഹെഡ്ജ് ഫണ്ടുകൾ.'
      },
      mr: {
        videoUrl: '/academy/mr/hedge-fund.mp4',
        thumbnailUrl: '/academy/mr/hedge-fund.webp',
        captionUrl: '/academy/mr/hedge-fund.vtt',
        transcript: `तुम्ही जागतिक बाजारावर प्रभाव टाकणाऱ्या हेज फंडांबद्दल ऐकले असेल. पण ते सामान्य म्युच्युअल फंडांपेक्षा कसे वेगळे असतात?\n\nहेज फंड हा मोठ्या संस्थात्मक गुंतवणूकदारांसाठी आणि अतिश्रीमंत व्यक्तींसाठी तयार केलेला खाजगी गुंतवणूक फंड आहे. भारतात हे सेबीच्या (SEBI) श्रेणी III पर्यायी गुंतवणूक फंड (AIFs) म्हणून काम करतात.

सामान्य फंडांच्या विपरीत, हेज फंड बाजार वाढताना आणि घसरताना दोन्ही वेळेस नफा मिळवण्यासाठी अत्याधुनिक आणि आक्रमक रणनीती वापरतात.\n\nहेज फंड मॅनेजर्स वापरत असलेल्या रणनीती:
1. लाँग आणि शॉर्ट पोझिशन्स: कमी मूल्याचे शेअर्स खरेदी करणे आणि जास्त मूल्याचे शेअर्स शॉर्ट-सेल करून किंमत घसरल्यावर नफा मिळवणे.
2. फायनान्शियल लिव्हरेज: मोठ्या प्रमाणावर सौदे करण्यासाठी कर्ज घेणे.
3. डेरिव्हेटिव्ह्ज आणि आर्बिट्राज: जोखीम व्यवस्थापनासाठी ऑप्शन्स आणि फ्युचर्सचा वापर.

भारतात यात गुंतवणुकीसाठी किमान ₹1 कोटी लागतात. यांचे शुल्क साधारणपणे '2 आणि 20' मॉडेलवर असते (2% व्यवस्थापन शुल्क आणि 20% नफ्यावरील शुल्क).\n\n'हेज' म्हणजे पूर्ण सुरक्षित असा गैरसमज नसावा. लिव्हरेज आणि शॉर्ट सेलिंग अंदाज चुकल्यास मोठे नुकसान करू शकतात.\n\nलॉक-इन कालावधी आणि जास्त खर्चामुळे हे सामान्य किरकोळ गुंतवणूकदारांसाठी योग्य नसतात. सामान्य गुंतवणूकदारांसाठी इंडेक्स फंड सर्वोत्तम आहेत.\n\nहेज फंड हे जास्त जोखीम आणि गुंतागुंतीच्या रणनीती वापरणारे मोठ्या गुंतवणूकदारांचे विशेष फंड आहेत.`,
        keyTakeaway: 'हेज फंड हे सर्व बाजाराच्या परिस्थितीत परतावा मिळवण्यासाठी लिव्हरेज वापरणारे विशेष खाजगी फंड आहेत.'
      },
      bn: {
        videoUrl: '/academy/bn/hedge-fund.mp4',
        thumbnailUrl: '/academy/bn/hedge-fund.webp',
        captionUrl: '/academy/bn/hedge-fund.vtt',
        transcript: `বিশ্বের অর্থনৈতিক বাজারকে প্রভাবিত করা হেজ ফান্ডের কথা হয়তো আপনি শুনেছেন। কিন্তু সাধারণ মিউচুয়াল ফান্ড থেকে এগুলো কীভাবে আলাদা?\n\nহেজ ফান্ড হলো বৃহৎ প্রাতিষ্ঠানিক বিনিয়োগকারী এবং উচ্চবিত্ত ব্যক্তিদের জন্য তৈরি একটি বিশেষ ব্যক্তিগত বিনিয়োগ ফান্ড। ভারতে এগুলো সেবি (SEBI)-এর ক্যাটাগরি III অল্টারনেটিভ ইনভেস্টমেন্ট ফান্ড (AIFs) হিসেবে পরিচালিত হয়।

সাধারণ ফান্ডের মতো নয়, হেজ ফান্ড বাজার বৃদ্ধি ও পতন উভয় পরিস্থিতিতেই মুনাফা অর্জনের জন্য অত্যন্ত আক্রমণাত্মক ও জটিল কৌশল ব্যবহার করে।\n\nহেজ ফান্ড ম্যানেজারদের ব্যবহৃত কৌশলসমূহ:
১. লং ও শর্ট পজিশন: কম দামের শেয়ার কেনা এবং অতিরিক্ত মূল্যের শেয়ার শর্ট-সেল করে দাম কমলে লাভ করা।
২. ফাইন্যান্সিয়াল লিভারেজ: বড় পরিসরে ট্রেড করার জন্য ধার করা অর্থ ব্যবহার করা।
৩. ডেরিভেটিভস ও আরবিট্রেজ: ঝুঁকি নিয়ন্ত্রণের জন্য অপশনস ও ফিউচার্স ব্যবহার করা।

ভারতে এতে বিনিয়োগের জন্য ন্যূনতম ₹১ কোটি টাকার প্রয়োজন হয়। এর ফি সাধারণত '২ এবং ২০' মডেলের হয় (২% ম্যানেজমেন্ট ফি এবং ২০% লাভের অংশ)।\n\n'হেজ' মানেই সম্পূর্ণ ঝুঁকিমুক্ত বলে মনে করা ভুল। লিভারেজ ও শর্ট সেলিং ভুল হলে ব্যাপক ক্ষতি হতে পারে।\n\nলক-ইন পিরিয়ড এবং উচ্চ খরচের কারণে সাধারণ বিনিয়োগকারীদের জন্য এটি উপযুক্ত নয়। সাধারণ বিনিয়োগকারীদের জন্য কম খরচের ইনডেক্স ফান্ডই সেরা।\n\nহেজ ফান্ড হলো উচ্চ ঝুঁকি ও জটিল কৌশল ব্যবহারকারী ধনী বিনিয়োগকারীদের বিশেষ ফান্ড।`,
        keyTakeaway: 'হেজ ফান্ড হলো সব ধরনের বাজার পরিস্থিতিতে রিটার্ন পাওয়ার জন্য লিভারেজ ব্যবহারকারী বিশেষ ব্যক্তিগত ফান্ড।'
      },
    }
  },
  // ── 11. RISK, RETURN & DIVERSIFICATION ──
  {
    id: 'risk-return-diversification',
    number: 11,
    title: 'Risk, Return & Diversification',
    category: 'Core Principles',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/diversification.mp4',
    thumbnailUrl: '/academy/diversification.webp',
    description: 'The inescapable link between risk and return, concentration danger, and multi-asset diversification as a risk management shield.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for Risk, Return & Diversification. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `Is there any way to achieve high investment returns with zero risk? In financial economics, the answer is an absolute and definitive no.\n\nThere is a fundamental law in investing that every beginner must internalize: Risk and Potential Return are inseparable sides of the same coin.

If an investment offers high return potential—such as small-cap equities or tech startups—it unavoidably carries higher volatility and risk of capital loss. Conversely, low-risk instruments like government treasury bills offer safety, but their returns may barely keep up with inflation after taxes.\n\nIf you cannot eliminate risk, how do you manage it? The answer is Diversification—often called the only 'free lunch' in finance.

Diversification means spreading your capital across different asset classes, sectors, and geographies so that a negative event in one area does not destroy your overall financial health.
Consider three layers of smart diversification:
First, Asset Class Diversification: holding a balanced mix of Equities for growth, Debt for stability, and Gold for inflation protection.
Second, Sector Diversification: spreading stock investments across Banking, IT, Pharma, Auto, and FMCG so an industry slump does not derail your portfolio.
Third, Geographic Diversification: investing in both Indian and international markets to balance currency and regional economic cycles.\n\nA widespread misunderstanding is thinking that buying 10 different technology stocks means you are diversified. If the tech sector declines, all 10 will fall together! Genuine diversification requires holding uncorrelated assets.\n\nKeep in mind that diversification cannot eliminate systemic market-wide risk during broad economic recessions, but it successfully shields you from catastrophic single-company collapse.\n\nRisk and return are always connected; spreading your investments thoughtfully across diverse asset classes protects your wealth and ensures steady progress.`,
    learningPoints: [
      "Risk and potential return are inextricably linked; no investment is completely risk-free.",
      "Concentration risk: the danger of putting all savings into a single company or sector.",
      "Three layers of diversification: Asset Classes, Industry Sectors, and Geographies.",
      "Diversification protects against single-event collapse while capturing overall economic growth."
],
    keyTakeaway: 'You cannot eliminate risk, but smart diversification balances risk and return across asset classes.',
    quiz: [
      {
            "id": "q11-1",
            "question": "What does the fundamental risk-return relationship state?",
            "options": [
                  "High potential returns can easily be achieved with zero risk.",
                  "Higher potential returns are inextricably linked with higher risk and volatility of capital.",
                  "Risk only exists in foreign stock markets.",
                  "All investments carry identical risk."
            ],
            "correctAnswer": 1,
            "explanation": "In financial economics, taking higher potential returns requires accepting higher uncertainty or volatility of capital."
      },
      {
            "id": "q11-2",
            "question": "How does multi-asset diversification protect an investment portfolio?",
            "options": [
                  "By ensuring that all assets rise simultaneously every day.",
                  "By spreading capital across uncorrelated asset classes (Equities, Debt, Gold) so that a downturn in one area does not destroy overall wealth.",
                  "By eliminating all government taxes.",
                  "By guaranteeing 20% annual returns."
            ],
            "correctAnswer": 1,
            "explanation": "Diversification across asset classes cushions portfolio volatility and shields investors from catastrophic single-event losses."
      }
],
    relatedLessons: ["why-long-term-investing", "what-is-an-etf", "how-to-start-investing"],
    vestiqPrompt: 'How should a beginner balance equities, debt, and gold across their portfolio?',
    languages: {
      en: {
        videoUrl: '/academy/en/diversification.mp4',
        thumbnailUrl: '/academy/en/diversification.webp',
        captionUrl: '/academy/en/diversification.vtt',
        transcript: `Is there any way to achieve high investment returns with zero risk? In financial economics, the answer is an absolute and definitive no.\n\nThere is a fundamental law in investing that every beginner must internalize: Risk and Potential Return are inseparable sides of the same coin.

If an investment offers high return potential—such as small-cap equities or tech startups—it unavoidably carries higher volatility and risk of capital loss. Conversely, low-risk instruments like government treasury bills offer safety, but their returns may barely keep up with inflation after taxes.\n\nIf you cannot eliminate risk, how do you manage it? The answer is Diversification—often called the only 'free lunch' in finance.

Diversification means spreading your capital across different asset classes, sectors, and geographies so that a negative event in one area does not destroy your overall financial health.
Consider three layers of smart diversification:
First, Asset Class Diversification: holding a balanced mix of Equities for growth, Debt for stability, and Gold for inflation protection.
Second, Sector Diversification: spreading stock investments across Banking, IT, Pharma, Auto, and FMCG so an industry slump does not derail your portfolio.
Third, Geographic Diversification: investing in both Indian and international markets to balance currency and regional economic cycles.\n\nA widespread misunderstanding is thinking that buying 10 different technology stocks means you are diversified. If the tech sector declines, all 10 will fall together! Genuine diversification requires holding uncorrelated assets.\n\nKeep in mind that diversification cannot eliminate systemic market-wide risk during broad economic recessions, but it successfully shields you from catastrophic single-company collapse.\n\nRisk and return are always connected; spreading your investments thoughtfully across diverse asset classes protects your wealth and ensures steady progress.`,
        keyTakeaway: 'You cannot eliminate risk, but smart diversification balances risk and return across asset classes.'
      },
      hi: {
        videoUrl: '/academy/hi/diversification.mp4',
        thumbnailUrl: '/academy/hi/diversification.webp',
        captionUrl: '/academy/hi/diversification.vtt',
        transcript: `क्या बिना किसी जोखिम के बहुत अधिक निवेश रिटर्न पाने का कोई तरीका है? वित्तीय अर्थशास्त्र में इसका उत्तर बिल्कुल और स्पष्ट रूप से 'नहीं' है।\n\nनिवेश में एक बुनियादी नियम है जिसे हर नए निवेशक को गहराई से समझना चाहिए: जोखिम और संभावित रिटर्न एक ही सिक्के के दो पहलू हैं।

यदि कोई निवेश उच्च रिटर्न की संभावना प्रदान करता है—जैसे स्मॉल-कैप शेयर या स्टार्टअप्स—तो उसमें पूंजी के नुकसान और अस्थिरता का जोखिम भी अधिक होता है। इसके विपरीत, सरकारी ट्रेजरी बिल या बैंक एफडी जैसे कम जोखिम वाले साधन सुरक्षा प्रदान करते हैं, लेकिन करों के बाद उनका रिटर्न महंगाई के बराबर भी मुश्किल से रह पाता है।\n\nयदि आप जोखिम को खत्म नहीं कर सकते, तो इसे प्रबंधित कैसे करें? इसका उत्तर है विविधीकरण (Diversification)—जिसे वित्त में 'मुफ्त भोजन' कहा जाता है।

विविधीकरण का अर्थ है अपने धन को विभिन्न परिसंपत्ति वर्गों, उद्योगों और क्षेत्रों में फैलाना ताकि किसी एक हिस्से में गिरावट आपके पूरे वित्तीय स्वास्थ्य को नुकसान न पहुंचाए।
समझदारी भरे विविधीकरण के तीन स्तरों पर विचार करें:
पहला, एसेट क्लास विविधीकरण: विकास के लिए इक्विटी, स्थिरता के लिए डेट, और महंगाई से सुरक्षा के लिए सोने का संतुलित मिश्रण।
दूसरा, सेक्टर विविधीकरण: अपने शेयरों को बैंकिंग, आईटी, फार्मा, ऑटो और एफएमसीजी में फैलाना ताकि किसी एक उद्योग की मंदी आपके पोर्टफोलियो को न बिगाड़े।
तीसरा, भौगोलिक विविधीकरण: मुद्रा और क्षेत्रीय आर्थिक चक्रों को संतुलित करने के लिए भारतीय और अंतरराष्ट्रीय दोनों बाजारों में निवेश करना।\n\nएक आम गलतफहमी यह सोचना है कि 10 अलग-अलग टेक कंपनियों के शेयर खरीदने से आप विविधीकृत हो गए। यदि टेक सेक्टर गिरता है, तो वे सभी 10 एक साथ गिरेंगे! वास्तविक विविधीकरण के लिए असंबंधित संपत्तियों की आवश्यकता होती है।\n\nयाद रखें कि विविधीकरण व्यापक आर्थिक मंदी के दौरान पूरे बाजार के प्रणालीगत जोखिम को खत्म नहीं कर सकता, लेकिन यह किसी एक कंपनी के डूबने से होने वाले विनाश से बचाता है।\n\nजोखिम और रिटर्न हमेशा जुड़े होते हैं; अपने निवेश को विभिन्न परिसंपत्तियों में समझदारी से फैलाना आपकी पूंजी की रक्षा करता है और निरंतर प्रगति सुनिश्चित करता है।`,
        keyTakeaway: 'आप जोखिम को पूरी तरह खत्म नहीं कर सकते, लेकिन विविधीकरण परिसंपत्ति वर्गों में जोखिम और रिटर्न को संतुलित करता है।'
      },
      kn: {
        videoUrl: '/academy/kn/diversification.mp4',
        thumbnailUrl: '/academy/kn/diversification.webp',
        captionUrl: '/academy/kn/diversification.vtt',
        transcript: `ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲದೆ ಅತಿ ಹೆಚ್ಚಿನ ಹೂಡಿಕೆ ಲಾಭ ಪಡೆಯಲು ಸಾಧ್ಯವೇ? ಹಣಕಾಸು ಅರ್ಥಶಾಸ್ತ್ರದಲ್ಲಿ ಇದಕ್ಕೆ ಉತ್ತರ ಖಚಿತವಾಗಿ 'ಇಲ್ಲ'.\n\nಪ್ರತಿಯೊಬ್ಬ ಹೊಸ ಹೂಡಿಕೆದಾರರು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬೇಕಾದ ಮೂಲ ನಿಯಮ: ಅಪಾಯ (Risk) ಮತ್ತು ಸಂಭಾವ್ಯ ಲಾಭ (Return) ಒಂದೇ ನಾಣ್ಯದ ಎರಡು ಮುಖಗಳು.

ಹೆಚ್ಚಿನ ಲಾಭದ ನಿರೀಕ್ಷೆಯಿರುವ ಹೂಡಿಕೆಗಳಲ್ಲಿ (ಉದಾಹರಣೆಗೆ ಸ್ಮಾಲ್-ಕ್ಯಾಪ್ ಷೇರುಗಳು) ನಷ್ಟದ ಅಪಾಯವೂ ಹೆಚ್ಚಿರುತ್ತದೆ. ಅದೇ ರೀತಿ ಬ್ಯಾಂಕ್ ಎಫ್‌ಡಿ ಅಥವಾ ಟ್ರೆಷರಿ ಬಿಲ್‌ಗಳು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ, ಆದರೆ ಅವುಗಳ ಲಾಭ ಹಣದುಬ್ಬರವನ್ನು ಮೀರಿಸಲು ಕಷ್ಟವಾಗುತ್ತದೆ.\n\nಅಪಾಯವನ್ನು ನಿರ್ವಹಿಸುವುದು ಹೇಗೆ? ಇದಕ್ಕೆ ಪರಿಹಾರವೇ ವೈವಿಧ್ಯೀಕರಣ (Diversification).

ವೈವಿಧ್ಯೀಕರಣ ಎಂದರೆ ನಿಮ್ಮ ಹಣವನ್ನು ವಿವಿಧ ಆಸ್ತಿಗಳು ಮತ್ತು ವಲಯಗಳಲ್ಲಿ ಹಂಚುವುದು, ಇದರಿಂದ ಒಂದು ಕಡೆ ನಷ್ಟವಾದರೂ ಇಡೀ ಬಂಡವಾಳ ನಾಶವಾಗುವುದಿಲ್ಲ.
ಮೂರು ಹಂತದ ವೈವಿಧ್ಯೀಕರಣ:
1. ಆಸ್ತಿ ವರ್ಗ ವೈವಿಧ್ಯೀಕರಣ: ಬೆಳವಣಿಗೆಗೆ ಈಕ್ವಿಟಿ, ಸ್ಥಿರತೆಗೆ ಡೆಟ್, ಮತ್ತು ರಕ್ಷಣೆಗೆ ಚಿನ್ನದ ಸಮತೋಲನ.
2. ವಲಯ ವೈವಿಧ್ಯೀಕರಣ: ಬ್ಯಾಂಕಿಂಗ್, ಐಟಿ, ಫಾರ್ಮಾ, ಆಟೋ ಮುಂತಾದ ವಿವಿಧ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಷೇರುಗಳನ್ನು ಹಂಚುವುದು.
3. ಭೌಗೋಳಿಕ ವೈವಿಧ್ಯೀಕರಣ: ಭಾರತೀಯ ಮತ್ತು ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದು.\n\n10 ಬೇರೆ ಬೇರೆ ಟೆಕ್ ಕಂಪನಿಗಳ ಷೇರು ಕೊಂಡರೆ ವೈವಿಧ್ಯತೆ ಸಿಗುತ್ತದೆ ಎಂಬುದು ತಪ್ಪು. ಟೆಕ್ ಕ್ಷೇತ್ರ ಕುಸಿದರೆ ಎಲ್ಲವೂ ಒಟ್ಟಿಗೆ ಇಳಿಯುತ್ತವೆ! ಪರಸ್ಪರ ಸಂಬಂಧವಿಲ್ಲದ ಆಸ್ತಿಗಳನ್ನು ಹೊಂದುವುದೇ ನಿಜವಾದ ವೈವಿಧ್ಯತೆ.\n\nವೈವಿಧ್ಯೀಕರಣವು ಸಂಪೂರ್ಣ ಮಾರುಕಟ್ಟೆ ಕುಸಿತವನ್ನು ತಡೆಯಲಾರದು, ಆದರೆ ಒಂದೇ ಕಂಪನಿಯ ವೈಫಲ್ಯದ ಅಪಾಯದಿಂದ ರಕ್ಷಿಸುತ್ತದೆ.\n\nಅಪಾಯ ಮತ್ತು ಲಾಭ ಪರಸ್ಪರ ಜೋಡಿಸಲ್ಪಟ್ಟಿವೆ; ನಿಮ್ಮ ಹೂಡಿಕೆಯನ್ನು ವಿವಿಧ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಜಾಣ್ಮೆಯಿಂದ ಹಂಚುವುದೇ ಬಂಡವಾಳ ರಕ್ಷಣೆಗೆ ದಾರಿ.`,
        keyTakeaway: 'ಅಪಾಯವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಇಲ್ಲವಾಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ, ಆದರೆ ವೈವಿಧ್ಯೀಕರಣವು ಅಪಾಯ ಮತ್ತು ಲಾಭವನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.'
      },
      te: {
        videoUrl: '/academy/te/diversification.mp4',
        thumbnailUrl: '/academy/te/diversification.webp',
        captionUrl: '/academy/te/diversification.vtt',
        transcript: `ఎటువంటి రిస్క్ లేకుండా భారీ రాబడులను పొందడం సాధ్యమేనా? ఆర్థిక శాస్త్రంలో దీనికి సమాధానం ఖచ్చితంగా 'లేదు'.\n\nప్రతి కొత్త పెట్టుబడిదారుడు అర్థం చేసుకోవలసిన ప్రాథమిక నియమం: రిస్క్ (Risk) మరియు సంభావ్య రాబడి (Return) ఒకే నాణేనికి రెండు ముఖాలు.

అధిక రాబడిని ఆశించే పెట్టుబడులలో (ఉదాహరణకు స్మాల్-క్యాప్ షేర్లు) మూలధన నష్టభయం ఎక్కువగా ఉంటుంది. అదేవిధంగా బ్యాంక్ ఎఫ్‌డీ లేదా ప్రభుత్వ బాండ్లు సురక్షితంగా ఉంటాయి, కానీ వాటి రాబడి ద్రవ్యోల్బణాన్ని అధిగమించడం కష్టం.\n\nరిస్క్‌ను ఎలా నిర్వహించాలి? దీనికి పరిష్కారమే డైవర్సిఫికేషన్ (Diversification).

డైవర్సిఫికేషన్ అంటే మీ మూలధనాన్ని వివిధ ఆస్తులు మరియు రంగాలలో విస్తరించడం, దీనివల్ల ఒక చోట నష్టం వచ్చినా మొత్తం పెట్టుబడి దెబ్బతినదు.
మూడు స్థాయిల డైవర్సిఫికేషన్:
1. ఆస్తి తరగతి డైవర్సిఫికేషన్: వృద్ధి కోసం ఈక్విటీ, స్థిరత్వం కోసం డెట్, రక్షణ కోసం బంగారం కలయిక.
2. రంగాల డైవర్సిఫికేషన్: బ్యాంకింగ్, ఐటీ, ఫార్మా, ఆటో వంటి విభిన్న రంగాలలో పెట్టుబడులు పెట్టడం.
3. భౌగోళిక డైవర్సిఫికేషన్: భారతీయ మరియు అంతర్జాతీయ మార్కెట్లలో పెట్టుబడి పెట్టడం.\n\n10 వేర్వేరు టెక్ కంపెనీల షేర్లు కొంటే డైవర్సిఫికేషన్ వచ్చినట్లు కాదు. టెక్ రంగం పడిపోతే అన్నీ కలిసే పడతాయి! సంబంధం లేని ఆస్తులలో పెట్టుబడి పెట్టడమే నిజమైన డైవర్సిఫికేషన్.\n\nడైవర్సిఫికేషన్ మొత్తం మార్కెట్ పతనాన్ని ఆపలేకపోయినా, ఒకే కంపెనీ నష్టపోయే ముప్పు నుండి కాపాడుతుంది.\n\nరిస్క్ మరియు రాబడి ఎల్లప్పుడూ ముడిపడి ఉంటాయి; మీ పెట్టుబడులను వివిధ ఆస్తులలో తెలివిగా విస్తరించడమే మూలధన రక్షణకు మార్గం.`,
        keyTakeaway: 'రిస్క్‌ను పూర్తిగా తొలగించలేము, కానీ డైవర్సిఫికేషన్ రిస్క్ మరియు రాబడిని సమతుల్యం చేస్తుంది.'
      },
      ta: {
        videoUrl: '/academy/ta/diversification.mp4',
        thumbnailUrl: '/academy/ta/diversification.webp',
        captionUrl: '/academy/ta/diversification.vtt',
        transcript: `எந்த ஆபத்தும் இல்லாமல் மிக அதிக முதலீட்டு வருமானத்தைப் பெற வழி இருக்கிறதா? நிதிப் பொருளாதாரத்தில் இதற்கு விடை திட்டவட்டமாக 'இல்லை'.\n\nஒவ்வொரு புதிய முதலீட்டாளரும் புரிந்து கொள்ள வேண்டிய அடிப்படை விதி: ஆபத்து (Risk) மற்றும் சாத்தியமான வருமானம் (Return) ஒரே நாணயத்தின் இரு பக்கங்கள்.

அதிக வருமானம் தரும் முதலீடுகளில் (உதாரணமாக ஸ்மால்-கேப் பங்குகள்) மூலதன இழப்புக்கான ஆபத்தும் அதிகமாக இருக்கும். அதேபோல வங்கி எஃப்டி அல்லது அரசுப் பத்திரங்கள் பாதுகாப்பானவை, ஆனால் அவற்றின் வருமானம் பணவீக்கத்தை விஞ்சுவது கடினம்.\n\nஆபத்தை எவ்வாறு நிர்வகிப்பது? இதற்கான தீர்வுதான் பல்வகைப்படுத்தல் (Diversification).

பல்வகைப்படுத்தல் என்பது உங்கள் பணத்தைப் பல சொத்துக்கள் மற்றும் துறைகளில் பிரித்து முதலீடு செய்வதாகும், இதனால் ஒரு பகுதியில் சரிவு ஏற்பட்டாலும் உங்கள் மொத்த சேமிப்பும் பாதிக்கப்படாது.
மூன்று நிலை பல்வகைப்படுத்தல்:
1. சொத்து வகுப்பு பல்வகைப்படுத்தல்: வளர்ச்சிக்கு ஈக்விட்டி, ஸ்திரத்தன்மைக்கு டெப்ட், மற்றும் பாதுகாப்பிற்குத் தங்கம்.
2. துறைசார் பல்வகைப்படுத்தல்: வங்கி, ஐடி, பார்மா, ஆட்டோ போன்ற பல்வேறு துறைகளில் பங்குகளைப் பிரிப்பது.
3. புவியியல் பல்வகைப்படுத்தல்: இந்திய மற்றும் சர்வதேச சந்தைகளில் முதலீடு செய்வது.\n\n10 வெவ்வேறு தொழில்நுட்ப நிறுவனப் பங்குகளை வாங்கினால் பல்வகைப்படுத்தல் ஆகிவிட்டது என்பது தவறு. தொழில்நுட்பத் துறை சரிந்தால் அனைத்தும் ஒன்றாகவே சரியும்! தொடர்பில்லாத சொத்துக்களை வைத்திருப்பதே உண்மையான பல்வகைப்படுத்தல்.\n\nபல்வகைப்படுத்தல் ஒட்டுமொத்த சந்தை வீழ்ச்சியைத் தடுக்க முடியாது, ஆனால் ஒரு நிறுவனம் திவாலாகும் ஆபத்திலிருந்து பாதுகாக்கும்.\n\nஆபத்தும் வருமானமும் எப்போதும் இணைந்தே இருக்கும்; உங்கள் முதலீட்டைப் பல சொத்துக்களில் புத்திசாலித்தனமாகப் பிரிப்பதே மூலதனப் பாதுகாப்பிற்கு வழி.`,
        keyTakeaway: 'ஆபத்தை முழுமையாக நீக்க முடியாது, ஆனால் பல்வகைப்படுத்தல் ஆபத்தையும் வருமானத்தையும் சமநிலைப்படுத்துகிறது.'
      },
      ml: {
        videoUrl: '/academy/ml/diversification.mp4',
        thumbnailUrl: '/academy/ml/diversification.webp',
        captionUrl: '/academy/ml/diversification.vtt',
        transcript: `യാതൊരു റിസ്കും ഇല്ലാതെ ഉയർന്ന നിക്ഷേപ നേട്ടം ഉണ്ടാക്കാൻ വഴിയുണ്ടോ? സാമ്പത്തിക ശാസ്ത്രത്തിൽ ഇതിനുള്ള ഉത്തരം തീർത്തും 'ഇല്ല' എന്നാണ്.\n\nഓരോ പുതിയ നിക്ഷേപകനും മനസ്സിലാക്കേണ്ട അടിസ്ഥാന നിയമം: റിസ്കും (Risk) സാധ്യതയുള്ള നേട്ടവും (Return) ഒരേ നാണയത്തിന്റെ ഇരുവശങ്ങളാണ്.

ഉയർന്ന നേട്ടം വാഗ്ദാനം ചെയ്യുന്ന നിക്ഷേപങ്ങളിൽ (ഉദാഹരണത്തിന് സ്മോൾ-ക്യാപ് ഓഹരികൾ) മൂലധന നഷ്ട സാധ്യതയും കൂടുതലായിരിക്കും. ബാങ്ക് എഫ്ഡി പോലുള്ളവ സുരക്ഷിതമാണെങ്കിലും അവയുടെ നേട്ടത്തിന് പണപ്പെരുപ്പത്തെ മറികടക്കാൻ പ്രയാസമാണ്.\n\nറിസ്ക് എങ്ങനെ കൈകാര്യം ചെയ്യാം? ഇതിനുള്ള ഉത്തരമാണ് വൈവിധ്യവൽക്കരണം (Diversification).

നിങ്ങളുടെ പണം വിവിധ ആസ്തികളിലും മേഖലകളിലുമായി വിഭജിച്ച് നിക്ഷേപിക്കുക, അതുവഴി ഒരു ഭാഗത്ത് നഷ്ടം വന്നാലും മൊത്തം സമ്പാദ്യം തകരില്ല.
മൂന്ന് തലങ്ങളിലുള്ള വൈവിധ്യവൽക്കരണം:
1. അസറ്റ് ക്ലാസ് വൈവിധ്യവൽക്കരണം: വളർച്ചയ്ക്ക് ഇക്വിറ്റി, സ്ഥിരതയ്ക്ക് ഡെറ്റ്, സുരക്ഷയ്ക്ക് സ്വർണ്ണം.
2. മേഖലാ വൈവിധ്യവൽക്കരണം: ബാങ്കിംഗ്, ഐടി, ഫാർമ, ഓട്ടോ തുടങ്ങിയ വ്യത്യസ്ത മേഖലകളിൽ ഓഹരികൾ പങ്കിടുക.
3. ഭൂമിശാസ്ത്രപരമായ വൈവിധ്യവൽക്കരണം: ഇന്ത്യൻ, അന്തർദ്ദേശീയ വിപണികളിൽ നിക്ഷേപിക്കുക.\n\n10 വ്യത്യസ്ത ടെക് കമ്പനികളുടെ ഓഹരികൾ വാങ്ങിയാൽ വൈവിധ്യവൽക്കരണം ആയി എന്ന് കരുതുന്നത് തെറ്റാണ്. ടെക് മേഖല ഇടിഞ്ഞാൽ എല്ലാം ഒരുമിച്ച് താഴേക്ക് പോകും! ബന്ധമില്ലാത്ത ആസ്തികൾ കൈവശം വെക്കുകയാണ് യഥാർത്ഥ വൈവിധ്യവൽക്കരണം.\n\nവൈവിധ്യവൽക്കരണത്തിന് മൊത്തത്തിലുള്ള വിപണി തകർച്ച തടയാനാവില്ലെങ്കിലും ഒരു കമ്പനിയുടെ തകർച്ചയിൽ നിന്ന് സംരക്ഷിക്കും.\n\nറിസ്കും റിട്ടേണും എപ്പോഴും ബന്ധപ്പെട്ടിരിക്കുന്നു; നിങ്ങളുടെ നിക്ഷേപം വിവിധ ആസ്തികളിലായി വിവേകപൂർവ്വം വിഭജിക്കുന്നതാണ് മൂലധന സംരക്ഷണത്തിന് വഴി.`,
        keyTakeaway: 'റിസ്ക് പൂർണ്ണമായി ഒഴിവാക്കാനാവില്ല, എന്നാൽ വൈവിധ്യവൽക്കരണം റിസ്കും റിട്ടേണും തുലനം ചെയ്യുന്നു.'
      },
      mr: {
        videoUrl: '/academy/mr/diversification.mp4',
        thumbnailUrl: '/academy/mr/diversification.webp',
        captionUrl: '/academy/mr/diversification.vtt',
        transcript: `कोणतीही जोखीम न पत्करता खूप मोठा परतावा मिळवण्याचा मार्ग आहे का? अर्थशास्त्रात याचे उत्तर ठामपणे 'नाही' असे आहे.\n\nप्रत्येक नवीन गुंतवणूकदाराने समजून घेण्याचा मूलभूत नियम: जोखीम (Risk) आणि संभाव्य परतावा (Return) ही एकाच नाण्याच्या दोन बाजू आहेत.

जास्त परताव्याची शक्यता असलेल्या गुंतवणुकीत (उदा. स्मॉल-कॅप शेअर्स) भांडवली नुकसानीची जोखीमही जास्त असते. तसेच बँक एफडी किंवा सरकारी रोखे सुरक्षित असतात, पण त्यांचा परतावा महागाईला मात देणे कठीण करतो.\n\nजोखीम कशी हाताळायची? याचे उत्तर आहे वैविध्यीकरण (Diversification).

वैविध्यीकरण म्हणजे तुमचे पैसे वेगवेगळ्या मालमत्ता आणि क्षेत्रांमध्ये विभागून गुंतवणे, जेणेकरून एका ठिकाणी नुकसान झाले तरी संपूर्ण भांडवलाचे नुकसान होणार नाही.
तीन पातळ्यांवरील वैविध्यीकरण:
1. अ‍ॅसेट क्लास वैविध्यीकरण: वाढीसाठी इक्विटी, स्थिरतेसाठी डेट आणि संरक्षणासाठी सोन्याचा समतोल.
2. क्षेत्रीय वैविध्यीकरण: बँकिंग, आयटी, फार्मा, ऑटो यासारख्या वेगवेगळ्या क्षेत्रांत शेअर्स विभागणे.
3. भौगोलिक वैविध्यीकरण: भारतीय आणि आंतरराष्ट्रीय बाजारात गुंतवणूक करणे.\n\n10 वेगवेगळ्या टेक कंपन्यांचे शेअर्स घेतले म्हणजे वैविध्यीकरण झाले असे मानणे चुकीचे आहे. टेक क्षेत्र घसरल्यास सर्व शेअर्स एकत्र घसरतील! एकमेकांशी संबंध नसलेल्या मालमत्तांमध्ये गुंतवणूक करणे हेच खरे वैविध्यीकरण आहे.\n\nवैविध्यीकरण संपूर्ण बाजाराची घसरण थांबवू शकत नाही, पण एकाच कंपनीच्या दिवाळखोरीपासून तुमचे रक्षण करते.\n\nजोखीम आणि परतावा नेहमी जोडलेले असतात; तुमची गुंतवणूक वेगवेगळ्या मालमत्तांमध्ये हुशारीने विभागणे हेच भांडवल संरक्षणाचे रहस्य आहे.`,
        keyTakeaway: 'जोखीम पूर्णपणे नष्ट करता येत नाही, पण वैविध्यीकरण जोखीम आणि परताव्याचा समतोल राखते.'
      },
      bn: {
        videoUrl: '/academy/bn/diversification.mp4',
        thumbnailUrl: '/academy/bn/diversification.webp',
        captionUrl: '/academy/bn/diversification.vtt',
        transcript: `কোনো ঝুঁকি ছাড়া খুব বেশি বিনিয়োগ রিটার্ন পাওয়ার কি কোনো উপায় আছে? অর্থনীতিতে এর উত্তর স্পষ্টতই 'না'।\n\nপ্রত্যেক নতুন বিনিয়োগকারীর জানা উচিত একটি মৌলিক নিয়ম: ঝুঁকি (Risk) এবং সম্ভাব্য লাভ (Return) একই মুদ্রার এপিঠ-ওপিঠ।

বেশি রিটার্নের সম্ভাবনাময় সম্পদে (যেমন স্মল-ক্যাপ শেয়ার) ক্ষতির ঝুঁকিও বেশি থাকে। অন্যদিকে ব্যাংক এফডি বা সরকারি বন্ড নিরাপদ হলেও তা মুদ্রাস্ফীতিকে পরাজিত করতে হিমশিম খায়।\n\nঝুঁকি কীভাবে সামলাবেন? এর সমাধান হলো বৈচিত্র্যকরণ (Diversification)।

বৈচিত্র্যকরণ মানে আপনার অর্থকে বিভিন্ন সম্পদে ও খাতে ছড়িয়ে বিনিয়োগ করা, যাতে কোনো একটি খাতের ক্ষতিতে পুরো মূলধন ধ্বংস না হয়।
তিন স্তরের বৈচিত্র্যকরণ:
১. অ্যাসেট ক্লাস বৈচিত্র্যকরণ: বৃদ্ধির জন্য ইক্যুইটি, স্থিতিশীলতার জন্য ডেট এবং সুরক্ষার জন্য সোনা।
২. খাতভিত্তিক বৈচিত্র্যকরণ: ব্যাংকিং, আইটি, ফার্মা, অটোর মতো বিভিন্ন খাতে বিনিয়োগ ভাগ করা।
৩. ভৌগোলিক বৈচিত্র্যকরণ: ভারতীয় ও আন্তর্জাতিক উভয় বাজারে বিনিয়োগ করা।\n\n১০টি আলাদা টেক কোম্পানির শেয়ার কিনলে বৈচিত্র্যকরণ হয় না। টেক খাত ক্ষতিগ্রস্ত হলে সবগুলো একসাথেই কমবে! সম্পর্কহীন সম্পদে বিনিয়োগ করাই আসল বৈচিত্র্যকরণ।\n\nবৈচিত্র্যকরণ সামগ্রিক বাজারের পতন ঠেকাতে পারে না, তবে একটি একক কোম্পানির দেউলিয়া হওয়ার ঝুঁকি থেকে রক্ষা করে।\n\nঝুঁকি ও রিটার্ন সর্বদা একে অপরের সাথে সম্পর্কিত; বিভিন্ন সম্পদে বুদ্ধিমত্তার সাথে অর্থ ছড়িয়ে দেওয়াই মূলধন রক্ষার উপায়।`,
        keyTakeaway: 'ঝুঁকি পুরোপুরি দূর করা যায় না, তবে বৈচিত্র্যকরণ ঝুঁকি ও রিটার্নের ভারসাম্য বজায় রাখে।'
      },
    }
  },
  // ── 12. HOW TO START INVESTING ──
  {
    id: 'how-to-start-investing',
    number: 12,
    title: 'How to Start Investing',
    category: 'Core Principles',
    level: 'Beginner',
    durationSeconds: 150,
    videoUrl: '/academy/getting-started.mp4',
    thumbnailUrl: '/academy/getting-started.webp',
    description: 'A practical 5-step roadmap: emergency funds, goal horizons, risk profiling, digital KYC, and starting small automated SIPs.',
    aiVideoPrompt: `SmartVest Academy Master AI Video: Presenter-led educational explanation for How to Start Investing. 1080p, modern fintech aesthetic with dark navy/teal background, kinetic typography, dynamic financial diagrams, and multilingual neural voices. Duration >= 120s with real rupee examples and zero filler.`,
    transcript: `Congratulations on completing the foundational concepts of the SmartVest Academy! Now, how do you take your very first real-world step with confidence?\n\nBeginning your investment journey does not require lakhs of rupees or an advanced economics degree. What it requires is a clear, disciplined, and sequential financial roadmap.

Here is a practical 5-step framework designed for absolute beginners:\n\nStep 1: Build an Emergency Fund.
Before investing a single rupee in the stock market, save 3 to 6 months of basic living expenses in a safe, liquid bank savings account or liquid fund. This ensures you never have to sell your investments at a loss during medical or personal emergencies.

Step 2: Define Your Financial Goals and Time Horizon.
Divide your goals: money needed within 1 to 2 years belongs in low-risk fixed income. Money for goals 5 to 10+ years away—like retirement or wealth creation—can be allocated to equity mutual funds and index ETFs.

Step 3: Understand Your Personal Risk Tolerance.
Be honest about your comfort with market swings so you never panic during short-term corrections.

Step 4: Complete Digital KYC and Open Accounts.
Complete your paperless Know-Your-Customer verification with a SEBI-registered broker or direct mutual fund platform.

Step 5: Start Small and Automate with a SIP.
Begin with an automated monthly SIP of ₹1,000 or ₹2,000 in a broad market index fund tracking the NIFTY 50 or S&P 500. Focus on building the habit of consistency.\n\nDo not chase quick-buck stock tips, viral social media advice, or high-risk derivatives trading. Real wealth is built through simple, boring, consistent investing in productive assets.\n\nAlways remember that markets have cycles. Stay disciplined, review your portfolio annually, and never invest money you cannot afford to leave untouched for your intended horizon.\n\nSecure your emergency cushion, define your goals, start small with automated index SIPs, and let patience and compounding work for you.`,
    learningPoints: [
      "Step 1: Save 3\u20136 months of basic living expenses in a liquid emergency fund.",
      "Step 2: Map financial goals to appropriate short-term (debt) and long-term (equity) time horizons.",
      "Step 3: Understand personal risk tolerance and avoid emotional panic during market dips.",
      "Step 4 & 5: Complete digital KYC and automate a monthly index fund SIP from \u20b91,000."
],
    keyTakeaway: 'Start by securing an emergency fund, defining your time horizon, and building a consistent monthly investing habit.',
    quiz: [
      {
            "id": "q12-1",
            "question": "What is the essential first step before investing money in market-linked assets?",
            "options": [
                  "Borrowing money to buy options contracts.",
                  "Building an emergency fund of 3 to 6 months of living expenses in a safe liquid account.",
                  "Quitting your job to trade full time.",
                  "Buying 50 penny stocks."
            ],
            "correctAnswer": 1,
            "explanation": "An emergency fund protects you from having to panic-sell investments at a loss during unexpected emergencies."
      },
      {
            "id": "q12-2",
            "question": "What is the recommended starting approach for a beginner building long-term wealth?",
            "options": [
                  "Starting a small automated monthly SIP (e.g., \u20b91,000) in a broad index fund and focusing on consistency.",
                  "Chasing viral social media tips and hot intraday stock alerts.",
                  "Waiting until you save \u20b950 Lakhs before making a single investment.",
                  "Putting all money into a single small-cap stock."
            ],
            "correctAnswer": 0,
            "explanation": "Starting small with an automated index SIP builds disciplined investing habits while capturing broad economic growth."
      }
],
    relatedLessons: ["what-is-investment", "what-is-sip", "risk-return-diversification"],
    vestiqPrompt: 'What is the recommended 5-step checklist for a beginner starting with ₹1,000/month?',
    languages: {
      en: {
        videoUrl: '/academy/en/getting-started.mp4',
        thumbnailUrl: '/academy/en/getting-started.webp',
        captionUrl: '/academy/en/getting-started.vtt',
        transcript: `Congratulations on completing the foundational concepts of the SmartVest Academy! Now, how do you take your very first real-world step with confidence?\n\nBeginning your investment journey does not require lakhs of rupees or an advanced economics degree. What it requires is a clear, disciplined, and sequential financial roadmap.

Here is a practical 5-step framework designed for absolute beginners:\n\nStep 1: Build an Emergency Fund.
Before investing a single rupee in the stock market, save 3 to 6 months of basic living expenses in a safe, liquid bank savings account or liquid fund. This ensures you never have to sell your investments at a loss during medical or personal emergencies.

Step 2: Define Your Financial Goals and Time Horizon.
Divide your goals: money needed within 1 to 2 years belongs in low-risk fixed income. Money for goals 5 to 10+ years away—like retirement or wealth creation—can be allocated to equity mutual funds and index ETFs.

Step 3: Understand Your Personal Risk Tolerance.
Be honest about your comfort with market swings so you never panic during short-term corrections.

Step 4: Complete Digital KYC and Open Accounts.
Complete your paperless Know-Your-Customer verification with a SEBI-registered broker or direct mutual fund platform.

Step 5: Start Small and Automate with a SIP.
Begin with an automated monthly SIP of ₹1,000 or ₹2,000 in a broad market index fund tracking the NIFTY 50 or S&P 500. Focus on building the habit of consistency.\n\nDo not chase quick-buck stock tips, viral social media advice, or high-risk derivatives trading. Real wealth is built through simple, boring, consistent investing in productive assets.\n\nAlways remember that markets have cycles. Stay disciplined, review your portfolio annually, and never invest money you cannot afford to leave untouched for your intended horizon.\n\nSecure your emergency cushion, define your goals, start small with automated index SIPs, and let patience and compounding work for you.`,
        keyTakeaway: 'Start by securing an emergency fund, defining your time horizon, and building a consistent monthly investing habit.'
      },
      hi: {
        videoUrl: '/academy/hi/getting-started.mp4',
        thumbnailUrl: '/academy/hi/getting-started.webp',
        captionUrl: '/academy/hi/getting-started.vtt',
        transcript: `स्मार्टवेस्ट एकेडमी के बुनियादी पाठों को पूरा करने पर बधाई! अब, आप पूरे विश्वास के साथ अपनी वास्तविक निवेश यात्रा का पहला कदम कैसे उठा सकते हैं?\n\nनिवेश शुरू करने के लिए लाखों रुपये या अर्थशास्त्र की किसी बड़ी डिग्री की आवश्यकता नहीं होती। इसके लिए एक स्पष्ट, अनुशासित और चरणबद्ध वित्तीय रोडमैप की आवश्यकता होती है।

यहाँ शुरुआती निवेशकों के लिए एक व्यावहारिक 5-चरणीय ढांचा प्रस्तुत है:\n\nचरण 1: आपातकालीन फंड (Emergency Fund) बनाएं।
शेयर बाजार में एक भी रुपया निवेश करने से पहले, अपने 3 से 6 महीने के बुनियादी खर्चों को सुरक्षित बैंक बचत खाते या लिक्विड फंड में जमा करें। यह सुनिश्चित करता है कि किसी आपात स्थिति में आपको अपने निवेश को नुकसान में न बेचना पड़े।

चरण 2: वित्तीय लक्ष्य और समय सीमा निर्धारित करें।
अपने लक्ष्यों को बांटें: 1 से 2 साल में जरूरी पैसे को कम जोखिम वाले डेट में रखें। 5 से 10+ साल के दीर्घकालिक लक्ष्यों के लिए इक्विटी म्यूचुअल फंड और इंडेक्स ईटीएफ में निवेश करें।

चरण 3: अपनी जोखिम सहनशीलता को समझें।
बाजार के उतार-चढ़ाव के साथ अपनी मानसिक सहजता को समझें ताकि आप गिरावट के दौरान घबराएं नहीं।

चरण 4: डिजिटल केवाईसी और खाता खोलें।
सेबी-पंजीकृत ब्रोकर या डायरेक्ट म्यूचुअल फंड प्लेटफॉर्म के साथ पेपरलेस केवाईसी सत्यापन पूरा करें।

चरण 5: छोटी शुरुआत करें और एसआईपी से स्वचालित करें।
निफ्टी 50 या व्यापक इंडेक्स फंड में ₹1,000 या ₹2,000 के मासिक एसआईपी के साथ शुरुआत करें और नियमितता की आदत बनाएं।\n\nसोशल मीडिया के त्वरित टिप्स, अनधिकृत सलाह या जोखिम भरे डेरिवेटिव ट्रेडिंग के पीछे न भागें। वास्तविक संपत्ति उत्पादक संपत्तियों में सरल और लगातार निवेश करने से बनती है।\n\nहमेशा याद रखें कि बाजारों में चक्र होते हैं। अनुशासित रहें, साल में एक बार पोर्टफोलियो की समीक्षा करें, और कभी भी वह पैसा निवेश न करें जिसकी आपको जल्द जरूरत हो।\n\nअपना आपातकालीन फंड सुरक्षित करें, अपने लक्ष्य तय करें, इंडेक्स एसआईपी के साथ छोटी शुरुआत करें, और धैर्य व कंपाउंडिंग को अपना काम करने दें।`,
        keyTakeaway: 'आपातकालीन फंड बनाकर, समय सीमा तय करके और लगातार मासिक एसआईपी की आदत डालकर शुरुआत करें।'
      },
      kn: {
        videoUrl: '/academy/kn/getting-started.mp4',
        thumbnailUrl: '/academy/kn/getting-started.webp',
        captionUrl: '/academy/kn/getting-started.vtt',
        transcript: `ಸ್ಮಾರ್ಟ್‌ವೆಸ್ಟ್ ಅಕಾಡೆಮಿಯ ಪಾಠಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಅಭಿನಂದನೆಗಳು! ಈಗ ನಿಮ್ಮ ಮೊದಲ ನೈಜ ಹೂಡಿಕೆಯ ಹೆಜ್ಜೆಯನ್ನು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಇಡುವುದು ಹೇಗೆ?\n\nಹೂಡಿಕೆ ಆರಂಭಿಸಲು ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ಅಥವಾ ಅರ್ಥಶಾಸ್ತ್ರದ ದೊಡ್ಡ ಪದವಿಯ ಅಗತ್ಯವಿಲ್ಲ. ಇದಕ್ಕೆ ಸ್ಪಷ್ಟ, ಶಿಸ್ತುಬದ್ಧ ಹಂತಗಳ ಮಾರ್ಗಸೂಚಿ ಅಗತ್ಯವಿದೆ.

ಆರಂಭಿಕ ಹೂಡಿಕೆದಾರರಿಗಾಗಿ 5 ಹಂತಗಳ ಪ್ರಾಯೋಗಿಕ ಚೌಕಟ್ಟು ಇಲ್ಲಿದೆ:\n\nಹಂತ 1: ತುರ್ತು ನಿಧಿ (Emergency Fund) ರಚಿಸಿ.
ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೂಡುವ ಮುನ್ನ 3 ರಿಂದ 6 ತಿಂಗಳ ಮೂಲಭೂತ ಖರ್ಚಿನ ಹಣವನ್ನು ಉಳಿತಾಯ ಖಾತೆ ಅಥವಾ ಲಿಕ್ವಿಡ್ ಫಂಡ್‌ನಲ್ಲಿ ಇರಿಸಿ.

ಹಂತ 2: ಆರ್ಥಿಕ ಗುರಿಗಳು ಮತ್ತು ಕಾಲಮಿತಿಯನ್ನು ನಿರ್ಧರಿಸಿ.
1-2 ವರ್ಷದ ಅಗತ್ಯಕ್ಕೆ ಡೆಟ್ ಫಂಡ್; 5-10+ ವರ್ಷಗಳ ದೀರ್ಘಾವಧಿ ಗುರಿಗಳಿಗೆ ಈಕ್ವಿಟಿ ಮ್ಯೂಚುವಲ್ ಫಂಡ್ ಮತ್ತು ಇಂಡೆಕ್ಸ್ ಇಟಿಎಫ್ ಆಯ್ಕೆಮಾಡಿ.

ಹಂತ 3: ನಿಮ್ಮ ಅಪಾಯ ಸಹಿಷ್ಣುತೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.
ಮಾರುಕಟ್ಟೆಯ ಏರಿಳಿತಗಳಲ್ಲಿ ಆತಂಕಗೊಳ್ಳದಂತೆ ನಿಮ್ಮ ಮನಸ್ಥಿತಿಯನ್ನು ಅರಿಯಿರಿ.

ಹಂತ 4: ಡಿಜಿಟಲ್ ಕೆವೈಸಿ ಪೂರ್ಣಗೊಳಿಸಿ ಖಾತೆ ತೆರೆಯಿರಿ.
ಸೆಬಿ-ನೋಂದಾಯಿತ ಬ್ರೋಕರ್ ಅಥವಾ ಡೈರೆಕ್ಟ್ ಫಂಡ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿ ಕೆವೈಸಿ ಮುಗಿಸಿ.

ಹಂತ 5: ಸಣ್ಣ ಮೊತ್ತದ ಎಸ್‌ಐಪಿ ಮೂಲಕ ಆರಂಭಿಸಿ.
ನಿಫ್ಟಿ 50 ಇಂಡೆಕ್ಸ್ ಫಂಡ್‌ನಲ್ಲಿ ₹1,000 ಅಥವಾ ₹2,000 ಎಸ್‌ಐಪಿ ಆರಂಭಿಸಿ ನಿಯಮಿತ ಶಿಸ್ತನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ.\n\nಸಾಮಾಜಿಕ ಮಾಧ್ಯಮಗಳ ತ್ವರಿತ ಸಲಹೆಗಳು ಅಥವಾ ಡೆರಿವೇಟಿವ್ಸ್ ಟ್ರೇಡಿಂಗ್ ಬೆನ್ನಟ್ಟಬೇಡಿ. ನೈಜ ಸಂಪತ್ತು ಸರಳ ಮತ್ತು ಸ್ಥಿರ ಹೂಡಿಕೆಯಿಂದ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.\n\nಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಚಕ್ರಗಳಿರುತ್ತವೆ ಎಂಬುದನ್ನು ಸದಾ ನೆನಪಿನಲ್ಲಿಡಿ. ಶಿಸ್ತುಬದ್ಧವಾಗಿರಿ ಮತ್ತು ವರ್ಷಕ್ಕೊಮ್ಮೆ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಪರಿಶೀಲಿಸಿ.\n\nತುರ್ತು ನಿಧಿ ಹೊಂದಿರಿ, ಗುರಿಗಳನ್ನು ನಿರ್ಧರಿಸಿ, ಇಂಡೆಕ್ಸ್ ಎಸ್‌ಐಪಿ ಮೂಲಕ ಸಣ್ಣದಾಗಿ ಆರಂಭಿಸಿ, ತಾಳ್ಮೆ ಮತ್ತು ಕಾಂಪೌಂಡಿಂಗ್‌ಗೆ ಅವಕಾಶ ನೀಡಿ.`,
        keyTakeaway: 'ತುರ್ತು ನಿಧಿ ರಚಿಸಿ, ಕಾಲಮಿತಿ ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ಸಣ್ಣ ಮೊತ್ತದ ಮಾಸಿಕ ಎಸ್‌ಐಪಿ ಮೂಲಕ ಹೂಡಿಕೆ ಆರಂಭಿಸಿ.'
      },
      te: {
        videoUrl: '/academy/te/getting-started.mp4',
        thumbnailUrl: '/academy/te/getting-started.webp',
        captionUrl: '/academy/te/getting-started.vtt',
        transcript: `స్మార్ట్‌వెస్ట్ అకాడమీ పాఠాలను పూర్తి చేసినందుకు అభినందనలు! ఇప్పుడు మీ మొదటి నిజమైన పెట్టుబడి అడుగును ఆత్మవిశ్వాసంతో ఎలా వేయాలి?\n\nపెట్టుబడి ప్రారంభించడానికి లక్షల రూపాయలు లేదా ఆర్థిక శాస్త్రంలో పెద్ద డిగ్రీ అవసరం లేదు. దీనికి స్పష్టమైన, క్రమశిక్షణాయుతమైన కార్యాచరణ ప్రణాళిక అవసరం.

ప్రారంభకులకు 5 దశల కార్యాచరణ ప్రణాళిక ఇక్కడ ఉంది:\n\nదశ 1: అత్యవసర నిధి (Emergency Fund) ఏర్పాటు చేయండి.
స్టాక్ మార్కెట్లో పెట్టే ముందు 3 నుండి 6 నెలల ప్రాథమిక ఖర్చులను పొదుపు ఖాతా లేదా లిక్విడ్ ఫండ్‌లో భద్రపరచండి.

దశ 2: ఆర్థిక లక్ష్యాలు మరియు కాలపరిమితిని నిర్ణయించండి.
1-2 సంవత్సరాల అవసరాలకు డెట్ ఫండ్లు; 5-10+ సంవత్సరాల దీర్ఘకాలిక లక్ష్యాల కోసం ఈక్విటీ మ్యూచువల్ ఫండ్లు మరియు ఇండెక్స్ ఇటిఎఫ్‌లను ఎంచుకోండి.

దశ 3: మీ రిస్క్ సామర్థ్యాన్ని అర్థం చేసుకోండి.
మార్కెట్ ఒడిదుడుకులకు భయపడకుండా ఉండే మీ మానసిక స్థితిని తెలుసుకోండి.

దశ 4: డిజిటల్ కేవైసీ పూర్తి చేసి ఖాతా తెరవండి.
సెబీ-రిజిస్టర్డ్ బ్రోకర్ లేదా డైరెక్ట్ మ్యూచువల్ ఫండ్ ప్లాట్‌ఫామ్‌లో పేపర్‌లెస్ కేవైసీ పూర్తి చేయండి.

దశ 5: చిన్న ఎస్ఐపితో ప్రారంభించి ఆటోమేట్ చేయండి.
నిఫ్టీ 50 ఇండెక్స్ ఫండ్‌లో ₹1,000 లేదా ₹2,000 ఎస్ఐపితో ప్రారంభించి స్థిరమైన అలవాటును పెంచుకోండి.\n\nసోషల్ మీడియా చిట్కాలు లేదా రిస్క్ డెరివేటివ్స్ ట్రేడింగ్ వెనుక పరుగెత్తకండి. నిజమైన సంపద సరళమైన మరియు స్థిరమైన పెట్టుబడుల ద్వారానే ఏర్పడుతుంది.\n\nమార్కెట్లలో ఎప్పుడూ చక్రాలు ఉంటాయని గుర్తుంచుకోండి. క్రమశిక్షణతో ఉండండి మరియు సంవత్సరానికి ఒకసారి పోర్ట్‌ఫోలియోను సమీక్షించండి.\n\nఅత్యవసర నిధిని నిర్మించుకోండి, లక్ష్యాలను నిర్ణయించండి, ఇండెక్స్ ఎస్ఐపితో చిన్నగా ప్రారంభించి ఓర్పు మరియు కాంపౌండింగ్‌కు సమయం ఇవ్వండి.`,
        keyTakeaway: 'అత్యవసర నిధిని ఏర్పాటు చేసుకొని, కాలపరిమితి నిర్ణయించుకొని చిన్న నెలవారీ ఎస్ఐపితో ప్రారంభించండి.'
      },
      ta: {
        videoUrl: '/academy/ta/getting-started.mp4',
        thumbnailUrl: '/academy/ta/getting-started.webp',
        captionUrl: '/academy/ta/getting-started.vtt',
        transcript: `ஸ்மார்ட்வெஸ்ட் அகாடமியின் பாடங்களை வெற்றிகரமாக முடித்ததற்கு வாழ்த்துகள்! இப்போது உங்கள் முதல் முதலீட்டு அடியை நம்பிக்கையுடன் எடுத்து வைப்பது எப்படி?\n\nமுதலீட்டைத் தொடங்க லட்சக்கணக்கான ரூபாயோ அல்லது பொருளாதாரத்தில் பெரிய பட்டப்படிப்போ தேவையில்லை. இதற்கு ஒரு தெளிவான, ஒழுக்கமான படிப்படியான வழிகாட்டுதல் மட்டுமே தேவை.

புதியவர்களுக்கான 5 படிகள் கொண்ட செயல்திட்டம் இதோ:\n\nபடி 1: அவசர கால நிதியை (Emergency Fund) உருவாக்குங்கள்.
பங்குச் சந்தையில் முதலீடு செய்வதற்கு முன் 3 முதல் 6 மாத அத்தியாவசியச் செலவுத் தொகையைச் சேமிப்புக் கணக்கு அல்லது லிக்விட் ஃபண்டில் பாதுகாப்பாக வையுங்கள்.

படி 2: நிதி இலக்குகள் மற்றும் காலக்கெடுவை முடிவு செய்யுங்கள்.
1-2 வருட தேவைகளுக்கு டெப்ட் ஃபண்டுகள்; 5-10+ வருட நீண்ட கால இலக்குகளுக்கு ஈக்விட்டி மியூச்சுவல் ஃபண்டுகள் மற்றும் இன்டெக்ஸ் இடிஎஃப்-களைத் தேர்வு செய்யுங்கள்.

படி 3: உங்கள் ஆபத்து ஏற்கும் திறனைப் புரிந்து கொள்ளுங்கள்.
சந்தை ஏற்ற இறக்கங்களின் போது பயப்படாமல் இருக்கும் உங்கள் மனநிலையை அறியுங்கள்.

படி 4: டிஜிட்டல் கேஒய்சி முடித்துக் கணக்கு தொடங்குங்கள்.
செபி-பதிவு பெற்ற புரோக்கர் அல்லது நேரடி மியூச்சுவல் ஃபண்ட் தளத்தில் ஆவணமில்லா கேஒய்சி-யை முடியுங்கள்.

படி 5: சிறிய எஸ்ஐபி மூலம் தொடங்குங்கள்.
நிஃப்டி 50 இன்டெக்ஸ் ஃபண்டில் மாதம் ₹1,000 அல்லது ₹2,000 எஸ்ஐபி தொடங்கி முதலீட்டு ஒழுக்கத்தை வளர்த்துக் கொள்ளுங்கள்.\n\nசமூக ஊடகங்களின் விரைவான குறிப்புகள் அல்லது ஆபத்தான டெரிவேடிவ்ஸ் வர்த்தகத்தைத் தேடி ஓடாதீர்கள். உண்மையான செல்வம் எளிய மற்றும் நிலையான முதலீட்டின் மூலமே உருவாகிறது.\n\nசந்தையில் எப்போதும் சுழற்சிகள் இருக்கும் என்பதை நினைவில் கொள்ளுங்கள். ஒழுக்கமாக இருங்கள் மற்றும் வருடத்திற்கு ஒருமுறை போர்ட்ஃபோலியோவை ஆய்வு செய்யுங்கள்.\n\nஅவசர நிதியைப் பாதுகாத்து, இலக்குகளைத் தீர்மானித்து, இன்டெக்ஸ் எஸ்ஐபி மூலம் சிறியதாகத் தொடங்கி பொறுமையுடன் கூட்டு வட்டிக்கு வாய்ப்பளியுங்கள்.`,
        keyTakeaway: 'அவசர நிதியை உருவாக்கி, காலக்கெடுவை நிர்ணயித்து, எளிய மாதாந்திர எஸ்ஐபி மூலம் தொடங்குங்கள்.'
      },
      ml: {
        videoUrl: '/academy/ml/getting-started.mp4',
        thumbnailUrl: '/academy/ml/getting-started.webp',
        captionUrl: '/academy/ml/getting-started.vtt',
        transcript: `സ്മാർട്ട്‌വെസ്റ്റ് അക്കാദമി പാഠങ്ങൾ പൂർത്തിയാക്കിയതിന് അഭിനന്ദനങ്ങൾ! ഇനി നിങ്ങളുടെ ആദ്യ നിക്ഷേപ ചുവടുവെപ്പ് ആത്മവിശ്വാസത്തോടെ എങ്ങനെ നടത്താം?\n\nനിക്ഷേപം ആരംഭിക്കാൻ ലക്ഷക്കണക്കിന് രൂപയോ ഇക്കണോമിക്സിൽ വലിയ ബിരുദമോ ആവശ്യമില്ല. ഇതിന് വ്യക്തവും ചിട്ടയായതുമായ ഒരു കർമ്മപദ്ധതി മാത്രം മതി.

തുടക്കക്കാർക്കായുള്ള 5 ഘട്ട കർമ്മപദ്ധതി ഇതാ:\n\nഘട്ടം 1: എമർജൻസി ഫണ്ട് (Emergency Fund) ഉണ്ടാക്കുക.
ഓഹരി വിപണിയിൽ നിക്ഷേപിക്കുന്നതിന് മുമ്പ് 3 മുതൽ 6 മാസത്തെ അടിസ്ഥാന ചിലവുകൾ ബാങ്ക് സേവിംഗ്സ് അക്കൗണ്ടിലോ ലിക്വിഡ് ഫണ്ടിലോ സൂക്ഷിക്കുക.

ഘട്ടം 2: സാമ്പത്തിക ലക്ഷ്യങ്ങളും സമയപരിധിയും നിശ്ചയിക്കുക.
1-2 വർഷത്തെ ആവശ്യങ്ങൾക്ക് ഡെറ്റ് ഫണ്ടുകൾ; 5-10+ വർഷത്തെ ദീർഘകാല ലക്ഷ്യങ്ങൾക്ക് ഇക്വിറ്റി മ്യൂച്വൽ ഫണ്ടുകളും ഇൻഡക്സ് ഇടിഎഫുകളും തിരഞ്ഞെടുക്കുക.

ഘട്ടം 3: നിങ്ങളുടെ റിസ്ക് എടുക്കാനുള്ള ശേഷി മനസ്സിലാക്കുക.
വിപണി ചാഞ്ചാട്ടങ്ങളിൽ ഭയപ്പെടാത്ത രീതിയിലുള്ള മാനസികാവസ്ഥ മനസ്സിലാക്കുക.

ഘട്ടം 4: ഡിജിറ്റൽ കെവൈസി പൂർത്തിയാക്കി അക്കൗണ്ട് തുറക്കുക.
സെബി രജിസ്റ്റർ ചെയ്ത ബ്രോക്കറിലോ ഡയറക്റ്റ് ഫണ്ട് പ്ലാറ്റ്‌ഫോമിലോ പേപ്പർലെസ്സ് കെവൈസി പൂർത്തിയാക്കുക.

ഘട്ടം 5: ചെറിയ എസ്ഐപി വഴി ആരംഭിച്ച് ഓട്ടോമേറ്റ് ചെയ്യുക.
നിഫ്റ്റി 50 ഇൻഡക്സ് ഫണ്ടിൽ ₹1,000 അല്ലെങ്കിൽ ₹2,000 എസ്ഐപി വഴി ആരംഭിച്ച് സ്ഥിരമായ ശീലം വളർത്തുക.\n\nസോഷ്യൽ മീഡിയ ടിപ്പുകൾക്ക് പിന്നാലെയോ റിസ്ക് കൂടിയ ഡെറിവേറ്റീവ്സ് ട്രേഡിംഗിന് പിന്നാലെയോ പോകരുത്. യഥാർത്ഥ സമ്പത്ത് ലളിതവും സുസ്ഥിരവുമായ നിക്ഷേപത്തിലൂടെയാണ് ഉണ്ടാകുന്നത്.\n\nവിപണിയിൽ എപ്പോഴും ചക്രങ്ങൾ ഉണ്ടെന്ന് ഓർക്കുക. ചിട്ട പാലിക്കുകയും വർഷത്തിലൊരിക്കൽ പോർട്ട്ഫോളിയോ പുനഃപരിശോധിക്കുകയും ചെയ്യുക.\n\nഎമർജൻസി ഫണ്ട് സുരക്ഷിതമാക്കുക, ലക്ഷ്യങ്ങൾ നിശ്ചയിക്കുക, ഇൻഡക്സ് എസ്ഐപി വഴി ചെറുതായി തുടങ്ങുക, ക്ഷമയ്ക്കും കോമ്പൗണ്ടിംഗിനും അവസരം നൽകുക.`,
        keyTakeaway: 'അടിയന്തര ഫണ്ട് ഉണ്ടാക്കുക, ലക്ഷ്യങ്ങൾ നിശ്ചയിക്കുക, ചെറിയ പ്രതിമാസ എസ്ഐപി വഴി നിക്ഷേപം ആരംഭിക്കുക.'
      },
      mr: {
        videoUrl: '/academy/mr/getting-started.mp4',
        thumbnailUrl: '/academy/mr/getting-started.webp',
        captionUrl: '/academy/mr/getting-started.vtt',
        transcript: `स्मार्टव्हेस्ट अकॅडमीचे मूलभूत धडे पूर्ण केल्याबद्दल अभिनंदन! आता आत्मविश्वासाने पहिले गुंतवणुकीचे पाऊल कसे टाकायचे?\n\nगुंतवणूक सुरू करण्यासाठी लाखो रुपयांची किंवा अर्थशास्त्रातील मोठ्या पदवीची गरज नसते. यासाठी एका स्पष्ट, शिस्तबद्ध 5-टप्प्यांच्या कृती आराखड्याची गरज असते.

नवीन गुंतवणूकदारांसाठी हा 5 टप्प्यांचा आराखडा खालीलप्रमाणे आहे:\n\nटप्पा 1: आपत्कालीन निधी (Emergency Fund) तयार करा.
शेअर बाजारात गुंतवणूक करण्यापूर्वी 3 ते 6 महिन्यांचा मूलभूत खर्च बँक बचत खात्यात किंवा लिक्विड फंडात सुरक्षित ठेवा.

टप्पा 2: आर्थिक उद्दिष्टे आणि कालावधी ठरवा.
1-2 वर्षांच्या गरजेसाठी डेट फंड; 5-10+ वर्षांच्या दीर्घकालीन उद्दिष्टांसाठी इक्विटी म्युच्युअल फंड आणि इंडेक्स ईटीएफ निवडा.

टप्पा 3: तुमची जोखीम क्षमता ओळखा.
बाजारातील चढ-उतारांना न घाबरता संयम राखण्याची तुमची मानसिक तयारी समजून घ्या.

टप्पा 4: डिजिटल केवायसी पूर्ण करून खाते उघडा.
सेबी-नोंदणीकृत ब्रोकर किंवा थेट म्युच्युअल फंड प्लॅटफॉर्मवर पेपरलेस केवायसी पूर्ण करा.

टप्पा 5: लहान एसआयपीने सुरुवात करा.
निफ्टी 50 इंडेक्स फंडात दरमहा ₹1,000 किंवा ₹2,000 च्या एसआयपीने सुरुवात करा आणि नियमित सवय लावा.\n\nसोशल मीडियावरील टिपा किंवा धोकादायक डेरिव्हेटिव्ह्ज ट्रेडिंगच्या मागे धावू नका. खरी संपत्ती साध्या आणि स्थिर गुंतवणुकीतूनच तयार होते.\n\nबाजारात नेहमी चक्रे असतात हे लक्षात ठेवा. शिस्तबद्ध राहा आणि वर्षातून एकदा पोर्टफोलिओचा आढावा घ्या.\n\nआपत्कालीन निधी सुरक्षित ठेवा, उद्दिष्टे ठरवा, इंडेक्स एसआयपीने लहान सुरुवात करा आणि संयम व चक्रवाढीला काम करू द्या.`,
        keyTakeaway: 'आपत्कालीन निधी तयार करा, उद्दिष्टे ठरवा आणि छोट्या मासिक एसआयपीने सुरुवात करा.'
      },
      bn: {
        videoUrl: '/academy/bn/getting-started.mp4',
        thumbnailUrl: '/academy/bn/getting-started.webp',
        captionUrl: '/academy/bn/getting-started.vtt',
        transcript: `স্মার্টভেস্ট একাডেমির মৌলিক পাঠগুলো সম্পন্ন করার জন্য অভিনন্দন! এখন কীভাবে আত্মবিশ্বাসের সাথে বিনিয়োগের প্রথম পদক্ষেপ নেবেন?\n\nবিনিয়োগ শুরু করতে লাখ লাখ টাকা বা অর্থনীতির কোনো বড় ডিগ্রির প্রয়োজন হয় না। এর জন্য প্রয়োজন একটি সুশৃঙ্খল ও স্পষ্ট ৫-ধাপের কর্মপরিকল্পনা।

নতুনদের জন্য ৫টি ধাপের কার্যপদ্ধতি নিচে দেওয়া হলো:\n\nধাপ ১: ইমার্জেন্সি ফান্ড (Emergency Fund) তৈরি করুন।
শেয়ার বাজারে নামার আগে ৩ থেকে ৬ মাসের মৌলিক খরচ ব্যাংক সেভিংস একাউন্ট বা লিকুইড ফান্ডে নিরাপদ রাখুন।

ধাপ ২: আর্থিক লক্ষ্য ও সময়সীমা নির্ধারণ করুন।
১-২ বছরের জন্য ডেট ফান্ড; ৫-১০+ বছরের দীর্ঘমেয়াদী লক্ষ্যের জন্য ইক্যুইটি মিউচুয়াল ফান্ড ও ইনডেক্স ইটিএফ বেছে নিন।

ধাপ ৩: নিজের ঝুঁকি নেওয়ার ক্ষমতা বুঝুন।
বাজারের ওঠানামায় ঘাবড়ে না যাওয়ার মতো মানসিক প্রস্তুতি যাচাই করুন।

ধাপ ৪: ডিজিটাল কেওয়াইসি শেষ করে একাউন্ট খুলুন।
সেবি-নিবন্ধিত ব্রোকার বা সরাসরি মিউচুয়াল ফান্ড প্ল্যাটফর্মে পেপারলেস কেওয়াইসি সম্পন্ন করুন।

ধাপ ৫: ছোট এসআইপি দিয়ে শুরু করে স্বয়ংক্রিয় করুন।
নিফটি ৫০ ইনডেক্স ফান্ডে প্রতি মাসে ₹১,০০০ বা ₹২,০০০ এসআইপি দিয়ে শুরু করুন এবং বিনিয়োগের নিয়মিত অভ্যাস গড়ে তুলুন।\n\nসোশ্যাল মিডিয়ার টিপস বা ঝুঁকিপূর্ণ ডেরিভেটিভস ট্রেডিংয়ের পেছনে ছুটবেন না। আসল সম্পদ তৈরি হয় সহজ ও ধারাবাহিক বিনিয়োগের মাধ্যমে।\n\nমনে রাখবেন বাজারে সর্বদা চক্র থাকে। সুশৃঙ্খল থাকুন এবং বছরে অন্তত একবার পোর্টফोलিও পর্যালোচনা করুন।\n\nইমার্জেন্সি ফান্ড তৈরি করুন, লক্ষ্য স্থির করুন, ইনডেক্স এসআইপি দিয়ে ছোট পরিসরে শুরু করুন এবং ধৈর্য ও চক্রবৃদ্ধিকে কাজ করতে দিন।`,
        keyTakeaway: 'জরুরি ফান্ড তৈরি করুন, লক্ষ্য নির্ধারণ করুন এবং ছোট মাসিক এসআইপি দিয়ে শুরু করুন।'
      },
    }
  },
];

export const getLessonById = (id: string): InvestmentLesson | undefined => {
  return INVESTMENT_LESSONS.find((lesson) => lesson.id === id);
};

export const getLessonByNumber = (num: number): InvestmentLesson | undefined => {
  return INVESTMENT_LESSONS.find((lesson) => lesson.number === num);
};

export const getNextLesson = (currentId: string): InvestmentLesson | undefined => {
  const currentIndex = INVESTMENT_LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex >= 0 && currentIndex < INVESTMENT_LESSONS.length - 1) {
    return INVESTMENT_LESSONS[currentIndex + 1];
  }
  return undefined;
};

export const getPreviousLesson = (currentId: string): InvestmentLesson | undefined => {
  const currentIndex = INVESTMENT_LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex > 0) {
    return INVESTMENT_LESSONS[currentIndex - 1];
  }
  return undefined;
};

export const getRelatedLessons = (lesson: InvestmentLesson): InvestmentLesson[] => {
  return lesson.relatedLessons
    .map((id) => getLessonById(id))
    .filter((l): l is InvestmentLesson => l !== undefined);
};
