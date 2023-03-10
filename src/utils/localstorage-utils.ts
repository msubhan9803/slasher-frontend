export const setLocalStorage = (key: string, value: string) => localStorage.setItem(key, value);

export const getLocalStorage = (key: string) => {
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? JSON.parse(storedValue) : [];
};

export const clearLocalStorage = (key: string) => localStorage.removeItem(key);
