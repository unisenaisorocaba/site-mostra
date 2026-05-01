/**
 * Mock do base44Client para demonstração offline.
 * Simula todas as operações com dados em memória (começa com MOCK_DATA).
 */
import {
  MOCK_USER,
  MOCK_PROJECTS,
  MOCK_EVALUATIONS,
  MOCK_CRITERIA_LISTS,
  MOCK_USER_PROFILES,
  MOCK_GROUPS,
  MOCK_PHOTOS,
} from './mockData';

// Estado em memória — mutável durante a sessão
const store = {
  Project: [...MOCK_PROJECTS],
  Evaluation: [...MOCK_EVALUATIONS],
  CriteriaList: [...MOCK_CRITERIA_LISTS],
  UserProfile: [...MOCK_USER_PROFILES],
  Group: [...MOCK_GROUPS],
  EventPhoto: [...MOCK_PHOTOS],
};

let sessionUser = null;

// Utilitários
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));
const genId = () => `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

// Cria um repositório CRUD genérico para uma coleção
function makeEntityRepo(collectionName) {
  return {
    list: async (sort, limit) => {
      await delay();
      let items = [...store[collectionName]];
      if (sort?.startsWith('-')) {
        const field = sort.slice(1);
        items.sort((a, b) => (b[field] || '').localeCompare(a[field] || ''));
      } else if (sort) {
        items.sort((a, b) => (a[sort] || '').localeCompare(b[sort] || ''));
      }
      return limit ? items.slice(0, limit) : items;
    },

    filter: async (query = {}, sort, limit) => {
      await delay();
      let items = store[collectionName].filter((item) =>
        Object.entries(query).every(([k, v]) => item[k] === v)
      );
      if (sort?.startsWith('-')) {
        const field = sort.slice(1);
        items.sort((a, b) => (b[field] || '').localeCompare(a[field] || ''));
      } else if (sort) {
        items.sort((a, b) => (a[sort] || '').localeCompare(b[sort] || ''));
      }
      return limit ? items.slice(0, limit) : items;
    },

    get: async (id) => {
      await delay();
      return store[collectionName].find((i) => i.id === id) ?? null;
    },

    create: async (data) => {
      await delay();
      const item = {
        ...data,
        id: genId(),
        created_date: now(),
        updated_date: now(),
        created_by: sessionUser?.email || 'demo@senaisp.edu.br',
      };
      store[collectionName].push(item);
      return item;
    },

    update: async (id, data) => {
      await delay();
      const idx = store[collectionName].findIndex((i) => i.id === id);
      if (idx === -1) throw new Error(`Not found: ${id}`);
      store[collectionName][idx] = { ...store[collectionName][idx], ...data, updated_date: now() };
      return store[collectionName][idx];
    },

    delete: async (id) => {
      await delay();
      store[collectionName] = store[collectionName].filter((i) => i.id !== id);
      return { id };
    },

    subscribe: () => () => {}, // no-op for offline
  };
}

export const mockBase44 = {
  auth: {
    me: async () => {
      await delay();
      if (!sessionUser) throw new Error('Not authenticated');
      return sessionUser;
    },
    isAuthenticated: async () => !!sessionUser,
    logout: () => { sessionUser = null; },
    redirectToLogin: () => { sessionUser = null; },
    updateMe: async (data) => {
      sessionUser = { ...sessionUser, ...data };
      return sessionUser;
    },
  },

  entities: {
    Project: makeEntityRepo('Project'),
    Evaluation: makeEntityRepo('Evaluation'),
    CriteriaList: makeEntityRepo('CriteriaList'),
    UserProfile: makeEntityRepo('UserProfile'),
    Group: makeEntityRepo('Group'),
    EventPhoto: makeEntityRepo('EventPhoto'),
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        await delay(500);
        // Retorna uma URL de placeholder para demonstração
        const objectUrl = URL.createObjectURL(file);
        return { file_url: objectUrl };
      },
      InvokeLLM: async ({ prompt }) => {
        await delay(300);
        return `[Modo offline] Resposta mockada para: "${prompt}"`;
      },
    },
  },

  users: {
    inviteUser: async (email, role) => {
      await delay();
      return { email, role, status: 'invited' };
    },
  },

  functions: {
    invoke: async (name, params) => {
      await delay();
      return { data: { message: `[Mock] Função "${name}" chamada com sucesso`, params } };
    },
  },

  // Expõe setSessionUser para o AuthContext mock
  _setSessionUser: (user) => { sessionUser = user; },
  _clearSessionUser: () => { sessionUser = null; },
};