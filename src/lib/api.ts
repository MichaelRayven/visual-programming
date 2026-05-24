import { v4 as uuidv4 } from "uuid";
import type { Document } from "@/store/documentsSlice";
import type { TableSnapshot } from "@/store/spreadsheetSlice";

// Safe localStorage wrapper to prevent ReferenceErrors in universal/SSR/Node environments
const safeLocalStorage = {
  getItem(key: string): string | null {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(key)
      : null;
  },
  setItem(key: string, value: string): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

// Helper for network latency simulation
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export type APIUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const initUserDB = (): APIUser[] => {
  const data = safeLocalStorage.getItem("auth_users");
  if (data) return JSON.parse(data);

  const defaultUsers: APIUser[] = [
    {
      id: "user-michael",
      name: "Михаил",
      email: "michael@example.com",
      passwordHash: "password123",
    },
    {
      id: "user-roman",
      name: "Роман",
      email: "roman@example.com",
      passwordHash: "password123",
    },
  ];

  safeLocalStorage.setItem("auth_users", JSON.stringify(defaultUsers));
  return defaultUsers;
};

const initDocumentDB = () => {
  const data = safeLocalStorage.getItem("spreadsheet_docs");
  let docs: Document[] = [];
  try {
    docs = data ? JSON.parse(data) : [];
  } catch (_e) {
    docs = [];
  }

  if (docs.length > 0) {
    const updated = docs.map((doc) => ({
      ...doc,
      userId: doc.userId || "user-michael",
    }));
    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(updated));
    return;
  }

  const defaultDocs: Document[] = [
    {
      id: "doc-michael-1",
      title: "План Михаила",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: {
          cells: {
            "0:0": "Проект",
            "0:1": "Бюджет",
            "1:0": "Visual Programming",
            "1:1": "150000",
          },
          rowIds: Array.from({ length: 15 }, () => uuidv4()),
          colIds: Array.from({ length: 10 }, () => uuidv4()),
        },
        gridSize: { rows: 15, cols: 10 },
        colWidths: {},
        rowHeights: {},
      },
      createdAt: Date.now() - 3600000 * 24,
      updatedAt: Date.now() - 3600000 * 2,
    },
    {
      id: "doc-roman-1",
      title: "Финансы Романа",
      userId: "user-roman",
      tableSnapshot: {
        gridSnapshot: {
          cells: {
            "0:0": "Категория",
            "0:1": "Сумма",
            "1:0": "Аренда",
            "1:1": "1200",
          },
          rowIds: Array.from({ length: 15 }, () => uuidv4()),
          colIds: Array.from({ length: 10 }, () => uuidv4()),
        },
        gridSize: { rows: 15, cols: 10 },
        colWidths: {},
        rowHeights: {},
      },
      createdAt: Date.now() - 3600000 * 12,
      updatedAt: Date.now() - 3600000,
    },
  ];

  safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(defaultDocs));
};

initUserDB();
initDocumentDB();

let inMemoryAccessToken: string | null = null;
let tokenExpiryTime = 0;

export const api = {
  async register(name: string, email: string, password: string) {
    await delay(300);
    const db = initUserDB();

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = db.some((u) => u.email === normalizedEmail);

    if (userExists) {
      throw new Error(
        "Пользователь с таким адресом электронной почты уже зарегистрирован"
      );
    }

    const newUser: APIUser = {
      id: "user-" + uuidv4().substring(0, 8),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
    };

    db.push(newUser);
    safeLocalStorage.setItem("auth_users", JSON.stringify(db));

    // Auto-login after registration
    return this.login(normalizedEmail, password);
  },

  // 2. LOGIN
  async login(email: string, password: string) {
    await delay(300);
    const db = initUserDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.find((u) => u.email === normalizedEmail);

    if (!user || user.passwordHash !== password) {
      throw new Error("Неверный адрес электронной почты или пароль");
    }

    // Generate simulated tokens
    const now = Date.now();
    // Access token valid for 15 minutes
    const accessToken = `access_${user.id}_${now + 900000}`;
    const refreshToken = `refresh_${user.id}_${now + 3600000 * 24 * 7}`; // 7 days

    // Store in-memory Access Token
    inMemoryAccessToken = accessToken;
    tokenExpiryTime = now + 900000;

    // Store Refresh Token in localStorage
    safeLocalStorage.setItem("auth_refresh_token", refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  },

  // 3. SILENT REFRESH (Checks refresh token, generates new access token)
  async refresh() {
    await delay(150);
    const refreshToken = safeLocalStorage.getItem("auth_refresh_token");

    if (!refreshToken || !refreshToken.startsWith("refresh_")) {
      throw new Error("Unauthorized: No refresh token found");
    }

    const parts = refreshToken.split("_");
    const userId = parts[1];
    const expiry = Number(parts[2]);

    if (Date.now() > expiry) {
      safeLocalStorage.removeItem("auth_refresh_token");
      throw new Error("Unauthorized: Refresh token expired");
    }

    const db = initUserDB();
    const user = db.find((u) => u.id === userId);

    if (!user) {
      throw new Error("Unauthorized: User not found");
    }

    const now = Date.now();
    // New access token valid for 15 minutes
    const newAccessToken = `access_${user.id}_${now + 900000}`;

    inMemoryAccessToken = newAccessToken;
    tokenExpiryTime = now + 900000;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: newAccessToken,
    };
  },

  // 4. LOGOUT
  async logout() {
    await delay(100);
    inMemoryAccessToken = null;
    tokenExpiryTime = 0;
    safeLocalStorage.removeItem("auth_refresh_token");
  },

  // Helper to extract active userId from in-memory Access Token
  getActiveUserId(): string | null {
    if (!inMemoryAccessToken || !inMemoryAccessToken.startsWith("access_")) {
      return null;
    }
    return inMemoryAccessToken.split("_")[1];
  },

  async ensureValidToken() {
    if (!inMemoryAccessToken || Date.now() + 5000 >= tokenExpiryTime) {
      try {
        await this.refresh();
      } catch (_e) {
        throw new Error("401");
      }
    }
  },

  async getDocuments(): Promise<Document[]> {
    await this.ensureValidToken();
    await delay(200);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    return docs.filter((doc) => doc.userId === activeUserId);
  },

  async getDocumentById(id: string): Promise<Document> {
    await this.ensureValidToken();
    await delay(150);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    const doc = docs.find((d) => d.id === id);
    if (!doc) {
      throw new Error("404");
    }

    if (doc.userId !== activeUserId) {
      throw new Error("403");
    }

    return doc;
  },

  async saveDocument(id: string, snapshot: TableSnapshot) {
    await this.ensureValidToken();
    await delay(250);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    const docIndex = docs.findIndex((d) => d.id === id);
    if (docIndex === -1) throw new Error("404");

    if (docs[docIndex].userId !== activeUserId) {
      throw new Error("403");
    }

    docs[docIndex] = {
      ...docs[docIndex],
      tableSnapshot: snapshot,
      updatedAt: Date.now(),
    };

    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
    return docs[docIndex];
  },

  async createDocument(
    title: string,
    rows: number,
    cols: number
  ): Promise<Document> {
    await this.ensureValidToken();
    await delay(200);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    const newDoc: Document = {
      id: uuidv4(),
      title: title || "Без названия",
      userId: activeUserId,
      tableSnapshot: {
        gridSnapshot: {
          cells: {},
          rowIds: Array.from({ length: rows }, () => uuidv4()),
          colIds: Array.from({ length: cols }, () => uuidv4()),
        },
        gridSize: { rows, cols },
        colWidths: {},
        rowHeights: {},
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    docs.push(newDoc);
    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
    return newDoc;
  },

  async updateDocument(id: string, newTitle: string) {
    await this.ensureValidToken();
    await delay(150);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    const doc = docs.find((d) => d.id === id);
    if (!doc) throw new Error("404");

    if (doc.userId !== activeUserId) throw new Error("403");

    doc.title = newTitle;
    doc.updatedAt = Date.now();

    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
    return doc;
  },

  async duplicateDocument(id: string): Promise<Document> {
    await this.ensureValidToken();
    await delay(200);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];

    const source = docs.find((d) => d.id === id);
    if (!source) throw new Error("404");

    if (source.userId !== activeUserId) throw new Error("403");

    const duplicate: Document = {
      ...JSON.parse(JSON.stringify(source)),
      id: uuidv4(),
      title: `${source.title} (Копия)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    docs.push(duplicate);
    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
    return duplicate;
  },

  async deleteDocument(id: string) {
    await this.ensureValidToken();
    await delay(150);

    const activeUserId = this.getActiveUserId();
    if (!activeUserId) throw new Error("401");

    const data = safeLocalStorage.getItem("spreadsheet_docs");
    let docs: Document[] = data ? JSON.parse(data) : [];

    const doc = docs.find((d) => d.id === id);
    if (!doc) throw new Error("404");

    if (doc.userId !== activeUserId) throw new Error("403");

    docs = docs.filter((d) => d.id !== id);
    safeLocalStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
    return id;
  },
};
