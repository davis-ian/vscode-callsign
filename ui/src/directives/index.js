// directives/index.js
/**
 * Central file to export all custom directives
 * This makes it easy to import multiple directives or register them globally
 */

import clickOutside from './clickOutside.js';
// Import other directives here as you create them
// import tooltip from './tooltip.js'
// import focus from './focus.js'

export {
    clickOutside,
    // tooltip,
    // focus,
};

// Export default object for easy global registration
export default {
    'click-outside': clickOutside,
    // 'tooltip': tooltip,
    // 'focus': focus,
};
