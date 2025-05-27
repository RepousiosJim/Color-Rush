/**
 * Performance Utilities Module
 * Optimized helpers for better game performance and AI code analysis
 */

export class PerformanceUtils {
    constructor() {
        this.rafCallbacks = new Map();
        this.rafId = null;
        this.domBatchQueue = [];
        this.isProcessingBatch = false;
        
        // Performance monitoring
        this.metrics = {
            frameTime: 0,
            domUpdates: 0,
            memoryUsage: 0,
            lastGC: Date.now()
        };
    }

    /**
     * Optimized requestAnimationFrame with batching
     * @param {string} id - Unique identifier for the animation
     * @param {Function} callback - Animation callback
     */
    scheduleAnimation(id, callback) {
        this.rafCallbacks.set(id, callback);
        
        if (!this.rafId) {
            this.rafId = requestAnimationFrame((timestamp) => this.processAnimations(timestamp));
        }
    }

    /**
     * Cancel a scheduled animation
     * @param {string} id - Animation identifier
     */
    cancelAnimation(id) {
        this.rafCallbacks.delete(id);
        
        if (this.rafCallbacks.size === 0 && this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Process all scheduled animations in a single frame
     * @param {number} timestamp - Frame timestamp
     */
    processAnimations(timestamp) {
        const startTime = performance.now();
        
        // Execute all scheduled animations
        for (const [id, callback] of this.rafCallbacks) {
            try {
                callback(timestamp);
            } catch (error) {
                console.error(`Animation error for ${id}:`, error);
                this.rafCallbacks.delete(id);
            }
        }
        
        // Schedule next frame if we have callbacks
        if (this.rafCallbacks.size > 0) {
            this.rafId = requestAnimationFrame((ts) => this.processAnimations(ts));
        } else {
            this.rafId = null;
        }
        
        // Track performance
        this.metrics.frameTime = performance.now() - startTime;
    }

    /**
     * Batch DOM operations for better performance
     * @param {Function} operation - DOM operation to batch
     */
    batchDOMOperation(operation) {
        this.domBatchQueue.push(operation);
        
        if (!this.isProcessingBatch) {
            this.isProcessingBatch = true;
            
            // Use requestAnimationFrame for DOM batching
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                
                // Process all batched operations
                this.domBatchQueue.forEach(op => {
                    try {
                        op(fragment);
                    } catch (error) {
                        console.error('Batched DOM operation error:', error);
                    }
                });
                
                // Clear queue
                this.domBatchQueue = [];
                this.isProcessingBatch = false;
                this.metrics.domUpdates++;
            });
        }
    }

    /**
     * Optimized event listener management
     */
    createEventPool() {
        const pool = new Map();
        
        return {
            addEventListener: (element, type, handler, options = {}) => {
                const key = `${type}_${options.passive || false}`;
                
                if (!pool.has(key)) {
                    pool.set(key, new WeakMap());
                }
                
                const handlers = pool.get(key);
                
                // Use passive listeners for touch events
                const finalOptions = type.startsWith('touch') 
                    ? { ...options, passive: true }
                    : options;
                
                element.addEventListener(type, handler, finalOptions);
                handlers.set(element, handler);
            },
            
            removeEventListener: (element, type, options = {}) => {
                const key = `${type}_${options.passive || false}`;
                const handlers = pool.get(key);
                
                if (handlers && handlers.has(element)) {
                    const handler = handlers.get(element);
                    element.removeEventListener(type, handler, options);
                    handlers.delete(element);
                }
            },
            
            cleanup: () => {
                pool.clear();
            }
        };
    }

    /**
     * Memory management utilities
     */
    manageMemory() {
        return {
            // Object pooling for frequently created objects
            createObjectPool: (createFn, resetFn, initialSize = 10) => {
                const pool = [];
                
                // Pre-populate pool
                for (let i = 0; i < initialSize; i++) {
                    pool.push(createFn());
                }
                
                return {
                    acquire: () => {
                        return pool.length > 0 ? pool.pop() : createFn();
                    },
                    
                    release: (obj) => {
                        if (resetFn) resetFn(obj);
                        pool.push(obj);
                    },
                    
                    clear: () => {
                        pool.length = 0;
                    }
                };
            },
            
            // WeakMap for automatic cleanup
            createWeakCache: () => new WeakMap(),
            
            // Monitor memory usage
            getMemoryInfo: () => {
                if (performance.memory) {
                    return {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            }
        };
    }

    /**
     * CSS animation optimization helpers
     */
    optimizeCSS() {
        return {
            // Add hardware acceleration to element
            enableHardwareAcceleration: (element) => {
                element.style.transform = 'translateZ(0)';
                element.style.willChange = 'transform';
                element.style.backfaceVisibility = 'hidden';
            },
            
            // Clean up hardware acceleration
            disableHardwareAcceleration: (element) => {
                element.style.willChange = 'auto';
                element.style.transform = '';
                element.style.backfaceVisibility = '';
            },
            
            // Batch CSS changes
            batchCSSChanges: (element, changes) => {
                const originalDisplay = element.style.display;
                element.style.display = 'none';
                
                Object.assign(element.style, changes);
                
                // Force reflow
                element.offsetHeight;
                element.style.display = originalDisplay;
            }
        };
    }

    /**
     * Performance monitoring
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            memory: this.manageMemory().getMemoryInfo()
        };
    }

    /**
     * Cleanup all performance utilities
     */
    cleanup() {
        // Cancel all animations
        this.rafCallbacks.clear();
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // Clear DOM batch queue
        this.domBatchQueue = [];
        this.isProcessingBatch = false;
        
        console.log('🧹 PerformanceUtils cleaned up');
    }
}

/**
 * Utility functions for common performance optimizations
 */
export const performanceHelpers = {
    // Debounce function calls
    debounce: (func, wait, immediate = false) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Throttle function calls
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Intersection Observer for visibility
    createVisibilityObserver: (callback, options = {}) => {
        return new IntersectionObserver(callback, {
            threshold: 0.1,
            ...options
        });
    },
    
    // Efficient array operations
    arrayUtils: {
        // Fast array clearing
        fastClear: (arr) => {
            arr.length = 0;
            return arr;
        },
        
        // Efficient array copying
        fastCopy: (arr) => arr.slice(),
        
        // Remove item efficiently
        fastRemove: (arr, item) => {
            const index = arr.indexOf(item);
            if (index > -1) {
                arr.splice(index, 1);
            }
            return arr;
        }
    }
};

// Global instance
export const performanceUtils = new PerformanceUtils(); 