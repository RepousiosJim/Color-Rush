/**
 * @fileoverview Advanced Input System
 * @description Comprehensive input handling for touch gestures, keyboard controls, 
 * and enhanced mouse support with mobile optimization and accessibility
 */

import { eventManager } from '../utils/event-manager.js';
import { settingsSystem } from './settings-system.js';
import { performanceUtils } from '../utils/performance-utils.js';

/**
 * @typedef {Object} TouchGesture
 * @property {string} type - Gesture type ('tap', 'swipe', 'pinch', 'long-press')
 * @property {Object} start - Starting coordinates
 * @property {Object} end - Ending coordinates  
 * @property {number} duration - Gesture duration in ms
 * @property {number} distance - Distance traveled
 * @property {string} direction - Swipe direction ('up', 'down', 'left', 'right')
 */

/**
 * @typedef {Object} InputState
 * @property {boolean} isTouch - Device supports touch
 * @property {boolean} isMobile - Mobile device detected
 * @property {boolean} isTablet - Tablet device detected
 * @property {Object} currentGesture - Active gesture data
 * @property {Set} activeKeys - Currently pressed keys
 * @property {Object} mouseState - Mouse state information
 */

export class AdvancedInputSystem {
    constructor() {
        this.isInitialized = false;
        this.inputState = this.getInitialState();
        this.gestureThresholds = this.getGestureThresholds();
        this.keyMappings = this.getKeyMappings();
        
        // Performance optimization
        this.eventCache = new Map();
        this.throttledEvents = new Map();
        
        // Touch gesture tracking
        this.touches = new Map();
        this.activeGestures = new Set();
        
        // Keyboard state
        this.keySequences = [];
        this.keyComboTimer = null;
        
        // Mouse enhancement
        this.mouseTrail = [];
        this.clickBuffer = [];
        
        this.initialize();
    }

    /**
     * Initialize the input system
     */
    async initialize() {
        try {
            console.log('🎮 Initializing Advanced Input System...');
            
            // Detect device capabilities
            this.detectDeviceCapabilities();
            
            // Setup input handlers
            this.setupTouchHandlers();
            this.setupKeyboardHandlers();
            this.setupMouseHandlers();
            
            // Setup gesture recognition
            this.setupGestureRecognition();
            
            // Apply input settings
            this.applyInputSettings();
            
            // Setup accessibility features
            this.setupAccessibilityFeatures();
            
            this.isInitialized = true;
            console.log('✅ Advanced Input System initialized successfully');
            
            eventManager.emit('input:initialized', this.inputState);
            
        } catch (error) {
            console.error('❌ Failed to initialize Advanced Input System:', error);
            throw error;
        }
    }

    /**
     * Get initial input state
     */
    getInitialState() {
        return {
            isTouch: 'ontouchstart' in window,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android(?=.*Tablet)|Tablet/i.test(navigator.userAgent),
            currentGesture: null,
            activeKeys: new Set(),
            gesturesEnabled: true,
            keyboardShortcutsEnabled: true,
            mouseAccelerationEnabled: true,
            mouseState: {
                x: 0,
                y: 0,
                buttons: 0,
                moving: false,
                lastClick: 0
            }
        };
    }

    /**
     * Get gesture recognition thresholds
     */
    getGestureThresholds() {
        return {
            tap: {
                maxDistance: 10,
                maxDuration: 300
            },
            longPress: {
                minDuration: 500,
                maxDistance: 15
            },
            swipe: {
                minDistance: 50,
                maxDuration: 1000,
                minVelocity: 0.3
            },
            pinch: {
                minDistance: 20,
                sensitivity: 1.0
            }
        };
    }

    /**
     * Get keyboard mappings
     */
    getKeyMappings() {
        return {
            // Game controls
            movement: {
                'ArrowUp': 'move-up',
                'ArrowDown': 'move-down', 
                'ArrowLeft': 'move-left',
                'ArrowRight': 'move-right',
                'w': 'move-up',
                'a': 'move-left',
                's': 'move-down',
                'd': 'move-right'
            },
            
            // Game actions
            actions: {
                'Enter': 'confirm',
                ' ': 'select', // Space
                'Escape': 'cancel',
                'Tab': 'next',
                'r': 'restart',
                'h': 'hint',
                'p': 'pause',
                'm': 'mute'
            },
            
            // Settings shortcuts
            settings: {
                'F1': 'help',
                'F11': 'fullscreen',
                '=': 'zoom-in',
                '-': 'zoom-out',
                '0': 'zoom-reset'
            },
            
            // Accessibility
            accessibility: {
                'Alt+h': 'high-contrast',
                'Alt+r': 'reduced-motion',
                'Alt+l': 'large-text'
            }
        };
    }

    /**
     * Detect device capabilities
     */
    detectDeviceCapabilities() {
        // Touch support
        this.inputState.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Device type detection
        const userAgent = navigator.userAgent;
        this.inputState.isMobile = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        this.inputState.isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent);
        
        // Pointer capabilities
        this.inputState.hasPointer = window.PointerEvent !== undefined;
        this.inputState.hasHover = window.matchMedia('(hover: hover)').matches;
        
        // Input method preferences
        this.inputState.prefersMouse = !this.inputState.isTouch && this.inputState.hasHover;
        this.inputState.prefersTouch = this.inputState.isTouch && (this.inputState.isMobile || this.inputState.isTablet);
        
        console.log('📱 Device capabilities detected:', {
            touch: this.inputState.isTouch,
            mobile: this.inputState.isMobile,
            tablet: this.inputState.isTablet,
            pointer: this.inputState.hasPointer,
            hover: this.inputState.hasHover
        });
        
        // Emit device detection events
        if (this.inputState.isMobile) {
            eventManager.emit('device:mobile-detected');
        }
        if (this.inputState.isTablet) {
            eventManager.emit('device:tablet-detected');
        }
    }

    /**
     * Setup touch event handlers
     */
    setupTouchHandlers() {
        if (!this.inputState.isTouch) return;
        
        const gameBoard = document.querySelector('.game-board');
        if (!gameBoard) {
            console.warn('⚠️ Game board not found for touch handlers');
            return;
        }
        
        // Use passive listeners for better performance
        const options = { passive: false };
        
        gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e), options);
        gameBoard.addEventListener('touchmove', (e) => this.handleTouchMove(e), options);
        gameBoard.addEventListener('touchend', (e) => this.handleTouchEnd(e), options);
        gameBoard.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), options);
        
        // Prevent default behaviors for game area
        gameBoard.addEventListener('touchstart', (e) => e.preventDefault(), options);
        gameBoard.addEventListener('touchmove', (e) => e.preventDefault(), options);
        
        console.log('👆 Touch handlers configured');
    }

    /**
     * Handle touch start events
     */
    handleTouchStart(event) {
        performance.mark('touch-start');
        
        const currentTime = Date.now();
        
        for (const touch of event.changedTouches) {
            const touchData = {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: currentTime,
                element: document.elementFromPoint(touch.clientX, touch.clientY)
            };
            
            this.touches.set(touch.identifier, touchData);
            
            // Start gesture detection
            this.startGestureDetection(touchData);
        }
        
        // Handle haptic feedback
        if (settingsSystem.get('input.hapticFeedback') && navigator.vibrate) {
            navigator.vibrate(10); // Short vibration for touch start
        }
        
        performance.mark('touch-start-end');
        performance.measure('touch-start-duration', 'touch-start', 'touch-start-end');
    }

    /**
     * Handle touch move events
     */
    handleTouchMove(event) {
        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) continue;
            
            // Update position
            touchData.currentX = touch.clientX;
            touchData.currentY = touch.clientY;
            
            // Update gesture detection
            this.updateGestureDetection(touchData);
        }
    }

    /**
     * Handle touch end events
     */
    handleTouchEnd(event) {
        const currentTime = Date.now();
        
        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) continue;
            
            touchData.endTime = currentTime;
            touchData.duration = currentTime - touchData.startTime;
            
            // Complete gesture detection
            this.completeGestureDetection(touchData);
            
            // Clean up
            this.touches.delete(touch.identifier);
        }
    }

    /**
     * Handle touch cancel events
     */
    handleTouchCancel(event) {
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
        }
        this.activeGestures.clear();
    }

    /**
     * Start gesture detection
     */
    startGestureDetection(touchData) {
        // Check if gestures are enabled
        if (!this.inputState.gesturesEnabled) {
            return;
        }
        
        // Long press detection
        setTimeout(() => {
            if (this.touches.has(touchData.id)) {
                const currentTouch = this.touches.get(touchData.id);
                const distance = this.calculateDistance(
                    currentTouch.startX, currentTouch.startY,
                    currentTouch.currentX, currentTouch.currentY
                );
                
                if (distance < this.gestureThresholds.longPress.maxDistance) {
                    this.emitGesture('long-press', currentTouch);
                }
            }
        }, this.gestureThresholds.longPress.minDuration);
    }

    /**
     * Update gesture detection during movement
     */
    updateGestureDetection(touchData) {
        // Check if gestures are enabled
        if (!this.inputState.gesturesEnabled) {
            return;
        }
        
        // Real-time swipe detection for responsive UI
        const distance = this.calculateDistance(
            touchData.startX, touchData.startY,
            touchData.currentX, touchData.currentY
        );
        
        if (distance > this.gestureThresholds.swipe.minDistance) {
            const direction = this.calculateDirection(touchData);
            this.emitGesture('swipe-progress', touchData, { direction, distance });
        }
    }

    /**
     * Complete gesture detection
     */
    completeGestureDetection(touchData) {
        // Check if gestures are enabled
        if (!this.inputState.gesturesEnabled) {
            return;
        }
        
        const distance = this.calculateDistance(
            touchData.startX, touchData.startY,
            touchData.currentX, touchData.currentY
        );
        
        const duration = touchData.duration;
        const velocity = distance / duration;
        
        // Determine gesture type
        if (distance < this.gestureThresholds.tap.maxDistance && 
            duration < this.gestureThresholds.tap.maxDuration) {
            this.emitGesture('tap', touchData);
        } else if (distance > this.gestureThresholds.swipe.minDistance &&
                   duration < this.gestureThresholds.swipe.maxDuration &&
                   velocity > this.gestureThresholds.swipe.minVelocity) {
            const direction = this.calculateDirection(touchData);
            this.emitGesture('swipe', touchData, { direction, distance, velocity });
        }
    }

    /**
     * Setup keyboard event handlers
     */
    setupKeyboardHandlers() {
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Focus management for accessibility
        document.addEventListener('focusin', (e) => this.handleFocusIn(e));
        document.addEventListener('focusout', (e) => this.handleFocusOut(e));
        
        console.log('⌨️ Keyboard handlers configured');
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        const key = event.key;
        
        // Add to active keys
        this.inputState.activeKeys.add(key);
        
        // Handle key combinations
        const combo = this.getKeyCombo(event);
        if (combo) {
            this.handleKeyCombo(combo, event);
            return;
        }
        
        // Handle single key mappings
        const action = this.getKeyAction(key);
        if (action) {
            this.handleKeyAction(action, event);
        }
        
        // Track key sequences for complex shortcuts
        this.trackKeySequence(key);
    }

    /**
     * Handle keyup events
     */
    handleKeyUp(event) {
        const key = event.key;
        this.inputState.activeKeys.delete(key);
        
        eventManager.emit('input:key-up', { key, event });
    }

    /**
     * Get key combination string
     */
    getKeyCombo(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        // Don't include modifier keys as the main key
        if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
            parts.push(event.key);
        }
        
        return parts.length > 1 ? parts.join('+') : null;
    }

    /**
     * Handle key combinations
     */
    handleKeyCombo(combo, event) {
        // Check accessibility shortcuts
        if (this.keyMappings.accessibility[combo]) {
            const action = this.keyMappings.accessibility[combo];
            this.handleAccessibilityAction(action);
            event.preventDefault();
            return;
        }
        
        // Check settings shortcuts
        if (this.keyMappings.settings[combo]) {
            const action = this.keyMappings.settings[combo];
            this.handleSettingsAction(action);
            event.preventDefault();
            return;
        }
        
        eventManager.emit('input:key-combo', { combo, event });
    }

    /**
     * Get action for single key
     */
    getKeyAction(key) {
        // Check all mapping categories
        for (const category of Object.values(this.keyMappings)) {
            if (category[key]) {
                return category[key];
            }
        }
        return null;
    }

    /**
     * Handle key actions
     */
    handleKeyAction(action, event) {
        // Check if keyboard shortcuts are enabled
        if (!this.inputState.keyboardShortcutsEnabled) {
            return;
        }
        
        // Prevent default for game actions
        if (this.keyMappings.actions[event.key] || this.keyMappings.movement[event.key]) {
            event.preventDefault();
        }
        
        eventManager.emit('input:key-action', { action, key: event.key, event });
        
        // Handle specific actions
        switch (action) {
            case 'confirm':
                this.handleConfirmAction(event);
                break;
            case 'cancel':
                this.handleCancelAction(event);
                break;
            case 'pause':
                eventManager.emit('game:toggle-pause');
                break;
            case 'restart':
                eventManager.emit('game:restart-request');
                break;
            case 'hint':
                eventManager.emit('game:show-hint');
                break;
            case 'mute':
                eventManager.emit('audio:toggle-mute');
                break;
        }
    }

    /**
     * Setup mouse event handlers
     */
    setupMouseHandlers() {
        const gameBoard = document.querySelector('.game-board');
        if (!gameBoard) return;
        
        // Enhanced mouse events
        gameBoard.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gameBoard.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        gameBoard.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        gameBoard.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
        gameBoard.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        gameBoard.addEventListener('wheel', (e) => this.handleMouseWheel(e), { passive: false });
        
        // Double-click detection
        gameBoard.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        console.log('🖱️ Enhanced mouse handlers configured');
    }

    /**
     * Handle mouse down events
     */
    handleMouseDown(event) {
        this.inputState.mouseState.buttons = event.buttons;
        this.inputState.mouseState.lastClick = Date.now();
        
        // Track click for double-click detection
        this.clickBuffer.push({
            x: event.clientX,
            y: event.clientY,
            time: Date.now(),
            button: event.button
        });
        
        // Keep only recent clicks
        this.clickBuffer = this.clickBuffer.filter(click => 
            Date.now() - click.time < 500
        );
        
        eventManager.emit('input:mouse-down', { 
            x: event.clientX, 
            y: event.clientY, 
            button: event.button,
            event 
        });
    }

    /**
     * Handle mouse up events
     */
    handleMouseUp(event) {
        this.inputState.mouseState.buttons = event.buttons;
        
        eventManager.emit('input:mouse-up', { 
            x: event.clientX, 
            y: event.clientY, 
            button: event.button,
            event 
        });
    }

    /**
     * Handle mouse move events with throttling
     */
    handleMouseMove(event) {
        // Throttle mouse move events for performance
        if (!this.throttledEvents.has('mousemove')) {
            this.throttledEvents.set('mousemove', true);
            
            requestAnimationFrame(() => {
                this.inputState.mouseState.x = event.clientX;
                this.inputState.mouseState.y = event.clientY;
                this.inputState.mouseState.moving = true;
                
                // Update mouse trail
                this.updateMouseTrail(event.clientX, event.clientY);
                
                eventManager.emit('input:mouse-move', { 
                    x: event.clientX, 
                    y: event.clientY,
                    event 
                });
                
                this.throttledEvents.delete('mousemove');
            });
        }
    }

    /**
     * Handle mouse wheel events
     */
    handleMouseWheel(event) {
        // Prevent default scrolling in game area
        event.preventDefault();
        
        const direction = event.deltaY > 0 ? 'down' : 'up';
        const intensity = Math.abs(event.deltaY);
        
        eventManager.emit('input:mouse-wheel', { direction, intensity, event });
    }

    /**
     * Setup gesture recognition system
     */
    setupGestureRecognition() {
        // Multi-touch gesture recognition
        if (this.inputState.isTouch) {
            this.setupPinchGestures();
            this.setupSwipeGestures();
        }
        
        console.log('👌 Gesture recognition configured');
    }

    /**
     * Setup pinch gesture detection
     */
    setupPinchGestures() {
        let initialDistance = 0;
        let currentScale = 1;
        
        const gameBoard = document.querySelector('.game-board');
        if (!gameBoard) return;
        
        gameBoard.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.calculateDistance(
                    e.touches[0].clientX, e.touches[0].clientY,
                    e.touches[1].clientX, e.touches[1].clientY
                );
            }
        });
        
        gameBoard.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.calculateDistance(
                    e.touches[0].clientX, e.touches[0].clientY,
                    e.touches[1].clientX, e.touches[1].clientY
                );
                
                const scale = currentDistance / initialDistance;
                const scaleDiff = Math.abs(scale - currentScale);
                
                if (scaleDiff > 0.1) { // Sensitivity threshold
                    currentScale = scale;
                    this.emitGesture('pinch', null, { scale, direction: scale > 1 ? 'out' : 'in' });
                }
            }
        });
    }

    /**
     * Setup swipe gesture optimization
     */
    setupSwipeGestures() {
        // Enhanced swipe detection with direction prediction
        const swipeHistory = [];
        
        eventManager.on('input:gesture', (gesture) => {
            if (gesture.type === 'swipe') {
                swipeHistory.push(gesture);
                
                // Keep only recent swipes
                while (swipeHistory.length > 5) {
                    swipeHistory.shift();
                }
                
                // Detect swipe patterns
                this.detectSwipePatterns(swipeHistory);
            }
        });
    }

    /**
     * Detect swipe patterns for enhanced interaction
     */
    detectSwipePatterns(history) {
        if (history.length < 2) return;
        
        const recent = history.slice(-2);
        const directions = recent.map(swipe => swipe.data.direction);
        
        // Detect specific patterns
        if (directions[0] === 'up' && directions[1] === 'down') {
            eventManager.emit('input:swipe-pattern', { pattern: 'shake-vertical' });
        } else if (directions[0] === 'left' && directions[1] === 'right') {
            eventManager.emit('input:swipe-pattern', { pattern: 'shake-horizontal' });
        }
    }

    /**
     * Apply input settings
     */
    applyInputSettings() {
        const inputSettings = settingsSystem.settings.input;
        
        // Apply touch sensitivity
        if (inputSettings.touchSensitivity !== 1.0) {
            this.adjustTouchSensitivity(inputSettings.touchSensitivity);
        }
        
        // Configure gesture settings
        if (inputSettings.touchGestures) {
            this.enableGestures();
        } else {
            this.disableGestures();
        }
        
        // Configure keyboard shortcuts
        if (inputSettings.keyboardShortcuts) {
            this.enableKeyboardShortcuts();
        } else {
            this.disableKeyboardShortcuts();
        }
        
        // Apply mouse acceleration
        if (inputSettings.mouseAcceleration) {
            this.enableMouseAcceleration();
        } else {
            this.disableMouseAcceleration();
        }
    }

    /**
     * Adjust touch sensitivity
     */
    adjustTouchSensitivity(sensitivity) {
        this.gestureThresholds.swipeMinDistance *= sensitivity;
        this.gestureThresholds.tapMaxDistance *= sensitivity;
        this.gestureThresholds.longPressMinDuration *= (2 - sensitivity); // Inverse for duration
        
        console.log(`👆 Touch sensitivity adjusted to ${Math.round(sensitivity * 100)}%`);
    }

    /**
     * Disable gesture recognition
     */
    disableGestures() {
        this.inputState.gesturesEnabled = false;
        console.log('👆 Touch gestures disabled');
    }

    /**
     * Enable gesture recognition
     */
    enableGestures() {
        this.inputState.gesturesEnabled = true;
        console.log('👆 Touch gestures enabled');
    }

    /**
     * Disable keyboard shortcuts
     */
    disableKeyboardShortcuts() {
        this.inputState.keyboardShortcutsEnabled = false;
        console.log('⌨️ Keyboard shortcuts disabled');
    }

    /**
     * Enable keyboard shortcuts
     */
    enableKeyboardShortcuts() {
        this.inputState.keyboardShortcutsEnabled = true;
        console.log('⌨️ Keyboard shortcuts enabled');
    }

    /**
     * Enable mouse acceleration
     */
    enableMouseAcceleration() {
        this.inputState.mouseAccelerationEnabled = true;
        document.body.classList.add('mouse-acceleration');
        console.log('🖱️ Mouse acceleration enabled');
    }

    /**
     * Disable mouse acceleration
     */
    disableMouseAcceleration() {
        this.inputState.mouseAccelerationEnabled = false;
        document.body.classList.remove('mouse-acceleration');
        console.log('🖱️ Mouse acceleration disabled');
    }

    /**
     * Handle confirm action
     */
    handleConfirmAction(event) {
        eventManager.emit('input:confirm', { event });
    }

    /**
     * Handle cancel action
     */
    handleCancelAction(event) {
        eventManager.emit('input:cancel', { event });
    }

    /**
     * Track key sequence for complex shortcuts
     */
    trackKeySequence(key) {
        if (!this.keySequence) {
            this.keySequence = [];
        }
        
        this.keySequence.push({
            key,
            time: Date.now()
        });
        
        // Keep only recent keys
        this.keySequence = this.keySequence.filter(
            entry => Date.now() - entry.time < 2000
        );
    }

    /**
     * Handle accessibility action
     */
    handleAccessibilityAction(action) {
        switch (action) {
            case 'high-contrast':
                eventManager.emit('settings:toggle', { path: 'accessibility.highContrast' });
                break;
            case 'reduced-motion':
                eventManager.emit('settings:toggle', { path: 'accessibility.reducedMotion' });
                break;
            case 'large-text':
                eventManager.emit('settings:toggle', { path: 'accessibility.largeText' });
                break;
        }
    }

    /**
     * Handle settings action
     */
    handleSettingsAction(action) {
        switch (action) {
            case 'help':
                eventManager.emit('ui:show-help');
                break;
            case 'fullscreen':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
                break;
            case 'zoom-in':
                eventManager.emit('ui:zoom', { direction: 'in' });
                break;
            case 'zoom-out':
                eventManager.emit('ui:zoom', { direction: 'out' });
                break;
            case 'zoom-reset':
                eventManager.emit('ui:zoom', { direction: 'reset' });
                break;
        }
    }

    /**
     * Handle focus in
     */
    handleFocusIn(event) {
        eventManager.emit('input:focus-in', { target: event.target, event });
    }

    /**
     * Handle focus out
     */
    handleFocusOut(event) {
        eventManager.emit('input:focus-out', { target: event.target, event });
    }

    /**
     * Handle mouse enter
     */
    handleMouseEnter(event) {
        this.inputState.mouseState.moving = true;
        eventManager.emit('input:mouse-enter', { event });
    }

    /**
     * Handle mouse leave
     */
    handleMouseLeave(event) {
        this.inputState.mouseState.moving = false;
        this.mouseTrail = []; // Clear trail when leaving
        eventManager.emit('input:mouse-leave', { event });
    }

    /**
     * Handle double click
     */
    handleDoubleClick(event) {
        eventManager.emit('input:double-click', { 
            x: event.clientX, 
            y: event.clientY, 
            button: event.button,
            event 
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Focus management
        this.setupFocusManagement();
        
        // Screen reader support
        this.setupScreenReaderSupport();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        console.log('♿ Accessibility features configured');
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Create focus trap for modals
        this.focusTrap = null;
        
        eventManager.on('modal:opened', (modal) => {
            this.createFocusTrap(modal);
        });
        
        eventManager.on('modal:closed', () => {
            this.removeFocusTrap();
        });
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Create live region for screen reader announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'screen-reader-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);

        // Store reference for announcements
        this.liveRegion = liveRegion;

        // Listen for game events to announce
        eventManager.on('game:score-update', (data) => {
            this.announceToScreenReader(`Score updated to ${data.score}`);
        });

        eventManager.on('game:level-up', (data) => {
            this.announceToScreenReader(`Level up! Now on level ${data.level}`);
        });

        eventManager.on('game:match-found', (data) => {
            this.announceToScreenReader(`Match found! ${data.count} gems matched`);
        });

        console.log('📢 Screen reader support configured');
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for game board
        let currentFocusRow = 0;
        let currentFocusCol = 0;

        // Grid navigation with arrow keys
        document.addEventListener('keydown', (event) => {
            if (!this.inputState.keyboardShortcutsEnabled) return;

            const gameBoard = document.querySelector('.game-board');
            if (!gameBoard || !gameBoard.contains(document.activeElement)) return;

            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    currentFocusRow = Math.max(0, currentFocusRow - 1);
                    this.focusGridCell(currentFocusRow, currentFocusCol);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    currentFocusRow = Math.min(7, currentFocusRow + 1);
                    this.focusGridCell(currentFocusRow, currentFocusCol);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    currentFocusCol = Math.max(0, currentFocusCol - 1);
                    this.focusGridCell(currentFocusRow, currentFocusCol);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    currentFocusCol = Math.min(7, currentFocusCol + 1);
                    this.focusGridCell(currentFocusRow, currentFocusCol);
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.activateGridCell(currentFocusRow, currentFocusCol);
                    break;
            }
        });

        // Tab navigation enhancement
        this.setupTabNavigation();

        console.log('⌨️ Keyboard navigation configured');
    }

    /**
     * Announce message to screen reader
     */
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            // Clear after announcement to allow repeated messages
            setTimeout(() => {
                if (this.liveRegion) {
                    this.liveRegion.textContent = '';
                }
            }, 1000);
        }
    }

    /**
     * Focus specific grid cell
     */
    focusGridCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.focus();
            this.announceToScreenReader(`Focused on cell ${row + 1}, ${col + 1}`);
        }
    }

    /**
     * Activate specific grid cell
     */
    activateGridCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.click();
            this.announceToScreenReader(`Activated cell ${row + 1}, ${col + 1}`);
        }
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        // Ensure all interactive elements are properly focusable
        const interactiveElements = document.querySelectorAll('button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        interactiveElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            // Add focus indicators
            element.addEventListener('focus', () => {
                element.classList.add('keyboard-focused');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('keyboard-focused');
            });
        });
    }

    /**
     * Create focus trap for modals
     */
    createFocusTrap(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.focusTrap = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        modalElement.addEventListener('keydown', this.focusTrap);
        firstElement.focus();
    }

    /**
     * Remove focus trap
     */
    removeFocusTrap() {
        if (this.focusTrap) {
            document.removeEventListener('keydown', this.focusTrap);
            this.focusTrap = null;
        }
    }

    /**
     * Utility methods
     */
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    calculateDirection(touchData) {
        const deltaX = touchData.currentX - touchData.startX;
        const deltaY = touchData.currentY - touchData.startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    emitGesture(type, touchData, additionalData = {}) {
        const gesture = {
            type,
            timestamp: Date.now(),
            data: { ...additionalData }
        };
        
        if (touchData) {
            gesture.data.startX = touchData.startX;
            gesture.data.startY = touchData.startY;
            gesture.data.currentX = touchData.currentX;
            gesture.data.currentY = touchData.currentY;
            gesture.data.element = touchData.element;
        }
        
        eventManager.emit('input:gesture', gesture);
        eventManager.emit(`input:gesture:${type}`, gesture);
    }

    updateMouseTrail(x, y) {
        this.mouseTrail.push({ x, y, time: Date.now() });
        
        // Keep trail length manageable
        while (this.mouseTrail.length > 10) {
            this.mouseTrail.shift();
        }
        
        // Remove old trail points
        const now = Date.now();
        this.mouseTrail = this.mouseTrail.filter(point => now - point.time < 1000);
    }

    /**
     * Input state and debugging
     */
    getInputState() {
        return {
            ...this.inputState,
            activeTouches: this.touches.size,
            activeGestures: this.activeGestures.size,
            mouseTrailLength: this.mouseTrail.length
        };
    }

    getInputSummary() {
        return {
            device: `${this.inputState.isMobile ? 'Mobile' : this.inputState.isTablet ? 'Tablet' : 'Desktop'}`,
            capabilities: `Touch: ${this.inputState.isTouch}, Hover: ${this.inputState.hasHover}`,
            activeInputs: `Keys: ${this.inputState.activeKeys.size}, Touches: ${this.touches.size}`,
            settings: `Gestures: ${settingsSystem.get('input.touchGestures')}, Shortcuts: ${settingsSystem.get('input.keyboardShortcuts')}`
        };
    }
}

// Create singleton instance
export const advancedInputSystem = new AdvancedInputSystem();

// Quick access methods for common operations
export const isTouch = () => advancedInputSystem.inputState.isTouch;
export const isMobile = () => advancedInputSystem.inputState.isMobile;
export const getInputState = () => advancedInputSystem.getInputState();
export const emitGesture = (type, data) => advancedInputSystem.emitGesture(type, null, data); 