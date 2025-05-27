// Event Manager
// Centralized event handling and cleanup system

import { EVENT_TYPES } from '../core/constants.js';

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.globalListeners = new Map();
    }

    // Add event listener with automatic cleanup tracking
    addListener(target, event, handler, options = {}) {
        const boundHandler = typeof handler === 'function' ? handler : handler.bind(this);
        
        target.addEventListener(event, boundHandler, options);
        
        // Track for cleanup
        const key = this.getListenerKey(target, event);
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push({ handler: boundHandler, options });
        
        return boundHandler;
    }

    // Remove specific event listener
    removeListener(target, event, handler) {
        target.removeEventListener(event, handler);
        
        const key = this.getListenerKey(target, event);
        const listeners = this.listeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => l.handler === handler);
            if (index > -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this.listeners.delete(key);
                }
            }
        }
    }

    // Dispatch custom event
    dispatch(target, eventType, detail = {}) {
        const event = new CustomEvent(eventType, {
            detail,
            bubbles: false,
            cancelable: false
        });
        
        target.dispatchEvent(event);
    }

    // Emit event (alias for dispatch to document)
    emit(eventType, detail = {}) {
        this.dispatch(document, eventType, detail);
    }

    // Add event listener for custom events (alias for addGlobalListener)
    on(eventType, handler, options = {}) {
        return this.addGlobalListener(eventType, handler, options);
    }

    // Remove event listener for custom events
    off(eventType, handler) {
        this.removeListener(document, eventType, handler);
    }

    // Add global document listener
    addGlobalListener(event, handler, options = {}) {
        return this.addListener(document, event, handler, options);
    }

    // Add window listener
    addWindowListener(event, handler, options = {}) {
        return this.addListener(window, event, handler, options);
    }

    // Create safe event handler wrapper
    createSafeHandler(handler, fallback = () => {}) {
        return (event) => {
            try {
                return handler(event);
            } catch (error) {
                console.error('Event handler error:', error);
                return fallback(event);
            }
        };
    }

    // Debounce event handler
    createDebouncedHandler(handler, delay = 250) {
        let timeoutId;
        return (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handler(event), delay);
        };
    }

    // Throttle event handler
    createThrottledHandler(handler, delay = 250) {
        let lastCall = 0;
        return (event) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return handler(event);
            }
        };
    }

    // Get listener key for tracking
    getListenerKey(target, event) {
        const targetId = target === document ? 'document' : 
                        target === window ? 'window' : 
                        target.id || target.tagName || 'element';
        return `${targetId}_${event}`;
    }

    // Remove all listeners for a target
    removeAllListeners(target) {
        const keysToRemove = [];
        
        for (const [key, listeners] of this.listeners) {
            if (key.includes(target.id) || key.includes(target.tagName)) {
                listeners.forEach(({ handler }) => {
                    const event = key.split('_')[1];
                    target.removeEventListener(event, handler);
                });
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => this.listeners.delete(key));
    }

    // Clean up all tracked listeners
    cleanup() {
        for (const [key, listeners] of this.listeners) {
            const [targetId, event] = key.split('_');
            let target;
            
            if (targetId === 'document') target = document;
            else if (targetId === 'window') target = window;
            else target = document.getElementById(targetId);
            
            if (target) {
                listeners.forEach(({ handler }) => {
                    target.removeEventListener(event, handler);
                });
            }
        }
        
        this.listeners.clear();
        this.globalListeners.clear();
    }

    // Get listener statistics
    getStats() {
        const stats = {
            totalListeners: 0,
            byTarget: {},
            byEvent: {}
        };
        
        for (const [key, listeners] of this.listeners) {
            const [target, event] = key.split('_');
            stats.totalListeners += listeners.length;
            
            stats.byTarget[target] = (stats.byTarget[target] || 0) + listeners.length;
            stats.byEvent[event] = (stats.byEvent[event] || 0) + listeners.length;
        }
        
        return stats;
    }
}

// Singleton instance
export const eventManager = new EventManager();

// Convenience functions
export const addListener = (target, event, handler, options) => 
    eventManager.addListener(target, event, handler, options);

export const removeListener = (target, event, handler) => 
    eventManager.removeListener(target, event, handler);

export const dispatch = (target, eventType, detail) => 
    eventManager.dispatch(target, eventType, detail);

export const addGlobalListener = (event, handler, options) => 
    eventManager.addGlobalListener(event, handler, options);

export const createSafeHandler = (handler, fallback) => 
    eventManager.createSafeHandler(handler, fallback);

export const emit = (eventType, detail) => 
    eventManager.emit(eventType, detail);

export const on = (eventType, handler, options) => 
    eventManager.on(eventType, handler, options);

export const off = (eventType, handler) => 
    eventManager.off(eventType, handler); 