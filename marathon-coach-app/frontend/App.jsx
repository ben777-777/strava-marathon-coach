import React, { useState, useEffect } from 'react';
import { Activity, Calendar, MessageCircle, Utensils, User, ChevronRight, TrendingUp, Clock, Flame, Target, Zap, Play, CheckCircle, Send, Heart, MapPin, Apple, Droplet, AlertCircle, RefreshCw, LogIn } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// ============================================
// MAIN APP
// ============================================

export default function MarathonCoachApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [nutritionAdvice, setNutritionAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'coach', text: 'Salut ! Je suis ton coach marathon IA. Connecte-toi à Strava et je créerai ton plan personnalisé 💪' }
  ]);

  // Check URL params for Strava callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const name = params.get('name');
    if (userId && name) {
      setUser({ id: parseInt(userId), name });
      window.history.replaceState({}, '', '/');
      fetchActivities(userId);
    }
  }, []);

  // Fetch activities from Strava
  const fetchActivities = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/activities/${userId}`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    setLoading(false);
  };

  // Connect to Strava
  const connectStrava = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/strava`);
      const { authUrl } = await res.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Strava:', error);
    }
  };

  // Generate training plan
  const generatePlan = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coach/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      });
      const plan = await res.json();
      setTrainingPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
    setLoading(false);
  };

  // Get nutrition advice
  const getNutritionAdvice = async (session) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coach/nutrition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: session.type,
          sessionTime: '7h00',
          duration: session.duration,
          userWeight: 70
        })
      });
      const advice = await res.json();
      setNutritionAdvice(advice);
    } catch (error) {
      console.error('Error getting nutrition:', error);
    }
    setLoading(false);
  };

  // Chat with coach
  const sendChatMessage = async (message) => {
    setChatMessages(prev => [...prev, { from: 'user', text: message }]);
    try {
      const res = await fetch(`${API_BASE}/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          message,
          conversationHistory: chatMessages
        })
      });
      const { response } = await res.json();
      setChatMessages(prev => [...prev, { from: 'coach', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { from: 'coach', text: 'Désolé, erreur de connexion. Réessaie.' }]);
    }
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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="animate-spin text-lime-400" size={32} />
    </div>
  );

  // ============================================
  // SCREENS
  // ============================================

  const Dashboard = () => (
    <div className="p-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-sm">Bonjour</p>
          <h1 className="text-2xl font-bold text-white">{user?.name || 'Athlète'} 🏃‍♂️</h1>
        </div>
        {user && (
          <div className="bg-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-zinc-300 text-sm">Strava connecté</span>
          </div>
        )}
      </div>

      {/* Strava Connect */}
      {!user && (
        <button
          onClick={connectStrava}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 flex items-center justify-center gap-3"
        >
          <LogIn className="text-white" size={24} />
          <span className="text-white font-semibold text-lg">Connecter Strava</span>
        </button>
      )}

      {/* Goal Setup (if connected but no plan) */}
      {user && !trainingPlan && (
        <GoalSetupCard onSubmit={generatePlan} loading={loading} />
      )}

      {/* Active Plan Summary */}
      {trainingPlan && (
        <div className="bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl p-4 text-black">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-black/70 text-sm font-medium">Objectif actif</p>
              <h2 className="text-xl font-bold">Marathon</h2>
              <p className="text-black/80">Temps visé: {trainingPlan.targetTime || '3h30'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{trainingPlan.weeksToMarathon}</p>
              <p className="text-sm text-black/70">semaines</p>
            </div>
          </div>
          <div className="mt-3 bg-black/20 rounded-full h-2">
            <div className="bg-black h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      )}

      {/* Today's Session */}
      {trainingPlan?.weeklyPlans?.[0]?.sessions && (
        <div className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Séance du jour</h3>
            <button
              onClick={() => getNutritionAdvice(trainingPlan.weeklyPlans[0].sessions[0])}
              className="text-lime-400 text-sm flex items-center gap-1"
            >
              <Utensils size={14} /> Nutrition
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-lime-400/20 rounded-xl flex items-center justify-center">
              <Zap className="text-lime-400" size={28} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{trainingPlan.weeklyPlans[0].sessions[0].type}</p>
              <p className="text-zinc-400 text-sm">
                {trainingPlan.weeklyPlans[0].sessions[0].duration} • {trainingPlan.weeklyPlans[0].sessions[0].targetPace}
              </p>
            </div>
            <button className="bg-lime-400 text-black p-3 rounded-xl">
              <Play size={20} fill="black" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Strava Activities */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Dernières sorties Strava</h3>
          <div className="space-y-2">
            {activities.slice(0, 4).map((run, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                    <MapPin className="text-lime-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{(run.distance / 1000).toFixed(1)} km</p>
                    <p className="text-zinc-400 text-xs">{new Date(run.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatPace(run.pace)}/km</p>
                  {run.averageHeartrate && (
                    <p className="text-zinc-400 text-xs flex items-center gap-1 justify-end">
                      <Heart size={10} /> {Math.round(run.averageHeartrate)} bpm
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
    </div>
  );

  const GoalSetupCard = ({ onSubmit, loading }) => {
    const [form, setForm] = useState({
      marathonDate: '',
      targetTime: '3h30',
      currentLevel: 'intermédiaire',
      weeklyAvailability: 4
    });

    return (
      <div className="bg-zinc-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Target className="text-lime-400" size={20} />
          Configure ton objectif marathon
        </h3>

        <div>
          <label className="text-zinc-400 text-sm">Date du marathon</label>
          <input
            type="date"
            value={form.marathonDate}
            onChange={e => setForm({ ...form, marathonDate: e.target.value })}
            className="w-full bg-zinc-700 text-white rounded-lg p-3 mt-1"
          />
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Temps visé</label>
          <select
            value={form.targetTime}
            onChange={e => setForm({ ...form, targetTime: e.target.value })}
            className="w-full bg-zinc-700 text-white rounded-lg p-3 mt-1"
          >
            <option value="sub3">Sub 3h</option>
            <option value="3h15">3h15</option>
            <option value="3h30">3h30</option>
            <option value="3h45">3h45</option>
            <option value="4h00">4h00</option>
            <option value="4h30">4h30</option>
            <option value="finisher">Finisher</option>
          </select>
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Niveau actuel</label>
          <select
            value={form.currentLevel}
            onChange={e => setForm({ ...form, currentLevel: e.target.value })}
            className="w-full bg-zinc-700 text-white rounded-lg p-3 mt-1"
          >
            <option value="débutant">Débutant (premier marathon)</option>
            <option value="intermédiaire">Intermédiaire (1-3 marathons)</option>
            <option value="confirmé">Confirmé (4+ marathons)</option>
          </select>
        </div>

        <div>
          <label className="text-zinc-400 text-sm">Jours d'entraînement / semaine</label>
          <div className="flex gap-2 mt-1">
            {[3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setForm({ ...form, weeklyAvailability: n })}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  form.weeklyAvailability === n
                    ? 'bg-lime-400 text-black'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.marathonDate}
          className="w-full bg-lime-400 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
          Générer mon plan IA
        </button>
      </div>
    );
  };

  const PlanScreen = () => (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="text-2xl font-bold text-white">Plan d'entraînement</h1>

      {!trainingPlan && (
        <div className="bg-zinc-800 rounded-2xl p-6 text-center">
          <Calendar className="text-zinc-500 mx-auto mb-3" size={48} />
          <p className="text-zinc-400">Configure ton objectif sur le Dashboard pour générer ton plan personnalisé.</p>
        </div>
      )}

      {trainingPlan?.paceZones && (
        <div className="bg-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Tes zones d'allure</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(trainingPlan.paceZones).map(([zone, pace]) => (
              <div key={zone} className="bg-zinc-700 rounded-lg p-2">
                <p className="text-zinc-400 text-xs capitalize">{zone}</p>
                <p className="text-white font-semibold">{pace}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {trainingPlan?.weeklyPlans?.slice(0, 4).map((week, i) => (
        <div key={i} className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Semaine {week.week}</h3>
            <span className="text-lime-400 text-sm">{week.totalKm} km</span>
          </div>
          <p className="text-zinc-400 text-xs mb-3">{week.phase}</p>
          <div className="space-y-2">
            {week.sessions?.map((session, j) => (
              <div
                key={j}
                className="flex items-center gap-3 p-2 bg-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-600"
                onClick={() => {
                  getNutritionAdvice(session);
                  setCurrentScreen('nutrition');
                }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  session.type === 'repos' ? 'bg-zinc-600' : 'bg-lime-400/20'
                }`}>
                  <span className="text-xs font-bold text-zinc-300">{session.day?.slice(0, 3)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{session.type}</p>
                  <p className="text-zinc-400 text-xs">{session.duration} • {session.targetPace}</p>
                </div>
                <Utensils className="text-zinc-500" size={16} />
              </div>
            ))}
          </div>
          {week.weeklyTip && (
            <p className="text-zinc-400 text-xs mt-3 italic">💡 {week.weeklyTip}</p>
          )}
        </div>
      ))}
    </div>
  );

  const NutritionScreen = () => (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Utensils className="text-lime-400" />
        Nutrition
      </h1>

      {!nutritionAdvice && (
        <div className="bg-zinc-800 rounded-2xl p-6 text-center">
          <Apple className="text-zinc-500 mx-auto mb-3" size={48} />
          <p className="text-zinc-400">Clique sur une séance dans ton plan pour obtenir des conseils nutrition personnalisés.</p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {nutritionAdvice && (
        <>
          {/* Before */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="text-orange-400" size={18} />
              Avant la séance
            </h3>
            {nutritionAdvice.before?.meals?.map((meal, i) => (
              <div key={i} className="bg-zinc-700 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lime-400 text-sm font-medium">{meal.when}</p>
                    <p className="text-white">{meal.what}</p>
                    <p className="text-zinc-400 text-xs mt-1">{meal.why}</p>
                  </div>
                  {meal.calories && (
                    <span className="text-zinc-400 text-xs">{meal.calories} kcal</span>
                  )}
                </div>
                {meal.macros && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">G: {meal.macros.carbs}g</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">P: {meal.macros.protein}g</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">L: {meal.macros.fat}g</span>
                  </div>
                )}
              </div>
            ))}
            <p className="text-zinc-400 text-sm flex items-center gap-2 mt-2">
              <Droplet size={14} className="text-blue-400" />
              {nutritionAdvice.before?.hydration}
            </p>
          </div>

          {/* During */}
          {nutritionAdvice.during?.needed && (
            <div className="bg-zinc-800 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="text-yellow-400" size={18} />
                Pendant la séance
              </h3>
              <p className="text-white">{nutritionAdvice.during.recommendation}</p>
              {nutritionAdvice.during.products && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {nutritionAdvice.during.products.map((p, i) => (
                    <span key={i} className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm">{p}</span>
                  ))}
                </div>
              )}
              <p className="text-zinc-400 text-sm mt-2">
                💧 Hydratation: {nutritionAdvice.during.hydrationPerHour}
              </p>
            </div>
          )}

          {/* After */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} />
              Après la séance ({nutritionAdvice.after?.timing})
            </h3>
            {nutritionAdvice.after?.meal && (
              <div className="bg-zinc-700 rounded-lg p-3">
                <p className="text-white">{nutritionAdvice.after.meal.what}</p>
                <p className="text-zinc-400 text-xs mt-1">{nutritionAdvice.after.meal.why}</p>
                {nutritionAdvice.after.meal.macros && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">G: {nutritionAdvice.after.meal.macros.carbs}g</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">P: {nutritionAdvice.after.meal.macros.protein}g</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">L: {nutritionAdvice.after.meal.macros.fat}g</span>
                  </div>
                )}
              </div>
            )}
            {nutritionAdvice.after?.recovery && (
              <div className="mt-3">
                <p className="text-zinc-400 text-sm mb-2">Récupération:</p>
                <div className="flex flex-wrap gap-2">
                  {nutritionAdvice.after.recovery.map((tip, i) => (
                    <span key={i} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">{tip}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          {nutritionAdvice.tips && (
            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-purple-500/30">
              <h3 className="text-white font-semibold mb-2">💡 Conseils</h3>
              <ul className="space-y-1">
                {nutritionAdvice.tips.map((tip, i) => (
                  <li key={i} className="text-zinc-300 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  const CoachScreen = () => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
      if (!input.trim()) return;
      const msg = input;
      setInput('');
      setIsTyping(true);
      await sendChatMessage(msg);
      setIsTyping(false);
    };

    return (
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
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
        </div>

        <div className="fixed bottom-16 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Pose ta question au coach..."
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button onClick={handleSend} className="bg-lime-400 text-black p-3 rounded-full">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatsScreen = () => {
    const weeklyKm = activities.reduce((acc, a) => {
      const week = new Date(a.date).toISOString().slice(0, 10);
      acc[week] = (acc[week] || 0) + a.distance / 1000;
      return acc;
    }, {});

    const totalKm = activities.reduce((sum, a) => sum + a.distance / 1000, 0);
    const avgPace = activities.length > 0
      ? activities.reduce((sum, a) => sum + a.pace, 0) / activities.length
      : 0;

    return (
      <div className="p-4 pb-24 space-y-5">
        <h1 className="text-2xl font-bold text-white">Statistiques Strava</h1>

        {activities.length === 0 && (
          <div className="bg-zinc-800 rounded-2xl p-6 text-center">
            <TrendingUp className="text-zinc-500 mx-auto mb-3" size={48} />
            <p className="text-zinc-400">Connecte Strava pour voir tes stats.</p>
          </div>
        )}

        {activities.length > 0 && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-lime-400" size={18} />
                  <span className="text-zinc-400 text-sm">Distance totale</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalKm.toFixed(0)} km</p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-blue-400" size={18} />
                  <span className="text-zinc-400 text-sm">Sorties</span>
                </div>
                <p className="text-2xl font-bold text-white">{activities.length}</p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-400" size={18} />
                  <span className="text-zinc-400 text-sm">Allure moyenne</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatPace(avgPace)}/km</p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-red-400" size={18} />
                  <span className="text-zinc-400 text-sm">FC moyenne</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(activities.filter(a => a.averageHeartrate).reduce((s, a) => s + a.averageHeartrate, 0) / activities.filter(a => a.averageHeartrate).length || 0)} bpm
                </p>
              </div>
            </div>

            {/* Activity List */}
            <div>
              <h3 className="text-white font-semibold mb-3">Historique complet</h3>
              <div className="space-y-2">
                {activities.map((run, i) => (
                  <div key={i} className="bg-zinc-800 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">{new Date(run.date).toLocaleDateString('fr-FR')}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400">
                        {run.name?.slice(0, 20)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p className="text-white font-semibold">{(run.distance / 1000).toFixed(1)} km</p>
                      </div>
                      <div className="text-right text-sm text-zinc-400">
                        <p>{formatDuration(run.duration)} • {formatPace(run.pace)}/km</p>
                        {run.averageHeartrate && <p>{Math.round(run.averageHeartrate)} bpm</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
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
    const s = seconds % 60;
    if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER
  // ============================================

  const screens = {
    dashboard: <Dashboard />,
    plan: <PlanScreen />,
    nutrition: <NutritionScreen />,
    coach: <CoachScreen />,
    stats: <StatsScreen />
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white font-sans">
      {/* Status bar */}
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

      {/* Main Content */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        {screens[currentScreen]}
      </div>

      <NavBar />
    </div>
  );
}
