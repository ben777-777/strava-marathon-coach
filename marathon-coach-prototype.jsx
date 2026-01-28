import React, { useState, useEffect } from 'react';
import { Activity, Calendar, MessageCircle, Trophy, User, ChevronRight, TrendingUp, Clock, Flame, Target, Zap, Award, Play, CheckCircle, ArrowLeft, Send, Heart, MapPin } from 'lucide-react';

// Data for Thomas, 28 ans, préparation marathon Paris 2026
const userData = {
  name: "Thomas",
  age: 28,
  goal: "Marathon de Paris 2026",
  targetTime: "3h30",
  currentLevel: "Intermédiaire",
  weeksToGo: 14,
  weeklyKm: 45,
  streak: 12,
  totalRuns: 47,
  avatar: "🏃‍♂️"
};

const weekPlan = [
  { day: "Lun", type: "Repos", duration: null, done: true, description: "Récupération active" },
  { day: "Mar", type: "Fractionné", duration: "50min", done: true, description: "10x400m à 4'30/km + récup" },
  { day: "Mer", type: "Footing", duration: "45min", done: true, description: "Endurance fondamentale 5'30/km" },
  { day: "Jeu", type: "PPG", duration: "30min", done: false, description: "Renforcement musculaire", current: true },
  { day: "Ven", type: "Footing", duration: "40min", done: false, description: "Récupération 6'00/km" },
  { day: "Sam", type: "Sortie longue", duration: "1h45", done: false, description: "24km allure marathon" },
  { day: "Dim", type: "Repos", duration: null, done: false, description: "Récupération complète" }
];

const recentRuns = [
  { date: "24 Jan", distance: 12.4, time: "1:02:30", pace: "5'02", hr: 152, feel: "Bien" },
  { date: "22 Jan", distance: 8.2, time: "36:54", pace: "4'30", hr: 168, feel: "Difficile" },
  { date: "20 Jan", distance: 10.0, time: "52:00", pace: "5'12", hr: 145, feel: "Facile" },
  { date: "18 Jan", distance: 6.5, time: "35:45", pace: "5'30", hr: 138, feel: "Facile" },
];

const weeklyStats = [
  { week: "S-6", km: 38 },
  { week: "S-5", km: 42 },
  { week: "S-4", km: 40 },
  { week: "S-3", km: 48 },
  { week: "S-2", km: 44 },
  { week: "S-1", km: 52 },
  { week: "Cette sem.", km: 28 }
];

const achievements = [
  { icon: "🔥", name: "12 jours streak", unlocked: true },
  { icon: "🎯", name: "Premier 20km", unlocked: true },
  { icon: "⚡", name: "Sub 5'/km", unlocked: true },
  { icon: "🏔️", name: "1000m D+", unlocked: false },
  { icon: "🌙", name: "Night runner", unlocked: false },
  { icon: "🏅", name: "Marathonien", unlocked: false }
];

const coachMessages = [
  { from: "coach", text: "Salut Thomas ! Ta semaine se passe bien. Tu as fait un super fractionné mardi 💪" },
  { from: "coach", text: "Aujourd'hui c'est PPG — n'oublie pas les squats et le gainage, c'est crucial pour ta foulée sur les derniers km du marathon." },
  { from: "user", text: "Je me sens un peu fatigué ces derniers jours, c'est normal ?" },
  { from: "coach", text: "Oui c'est classique en semaine 10 ! Ton corps accumule la charge. Écoute-toi : si la fatigue persiste, on peut adapter le plan. Hydratation et sommeil sont tes meilleurs alliés 🛏️💧" }
];

const tourSteps = [
  {
    screen: "dashboard",
    title: "Bienvenue dans RunCoach AI",
    message: "Voici le dashboard de Thomas, 28 ans, qui prépare le Marathon de Paris. Découvrons comment l'app le coache au quotidien.",
    highlight: null
  },
  {
    screen: "dashboard",
    title: "Vue d'ensemble",
    message: "D'un coup d'œil : progression, séance du jour, streak de motivation. Tout est conçu pour garder Thomas engagé.",
    highlight: "stats"
  },
  {
    screen: "plan",
    title: "Plan personnalisé",
    message: "Un plan sur 16 semaines adapté à son objectif 3h30. Chaque séance est détaillée avec allures et sensations attendues.",
    highlight: "week"
  },
  {
    screen: "stats",
    title: "Suivi performance",
    message: "Évolution du volume, allures, fréquence cardiaque. Thomas visualise sa progression et identifie ses axes d'amélioration.",
    highlight: "chart"
  },
  {
    screen: "coach",
    title: "Coach IA",
    message: "Un coach disponible 24/7 qui répond aux questions, ajuste le plan si besoin, et motive quand c'est dur.",
    highlight: "chat"
  },
  {
    screen: "profile",
    title: "Gamification",
    message: "Badges, défis, streaks : Thomas reste motivé sur la durée. L'objectif marathon devient un jeu !",
    highlight: "badges"
  }
];

export default function MarathonCoachApp() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [tourActive, setTourActive] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(coachMessages);
  const [isTyping, setIsTyping] = useState(false);

  const currentTour = tourSteps[tourStep];

  useEffect(() => {
    if (tourActive && currentTour) {
      setCurrentScreen(currentTour.screen);
    }
  }, [tourStep, tourActive]);

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourActive(false);
    }
  };

  const skipTour = () => {
    setTourActive(false);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { from: "user", text: chatInput }]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        from: "coach",
        text: "Bonne question ! Pour ta sortie longue de samedi, vise une allure confortable où tu peux parler. Pas plus vite que 5'30/km. L'objectif c'est l'endurance, pas la vitesse 🎯"
      }]);
    }, 1500);
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2 flex justify-around z-40">
      {[
        { id: "dashboard", icon: Activity, label: "Home" },
        { id: "plan", icon: Calendar, label: "Plan" },
        { id: "stats", icon: TrendingUp, label: "Stats" },
        { id: "coach", icon: MessageCircle, label: "Coach" },
        { id: "profile", icon: User, label: "Profil" }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => !tourActive && setCurrentScreen(item.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${
            currentScreen === item.id
              ? "text-lime-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <item.icon size={22} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const TourOverlay = () => {
    if (!tourActive) return null;
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
        <div className="bg-zinc-800 rounded-2xl p-5 max-w-sm w-full border border-zinc-700 mb-20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <h3 className="text-lg font-bold text-white">{currentTour.title}</h3>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">{currentTour.message}</p>
          <div className="flex justify-between items-center">
            <button onClick={skipTour} className="text-zinc-500 text-sm">
              Passer la démo
            </button>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === tourStep ? 'bg-lime-400' : 'bg-zinc-600'}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTourStep}
                className="bg-lime-400 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-1"
              >
                {tourStep === tourSteps.length - 1 ? "Terminer" : "Suivant"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="p-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-sm">Bonjour</p>
          <h1 className="text-2xl font-bold text-white">{userData.name} {userData.avatar}</h1>
        </div>
        <div className="bg-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Flame className="text-orange-500" size={18} />
          <span className="text-white font-semibold">{userData.streak}</span>
        </div>
      </div>

      {/* Goal Card */}
      <div className="bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl p-4 text-black">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-black/70 text-sm font-medium">Objectif</p>
            <h2 className="text-xl font-bold">{userData.goal}</h2>
            <p className="text-black/80">Objectif : {userData.targetTime}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{userData.weeksToGo}</p>
            <p className="text-sm text-black/70">semaines</p>
          </div>
        </div>
        <div className="mt-3 bg-black/20 rounded-full h-2">
          <div className="bg-black h-2 rounded-full" style={{ width: '37%' }}></div>
        </div>
        <p className="text-xs text-black/70 mt-1">Semaine 6/16</p>
      </div>

      {/* Today's Session */}
      <div className={`bg-zinc-800 rounded-2xl p-4 border-2 ${tourActive && currentTour.highlight === 'stats' ? 'border-lime-400' : 'border-transparent'}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Séance du jour</h3>
          <span className="text-lime-400 text-sm">Jeudi</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Zap className="text-purple-400" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">PPG - Renforcement</p>
            <p className="text-zinc-400 text-sm">30 min • Squats, gainage, fentes</p>
          </div>
          <button className="bg-lime-400 text-black p-3 rounded-xl">
            <Play size={20} fill="black" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <Target className="text-lime-400 mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{userData.weeklyKm}</p>
          <p className="text-xs text-zinc-400">km/sem</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <Activity className="text-blue-400 mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{userData.totalRuns}</p>
          <p className="text-xs text-zinc-400">sorties</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <Clock className="text-orange-400 mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">5'08</p>
          <p className="text-xs text-zinc-400">allure moy</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-white font-semibold mb-3">Dernières sorties</h3>
        <div className="space-y-2">
          {recentRuns.slice(0, 3).map((run, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <MapPin className="text-lime-400" size={18} />
                </div>
                <div>
                  <p className="text-white font-medium">{run.distance} km</p>
                  <p className="text-zinc-400 text-xs">{run.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white">{run.pace}/km</p>
                <p className="text-zinc-400 text-xs flex items-center gap-1 justify-end">
                  <Heart size={10} /> {run.hr} bpm
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Plan = () => (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Plan d'entraînement</h1>
        <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm text-zinc-300">Semaine 6</span>
      </div>

      <div className={`space-y-2 ${tourActive && currentTour.highlight === 'week' ? 'ring-2 ring-lime-400 rounded-2xl p-2' : ''}`}>
        {weekPlan.map((session, i) => (
          <div
            key={i}
            className={`bg-zinc-800 rounded-xl p-3 flex items-center gap-3 ${
              session.current ? 'border-2 border-lime-400' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              session.done ? 'bg-lime-400/20' : session.current ? 'bg-lime-400' : 'bg-zinc-700'
            }`}>
              {session.done ? (
                <CheckCircle className="text-lime-400" size={24} />
              ) : (
                <span className={`font-bold ${session.current ? 'text-black' : 'text-zinc-400'}`}>
                  {session.day}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${session.done ? 'text-zinc-400' : 'text-white'}`}>
                  {session.type}
                </p>
                {session.current && (
                  <span className="bg-lime-400 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                    Aujourd'hui
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm">{session.description}</p>
            </div>
            {session.duration && (
              <span className="text-zinc-400 text-sm">{session.duration}</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-zinc-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-2">Conseil de la semaine</h3>
        <p className="text-zinc-300 text-sm">
          🎯 Semaine clé : ta sortie longue de samedi (24km) est la plus longue avant le marathon.
          Hydrate-toi bien vendredi soir et prépare tes gels.
        </p>
      </div>
    </div>
  );

  const Stats = () => (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="text-2xl font-bold text-white">Statistiques</h1>

      {/* Volume Chart */}
      <div className={`bg-zinc-800 rounded-2xl p-4 ${tourActive && currentTour.highlight === 'chart' ? 'ring-2 ring-lime-400' : ''}`}>
        <h3 className="text-white font-semibold mb-4">Volume hebdomadaire</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyStats.map((week, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t-lg ${i === weeklyStats.length - 1 ? 'bg-lime-400' : 'bg-zinc-600'}`}
                style={{ height: `${(week.km / 55) * 100}%` }}
              ></div>
              <span className="text-xs text-zinc-400 mt-2 truncate w-full text-center">{week.week}</span>
              <span className="text-xs text-zinc-500">{week.km}km</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-400" size={18} />
            <span className="text-zinc-400 text-sm">Allure moyenne</span>
          </div>
          <p className="text-2xl font-bold text-white">5'08/km</p>
          <p className="text-green-400 text-xs">-12s vs mois dernier</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-red-400" size={18} />
            <span className="text-zinc-400 text-sm">FC moyenne</span>
          </div>
          <p className="text-2xl font-bold text-white">148 bpm</p>
          <p className="text-green-400 text-xs">Zone 2 optimale</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-lime-400" size={18} />
            <span className="text-zinc-400 text-sm">Distance totale</span>
          </div>
          <p className="text-2xl font-bold text-white">312 km</p>
          <p className="text-zinc-400 text-xs">Depuis début plan</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-orange-400" size={18} />
            <span className="text-zinc-400 text-sm">Temps total</span>
          </div>
          <p className="text-2xl font-bold text-white">28h 45</p>
          <p className="text-zinc-400 text-xs">6 semaines</p>
        </div>
      </div>

      {/* Recent Runs Detail */}
      <div>
        <h3 className="text-white font-semibold mb-3">Historique détaillé</h3>
        <div className="space-y-2">
          {recentRuns.map((run, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">{run.date}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  run.feel === 'Facile' ? 'bg-green-500/20 text-green-400' :
                  run.feel === 'Bien' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>{run.feel}</span>
              </div>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-white font-semibold">{run.distance} km</p>
                </div>
                <div className="text-right text-sm text-zinc-400">
                  <p>{run.time} • {run.pace}/km</p>
                  <p>{run.hr} bpm moy</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Coach = () => (
    <div className="flex flex-col h-screen bg-zinc-900">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center">
            <Zap className="text-black" size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold">Coach IA</h1>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span> En ligne
            </p>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-3 pb-32 ${tourActive && currentTour.highlight === 'chat' ? 'ring-2 ring-lime-400 rounded-lg m-2' : ''}`}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.from === 'user'
                ? 'bg-lime-400 text-black rounded-br-sm'
                : 'bg-zinc-800 text-white rounded-bl-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Pose ta question..."
            className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <button
            onClick={sendMessage}
            className="bg-lime-400 text-black p-3 rounded-full"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const Profile = () => (
    <div className="p-4 pb-24 space-y-5">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center text-4xl">
          {userData.avatar}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
          <p className="text-zinc-400">{userData.age} ans • {userData.currentLevel}</p>
          <p className="text-lime-400 text-sm">{userData.goal}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{userData.totalRuns}</p>
          <p className="text-xs text-zinc-400">Sorties</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">312</p>
          <p className="text-xs text-zinc-400">km total</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{userData.streak}</p>
          <p className="text-xs text-zinc-400">Streak 🔥</p>
        </div>
      </div>

      {/* Achievements */}
      <div className={`${tourActive && currentTour.highlight === 'badges' ? 'ring-2 ring-lime-400 rounded-2xl p-2' : ''}`}>
        <h3 className="text-white font-semibold mb-3">Badges & Accomplissements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((badge, i) => (
            <div
              key={i}
              className={`bg-zinc-800 rounded-xl p-3 text-center ${
                !badge.unlocked ? 'opacity-40' : ''
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs text-zinc-300 mt-1">{badge.name}</p>
              {badge.unlocked && <Award className="text-lime-400 mx-auto mt-1" size={14} />}
            </div>
          ))}
        </div>
      </div>

      {/* Next Challenge */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-2">Prochain défi</h3>
        <p className="text-white/90 text-sm">Complète ta première sortie de 25km+ ce samedi pour débloquer le badge "Ultra Ready" 🏔️</p>
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <p className="text-white/70 text-xs mt-1">24/25 km</p>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        {["Objectif & préférences", "Connexions (Strava, Garmin)", "Notifications", "Aide & FAQ"].map((item, i) => (
          <button key={i} className="w-full bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <span className="text-white">{item}</span>
            <ChevronRight className="text-zinc-500" size={20} />
          </button>
        ))}
      </div>
    </div>
  );

  const screens = {
    dashboard: <Dashboard />,
    plan: <Plan />,
    stats: <Stats />,
    coach: <Coach />,
    profile: <Profile />
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white font-sans">
      {/* Status bar mock */}
      <div className="bg-zinc-900 px-4 py-2 flex justify-between items-center text-xs text-zinc-400">
        <span>9:41</span>
        <span className="font-semibold text-lime-400">RunCoach AI</span>
        <div className="flex gap-1 items-center">
          <span>100%</span>
          <div className="w-6 h-3 border border-zinc-400 rounded-sm">
            <div className="bg-lime-400 h-full w-full rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        {screens[currentScreen]}
      </div>

      <NavBar />
      <TourOverlay />
    </div>
  );
}
