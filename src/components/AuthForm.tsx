'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Chrome, Ghost, Globe, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Lang = 'ru' | 'en';

const translations = {
  ru: {
    titleLogin: 'Вход',
    titleSignup: 'Регистрация',
    usernameLabel: 'Имя пользователя',
    emailLabel: 'Email',
    passLabel: 'Пароль',
    btnLogin: 'Войти',
    btnSignup: 'Создать аккаунт',
    btnGoogle: 'Google',
    btnGuest: 'Гость',
    switchSignup: 'Создать аккаунт',
    switchLogin: 'Уже есть аккаунт?',
    guestInfo: 'Прогресс гостя не сохраняется',
    successReg: 'Проверьте почту',
    errorUserNotFound: 'Не найдено',
  },
  en: {
    titleLogin: 'Sign In',
    titleSignup: 'Create Account',
    usernameLabel: 'Username',
    emailLabel: 'Email',
    passLabel: 'Password',
    btnLogin: 'Sign In',
    btnSignup: 'Sign Up',
    btnGoogle: 'Google',
    btnGuest: 'Guest',
    switchSignup: 'No account? Create one',
    switchLogin: 'Already have an account? Sign in',
    guestInfo: 'Guest progress not saved',
    successReg: 'Check your email',
    errorUserNotFound: 'Not found',
  }
};

export default function AuthForm() {
  const [lang, setLang] = useState<Lang>('en'); // Default set to English
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('dg_lang', newLang);
  };

  const getRedirectUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    return 'https://online-games-phi.vercel.app';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', username).single();
        if (existingUser) throw new Error(lang === 'ru' ? 'Имя занято' : 'Username taken');

        const randomSeed = Math.random().toString(36).substring(7);
        const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=transparent`;

        const { error } = await supabase.auth.signUp({
          email, password, options: {
            data: { username, avatar_url: randomAvatar },
            emailRedirectTo: getRedirectUrl()
          }
        });
        if (error) throw error;
        setSuccessMsg(t.successReg);
        setTimeout(() => setIsSignUp(false), 2000);
      } else {
        let loginEmail = email;
        if (!email.includes('@')) {
             const { data: profile, error: profileError } = await supabase.from('profiles').select('email').eq('username', username).single();
             if (profileError || !profile) throw new Error(t.errorUserNotFound);
             loginEmail = profile.email;
        }

        const finalEmail = loginEmail || username;
        const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() },
    });
    if (error) { setErrorMsg(error.message); setLoading(false); }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (e) { setErrorMsg("Guest disabled"); setLoading(false); }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto bg-white border border-[#E6E1DC] p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-[#1A1F26]/5 relative font-sans transition-all hover:shadow-[#9e1316]/5">

      <button
        onClick={() => changeLang(lang === 'ru' ? 'en' : 'ru')}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 p-2 rounded-full hover:bg-[#F5F5F0] text-[#8A9099] hover:text-[#1A1F26] transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest z-10"
      >
        <Globe className="w-4 h-4" />
        {lang.toUpperCase()}
      </button>

      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#1A1F26]/10 border border-[#E6E1DC] overflow-hidden p-1.5 sm:p-1">
             <img src="/logo512.png" alt="DG Logo" className="w-full h-full object-contain" />
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-[#1A1F26] tracking-tight leading-none">
             Darhaal<br/><span className="text-[#9e1316]">Games</span>
           </h1>
        </div>
        <p className="text-xs font-bold text-[#8A9099] uppercase tracking-wider pl-1">{isSignUp ? t.titleSignup : t.titleLogin}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider ml-1">
             {isSignUp ? t.usernameLabel : (lang === 'ru' ? 'Имя или Email' : 'Username or Email')}
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-[#8A9099] group-focus-within:text-[#9e1316] transition-colors" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6E1DC] rounded-2xl py-3 pl-12 pr-4 text-[#1A1F26] font-bold text-sm focus:outline-none focus:bg-white focus:border-[#9e1316] focus:ring-4 focus:ring-[#9e1316]/5 transition-all placeholder:text-[#8A9099]/50"
              required
            />
          </div>
        </div>

        {isSignUp && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <label className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider ml-1">{t.emailLabel}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#8A9099] group-focus-within:text-[#9e1316] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E6E1DC] rounded-2xl py-3 pl-12 pr-4 text-[#1A1F26] font-bold text-sm focus:outline-none focus:bg-white focus:border-[#9e1316] focus:ring-4 focus:ring-[#9e1316]/5 transition-all placeholder:text-[#8A9099]/50"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider ml-1">{t.passLabel}</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#8A9099] group-focus-within:text-[#9e1316] transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6E1DC] rounded-2xl py-3 pl-12 pr-10 text-[#1A1F26] font-bold text-sm focus:outline-none focus:bg-white focus:border-[#9e1316] focus:ring-4 focus:ring-[#9e1316]/5 transition-all placeholder:text-[#8A9099]/50"
              required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#8A9099] hover:text-[#1A1F26] transition-colors"
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="text-[#9e1316] text-xs bg-[#9e1316]/5 border border-[#9e1316]/20 p-4 rounded-xl flex items-center gap-3 font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1F26] hover:bg-[#9e1316] text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#1A1F26]/20 hover:shadow-[#9e1316]/30 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 text-xs uppercase tracking-widest mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? t.btnSignup : t.btnLogin)}
        </button>
      </form>

      <div className="my-6 sm:my-8 flex items-center gap-4">
        <div className="h-px bg-[#E6E1DC] flex-1" />
        <span className="text-[#8A9099] text-[10px] uppercase font-bold tracking-widest">OR</span>
        <div className="h-px bg-[#E6E1DC] flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button onClick={handleGoogleLogin} disabled={loading} className="bg-white hover:bg-[#F5F5F0] border border-[#E6E1DC] text-[#8A9099] hover:text-[#1A1F26] py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide">
            <Chrome className="w-4 h-4" />
            <span>Google</span>
        </button>

        <button onClick={handleGuestLogin} disabled={loading} className="bg-white hover:bg-[#F5F5F0] border border-dashed border-[#E6E1DC] text-[#8A9099] hover:text-[#1A1F26] py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide">
            <Ghost className="w-4 h-4" />
            <span>{t.btnGuest}</span>
        </button>
      </div>

      <p className="mt-6 sm:mt-8 text-center text-xs text-[#8A9099] font-medium border-t border-[#E6E1DC] pt-6">
        <button
          onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
          className="text-[#9e1316] hover:text-[#7a0f11] transition-colors flex items-center justify-center gap-2 mx-auto hover:underline decoration-2 underline-offset-4 font-bold uppercase tracking-wide"
        >
          {isSignUp ? t.switchLogin : t.switchSignup} <ArrowRight className="w-3 h-3" />
        </button>
      </p>

      {!isSignUp && (
         <div className="mt-4 text-center">
             <span className="text-[10px] text-[#8A9099] font-bold uppercase tracking-widest">{t.guestInfo}</span>
         </div>
      )}
    </div>
  );
}