const KEY_TO_INPUT = Object.freeze({
  KeyW: 'throttle', KeyS: 'brake', KeyA: 'turnRight', KeyD: 'turnLeft', Space: 'nitro',
});

export class InputController {
  #input = { throttle: false, brake: false, turnLeft: false, turnRight: false, climb: false, descend: false, nitro: false };

  constructor({ onInput, onPointer, onFire }) {
    this.onInput = onInput;
    this.onPointer = onPointer;
    this.onFire = onFire;
    window.addEventListener('keydown', (event) => this.#update(event, true));
    window.addEventListener('keyup', (event) => this.#update(event, false));
    window.addEventListener('blur', () => this.#clear());
    window.addEventListener('pointermove', (event) => this.#pointerMove(event));
    window.addEventListener('pointerdown', (event) => {
      if (event.target.closest?.('[data-input], [data-action]')) return;
      if (event.pointerType === 'mouse' && event.button === 0) onFire();
    });
    window.addEventListener('contextmenu', (event) => event.preventDefault());
    this.#bindTouchButtons();
  }

  #update(event, isPressed) {
    const field = KEY_TO_INPUT[event.code];
    if (!field || this.#input[field] === isPressed) return;
    event.preventDefault();
    this.#input[field] = isPressed;
    this.onInput({ ...this.#input });
  }

  #clear() {
    if (!Object.values(this.#input).some(Boolean)) return;
    this.#input = { throttle: false, brake: false, turnLeft: false, turnRight: false, climb: false, descend: false, nitro: false };
    this.onInput({ ...this.#input });
  }

  #pointerMove(event) {
    if (event.target.closest?.('[data-input], [data-action]')) return;
    this.onPointer(event.clientX, event.clientY);
    if (event.pointerType !== 'mouse') return;
    const threshold = window.innerHeight * 0.13;
    const offset = event.clientY - window.innerHeight / 2;
    this.#setVerticalIntent(offset < -threshold, offset > threshold);
  }

  #setVerticalIntent(climb, descend) {
    if (this.#input.climb === climb && this.#input.descend === descend) return;
    this.#input.climb = climb;
    this.#input.descend = descend;
    this.onInput({ ...this.#input });
  }

  #bindTouchButtons() {
    document.querySelectorAll('[data-input]').forEach((button) => {
      const field = button.dataset.input;
      const release = (event) => { event.preventDefault(); this.#set(field, false); };
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.#set(field, true);
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    });
    document.querySelectorAll('[data-action="fire"]').forEach((button) => {
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); this.onFire(); });
    });
  }

  #set(field, isPressed) {
    if (!Object.hasOwn(this.#input, field) || this.#input[field] === isPressed) return;
    this.#input[field] = isPressed;
    this.onInput({ ...this.#input });
  }
}
