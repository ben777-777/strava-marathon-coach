import React, { useState, useEffect, useRef } from 'react';
import { Activity, Calendar, MessageCircle, Utensils, ChevronRight, TrendingUp, Clock, Flame, Target, Zap, Play, CheckCircle, Send, Heart, MapPin, Apple, Droplet, RefreshCw, LogIn, ChevronLeft, X, Award, Coffee, Moon, Sun, Dumbbell } from 'lucide-react';

// ============================================
// DONNÉES SIMULÉES - Thomas, 28 ans, Marathon Paris 2026
// ============================================

const MOCK_USER = {
  id: 12345,
  name: "Thomas",
  age: 28,
  weight: 72,
  profile: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/12345/large.jpg"
};

const MOCK_ACTIVITIES = [
  { id: 1, name: "Fractionné Bois de Vincennes", date: "2026-01-26T07:30:00", distance: 10200, duration: 2820, pace: 276, averageHeartrate: 165, maxHeartrate: 182, elevationGain: 45 },
  { id: 2, name: "Footing récup Canal Saint-Martin", date: "2026-01-24T18:45:00", distance: 8500, duration: 2805, pace: 330, averageHeartrate: 142, maxHeartrate: 155, elevationGain: 12 },
  { id: 3, name: "Sortie longue Forêt de Meudon", date: "2026-01-21T08:00:00", distance: 22400, duration: 7392, pace: 330, averageHeartrate: 148, maxHeartrate: 162, elevationGain: 185 },
  { id: 4, name: "Seuil Parc Montsouris", date: "2026-01-19T12:15:00", distance: 12000, duration: 3600, pace: 300, averageHeartrate: 158, maxHeartrate: 172, elevationGain: 35 },
  { id: 5, name: "Footing Jardin du Luxembourg", date: "2026-01-17T07:00:00", distance: 7200, duration: 2520, pace: 350, averageHeartrate: 138, maxHeartrate: 148, elevationGain: 22 },
  { id: 6, name: "Fractionné Stade Charléty", date: "2026-01-14T19:00:00", distance: 9800, duration: 2646, pace: 270, averageHeartrate: 168, maxHeartrate: 185, elevationGain: 8 },
  { id: 7, name: "Sortie longue Vallée de Chevreuse", date: "2026-01-12T07:30:00", distance: 25100, duration: 8283, pace: 330, averageHeartrate: 145, maxHeartrate: 158, elevationGain: 245 },
  { id: 8, name: "Footing Bords de Seine", date: "2026-01-10T18:00:00", distance: 10000, duration: 3300, pace: 330, averageHeartrate: 140, maxHeartrate: 152, elevationGain: 15 },
];

const MOCK_WEEKLY_VOLUME = [
  { week: "S-7", km: 38, sessions: 4 },
  { week: "S-6", km: 42, sessions: 4 },
  { week: "S-5", km: 45, sessions: 5 },
  { week: "S-4", km: 48, sessions: 5 },
  { week: "S-3", km: 52, sessions: 5 },
  { week: "S-2", km: 44, sessions: 4 },
  { week: "S-1", km: 55, sessions: 5 },
  { week: "Actuelle", km: 32, sessions: 3 },
];

const MOCK_TRAINING_PLAN = {
  marathonDate: "2026-04-12",
  targetTime: "3h30",
  weeksToMarathon: 11,
  currentWeek: 6,
  paceZones: {
    easy: "5'30-6'00/km",
    marathon: "4'58/km",
    threshold: "4'30-4'40/km",
    interval: "4'00-4'15/km"
  },
  phases: [
    { name: "Base", weeks: [1, 4], focus: "Construction aérobie", color: "blue" },
    { name: "Développement", weeks: [5, 8], focus: "Travail au seuil", color: "yellow" },
    { name: "Spécifique", weeks: [9, 12], focus: "Allure marathon", color: "orange" },
    { name: "Affûtage", weeks: [13, 16], focus: "Fraîcheur", color: "green" }
  ],
  weeklyPlans: [
    {
      week: 6,
      phase: "Développement",
      totalKm: 52,
      focus: "Travail au seuil + sortie longue 24km",
      sessions: [
        { day: "Lundi", type: "Repos", duration: "-", description: "Récupération active, étirements", targetPace: "-", icon: "rest" },
        { day: "Mardi", type: "Fractionné", duration: "55min", description: "Échauffement 15' + 10x400m (r:1'30) + retour calme", targetPace: "4'05/km sur 400m", icon: "interval", done: true },
        { day: "Mercredi", type: "Footing", duration: "50min", description: "Endurance fondamentale, terrain plat", targetPace: "5'30-5'45/km", icon: "easy", done: true },
        { day: "Jeudi", type: "Seuil", duration: "1h05", description: "Échauffement 20' + 3x10' seuil (r:3') + retour calme", targetPace: "4'35/km sur portions seuil", icon: "threshold", current: true },
        { day: "Vendredi", type: "Repos ou PPG", duration: "30min", description: "Renforcement: squats, fentes, gainage", targetPace: "-", icon: "strength" },
        { day: "Samedi", type: "Footing", duration: "45min", description: "Récupération avant sortie longue", targetPace: "5'45-6'00/km", icon: "easy" },
        { day: "Dimanche", type: "Sortie longue", duration: "2h00", description: "24km progressif: 18km EF + 6km allure marathon", targetPace: "5'30 puis 4'58/km", icon: "long" }
      ],
      weeklyTip: "Semaine clé ! Ta sortie longue de dimanche est cruciale. Prépare ta nutrition la veille et teste tes gels pendant la sortie."
    },
    {
      week: 7,
      phase: "Développement",
      totalKm: 48,
      focus: "Récupération relative après semaine intense",
      sessions: [
        { day: "Lundi", type: "Repos", duration: "-", description: "Récupération complète", targetPace: "-", icon: "rest" },
        { day: "Mardi", type: "Footing + éducatifs", duration: "50min", description: "45' footing + 5' éducatifs techniques", targetPace: "5'30/km", icon: "easy" },
        { day: "Mercredi", type: "Fractionné court", duration: "50min", description: "Échauffement + 12x200m (r:1') + retour calme", targetPace: "3'50/km sur 200m", icon: "interval" },
        { day: "Jeudi", type: "Footing", duration: "55min", description: "Endurance fondamentale vallonné", targetPace: "5'30-5'45/km", icon: "easy" },
        { day: "Vendredi", type: "Repos", duration: "-", description: "Récupération", targetPace: "-", icon: "rest" },
        { day: "Samedi", type: "Seuil", duration: "1h00", description: "Échauffement + 25' seuil continu + retour calme", targetPace: "4'35/km", icon: "threshold" },
        { day: "Dimanche", type: "Sortie longue", duration: "1h40", description: "20km en endurance fondamentale", targetPace: "5'30/km", icon: "long" }
      ],
      weeklyTip: "Semaine de récupération relative. Écoute ton corps et n'hésite pas à remplacer une séance par du repos si tu sens de la fatigue."
    },
    {
      week: 8,
      phase: "Développement",
      totalKm: 55,
      focus: "Dernière grosse semaine avant phase spécifique",
      sessions: [
        { day: "Lundi", type: "Repos", duration: "-", description: "Récupération active", targetPace: "-", icon: "rest" },
        { day: "Mardi", type: "Fartlek", duration: "1h00", description: "50' avec 8x(2' vite / 2' lent)", targetPace: "4'20/km sur accélérations", icon: "interval" },
        { day: "Mercredi", type: "Footing", duration: "55min", description: "Endurance fondamentale", targetPace: "5'30-5'45/km", icon: "easy" },
        { day: "Jeudi", type: "Seuil long", duration: "1h10", description: "Échauffement + 2x15' seuil (r:4') + retour calme", targetPace: "4'35/km", icon: "threshold" },
        { day: "Vendredi", type: "PPG", duration: "35min", description: "Circuit renforcement spécifique coureur", targetPace: "-", icon: "strength" },
        { day: "Samedi", type: "Footing", duration: "45min", description: "Récupération", targetPace: "5'45-6'00/km", icon: "easy" },
        { day: "Dimanche", type: "Sortie longue", duration: "2h15", description: "28km : dernier long avant affûtage progressif", targetPace: "5'20-5'30/km", icon: "long" }
      ],
      weeklyTip: "Semaine la plus chargée du cycle ! Après ça, on commence à réduire progressivement. Hydratation et sommeil sont tes meilleurs alliés."
    }
  ]
};

const MOCK_NUTRITION = {
  sortie_longue: {
    before: {
      timing: "Commencer la veille",
      meals: [
        { when: "Veille au soir", what: "Pâtes complètes + poulet + légumes verts", why: "Recharge glycogène musculaire", calories: 750, macros: { carbs: 110, protein: 35, fat: 18 } },
        { when: "3h avant", what: "Porridge flocons d'avoine + banane + miel", why: "Glucides lents + rapides pour énergie durable", calories: 450, macros: { carbs: 75, protein: 12, fat: 8 } },
        { when: "30min avant", what: "1/2 barre énergétique ou compote", why: "Boost glycémie sans lourdeur", calories: 100, macros: { carbs: 22, protein: 2, fat: 1 } }
      ],
      hydration: "500ml d'eau dans les 2h précédant le départ. Évite le café si tu n'as pas l'habitude."
    },
    during: {
      needed: true,
      recommendation: "Pour une sortie de 2h+, prévois 1 gel ou équivalent toutes les 45min à partir de la 45ème minute.",
      products: ["Gel énergétique (Maurten, GU, STC)", "Pâtes de fruits", "Banane coupée", "Boisson isotonique"],
      hydrationPerHour: "500-750ml selon température. Bois avant d'avoir soif, par petites gorgées régulières."
    },
    after: {
      timing: "Dans les 30 minutes",
      meal: { what: "Smoothie récup : lait + banane + beurre de cacahuète + flocons d'avoine + cacao", why: "Fenêtre métabolique : les muscles absorbent mieux les nutriments. Ratio glucides/protéines 3:1 optimal.", macros: { carbs: 65, protein: 22, fat: 12 } },
      hydration: "1L minimum dans les 2h post-effort. Ajoute une pincée de sel si forte transpiration.",
      recovery: ["Étirements doux 10min", "Douche fraîche (pas glacée)", "Sieste 20min si possible", "Repas complet 2h après"]
    },
    tips: [
      "Teste TOUJOURS ta nutrition à l'entraînement avant le marathon",
      "Note ce qui fonctionne pour toi (marque de gel, timing, quantité)",
      "Évite les fibres et graisses le matin de la sortie longue",
      "Si tu ressens des crampes, c'est souvent un manque de sodium, pas de magnésium"
    ]
  },
  fractionne: {
    before: {
      timing: "2-3h avant",
      meals: [
        { when: "2-3h avant", what: "Toast pain complet + confiture + 1 œuf", why: "Énergie rapide sans lourdeur pour effort intense", calories: 320, macros: { carbs: 45, protein: 12, fat: 10 } },
        { when: "45min avant", what: "1/2 banane ou quelques dattes", why: "Pic glycémique contrôlé avant l'effort", calories: 80, macros: { carbs: 20, protein: 1, fat: 0 } }
      ],
      hydration: "300-400ml d'eau. Évite de trop boire juste avant pour ne pas être lourd."
    },
    during: {
      needed: false,
      recommendation: "Pour une séance de moins d'1h15, l'eau suffit. Bois quelques gorgées entre les séries si besoin.",
      products: ["Eau plate"],
      hydrationPerHour: "250-400ml selon chaleur"
    },
    after: {
      timing: "Dans les 30-45 minutes",
      meal: { what: "Yaourt grec + granola + fruits rouges + filet de miel", why: "Protéines pour réparer les micro-lésions musculaires + glucides pour reconstituer les réserves", macros: { carbs: 45, protein: 20, fat: 8 } },
      hydration: "500ml d'eau ou eau gazeuse",
      recovery: ["Étirements dynamiques 5min", "Marche 5-10min pour redescendre le cardio"]
    },
    tips: [
      "Le fractionné à jeun n'est pas recommandé pour les débutants",
      "Si séance le soir, déjeune normalement et prends une collation légère 2h avant",
      "Les crampes pendant le fractionné = souvent mauvais échauffement, pas la nutrition"
    ]
  },
  seuil: {
    before: {
      timing: "2-3h avant",
      meals: [
        { when: "2-3h avant", what: "Riz basmati + blanc de poulet + courgettes", why: "Repas complet et digeste pour effort prolongé", calories: 480, macros: { carbs: 60, protein: 32, fat: 10 } },
        { when: "1h avant", what: "Compote de pomme sans sucre ajouté", why: "Glucides simples facilement assimilables", calories: 70, macros: { carbs: 17, protein: 0, fat: 0 } }
      ],
      hydration: "400ml d'eau dans les 2h précédant"
    },
    during: {
      needed: false,
      recommendation: "Pour une séance d'1h-1h15, l'eau suffit généralement. Tu peux prendre un gel si tu sens une baisse d'énergie vers la fin.",
      products: ["Eau", "Gel (optionnel)"],
      hydrationPerHour: "300-500ml"
    },
    after: {
      timing: "Dans les 30 minutes",
      meal: { what: "Bowl : quinoa + saumon fumé + avocat + graines de courge", why: "Oméga-3 anti-inflammatoires + protéines + glucides complexes", macros: { carbs: 50, protein: 28, fat: 22 } },
      hydration: "600ml d'eau",
      recovery: ["Rouleau de massage sur les mollets et quadriceps", "Surélever les jambes 10min"]
    },
    tips: [
      "Le seuil sollicite beaucoup les réserves glycogéniques : assure-toi d'être bien chargé",
      "Évite les aliments gras le matin d'une séance seuil",
      "Si tu fais ta séance le midi, petit-déjeuner copieux et collation légère à 10h"
    ]
  }
};

const COACH_RESPONSES = {
  fatigue: "La fatigue en semaine 6, c'est classique ! Ton corps accumule la charge d'entraînement. Deux options : soit tu maintiens et tu fais confiance au processus (la forme viendra en phase d'affûtage), soit tu écoutes ton corps et tu transformes la séance de jeudi en footing léger. Qu'est-ce que tu ressens exactement ? Jambes lourdes, fatigue générale, ou mental en berne ?",
  allure: "Pour ton objectif 3h30, ton allure marathon cible est 4'58/km. Mais attention : en sortie longue, tu ne dois PAS courir à cette allure tout le long ! Fais 70-80% en endurance fondamentale (5'30) et seulement les derniers km à allure marathon. C'est comme ça qu'on apprend au corps à tenir.",
  blessure: "Douleur au genou = on ne plaisante pas. Stop la course immédiatement. Glace 15min, 3x/jour. Si ça persiste plus de 3 jours, consulte un kiné du sport. On peut adapter le plan en attendant : vélo, natation, elliptique pour garder le cardio sans l'impact. Décris-moi la douleur : c'est où exactement et quand ça fait mal ?",
  motivation: "Le creux de motivation en milieu de prépa, tout le monde y passe ! Rappelle-toi pourquoi tu t'es inscrit à ce marathon. Visualise la ligne d'arrivée. Et surtout : une mauvaise séance vaut mieux que pas de séance. Mets juste tes chaussures et sors 20 minutes. Souvent, une fois dehors, ça revient. 💪",
  nutrition: "Pour la nutrition marathon, la règle d'or c'est : RIEN DE NOUVEAU LE JOUR J. Teste tout en entraînement. Gels, barres, petit-déj... Si tu veux, dis-moi ta séance de dimanche et je te donne un plan nutrition détaillé.",
  default: "Bonne question ! Pour te répondre au mieux, peux-tu me donner plus de contexte ? Je suis là pour t'aider sur l'entraînement, la nutrition, la récupération, ou le mental. 🏃‍♂️"
};

// ============================================
// HELPERS
// ============================================

const formatPace = (secondsPerKm) => {
  if (!secondsPerKm) return '--';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}'${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
};

const getSessionIcon = (type) => {
  const icons = {
    rest: Moon,
    easy: Sun,
    interval: Zap,
    threshold: Flame,
    long: MapPin,
    strength: Dumbbell
  };
  return icons[type] || Activity;
};

const getSessionColor = (type) => {
  const colors = {
    rest: "bg-zinc-600",
    easy: "bg-green-500/20 text-green-400",
    interval: "bg-red-500/20 text-red-400",
    threshold: "bg-orange-500/20 text-orange-400",
    long: "bg-blue-500/20 text-blue-400",
    strength: "bg-purple-500/20 text-purple-400"
  };
  return colors[type] || "bg-zinc-700";
};

// ============================================
// MAIN APP
// ============================================

export default function MarathonCoachDemo() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [nutritionAdvice, setNutritionAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'coach', text: "Salut Thomas ! Je suis ton coach IA pour le Marathon de Paris. Tu en es à la semaine 6 de ton plan — on attaque le dur ! Comment tu te sens aujourd'hui ? 💪" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate Strava connection
  const connectStrava = () => {
    setLoading(true);
    setTimeout(() => {
      setUser(MOCK_USER);
      setActivities(MOCK_ACTIVITIES);
      setLoading(false);
      setCurrentScreen('setup');
    }, 1500);
  };

  // Simulate plan generation
  const generatePlan = () => {
    setLoading(true);
    setTimeout(() => {
      setTrainingPlan(MOCK_TRAINING_PLAN);
      setLoading(false);
      setCurrentScreen('dashboard');
    }, 2000);
  };

  // Get nutrition advice for session
  const getNutritionForSession = (session) => {
    setSelectedSession(session);
    let nutritionKey = 'seuil';
    if (session.type.toLowerCase().includes('sortie longue') || session.type.toLowerCase().includes('long')) {
      nutritionKey = 'sortie_longue';
    } else if (session.type.toLowerCase().includes('fractionné') || session.type.toLowerCase().includes('fartlek')) {
      nutritionKey = 'fractionne';
    }
    setNutritionAdvice(MOCK_NUTRITION[nutritionKey]);
    setCurrentScreen('nutrition');
  };

  // Chat with coach
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { from: 'user', text: chatInput }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let response = COACH_RESPONSES.default;
      if (msg.includes('fatigu') || msg.includes('épuisé') || msg.includes('crevé')) {
        response = COACH_RESPONSES.fatigue;
      } else if (msg.includes('allure') || msg.includes('vitesse') || msg.includes('pace')) {
        response = COACH_RESPONSES.allure;
      } else if (msg.includes('mal') || msg.includes('douleur') || msg.includes('bless')) {
        response = COACH_RESPONSES.blessure;
      } else if (msg.includes('motiv') || msg.includes('envie') || msg.includes('dur')) {
        response = COACH_RESPONSES.motivation;
      } else if (msg.includes('manger') || msg.includes('nutrition') || msg.includes('gel') || msg.includes('petit')) {
        response = COACH_RESPONSES.nutrition;
      }
      setChatMessages(prev => [...prev, { from: 'coach', text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  // ============================================
  // COMPONENTS
  // ============================================

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2 flex justify-around z-40">
      {[
        { id: 'dashboard', icon: Activity, label: 'Home' },
        { id: 'plan', icon: Calendar, label: 'Plan' },
        { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
        { id: 'coach', icon: MessageCircle, label: 'Coach' },
        { id: 'stats', icon: TrendingUp, label: 'Stats' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentScreen(item.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${
            currentScreen === item.id ? 'text-lime-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <item.icon size={22} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const StatusBar = () => (
    <div className="bg-zinc-900 px-4 py-2 flex justify-between items-center text-xs text-zinc-400 sticky top-0 z-50">
      <span>9:41</span>
      <span className="font-semibold text-lime-400">Marathon Coach AI</span>
      <div className="flex gap-1 items-center">
        <span>100%</span>
        <div className="w-6 h-3 border border-zinc-400 rounded-sm">
          <div className="bg-lime-400 h-full w-full rounded-sm"></div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // SCREENS
  // ============================================

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Activity className="text-black" size={48} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Marathon Coach AI</h1>
      <p className="text-zinc-400 mb-8 max-w-xs">
        Ton coach intelligent pour préparer le marathon. Plan personnalisé + Nutrition + Suivi Strava.
      </p>

      <button
        onClick={connectStrava}
        disabled={loading}
        className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 flex items-center justify-center gap-3 mb-4"
      >
        {loading ? (
          <RefreshCw className="animate-spin text-white" size={24} />
        ) : (
          <>
            <LogIn className="text-white" size={24} />
            <span className="text-white font-semibold text-lg">Connecter Strava</span>
          </>
        )}
      </button>

      <p className="text-zinc-500 text-xs">
        Démo interactive • Données simulées
      </p>
    </div>
  );

  const SetupScreen = () => (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center text-2xl">
          🏃‍♂️
        </div>
        <div>
          <p className="text-zinc-400 text-sm">Connecté en tant que</p>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        </div>
        <div className="ml-auto bg-green-500/20 px-3 py-1 rounded-full">
          <span className="text-green-400 text-sm">✓ Strava</span>
        </div>
      </div>

      <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-1">8 activités importées</h3>
        <p className="text-zinc-400 text-sm">312 km sur les 8 dernières semaines</p>
      </div>

      <div className="bg-zinc-800 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Target className="text-lime-400" size={20} />
          Configure ton objectif
        </h3>

        <div>
          <label className="text-zinc-400 text-sm">Marathon</label>
          <div className="bg-zinc-700 text-white rounded-lg p-3 mt-1 flex items-center gap-2">
            <MapPin className="text-lime-400" size={18} />
            <span>Marathon de Paris — 12 avril 2026</span>
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Temps visé</label>
          <div className="bg-zinc-700 text-white rounded-lg p-3 mt-1">3h30 (4'58/km)</div>
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Ton niveau</label>
          <div className="bg-zinc-700 text-white rounded-lg p-3 mt-1">Intermédiaire (2ème marathon)</div>
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Jours d'entraînement / semaine</label>
          <div className="flex gap-2 mt-1">
            {[3, 4, 5, 6].map(n => (
              <div
                key={n}
                className={`flex-1 py-2 rounded-lg font-semibold text-center ${
                  n === 5 ? 'bg-lime-400 text-black' : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full bg-lime-400 text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Génération en cours...
            </>
          ) : (
            <>
              <Zap size={20} />
              Générer mon plan personnalisé
            </>
          )}
        </button>
      </div>
    </div>
  );

  const Dashboard = () => {
    const todaySession = trainingPlan.weeklyPlans[0].sessions.find(s => s.current);
    const SessionIcon = getSessionIcon(todaySession?.icon);

    return (
      <div className="p-4 pb-24 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-400 text-sm">Bonjour</p>
            <h1 className="text-2xl font-bold text-white">{user?.name} 🏃‍♂️</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Flame className="text-orange-500" size={18} />
              <span className="text-white font-semibold">12</span>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className="bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl p-4 text-black">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-black/70 text-sm font-medium">Marathon de Paris</p>
              <h2 className="text-xl font-bold">Objectif {trainingPlan.targetTime}</h2>
              <p className="text-black/80">Allure : 4'58/km</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{trainingPlan.weeksToMarathon}</p>
              <p className="text-sm text-black/70">semaines</p>
            </div>
          </div>
          <div className="mt-3 bg-black/20 rounded-full h-2">
            <div className="bg-black h-2 rounded-full" style={{ width: `${(trainingPlan.currentWeek / 16) * 100}%` }}></div>
          </div>
          <p className="text-xs text-black/70 mt-1">Semaine {trainingPlan.currentWeek}/16 • Phase {trainingPlan.weeklyPlans[0].phase}</p>
        </div>

        {/* Today's Session */}
        {todaySession && (
          <div className="bg-zinc-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Séance du jour</h3>
              <span className="text-lime-400 text-sm">Jeudi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getSessionColor(todaySession.icon)}`}>
                <SessionIcon size={28} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{todaySession.type}</p>
                <p className="text-zinc-400 text-sm">{todaySession.duration} • {todaySession.targetPace}</p>
              </div>
              <button
                onClick={() => getNutritionForSession(todaySession)}
                className="bg-lime-400 text-black p-3 rounded-xl"
              >
                <Utensils size={20} />
              </button>
            </div>
            <p className="text-zinc-400 text-sm mt-3">{todaySession.description}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <Target className="text-lime-400 mx-auto mb-1" size={20} />
            <p className="text-xl font-bold text-white">55</p>
            <p className="text-xs text-zinc-400">km/sem</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <Activity className="text-blue-400 mx-auto mb-1" size={20} />
            <p className="text-xl font-bold text-white">5</p>
            <p className="text-xs text-zinc-400">séances</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <Clock className="text-orange-400 mx-auto mb-1" size={20} />
            <p className="text-xl font-bold text-white">5'08</p>
            <p className="text-xs text-zinc-400">allure moy</p>
          </div>
        </div>

        {/* Weekly Tip */}
        <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-purple-500/30">
          <h3 className="text-white font-semibold mb-2">💡 Conseil de la semaine</h3>
          <p className="text-zinc-300 text-sm">{trainingPlan.weeklyPlans[0].weeklyTip}</p>
        </div>

        {/* Recent Strava Activities */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Dernières sorties Strava</h3>
            <button onClick={() => setCurrentScreen('stats')} className="text-lime-400 text-sm flex items-center gap-1">
              Voir tout <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {activities.slice(0, 3).map((run, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                    <MapPin className="text-lime-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{(run.distance / 1000).toFixed(1)} km</p>
                    <p className="text-zinc-400 text-xs">{new Date(run.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatPace(run.pace)}/km</p>
                  <p className="text-zinc-400 text-xs flex items-center gap-1 justify-end">
                    <Heart size={10} /> {run.averageHeartrate} bpm
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PlanScreen = () => (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="text-2xl font-bold text-white">Plan d'entraînement</h1>

      {/* Pace Zones */}
      <div className="bg-zinc-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Tes zones d'allure</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(trainingPlan.paceZones).map(([zone, pace]) => (
            <div key={zone} className="bg-zinc-700 rounded-lg p-2">
              <p className="text-zinc-400 text-xs capitalize">{zone === 'easy' ? 'Endurance' : zone === 'marathon' ? 'Allure marathon' : zone === 'threshold' ? 'Seuil' : 'Intervalle'}</p>
              <p className="text-white font-semibold">{pace}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Plans */}
      {trainingPlan.weeklyPlans.map((week, i) => (
        <div key={i} className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">Semaine {week.week}</h3>
              {i === 0 && <span className="bg-lime-400 text-black text-xs px-2 py-0.5 rounded-full font-medium">En cours</span>}
            </div>
            <span className="text-lime-400 text-sm font-medium">{week.totalKm} km</span>
          </div>
          <p className="text-zinc-400 text-xs mb-3">{week.phase} • {week.focus}</p>

          <div className="space-y-2">
            {week.sessions.map((session, j) => {
              const SessionIcon = getSessionIcon(session.icon);
              return (
                <div
                  key={j}
                  onClick={() => session.type !== 'Repos' && getNutritionForSession(session)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    session.current ? 'bg-lime-400/20 border border-lime-400' :
                    session.done ? 'bg-zinc-700/50 opacity-60' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSessionColor(session.icon)}`}>
                    {session.done ? <CheckCircle className="text-lime-400" size={20} /> : <SessionIcon size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${session.done ? 'text-zinc-400' : 'text-white'}`}>
                        {session.day} — {session.type}
                      </p>
                      {session.current && <span className="text-lime-400 text-xs">Aujourd'hui</span>}
                    </div>
                    <p className="text-zinc-400 text-xs truncate">{session.duration} • {session.targetPace}</p>
                  </div>
                  {session.type !== 'Repos' && !session.done && (
                    <Utensils className="text-zinc-500 flex-shrink-0" size={16} />
                  )}
                </div>
              );
            })}
          </div>

          {week.weeklyTip && i === 0 && (
            <div className="mt-3 p-2 bg-zinc-700 rounded-lg">
              <p className="text-zinc-300 text-xs">💡 {week.weeklyTip}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const NutritionScreen = () => (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center gap-3">
        {selectedSession && (
          <button onClick={() => setCurrentScreen('plan')} className="text-zinc-400">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Utensils className="text-lime-400" />
          Nutrition
        </h1>
      </div>

      {selectedSession && (
        <div className="bg-zinc-800 rounded-xl p-3">
          <p className="text-zinc-400 text-sm">Conseils pour</p>
          <p className="text-white font-semibold">{selectedSession.type} — {selectedSession.duration}</p>
        </div>
      )}

      {!nutritionAdvice && !selectedSession && (
        <div className="bg-zinc-800 rounded-2xl p-6 text-center">
          <Apple className="text-zinc-500 mx-auto mb-3" size={48} />
          <p className="text-zinc-400">Clique sur une séance dans ton plan pour obtenir des conseils nutrition personnalisés.</p>
        </div>
      )}

      {nutritionAdvice && (
        <>
          {/* Before */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Coffee className="text-orange-400" size={18} />
              Avant la séance
            </h3>
            <p className="text-zinc-400 text-sm mb-3">{nutritionAdvice.before.timing}</p>
            {nutritionAdvice.before.meals.map((meal, i) => (
              <div key={i} className="bg-zinc-700 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-lime-400 text-sm font-medium">{meal.when}</span>
                  <span className="text-zinc-400 text-xs">{meal.calories} kcal</span>
                </div>
                <p className="text-white font-medium">{meal.what}</p>
                <p className="text-zinc-400 text-xs mt-1">{meal.why}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">G: {meal.macros.carbs}g</span>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">P: {meal.macros.protein}g</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">L: {meal.macros.fat}g</span>
                </div>
              </div>
            ))}
            <p className="text-zinc-400 text-sm flex items-center gap-2 mt-2">
              <Droplet className="text-blue-400" size={14} />
              {nutritionAdvice.before.hydration}
            </p>
          </div>

          {/* During */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="text-yellow-400" size={18} />
              Pendant la séance
            </h3>
            <p className="text-white">{nutritionAdvice.during.recommendation}</p>
            {nutritionAdvice.during.products.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {nutritionAdvice.during.products.map((p, i) => (
                  <span key={i} className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm">{p}</span>
                ))}
              </div>
            )}
            <p className="text-zinc-400 text-sm mt-3">
              💧 {nutritionAdvice.during.hydrationPerHour}
            </p>
          </div>

          {/* After */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} />
              Après la séance ({nutritionAdvice.after.timing})
            </h3>
            <div className="bg-zinc-700 rounded-lg p-3">
              <p className="text-white font-medium">{nutritionAdvice.after.meal.what}</p>
              <p className="text-zinc-400 text-xs mt-1">{nutritionAdvice.after.meal.why}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">G: {nutritionAdvice.after.meal.macros.carbs}g</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">P: {nutritionAdvice.after.meal.macros.protein}g</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">L: {nutritionAdvice.after.meal.macros.fat}g</span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mt-3">💧 {nutritionAdvice.after.hydration}</p>
            <div className="mt-3">
              <p className="text-zinc-400 text-sm mb-2">Récupération :</p>
              <div className="flex flex-wrap gap-2">
                {nutritionAdvice.after.recovery.map((tip, i) => (
                  <span key={i} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">{tip}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-2">💡 À retenir</h3>
            <ul className="space-y-2">
              {nutritionAdvice.tips.map((tip, i) => (
                <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );

  const CoachScreen = () => (
    <div className="flex flex-col h-screen bg-zinc-900">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center">
            <Zap className="text-black" size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold">Coach IA Marathon</h1>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Powered by Claude
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-36">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.from === 'user'
                ? 'bg-lime-400 text-black rounded-br-sm'
                : 'bg-zinc-800 text-white rounded-bl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["Je suis fatigué", "Quelle allure ?", "Nutrition dimanche", "Mal au genou"].map((q, i) => (
            <button
              key={i}
              onClick={() => { setChatInput(q); }}
              className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-xs whitespace-nowrap hover:bg-zinc-700"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Pose ta question au coach..."
            className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <button onClick={sendMessage} className="bg-lime-400 text-black p-3 rounded-full">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const StatsScreen = () => {
    const totalKm = activities.reduce((sum, a) => sum + a.distance / 1000, 0);
    const avgPace = activities.reduce((sum, a) => sum + a.pace, 0) / activities.length;
    const avgHr = activities.filter(a => a.averageHeartrate).reduce((s, a) => s + a.averageHeartrate, 0) / activities.filter(a => a.averageHeartrate).length;
    const maxVolume = Math.max(...MOCK_WEEKLY_VOLUME.map(w => w.km));

    return (
      <div className="p-4 pb-24 space-y-5">
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-lime-400" size={18} />
              <span className="text-zinc-400 text-sm">Distance totale</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalKm.toFixed(0)} km</p>
            <p className="text-green-400 text-xs">8 dernières semaines</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-blue-400" size={18} />
              <span className="text-zinc-400 text-sm">Sorties</span>
            </div>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
            <p className="text-zinc-400 text-xs">Importées de Strava</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={18} />
              <span className="text-zinc-400 text-sm">Allure moyenne</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatPace(avgPace)}/km</p>
            <p className="text-green-400 text-xs">-8s vs mois dernier</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="text-red-400" size={18} />
              <span className="text-zinc-400 text-sm">FC moyenne</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(avgHr)} bpm</p>
            <p className="text-zinc-400 text-xs">Zone 2-3</p>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-4">Volume hebdomadaire</h3>
          <div className="flex items-end justify-between h-32 gap-1">
            {MOCK_WEEKLY_VOLUME.map((week, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    i === MOCK_WEEKLY_VOLUME.length - 1 ? 'bg-lime-400' : 'bg-zinc-600'
                  }`}
                  style={{ height: `${(week.km / maxVolume) * 100}%` }}
                ></div>
                <span className="text-xs text-zinc-400 mt-2 truncate w-full text-center">{week.week}</span>
                <span className="text-xs text-zinc-500">{week.km}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div>
          <h3 className="text-white font-semibold mb-3">Historique Strava</h3>
          <div className="space-y-2">
            {activities.map((run, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium truncate flex-1 mr-2">{run.name}</span>
                  <span className="text-zinc-400 text-xs">{new Date(run.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-lime-400 font-semibold">{(run.distance / 1000).toFixed(1)} km</span>
                    <span className="text-zinc-400">{formatDuration(run.duration)}</span>
                    <span className="text-zinc-400">{formatPace(run.pace)}/km</span>
                  </div>
                  {run.averageHeartrate && (
                    <span className="text-zinc-400 text-xs flex items-center gap-1">
                      <Heart size={12} className="text-red-400" /> {run.averageHeartrate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-white font-semibold mb-3">Badges débloqués</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🔥", name: "12 jours streak", unlocked: true },
              { icon: "🎯", name: "Premier 25km", unlocked: true },
              { icon: "⚡", name: "Sub 5'/km", unlocked: true },
              { icon: "🏔️", name: "1000m D+", unlocked: false },
              { icon: "🌙", name: "Night runner", unlocked: false },
              { icon: "🏅", name: "Marathonien", unlocked: false }
            ].map((badge, i) => (
              <div
                key={i}
                className={`bg-zinc-800 rounded-xl p-3 text-center ${!badge.unlocked ? 'opacity-40' : ''}`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-xs text-zinc-300 mt-1">{badge.name}</p>
                {badge.unlocked && <Award className="text-lime-400 mx-auto mt-1" size={14} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (currentScreen === 'welcome') return <WelcomeScreen />;
  if (currentScreen === 'setup') return <SetupScreen />;

  const screens = {
    dashboard: <Dashboard />,
    plan: <PlanScreen />,
    nutrition: <NutritionScreen />,
    coach: <CoachScreen />,
    stats: <StatsScreen />
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white font-sans">
      <StatusBar />
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        {screens[currentScreen]}
      </div>
      <NavBar />
    </div>
  );
}
