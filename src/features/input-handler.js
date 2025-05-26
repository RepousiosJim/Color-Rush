// Input Handler Module
// Handles touch gestures, swipe controls, and mobile input

export class InputHandler {
    constructor() {
        this.touchStart = null;
        this.touchEnd = null;
        this.touchThreshold = 50;
        this.isInitialized = false;
        this.swipeCallbacks = new Map();
    }

    // Initialize input handler
    initialize() {
        try {
            this.setupTouchHandlers();
            this.setupKeyboardHandlers();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Input Handler:', error);
            return false;
        }
    }

    // Setup touch and swipe handlers
    setupTouchHandlers() {
        const gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
        
        if (gameBoard) {
            // Touch events for swipe gestures
            gameBoard.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            gameBoard.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            gameBoard.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }

        // Prevent default touch behaviors for better game experience
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.game-board, .game-interface')) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-board, .game-interface')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Handle touch start
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStart = {
                x: touch.clientX,
                y: touch.clientY,
                element: event.target,
                timestamp: Date.now()
            };
        }
    }

    // Handle touch move
    handleTouchMove(event) {
        event.preventDefault();
        
        if (!this.touchStart || event.touches.length !== 1) return;
        
        const touch = event.touches[0];
        this.touchEnd = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };
    }

    // Handle touch end
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (!this.touchStart) return;
        
        const touch = event.changedTouches[0];
        this.touchEnd = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };
        
        this.processTouch();
        this.touchStart = null;
        this.touchEnd = null;
    }

    // Process touch gesture
    processTouch() {
        if (!this.touchStart || !this.touchEnd) return;
        
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = this.touchEnd.timestamp - this.touchStart.timestamp;
        
        // Check if it's a tap (short distance, quick duration)
        if (distance < this.touchThreshold && duration < 300) {
            this.handleTap(this.touchStart.element);
            return;
        }
        
        // Check if it's a swipe (sufficient distance)
        if (distance >= this.touchThreshold) {
            const direction = this.getSwipeDirection(deltaX, deltaY);
            if (direction) {
                this.handleSwipe(this.touchStart.element, direction, distance, duration);
            }
        }
    }

    // Get swipe direction
    getSwipeDirection(deltaX, deltaY) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Determine if horizontal or vertical swipe
        if (absDeltaX > absDeltaY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    // Handle tap gesture
    handleTap(element) {
        // Simulate click event
        if (element && element.click) {
            element.click();
        }
        
        // Trigger tap event
        const event = new CustomEvent('gameTap', {
            detail: { element }
        });
        document.dispatchEvent(event);
    }

    // Handle swipe gesture
    handleSwipe(element, direction, distance, duration) {
        // Find the gem that was swiped
        const gemElement = element.closest('.gem');
        if (!gemElement) return;
        
        const row = parseInt(gemElement.dataset.row, 10);
        const col = parseInt(gemElement.dataset.col, 10);
        
        if (isNaN(row) || isNaN(col)) return;
        
        // Calculate target position based on swipe direction
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
        }
        
        // Only proceed if target is different
        if (targetRow !== row || targetCol !== col) {
            // Trigger swipe event
            const swipeEvent = new CustomEvent('gameSwipe', {
                detail: {
                    fromRow: row,
                    fromCol: col,
                    toRow: targetRow,
                    toCol: targetCol,
                    direction,
                    distance,
                    duration
                }
            });
            document.dispatchEvent(swipeEvent);
            
            // Provide visual feedback
            this.showSwipeFeedback(gemElement, direction);
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

    // Setup keyboard handlers
    setupKeyboardHandlers() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
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
}

// Global input handler instance
export const inputHandler = new InputHandler();

// Note: Initialization handled by main.js 