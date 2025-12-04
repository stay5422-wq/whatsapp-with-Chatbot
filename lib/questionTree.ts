import { QuestionTree } from '@/types';

export const questionTree: QuestionTree = {
  // ========== البداية - Welcome ==========
  "welcome": {
    "id": "welcome",
    "text": "مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍\n\nيشرفنا نخدمك! اختر الخدمة المطلوبة:",
    "options": [
      {
        "id": "1",
        "label": "حجز وحدات الضيافة",
        "emoji": "🏘️",
        "nextQuestionId": "hospitality_units",
        "responseText": "ممتاز! اختر نوع وحدة الضيافة:"
      },
      {
        "id": "2",
        "label": "حجز سيارات",
        "emoji": "🚗",
        "nextQuestionId": "car_rental",
        "responseText": "اختر نوع حجز السيارة:"
      },
      {
        "id": "3",
        "label": "البرامج والخدمات السياحية",
        "emoji": "🗺️",
        "nextQuestionId": "tours_activities",
        "responseText": "اختر نوع الخدمة السياحية:"
      },
      {
        "id": "4",
        "label": "المرشدين السياحيين",
        "emoji": "👨‍🏫",
        "nextQuestionId": "tour_guides",
        "responseText": "اختر نوع المرشد السياحي:"
      },
      {
        "id": "5",
        "label": "خدمة العملاء",
        "emoji": "💬",
        "nextQuestionId": "customer_support",
        "responseText": "مرحبًا بك في الدعم الفني 🤝🔥"
      }
    ]
  },

  // ========== حجز وحدات الضيافة ==========
  "hospitality_units": {
    "id": "hospitality_units",
    "text": "اختر نوع وحدة الضيافة:",
    "options": [
      {
        "id": "1",
        "label": "شاليهات",
        "emoji": "🏡",
        "nextQuestionId": "unit_details",
        "department": "units"
      },
      {
        "id": "2",
        "label": "منتجعات",
        "emoji": "🏘️",
        "nextQuestionId": "unit_details",
        "department": "units"
      },
      {
        "id": "3",
        "label": "شقق فندقية",
        "emoji": "🏢",
        "nextQuestionId": "unit_details",
        "department": "units"
      },
      {
        "id": "0",
        "label": "رجوع",
        "emoji": "⬅️",
        "nextQuestionId": "welcome"
      }
    ]
  },
  "unit_details": {
    "id": "unit_details",
    "text": "من فضلك أرسل البيانات التالية:\n\n📍 المدينة / المنطقة\n📅 تاريخ الوصول والمغادرة\n👥 عدد الأشخاص\n🛏️ عدد الغرف (اختياري)\n\n_مثال:_\n*الرياض، من 10/12 إلى 15/12، 4 أشخاص، غرفتين*",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "unit_confirmation"
  },
  "unit_confirmation": {
    "id": "unit_confirmation",
    "text": "✅ تم استلام طلبك بنجاح!\n\n📋 التفاصيل:\n{booking_details}\n\n🔄 سيتم عرض أفضل الخيارات المتاحة لك.\n⏱️ سيتواصل معك موظفنا المختص خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥",
    "options": [
      {
        "id": "1",
        "label": "حجز آخر",
        "emoji": "➕",
        "nextQuestionId": "welcome"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },

  // ========== حجز السيارات ==========
  "car_rental": {
    "id": "car_rental",
    "text": "اختر نوع حجز السيارة:",
    "options": [
      {
        "id": "1",
        "label": "تأجير يومي",
        "emoji": "🚗",
        "nextQuestionId": "car_details",
        "department": "cars"
      },
      {
        "id": "2",
        "label": "تأجير طويل",
        "emoji": "🚙",
        "nextQuestionId": "car_details",
        "department": "cars"
      },
      {
        "id": "3",
        "label": "سيارات فاخرة",
        "emoji": "⭐",
        "nextQuestionId": "car_details",
        "department": "cars"
      },
      {
        "id": "0",
        "label": "رجوع",
        "emoji": "⬅️",
        "nextQuestionId": "welcome"
      }
    ]
  },
  "car_details": {
    "id": "car_details",
    "text": "من فضلك أرسل التفاصيل التالية:\n\n📍 المدينة\n📅 تاريخ الاستلام والتسليم\n🚗 نوع السيارة المفضل\n\n_مثال:_\n*الرياض، من 10/12 إلى 15/12، سيارة عائلية*",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "car_confirmation"
  },
  "car_confirmation": {
    "id": "car_confirmation",
    "text": "✅ تم استلام طلبك بنجاح!\n\n📋 التفاصيل:\n{booking_details}\n\n💰 سنرسل لك أفضل الأسعار والعروض.\n⏱️ سيتواصل معك موظفنا المختص خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥",
    "options": [
      {
        "id": "1",
        "label": "حجز آخر",
        "emoji": "➕",
        "nextQuestionId": "welcome"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },

  // ========== البرامج والخدمات السياحية ==========
  "tours_activities": {
    "id": "tours_activities",
    "text": "اختر نوع الخدمة:",
    "options": [
      {
        "id": "1",
        "label": "رحلات سياحية",
        "emoji": "🗺️",
        "nextQuestionId": "tour_details",
        "department": "tourism"
      },
      {
        "id": "2",
        "label": "أنشطة ومغامرات",
        "emoji": "🎡",
        "nextQuestionId": "tour_details",
        "department": "tourism"
      },
      {
        "id": "3",
        "label": "جولات المدن",
        "emoji": "🚌",
        "nextQuestionId": "tour_details",
        "department": "tourism"
      },
      {
        "id": "0",
        "label": "رجوع",
        "emoji": "⬅️",
        "nextQuestionId": "welcome"
      }
    ]
  },
  "tour_details": {
    "id": "tour_details",
    "text": "من فضلك أرسل التفاصيل:\n\n📍 الوجهة\n👥 عدد الأشخاص\n📅 التاريخ المطلوب\n\n_مثال:_\n*العلا، 6 أشخاص، 15/12/2025*",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "tour_confirmation"
  },
  "tour_confirmation": {
    "id": "tour_confirmation",
    "text": "✅ تم استلام طلبك بنجاح!\n\n📋 التفاصيل:\n{booking_details}\n\n🗺️ سنرسل لك البرامج المتاحة والأسعار.\n⏱️ سيتواصل معك موظفنا المختص خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥",
    "options": [
      {
        "id": "1",
        "label": "خدمة أخرى",
        "emoji": "➕",
        "nextQuestionId": "welcome"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },

  // ========== المرشدين السياحيين ==========
  "tour_guides": {
    "id": "tour_guides",
    "text": "اختر نوع المرشد:",
    "options": [
      {
        "id": "1",
        "label": "مرشد عربي",
        "emoji": "👨‍🏫",
        "nextQuestionId": "guide_details",
        "department": "tourism"
      },
      {
        "id": "2",
        "label": "مرشد إنجليزي",
        "emoji": "👩‍🏫",
        "nextQuestionId": "guide_details",
        "department": "tourism"
      },
      {
        "id": "3",
        "label": "لغات أخرى",
        "emoji": "🌍",
        "nextQuestionId": "guide_details",
        "department": "tourism"
      },
      {
        "id": "0",
        "label": "رجوع",
        "emoji": "⬅️",
        "nextQuestionId": "welcome"
      }
    ]
  },
  "guide_details": {
    "id": "guide_details",
    "text": "من فضلك أرسل التفاصيل:\n\n📍 الوجهة\n📅 التاريخ\n👥 عدد الأشخاص\n🗣️ اللغة المطلوبة (إن لم تُذكر)\n\n_مثال:_\n*الدرعية، 20/12، 8 أشخاص، عربي*",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "guide_confirmation"
  },
  "guide_confirmation": {
    "id": "guide_confirmation",
    "text": "✅ تم استلام طلبك بنجاح!\n\n📋 التفاصيل:\n{booking_details}\n\n👨‍🏫 سنوفر لك أفضل المرشدين المتاحين.\n⏱️ سيتواصل معك موظفنا المختص خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥",
    "options": [
      {
        "id": "1",
        "label": "خدمة أخرى",
        "emoji": "➕",
        "nextQuestionId": "welcome"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },

  // ========== خدمة العملاء ==========
  "customer_support": {
    "id": "customer_support",
    "text": "مرحبًا بك في الدعم الفني 🤝🔥\n\nاكتب استفسارك أو طلبك وسنقوم بخدمتك فورًا.\n\nيمكنك أيضًا اختيار:",
    "options": [
      {
        "id": "1",
        "label": "تتبع حجز موجود",
        "emoji": "📦",
        "nextQuestionId": "track_booking",
        "department": "support"
      },
      {
        "id": "2",
        "label": "تعديل حجز",
        "emoji": "✏️",
        "nextQuestionId": "modify_booking",
        "department": "support"
      },
      {
        "id": "3",
        "label": "إلغاء حجز",
        "emoji": "❌",
        "nextQuestionId": "cancel_booking",
        "department": "support"
      },
      {
        "id": "4",
        "label": "شكوى",
        "emoji": "⚠️",
        "nextQuestionId": "complaint",
        "department": "complaints"
      },
      {
        "id": "0",
        "label": "رجوع",
        "emoji": "⬅️",
        "nextQuestionId": "welcome"
      }
    ]
  },
  "track_booking": {
    "id": "track_booking",
    "text": "من فضلك أرسل رقم الحجز أو الاسم المسجل به الحجز:",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "support_response"
  },
  "modify_booking": {
    "id": "modify_booking",
    "text": "من فضلك أرسل:\n\n🔢 رقم الحجز\n✏️ التعديل المطلوب\n\n_مثال: رقم 12345، تغيير التاريخ من 10/12 إلى 15/12_",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "support_response"
  },
  "cancel_booking": {
    "id": "cancel_booking",
    "text": "من فضلك أرسل رقم الحجز المطلوب إلغاؤه:\n\n⚠️ ملاحظة: قد تطبق رسوم إلغاء حسب سياسة الحجز",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "support_response"
  },
  "complaint": {
    "id": "complaint",
    "text": "نعتذر عن أي إزعاج 🙏\n\nمن فضلك اشرح المشكلة بالتفصيل وسنعمل على حلها فورًا:",
    "requiresInput": true,
    "inputType": "text",
    "options": [],
    "nextStep": "complaint_response"
  },
  "complaint_response": {
    "id": "complaint_response",
    "text": "✅ تم تسجيل شكواك برقم: #{complaint_number}\n\n📋 التفاصيل:\n{booking_details}\n\n⏱️ سيتواصل معك مدير العلاقات خلال 15 دقيقة لحل المشكلة.\n\n*نعتذر مجددًا ونقدر تفهمك* 🙏",
    "options": [
      {
        "id": "1",
        "label": "الصفحة الرئيسية",
        "emoji": "🏠",
        "nextQuestionId": "welcome"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },
  "support_response": {
    "id": "support_response",
    "text": "✅ تم استلام طلبك!\n\n📋 التفاصيل:\n{booking_details}\n\n⏱️ سيتواصل معك موظف الدعم خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥",
    "options": [
      {
        "id": "1",
        "label": "طلب آخر",
        "emoji": "➕",
        "nextQuestionId": "customer_support"
      },
      {
        "id": "0",
        "label": "إنهاء",
        "emoji": "✔️",
        "nextQuestionId": "thank_you"
      }
    ]
  },

  // ========== رسالة الشكر النهائية ==========
  "thank_you": {
    "id": "thank_you",
    "text": "شكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥🌍\n\nسنرد عليك في أقرب وقت ممكن.\n\nيسعدنا خدمتك دائمًا! ✨",
    "options": [
      {
        "id": "1",
        "label": "العودة للقائمة الرئيسية",
        "emoji": "🏠",
        "nextQuestionId": "welcome"
      }
    ]
  }
};
