// directives/clickOutside.js
/**
 * Click Outside Directive for Vue 3
 *
 * Usage:
 * <div v-click-outside="handleClickOutside">Content</div>
 *
 * With options:
 * <div v-click-outside="{ handler: handleClickOutside, exclude: ['button-id'] }">
 *   Content
 * </div>
 */

const clickOutside = {
    beforeMount(el, binding) {
        // Store the click handler function
        el.clickOutsideEvent = function (event) {
            // Check if the clicked element is the element itself or its children
            if (el === event.target || el.contains(event.target)) {
                return;
            }

            // Handle both function and object binding values
            if (typeof binding.value === 'function') {
                // Simple function binding: v-click-outside="myFunction"
                binding.value(event);
            } else if (binding.value && typeof binding.value.handler === 'function') {
                // Object binding with options: v-click-outside="{ handler: myFunction, exclude: [...] }"
                const { handler, exclude = [] } = binding.value;

                // Check if clicked element should be excluded
                const shouldExclude = exclude.some(selector => {
                    if (typeof selector === 'string') {
                        // Handle ID selectors, class selectors, or element selectors
                        if (selector.startsWith('#')) {
                            return event.target.id === selector.slice(1) || event.target.closest(selector);
                        } else if (selector.startsWith('.')) {
                            return event.target.classList.contains(selector.slice(1)) || event.target.closest(selector);
                        } else {
                            return event.target.matches(selector) || event.target.closest(selector);
                        }
                    }
                    return false;
                });

                if (!shouldExclude) {
                    handler(event);
                }
            }
        };

        // Add the event listener
        document.addEventListener('click', el.clickOutsideEvent);
        document.addEventListener('touchstart', el.clickOutsideEvent);
    },

    unmounted(el) {
        // Clean up event listeners
        document.removeEventListener('click', el.clickOutsideEvent);
        document.removeEventListener('touchstart', el.clickOutsideEvent);
        delete el.clickOutsideEvent;
    },
};

export default clickOutside;
