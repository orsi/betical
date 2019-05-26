import base64Letters from './letters.js';
import newLineSound from './assets/new-line.mp3';
import spaceSound from './assets/type-2.mp3';
import typeSound1 from './assets/type-1.mp3';
import typeSound2 from './assets/type-3.mp3';
import typeSound3 from './assets/type-4.mp3';
import typeSound4 from './assets/type-5.mp3';
const audioSources = {
  newLine: newLineSound,
  space: spaceSound,
  type: [
    typeSound1,
    typeSound2,
    typeSound3,
    typeSound4,
  ]
};

export class Betical extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.poem = this.generatePoem(5, 15);
    this.debug = false;
    this.currentParagraphIndex = 0;
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.running = false;
    this.minLetterDelay = 200;
    this.maxLetterDelay = 500;
    this.lastTypeSound = -1;
    this.letterWidth = 20;
    this.letterHeight = 20;
    this.lastFrameTime = new Date().getTime();
    this.accumulator = 0;
    this.fps = 60;
    this.frameRate = 1000 / this.fps;
    this.sinceLastUpdate = 0;
    this.nextUpdateIn = 0;
  }

  connectedCallback() {
    this.render();
    this.titleElement = this.shadowRoot.querySelector('#betical-title');
    this.hint = this.shadowRoot.querySelector('#hint');
    this.startButton = this.shadowRoot.querySelector('#betical-start');
    this.stopButton = this.shadowRoot.querySelector('#betical-stop');
    this.resetButton = this.shadowRoot.querySelector('#betical-reset');
    this.beticalContainer = this.shadowRoot.querySelector('#betical-container');

    // setup first paragraph/word
    this.currentParagraphElement = this.createParagraphElement(this.beticalContainer);
    this.currentWordElement = this.createWordElement(this.currentParagraphElement);

    // attach events
    if (this.debug) {
      this.startButton.addEventListener('click', () => {
        this.start();
      });
      this.stopButton.addEventListener('click', () => {
        this.stop();
      });
      this.resetButton.addEventListener('click', () => {
        this.reset();
      });
    } else {
      this.addEventListener('click', () => {
        if (!this.running) {
          this.start();
          this.hint.style.opacity = 0;
        }
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
    :host {
      display: block;
      padding: 36px;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      background-color: #f5f5f5;
    }
    #betical-title {
      font-family: sans-serif;
      font-weight: 300;
      text-transform: uppercase;
      color: rgba(0,0,0,.2);
    }
    #hint {
      font-size: 14px;
      font-weight: 900;
      margin-left: 24px;
      transition: opacity .6s ease-in;
    }
    .debug {
      ${this.debug ? 'display: block;' : 'display: none;'}
    }
    #betical-start,
    #betical-stop,
    #betical-reset {
      display: inline-block;
      margin: 0 auto 36px auto;
      width: 300px;
      height: 80px;
      color: rgba(0,0,0,.5);
      border: 1px solid rgba(0,0,0,.2);
      outline: none;
      background: none;
      cursor: pointer;
    }
    #betical-container {
    }
    .paragraph {
      position: relative;
      margin-bottom: 48px;
      white-space: pre-line;
    }
    .word {
      position: relative;
      height: 24px;
      display: inline;
      vertical-align: top;
    }
    .letter {
      position: relative;
      display: inline-block;
    }
    </style>
    <h1 id="betical-title">
      Betical
      <span id="hint">Click to start</span>
    </h1>
    <div class="debug">
      <button id="betical-start">Start</button>
      <button id="betical-stop">Stop</button>
      <button id="betical-reset">Reset</button>
    </div>
    <section id="betical-container"></section>
  `;
  }

  start() {
    this.running = true;

    // reset last update to avoid catch up on resume
    this.lastFrameTime = new Date().getTime();

    this.run();
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.currentParagraphIndex = 0;
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.nextUpdateIn = 0;
    this.beticalContainer.innerHTML = '';
    // setup first paragraph/word
    this.currentParagraphElement = this.createParagraphElement(this.beticalContainer);
    this.currentWordElement = this.createWordElement(this.currentParagraphElement);
  }


  run() {
    const now = new Date().getTime();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.accumulator += delta;
    while (this.accumulator >= this.frameRate) {
      this.update(this.frameRate);
      this.accumulator -= this.frameRate;
    }

    if (this.running) {
      requestAnimationFrame(() => this.run());
    }
  }

  update (time) {
    this.sinceLastUpdate += time;
    let didUpdate = false;

    if (this.sinceLastUpdate >= this.nextUpdateIn) {
      if (this.poem[this.currentParagraphIndex]) {
        // same paragraph

        if (this.poem[this.currentParagraphIndex][this.currentWordIndex]) {
          // same word

          const nextLetter = this.poem[this.currentParagraphIndex][this.currentWordIndex][this.currentLetterIndex];
          if (nextLetter) {
            // new letter
            didUpdate = true;
            this.currentLetterIndex++;
            this.createLetterElement(this.currentWordElement, nextLetter);
            this.playTypeSound();
          } else {
            // no letters, end of word
            didUpdate = true;
            this.currentLetterIndex = 0;
            this.currentWordIndex++;
            this.currentWordElement = this.createWordElement(this.currentParagraphElement);
            this.playSpaceSound();
          }
        } else {
          // no words, end of paragraph
          this.currentWordIndex = 0;
          this.currentParagraphIndex++;
          this.currentParagraphElement = this.createParagraphElement(this.beticalContainer);
          this.playNewLineSound();
        }
      } else {
        // no more paragraphs, no more poem
        this.stop();
        this.playNewLineSound();
      }

      if (didUpdate) {
          // figure out next update
          this.nextUpdateIn = Math.random() * (this.maxLetterDelay - this.minLetterDelay) + this.minLetterDelay;
          this.sinceLastUpdate = 0;
      }
    }
  }

  generatePoem(min, max) {
    const poem = [];
    // Calculates a random amount of paragraphs between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      poem.push(this.generateParagraph(5, 20));
    }
    return poem;
  }

  generateParagraph(min, max) {
    const paragraph = [];
    // Calculates a random amount of words between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      paragraph.push(this.generateWord(2, 12));
    }
    return paragraph;
  }

  generateWord(min, max) {
    var word = [];
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      var letterIndex = Math.floor(Math.random() * base64Letters.length);
      word.push(letterIndex);
    }
    return word;
  }

  createParagraphElement(container) {
    const paragraphElement = document.createElement('p');
    paragraphElement.className = 'paragraph';

    // randomize styles
    const marginBottom = Math.random() * 24 + 12;
    paragraphElement.style.marginBottom = `${marginBottom}px`

    container.append(paragraphElement);
    return paragraphElement;
  }

  createWordElement(container) {
    const wordElement = document.createElement('span');
    wordElement.className = 'word';

    // randomize styles
    const marginRight = Math.random() * 12 + 10;
    wordElement.style.marginRight = `${marginRight}px`

    container.append(wordElement);
    return wordElement;
  }

  createLetterElement(container, letter) {
    const imgElement = document.createElement('img');
    imgElement.className = 'letter';
    imgElement.src = base64Letters[letter];

    // randomize styles
    const opacity = Math.random() * .4 + .6;
    const top = Math.random() * 4;
    imgElement.style.width = `${this.letterWidth}px`
    imgElement.style.height = `${this.letterHeight}px`;
    imgElement.style.opacity = `${opacity}`
    imgElement.style.top = `${top}px`;

    container.append(imgElement);
    return imgElement;
  }


  playNewLineSound() {
    new Audio(audioSources.newLine).play();
  }

  playSpaceSound() {
    new Audio(audioSources.space).play();
  }
  playTypeSound() {
    let nextTypeSound = Math.floor(Math.random() * audioSources.type.length);
    while (nextTypeSound === this.lastTypeSound) {
      nextTypeSound = Math.floor(Math.random() * audioSources.type.length);
    }
    this.lastTypeSound = nextTypeSound;
    const src = audioSources.type[nextTypeSound];
    new Audio(src).play();
  }
}
window.customElements.define('bet-ical', Betical);