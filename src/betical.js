import letters from './letters.js';
import newLineSound from './assets/new-line.mp3';
import spaceSound from './assets/type-2.mp3';
import typeSound1 from './assets/type-1.mp3';
import typeSound2 from './assets/type-3.mp3';
import typeSound3 from './assets/type-4.mp3';
import typeSound4 from './assets/type-5.mp3';

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
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.lastTypeSound = -1;
    this.letterWidth = 20;
    this.letterHeight = 20;
  }

  connectedCallback() {
    this.render();

    this.container = this.shadowRoot.querySelector('#container');
    this.hint = this.shadowRoot.querySelector('#hint');
    this.input = this.shadowRoot.querySelector('#input');

    if (this.isMobile) {
      // give hint to user to touch screen first to focus input
      this.hint.textContent = 'Touch...';
      // if mobile, focus input to show keyboard
      window.addEventListener('touchstart', () => {
        if (this.input && this.input !== document.activeElement) {
          this.input.focus();
        }
      });

    }

    // attach events
    document.addEventListener('keydown', (e) => {
      this.onKeydown(e);
    });
  }

  hideHint() {
    if (this.hint.style.opacity !== 0) {
      this.hint.style.opacity = '0';
    }
  }

  insertParagraphBreak() {
    const breakSpanElement = document.createElement('div');
    breakSpanElement.className = 'paragraph-break;'

    // random spacing
    const paddingTop = Math.random() * 24 + 12;
    breakSpanElement.style.paddingTop = `${paddingTop}px`

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
    imgElement.src = letters[letter];

    // randomize styles
    const opacity = Math.random() * .4 + .6;
    const top = Math.random() * 4;
    imgElement.style.width = `${this.letterWidth}px`;
    imgElement.style.height = `${this.letterHeight}px`;
    imgElement.style.opacity = `${opacity}`
    imgElement.style.top = `${top}px`;

    this.container.append(imgElement);
  }

  onKeydown(e) {
    // stops autoplay for mobile
    if (this.isRunning) {
      this.stop();
    }

    // ignore any non-alphanumeric keys
    const keyCode = e.keyCode || e.which;
    const isAlphaNumericKey = (keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90);
    const isSpace = e.key === ' ';
    const isEnter = e.key === 'Enter';
    const isEscape = e.key === 'Escape';
    const isBackspace = e.key === 'Backspace';
    if (!isAlphaNumericKey && !isSpace && !isEnter && !isEscape && !isBackspace) {
      return;
    }

    // make sure hint is gone
    this.hideHint();

    switch (e.key) {
      case 'Backspace':
        this.removeLastLetter();
        this.playTypeSound();
        break;
      case 'Enter':
        this.insertParagraphBreak();
        this.playNewLineSound();
        break;
      case 'Escape':
        this.stop();
        setTimeout(() => {
          this.container.innerHTML = '';
        }, 200); // needs time for update to stop
        this.playNewLineSound();
        break;
      case ' ':
        this.insertSpace();
        this.playSpaceSound();
        break;
      default:
        this.insertLetter(Math.floor(Math.random() * letters.length));
        this.playTypeSound();
        break;
    }

    // scroll window to bottom to avoid going out of view
    this.scrollToBottom();
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

  removeLastLetter() {
    this.container.lastChild.remove();
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
      color: rgba(0,0,0,.1);
      font-family: monospace;
      font-size: 20px;
      left: 20px;
      line-height: 1;
      pointer-events: none;
      position: absolute;
      text-align: center;
      text-transform: uppercase;
      top: 0;
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
    #input {
      // display: none;
      font-size: 16px;
      opacity: 0;
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
      ${['B', 'E', 'T', 'I', 'C', 'A', 'L'].map(letter => {
      // randomization
      const marginTop = Math.random() * 6;
      const fontSize = (Math.random() * 6) + 24;
      return `<span style="margin-top: ${marginTop}px; font-size: ${fontSize}px;">${letter}</span>`
    }).join('')}
    </h1>
    <section id="betical">
      <span id="container"></span>
      <span id="cursor"></span>
      <span id="hint">Type...</span>
      <input id="input" type="text" />
    </section>
  `;
  }

  scrollToBottom() {
    const scrollingElement = document.scrollingElement || document.body;
    const windowHeight = window.innerHeight;
    window.scrollTo({
      top: scrollingElement.scrollHeight - windowHeight,
      behavior: 'smooth'
    });
  }
}
window.customElements.define('bet-ical', Betical);