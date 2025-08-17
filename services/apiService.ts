
import type { User, UserRole, Settings, SubscriptionPlan } from '../types';

// This service simulates a full backend API, using localStorage as its database.
// All components and other services should interact with this service, not localStorage directly.

const DB_KEY = 'app_database';

interface StoredUser extends User {
    email: string;
    password_hash: string;
}
type Dictionary = Record<string, string>;

interface Database {
    users: StoredUser[];
    dictionaries: Record<string, Dictionary>;
    settings: Record<string, Settings>;
}

const getDb = (): Database => {
    const dbString = localStorage.getItem(DB_KEY);
    if (dbString) {
        return JSON.parse(dbString);
    }
    // Initialize DB if it doesn't exist
    const initialDb: Database = {
        users: [],
        dictionaries: {},
        settings: {},
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
};

const saveDb = (db: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const getSession = (): { user: User; token: string } | null => {
    const session = localStorage.getItem('current_user_session');
    return session ? JSON.parse(session) : null;
}

const createResponse = (body: unknown, status: number, statusText?: string) => {
    return new Response(JSON.stringify(body), { status, statusText });
}

const handleRequest = (method: 'GET' | 'POST', url: string, body: any): Response => {
    const db = getDb();
    const session = getSession();
    const requester = session ? db.users.find(u => u.id === session.user.id) : null;

    // --- AUTH ROUTES ---
    if (url === '/api/signup' && method === 'POST') {
        const { email, name, password } = body;
        if (db.users.some(user => user.email === email)) {
            return createResponse({ messageKey: 'signup.emailExists' }, 409, 'Conflict');
        }
        const role: UserRole = db.users.length === 0 ? 'ADMIN' : 'MEMBER';
        const newUser: StoredUser = { id: Date.now().toString(), name, email, password_hash: password, role, subscription_plans: null };
        db.users.push(newUser);
        saveDb(db);
        return createResponse({ messageKey: 'signup.success' }, 201, 'Created');
    }

    if (url === '/api/login' && method === 'POST') {
        const { email, password } = body;
        const user = db.users.find(u => u.email === email && u.password_hash === password);
        if (user) {
            const token = `mock-jwt-token-for-${user.id}`;
            const { password_hash, ...userWithoutPassword } = user;
            localStorage.setItem('current_user_session', JSON.stringify({ user: userWithoutPassword, token }));
            return createResponse({ token, user: userWithoutPassword, messageKey: 'login.success' }, 200, 'OK');
        }
        return createResponse({ messageKey: 'login.invalidCredentials' }, 401, 'Unauthorized');
    }

    // --- USER PROFILE ROUTES ---
    if (url.startsWith('/api/users/') && method === 'GET') {
        const userId = url.split('/').pop();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            const { password_hash, ...userWithoutPassword } = user;
            return createResponse(userWithoutPassword, 200);
        }
        return createResponse({ messageKey: 'profile.userNotFound' }, 404);
    }
    
    if (url === '/api/update-profile' && method === 'POST') {
        const { userId, name, email, currentPassword, newPassword } = body;
        const userIndex = db.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return createResponse({ messageKey: 'profile.userNotFound' }, 404);
        if (db.users[userIndex].password_hash !== currentPassword) return createResponse({ messageKey: 'profile.invalidPassword' }, 403);
        if (email !== db.users[userIndex].email && db.users.some(u => u.email === email)) return createResponse({ messageKey: 'profile.emailExists' }, 409);
        
        db.users[userIndex] = { ...db.users[userIndex], name, email, password_hash: newPassword || db.users[userIndex].password_hash };
        saveDb(db);

        const { password_hash, ...updatedUser } = db.users[userIndex];
        if (session) localStorage.setItem('current_user_session', JSON.stringify({ user: updatedUser, token: session.token }));
        return createResponse({ user: updatedUser, messageKey: 'profile.updateSuccess' }, 200);
    }

    if (url === '/api/forgot-password' && method === 'POST') {
        return createResponse({ messageKey: 'forgotPassword.emailSent' }, 200);
    }

    // --- ADMIN ROUTES ---
    if (url.startsWith('/api/admin')) {
       if (!requester || requester.role !== 'ADMIN') {
          return createResponse({ messageKey: 'auth.unauthorized' }, 403);
       }
    }
    
    if (url === '/api/admin/users' && method === 'GET') {
        const allUsers = db.users.map(({ password_hash, ...user }) => user);
        return createResponse(allUsers, 200);
    }

    if (url === '/api/admin/update-role' && method === 'POST') {
        const { userIdToUpdate, newRole } = body;
        const userIndex = db.users.findIndex(u => u.id === userIdToUpdate);
        if (userIndex === -1) return createResponse({ messageKey: 'admin.userNotFound' }, 404);
        if (requester && requester.id === userIdToUpdate) return createResponse({ messageKey: 'userManagement.error.cannotChangeSelf' }, 400);

        db.users[userIndex].role = newRole;
        saveDb(db);
        const { password_hash, ...updatedUser } = db.users[userIndex];
        return createResponse({ user: updatedUser, messageKey: 'userManagement.updateSuccess' }, 200);
    }
    
    if (url === '/api/admin/delete-user' && method === 'POST') {
        const { userIdToDelete } = body;
        if (requester && requester.id === userIdToDelete) return createResponse({ messageKey: 'userManagement.error.cannotDeleteSelf' }, 400);
        const updatedUsers = db.users.filter(u => u.id !== userIdToDelete);
        if (db.users.length === updatedUsers.length) return createResponse({ messageKey: 'admin.userNotFound' }, 404);
        db.users = updatedUsers;
        saveDb(db);
        return createResponse({ messageKey: 'userManagement.deleteSuccess' }, 200);
    }

    // --- DICTIONARY ROUTES ---
    const dictMatch = url.match(/^\/api\/dictionary\/(\w+)/);
    if (dictMatch) {
        const userId = dictMatch[1];
        if (requester?.id !== userId) return createResponse({ messageKey: 'auth.unauthorized' }, 403);

        if (method === 'GET') {
            const userDict = db.dictionaries[userId] || {};
            return createResponse(userDict, 200);
        }
        if (url.endsWith('/add') && method === 'POST') {
            const { originalWord, replacementWord } = body;
            if (!db.dictionaries[userId]) db.dictionaries[userId] = {};
            db.dictionaries[userId][originalWord] = replacementWord;
            saveDb(db);
            return createResponse({ success: true }, 200);
        }
        if (url.endsWith('/bulk-add') && method === 'POST') {
            const { words } = body;
            if (!db.dictionaries[userId]) db.dictionaries[userId] = {};
            db.dictionaries[userId] = { ...db.dictionaries[userId], ...words };
            saveDb(db);
            return createResponse({ success: true }, 200);
        }
        if (url.endsWith('/delete') && method === 'POST') {
            const { originalWord } = body;
            if (db.dictionaries[userId]) {
                delete db.dictionaries[userId][originalWord];
                saveDb(db);
            }
            return createResponse({ success: true }, 200);
        }
    }

    // --- SETTINGS ROUTES ---
    const settingsMatch = url.match(/^\/api\/settings\/(\w+)/);
    if (settingsMatch) {
        const userId = settingsMatch[1];
        if (requester?.id !== userId) return createResponse({ messageKey: 'auth.unauthorized' }, 403);

        if (method === 'GET') {
            const userSettings = db.settings[userId];
            return createResponse(userSettings, 200); // Returns null if not found, handled by service
        }
        if (method === 'POST') {
            db.settings[userId] = body as Settings;
            saveDb(db);
            return createResponse(db.settings[userId], 200);
        }
    }

    return createResponse(null, 404, 'Not Found');
};


// The public interface for our mock API
export const apiService = {
  async get(url: string): Promise<Response> {
    return new Promise(resolve => setTimeout(() => resolve(handleRequest('GET', url, null)), 200));
  },
  async post(url: string, body: unknown): Promise<Response> {
    return new Promise(resolve => setTimeout(() => resolve(handleRequest('POST', url, body)), 200));
  },
};