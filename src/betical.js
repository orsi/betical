import base64Letters from './letters.js';
import newLineSound from './new-line.mp3';
import spaceSound from './type-2.mp3';
import typeSound1 from './type-1.mp3';
import typeSound2 from './type-3.mp3';
import typeSound3 from './type-4.mp3';
import typeSound4 from './type-5.mp3';

export class Betical extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.audioSources = {
      newLine: newLineSound,
      space: spaceSound,
      type: [
        typeSound1,
        typeSound2,
        typeSound3,
        typeSound4,
      ]
    };
    this.poem = this.generatePoem(2, 10);
    this.currentIndex = 0;
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.isRunning = false;
    this.lastFrameTime = new Date().getTime();
    this.lastTypeSound = -1;
    this.letterWidth = 20;
    this.letterHeight = 20;
    this.minLetterDelay = 200;
    this.maxLetterDelay = 500;
    this.accumulator = 0;
    this.fps = 60;
    this.frameRate = 1000 / this.fps;
    this.sinceLastUpdate = 0;
    this.nextUpdateIn = 0;
  }

  connectedCallback() {
    this.render();
    this.init();
  }

  generatePoem(min, max) {
    let poem = [];
    // calculates a random amount of paragraphs between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      var paragraph = this.generateParagraph(5, 20);
      poem = poem.concat(paragraph);
      if (i !== length -1) {
        poem.push('\r');
      }
    }
    return poem;
  }

  generateParagraph(min, max) {
    let paragraph = [];
    // calculates a random amount of words between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      var words = this.generateWord(2, 12);
      paragraph = paragraph.concat(words);
      if (i !== length -1) {
        paragraph.push(' ');
      }
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

  hideHint() {
    if (this.hint.style.opacity !== 0) {
      this.hint.style.opacity = '0';
    }
  }

  init() {
    this.container = this.shadowRoot.querySelector('#container');
    this.hint = this.shadowRoot.querySelector('#hint');

    // attach events
    document.addEventListener('keydown', (e) => {
      this.onKeydown(e);
    });
    document.addEventListener('keypress', (e) => {
      this.onKeypress(e);
    });

    if (this.isMobile) {

      // touching on mobile starts/stops
      this.addEventListener('touchstart', () => {
        // make sure hint is gone
        this.hideHint();

        if (this.isRunning) {
          this.stop();
        } else {
          this.playTypeSound();
          this.start();
        }
      });

      // hint
      this.hint.textContent = 'Touch';
    } else {
      // hint
      this.hint.textContent = 'Type...';
    }
  }

  insertParagraphBreak() {
    const breakSpanElement = document.createElement('div');
    breakSpanElement.className = 'paragraph-break;'

    // random margin
    const marginTop = Math.random() * 24 + 12;
    breakSpanElement.style.marginTop = `${marginTop}px`
    
    this.container.append(breakSpanElement);
  }

  insertSpace() {
    const spaceElement = document.createElement('span');
    spaceElement.className = 'space';

    // randomize styles
    const marginRight = Math.random() * 12 + 10;
    spaceElement.style.marginRight = `${marginRight}px`

    this.container.append(spaceElement);
  }

  insertLetter(letter) {
    const imgElement = document.createElement('img');
    imgElement.className = 'letter';
    imgElement.src = base64Letters[letter];

    // randomize styles
    const opacity = Math.random() * .4 + .6;
    const top = Math.random() * 4;
    imgElement.style.width = `${this.letterWidth}px`;
    imgElement.style.height = `${this.letterHeight}px`;
    imgElement.style.opacity = `${opacity}`
    imgElement.style.top = `${top}px`;

    this.container.append(imgElement);

    // scroll window to bottom to avoid going out of view
    this.scrollToBottom();
  }

  onKeypress(e) {
    if (this.isRunning) {
      this.stop();
    }

    if (this.currentIndex >= this.poem.length) {
      // no more poem
      return;
    }

    // make sure hint is gone
    this.hideHint();

    switch (this.poem[this.currentIndex]) {
      case ' ':
        // space
        this.insertSpace();
        this.playSpaceSound();
        break;
      case '\r':
        // new paragraph
        this.insertParagraphBreak();
        this.playNewLineSound();
        break;
      default:
        // letter
        this.insertLetter(this.poem[this.currentIndex]);
        this.playTypeSound();
        break;
    }
    this.currentIndex++;
  }

  onKeydown(e) {
    switch(e.key) {
      case 'Enter':
        // this.start();
        break;
      case 'Escape':
        this.stop();
        setTimeout(() => this.reset(), 200); // needs time for update to stop
        this.playNewLineSound();
        break;
      case ' ':
        break;
      default:
        break;
    }
  }

  playNewLineSound() {
    new Audio(this.audioSources.newLine).play();
  }

  playSpaceSound() {
    new Audio(this.audioSources.space).play();
  }

  playTypeSound() {
    let nextTypeSound = Math.floor(Math.random() * this.audioSources.type.length);
    while (nextTypeSound === this.lastTypeSound) {
      nextTypeSound = Math.floor(Math.random() * this.audioSources.type.length);
    }
    this.lastTypeSound = nextTypeSound;
    const src = this.audioSources.type[nextTypeSound];
    new Audio(src).play();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
    :host {
      background-color: #f5f5f5;
      box-sizing: border-box;
      display: block;
      min-height: 100%;
      padding: 0 16px;
      width: 100%;
    }
    #betical {
      position: relative;
      margin: 0 auto;
      max-width: 600px;
    }
    #container {
      vertical-align: top;
    }
    #container >  * {
      position: relative;
    }
    #cursor {
      animation: 1.2s blink step-end infinite;
      -webkit-animation: 1.2s blink step-end infinite;
      background-color: #444;
      cursor: text;
      display: inline-block;
      height: 20px;
      vertical-align: top;
      width: 10px;
    }
    #hint {
      top: 50%;
      color: rgba(0,0,0,.1);
      font-family: monospace;
      font-size: 36px;
      left: 50%;
      margin: 16px auto;
      pointer-events: none;
      position: fixed;
      text-align: center;
      text-transform: uppercase;
      transform: translate(-50%, -50%);
      transition: opacity 2s ease-out;
      width: 100%;
    }
    #title {
      font-family: Baskerville, serif;
      font-weight: 300;
      color: #444;
      margin: 0;
      padding: 16px 0;
      text-align: center;
    }
    #title > span {
      display: inline-block;
      vertical-align: top;
    }
    @keyframes 'blink' {
      from { background-color: #444; }
      49% { background-color: #444; }
      50% { background-color: transparent; }
      to { background-color: transparent; }
    }
    @-webkit-keyframes 'blink' {
      from { background-color: #444; }
      49% { background-color: #444; }
      50% { background-color: transparent; }
      to { background-color: transparent; }
    }
    </style>
    <h1 id="title">
      ${ ['B', 'E', 'T', 'I', 'C', 'A', 'L'].map(letter => {
        // randomization
        const marginTop = Math.random() * 6;
        const fontSize = (Math.random() * 6) + 24;
        return `<span style="margin-top: ${marginTop}px; font-size: ${fontSize}px;">${letter}</span>`
      }).join('') }
    </h1>
    <section id="betical">
      <span id="container"></span>
      <span id="cursor"></span>
    </section>
    <div id="hint"></div>
  `;
  }

  reset() {
    this.currentIndex = 0;
    this.nextUpdateIn = 0;
    this.container.innerHTML = '';
    this.poem = this.generatePoem(2, 10);
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

    if (this.isRunning) {
      requestAnimationFrame(() => this.run());
    }
  }

  scrollToBottom() {
    var scrollingElement = document.scrollingElement || document.body;
    window.scrollTo({
      top: scrollingElement.scrollHeight,
      behavior: 'smooth'
    });
  }

  start() {
    this.isRunning = true;

    // reset last update to avoid catch up on resume
    this.lastFrameTime = new Date().getTime();

    this.run();
  }

  stop() {
    this.isRunning = false;
  }

  update (time) {
    this.sinceLastUpdate += time;
    let didUpdate = false;

    if (this.sinceLastUpdate >= this.nextUpdateIn) {
      if (this.currentIndex >= this.poem.length) {
        // end of poem
        this.stop();
        this.playNewLineSound();
      } else {
        switch (this.poem[this.currentIndex]) {
          case ' ':
            // space
            didUpdate = true;
            this.insertSpace();
            this.playSpaceSound();
            break;
          case '\r':
            // new paragraph
            didUpdate = true;
            this.insertParagraphBreak();
            this.playNewLineSound();
            break;
          default:
            // letter
            didUpdate = true;
            this.insertLetter(this.poem[this.currentIndex]);
            this.playTypeSound();
            break;
        }
        this.currentIndex++;
      }

      if (didUpdate) {
          // figure out next update
          this.nextUpdateIn = Math.random() * (this.maxLetterDelay - this.minLetterDelay) + this.minLetterDelay;
          this.sinceLastUpdate = 0;
      }
    }
  }



}
window.customElements.define('bet-ical', Betical);