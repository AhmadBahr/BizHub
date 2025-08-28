import { useEffect, useRef, useCallback } from 'react';

export interface AccessibilityOptions {
  skipToContent?: boolean;
  announceChanges?: boolean;
  focusTrap?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const containerRef = useRef<HTMLElement>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  // Focus trap for modal dialogs
  const setupFocusTrap = useCallback(() => {
    if (!options.focusTrap || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options.focusTrap, getFocusableElements]);

  // Announce changes to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after it's been read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [options.announceChanges]);

  // Skip to content functionality
  const setupSkipToContent = useCallback(() => {
    if (!options.skipToContent) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, [options.skipToContent]);

  // Keyboard navigation helpers
  const handleArrowNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (direction) {
      case 'down':
      case 'right':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'up':
      case 'left':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      default:
        return;
    }

    focusableElements[nextIndex]?.focus();
  }, [getFocusableElements]);

  // ARIA utilities
  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement, descriptionId: string) => {
    element.setAttribute('aria-describedby', descriptionId);
  }, []);

  const setAriaExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  }, []);

  const setAriaPressed = useCallback((element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  }, []);

  const setAriaSelected = useCallback((element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }, []);

  const setAriaHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString());
  }, []);

  // Focus management
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();
  }, [getFocusableElements]);

  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    focusableElements[focusableElements.length - 1]?.focus();
  }, [getFocusableElements]);

  const focusElement = useCallback((element: HTMLElement) => {
    element.focus();
  }, []);

  // Initialize accessibility features
  useEffect(() => {
    setupSkipToContent();
    const cleanupFocusTrap = setupFocusTrap();

    return () => {
      cleanupFocusTrap?.();
    };
  }, [setupSkipToContent, setupFocusTrap]);

  return {
    containerRef,
    announceToScreenReader,
    handleArrowNavigation,
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaPressed,
    setAriaSelected,
    setAriaHidden,
    focusFirstElement,
    focusLastElement,
    focusElement,
    getFocusableElements,
  };
};
