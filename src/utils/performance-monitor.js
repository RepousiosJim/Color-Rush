// Performance Monitor
// Tracks performance metrics and helps with optimization

export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.timers = new Map();
        this.counters = new Map();
        this.isEnabled = true;
    }

    // Start timing an operation
    startTimer(name) {
        if (!this.isEnabled) return;
        
        this.timers.set(name, {
            startTime: performance.now(),
            startMemory: this.getMemoryUsage()
        });
    }

    // End timing and record metric
    endTimer(name) {
        if (!this.isEnabled || !this.timers.has(name)) return null;
        
        const timer = this.timers.get(name);
        const endTime = performance.now();
        const duration = endTime - timer.startTime;
        
        this.recordMetric(name, {
            duration,
            startMemory: timer.startMemory,
            endMemory: this.getMemoryUsage(),
            timestamp: endTime
        });
        
        this.timers.delete(name);
        return duration;
    }

    // Record a metric
    recordMetric(name, data) {
        if (!this.isEnabled) return;
        
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        this.metrics.get(name).push({
            ...data,
            timestamp: data.timestamp || performance.now()
        });
        
        // Keep only last 100 entries per metric
        const entries = this.metrics.get(name);
        if (entries.length > 100) {
            entries.splice(0, entries.length - 100);
        }
    }

    // Increment a counter
    incrementCounter(name, amount = 1) {
        if (!this.isEnabled) return;
        
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + amount);
    }

    // Get current memory usage (if available)
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    // Get metric statistics
    getMetricStats(name) {
        const metrics = this.metrics.get(name);
        if (!metrics || metrics.length === 0) return null;
        
        const durations = metrics.map(m => m.duration).filter(d => d !== undefined);
        
        if (durations.length === 0) return null;
        
        durations.sort((a, b) => a - b);
        
        return {
            count: durations.length,
            min: durations[0],
            max: durations[durations.length - 1],
            avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            median: durations[Math.floor(durations.length / 2)],
            p95: durations[Math.floor(durations.length * 0.95)],
            p99: durations[Math.floor(durations.length * 0.99)]
        };
    }

    // Get all performance data
    getAllStats() {
        const stats = {
            metrics: {},
            counters: Object.fromEntries(this.counters),
            memory: this.getMemoryUsage(),
            timestamp: performance.now()
        };
        
        for (const [name] of this.metrics) {
            stats.metrics[name] = this.getMetricStats(name);
        }
        
        return stats;
    }

    // Profile a function execution
    profile(name, fn) {
        this.startTimer(name);
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result.finally(() => this.endTimer(name));
            }
            this.endTimer(name);
            return result;
        } catch (error) {
            this.endTimer(name);
            this.incrementCounter(`${name}_errors`);
            throw error;
        }
    }

    // Profile an async function
    async profileAsync(name, fn) {
        this.startTimer(name);
        try {
            const result = await fn();
            this.endTimer(name);
            return result;
        } catch (error) {
            this.endTimer(name);
            this.incrementCounter(`${name}_errors`);
            throw error;
        }
    }

    // Log performance summary
    logSummary() {
        if (!this.isEnabled) return;
        
        console.group('🔍 Performance Summary');
        
        const stats = this.getAllStats();
        
        // Memory usage
        if (stats.memory) {
            const memoryMB = (stats.memory.used / 1024 / 1024).toFixed(2);
            console.log(`💾 Memory Usage: ${memoryMB} MB`);
        }
        
        // Metrics summary
        console.log('⏱️ Timing Metrics:');
        for (const [name, data] of Object.entries(stats.metrics)) {
            if (data) {
                console.log(`  ${name}: avg ${data.avg.toFixed(2)}ms (${data.count} samples)`);
            }
        }
        
        // Counters
        if (Object.keys(stats.counters).length > 0) {
            console.log('🔢 Counters:', stats.counters);
        }
        
        console.groupEnd();
    }

    // Clear all metrics
    clear() {
        this.metrics.clear();
        this.timers.clear();
        this.counters.clear();
    }

    // Enable/disable monitoring
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // Create a profiled version of a function
    createProfiledFunction(name, fn) {
        return (...args) => this.profile(name, () => fn(...args));
    }

    // Monitor DOM performance
    monitorDOMPerformance() {
        if (!this.isEnabled) return;
        
        // Monitor DOM mutations
        const observer = new MutationObserver((mutations) => {
            this.incrementCounter('dom_mutations', mutations.length);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
        
        return observer;
    }

    // Get formatted report
    getReport() {
        const stats = this.getAllStats();
        const report = {
            timestamp: new Date().toISOString(),
            performance: stats,
            recommendations: this.getRecommendations(stats)
        };
        
        return report;
    }

    // Get performance recommendations
    getRecommendations(stats) {
        const recommendations = [];
        
        // Check for slow operations
        for (const [name, data] of Object.entries(stats.metrics)) {
            if (data && data.avg > 100) {
                recommendations.push(`${name} is taking ${data.avg.toFixed(2)}ms on average - consider optimization`);
            }
        }
        
        // Check memory usage
        if (stats.memory && stats.memory.used > stats.memory.total * 0.8) {
            recommendations.push('High memory usage detected - consider cleanup');
        }
        
        // Check for high error rates
        for (const [name, count] of Object.entries(stats.counters)) {
            if (name.includes('error') && count > 10) {
                recommendations.push(`High error count for ${name}: ${count}`);
            }
        }
        
        return recommendations;
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startTimer = (name) => performanceMonitor.startTimer(name);
export const endTimer = (name) => performanceMonitor.endTimer(name);
export const profile = (name, fn) => performanceMonitor.profile(name, fn);
export const profileAsync = (name, fn) => performanceMonitor.profileAsync(name, fn);
export const incrementCounter = (name, amount) => performanceMonitor.incrementCounter(name, amount); 