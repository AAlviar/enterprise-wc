// Access the global RenderLoop instance.
// When using the mixin on a real component, the `rl` property exists on the component instance.

// Supporting Components
import '../../ids-popup/ids-popup';
import '../../ids-text/ids-text';
import '../../ids-button/ids-button';
import renderLoop from '../ids-render-loop-global';
import IdsRenderLoopItem from '../ids-render-loop-item';

// Styles
import css from '../../../assets/css/ids-render-loop/test-flying-popup.css';

const cssLink = `<link href="${css}" rel="stylesheet">`;
(document.querySelector('head') as any).insertAdjacentHTML('afterbegin', cssLink);

// Setup functionality on page load
document.addEventListener('DOMContentLoaded', () => {
  const alignTargets = Array.from(document.querySelectorAll('.align-target'));
  let currentTarget = alignTargets[0];
  const popup: any = document.querySelector('ids-popup');
  const countdownEl = document.querySelector('#renderloop-countdown');
  const shiftDuration = 1000;
  let timer: any;

  /**
   * Takes a "current" alignment target and figures out the next one
   * @param {HTMLElement} target an element representing an alignment target
   * @returns {HTMLElement} the new element to target
   */
  function getNextTarget(target: any) {
    let newIndex = alignTargets.indexOf(target) + 1;
    if (newIndex >= alignTargets.length) {
      newIndex = 0;
    }
    return alignTargets[newIndex];
  }

  /**
   * Create a RenderLoopItem that constantly updates the timer that displays
   * the countdown until the next target change.
   * @returns {void}
   */
  function generateTimer() {
    if (timer) {
      timer.destroy(true);
    }
    timer = new IdsRenderLoopItem({
      duration: shiftDuration,
      id: 'timer-update',
      updateCallback() {
        (countdownEl as any).textContent = `${(shiftDuration - (this as any).elapsedTime).toFixed(0)}`;
      }
    });
    renderLoop.register(timer);
  }
  // Generate the first one to kick it off
  generateTimer();

  // Create a RenderLoopItem with infinite duration that runs its update callback
  // every 1s.  The callback causes the Popup to float to its next target.
  const popupMover = new IdsRenderLoopItem({
    duration: -1,
    id: 'popup-mover',
    updateDuration: shiftDuration,
    updateCallback() {
      // Change the target
      currentTarget = getNextTarget(currentTarget);
      popup.alignTarget = `#${currentTarget.id}`;
      generateTimer();
    }
  });
  renderLoop.register(popupMover);
});
