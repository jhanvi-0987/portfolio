// Single source of truth for all portfolio content.
// Leave a link empty ("") and it will be hidden automatically.

export const profile = {
  name: 'Jahanvi Makwana',
  firstName: 'Jahanvi',
  role: 'Flutter Developer',
  location: 'Ahmedabad, India',
  email: 'jahanvimakwana404@gmail.com',
  phone: '+91 93132 80622',
  github: '',
  linkedin: 'https://www.linkedin.com/in/makwana-jahanvi-83279826a/',
  resume: '', // e.g. '/Jahanvi_Makwana_Resume.pdf' after placing the PDF in /public
  summary:
    'Flutter developer with 1+ years of experience shipping cross-platform apps. I work on SmartOn, an AI-powered accessibility app for blind and low-vision users — from native BLE smart-glasses integrations to voice AI, document reading and subscriptions.',
}

export const stats = [
  { value: 1, suffix: '+', label: 'Years building mobile' },
  { value: 40, suffix: '+', label: 'Languages localized' },
  { value: 2, suffix: '', label: 'Platforms in production' },
  { value: 8.93, suffix: '', label: 'B.Tech CGPA', decimals: 2 },
]

export const marquee = [
  'Flutter', 'Dart', 'Kotlin', 'Swift', 'Riverpod', 'BLE', 'Platform Channels',
  'Firebase', 'REST APIs', 'TTS / STT', 'OCR', 'TalkBack', 'VoiceOver', 'i18n',
  'SQLite', 'Clean Architecture',
]

export const skillGroups = [
  { id: 'mobile', title: 'Mobile', icon: 'Smartphone', items: ['Flutter', 'Dart', 'Kotlin', 'Swift', 'Platform Channels', 'BLE', 'Android', 'iOS'] },
  { id: 'arch', title: 'State & Architecture', icon: 'Layers', items: ['Riverpod', 'Provider', 'MVVM', 'Clean Architecture'] },
  { id: 'ai', title: 'AI & Accessibility', icon: 'AudioLines', items: ['TTS / STT', 'OCR (Tesseract)', 'TalkBack semantics', 'VoiceOver semantics', 'i18n'] },
  { id: 'data', title: 'APIs & Data', icon: 'Database', items: ['REST APIs', 'Firebase Auth', 'FCM', 'Firebase Analytics', 'SQLite', 'SharedPreferences', 'PostgreSQL'] },
  { id: 'tools', title: 'Quality & Tools', icon: 'Wrench', items: ['flutter_test', 'Mockito', 'Git', 'GitHub', 'Android Studio', 'Xcode', 'Postman', 'Firebase Console', 'In-App Purchases'] },
]

export const experience = [
  {
    company: 'Sunbots Innovation LLP',
    role: 'Flutter Developer',
    period: 'Sep 2025 — Present',
    current: true,
    blurb: 'SmartOn — AI voice assistant and smart-glasses app for blind and low-vision users, published on Android and iOS.',
    points: [
      'Built BLE smart-glasses integrations in Kotlin and Swift over Flutter Platform Channels — connectivity, background handling, status notifications and reconnection flows.',
      'Developed AI voice-assistant workflows combining speech recognition, text-to-speech, glasses/phone image capture and conversational responses; debugged complex iOS audio-session issues.',
      'Shipped social-matching features: multi-step onboarding, draft save/resume, profile management, voice bios and localization across 40+ languages.',
      'Built Document AI reading with OCR, page navigation, bookmarks and synchronized highlighted TTS playback; integrated in-app purchase and restore flows.',
      'Improved accessibility with screen-reader semantics and large-text support; wrote unit, widget and integration tests and hardened error handling for release stability.',
    ],
    tags: ['Flutter', 'Kotlin', 'Swift', 'BLE', 'Riverpod'],
  },
  {
    company: 'Muster Dekho',
    role: 'Flutter Developer Intern',
    period: 'Jan 2025 — Jun 2025',
    points: [
      'Built responsive Flutter screens and reusable UI components for cross-platform applications.',
      'Integrated REST APIs, Firebase services and local persistence while collaborating through Git.',
    ],
    tags: ['Flutter', 'Firebase', 'REST'],
  },
]

export const caseStudy = {
  eyebrow: 'Featured work',
  title: 'SmartOn',
  tagline: 'An AI voice assistant and smart-glasses companion for blind and low-vision users.',
  status: 'Live on Android & iOS',
  pillars: [
    { icon: 'Glasses', title: 'Smart-glasses over BLE', text: 'Native Kotlin and Swift bridged to Flutter via Platform Channels: pairing, background handling, status notifications and automatic reconnection.' },
    { icon: 'Mic', title: 'Voice-first AI', text: 'Speech recognition, TTS and image capture from glasses or phone feed a conversational assistant — with iOS audio-session edge cases solved.' },
    { icon: 'ScanText', title: 'Document AI', text: 'OCR-powered reading with page navigation, bookmarks and TTS playback that highlights text in sync as it is spoken.' },
    { icon: 'Users', title: 'Social matching', text: 'Multi-step onboarding with draft save/resume, voice bios, profile management and 40+ language localization.' },
    { icon: 'Accessibility', title: 'Accessibility-first', text: 'TalkBack/VoiceOver semantics and large-text support designed in from day one, not bolted on.' },
    { icon: 'ShieldCheck', title: 'Release stability', text: 'Unit, widget and integration tests plus hardened error handling, with subscription purchase and restore flows.' },
  ],
}

export const projects = [
  {
    title: 'TeamFlow',
    subtitle: 'Team collaboration application',
    stack: ['Flutter', 'Dart', 'NestJS', 'PostgreSQL', 'Prisma', 'Riverpod', 'JWT'],
    points: [
      'Full-stack app with team workspaces, task management, comments and project tracking.',
      'JWT authentication with refresh-token rotation, role-based permissions and workspace invitations.',
      'Task status and priority workflows to help teams organize work and track progress.',
    ],
    repo: '',
    accent: '#7c5cff',
  },
  {
    title: 'GrosSync',
    subtitle: 'Collaborative grocery app',
    stack: ['Flutter', 'Dart', 'Firebase', 'Provider', 'REST APIs'],
    points: [
      'Personal and shared grocery lists with real-time collaboration, categories, quantities and prices.',
      'OTP and Google sign-in, push notifications, reminders and a feature-first architecture.',
      'REST APIs and Provider state management keeping shared list updates in sync.',
    ],
    repo: '',
    accent: '#22d3ee',
  },
]

export const education = {
  degree: 'B.Tech in Information Technology',
  school: 'Silver Oak University',
  period: '2021 — 2025',
  score: 'CGPA 8.93',
}
