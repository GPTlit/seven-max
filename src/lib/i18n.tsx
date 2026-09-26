import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "fr";

const dict = {
  home: { ar: "الرئيسية", fr: "Accueil" },
  movies: { ar: "الأفلام", fr: "Films" },
  showtimes: { ar: "المواعيد", fr: "Séances" },
  tickets: { ar: "تذاكري", fr: "Billets" },
  more: { ar: "المزيد", fr: "Plus" },
  tagline: { ar: "أكثر من مجرد فيلم.. تجربة سينمائية متكاملة", fr: "Plus qu'un cinéma, une expérience" },
  nowShowing: { ar: "أفلام هذا الأسبوع", fr: "À l'affiche" },
  featured: { ar: "العروض المميزة", fr: "À la une" },
  bookNow: { ar: "احجز تذكرتك الآن", fr: "Réserver une séance" },
  trailer: { ar: "الإعلان", fr: "Bande-annonce" },
  cast: { ar: "طاقم التمثيل", fr: "Distribution" },
  today: { ar: "اليوم", fr: "Aujourd'hui" },
  tomorrow: { ar: "غداً", fr: "Demain" },
  noShows: { ar: "لا توجد عروض في هذا اليوم", fr: "Aucune séance ce jour" },
  chooseSeats: { ar: "اختيار المقاعد", fr: "Choisir vos sièges" },
  screen: { ar: "الشاشة", fr: "Écran" },
  available: { ar: "متاح", fr: "Disponible" },
  selected: { ar: "محدد", fr: "Sélectionné" },
  occupied: { ar: "محجوز", fr: "Occupé" },
  seats: { ar: "المقاعد", fr: "Sièges" },
  total: { ar: "المجموع", fr: "Total" },
  continue: { ar: "متابعة الدفع", fr: "Continuer" },
  payment: { ar: "الدفع", fr: "Paiement" },
  payMethod: { ar: "اختر وسيلة الدفع", fr: "Choisir un moyen de paiement" },
  counter: { ar: "الدفع في شباك التذاكر", fr: "Paiement à la caisse" },
  fullName: { ar: "الاسم الكامل", fr: "Nom complet" },
  phone: { ar: "رقم الهاتف", fr: "Téléphone" },
  whatsapp: { ar: "رقم واتساب", fr: "WhatsApp" },
  quantity: { ar: "عدد التذاكر", fr: "Quantité" },
  receipt: { ar: "صورة إيصال التحويل", fr: "Capture du reçu bancaire" },
  uploadReceipt: { ar: "اضغط لرفع الصورة", fr: "Touchez pour téléverser" },
  confirm: { ar: "تأكيد الحجز", fr: "Confirmer" },
  transferTo: { ar: "حوّل المبلغ إلى رقم سينما سفن ماكس ثم ارفع صورة الإيصال", fr: "Transférez le montant au compte Seven Max puis téléversez le reçu" },
  bookingSent: { ar: "تم إرسال الحجز!", fr: "Réservation envoyée !" },
  bookingPendingMsg: { ar: "حجزك قيد المراجعة. ستصلك التذكرة بعد التحقق من الدفع.", fr: "Votre réservation est en cours de vérification." },
  viewTicket: { ar: "عرض التذكرة", fr: "Voir mon billet" },
  backHome: { ar: "العودة إلى الرئيسية", fr: "Retour à l'accueil" },
  myTickets: { ar: "تذاكري", fr: "Mes réservations" },
  upcoming: { ar: "القادمة", fr: "À venir" },
  past: { ar: "السابقة", fr: "Passées" },
  status_pending: { ar: "قيد المراجعة", fr: "En attente" },
  status_approved: { ar: "مؤكد", fr: "Confirmé" },
  status_rejected: { ar: "مرفوض", fr: "Refusé" },
  status_cancelled: { ar: "ملغى", fr: "Annulé" },
  status_admitted: { ar: "تم الدخول", fr: "Admis" },
  food: { ar: "المأكولات والمشروبات", fr: "Snacks & boissons" },
  foodSub: { ar: "اطلب إلى مقعدك مباشرة", fr: "Livré directement à votre siège" },
  addToCart: { ar: "أضف", fr: "Ajouter" },
  seatNumber: { ar: "رقم المقعد", fr: "Numéro de siège" },
  order: { ar: "اطلب الآن", fr: "Commander" },
  myOrders: { ar: "طلباتي", fr: "Mes commandes" },
  food_preparing: { ar: "قيد التحضير", fr: "En préparation" },
  food_on_the_way: { ar: "في الطريق", fr: "En route" },
  food_delivered: { ar: "تم التوصيل", fr: "Livré" },
  vip: { ar: "عضوية VIP", fr: "Abonnement VIP" },
  vipSub: { ar: "بطاقة لك ولمرافق واحد", fr: "Pass pour vous + 1 accompagnant" },
  rental: { ar: "استئجار القاعة", fr: "Location de salle" },
  rentalSub: { ar: "نظّم مناسباتك في قاعاتنا الخاصة: أعياد ميلاد، اجتماعات، ندوات...", fr: "Organisez vos événements dans nos salles privées. Anniversaires, réunions, séminaires..." },
  send: { ar: "إرسال", fr: "Envoyer" },
  account: { ar: "حسابي", fr: "Mon compte" },
  signIn: { ar: "تسجيل الدخول", fr: "Se connecter" },
  signUp: { ar: "إنشاء حساب", fr: "Créer un compte" },
  signOut: { ar: "تسجيل الخروج", fr: "Se déconnecter" },
  email: { ar: "البريد الإلكتروني", fr: "E-mail" },
  password: { ar: "كلمة المرور", fr: "Mot de passe" },
  google: { ar: "المتابعة مع Google", fr: "Continuer avec Google" },
  apple: { ar: "المتابعة مع Apple", fr: "Continuer avec Apple" },
  or: { ar: "أو", fr: "ou" },
  admin: { ar: "لوحة الإدارة", fr: "Administration" },
  info: { ar: "معلومات عملية", fr: "Infos pratiques" },
  hours: { ar: "كل يوم من 10 صباحاً إلى منتصف الليل", fr: "Tous les jours de 10h à 00h" },
  address: { ar: "وسط المدينة، نواكشوط", fr: "Centre-ville, Nouakchott" },
  signInRequired: { ar: "سجّل الدخول للمتابعة", fr: "Connectez-vous pour continuer" },
  checkEmail: { ar: "تحقق من بريدك لتأكيد الحساب", fr: "Vérifiez votre e-mail pour confirmer" },
  seatsTaken: { ar: "بعض المقاعد لم تعد متاحة", fr: "Certains sièges ne sont plus disponibles" },
  admitted: { ar: "مرحباً بك! استمتع بالعرض", fr: "Bienvenue ! Bon film" },
  showQr: { ar: "أظهر هذا الرمز عند الباب", fr: "Présentez ce code à l'entrée" },
  subscribe: { ar: "اشترك الآن", fr: "S'abonner" },
  companion: { ar: "اسم المرافق", fr: "Nom de l'accompagnant" },
  perMonth: { ar: "/ شهرياً", fr: "/ mois" },
  memberSince: { ar: "صالح حتى", fr: "Valide jusqu'au" },
  cart: { ar: "السلة", fr: "Panier" },
  empty: { ar: "لا يوجد شيء بعد", fr: "Rien pour l'instant" },
  eventType: { ar: "نوع المناسبة", fr: "Type d'événement" },
  eventDate: { ar: "التاريخ", fr: "Date" },
  guests: { ar: "عدد الضيوف", fr: "Invités" },
  message: { ar: "رسالة", fr: "Message" },
  sent: { ar: "تم الإرسال، سنتواصل معك قريباً", fr: "Envoyé, nous vous recontacterons" },
  notifications: { ar: "الإشعارات", fr: "Notifications" },
} as const;

export type Key = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; dir: "rtl" | "ltr" };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const s = localStorage.getItem("sm-lang");
    if (s === "fr" || s === "ar") setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("sm-lang", l);
    setLangState(l);
  };
  const t = (k: Key) => dict[k][lang];
  return <I18nCtx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

export function fmtDate(d: string | Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return date.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", opts);
}
