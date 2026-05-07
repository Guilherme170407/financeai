const TRANSACTION_KEY = "financeai_transactions_v2";
const INVESTMENT_KEY = "financeai_investments_v1";
const CHAT_KEY = "financeai_chat_v1";
const USER_KEY = "financeai_user_v1";
const GOAL_KEY = "financeai_goals_v1";
const THEME_KEY = "financeai_theme_v1";
const CATEGORY_KEY = "financeai_categories_v1";
const BUDGET_KEY = "financeai_budgets_v1";
const MEMORY_KEY = "financeai_assistant_memory_v1";
const PRIVACY_KEY = "financeai_privacy_v1";

const DEFAULT_CATEGORIES = [
  "Casa",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Investimentos",
  "Receita",
  "Outros",
];

const state = {
  type: "expense",
  monthOffset: 0,
  transactions: readStorage(TRANSACTION_KEY, []),
  investments: readStorage(INVESTMENT_KEY, []),
  messages: readStorage(CHAT_KEY, []),
  user: readStorage(USER_KEY, null),
  goals: readStorage(GOAL_KEY, []),
  categories: readStorage(CATEGORY_KEY, [...DEFAULT_CATEGORIES]),
  budgets: readStorage(BUDGET_KEY, {}),
  memory: readStorage(MEMORY_KEY, []),
  privacy: readStorage(PRIVACY_KEY, false),
  serverBacked: false,
};

let ambientAnimationId = 0;
let saveTimer = 0;
let isApplyingServerData = false;
let pageTransitionTimer = 0;
let registerCodeRequested = false;
let toastTimer = 0;
let dialogResolver = null;
let editingTransactionId = "";
let editingInvestmentId = "";
let editingGoalId = "";

state.categories = [...new Set([...DEFAULT_CATEGORIES, ...state.categories])];
writeStorage(CATEGORY_KEY, state.categories);

const elements = {
  transactionForm: document.querySelector("#transaction-form"),
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  category: document.querySelector("#category"),
  typeButtons: document.querySelectorAll(".type-button"),
  clearData: document.querySelector("#clear-data"),
  balance: document.querySelector("#balance"),
  balanceTrend: document.querySelector("#balance-trend"),
  income: document.querySelector("#income"),
  expenses: document.querySelector("#expenses"),
  expenseRatio: document.querySelector("#expense-ratio"),
  dailyBudget: document.querySelector("#daily-budget"),
  daysLeft: document.querySelector("#days-left"),
  decisionToday: document.querySelector("#decision-today"),
  decisionTodayDetail: document.querySelector("#decision-today-detail"),
  decisionCategory: document.querySelector("#decision-category"),
  decisionCategoryDetail: document.querySelector("#decision-category-detail"),
  decisionGoal: document.querySelector("#decision-goal"),
  decisionGoalDetail: document.querySelector("#decision-goal-detail"),
  monthLabel: document.querySelector("#month-label"),
  monthPrevious: document.querySelector("#month-previous"),
  monthNext: document.querySelector("#month-next"),
  monthToday: document.querySelector("#month-today"),
  dailyRate: document.querySelector("#daily-rate"),
  projectedBalance: document.querySelector("#projected-balance"),
  forecastLabel: document.querySelector("#forecast-label"),
  profileName: document.querySelector("#profile-name"),
  profileDescription: document.querySelector("#profile-description"),
  emergencyTarget: document.querySelector("#emergency-target"),
  transactionList: document.querySelector("#transaction-list"),
  categoryChart: document.querySelector("#category-chart"),
  topCategory: document.querySelector("#top-category"),
  investmentForm: document.querySelector("#investment-form"),
  assetName: document.querySelector("#asset-name"),
  assetClass: document.querySelector("#asset-class"),
  assetRisk: document.querySelector("#asset-risk"),
  assetInvested: document.querySelector("#asset-invested"),
  assetCurrent: document.querySelector("#asset-current"),
  portfolioCurrent: document.querySelector("#portfolio-current"),
  portfolioReturn: document.querySelector("#portfolio-return"),
  portfolioReturnRate: document.querySelector("#portfolio-return-rate"),
  investmentList: document.querySelector("#investment-list"),
  allocationChart: document.querySelector("#allocation-chart"),
  allocationStatus: document.querySelector("#allocation-status"),
  investmentProfile: document.querySelector("#investment-profile"),
  recommendations: document.querySelector("#recommendations"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  chatMessages: document.querySelector("#chat-messages"),
  promptButtons: document.querySelectorAll("[data-prompt]"),
  navLinks: document.querySelectorAll(".tabs a"),
  themeToggle: document.querySelector("#theme-toggle"),
  loginThemeToggle: document.querySelector("#login-theme-toggle"),
  ambientCanvas: document.querySelector("#ambient-canvas"),
  loginScreen: document.querySelector("#login-screen"),
  appShell: document.querySelector("#app-shell"),
  loginRequiredModal: document.querySelector("#login-required-modal"),
  loginRequiredAction: document.querySelector("#login-required-action"),
  loginRequiredClose: document.querySelector("#login-required-close"),
  settingsScreen: document.querySelector("#settings-screen"),
  openSettings: document.querySelector("#open-settings"),
  closeSettings: document.querySelector("#close-settings"),
  assistantMode: document.querySelector("#assistant-mode"),
  statusDot: document.querySelector(".status-dot"),
  accountButton: document.querySelector("#account-button"),
  accountMenu: document.querySelector("#account-menu"),
  accountSummary: document.querySelector("#account-summary"),
  openLogin: document.querySelector("#open-login"),
  logoutButton: document.querySelector("#logout-button"),
  userAvatar: document.querySelector("#user-avatar"),
  userLabel: document.querySelector("#user-label"),
  userPlan: document.querySelector("#user-plan"),
  loginForm: document.querySelector("#login-form"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  registerForm: document.querySelector("#register-form"),
  registerName: document.querySelector("#register-name"),
  registerEmail: document.querySelector("#register-email"),
  registerPassword: document.querySelector("#register-password"),
  registerCodeField: document.querySelector("#register-code-field"),
  registerCode: document.querySelector("#register-code"),
  registerCodeStatus: document.querySelector("#register-code-status"),
  registerSubmit: document.querySelector("#register-submit"),
  resetForm: document.querySelector("#reset-form"),
  resetEmail: document.querySelector("#reset-email"),
  sendResetCode: document.querySelector("#send-reset-code"),
  resetCode: document.querySelector("#reset-code"),
  resetCodeStatus: document.querySelector("#reset-code-status"),
  resetPassword: document.querySelector("#reset-password"),
  resetConfirmPassword: document.querySelector("#reset-confirm-password"),
  registerFocus: document.querySelector("#register-focus"),
  registerIncome: document.querySelector("#register-income"),
  registerFixedExpenses: document.querySelector("#register-fixed-expenses"),
  registerInvestorProfile: document.querySelector("#register-investor-profile"),
  passwordToggles: document.querySelectorAll("[data-toggle-password]"),
  showRegister: document.querySelector("#show-register"),
  showLogin: document.querySelector("#show-login"),
  showReset: document.querySelector("#show-reset"),
  resetBackLogin: document.querySelector("#reset-back-login"),
  privacyToggle: document.querySelector("#privacy-toggle"),
  printReport: document.querySelector("#print-report"),
  settingsThemeToggle: document.querySelector("#settings-theme-toggle"),
  settingsThemeLabel: document.querySelector("#settings-theme-label"),
  settingsPrivacyToggle: document.querySelector("#settings-privacy-toggle"),
  settingsAccountLabel: document.querySelector("#settings-account-label"),
  settingsSyncLabel: document.querySelector("#settings-sync-label"),
  settingsStorageLabel: document.querySelector("#settings-storage-label"),
  settingsAiLabel: document.querySelector("#settings-ai-label"),
  settingsDataCount: document.querySelector("#settings-data-count"),
  settingsFocusLabel: document.querySelector("#settings-focus-label"),
  settingsIncomeLabel: document.querySelector("#settings-income-label"),
  settingsInvestorLabel: document.querySelector("#settings-investor-label"),
  settingsReportLabel: document.querySelector("#settings-report-label"),
  passwordForm: document.querySelector("#password-form"),
  currentPassword: document.querySelector("#current-password"),
  newPassword: document.querySelector("#new-password"),
  settingsPrintReport: document.querySelector("#settings-print-report"),
  settingsClearData: document.querySelector("#settings-clear-data"),
  deleteAccount: document.querySelector("#delete-account"),
  monthlyStatus: document.querySelector("#monthly-status"),
  monthlyInsights: document.querySelector("#monthly-insights"),
  smartAlerts: document.querySelector("#smart-alerts"),
  csvFile: document.querySelector("#csv-file"),
  importStatus: document.querySelector("#import-status"),
  categoryForm: document.querySelector("#category-form"),
  newCategory: document.querySelector("#new-category"),
  categoryCount: document.querySelector("#category-count"),
  categoryManager: document.querySelector("#category-manager"),
  budgetForm: document.querySelector("#budget-form"),
  budgetCategory: document.querySelector("#budget-category"),
  budgetAmount: document.querySelector("#budget-amount"),
  budgetStatus: document.querySelector("#budget-status"),
  budgetList: document.querySelector("#budget-list"),
  goalForm: document.querySelector("#goal-form"),
  goalName: document.querySelector("#goal-name"),
  goalKind: document.querySelector("#goal-kind"),
  goalDate: document.querySelector("#goal-date"),
  goalTarget: document.querySelector("#goal-target"),
  goalCurrent: document.querySelector("#goal-current"),
  goalHealth: document.querySelector("#goal-health"),
  goalsTarget: document.querySelector("#goals-target"),
  goalsProgress: document.querySelector("#goals-progress"),
  goalsMonthly: document.querySelector("#goals-monthly"),
  goalList: document.querySelector("#goal-list"),
  contextBalance: document.querySelector("#context-balance"),
  contextExpenses: document.querySelector("#context-expenses"),
  contextTransactions: document.querySelector("#context-transactions"),
  contextPortfolio: document.querySelector("#context-portfolio"),
  contextCategory: document.querySelector("#context-category"),
  contextGoal: document.querySelector("#context-goal"),
  toastStack: document.querySelector("#toast-stack"),
  appDialog: document.querySelector("#app-dialog"),
  appDialogTitle: document.querySelector("#app-dialog-title"),
  appDialogMessage: document.querySelector("#app-dialog-message"),
  appDialogPasswordField: document.querySelector("#app-dialog-password-field"),
  appDialogPassword: document.querySelector("#app-dialog-password"),
  appDialogCancel: document.querySelector("#app-dialog-cancel"),
  appDialogConfirm: document.querySelector("#app-dialog-confirm"),
};

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  scheduleServerSave();
}

function scheduleServerSave() {
  if (!state.serverBacked || isApplyingServerData) {
    return;
  }

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveUserDataToServer, 350);
}

async function saveUserDataToServer() {
  if (!state.serverBacked || !state.user) {
    return;
  }

  try {
    await apiRequest("/api/data", {
      method: "POST",
      body: JSON.stringify({
        profile: state.user,
        data: collectUserData(),
      }),
    });
  } catch (error) {
    console.warn("Não foi possível salvar no banco local.", error);
  }
}

function collectUserData() {
  return {
    transactions: state.transactions,
    investments: state.investments,
    messages: state.messages,
    goals: state.goals,
    categories: state.categories,
    budgets: state.budgets,
    memory: state.memory,
    privacy: state.privacy,
  };
}

function emptyUserData() {
  return {
    transactions: [],
    investments: [],
    messages: [],
    goals: [],
    categories: [...DEFAULT_CATEGORIES],
    budgets: {},
    memory: [],
    privacy: false,
  };
}

function applyUserData(data = {}) {
  isApplyingServerData = true;
  state.transactions = Array.isArray(data.transactions) ? data.transactions : [];
  state.investments = Array.isArray(data.investments) ? data.investments : [];
  state.messages = Array.isArray(data.messages) ? data.messages : [];
  state.goals = Array.isArray(data.goals) ? data.goals : [];
  state.categories = [...new Set([...DEFAULT_CATEGORIES, ...(Array.isArray(data.categories) ? data.categories : [])])];
  state.budgets = data.budgets && typeof data.budgets === "object" ? data.budgets : {};
  state.memory = Array.isArray(data.memory) ? data.memory : [];
  state.privacy = Boolean(data.privacy);

  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(state.transactions));
  localStorage.setItem(INVESTMENT_KEY, JSON.stringify(state.investments));
  localStorage.setItem(CHAT_KEY, JSON.stringify(state.messages));
  localStorage.setItem(GOAL_KEY, JSON.stringify(state.goals));
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(state.categories));
  localStorage.setItem(BUDGET_KEY, JSON.stringify(state.budgets));
  localStorage.setItem(MEMORY_KEY, JSON.stringify(state.memory));
  localStorage.setItem(PRIVACY_KEY, JSON.stringify(state.privacy));
  isApplyingServerData = false;
}

function clearLocalUserData() {
  isApplyingServerData = true;
  state.transactions = [];
  state.investments = [];
  state.messages = [];
  state.goals = [];
  state.categories = [...DEFAULT_CATEGORIES];
  state.budgets = {};
  state.memory = [];
  state.privacy = false;

  [
    TRANSACTION_KEY,
    INVESTMENT_KEY,
    CHAT_KEY,
    GOAL_KEY,
    CATEGORY_KEY,
    BUDGET_KEY,
    MEMORY_KEY,
    PRIVACY_KEY,
  ].forEach((key) => localStorage.removeItem(key));

  localStorage.setItem(CATEGORY_KEY, JSON.stringify(state.categories));
  isApplyingServerData = false;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Falha no servidor local.");
  }

  return data;
}

function getTheme() {
  return localStorage.getItem(THEME_KEY) || document.documentElement.dataset.theme || "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
  renderSettings();
  drawAmbientCanvas();
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPercent(value) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function getDaysLeft() {
  if (state.monthOffset !== 0) {
    return 1;
  }
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - today.getDate() + 1);
}

function getElapsedDays() {
  if (state.monthOffset !== 0) {
    return getMonthRange(state.monthOffset).end.getDate();
  }
  const today = new Date();
  return Math.max(1, today.getDate());
}

function getMonthLabel() {
  const range = getSelectedMonthRange();
  return range.start.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function getSummary() {
  const currentMonth = getSelectedMonthRange();
  const monthlyTransactions = state.transactions.filter((item) => isDateInRange(item.date, currentMonth));
  const loggedIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const estimatedIncome = Number(state.user?.income || 0);
  const income = loggedIncome > 0 ? loggedIncome : estimatedIncome;
  const transactionExpenses = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const fixedExpenses = Math.max(0, Number(state.user?.fixedExpenses || 0));
  const investmentOutflow = getInvestmentOutflowForRange(currentMonth);
  const expenses = transactionExpenses + fixedExpenses + investmentOutflow;
  const daysLeft = getDaysLeft();
  const dailyRate = expenses / getElapsedDays();
  const balance = income - expenses;
  const projectedBalance = balance - dailyRate * Math.max(0, daysLeft - 1);

  return {
    income,
    loggedIncome,
    estimatedIncome,
    expenses,
    transactionExpenses,
    fixedExpenses,
    investmentOutflow,
    balance,
    daysLeft,
    dailyRate,
    dailyBudget: Math.max(0, balance) / daysLeft,
    projectedBalance,
    expenseRatio: income > 0 ? expenses / income : 0,
    emergencyTarget: Math.max(expenses * 6, 0),
  };
}

function getInvestmentOutflowForRange(range) {
  return state.investments
    .filter((item) => isDateInRange(item.date, range))
    .reduce((sum, item) => sum + item.invested, 0);
}

function getPortfolioSummary() {
  const invested = state.investments.reduce((sum, item) => sum + item.invested, 0);
  const current = state.investments.reduce((sum, item) => sum + item.current, 0);
  const result = current - invested;

  return {
    invested,
    current,
    result,
    rate: invested > 0 ? (result / invested) * 100 : 0,
  };
}

function getGoalsSummary() {
  const target = state.goals.reduce((sum, item) => sum + item.target, 0);
  const current = state.goals.reduce((sum, item) => sum + Math.min(item.current, item.target), 0);
  const mainGoal = [...state.goals].sort((a, b) => getGoalProgress(a) - getGoalProgress(b))[0] || null;

  return {
    target,
    current,
    missing: Math.max(0, target - current),
    progress: target > 0 ? (current / target) * 100 : 0,
    monthlyNeeded: mainGoal ? getMonthlyNeeded(mainGoal) : 0,
    mainGoal,
  };
}

function getGoalProgress(goal) {
  return goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
}

function getMonthsUntil(dateValue) {
  if (!dateValue) {
    return 1;
  }

  const today = new Date();
  const targetDate = new Date(`${dateValue}T00:00:00`);
  const diff = targetDate.getTime() - today.getTime();
  const days = Math.ceil(diff / 86_400_000);
  return Math.max(1, Math.ceil(days / 30));
}

function getMonthlyNeeded(goal) {
  const missing = Math.max(0, goal.target - goal.current);
  return missing / getMonthsUntil(goal.date);
}

function getCategoryGroups() {
  const currentMonth = getSelectedMonthRange();
  const expenses = state.transactions.filter((item) => item.type === "expense" && isDateInRange(item.date, currentMonth));
  const investmentOutflow = getInvestmentOutflowForRange(currentMonth);
  const fixedExpenses = Math.max(0, Number(state.user?.fixedExpenses || 0));
  const total = expenses.reduce((sum, item) => sum + item.amount, 0) + fixedExpenses + investmentOutflow;
  const groups = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  if (investmentOutflow > 0) {
    groups.Investimentos = (groups.Investimentos || 0) + investmentOutflow;
  }

  if (fixedExpenses > 0) {
    groups["Gastos fixos"] = (groups["Gastos fixos"] || 0) + fixedExpenses;
  }

  return Object.entries(groups)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getSelectedMonthRange() {
  return getMonthRange(state.monthOffset);
}

function isDateInRange(date, range) {
  const value = new Date(date);
  return value >= range.start && value <= range.end;
}

function getSummaryForRange(range) {
  const items = state.transactions.filter((item) => isDateInRange(item.date, range));
  const loggedIncome = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const income = loggedIncome > 0 ? loggedIncome : Number(state.user?.income || 0);
  const expenses =
    items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0) +
    Math.max(0, Number(state.user?.fixedExpenses || 0)) +
    getInvestmentOutflowForRange(range);
  return {
    income,
    expenses,
    balance: income - expenses,
    items,
  };
}

function getBudgetRows() {
  const groups = getCategoryGroups();
  return state.categories
    .filter((category) => category !== "Receita")
    .map((category) => {
      const spent = groups.find((group) => group.name === category)?.amount || 0;
      const limit = Number(state.budgets[category] || 0);
      return {
        category,
        spent,
        limit,
        percent: limit > 0 ? (spent / limit) * 100 : 0,
      };
    })
    .filter((row) => row.limit > 0 || row.spent > 0)
    .sort((a, b) => b.percent - a.percent);
}

function upsertCategory(category) {
  const name = category.trim();
  if (!name || state.categories.some((item) => normalizeText(item) === normalizeText(name))) {
    return false;
  }

  state.categories.push(name);
  state.categories.sort((a, b) => a.localeCompare(b, "pt-BR"));
  writeStorage(CATEGORY_KEY, state.categories);
  return true;
}

function getAllocationGroups() {
  const total = state.investments.reduce((sum, item) => sum + item.current, 0);
  const groups = state.investments.reduce((acc, item) => {
    acc[item.assetClass] = (acc[item.assetClass] || 0) + item.current;
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatTransactionDate(value) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function summarizeTransactionsByTitle(type) {
  const items = type ? state.transactions.filter((item) => item.type === type) : state.transactions;
  const groups = items.reduce((acc, item) => {
    const key = normalizeText(item.description).trim();
    if (!acc[key]) {
      acc[key] = {
        titulo: item.description,
        tipo: item.type === "income" ? "receita" : "despesa",
        categoria: item.category,
        total: 0,
        quantidade: 0,
        ultimaData: item.date,
      };
    }

    acc[key].total += item.amount;
    acc[key].quantidade += 1;
    if (new Date(item.date) > new Date(acc[key].ultimaData)) {
      acc[key].ultimaData = item.date;
    }

    return acc;
  }, {});

  return Object.values(groups)
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      ...item,
      totalFormatado: formatCurrency(item.total),
      ultimaData: formatTransactionDate(item.ultimaData),
    }));
}

function getTransactionDetails() {
  return state.transactions.slice(0, 120).map((item) => ({
    titulo: item.description,
    tipo: item.type === "income" ? "receita" : "despesa",
    categoria: item.category,
    valor: item.amount,
    valorFormatado: formatCurrency(item.amount),
    data: formatTransactionDate(item.date),
  }));
}

function findTransactionsFromQuestion(question) {
  const ignored = new Set([
    "quanto",
    "qual",
    "quais",
    "tenho",
    "tinha",
    "ganhei",
    "gastei",
    "recebi",
    "paguei",
    "com",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "em",
    "no",
    "na",
    "meu",
    "minha",
    "site",
    "app",
  ]);
  const words = normalizeText(question)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !ignored.has(word));

  if (words.length === 0) {
    return [];
  }

  return state.transactions.filter((item) => {
    const searchable = normalizeText(`${item.description} ${item.category} ${item.type}`);
    return words.some((word) => searchable.includes(word));
  });
}

function setTransactionType(type) {
  state.type = type;
  elements.typeButtons.forEach((button) => {
    const active = button.dataset.type === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (type === "income" && elements.category.value !== "Investimentos") {
    elements.category.value = "Receita";
  }
}

function addTransaction(event) {
  event.preventDefault();

  const description = elements.description.value.trim();
  const amount = Number(elements.amount.value);

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    elements.description.focus();
    return;
  }

  const payload = {
    id: crypto.randomUUID(),
    type: state.type,
    description,
    category: elements.category.value,
    amount,
    date: new Date().toISOString(),
  };

  if (editingTransactionId) {
    state.transactions = state.transactions.map((item) =>
      item.id === editingTransactionId ? { ...item, ...payload, id: item.id, date: item.date } : item,
    );
    editingTransactionId = "";
    elements.transactionForm.querySelector("button[type='submit']").lastChild.textContent = " Adicionar lançamento";
    showToast("Lançamento atualizado.", "success");
  } else {
    state.transactions.unshift(payload);
  }

  elements.transactionForm.reset();
  if (state.type === "expense") {
    elements.category.value = "Casa";
  }
  writeStorage(TRANSACTION_KEY, state.transactions);
  render();
}

function addInvestment(event) {
  event.preventDefault();

  const name = elements.assetName.value.trim();
  const invested = Number(elements.assetInvested.value);
  const current = Number(elements.assetCurrent.value);

  if (!name || !Number.isFinite(invested) || invested <= 0 || !Number.isFinite(current) || current < 0) {
    elements.assetName.focus();
    return;
  }

  const payload = {
    id: crypto.randomUUID(),
    name,
    assetClass: elements.assetClass.value,
    risk: elements.assetRisk.value,
    invested,
    current,
    date: new Date().toISOString(),
  };

  if (editingInvestmentId) {
    state.investments = state.investments.map((item) =>
      item.id === editingInvestmentId ? { ...item, ...payload, id: item.id, date: item.date } : item,
    );
    editingInvestmentId = "";
    elements.investmentForm.querySelector("button[type='submit']").lastChild.textContent = " Adicionar investimento";
    showToast("Investimento atualizado.", "success");
  } else {
    state.investments.unshift(payload);
  }

  elements.investmentForm.reset();
  writeStorage(INVESTMENT_KEY, state.investments);
  render();
}

function addGoal(event) {
  event.preventDefault();

  const name = elements.goalName.value.trim();
  const target = Number(elements.goalTarget.value);
  const current = Number(elements.goalCurrent.value || 0);

  if (!name || !Number.isFinite(target) || target <= 0 || !Number.isFinite(current) || current < 0) {
    elements.goalName.focus();
    return;
  }

  const payload = {
    id: crypto.randomUUID(),
    name,
    kind: elements.goalKind.value,
    date: elements.goalDate.value,
    target,
    current: Math.min(current, target),
    createdAt: new Date().toISOString(),
  };

  if (editingGoalId) {
    state.goals = state.goals.map((goal) =>
      goal.id === editingGoalId ? { ...goal, ...payload, id: goal.id, createdAt: goal.createdAt } : goal,
    );
    editingGoalId = "";
    elements.goalForm.querySelector("button[type='submit']").lastChild.textContent = " Adicionar meta";
    showToast("Meta atualizada.", "success");
  } else {
    state.goals.unshift(payload);
  }

  elements.goalForm.reset();
  writeStorage(GOAL_KEY, state.goals);
  render();
}

function addCategory(event) {
  event.preventDefault();
  if (upsertCategory(elements.newCategory.value)) {
    elements.newCategory.value = "";
    render();
  }
}

function removeCategory(category) {
  state.categories = state.categories.filter((item) => item !== category);
  delete state.budgets[category];
  writeStorage(CATEGORY_KEY, state.categories);
  writeStorage(BUDGET_KEY, state.budgets);
  render();
}

function saveBudget(event) {
  event.preventDefault();
  const category = elements.budgetCategory.value;
  const amount = Number(elements.budgetAmount.value);

  if (!category || !Number.isFinite(amount) || amount < 0) {
    return;
  }

  if (amount === 0) {
    delete state.budgets[category];
  } else {
    state.budgets[category] = amount;
  }

  elements.budgetAmount.value = "";
  writeStorage(BUDGET_KEY, state.budgets);
  render();
}

function togglePrivacy() {
  state.privacy = !state.privacy;
  writeStorage(PRIVACY_KEY, state.privacy);
  renderPrivacy();
}

function renderPrivacy() {
  document.body.classList.toggle("privacy-mode", state.privacy);
  elements.privacyToggle.textContent = state.privacy ? "Mostrar valores" : "Ocultar valores";
  elements.settingsPrivacyToggle.textContent = state.privacy ? "Mostrar valores" : "Ocultar valores";
}

function renderSettings() {
  const theme = getTheme() === "dark" ? "Escuro" : "Claro";
  const dataCount =
    state.transactions.length +
    state.investments.length +
    state.goals.length +
    Object.keys(state.budgets).length +
    state.messages.length;

  elements.settingsThemeLabel.textContent = `Tema atual: ${theme}`;
  elements.settingsAccountLabel.textContent = state.user
    ? `${state.user.email} · ${state.user.investorProfile || "Perfil não definido"}`
    : "Nenhum usuário conectado";
  elements.settingsSyncLabel.textContent = state.serverBacked ? "Sincronizado com a conta" : "Dados apenas neste navegador";
  elements.settingsStorageLabel.textContent = state.serverBacked ? "Banco online" : "Local";
  elements.settingsDataCount.textContent = `${dataCount} item${dataCount === 1 ? "" : "s"}`;
  elements.settingsFocusLabel.textContent = state.user?.focus || "Nao informado";
  elements.settingsIncomeLabel.textContent = formatCurrency(state.user?.income || 0);
  elements.settingsInvestorLabel.textContent = state.user?.investorProfile || "Nao informado";
  elements.settingsReportLabel.textContent =
    state.transactions.length || state.investments.length || state.goals.length
      ? "Planilha completa da conta"
      : "Cadastre dados para enriquecer a planilha";
}

function requireLoginForPreview(event) {
  if (state.user || elements.appShell.hidden || !elements.loginScreen.hidden) {
    return;
  }

  const target = event.target.closest("a, button, input, select, textarea, label, [role='button']");
  if (
    !target ||
    !elements.appShell.contains(target) ||
    target.closest(".metric-card, .decision-card, .empty-state")
  ) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  showLoginRequiredModal();
}

function showLoginRequiredModal() {
  elements.loginRequiredModal.hidden = false;
  elements.loginRequiredAction.focus();
}

function hideLoginRequiredModal() {
  elements.loginRequiredModal.hidden = true;
}

function showToast(message, type = "info") {
  if (!elements.toastStack) {
    return;
  }

  window.clearTimeout(toastTimer);
  elements.toastStack.innerHTML = "";
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-dot" aria-hidden="true"></span>
    <span>${escapeHtml(message)}</span>
  `;
  elements.toastStack.appendChild(toast);
  toastTimer = window.setTimeout(() => {
    toast.classList.add("toast-out");
    window.setTimeout(() => toast.remove(), 180);
  }, 3600);
}

function askDialog({ title, message, confirmText = "Confirmar", danger = false, password = false }) {
  if (!elements.appDialog) {
    return Promise.resolve(false);
  }

  elements.appDialogTitle.textContent = title;
  elements.appDialogMessage.textContent = message;
  elements.appDialogConfirm.textContent = confirmText;
  elements.appDialogConfirm.classList.toggle("danger-button", danger);
  elements.appDialogConfirm.classList.toggle("primary-button", !danger);
  elements.appDialogPasswordField.hidden = !password;
  elements.appDialogPassword.value = "";
  elements.appDialog.hidden = false;

  if (password) {
    elements.appDialogPassword.focus();
  } else {
    elements.appDialogConfirm.focus();
  }

  return new Promise((resolve) => {
    dialogResolver = resolve;
  });
}

function closeAppDialog(result = false) {
  if (!dialogResolver) {
    return;
  }

  const password = elements.appDialogPassword.value;
  elements.appDialog.hidden = true;
  elements.appDialogPassword.value = "";
  dialogResolver(result ? { confirmed: true, password } : { confirmed: false, password: "" });
  dialogResolver = null;
}

function printReport() {
  const report = buildSpreadsheetReport();
  const blob = new Blob([report.content], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = report.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Planilha gerada com sucesso.", "success");
}

function buildSpreadsheetReport() {
  const now = new Date();
  const summary = getSummary();
  const portfolio = getPortfolioSummary();
  const goals = getGoalsSummary();
  const profile = getFinancialProfile(summary);
  const currentMonth = getSummaryForRange(getSelectedMonthRange());
  const previousMonth = getSummaryForRange(getMonthRange(state.monthOffset - 1));
  const monthName = getMonthLabel();
  const username = state.user?.name || "Usuario";
  const filenameDate = now.toISOString().slice(0, 10);
  const filename = `financeai-relatorio-${filenameDate}.xls`;

  const sheets = [
    {
      name: "Resumo",
      rows: [
        ["Relatorio FinanceAI", ""],
        ["Gerado em", now.toLocaleString("pt-BR")],
        ["Usuario", username],
        ["Mes de referencia", monthName],
        ["Perfil financeiro", profile.name],
        ["Diagnostico", profile.description],
        [],
        ["Indicador", "Valor"],
        ["Saldo do mes", summary.balance],
        ["Receitas do mes", summary.income],
        ["Despesas do mes", summary.expenses],
        ["Despesas sobre receitas %", summary.expenseRatio * 100],
        ["Orcamento diario", summary.dailyBudget],
        ["Gasto medio por dia", summary.dailyRate],
        ["Previsao fim do mes", summary.projectedBalance],
        ["Dias restantes", summary.daysLeft],
        ["Reserva de emergencia sugerida", summary.emergencyTarget],
        [],
        ["Comparacao mensal", "Mes atual", "Mes anterior"],
        ["Receitas", currentMonth.income, previousMonth.income],
        ["Despesas", currentMonth.expenses, previousMonth.expenses],
        ["Saldo", currentMonth.balance, previousMonth.balance],
        [],
        ["Carteira", "Valor"],
        ["Total aplicado", portfolio.invested],
        ["Valor atual", portfolio.current],
        ["Resultado", portfolio.result],
        ["Rentabilidade %", portfolio.rate],
        [],
        ["Metas", "Valor"],
        ["Objetivo total", goals.target],
        ["Guardado", goals.current],
        ["Faltante", goals.missing],
        ["Progresso %", goals.progress],
        ["Aporte mensal sugerido", goals.monthlyNeeded],
      ],
    },
    {
      name: "Transacoes",
      rows: [
        ["Data", "Tipo", "Descricao", "Categoria", "Valor"],
        ...state.transactions.map((item) => [
          formatTransactionDate(item.date),
          item.type === "income" ? "Receita" : "Despesa",
          item.description,
          item.category,
          item.amount,
        ]),
      ],
    },
    {
      name: "Categorias",
      rows: [
        ["Categoria", "Gasto no mes", "Participacao %"],
        ...getCategoryGroups().map((item) => [item.name, item.amount, item.percent]),
      ],
    },
    {
      name: "Orcamentos",
      rows: [
        ["Categoria", "Gasto no mes", "Limite", "Uso %", "Status"],
        ...getBudgetRows().map((row) => [
          row.category,
          row.spent,
          row.limit,
          row.percent,
          row.limit > 0 && row.percent >= 100 ? "Acima do limite" : row.percent >= 80 ? "Atencao" : "Dentro do planejado",
        ]),
      ],
    },
    {
      name: "Metas",
      rows: [
        ["Meta", "Tipo", "Prazo", "Objetivo", "Guardado", "Faltante", "Progresso %", "Aporte mensal sugerido"],
        ...state.goals.map((goal) => [
          goal.name,
          goal.kind,
          goal.date || "Sem prazo",
          goal.target,
          goal.current,
          Math.max(0, goal.target - goal.current),
          getGoalProgress(goal),
          getMonthlyNeeded(goal),
        ]),
      ],
    },
    {
      name: "Investimentos",
      rows: [
        ["Ativo", "Classe", "Risco", "Aplicado", "Valor atual", "Resultado", "Rentabilidade %"],
        ...state.investments.map((item) => {
          const result = item.current - item.invested;
          return [
            item.name,
            item.assetClass,
            item.risk,
            item.invested,
            item.current,
            result,
            item.invested > 0 ? (result / item.invested) * 100 : 0,
          ];
        }),
      ],
    },
  ];

  return {
    filename,
    content: buildExcelXml(sheets),
  };
}

function buildExcelXml(sheets) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E8F1FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="text">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="headerText">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E8F1FF" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="money">
      <NumberFormat ss:Format="R$ #,##0.00"/>
    </Style>
    <Style ss:ID="percent">
      <NumberFormat ss:Format="0.00"/>
    </Style>
  </Styles>
  ${sheets.map((sheet) => buildWorksheetXml(sheet)).join("")}
</Workbook>`;
}

function buildWorksheetXml(sheet) {
  return `
  <Worksheet ss:Name="${escapeXml(sheet.name.slice(0, 31))}">
    <Table>
      ${buildColumnXml(sheet)}
      ${sheet.rows.map((row, rowIndex) => buildSpreadsheetRow(row, rowIndex)).join("")}
    </Table>
  </Worksheet>`;
}

function buildColumnXml(sheet) {
  const widthsBySheet = {
    Resumo: [190, 390, 150, 150],
    Transacoes: [95, 90, 260, 150, 100],
    Categorias: [180, 120, 120],
    Orçamentos: [180, 120, 120, 100, 170],
    Orcamentos: [180, 120, 120, 100, 170],
    Metas: [220, 130, 110, 120, 120, 120, 110, 170],
    Investimentos: [220, 140, 100, 120, 120, 120, 130],
  };
  const widths = widthsBySheet[sheet.name] || [180, 180, 180, 180, 180];
  return widths.map((width) => `<Column ss:Width="${width}"/>`).join("");
}

function buildSpreadsheetRow(row, rowIndex) {
  return `
      <Row>${row.map((cell) => buildSpreadsheetCell(cell, rowIndex)).join("")}</Row>`;
}

function buildSpreadsheetCell(value, rowIndex) {
  if (value === null || value === undefined || value === "") {
    return "<Cell><Data ss:Type=\"String\"></Data></Cell>";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }

  const style = rowIndex === 0 ? " ss:StyleID=\"headerText\"" : " ss:StyleID=\"text\"";
  return `<Cell${style}><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

async function changePassword(event) {
  event.preventDefault();

  const currentPassword = elements.currentPassword.value;
  const newPassword = elements.newPassword.value;

  if (!currentPassword) {
    elements.currentPassword.focus();
    return;
  }

  if (!newPassword) {
    elements.newPassword.focus();
    return;
  }

  try {
    await apiRequest("/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    elements.passwordForm.reset();
    showToast("Senha alterada com sucesso.", "success");
  } catch (error) {
    showToast(error.message || "Não foi possível trocar a senha.", "error");
  }
}

async function deleteAccount() {
  if (!state.user) {
    return;
  }

  const decision = await askDialog({
    title: "Excluir conta",
    message: "Esta acao remove sua conta e todos os dados salvos. Digite sua senha para confirmar.",
    confirmText: "Excluir conta",
    danger: true,
    password: true,
  });
  if (!decision.confirmed) {
    return;
  }

  if (!decision.password) {
    showToast("Digite sua senha para excluir a conta.", "error");
    return;
  }

  try {
    await apiRequest("/api/delete-account", {
      method: "POST",
      body: JSON.stringify({ password: decision.password }),
    });
  } catch (error) {
    showToast(error.message || "Não foi possível excluir a conta.", "error");
    return;
  }

  state.user = null;
  state.serverBacked = false;
  localStorage.removeItem(USER_KEY);
  clearLocalUserData();
  syncLoginForm();
  showLoginForm();
  showLoginScreen();
  showToast("Conta excluida com sucesso.", "success");
  render();
  renderChatHistory();
}

function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imported = parseCsvTransactions(String(reader.result || ""));
    state.transactions = [...imported, ...state.transactions];
    imported.forEach((item) => upsertCategory(item.category));
    writeStorage(TRANSACTION_KEY, state.transactions);
    elements.importStatus.textContent = `${imported.length} importado(s)`;
    elements.csvFile.value = "";
    render();
  };
  reader.readAsText(file, "utf-8");
}

function parseCsvTransactions(csv) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    return [];
  }

  const separator = lines[0].includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0], separator).map((header) => normalizeText(header));

  return lines.slice(1).map((line) => {
    const columns = splitCsvLine(line, separator);
    const pick = (...names) => {
      const index = headers.findIndex((header) => names.some((name) => header.includes(name)));
      return index >= 0 ? columns[index] || "" : "";
    };
    const amount = parseMoney(pick("valor", "amount"));
    const rawType = normalizeText(pick("tipo", "type"));
    const description = pick("descricao", "descri", "titulo", "nome") || "Importado";
    const category = pick("categoria", "category") || inferImportedCategory(description, rawType);
    const date = parseImportedDate(pick("data", "date"));
    return {
      id: crypto.randomUUID(),
      type: rawType.includes("receita") || rawType.includes("income") || amount > 0 ? "income" : "expense",
      description: description.trim(),
      category: category.trim() || "Outros",
      amount: Math.abs(amount),
      date,
    };
  }).filter((item) => item.amount > 0);
}

function splitCsvLine(line, separator) {
  const pattern = new RegExp(`${separator}(?=(?:[^"]*"[^"]*")*[^"]*$)`);
  return line.split(pattern).map((value) => value.replace(/^"|"$/g, "").trim());
}

function parseMoney(value) {
  const cleaned = String(value).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".");
  return Number(cleaned) || 0;
}

function parseImportedDate(value) {
  const text = String(value || "").trim();
  const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilian) {
    return new Date(`${brazilian[3]}-${brazilian[2]}-${brazilian[1]}T12:00:00`).toISOString();
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function inferImportedCategory(description, type) {
  if (type.includes("receita") || type.includes("income")) {
    return "Receita";
  }

  return inferCategory(description);
}

function inferCategory(description) {
  const text = normalizeText(description);

  if (/(uber|99|taxi|combust|gasolina|transporte|onibus|metro)/.test(text)) {
    return "Transporte";
  }

  if (/(mercado|super|restaurante|ifood|comida|lanche|padaria)/.test(text)) {
    return "Alimentação";
  }

  if (/(aluguel|condom|luz|agua|internet|casa|energia)/.test(text)) {
    return "Casa";
  }

  if (/(netflix|spotify|cinema|lazer|show|jogo)/.test(text)) {
    return "Lazer";
  }

  if (/(farmacia|medico|consulta|saude|plano)/.test(text)) {
    return "Saúde";
  }

  return "Outros";
}

function removeTransaction(id) {
  state.transactions = state.transactions.filter((item) => item.id !== id);
  writeStorage(TRANSACTION_KEY, state.transactions);
  render();
}

function editTransaction(id) {
  const item = state.transactions.find((transaction) => transaction.id === id);
  if (!item) {
    return;
  }

  editingTransactionId = id;
  setTransactionType(item.type);
  elements.description.value = item.description;
  elements.category.value = item.category;
  elements.amount.value = item.amount;
  elements.transactionForm.querySelector("button[type='submit']").lastChild.textContent = " Salvar lançamento";
  elements.description.focus();
}

function removeInvestment(id) {
  state.investments = state.investments.filter((item) => item.id !== id);
  writeStorage(INVESTMENT_KEY, state.investments);
  render();
}

function editInvestment(id) {
  const item = state.investments.find((investment) => investment.id === id);
  if (!item) {
    return;
  }

  editingInvestmentId = id;
  elements.assetName.value = item.name;
  elements.assetClass.value = item.assetClass;
  elements.assetRisk.value = item.risk;
  elements.assetInvested.value = item.invested;
  elements.assetCurrent.value = item.current;
  elements.investmentForm.querySelector("button[type='submit']").lastChild.textContent = " Salvar investimento";
  elements.assetName.focus();
}

function removeGoal(id) {
  state.goals = state.goals.filter((item) => item.id !== id);
  writeStorage(GOAL_KEY, state.goals);
  render();
}

function editGoal(id) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) {
    return;
  }

  editingGoalId = id;
  elements.goalName.value = goal.name;
  elements.goalKind.value = goal.kind;
  elements.goalDate.value = goal.date;
  elements.goalTarget.value = goal.target;
  elements.goalCurrent.value = goal.current;
  elements.goalForm.querySelector("button[type='submit']").lastChild.textContent = " Salvar meta";
  elements.goalName.focus();
}

async function clearAllData() {
  if (state.transactions.length === 0 && state.investments.length === 0 && state.goals.length === 0 && Object.keys(state.budgets).length === 0) {
    return;
  }

  const decision = await askDialog({
    title: "Limpar dados",
    message: "Isso apaga transacoes, investimentos, metas e limites cadastrados nesta conta.",
    confirmText: "Limpar dados",
    danger: true,
  });
  if (!decision.confirmed) {
    return;
  }

  state.transactions = [];
  state.investments = [];
  state.goals = [];
  state.budgets = {};
  state.messages = [];
  writeStorage(TRANSACTION_KEY, state.transactions);
  writeStorage(INVESTMENT_KEY, state.investments);
  writeStorage(GOAL_KEY, state.goals);
  writeStorage(BUDGET_KEY, state.budgets);
  writeStorage(CHAT_KEY, state.messages);
  showToast("Dados financeiros limpos.", "success");
  render();
  renderChatHistory();
}

function renderSummary() {
  const summary = getSummary();
  const ratio = summary.income > 0 ? formatPercent(summary.expenseRatio * 100) : "0,00%";

  elements.monthLabel.textContent = getMonthLabel();
  elements.monthNext.disabled = state.monthOffset >= 0;
  elements.monthNext.hidden = state.monthOffset >= 0;
  elements.monthToday.hidden = state.monthOffset === 0;
  elements.balance.textContent = formatCurrency(summary.balance);
  elements.balance.classList.toggle("negative", summary.balance < 0);
  elements.balance.classList.toggle("positive", summary.balance >= 0);
  elements.balanceTrend.textContent =
    summary.loggedIncome > 0
      ? summary.balance >= 0 ? "Você está no positivo" : "Saldo negativo no mês"
      : "Usando renda estimada do perfil";
  elements.income.textContent = formatCurrency(summary.income);
  elements.expenses.textContent = formatCurrency(summary.expenses);
  elements.expenseRatio.textContent =
    summary.fixedExpenses > 0 || summary.investmentOutflow > 0
      ? `${ratio} das receitas, incluindo fixos ${formatCurrency(summary.fixedExpenses)} e aportes ${formatCurrency(summary.investmentOutflow)}`
      : `${ratio} das receitas`;
  elements.dailyBudget.textContent = formatCurrency(summary.dailyBudget);
  elements.daysLeft.textContent = `${summary.daysLeft} dias restantes`;
  elements.dailyRate.textContent = formatCurrency(summary.dailyRate);
  elements.projectedBalance.textContent = formatCurrency(summary.projectedBalance);
  elements.projectedBalance.classList.toggle("negative", summary.projectedBalance < 0);
  elements.projectedBalance.classList.toggle("positive", summary.projectedBalance >= 0);
  elements.forecastLabel.textContent = summary.projectedBalance >= 0 ? "Saudável" : "Atenção";
  elements.forecastLabel.className = summary.projectedBalance >= 0 ? "positive" : "warning";
  elements.emergencyTarget.textContent = formatCurrency(summary.emergencyTarget);

  const profile = getFinancialProfile(summary);
  elements.profileName.textContent = profile.name;
  elements.profileName.className = profile.tone;
  elements.profileDescription.textContent = profile.description;
  renderDashboardDecisions(summary);
}

function renderDashboardDecisions(summary) {
  const categories = getCategoryGroups();
  const goals = getGoalsSummary();
  const topCategory = categories[0];

  if (summary.income <= 0) {
    elements.decisionToday.textContent = "Cadastre sua renda";
    elements.decisionTodayDetail.textContent = "Com a renda registrada, o app calcula limite diário e previsão do mês.";
  } else if (summary.loggedIncome <= 0 && summary.estimatedIncome > 0) {
    elements.decisionToday.textContent = `Planeje com ${formatCurrency(summary.dailyBudget)}/dia`;
    elements.decisionTodayDetail.textContent = "Calculado pela renda estimada do cadastro. Lance a receita real quando ela entrar.";
  } else if (summary.balance <= 0) {
    elements.decisionToday.textContent = "Recupere o caixa";
    elements.decisionTodayDetail.textContent = `Faltam ${formatCurrency(Math.abs(summary.balance))} para fechar o mês no positivo.`;
  } else {
    elements.decisionToday.textContent = `Gaste até ${formatCurrency(summary.dailyBudget)} hoje`;
    elements.decisionTodayDetail.textContent =
      summary.investmentOutflow > 0
        ? "Esse limite ja considera os aportes feitos na carteira neste mes."
        : "Esse é o limite diário para manter a previsão positiva até o fim do mês.";
  }

  if (!topCategory) {
    elements.decisionCategory.textContent = "Sem despesas";
    elements.decisionCategoryDetail.textContent = "Adicione gastos para descobrir onde o dinheiro está indo.";
  } else {
    elements.decisionCategory.textContent = `Revise ${topCategory.name}`;
    elements.decisionCategoryDetail.textContent = `${formatPercent(topCategory.percent)} das despesas do mês estão nessa categoria.`;
  }

  if (!goals.mainGoal) {
    elements.decisionGoal.textContent = "Crie uma meta";
    elements.decisionGoalDetail.textContent = "Reserva, dívida ou compra planejada deixam o plano mais claro.";
  } else {
    elements.decisionGoal.textContent = `Aporte ${formatCurrency(goals.monthlyNeeded)}/mês`;
    elements.decisionGoalDetail.textContent = `Para avançar em ${goals.mainGoal.name} dentro do prazo cadastrado.`;
  }
}

function getFinancialProfile(summary) {
  if (summary.income <= 0) {
    return {
      name: "Indefinido",
      tone: "",
      description: "Adicione receitas e despesas para montar seu diagnóstico.",
    };
  }

  if (summary.expenseRatio <= 0.5) {
    return {
      name: "Controlado",
      tone: "positive",
      description: "Você preserva boa parte da renda. Vale acelerar reserva e aportes planejados.",
    };
  }

  if (summary.expenseRatio <= 0.8) {
    return {
      name: "Equilibrado",
      tone: "positive",
      description: "O mês está administrável. O ponto de atenção é separar dinheiro antes do gasto acontecer.",
    };
  }

  if (summary.expenseRatio <= 1) {
    return {
      name: "No limite",
      tone: "warning",
      description: "As despesas estão perto das receitas. Revise recorrências e compras variáveis.",
    };
  }

  return {
    name: "Crítico",
    tone: "negative",
    description: "As despesas passaram das receitas. Priorize cortar vazamentos antes de investir.",
  };
}

function renderTransactions() {
  const visibleTransactions = state.transactions.filter((item) => isDateInRange(item.date, getSelectedMonthRange()));
  if (visibleTransactions.length === 0) {
    elements.transactionList.className = "empty-state";
    elements.transactionList.textContent = "Nenhuma transação no mês selecionado.";
    return;
  }

  elements.transactionList.className = "transaction-list";
  elements.transactionList.innerHTML = visibleTransactions
    .slice(0, 10)
    .map((item) => {
      const isIncome = item.type === "income";
      const date = new Date(item.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });
      const sign = isIncome ? "+" : "-";
      const amountClass = isIncome ? "positive" : "negative";
      const icon = isIncome ? "+" : "-";

      return `
        <article class="transaction-item">
          <span class="item-icon ${isIncome ? "" : "expense"}">${icon}</span>
          <div class="item-copy">
            <strong>${escapeHtml(item.description)}</strong>
            <span>${escapeHtml(item.category)} · ${date}</span>
          </div>
          <span class="amount-label ${amountClass}">${sign}${formatCurrency(item.amount)}</span>
          <div class="item-actions">
            <button class="edit-button" type="button" data-edit-transaction="${item.id}">Editar</button>
            <button class="delete-button" type="button" data-delete-transaction="${item.id}" aria-label="Excluir transação">×</button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.transactionList.querySelectorAll("[data-delete-transaction]").forEach((button) => {
    button.addEventListener("click", () => removeTransaction(button.dataset.deleteTransaction));
  });
  elements.transactionList.querySelectorAll("[data-edit-transaction]").forEach((button) => {
    button.addEventListener("click", () => editTransaction(button.dataset.editTransaction));
  });
}

function renderCategories() {
  const groups = getCategoryGroups();

  if (groups.length === 0) {
    elements.topCategory.textContent = "Sem dados";
    elements.categoryChart.className = "empty-state";
    elements.categoryChart.textContent = "Cadastre despesas para ver a distribuição.";
    return;
  }

  elements.topCategory.textContent = groups[0].name;
  elements.categoryChart.className = "category-list";
  elements.categoryChart.innerHTML = groups
    .map(
      (group) => `
        <div class="category-row">
          <header>
            <span>${escapeHtml(group.name)}</span>
            <strong>${formatCurrency(group.amount)} · ${formatPercent(group.percent)}</strong>
          </header>
          <div class="bar"><span style="width: ${Math.max(5, group.percent)}%"></span></div>
        </div>
      `,
    )
    .join("");
}

function renderCategoryControls() {
  const selectedCategory = elements.category.value;
  const selectedBudget = elements.budgetCategory.value;
  const options = state.categories.map((category) => `<option>${escapeHtml(category)}</option>`).join("");

  elements.category.innerHTML = options;
  elements.budgetCategory.innerHTML = state.categories
    .filter((category) => category !== "Receita")
    .map((category) => `<option>${escapeHtml(category)}</option>`)
    .join("");

  if (state.categories.includes(selectedCategory)) {
    elements.category.value = selectedCategory;
  }

  if (state.categories.includes(selectedBudget)) {
    elements.budgetCategory.value = selectedBudget;
  }

  elements.categoryCount.textContent = `${state.categories.length} categorias`;
  elements.categoryManager.innerHTML = state.categories
    .map(
      (category) => `
        <button class="chip" type="button" data-remove-category="${escapeHtml(category)}" ${DEFAULT_CATEGORIES.includes(category) ? "disabled" : ""}>
          ${escapeHtml(category)}
        </button>
      `,
    )
    .join("");

  elements.categoryManager.querySelectorAll("[data-remove-category]").forEach((button) => {
    button.addEventListener("click", () => removeCategory(button.dataset.removeCategory));
  });
}

function renderBudgets() {
  const rows = getBudgetRows();
  const overLimit = rows.filter((row) => row.limit > 0 && row.percent >= 100).length;

  elements.budgetStatus.textContent =
    rows.length === 0 ? "Sem limites" : overLimit > 0 ? `${overLimit} acima do limite` : "Dentro do planejado";

  if (rows.length === 0) {
    elements.budgetList.className = "empty-state";
    elements.budgetList.textContent = "Defina limites por categoria para receber alertas.";
    return;
  }

  elements.budgetList.className = "budget-list";
  elements.budgetList.innerHTML = rows
    .map((row) => {
      const tone = row.limit > 0 && row.percent >= 100 ? "negative" : row.percent >= 80 ? "warning" : "positive";
      const width = row.limit > 0 ? Math.min(100, Math.max(4, row.percent)) : 4;
      return `
        <article class="budget-row">
          <header>
            <strong>${escapeHtml(row.category)}</strong>
            <span class="${tone}">${formatCurrency(row.spent)} / ${row.limit > 0 ? formatCurrency(row.limit) : "sem limite"}</span>
          </header>
          <div class="bar"><span style="width: ${width}%"></span></div>
        </article>
      `;
    })
    .join("");
}

function renderMonthlyInsights() {
  const current = getSummaryForRange(getSelectedMonthRange());
  const previous = getSummaryForRange(getMonthRange(state.monthOffset - 1));
  const expenseDelta = current.expenses - previous.expenses;
  const incomeDelta = current.income - previous.income;
  const categories = getCategoryGroups();
  const budgetAlerts = getBudgetRows().filter((row) => row.limit > 0 && row.percent >= 80);

  elements.monthlyStatus.textContent =
    current.items.length === 0 ? "Sem dados no mês" : `${current.items.length} lançamentos`;

  elements.monthlyInsights.innerHTML = [
    {
      label: "Receitas vs mês anterior",
      value: `${formatCurrency(current.income)} (${incomeDelta >= 0 ? "+" : ""}${formatCurrency(incomeDelta)})`,
      tone: incomeDelta >= 0 ? "positive" : "warning",
    },
    {
      label: "Despesas vs mês anterior",
      value: `${formatCurrency(current.expenses)} (${expenseDelta >= 0 ? "+" : ""}${formatCurrency(expenseDelta)})`,
      tone: expenseDelta <= 0 ? "positive" : "warning",
    },
    {
      label: "Maior gasto",
      value: categories[0] ? `${categories[0].name} · ${formatCurrency(categories[0].amount)}` : "Sem despesas",
      tone: categories[0] ? "warning" : "positive",
    },
    {
      label: "Alertas de orçamento",
      value: budgetAlerts.length ? `${budgetAlerts.length} categoria(s) perto/acima do limite` : "Nenhum alerta",
      tone: budgetAlerts.length ? "negative" : "positive",
    },
  ]
    .map(
      (item) => `
        <article class="insight-item">
          <span>${escapeHtml(item.label)}</span>
          <strong class="${item.tone}">${escapeHtml(item.value)}</strong>
        </article>
      `,
    )
    .join("");
}

function getSmartAlerts() {
  const summary = getSummary();
  const alerts = [];
  const budgetAlerts = getBudgetRows().filter((row) => row.limit > 0 && row.percent >= 80);
  const topCategory = getCategoryGroups()[0];

  if (summary.income <= 0) {
    alerts.push({ tone: "warning", title: "Renda não cadastrada", text: "Cadastre uma receita para o app calcular limite diário e previsão." });
  } else if (summary.loggedIncome <= 0 && summary.estimatedIncome > 0) {
    alerts.push({ tone: "warning", title: "Usando renda estimada", text: "A previsão usa a renda informada no cadastro até você lançar a receita real do mês." });
  }

  if (summary.fixedExpenses > 0) {
    alerts.push({ tone: "positive", title: "Gastos fixos considerados", text: `${formatCurrency(summary.fixedExpenses)} de compromissos fixos entraram no cálculo do mês.` });
  }

  if (summary.projectedBalance < 0) {
    alerts.push({ tone: "negative", title: "Previsão negativa", text: `A projeção fecha em ${formatCurrency(summary.projectedBalance)}. Revise gastos antes de novos compromissos.` });
  }

  budgetAlerts.slice(0, 2).forEach((row) => {
    alerts.push({
      tone: row.percent >= 100 ? "negative" : "warning",
      title: `${row.category} no limite`,
      text: `${formatPercent(row.percent)} do orçamento usado (${formatCurrency(row.spent)} de ${formatCurrency(row.limit)}).`,
    });
  });

  if (summary.investmentOutflow > Math.max(0, summary.balance) && summary.investmentOutflow > 0) {
    alerts.push({
      tone: "warning",
      title: "Aporte pressionando caixa",
      text: `${formatCurrency(summary.investmentOutflow)} aplicado neste mês. Confirme se o saldo diário ainda cobre os gastos.`,
    });
  }

  if (topCategory && topCategory.percent >= 45) {
    alerts.push({
      tone: "warning",
      title: `Concentração em ${topCategory.name}`,
      text: `${formatPercent(topCategory.percent)} das despesas estão nessa categoria.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({ tone: "positive", title: "Sem alertas críticos", text: "O mês selecionado não tem orçamento estourado nem previsão negativa." });
  }

  return alerts.slice(0, 4);
}

function renderSmartAlerts() {
  elements.smartAlerts.innerHTML = getSmartAlerts()
    .map(
      (alert) => `
        <article class="smart-alert ${alert.tone}">
          <strong>${escapeHtml(alert.title)}</strong>
          <span>${escapeHtml(alert.text)}</span>
        </article>
      `,
    )
    .join("");
}

function renderInvestments() {
  const portfolio = getPortfolioSummary();

  elements.portfolioCurrent.textContent = formatCurrency(portfolio.current);
  elements.portfolioReturn.textContent = formatCurrency(portfolio.result);
  elements.portfolioReturn.classList.toggle("positive", portfolio.result >= 0);
  elements.portfolioReturn.classList.toggle("negative", portfolio.result < 0);
  elements.portfolioReturnRate.textContent = formatPercent(portfolio.rate);
  elements.portfolioReturnRate.classList.toggle("positive", portfolio.rate >= 0);
  elements.portfolioReturnRate.classList.toggle("negative", portfolio.rate < 0);

  if (state.investments.length === 0) {
    elements.investmentList.className = "empty-state";
    elements.investmentList.textContent = "Sua carteira ainda está vazia.";
    return;
  }

  elements.investmentList.className = "asset-list";
  elements.investmentList.innerHTML = state.investments
    .map((item) => {
      const result = item.current - item.invested;
      const rate = item.invested > 0 ? (result / item.invested) * 100 : 0;
      const tone = result >= 0 ? "positive" : "negative";

      return `
        <article class="asset-item">
          <div class="item-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span class="asset-meta">${escapeHtml(item.assetClass)} · risco ${escapeHtml(item.risk)} · aplicado ${formatCurrency(item.invested)}</span>
          </div>
          <div class="asset-return">
            <strong>Hoje: ${formatCurrency(item.current)}</strong>
            <span class="${tone}">${formatCurrency(result)} · ${formatPercent(rate)}</span>
          </div>
          <div class="item-actions">
            <button class="edit-button" type="button" data-edit-investment="${item.id}">Editar</button>
            <button class="delete-button" type="button" data-delete-investment="${item.id}" aria-label="Excluir investimento">×</button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.investmentList.querySelectorAll("[data-delete-investment]").forEach((button) => {
    button.addEventListener("click", () => removeInvestment(button.dataset.deleteInvestment));
  });
  elements.investmentList.querySelectorAll("[data-edit-investment]").forEach((button) => {
    button.addEventListener("click", () => editInvestment(button.dataset.editInvestment));
  });
}

function renderAllocation() {
  const groups = getAllocationGroups();

  if (groups.length === 0) {
    elements.allocationStatus.textContent = "Sem carteira";
    elements.allocationChart.className = "empty-state";
    elements.allocationChart.textContent = "Adicione ativos para visualizar a alocação.";
    return;
  }

  const riskyShare = groups
    .filter((group) => ["Ações", "FIIs", "Exterior", "Cripto"].includes(group.name))
    .reduce((sum, group) => sum + group.percent, 0);
  elements.allocationStatus.textContent = riskyShare > 45 ? "Mais arrojada" : "Mais defensiva";
  elements.allocationChart.className = "allocation-list";
  elements.allocationChart.innerHTML = groups
    .map(
      (group) => `
        <div class="allocation-row">
          <header>
            <span>${escapeHtml(group.name)}</span>
            <strong>${formatCurrency(group.amount)} · ${formatPercent(group.percent)}</strong>
          </header>
          <div class="bar"><span style="width: ${Math.max(5, group.percent)}%"></span></div>
        </div>
      `,
    )
    .join("");
}

function renderGoals() {
  const summary = getGoalsSummary();

  elements.goalsTarget.textContent = formatCurrency(summary.target);
  elements.goalsProgress.textContent = formatPercent(summary.progress);
  elements.goalsMonthly.textContent = formatCurrency(summary.monthlyNeeded);
  elements.goalHealth.textContent =
    state.goals.length === 0
      ? "Sem metas cadastradas."
      : `${state.goals.length} meta${state.goals.length > 1 ? "s" : ""} em andamento.`;

  if (state.goals.length === 0) {
    elements.goalList.className = "empty-state";
    elements.goalList.textContent = "Cadastre uma meta para acompanhar o progresso.";
    return;
  }

  elements.goalList.className = "goal-list";
  elements.goalList.innerHTML = state.goals
    .map((goal) => {
      const progress = getGoalProgress(goal);
      const monthly = getMonthlyNeeded(goal);
      const deadline = goal.date
        ? new Date(`${goal.date}T00:00:00`).toLocaleDateString("pt-BR", {
            month: "short",
            year: "numeric",
          })
        : "sem prazo";

      return `
        <article class="goal-item">
          <header>
            <div class="item-copy">
              <h3>${escapeHtml(goal.name)}</h3>
              <span class="goal-meta">${escapeHtml(goal.kind)} · ${deadline}</span>
            </div>
            <span class="risk-pill">${formatPercent(progress)}</span>
            <div class="item-actions">
              <button class="edit-button" type="button" data-edit-goal="${goal.id}">Editar</button>
              <button class="delete-button" type="button" data-delete-goal="${goal.id}" aria-label="Excluir meta">×</button>
            </div>
          </header>
          <div class="bar"><span style="width: ${Math.max(4, progress)}%"></span></div>
          <div class="goal-footer">
            <span>${formatCurrency(goal.current)} de ${formatCurrency(goal.target)}</span>
            <span>${formatCurrency(monthly)}/mês</span>
          </div>
        </article>
      `;
    })
    .join("");

  elements.goalList.querySelectorAll("[data-delete-goal]").forEach((button) => {
    button.addEventListener("click", () => removeGoal(button.dataset.deleteGoal));
  });
  elements.goalList.querySelectorAll("[data-edit-goal]").forEach((button) => {
    button.addEventListener("click", () => editGoal(button.dataset.editGoal));
  });
}

function renderRecommendations() {
  const summary = getSummary();
  const portfolio = getPortfolioSummary();
  const allocation = getAllocationGroups();
  const goals = getGoalsSummary();
  const hasReserve = allocation.some((group) => group.name === "Reserva");
  const riskyShare = allocation
    .filter((group) => ["Ações", "FIIs", "Exterior", "Cripto"].includes(group.name))
    .reduce((sum, group) => sum + group.percent, 0);

  const recommendations = [];

  if (summary.income <= 0) {
    recommendations.push({
      title: "Comece pelo mapa de renda",
      risk: "Base",
      text: "Cadastre a renda mensal para o sistema calcular orçamento diário, reserva e margem de aporte.",
    });
  } else if (summary.balance <= 0) {
    recommendations.push({
      title: "Prioridade: caixa positivo",
      risk: "Urgente",
      text: "Antes de investir, reduza despesas variáveis ou renegocie recorrências para fechar o mês no positivo.",
    });
  } else if (goals.mainGoal) {
    recommendations.push({
      title: "Aporte para meta",
      risk: "Plano",
      text: `Para avançar em ${goals.mainGoal.name}, tente reservar ${formatCurrency(goals.monthlyNeeded)} por mês.`,
    });
  } else if (summary.emergencyTarget > 0 && portfolio.current < summary.emergencyTarget && !hasReserve) {
    recommendations.push({
      title: "Reserva de emergência",
      risk: "Baixo",
      text: `Construa uma reserva próxima de ${formatCurrency(summary.emergencyTarget)} antes de aumentar risco.`,
    });
  } else {
    recommendations.push({
      title: "Aporte planejado",
      risk: "Moderado",
      text: `Sua margem diária estimada é ${formatCurrency(summary.dailyBudget)}. Defina um aporte automático que não pressione o caixa.`,
    });
  }

  if (riskyShare > 50) {
    recommendations.push({
      title: "Rebalanceamento",
      risk: "Alto",
      text: "Mais da metade da carteira está em ativos de maior oscilação. Confira se isso combina com seu prazo.",
    });
  } else if (portfolio.current > 0) {
    recommendations.push({
      title: "Diversificação",
      risk: "Médio",
      text: "Compare concentração por classe e evite que um único tipo de ativo defina todo o resultado.",
    });
  }

  const profile = riskyShare > 50 ? "Arrojado" : riskyShare > 20 ? "Moderado" : "Conservador";
  elements.investmentProfile.textContent = profile;
  elements.recommendations.innerHTML = recommendations
    .map(
      (item) => `
        <article class="recommendation">
          <header>
            <strong>${escapeHtml(item.title)}</strong>
            <span class="risk-pill">${escapeHtml(item.risk)}</span>
          </header>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function buildSnapshot() {
  const summary = getSummary();
  const portfolio = getPortfolioSummary();
  const categories = getCategoryGroups();
  const allocation = getAllocationGroups();
  const goals = getGoalsSummary();
  const transactionDetails = getTransactionDetails();
  const currentMonth = getSummaryForRange(getSelectedMonthRange());
  const previousMonth = getSummaryForRange(getMonthRange(state.monthOffset - 1));

  return {
    usuario: state.user
      ? {
          nome: state.user.name,
          foco: state.user.focus,
          rendaMensalEstimada: formatCurrency(state.user.income || 0),
          gastoFixoMensal: formatCurrency(state.user.fixedExpenses || 0),
          perfilInvestidor: state.user.investorProfile || "não informado",
        }
      : "perfil não preenchido",
    resumo: {
      saldo: formatCurrency(summary.balance),
      receitas: formatCurrency(summary.income),
      despesas: formatCurrency(summary.expenses),
      despesasSemInvestimentos: formatCurrency(summary.transactionExpenses),
      gastoFixoMensalDoPerfil: formatCurrency(summary.fixedExpenses),
      rendaUsadaNoPlanejamento: summary.loggedIncome > 0 ? "receitas lançadas no mês" : "renda mensal estimada do perfil",
      aportesEmInvestimentosNoMes: formatCurrency(summary.investmentOutflow),
      orcamentoDiario: formatCurrency(summary.dailyBudget),
      gastoMedioDia: formatCurrency(summary.dailyRate),
      previsaoFimMes: formatCurrency(summary.projectedBalance),
      diasRestantes: summary.daysLeft,
      perfil: getFinancialProfile(summary).name,
    },
    comparacaoMensal: {
      receitasMesAtual: formatCurrency(currentMonth.income),
      despesasMesAtual: formatCurrency(currentMonth.expenses),
      saldoMesAtual: formatCurrency(currentMonth.balance),
      receitasMesAnterior: formatCurrency(previousMonth.income),
      despesasMesAnterior: formatCurrency(previousMonth.expenses),
      saldoMesAnterior: formatCurrency(previousMonth.balance),
    },
    carteira: {
      totalAplicado: formatCurrency(portfolio.invested),
      valorAtual: formatCurrency(portfolio.current),
      resultado: formatCurrency(portfolio.result),
      rentabilidade: formatPercent(portfolio.rate),
      alocacao: allocation.map((item) => `${item.name}: ${formatPercent(item.percent)}`),
      investimentosDetalhados: state.investments.map((item) => ({
        nome: item.name,
        classe: item.assetClass,
        risco: item.risk,
        aplicado: formatCurrency(item.invested),
        valorAtual: formatCurrency(item.current),
        resultado: formatCurrency(item.current - item.invested),
      })),
    },
    metas: {
      total: formatCurrency(goals.target),
      progresso: formatPercent(goals.progress),
      aporteMensalSugerido: formatCurrency(goals.monthlyNeeded),
      principal: goals.mainGoal
        ? `${goals.mainGoal.name}: ${formatPercent(getGoalProgress(goals.mainGoal))}, faltam ${formatCurrency(Math.max(0, goals.mainGoal.target - goals.mainGoal.current))}`
        : "sem metas",
      metasDetalhadas: state.goals.map((goal) => ({
        nome: goal.name,
        tipo: goal.kind,
        prazo: goal.date || "sem prazo",
        objetivo: formatCurrency(goal.target),
        guardado: formatCurrency(goal.current),
        progresso: formatPercent(getGoalProgress(goal)),
        aporteMensalSugerido: formatCurrency(getMonthlyNeeded(goal)),
      })),
    },
    orcamentosPorCategoria: getBudgetRows().map((row) => ({
      categoria: row.category,
      gasto: formatCurrency(row.spent),
      limite: row.limit > 0 ? formatCurrency(row.limit) : "sem limite",
      uso: formatPercent(row.percent),
    })),
    memoriaDoAssistente: state.memory.slice(-6),
    transacoes: {
      totalCadastrado: state.transactions.length,
      limiteEnviado: transactionDetails.length,
      observacao:
        state.transactions.length > transactionDetails.length
          ? "Foram enviados os 120 lançamentos mais recentes e os agregados por título."
          : "Todos os lançamentos cadastrados foram enviados.",
      receitasPorTitulo: summarizeTransactionsByTitle("income"),
      despesasPorTitulo: summarizeTransactionsByTitle("expense"),
      lancamentosDetalhados: transactionDetails,
    },
    maioresGastos: categories.slice(0, 3).map((item) => `${item.name}: ${formatCurrency(item.amount)}`),
  };
}

function renderAssistantContext() {
  const summary = getSummary();
  const portfolio = getPortfolioSummary();
  const categories = getCategoryGroups();
  const goals = getGoalsSummary();

  elements.contextBalance.textContent = formatCurrency(summary.balance);
  elements.contextExpenses.textContent = formatCurrency(summary.expenses);
  elements.contextTransactions.textContent = `${state.transactions.length} item${state.transactions.length === 1 ? "" : "s"}`;
  elements.contextPortfolio.textContent = formatCurrency(portfolio.current);
  elements.contextCategory.textContent = categories[0]?.name ?? "Sem dados";
  elements.contextGoal.textContent = goals.mainGoal?.name ?? "Sem metas";
}

function renderUserProfile() {
  if (!state.user) {
    elements.userAvatar.textContent = "EU";
    elements.userLabel.textContent = "Entrar";
    elements.userPlan.textContent = "Perfil local";
    elements.accountSummary.textContent = "Entre para personalizar metas e diagnósticos.";
    elements.logoutButton.disabled = true;
    return;
  }

  const initials = state.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  elements.userAvatar.textContent = initials || "EU";
  elements.userLabel.textContent = state.user.name;
  elements.userPlan.textContent = state.user.focus;
  elements.accountSummary.textContent = `${state.user.email || "Sem e-mail"} · ${state.user.investorProfile || "Perfil não definido"} · renda ${formatCurrency(state.user.income || 0)}`;
  elements.logoutButton.disabled = false;
}

function showLoginScreen() {
  closeSettingsScreen();
  elements.loginScreen.hidden = false;
  elements.appShell.hidden = true;
  document.body.classList.add("is-login");
}

function showAppScreen() {
  elements.loginScreen.hidden = true;
  elements.appShell.hidden = false;
  document.body.classList.remove("is-login");
}

function syncLoginForm() {
  elements.loginEmail.value = state.user?.email || "";
  elements.loginPassword.value = "";
  elements.registerName.value = "";
  elements.registerEmail.value = "";
  elements.registerPassword.value = "";
  elements.registerCode.value = "";
  elements.registerCodeField.hidden = true;
  elements.registerCodeStatus.hidden = true;
  elements.registerCodeStatus.textContent = "";
  elements.registerSubmit.textContent = "Enviar código de cadastro";
  registerCodeRequested = false;
  elements.resetEmail.value = state.user?.email || "";
  elements.resetCode.value = "";
  elements.resetCodeStatus.hidden = true;
  elements.resetCodeStatus.textContent = "";
  elements.resetPassword.value = "";
  elements.resetConfirmPassword.value = "";
  elements.registerFocus.value = "Organizar gastos";
  elements.registerIncome.value = "";
  elements.registerFixedExpenses.value = "";
  elements.registerInvestorProfile.value = "Conservador";
  resetPasswordInputs();
}

function openLoginScreen() {
  hideLoginRequiredModal();
  closeSettingsScreen();
  elements.accountMenu.hidden = true;
  elements.accountButton.setAttribute("aria-expanded", "false");
  syncLoginForm();
  showLoginForm();
  showLoginScreen();
  elements.loginEmail.focus();
}

function openSettingsScreen() {
  transitionPage(() => {
    elements.settingsScreen.hidden = false;
    elements.appShell.classList.add("is-settings-view");
    renderSettings();
  });
}

function closeSettingsScreen() {
  if (elements.settingsScreen.hidden) {
    elements.appShell.classList.remove("is-settings-view");
    return;
  }

  transitionPage(() => {
    elements.appShell.classList.remove("is-settings-view");
    elements.settingsScreen.hidden = true;
  });
}

function transitionPage(updateView) {
  const target = elements.appShell;
  window.clearTimeout(pageTransitionTimer);
  target.classList.remove("page-transition", "page-exit");
  void target.offsetWidth;
  target.classList.add("page-exit");

  pageTransitionTimer = window.setTimeout(() => {
    updateView();
    window.scrollTo({ top: 0, behavior: "smooth" });
    target.classList.remove("page-exit");
    void target.offsetWidth;
    target.classList.add("page-transition");
  }, 170);
}

function showLoginForm() {
  elements.loginForm.hidden = false;
  elements.registerForm.hidden = true;
  elements.resetForm.hidden = true;
  elements.loginEmail.focus();
}

function showRegisterForm() {
  elements.loginForm.hidden = true;
  elements.registerForm.hidden = false;
  elements.resetForm.hidden = true;
  elements.registerName.focus();
}

function showResetForm() {
  elements.loginForm.hidden = true;
  elements.registerForm.hidden = true;
  elements.resetForm.hidden = false;
  elements.resetEmail.value = elements.loginEmail.value.trim() || elements.resetEmail.value;
  elements.resetEmail.focus();
}

function resetPasswordInputs() {
  elements.passwordToggles.forEach((button) => {
    const input = document.querySelector(`#${button.dataset.togglePassword}`);
    if (input) {
      input.type = "password";
    }
    button.textContent = "Mostrar";
  });
}

function togglePasswordVisibility(button) {
  const input = document.querySelector(`#${button.dataset.togglePassword}`);
  if (!input) {
    return;
  }

  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.textContent = show ? "Ocultar" : "Mostrar";
  input.focus();
}

async function loginUser(event) {
  event.preventDefault();

  const login = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;
  if (!login) {
    elements.loginEmail.focus();
    return;
  }

  if (!password) {
    elements.loginPassword.focus();
    return;
  }

  try {
    const result = await apiRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        mode: "login",
        profile: { email: login, login },
        password,
      }),
    });

    state.user = result.user;
    state.serverBacked = true;
    applyUserData(result.data || {});
  } catch (error) {
    showToast(error.message || "Não foi possível entrar.", "error");
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(state.user));
  elements.loginPassword.value = "";
  showAppScreen();
  render();
  renderChatHistory();
}

async function loginWithCode() {
  const email = elements.loginEmail.value.trim();
  const code = elements.loginCode.value.trim();

  if (!email) {
    elements.loginEmail.focus();
    return;
  }

  if (!code) {
    elements.loginCode.focus();
    return;
  }

  try {
    const result = await apiRequest("/api/auth-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });

    state.user = result.user;
    state.serverBacked = true;
    applyUserData(result.data || {});
  } catch (error) {
    showToast(error.message || "Não foi possível entrar com o código.", "error");
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(state.user));
  elements.loginCode.value = "";
  showAppScreen();
  render();
  renderChatHistory();
}

async function registerUser(event) {
  event.preventDefault();

  const name = elements.registerName.value.trim();
  const email = elements.registerEmail.value.trim();
  const password = elements.registerPassword.value;
  const code = elements.registerCode.value.trim();

  if (!name) {
    elements.registerName.focus();
    return;
  }

  if (!email) {
    elements.registerEmail.focus();
    return;
  }

  if (!password) {
    elements.registerPassword.focus();
    return;
  }

  const profile = {
    name,
    email,
    focus: elements.registerFocus.value,
    income: Number(elements.registerIncome.value || 0),
    fixedExpenses: Number(elements.registerFixedExpenses.value || 0),
    investorProfile: elements.registerInvestorProfile.value,
    updatedAt: new Date().toISOString(),
  };

  if (!registerCodeRequested) {
    await requestEmailCode({
      email,
      purpose: "register",
      button: elements.registerSubmit,
      status: elements.registerCodeStatus,
      afterSuccess: (result) => {
        registerCodeRequested = true;
        elements.registerCodeField.hidden = false;
        elements.registerSubmit.textContent = "Cadastrar";
        elements.registerCode.focus();
        showCodeStatus(elements.registerCodeStatus, result);
      },
    });
    return;
  }

  if (!code) {
    elements.registerCode.focus();
    return;
  }

  try {
    await apiRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        mode: "register",
        profile,
        password,
        code,
        data: emptyUserData(),
      }),
    });
  } catch (error) {
    showToast(error.message || "Não foi possível entrar.", "error");
    return;
  }

  state.user = null;
  state.serverBacked = false;
  localStorage.removeItem(USER_KEY);
  clearLocalUserData();
  elements.loginEmail.value = email;
  elements.loginPassword.value = "";
  elements.registerForm.reset();
  elements.registerCode.value = "";
  elements.registerCodeField.hidden = true;
  elements.registerCodeStatus.hidden = true;
  elements.registerSubmit.textContent = "Enviar código de cadastro";
  registerCodeRequested = false;
  showLoginForm();
  showToast("Conta criada. Agora entre com seu e-mail e senha.", "success");
}

async function requestResetCode() {
  const email = elements.resetEmail.value.trim();
  if (!email) {
    elements.resetEmail.focus();
    return;
  }

  await requestEmailCode({
    email,
    purpose: "reset",
    button: elements.sendResetCode,
    status: elements.resetCodeStatus,
    afterSuccess: (result) => {
      elements.resetCode.focus();
      showCodeStatus(elements.resetCodeStatus, result);
    },
  });
}

async function requestEmailCode({ email, purpose, button, status, afterSuccess }) {
  button.disabled = true;
  status.hidden = false;
  status.textContent = "Enviando código...";

  try {
    const result = await apiRequest("/api/email-code", {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    });
    afterSuccess(result);
  } catch (error) {
    status.textContent = error.message || "Não foi possível enviar o código.";
  } finally {
    button.disabled = false;
  }
}

function showCodeStatus(element, result) {
  element.hidden = false;
  if (result.devCode) {
    element.innerHTML = `Modo local: use o código <strong>${escapeHtml(result.devCode)}</strong>.`;
    return;
  }
  element.textContent = result.message || "Código enviado. Verifique seu e-mail.";
}

async function resetPassword(event) {
  event.preventDefault();

  const email = elements.resetEmail.value.trim();
  const code = elements.resetCode.value.trim();
  const password = elements.resetPassword.value;
  const confirmation = elements.resetConfirmPassword.value;

  if (!email) {
    elements.resetEmail.focus();
    return;
  }

  if (!code) {
    elements.resetCode.focus();
    return;
  }

  if (!password) {
    elements.resetPassword.focus();
    return;
  }

  if (password !== confirmation) {
    showToast("As senhas não conferem.", "error");
    elements.resetConfirmPassword.focus();
    return;
  }

  try {
    await apiRequest("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });
  } catch (error) {
    showToast(error.message || "Não foi possível redefinir a senha.", "error");
    return;
  }

  elements.loginEmail.value = email;
  elements.loginPassword.value = "";
  elements.resetForm.reset();
  showLoginForm();
  showToast("Senha redefinida. Entre com a nova senha.", "success");
}

async function logoutUser() {
  if (state.serverBacked && window.location.protocol !== "file:") {
    try {
      await apiRequest("/api/logout", { method: "POST", body: "{}" });
    } catch {
      // The local copy will still be cleared below.
    }
  }

  state.user = null;
  state.serverBacked = false;
  localStorage.removeItem(USER_KEY);
  clearLocalUserData();
  elements.accountMenu.hidden = true;
  elements.accountButton.setAttribute("aria-expanded", "false");
  syncLoginForm();
  showLoginForm();
  showLoginScreen();
  showToast("Voce saiu da conta.", "success");
  render();
  renderChatHistory();
}

function renderAuthScreen() {
  if (state.user) {
    showAppScreen();
  } else {
    showAppScreen();
    syncLoginForm();
  }
}

async function restoreServerSession() {
  if (window.location.protocol === "file:") {
    state.user = null;
    state.serverBacked = false;
    localStorage.removeItem(USER_KEY);
    clearLocalUserData();
    return;
  }

  try {
    const session = await apiRequest("/api/session");
    if (!session.authenticated) {
      state.user = null;
      state.serverBacked = false;
      localStorage.removeItem(USER_KEY);
      clearLocalUserData();
      return;
    }

    state.user = session.user;
    state.serverBacked = true;
    applyUserData(session.data || {});
    localStorage.setItem(USER_KEY, JSON.stringify(state.user));
  } catch {
    state.user = null;
    state.serverBacked = false;
    localStorage.removeItem(USER_KEY);
    clearLocalUserData();
  }
}

function renderChatHistory() {
  elements.chatMessages.innerHTML = "";

  if (state.messages.length === 0) {
    addMessage(
      "assistant",
      "Olá! Eu posso analisar seu caixa, gastos, orçamento diário e carteira. Se o servidor de IA estiver ligado, eu respondo pela API; se não, aviso e uso o modo local.",
      false,
    );
    return;
  }

  state.messages.forEach((message) => renderChatMessage(message.role, message.content));
}

function addMessage(role, content, persist = true) {
  const message = { role, content };
  state.messages.push(message);
  if (state.messages.length > 20) {
    state.messages = state.messages.slice(-20);
  }

  if (persist) {
    writeStorage(CHAT_KEY, state.messages);
    if (role === "assistant") {
      rememberAssistantInsight(content);
    }
  }

  renderChatMessage(role, content);
}

function rememberAssistantInsight(content) {
  const text = String(content).replace(/\s+/g, " ").trim();
  if (!text || /limite gratuito|modo local/i.test(text)) {
    return;
  }

  state.memory.push({
    id: crypto.randomUUID(),
    text: text.slice(0, 220),
    date: new Date().toISOString(),
  });
  state.memory = state.memory.slice(-12);
  writeStorage(MEMORY_KEY, state.memory);
}

function renderChatMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message-row ${role === "user" ? "user" : "assistant"}`;

  const text = escapeHtml(content);
  if (role === "user") {
    row.innerHTML = `<div class="message user">${text}</div><span class="avatar">EU</span>`;
  } else {
    row.innerHTML = `<span class="avatar">AI</span><div class="message">${text}</div>`;
  }

  elements.chatMessages.appendChild(row);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function sendChatMessage(event) {
  event.preventDefault();
  const message = elements.chatInput.value.trim();

  if (!message) {
    return;
  }

  elements.chatInput.value = "";
  addMessage("user", message);
  setChatPending(true);

  try {
    const answer = await askServerAssistant(message);
    addMessage("assistant", answer);
  } catch (error) {
    const detail = error.message || "";
    const localAnswer = answerLocally(message);
    addMessage("assistant", `Não consegui usar a API agora: ${detail || "falha no servidor de IA."} Resposta local: ${localAnswer}`);
  } finally {
    setChatPending(false);
  }
}

async function askServerAssistant(message) {
  if (window.location.protocol === "file:") {
    throw new Error("Servidor local não está ativo.");
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      snapshot: buildSnapshot(),
      history: state.messages.slice(-8),
    }),
  });

  if (!response.ok) {
    let message = "Falha no assistente remoto.";
    try {
      const errorData = await response.json();
      const provider = errorData.provider ? `${errorData.provider.toUpperCase()}: ` : "";
      message = `${provider}${errorData.error || message}`;
    } catch {
      // Keep the default message when the server does not return JSON.
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.answer;
}

function setChatPending(pending) {
  elements.chatInput.disabled = pending;
  elements.chatForm.querySelector("button").disabled = pending;
}

function answerLocally(question) {
  const text = question.toLowerCase();
  const summary = getSummary();
  const portfolio = getPortfolioSummary();
  const categories = getCategoryGroups();
  const goals = getGoalsSummary();
  const matches = findTransactionsFromQuestion(question);

  if (matches.length > 0) {
    const total = matches.reduce((sum, item) => sum + item.amount, 0);
    const incomes = matches.filter((item) => item.type === "income");
    const expenses = matches.filter((item) => item.type === "expense");
    const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
    const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
    const titles = [...new Set(matches.map((item) => item.description))].slice(0, 4).join(", ");

    if (incomes.length > 0 && expenses.length === 0) {
      return `${titles}: ${formatCurrency(incomeTotal)} em receita (${matches.length} lançamento(s)).`;
    }

    if (expenses.length > 0 && incomes.length === 0) {
      return `${titles}: ${formatCurrency(expenseTotal)} em despesa (${matches.length} lançamento(s)).`;
    }

    return `${titles}: total ${formatCurrency(total)}. Receitas ${formatCurrency(incomeTotal)} e despesas ${formatCurrency(expenseTotal)}.`;
  }

  if (text.includes("gastar") || text.includes("posso") || text.includes("hoje")) {
    return `Limite diário estimado: ${formatCurrency(summary.dailyBudget)}. Para recorrências, considere isso antes do gasto.`;
  }

  if (text.includes("perfil")) {
    const profile = getFinancialProfile(summary);
    return `${profile.name}: ${profile.description}`;
  }

  if (text.includes("saldo") || text.includes("caixa")) {
    return `Seu saldo atual é ${formatCurrency(summary.balance)}. A previsão para o fim do mês está em ${formatCurrency(summary.projectedBalance)}.`;
  }

  if (text.includes("gasto") || text.includes("despesa") || text.includes("categoria")) {
    const top = categories[0];
    if (!top) {
      return "Ainda não há despesas suficientes para apontar uma categoria principal.";
    }
    return `Sua maior categoria de gasto é ${top.name}, com ${formatCurrency(top.amount)} (${formatPercent(top.percent)} das despesas).`;
  }

  if (text.includes("carteira") || text.includes("invest")) {
    if (portfolio.current <= 0) {
      return "Sua carteira ainda não tem ativos cadastrados. Antes de buscar rentabilidade, monte uma reserva e registre seus investimentos atuais.";
    }
    return `Carteira: valor atual ${formatCurrency(portfolio.current)}. Total aplicado ${formatCurrency(portfolio.invested)}. Resultado ${formatCurrency(portfolio.result)} (${formatPercent(portfolio.rate)}). Os aportes do mês reduzem seu saldo disponível.`;
  }

  if (text.includes("meta") || text.includes("objetivo")) {
    if (!goals.mainGoal) {
      return "Você ainda não cadastrou metas. Crie uma meta com valor e prazo para eu calcular o aporte mensal sugerido.";
    }

    const missing = Math.max(0, goals.mainGoal.target - goals.mainGoal.current);
    return `Meta principal: ${goals.mainGoal.name}. Faltam ${formatCurrency(missing)}; aporte sugerido: ${formatCurrency(goals.monthlyNeeded)}/mês.`;
  }

  if (text.includes("prior")) {
    if (summary.balance <= 0) {
      return "Prioridade: deixar o caixa positivo. Depois disso, construa reserva de emergência e só então aumente risco nos investimentos.";
    }
    return "Prioridade sugerida: manter orçamento diário, formar reserva de emergência e programar aportes compatíveis com seu fluxo de caixa.";
  }

  return "Consigo te ajudar com saldo, despesas, orçamento diário, metas, perfil financeiro e carteira. Com uma chave de IA ativa, eu respondo de forma generativa usando o contexto do app.";
}

function setAssistantMode() {
  if (window.location.protocol === "file:") {
    elements.assistantMode.textContent = "Modo local";
    elements.statusDot.classList.remove("online");
    return;
  }

  fetch("/api/health")
    .then((response) => response.json())
    .then((data) => {
      elements.assistantMode.textContent = data.aiReady
        ? `${data.provider.toUpperCase()} configurado`
        : "Modo local";
      elements.settingsAiLabel.textContent = data.aiReady
        ? `${data.provider.toUpperCase()} · ${data.model || "modelo ativo"}`
        : "Modo local";
      if (elements.settingsStorageLabel) {
        elements.settingsStorageLabel.textContent = data.database === "supabase" ? "Supabase" : "Local";
      }
      elements.statusDot.classList.toggle("online", Boolean(data.aiReady));
    })
    .catch(() => {
      elements.assistantMode.textContent = "Modo local";
      elements.settingsAiLabel.textContent = "Modo local";
      elements.statusDot.classList.remove("online");
    });
}

function drawAmbientCanvas() {
  const canvas = elements.ambientCanvas;
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dark = getTheme() === "dark";

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  let frame = 0;
  const lineColor = dark ? "rgba(196,181,253,0.18)" : "rgba(37,99,235,0.16)";
  const accentColor = dark ? "rgba(52,211,153,0.12)" : "rgba(16,185,129,0.11)";

  if (ambientAnimationId) {
    window.cancelAnimationFrame(ambientAnimationId);
  }

  function draw() {
    frame += 0.012;
    context.clearRect(0, 0, width, height);

    context.lineWidth = 1;
    for (let row = 0; row < 7; row += 1) {
      const y = height * (0.18 + row * 0.12);
      context.beginPath();
      for (let x = -40; x <= width + 40; x += 18) {
        const wave = Math.sin(x * 0.012 + frame + row * 0.9) * (10 + row * 1.7);
        const slope = (x / width) * 26;
        if (x === -40) {
          context.moveTo(x, y + wave + slope);
        } else {
          context.lineTo(x, y + wave + slope);
        }
      }
      context.strokeStyle = row % 2 === 0 ? lineColor : accentColor;
      context.stroke();
    }

    context.lineWidth = 0.8;
    context.strokeStyle = dark ? "rgba(255,255,255,0.045)" : "rgba(20,32,51,0.055)";
    for (let x = 0; x < width; x += 72) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + Math.sin(frame + x) * 10, height);
      context.stroke();
    }

    ambientAnimationId = window.requestAnimationFrame(draw);
  }

  draw();
}

function attachMotionEffects() {
  const cards = document.querySelectorAll(".metric-card, .decision-card, .panel");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function observeNavigation() {
  const sections = [...document.querySelectorAll("main > section[id]")];
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      elements.navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0.1, 0.25, 0.5],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function render() {
  renderSummary();
  renderCategoryControls();
  renderTransactions();
  renderCategories();
  renderBudgets();
  renderMonthlyInsights();
  renderSmartAlerts();
  renderInvestments();
  renderAllocation();
  renderGoals();
  renderRecommendations();
  renderUserProfile();
  renderAssistantContext();
  renderPrivacy();
  renderSettings();
}

document.addEventListener("click", requireLoginForPreview, true);
document.addEventListener("focusin", requireLoginForPreview, true);

elements.typeButtons.forEach((button) => {
  button.addEventListener("click", () => setTransactionType(button.dataset.type));
});

elements.promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    elements.chatInput.value = button.dataset.prompt;
    elements.chatInput.focus();
  });
});

elements.themeToggle.addEventListener("click", toggleTheme);
elements.loginThemeToggle.addEventListener("click", toggleTheme);
elements.settingsThemeToggle.addEventListener("click", toggleTheme);
elements.loginRequiredAction.addEventListener("click", openLoginScreen);
elements.loginRequiredClose.addEventListener("click", hideLoginRequiredModal);
elements.loginRequiredModal.addEventListener("click", (event) => {
  if (event.target === elements.loginRequiredModal) {
    hideLoginRequiredModal();
  }
});
elements.appDialogCancel.addEventListener("click", () => closeAppDialog(false));
elements.appDialogConfirm.addEventListener("click", () => closeAppDialog(true));
elements.appDialog.addEventListener("click", (event) => {
  if (event.target === elements.appDialog) {
    closeAppDialog(false);
  }
});
elements.appDialogPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    closeAppDialog(true);
  }
});
elements.openSettings.addEventListener("click", openSettingsScreen);
elements.closeSettings.addEventListener("click", closeSettingsScreen);
window.addEventListener("resize", drawAmbientCanvas);

elements.accountButton.addEventListener("click", () => {
  const nextState = elements.accountMenu.hidden;
  elements.accountMenu.hidden = !nextState;
  elements.accountButton.setAttribute("aria-expanded", String(nextState));
});

elements.openLogin.addEventListener("click", openLoginScreen);
elements.logoutButton.addEventListener("click", logoutUser);
elements.loginForm.addEventListener("submit", loginUser);
elements.registerForm.addEventListener("submit", registerUser);
elements.resetForm.addEventListener("submit", resetPassword);
elements.sendResetCode.addEventListener("click", requestResetCode);
elements.passwordToggles.forEach((button) => {
  button.addEventListener("click", () => togglePasswordVisibility(button));
});
elements.showRegister.addEventListener("click", showRegisterForm);
elements.showLogin.addEventListener("click", showLoginForm);
elements.showReset.addEventListener("click", showResetForm);
elements.resetBackLogin.addEventListener("click", showLoginForm);

elements.transactionForm.addEventListener("submit", addTransaction);
elements.investmentForm.addEventListener("submit", addInvestment);
elements.goalForm.addEventListener("submit", addGoal);
elements.categoryForm.addEventListener("submit", addCategory);
elements.budgetForm.addEventListener("submit", saveBudget);
elements.csvFile.addEventListener("change", importCsv);
elements.privacyToggle.addEventListener("click", togglePrivacy);
elements.settingsPrivacyToggle.addEventListener("click", togglePrivacy);
elements.printReport.addEventListener("click", printReport);
elements.settingsPrintReport.addEventListener("click", printReport);
elements.settingsClearData.addEventListener("click", clearAllData);
elements.passwordForm.addEventListener("submit", changePassword);
elements.deleteAccount.addEventListener("click", deleteAccount);
elements.chatForm.addEventListener("submit", sendChatMessage);
elements.clearData.addEventListener("click", clearAllData);
elements.monthPrevious.addEventListener("click", () => {
  state.monthOffset -= 1;
  render();
  renderChatHistory();
});
elements.monthNext.addEventListener("click", () => {
  state.monthOffset = Math.min(0, state.monthOffset + 1);
  render();
  renderChatHistory();
});
elements.monthToday.addEventListener("click", () => {
  state.monthOffset = 0;
  render();
  renderChatHistory();
});

async function initApp() {
  applyTheme(getTheme());
  await restoreServerSession();
  renderAuthScreen();
  render();
  renderChatHistory();
  setAssistantMode();
  drawAmbientCanvas();
  attachMotionEffects();
  observeNavigation();
}

initApp();

