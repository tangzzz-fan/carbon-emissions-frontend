import { useState } from 'react';

// 用于便捷操作localStorage的自定义Hook
function useLocalStorage<T>(key: string, initialValue: T) {
    // 获取初始值
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // 更新值方法
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // 允许值是一个函数，类似于React的setState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}

export default useLocalStorage; 