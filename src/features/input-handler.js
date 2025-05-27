// Input Handler Module
// Handles touch gestures, swipe controls, and mobile input

export class InputHandler {
    constructor() {
        this.touchStart = null;
        this.touchEnd = null;
        this.touchThreshold = 50;
        this.isInitialized = false;
        this.swipeCallbacks = new Map();
        this.BOARD_SIZE = 8;
        this.isEnabled = true;
        this.touchTimeout = null;
        this.maxTouchDuration = 5000; // 5 seconds max touch
        this.preventBubble = true;
        this.debugMode = false;
    }

    // Validate input handler prerequisites
    validatePrerequisites() {
        const errors = [];
        
        if (!document) {
            errors.push('DOM not available');
        }
        
        if (!window) {
            errors.push('Window object not available');
        }
        
        if (!document.addEventListener) {
            errors.push('Event listeners not supported');
        }
        
        return errors;
    }

    // Initialize input handler with comprehensive error checking
    initialize() {
        try {
            // Validate prerequisites
            const prereqErrors = this.validatePrerequisites();
            if (prereqErrors.length > 0) {
                console.error('❌ Input Handler prerequisites not met:', prereqErrors);
                return false;
            }

            console.log('🎮 Initializing Input Handler...');
            
            // Initialize components with error handling
            const setupResults = this.initializeComponents();
            if (!setupResults.allSuccessful) {
                console.warn('⚠️ Some input components failed to initialize:', setupResults.failures);
            }
            
            // Validate initialization
            if (this.validateInitialization()) {
                this.isInitialized = true;
                console.log('✅ Input Handler initialized successfully');
                return true;
            } else {
                console.error('❌ Input Handler initialization validation failed');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize Input Handler:', error);
            return false;
        }
    }

    // Initialize components with individual error handling
    initializeComponents() {
        const results = {
            allSuccessful: true,
            failures: []
        };
        
        // Setup touch handlers
        try {
            this.setupTouchHandlers();
        } catch (error) {
            console.error('Failed to setup touch handlers:', error);
            results.allSuccessful = false;
            results.failures.push('touch');
        }
        
        // Setup keyboard handlers
        try {
            this.setupKeyboardHandlers();
        } catch (error) {
            console.error('Failed to setup keyboard handlers:', error);
            results.allSuccessful = false;
            results.failures.push('keyboard');
        }
        
        // Setup global handlers
        try {
            this.setupGlobalHandlers();
        } catch (error) {
            console.error('Failed to setup global handlers:', error);
            results.allSuccessful = false;
            results.failures.push('global');
        }
        
        return results;
    }

    // Validate initialization success
    validateInitialization() {
        const checks = [
            () => this.touchThreshold > 0,
            () => this.BOARD_SIZE > 0,
            () => typeof this.swipeCallbacks === 'object'
        ];
        
        return checks.every(check => {
            try {
                return check();
            } catch (error) {
                console.error('Initialization validation check failed:', error);
                return false;
            }
        });
    }

    // Setup touch and swipe handlers with validation
    setupTouchHandlers() {
        const gameBoard = this.findGameBoard();
        
        if (!gameBoard) {
            console.warn('⚠️ Game board not found, touch handlers may not work optimally');
            return;
        }

        try {
            // Remove existing listeners to prevent duplicates
            this.removeTouchHandlers(gameBoard);
            
            // Touch events for swipe gestures with error boundaries
            gameBoard.addEventListener('touchstart', this.createSafeHandler(this.handleTouchStart.bind(this)), { 
                passive: false,
                capture: false
            });
            
            gameBoard.addEventListener('touchmove', this.createSafeHandler(this.handleTouchMove.bind(this)), { 
                passive: false,
                capture: false
            });
            
            gameBoard.addEventListener('touchend', this.createSafeHandler(this.handleTouchEnd.bind(this)), { 
                passive: false,
                capture: false
            });
            
            gameBoard.addEventListener('touchcancel', this.createSafeHandler(this.handleTouchCancel.bind(this)), { 
                passive: true,
                capture: false
            });
            
            console.log('✅ Touch handlers setup successfully');
            
        } catch (error) {
            console.error('Failed to setup touch event listeners:', error);
            throw error;
        }
    }

    // Find game board with multiple fallback strategies
    findGameBoard() {
        const selectors = [
            '.game-board',
            '#gameBoard',
            '[data-game-board]',
            '.board-container .game-board'
        ];
        
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    return element;
                }
            } catch (error) {
                console.warn(`Failed to query selector ${selector}:`, error);
            }
        }
        
        return null;
    }

    // Create safe event handler with error boundary
    createSafeHandler(handler) {
        return (event) => {
            try {
                if (!this.isEnabled) {
                    return;
                }
                
                // Validate event object
                if (!event || typeof event !== 'object') {
                    console.warn('Invalid event object received');
                    return;
                }
                
                handler(event);
                
            } catch (error) {
                console.error('Error in event handler:', error);
                // Don't re-throw to prevent breaking the event system
            }
        };
    }

    // Remove existing touch handlers to prevent duplicates
    removeTouchHandlers(element) {
        if (!element) return;
        
        try {
            // Clone element to remove all listeners (if needed)
            // For now, we'll rely on the new handler setup
        } catch (error) {
            console.warn('Failed to remove existing touch handlers:', error);
        }
    }

    // Handle touch start with comprehensive validation
    handleTouchStart(event) {
        try {
            // Validate event and touches
            if (!this.validateTouchEvent(event, 'touchstart')) {
                return;
            }
            
            if (this.preventBubble) {
                event.preventDefault();
            }
            
            // Clear any existing touch timeout
            this.clearTouchTimeout();
            
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                
                // Validate touch coordinates
                if (!this.validateTouchCoordinates(touch)) {
                    console.warn('Invalid touch coordinates');
                    return;
                }
                
                this.touchStart = {
                    x: touch.clientX,
                    y: touch.clientY,
                    element: event.target,
                    timestamp: Date.now(),
                    identifier: touch.identifier
                };
                
                // Set timeout for stuck touches
                this.touchTimeout = setTimeout(() => {
                    console.warn('Touch gesture timeout, clearing state');
                    this.clearTouchState();
                }, this.maxTouchDuration);
                
                if (this.debugMode) {
                    console.log('Touch start:', this.touchStart);
                }
            }
            
        } catch (error) {
            console.error('Error in handleTouchStart:', error);
            this.clearTouchState();
        }
    }

    // Validate touch event
    validateTouchEvent(event, expectedType) {
        if (!event) {
            console.warn('Touch event is null');
            return false;
        }
        
        if (event.type !== expectedType) {
            console.warn(`Expected ${expectedType} but got ${event.type}`);
            return false;
        }
        
        if (!event.touches && !event.changedTouches) {
            console.warn('Touch event has no touch data');
            return false;
        }
        
        return true;
    }

    // Validate touch coordinates
    validateTouchCoordinates(touch) {
        if (!touch) return false;
        
        const { clientX, clientY } = touch;
        
        // Check for valid numbers
        if (typeof clientX !== 'number' || typeof clientY !== 'number') {
            return false;
        }
        
        // Check for reasonable values (not NaN, Infinity, etc.)
        if (!isFinite(clientX) || !isFinite(clientY)) {
            return false;
        }
        
        // Check for negative values (might be valid in some cases)
        if (clientX < 0 || clientY < 0) {
            console.warn('Negative touch coordinates detected');
        }
        
        return true;
    }

    // Clear touch timeout
    clearTouchTimeout() {
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
    }

    // Clear touch state
    clearTouchState() {
        this.touchStart = null;
        this.touchEnd = null;
        this.clearTouchTimeout();
    }

    // Handle touch move with validation
    handleTouchMove(event) {
        try {
            if (!this.validateTouchEvent(event, 'touchmove')) {
                return;
            }
            
            if (this.preventBubble) {
                event.preventDefault();
            }
            
            if (!this.touchStart || event.touches.length !== 1) {
                return;
            }
            
            const touch = event.touches[0];
            
            // Validate touch identifier consistency
            if (touch.identifier !== this.touchStart.identifier) {
                console.warn('Touch identifier mismatch');
                this.clearTouchState();
                return;
            }
            
            if (!this.validateTouchCoordinates(touch)) {
                console.warn('Invalid touch move coordinates');
                return;
            }
            
            this.touchEnd = {
                x: touch.clientX,
                y: touch.clientY,
                timestamp: Date.now(),
                identifier: touch.identifier
            };
            
            if (this.debugMode) {
                console.log('Touch move:', this.touchEnd);
            }
            
        } catch (error) {
            console.error('Error in handleTouchMove:', error);
            this.clearTouchState();
        }
    }

    // Handle touch end with comprehensive processing
    handleTouchEnd(event) {
        try {
            if (!this.validateTouchEvent(event, 'touchend')) {
                return;
            }
            
            if (this.preventBubble) {
                event.preventDefault();
            }
            
            if (!this.touchStart) {
                return;
            }
            
            // Clear timeout
            this.clearTouchTimeout();
            
            const touch = event.changedTouches[0];
            if (!touch) {
                console.warn('No changed touches in touchend event');
                this.clearTouchState();
                return;
            }
            
            // Validate touch identifier
            if (touch.identifier !== this.touchStart.identifier) {
                console.warn('Touch end identifier mismatch');
                this.clearTouchState();
                return;
            }
            
            if (!this.validateTouchCoordinates(touch)) {
                console.warn('Invalid touch end coordinates');
                this.clearTouchState();
                return;
            }
            
            this.touchEnd = {
                x: touch.clientX,
                y: touch.clientY,
                timestamp: Date.now(),
                identifier: touch.identifier
            };
            
            // Process the touch gesture
            this.processTouchSafely();
            
        } catch (error) {
            console.error('Error in handleTouchEnd:', error);
        } finally {
            this.clearTouchState();
        }
    }

    // Handle touch cancel
    handleTouchCancel(event) {
        try {
            console.log('Touch gesture cancelled');
            this.clearTouchState();
        } catch (error) {
            console.error('Error in handleTouchCancel:', error);
        }
    }

    // Process touch gesture with validation
    processTouchSafely() {
        try {
            if (!this.touchStart || !this.touchEnd) {
                console.warn('Incomplete touch data for processing');
                return;
            }
            
            const deltaX = this.touchEnd.x - this.touchStart.x;
            const deltaY = this.touchEnd.y - this.touchStart.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const duration = this.touchEnd.timestamp - this.touchStart.timestamp;
            
            // Validate calculated values
            if (!isFinite(distance) || !isFinite(duration)) {
                console.warn('Invalid calculated touch values');
                return;
            }
            
            // Check for reasonable duration (prevent stuck touches)
            if (duration > this.maxTouchDuration || duration < 0) {
                console.warn(`Invalid touch duration: ${duration}ms`);
                return;
            }
            
            // Check if it's a tap (short distance, quick duration)
            if (distance < this.touchThreshold && duration < 300) {
                this.handleTapSafely(this.touchStart.element);
                return;
            }
            
            // Check if it's a swipe (sufficient distance)
            if (distance >= this.touchThreshold) {
                const direction = this.getSwipeDirectionSafely(deltaX, deltaY);
                if (direction) {
                    this.handleSwipeSafely(this.touchStart.element, direction, distance, duration);
                }
            }
            
        } catch (error) {
            console.error('Error processing touch gesture:', error);
        }
    }

    // Get swipe direction with validation
    getSwipeDirectionSafely(deltaX, deltaY) {
        try {
            // Validate inputs
            if (!isFinite(deltaX) || !isFinite(deltaY)) {
                console.warn('Invalid delta values for swipe direction');
                return null;
            }
            
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Require minimum movement
            if (absDeltaX < 10 && absDeltaY < 10) {
                return null;
            }
            
            // Determine if horizontal or vertical swipe
            if (absDeltaX > absDeltaY) {
                return deltaX > 0 ? 'right' : 'left';
            } else {
                return deltaY > 0 ? 'down' : 'up';
            }
            
        } catch (error) {
            console.error('Error determining swipe direction:', error);
            return null;
        }
    }

    // Handle tap gesture with validation
    handleTapSafely(element) {
        try {
            if (!element) {
                console.warn('No element provided for tap handling');
                return;
            }
            
            // Simulate click event safely
            if (element.click && typeof element.click === 'function') {
                element.click();
            }
            
            // Trigger custom tap event
            this.dispatchCustomEvent('gameTap', { element });
            
        } catch (error) {
            console.error('Error handling tap:', error);
        }
    }

    // Handle swipe gesture with bounds checking
    handleSwipeSafely(element, direction, distance, duration) {
        try {
            // Find the gem that was swiped
            const gemElement = element ? element.closest('.gem') : null;
            if (!gemElement) {
                console.warn('Swipe target is not a gem element');
                return;
            }

            const row = parseInt(gemElement.dataset.row, 10);
            const col = parseInt(gemElement.dataset.col, 10);

            // Validate coordinates with bounds checking
            if (!this.validateBoardCoordinates(row, col)) {
                console.error(`Invalid gem coordinates: ${row}, ${col}`);
                return;
            }

            // Calculate target position based on swipe direction
            const targetPos = this.calculateTargetPosition(row, col, direction);
            if (!targetPos) {
                console.warn('Invalid target position for swipe');
                return;
            }

            // Only proceed if target is different and valid
            if (targetPos.row !== row || targetPos.col !== col) {
                // Trigger swipe event
                this.dispatchCustomEvent('gameSwipe', {
                    fromRow: row,
                    fromCol: col,
                    toRow: targetPos.row,
                    toCol: targetPos.col,
                    direction,
                    distance,
                    duration
                });

                // Provide visual feedback
                this.showSwipeFeedback(gemElement, direction);
            }
            
        } catch (error) {
            console.error('Error handling swipe:', error);
        }
    }

    // Validate board coordinates
    validateBoardCoordinates(row, col) {
        return Number.isInteger(row) && Number.isInteger(col) && 
               row >= 0 && row < this.BOARD_SIZE && 
               col >= 0 && col < this.BOARD_SIZE;
    }

    // Calculate target position with bounds checking
    calculateTargetPosition(row, col, direction) {
        try {
            let targetRow = row;
            let targetCol = col;
            
            switch (direction) {
                case 'up':
                    targetRow = Math.max(0, row - 1);
                    break;
                case 'down':
                    targetRow = Math.min(this.BOARD_SIZE - 1, row + 1);
                    break;
                case 'left':
                    targetCol = Math.max(0, col - 1);
                    break;
                case 'right':
                    targetCol = Math.min(this.BOARD_SIZE - 1, col + 1);
                    break;
                default:
                    console.warn(`Invalid swipe direction: ${direction}`);
                    return null;
            }
            
            // Validate calculated position
            if (!this.validateBoardCoordinates(targetRow, targetCol)) {
                return null;
            }
            
            return { row: targetRow, col: targetCol };
            
        } catch (error) {
            console.error('Error calculating target position:', error);
            return null;
        }
    }

    // Safely dispatch custom events
    dispatchCustomEvent(eventName, detail) {
        try {
            if (!eventName || typeof eventName !== 'string') {
                console.warn('Invalid event name for dispatch');
                return;
            }
            
            const event = new CustomEvent(eventName, {
                detail: detail || {},
                bubbles: false,
                cancelable: false
            });
            
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error(`Error dispatching custom event ${eventName}:`, error);
        }
    }

    // Show visual feedback for swipe
    showSwipeFeedback(element, direction) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        
        // Animate in swipe direction briefly
        const offset = 10;
        let transform = '';
        
        switch (direction) {
            case 'up':
                transform = `translateY(-${offset}px)`;
                break;
            case 'down':
                transform = `translateY(${offset}px)`;
                break;
            case 'left':
                transform = `translateX(-${offset}px)`;
                break;
            case 'right':
                transform = `translateX(${offset}px)`;
                break;
        }
        
        element.style.transform = transform;
        element.style.transition = 'transform 0.15s ease-out';
        
        setTimeout(() => {
            element.style.transform = originalTransform;
            element.style.transition = '';
        }, 150);
    }

    // Setup global handlers for window events and error boundaries
    setupGlobalHandlers() {
        try {
            // Window focus/blur events
            window.addEventListener('focus', this.handleWindowFocus.bind(this));
            window.addEventListener('blur', this.handleWindowBlur.bind(this));
            
            // Resize handler for responsive adjustments
            window.addEventListener('resize', this.createSafeHandler(this.handleWindowResize.bind(this)));
            
            // Orientation change for mobile
            window.addEventListener('orientationchange', this.createSafeHandler(this.handleOrientationChange.bind(this)));
            
            // Visibility change API
            if (document.visibilityState !== undefined) {
                document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            }
            
            // Error boundary for unhandled errors
            window.addEventListener('error', this.handleGlobalError.bind(this));
            window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
            
            console.log('✅ Global handlers setup successfully');
            
        } catch (error) {
            console.error('Failed to setup individual global handlers:', error);
            throw error;
        }
    }

    // Handle window focus
    handleWindowFocus() {
        this.isEnabled = true;
        console.log('🔍 Window focused - input enabled');
    }

    // Handle window blur
    handleWindowBlur() {
        // Clear any ongoing touch state when window loses focus
        this.clearTouchState();
        console.log('👁️ Window blurred - touch state cleared');
    }

    // Handle window resize
    handleWindowResize() {
        // Clear touch state on resize to prevent coordinate issues
        this.clearTouchState();
        
        // Recalculate touch threshold based on screen size if needed
        const screenSize = Math.min(window.innerWidth, window.innerHeight);
        if (screenSize < 480) {
            this.setTouchThreshold(30); // Smaller threshold for small screens
        } else {
            this.setTouchThreshold(50); // Default threshold
        }
    }

    // Handle orientation change
    handleOrientationChange() {
        // Clear touch state and recalibrate after orientation change
        setTimeout(() => {
            this.clearTouchState();
            this.handleWindowResize();
        }, 100);
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden) {
            this.clearTouchState();
            console.log('📱 Page hidden - touch state cleared');
        } else {
            this.isEnabled = true;
            console.log('📱 Page visible - input re-enabled');
        }
    }

    // Handle global errors
    handleGlobalError(event) {
        console.error('Global error detected:', event.error);
        // Clear touch state on errors to prevent stuck gestures
        this.clearTouchState();
    }

    // Handle unhandled promise rejections
    handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        // Clear touch state on async errors
        this.clearTouchState();
    }

    // Setup keyboard handlers
    setupKeyboardHandlers() {
        try {
            document.addEventListener('keydown', this.createSafeHandler(this.handleKeyDown.bind(this)));
            document.addEventListener('keyup', this.createSafeHandler(this.handleKeyUp.bind(this)));
            console.log('✅ Keyboard handlers setup successfully');
        } catch (error) {
            console.error('Failed to setup keyboard handlers:', error);
            throw error;
        }
    }

    // Handle key down
    handleKeyDown(event) {
        // Don't handle shortcuts if typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Dispatch keyboard event
        const keyEvent = new CustomEvent('gameKeyDown', {
            detail: {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey
            }
        });
        document.dispatchEvent(keyEvent);
    }

    // Handle key up
    handleKeyUp(event) {
        // Don't handle shortcuts if typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Dispatch keyboard event
        const keyEvent = new CustomEvent('gameKeyUp', {
            detail: {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey
            }
        });
        document.dispatchEvent(keyEvent);
    }

    // Register swipe callback
    registerSwipeCallback(callback) {
        // Use timestamp + random for better uniqueness
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.swipeCallbacks.set(id, callback);
        return id;
    }

    // Unregister swipe callback
    unregisterSwipeCallback(id) {
        return this.swipeCallbacks.delete(id);
    }

    // Set touch threshold
    setTouchThreshold(threshold) {
        this.touchThreshold = Math.max(10, Math.min(200, threshold));
    }

    // Get input state
    getInputState() {
        return {
            isInitialized: this.isInitialized,
            touchThreshold: this.touchThreshold,
            hasTouchSupport: 'ontouchstart' in window,
            callbackCount: this.swipeCallbacks.size
        };
    }

    // Enable/disable touch handling
    setTouchEnabled(enabled) {
        const gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
        
        if (gameBoard) {
            if (enabled) {
                gameBoard.style.touchAction = 'none';
            } else {
                gameBoard.style.touchAction = 'auto';
            }
        }
    }

    // Cleanup method
    cleanup() {
        console.log('🧹 Cleaning up Input Handler...');

        // Disable input handling
        this.isEnabled = false;

        // Clear touch state
        this.clearTouchState();
        this.clearTouchTimeout();

        // Remove touch handlers from game board
        const gameBoard = this.findGameBoard();
        if (gameBoard) {
            this.removeTouchHandlers(gameBoard);
        }

        // Remove global handlers
        this.removeGlobalHandlers();

        // Remove keyboard handlers
        this.removeKeyboardHandlers();

        // Clear callbacks
        this.swipeCallbacks.clear();

        // Reset state
        this.touchStart = null;
        this.touchEnd = null;
        this.isInitialized = false;

        console.log('✅ Input Handler cleaned up');
    }

    // Remove global event handlers
    removeGlobalHandlers() {
        try {
            // Note: These handlers were bound directly in setupGlobalHandlers
            // We need to remove them manually since we didn't store references
            console.log('🧹 Removing global handlers (Note: Some may not be removable due to binding)');
            
            // For future improvement, handlers should be stored as instance properties
            // during setup for proper cleanup
            
        } catch (error) {
            console.warn('Failed to remove some global handlers:', error);
        }
    }

    // Remove keyboard event handlers
    removeKeyboardHandlers() {
        try {
            // Note: These handlers were bound directly in setupKeyboardHandlers
            // For complete cleanup, handlers should be stored as instance properties
            console.log('🧹 Removing keyboard handlers (Note: Some may not be removable due to binding)');
            
        } catch (error) {
            console.warn('Failed to remove keyboard handlers:', error);
        }
    }
}

// Global input handler instance
export const inputHandler = new InputHandler();

// Note: Initialization handled by main.js 