export interface DissolveOptions {
  duration?: number;
  onComplete?: () => void;
}

/**
 * Dissolves an element with a smooth blur and scale-down transition
 * before removing it or invoking onComplete.
 */
export function dissolve(element: HTMLElement, options: DissolveOptions = {}) {
  const { duration = 200, onComplete } = options;

  if (typeof element.animate === "function") {
    const animation = element.animate(
      [
        { opacity: 1, filter: "blur(0px)", transform: "scale(1)" },
        { opacity: 0, filter: "blur(8px)", transform: "scale(0.96)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      }
    );

    animation.onfinish = () => {
      onComplete?.();
    };
  } else {
    onComplete?.();
  }
}
