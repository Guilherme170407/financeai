const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const net = require("node:net");
const tls = require("node:tls");

loadEnvFile();

const root = __dirname;
const databasePath = path.join(root, "database.json");
const port = Number(process.env.PORT || 3000);
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const groqModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const providerNames = {
  openai: "OpenAI",
  gemini: "Gemini",
  groq: "Groq",
};
const sessions = new Map();
const verificationCodes = new Map();
const assistantInstructions =
  "Você é o assistente financeiro do app FinanceAI. Responda em português do Brasil de forma clara, prática e completa. Use todos os dados enviados no contexto, especialmente transacoes.lancamentosDetalhados, receitasPorTitulo e despesasPorTitulo quando o usuário perguntar por um item específico como FGTS, salário, aluguel ou mercado. Se o dado estiver no contexto, não diga que não tem acesso ao site. Quando a pergunta pedir análise, planejamento, planilha, tabela ou diagnóstico, desenvolva a resposta com detalhes suficientes para ser útil. Não prometa rentabilidade, não dê recomendação individual de compra/venda de ativos e sinalize que a resposta é educativa quando falar de investimentos.";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      const providers = getConfiguredProviders();
      const provider = providers[0] || "";
      return sendJson(response, 200, {
        ok: true,
        aiReady: providers.length > 0,
        openaiReady: Boolean(process.env.OPENAI_API_KEY),
        geminiReady: Boolean(process.env.GEMINI_API_KEY),
        groqReady: Boolean(process.env.GROQ_API_KEY),
        configuredProviders: providers,
        provider: provider || "local",
        model: getActiveModel(provider),
        emailReady: isEmailConfigured(),
        database: isSupabaseConfigured() ? "supabase" : "local",
      });
    }

    if (request.method === "GET" && url.pathname === "/api/session") {
      await handleSession(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth") {
      await handleAuth(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/email-code") {
      await handleEmailCode(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth-code") {
      await handleAuthCode(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/data") {
      await handleSaveData(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/password") {
      await handleChangePassword(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/reset-password") {
      await handleResetPassword(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/delete-account") {
      await handleDeleteAccount(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
      return handleLogout(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      await handleChat(request, response);
      return;
    }

    if (request.method !== "GET") {
      return sendJson(response, 405, { error: "Método não permitido." });
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    return sendJson(response, 500, { error: "Erro interno.", detail: error.message });
  }
});

server.listen(port, () => {
  console.log(`FinanceAI rodando em http://localhost:${port}`);
  const provider = getConfiguredProviders()[0] || "";
  console.log(provider ? `Assistente ${providerNames[provider] || provider} ativo com ${getActiveModel(provider)}` : "Nenhuma chave de IA configurada; o chat usará o modo local no navegador.");
  console.log(isEmailConfigured() ? "Envio de email ativo via SMTP." : "SMTP nao configurado; codigos aparecem em modo local no cadastro.");
});

async function handleSession(request, response) {
  const database = await readDatabase();
  const user = getCurrentUser(request, database);

  if (!user) {
    return sendJson(response, 200, { authenticated: false });
  }

  return sendJson(response, 200, {
    authenticated: true,
    user: publicUser(user),
    data: user.data || {},
  });
}

async function handleAuth(request, response) {
  const body = await readJson(request);
  const profile = body.profile || {};
  const login = String(profile.login || profile.email || "").trim();
  const email = normalizeEmail(profile.email);
  const password = String(body.password || "");
  const code = String(body.code || "").trim();
  const mode = body.mode === "register" ? "register" : "login";

  if (!login || !password) {
    return sendJson(response, 400, { error: "Informe e-mail/nome de usuario e senha." });
  }

  if (password.length < 4) {
    return sendJson(response, 400, { error: "Use uma senha com pelo menos 4 caracteres." });
  }

  const database = await readDatabase();
  let user = mode === "login" ? findUserByLogin(database.users, login) : database.users.find((item) => item.email === email);
  let created = false;

  if (mode === "register") {
    const requiredName = String(profile.name || "").trim();
    if (!email) {
      return sendJson(response, 400, { error: "Informe o e-mail para cadastrar." });
    }

    if (!requiredName) {
      return sendJson(response, 400, { error: "Informe o nome para cadastrar." });
    }

    if (!code) {
      return sendJson(response, 400, { error: "Informe o código enviado para o e-mail." });
    }
  }

  if (mode === "login") {
    if (!user) {
      return sendJson(response, 404, { error: "Conta não encontrada. Crie uma conta primeiro." });
    }

    if (!verifyPassword(password, user.password)) {
      return sendJson(response, 401, { error: "Senha incorreta para esta conta." });
    }

    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, user.id);

    return sendJson(
      response,
      200,
      {
        authenticated: true,
        created,
        user: publicUser(user),
        data: user.data || {},
      },
      { "Set-Cookie": makeSessionCookie(sessionId) },
    );
  }

  if (user) {
    return sendJson(response, 409, { error: "Ja existe uma conta com este e-mail." });
  }

  const verification = verifyEmailCode(email, "register", code);
  if (!verification.ok) {
    return sendJson(response, verification.status, { error: verification.error });
  }

  created = true;
  user = {
    id: crypto.randomUUID(),
    email,
    password: hashPassword(password),
    profile: normalizeProfile(profile),
    data: normalizeUserData(body.data || {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  database.users.push(user);
  await saveDatabase(database);

  return sendJson(response, 201, {
    authenticated: false,
    created,
    user: publicUser(user),
    message: "Conta criada. Entre com e-mail e senha.",
  });
}

async function handleEmailCode(request, response) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const purpose = ["register", "reset"].includes(body.purpose) ? body.purpose : "register";

  if (!email) {
    return sendJson(response, 400, { error: "Informe o e-mail da conta." });
  }

  const database = await readDatabase();
  let user = database.users.find((item) => item.email === email);
  if (purpose === "register" && user) {
    return sendJson(response, 409, { error: "Já existe uma conta com este e-mail." });
  }

  if (purpose === "reset" && !user) {
    return sendJson(response, 404, { error: "Conta não encontrada para este e-mail." });
  }

  user ||= { profile: { name: "usuário" } };

  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = Date.now() + 10 * 60 * 1000;
  verificationCodes.set(`${purpose}:${email}`, {
    codeHash: hashCode(code),
    expiresAt,
    attempts: 0,
  });

  const sent = await sendVerificationEmail({
    to: email,
    code,
    purpose,
    name: user.profile?.name || "usuário",
  });

  return sendJson(response, 200, {
    ok: true,
    sent,
    expiresInMinutes: 10,
    devCode: sent ? undefined : code,
    message: sent
      ? "Código enviado para seu e-mail."
      : "SMTP não configurado. Código liberado em modo local para apresentação.",
  });
}

async function handleAuthCode(request, response) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const code = String(body.code || "").trim();

  if (!email || !code) {
    return sendJson(response, 400, { error: "Informe e-mail e código." });
  }

  const database = await readDatabase();
  const user = database.users.find((item) => item.email === email);
  if (!user) {
    return sendJson(response, 404, { error: "Conta não encontrada para este e-mail." });
  }

  const verification = verifyEmailCode(email, "login", code);
  if (!verification.ok) {
    return sendJson(response, verification.status, { error: verification.error });
  }

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, user.id);

  return sendJson(
    response,
    200,
    {
      authenticated: true,
      user: publicUser(user),
      data: user.data || {},
    },
    { "Set-Cookie": makeSessionCookie(sessionId) },
  );
}

async function handleSaveData(request, response) {
  const body = await readJson(request);
  const database = await readDatabase();
  const user = getCurrentUser(request, database);

  if (!user) {
    return sendJson(response, 401, { error: "Entre novamente para salvar os dados." });
  }

  user.data = normalizeUserData(body.data || {});
  if (body.profile) {
    user.profile = normalizeProfile({ ...user.profile, ...body.profile }, user.profile);
  }
  user.updatedAt = new Date().toISOString();
  await saveDatabase(database);

  return sendJson(response, 200, {
    ok: true,
    user: publicUser(user),
  });
}

async function handleChangePassword(request, response) {
  const body = await readJson(request);
  const database = await readDatabase();
  const user = getCurrentUser(request, database);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!user) {
    return sendJson(response, 401, { error: "Entre novamente para trocar a senha." });
  }

  if (!verifyPassword(currentPassword, user.password)) {
    return sendJson(response, 401, { error: "Senha atual incorreta." });
  }

  if (newPassword.length < 4) {
    return sendJson(response, 400, { error: "Use uma nova senha com pelo menos 4 caracteres." });
  }

  user.password = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  await saveDatabase(database);

  return sendJson(response, 200, { ok: true });
}

async function handleResetPassword(request, response) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const code = String(body.code || "").trim();

  if (!email || !password || !code) {
    return sendJson(response, 400, { error: "Informe e-mail, código e nova senha." });
  }

  if (password.length < 4) {
    return sendJson(response, 400, { error: "Use uma senha com pelo menos 4 caracteres." });
  }

  const database = await readDatabase();
  const user = database.users.find((item) => item.email === email);

  if (!user) {
    return sendJson(response, 404, { error: "Conta não encontrada para este e-mail." });
  }

  const verification = verifyEmailCode(email, "reset", code);
  if (!verification.ok) {
    return sendJson(response, verification.status, { error: verification.error });
  }

  user.password = hashPassword(password);
  user.updatedAt = new Date().toISOString();
  await saveDatabase(database);

  return sendJson(response, 200, { ok: true });
}

async function handleDeleteAccount(request, response) {
  const body = await readJson(request);
  const database = await readDatabase();
  const user = getCurrentUser(request, database);
  const password = String(body.password || "");

  if (!user) {
    return sendJson(response, 401, { error: "Entre novamente para excluir a conta." });
  }

  if (!verifyPassword(password, user.password)) {
    return sendJson(response, 401, { error: "Senha incorreta." });
  }

  database.users = database.users.filter((item) => item.id !== user.id);
  await saveDatabase(database);

  const cookies = parseCookies(request.headers.cookie || "");
  if (cookies.financeai_session) {
    sessions.delete(cookies.financeai_session);
  }

  return sendJson(response, 200, { ok: true }, { "Set-Cookie": "financeai_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" });
}

function handleLogout(request, response) {
  const cookies = parseCookies(request.headers.cookie || "");
  if (cookies.financeai_session) {
    sessions.delete(cookies.financeai_session);
  }

  return sendJson(response, 200, { ok: true }, { "Set-Cookie": "financeai_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" });
}

async function handleChat(request, response) {
  const provider = getProvider();

  if (!provider) {
    return sendJson(response, 503, { error: "Nenhuma chave de IA configurada." });
  }

  const body = await readJson(request);
  const message = String(body.message || "").trim();

  if (!message) {
    return sendJson(response, 400, { error: "Mensagem vazia." });
  }

  const snapshot = JSON.stringify(body.snapshot || {}, null, 2);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const historyText = history
    .map((item) => `${item.role === "user" ? "Usuário" : "Assistente"}: ${item.content}`)
    .join("\n");

  const prompt = `Contexto financeiro do usuário:\n${snapshot}\n\nHistórico recente:\n${historyText}\n\nPergunta atual:\n${message}`;
  const failures = [];

  for (const currentProvider of getConfiguredProviders()) {
    try {
      const answer = await callProvider(currentProvider, prompt);

      return sendJson(response, 200, {
        answer: answer || "Não consegui montar uma resposta agora.",
        provider: currentProvider,
        model: getActiveModel(currentProvider),
      });
    } catch (error) {
      failures.push({
        provider: currentProvider,
        model: getActiveModel(currentProvider),
        message: error.message || "Falha na IA.",
      });
    }
  }

  const detail = failures.map((failure) => `${providerNames[failure.provider] || failure.provider}: ${failure.message}`).join(" | ");
  const isQuota = /insufficient_quota|quota|rate|limit|429|exceeded|retry|billing|credits/i.test(detail);

  return sendJson(response, isQuota ? 429 : 502, {
    error: isQuota
      ? "Os provedores de IA configurados estão sem cota, com limite ativo ou sem billing/créditos disponíveis."
      : "Os provedores de IA configurados falharam ao responder.",
    detail,
    provider: failures[0]?.provider || provider,
    failures,
  });
}

async function callProvider(provider, prompt) {
  if (provider === "openai") {
    return callOpenAI(prompt);
  }

  if (provider === "gemini") {
    return callGemini(prompt);
  }

  return callGroq(prompt);
}

async function callOpenAI(prompt) {
  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openaiModel,
      instructions: assistantInstructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    throw new Error(data.error?.message || "Falha na OpenAI.");
  }

  return extractResponseText(data);
}

async function callGemini(prompt) {
  const apiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: assistantInstructions,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1800,
        },
      }),
    },
  );

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    throw new Error(data.error?.message || "Falha no Gemini.");
  }

  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
}

async function callGroq(prompt) {
  const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: assistantInstructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    throw new Error(data.error?.message || "Falha no Groq.");
  }

  return data.choices?.[0]?.message?.content?.trim() || "";
}

function getProvider() {
  return getConfiguredProviders()[0] || "";
}

function getConfiguredProviders() {
  const providers = [];

  if (process.env.GROQ_API_KEY) {
    providers.push("groq");
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push("gemini");
  }

  return providers;
}

function getActiveModel(provider) {
  if (provider === "openai") {
    return openaiModel;
  }

  if (provider === "gemini") {
    return geminiModel;
  }

  if (provider === "groq") {
    return groqModel;
  }

  return "local";
}

async function readDatabase() {
  if (isSupabaseConfigured()) {
    try {
      return await readSupabaseDatabase();
    } catch (error) {
      console.warn("Falha ao ler Supabase; usando banco local.", error.message);
    }
  }

  return readLocalDatabase();
}

async function saveDatabase(database) {
  if (isSupabaseConfigured()) {
    try {
      await saveSupabaseDatabase(database);
      return;
    } catch (error) {
      console.warn("Falha ao salvar no Supabase; salvando no banco local.", error.message);
    }
  }

  saveLocalDatabase(database);
}

function readLocalDatabase() {
  if (!fs.existsSync(databasePath)) {
    return { users: [] };
  }

  try {
    const rawDatabase = fs.readFileSync(databasePath, "utf8").replace(/^\uFEFF/, "");
    const database = JSON.parse(rawDatabase);
    return {
      users: Array.isArray(database.users) ? database.users : [],
    };
  } catch {
    return { users: [] };
  }
}

function saveLocalDatabase(database) {
  fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  return {
    url,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: process.env.SUPABASE_TABLE || "financeai_state",
    rowId: process.env.SUPABASE_ROW_ID || "database",
  };
}

async function readSupabaseDatabase() {
  const config = getSupabaseConfig();
  const response = await fetch(
    `${config.url}/rest/v1/${encodeURIComponent(config.table)}?id=eq.${encodeURIComponent(config.rowId)}&select=data`,
    {
      headers: getSupabaseHeaders(config),
    },
  );

  if (!response.ok) {
    throw new Error(`Falha ao ler Supabase: ${await response.text()}`);
  }

  const rows = await response.json();
  const database = rows[0]?.data;
  return {
    users: Array.isArray(database?.users) ? database.users : [],
  };
}

async function saveSupabaseDatabase(database) {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${encodeURIComponent(config.table)}`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(config),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: config.rowId,
      data: {
        users: Array.isArray(database.users) ? database.users : [],
      },
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar Supabase: ${await response.text()}`);
  }
}

function getSupabaseHeaders(config) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    "User-Agent": "FinanceAI-Server/1.0",
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeUsername(name) {
  return String(name || "").trim().toLowerCase();
}

function findUserByLogin(users, login) {
  const normalizedLogin = normalizeEmail(login);
  const normalizedUsername = normalizeUsername(login);
  return users.find((user) => {
    return user.email === normalizedLogin || normalizeUsername(user.profile?.name) === normalizedUsername;
  });
}

function normalizeProfile(profile, fallback = {}) {
  return {
    name: String(profile.name || fallback.name || "").trim(),
    email: normalizeEmail(profile.email || fallback.email),
    focus: String(profile.focus || fallback.focus || "Organizar gastos"),
    income: Number(profile.income ?? fallback.income ?? 0) || 0,
    fixedExpenses: Number(profile.fixedExpenses ?? fallback.fixedExpenses ?? 0) || 0,
    investorProfile: String(profile.investorProfile || fallback.investorProfile || "Conservador"),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeUserData(data) {
  return {
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    investments: Array.isArray(data.investments) ? data.investments : [],
    messages: Array.isArray(data.messages) ? data.messages.slice(-20) : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    budgets: data.budgets && typeof data.budgets === "object" ? data.budgets : {},
    memory: Array.isArray(data.memory) ? data.memory.slice(-12) : [],
    privacy: Boolean(data.privacy),
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, stored) {
  if (!stored?.salt || !stored?.hash) {
    return false;
  }

  const hash = crypto.scryptSync(password, stored.salt, 64);
  const storedHash = Buffer.from(stored.hash, "hex");
  return storedHash.length === hash.length && crypto.timingSafeEqual(storedHash, hash);
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function verifyEmailCode(email, purpose, code) {
  const key = `${purpose}:${normalizeEmail(email)}`;
  const record = verificationCodes.get(key);

  if (!record) {
    return { ok: false, status: 400, error: "Solicite um código antes de continuar." };
  }

  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(key);
    return { ok: false, status: 400, error: "Código expirado. Solicite um novo código." };
  }

  if (record.attempts >= 5) {
    verificationCodes.delete(key);
    return { ok: false, status: 429, error: "Muitas tentativas. Solicite um novo código." };
  }

  record.attempts += 1;
  if (record.codeHash !== hashCode(code)) {
    return { ok: false, status: 401, error: "Código inválido." };
  }

  verificationCodes.delete(key);
  return { ok: true };
}

async function sendVerificationEmail({ to, code, purpose, name }) {
  const config = getEmailConfig();

  if (!config) {
    console.log(`[FinanceAI] Código ${purpose} para ${to}: ${code}`);
    return false;
  }

  const subject = purpose === "reset" ? "Código para redefinir sua senha" : "Código de cadastro no FinanceAI";
  const action = purpose === "reset" ? "redefinir sua senha" : "confirmar seu cadastro";
  const text = `Olá, ${name}.\n\nSeu código para ${action} é ${code}.\nEle expira em 10 minutos.\n\nFinanceAI`;

  try {
    await sendSmtpMail({
      ...config,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.warn("Não foi possível enviar o e-mail de verificação.", error.message);
    console.log(`[FinanceAI] Código ${purpose} para ${to}: ${code}`);
    return false;
  }
}

function isEmailConfigured() {
  return Boolean(getEmailConfig());
}

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    from,
  };
}

function sendSmtpMail({ host, port, secure, user, pass, from, to, subject, text }) {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect(port, host) : net.connect(port, host);
    let buffer = "";
    let step = 0;

    const message = [
      `From: FinanceAI <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
    ].join("\r\n");

    const commands = [
      () => write(`EHLO localhost\r\n`),
      () => write(`AUTH LOGIN\r\n`),
      () => write(`${Buffer.from(user).toString("base64")}\r\n`),
      () => write(`${Buffer.from(pass).toString("base64")}\r\n`),
      () => write(`MAIL FROM:<${from}>\r\n`),
      () => write(`RCPT TO:<${to}>\r\n`),
      () => write("DATA\r\n"),
      () => write(`${message}\r\n.\r\n`),
      () => write("QUIT\r\n"),
    ];

    socket.setTimeout(12000);
    socket.on("timeout", () => reject(new Error("SMTP timeout.")));
    socket.on("error", reject);
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (!buffer.endsWith("\r\n")) {
        return;
      }

      const line = buffer.trim();
      buffer = "";

      if (/^[45]/.test(line)) {
        reject(new Error(line));
        socket.end();
        return;
      }

      if (line.startsWith("220") && step === 0) {
        commands[step++]();
        return;
      }

      if (line.startsWith("235") || line.startsWith("250") || line.startsWith("334") || line.startsWith("354")) {
        if (step < commands.length) {
          commands[step++]();
        } else {
          resolve();
        }
      }
    });
    socket.on("end", resolve);

    function write(command) {
      socket.write(command);
    }
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.profile?.name || "",
    email: user.email,
    focus: user.profile?.focus || "Organizar gastos",
    income: user.profile?.income || 0,
    fixedExpenses: user.profile?.fixedExpenses || 0,
    investorProfile: user.profile?.investorProfile || "Conservador",
    updatedAt: user.updatedAt,
  };
}

function getCurrentUser(request, database) {
  const cookies = parseCookies(request.headers.cookie || "");
  const userId = sessions.get(cookies.financeai_session);
  return userId ? database.users.find((user) => user.id === userId) : null;
}

function parseCookies(header) {
  return String(header || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separator = cookie.indexOf("=");
      if (separator === -1) {
        return cookies;
      }
      cookies[cookie.slice(0, separator)] = decodeURIComponent(cookie.slice(separator + 1));
      return cookies;
    }, {});
}

function makeSessionCookie(sessionId) {
  return `financeai_session=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax`;
}

function serveStatic(urlPath, response) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    return sendJson(response, 403, { error: "Acesso negado." });
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Arquivo não encontrado.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload muito grande."));
      }
    });

    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      return;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}
