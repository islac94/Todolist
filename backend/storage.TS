const STORAGE_KEY = "todo_tasks";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// Provide a safe storage wrapper so this module works in browser and Node (for tests).
const storageBackend: { getItem(key: string): string | null; setItem(key: string, value: string): void } = (() => {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch (e) {
    // ignore
  }
  let mem: Record<string, string> = {};
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
    },
    setItem(key: string, value: string) {
      mem[key] = value;
    }
  };
})();

export class TaskStorage {
  static getAll(): Task[] {
    const raw = storageBackend.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static saveAll(tasks: Task[]): void {
    storageBackend.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  static add(task: Task): void {
    const tasks = this.getAll();
    tasks.push(task);
    this.saveAll(tasks);
  }

  static update(id: string, updates: Partial<Task>): void {
    const tasks = this.getAll().map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    this.saveAll(tasks);
  }

  static remove(id: string): void {
    const tasks = this.getAll().filter(t => t.id !== id);
    this.saveAll(tasks);
  }
}