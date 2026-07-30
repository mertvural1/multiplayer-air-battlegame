export class Sounds {
  #context = null;

  fire() { this.#tone(170, 0.06, 'square', 0.035); }
  explosion() { this.#tone(72, 0.32, 'sawtooth', 0.08); }

  #tone(frequency, duration, type, volume) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.#context ??= new AudioContext();
    if (this.#context.state === 'suspended') this.#context.resume();
    const oscillator = this.#context.createOscillator();
    const gain = this.#context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.#context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.35), this.#context.currentTime + duration);
    gain.gain.setValueAtTime(volume, this.#context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.#context.currentTime + duration);
    oscillator.connect(gain).connect(this.#context.destination);
    oscillator.start();
    oscillator.stop(this.#context.currentTime + duration);
  }
}
