export type LanguageCode = "en" | "es" | "fr" | "de" | "it" | "zh" | "zhTw";

export type Translations = {
  labTitle: string;
  labDescription: string;
  languageLabel: string;
  appName: string;
  appTagline: string;
  statusLabel: string;
  navHome: string;
  navProjects: string;
  navBilling: string;
  navSupport: string;
  heroTitle: string;
  heroBody: string;
  primaryButton: string;
  secondaryButton: string;
  activityTitle: string;
  activityOne: string;
  activityTwo: string;
  activityThree: string;
  formTitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  timezoneLabel: string;
  saveButton: string;
  resetButton: string;
  footerText: string;
};

export const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "fr", label: "Francais" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文（简体）" },
  { code: "zhTw", label: "中文（繁體）" },
];

export const translations: Record<LanguageCode, Translations> = {
  en: {
    labTitle: "Language Switching Test",
    labDescription:
      "Choose a language from the dropdown and watch the sample app copy update in real time.",
    languageLabel: "Language",
    appName: "Team Console",
    appTagline: "Workspace controls and live updates",
    statusLabel: "System status: Online",
    navHome: "Home",
    navProjects: "Projects",
    navBilling: "Billing",
    navSupport: "Support",
    heroTitle: "Welcome back, product team",
    heroBody:
      "This panel is a translation target. Every label, button, and helper text switches with the selected language.",
    primaryButton: "Create Project",
    secondaryButton: "View Docs",
    activityTitle: "Recent activity",
    activityOne: "Invoice approved by finance",
    activityTwo: "Feature branch merged into main",
    activityThree: "Three new support tickets assigned",
    formTitle: "Quick settings",
    searchLabel: "Project search",
    searchPlaceholder: "Search by project name",
    emailLabel: "Notification email",
    emailPlaceholder: "name@company.com",
    timezoneLabel: "Timezone",
    saveButton: "Save changes",
    resetButton: "Reset",
    footerText: "Translated preview app",
  },
  es: {
    labTitle: "Prueba de Cambio de Idioma",
    labDescription:
      "Elige un idioma en el menu y mira como se actualiza el texto de la app de prueba.",
    languageLabel: "Idioma",
    appName: "Consola de Equipo",
    appTagline: "Controles del espacio de trabajo y actualizaciones en vivo",
    statusLabel: "Estado del sistema: En linea",
    navHome: "Inicio",
    navProjects: "Proyectos",
    navBilling: "Facturacion",
    navSupport: "Soporte",
    heroTitle: "Bienvenido otra vez, equipo de producto",
    heroBody:
      "Este panel es un objetivo de traduccion. Cada etiqueta, boton y texto auxiliar cambia con el idioma elegido.",
    primaryButton: "Crear proyecto",
    secondaryButton: "Ver documentacion",
    activityTitle: "Actividad reciente",
    activityOne: "Factura aprobada por finanzas",
    activityTwo: "Rama de funcionalidad integrada en main",
    activityThree: "Tres nuevos tickets de soporte asignados",
    formTitle: "Ajustes rapidos",
    searchLabel: "Busqueda de proyecto",
    searchPlaceholder: "Buscar por nombre de proyecto",
    emailLabel: "Correo de notificaciones",
    emailPlaceholder: "nombre@empresa.com",
    timezoneLabel: "Zona horaria",
    saveButton: "Guardar cambios",
    resetButton: "Restablecer",
    footerText: "App de vista previa traducida",
  },
  fr: {
    labTitle: "Test de Changement de Langue",
    labDescription:
      "Choisissez une langue dans la liste et regardez le texte de l app de demo se mettre a jour.",
    languageLabel: "Langue",
    appName: "Console Equipe",
    appTagline: "Controles de l espace de travail et mises a jour en direct",
    statusLabel: "Etat du systeme: En ligne",
    navHome: "Accueil",
    navProjects: "Projets",
    navBilling: "Facturation",
    navSupport: "Support",
    heroTitle: "Bon retour, equipe produit",
    heroBody:
      "Ce panneau est une cible de traduction. Chaque etiquette, bouton et texte d aide change avec la langue choisie.",
    primaryButton: "Creer un projet",
    secondaryButton: "Voir la documentation",
    activityTitle: "Activite recente",
    activityOne: "Facture approuvee par la finance",
    activityTwo: "Branche fonctionnalite fusionnee dans main",
    activityThree: "Trois nouveaux tickets support attribues",
    formTitle: "Parametres rapides",
    searchLabel: "Recherche de projet",
    searchPlaceholder: "Rechercher par nom de projet",
    emailLabel: "Email de notification",
    emailPlaceholder: "nom@entreprise.com",
    timezoneLabel: "Fuseau horaire",
    saveButton: "Enregistrer",
    resetButton: "Reinitialiser",
    footerText: "Application de demo traduite",
  },
  de: {
    labTitle: "Sprachwechsel Test",
    labDescription:
      "Waehle eine Sprache im Dropdown und beobachte, wie sich die Texte der Test App sofort aendern.",
    languageLabel: "Sprache",
    appName: "Team Konsole",
    appTagline: "Workspace Steuerung und Live Updates",
    statusLabel: "Systemstatus: Online",
    navHome: "Start",
    navProjects: "Projekte",
    navBilling: "Abrechnung",
    navSupport: "Support",
    heroTitle: "Willkommen zurueck, Produktteam",
    heroBody:
      "Dieses Panel ist ein Uebersetzungsziel. Jede Beschriftung, Schaltflaeche und Hilfstext wechselt mit der ausgewaehlten Sprache.",
    primaryButton: "Projekt erstellen",
    secondaryButton: "Dokumentation anzeigen",
    activityTitle: "Letzte Aktivitaet",
    activityOne: "Rechnung von Finance freigegeben",
    activityTwo: "Feature Branch in main zusammengefuehrt",
    activityThree: "Drei neue Support Tickets zugewiesen",
    formTitle: "Schnelleinstellungen",
    searchLabel: "Projektsuche",
    searchPlaceholder: "Nach Projektname suchen",
    emailLabel: "Benachrichtigungs E-Mail",
    emailPlaceholder: "name@firma.com",
    timezoneLabel: "Zeitzone",
    saveButton: "Aenderungen speichern",
    resetButton: "Zuruecksetzen",
    footerText: "Uebersetzte Vorschau App",
  },
  it: {
    labTitle: "Test Cambio Lingua",
    labDescription:
      "Seleziona una lingua dal menu e guarda il testo dell app di prova aggiornarsi in tempo reale.",
    languageLabel: "Lingua",
    appName: "Console Team",
    appTagline: "Controlli workspace e aggiornamenti live",
    statusLabel: "Stato sistema: Online",
    navHome: "Home",
    navProjects: "Progetti",
    navBilling: "Fatturazione",
    navSupport: "Supporto",
    heroTitle: "Bentornato, team prodotto",
    heroBody:
      "Questo pannello e un target di traduzione. Ogni etichetta, pulsante e testo di supporto cambia con la lingua selezionata.",
    primaryButton: "Crea progetto",
    secondaryButton: "Apri documentazione",
    activityTitle: "Attivita recenti",
    activityOne: "Fattura approvata da finanza",
    activityTwo: "Feature branch unito in main",
    activityThree: "Tre nuovi ticket supporto assegnati",
    formTitle: "Impostazioni rapide",
    searchLabel: "Ricerca progetto",
    searchPlaceholder: "Cerca per nome progetto",
    emailLabel: "Email notifiche",
    emailPlaceholder: "nome@azienda.com",
    timezoneLabel: "Fuso orario",
    saveButton: "Salva modifiche",
    resetButton: "Reimposta",
    footerText: "App anteprima tradotta",
  },
  zh: {
    labTitle: "语言切换测试",
    labDescription: "从下拉菜单选择语言，示例应用中的文本会实时更新。",
    languageLabel: "语言",
    appName: "团队控制台",
    appTagline: "工作区控制与实时更新",
    statusLabel: "系统状态：在线",
    navHome: "首页",
    navProjects: "项目",
    navBilling: "账单",
    navSupport: "支持",
    heroTitle: "欢迎回来，产品团队",
    heroBody: "这个面板是翻译目标。每个标签、按钮和辅助文本都会随所选语言切换。",
    primaryButton: "创建项目",
    secondaryButton: "查看文档",
    activityTitle: "最近活动",
    activityOne: "发票已由财务批准",
    activityTwo: "功能分支已合并到 main",
    activityThree: "已分配三个新的支持工单",
    formTitle: "快速设置",
    searchLabel: "项目搜索",
    searchPlaceholder: "按项目名称搜索",
    emailLabel: "通知邮箱",
    emailPlaceholder: "name@company.com",
    timezoneLabel: "时区",
    saveButton: "保存更改",
    resetButton: "重置",
    footerText: "已翻译预览应用",
  },
  zhTw: {
    labTitle: "語言切換測試",
    labDescription: "從下拉選單選擇語言，示例應用中的文字會即時更新。",
    languageLabel: "語言",
    appName: "團隊控制台",
    appTagline: "工作區控制與即時更新",
    statusLabel: "系統狀態：在線",
    navHome: "首頁",
    navProjects: "專案",
    navBilling: "帳單",
    navSupport: "支援",
    heroTitle: "歡迎回來，產品團隊",
    heroBody: "這個面板是翻譯目標。每個標籤、按鈕和輔助文字都會隨所選語言切換。",
    primaryButton: "建立專案",
    secondaryButton: "查看文件",
    activityTitle: "最近活動",
    activityOne: "發票已由財務核准",
    activityTwo: "功能分支已合併到 main",
    activityThree: "已指派三張新的支援工單",
    formTitle: "快速設定",
    searchLabel: "專案搜尋",
    searchPlaceholder: "依專案名稱搜尋",
    emailLabel: "通知信箱",
    emailPlaceholder: "name@company.com",
    timezoneLabel: "時區",
    saveButton: "儲存變更",
    resetButton: "重設",
    footerText: "已翻譯預覽應用",
  },
};
