import base64Letters from './letters.js';
const audioSources = {
  newLine: './new-line.mp3',
  type: [
    './type-1.mp3',
    './type-2.mp3',
    './type-3.mp3',
    './type-4.mp3',
    './type-5.mp3'
  ]
};

const userInteractionEvents = [
  'click',
  'touchmove',
  'focus'
];

class Betical extends HTMLElement {
  hasUserInteracted = false;
  poem;
  currentParagraphIndex = 0;
  currentWordIndex = 0;
  currentLetterIndex = 0;
  beticalContainer;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.poem = this.generatePoem(5, 15);
  }

  connectedCallback() {
    this.render();
    this.beticalContainer = document.querySelector('.betical-container');

    // user must interact with page before sound will play
    userInteractionEvents.forEach((eventName)=>{
      window.addEventListener(eventName, () => {
        if(!this.hasUserInteracted){
          this.hasUserInteracted = true;
          this.start();
        }
      });
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
    :host {
      display: block;
      padding: 36px;
    }

    .betical-button {
      display: block;
      margin: 0 auto 36px auto;
      width: 300px;
      height: 80px;
      color: rgba(0,0,0,.5);
      border: 1px solid rgba(0,0,0,.2);
      outline: none;
      background: none;
      cursor: pointer;
    }

    .betical-container {

    }

    .paragraph {
      margin-bottom: 48px;
    }
    .poem {
      margin: 0 auto;
      max-width: 600px;
    }
    .word {
      display: inline-block;
      margin-right: 16px;
    }
    </style>
    <button class="betical-button">Betical</button>
    <section class="betical-container"></section>
  `;
  }

  start() {
    console.log(this);
    if (!this.hasUserInteracted) {
      // try to play audio to see if user has interacted
      // with the page yet
      const audioPromise = audioSources.newLine.play();
      if (audioPromise) {
        audioPromise.catch((error) => {
          setTimeout(() => this.start(), 500);
        });
      }
    } else {
      this.running = true;
      this.typePoem();
    }
  }
  stop() {
    this.running = false;
  }

  typePoem() {
    let nextLetter;
    if (this.poem[this.currentParagraphIndex]) {
      if (this.poem[this.currentParagraphIndex][this.currentWordIndex]) {
        nextLetter =this.poem[this.currentParagraphIndex][this.currentWordIndex][this.currentLetterIndex];
        if (nextLetter) {
          this.typeLetter(this.shadowRoot, nextLetter);
          this.currentLetterIndex++;
        } else {
          // end of word
          this.currentLetterIndex = 0;
          this.currentWordIndex++;
          this.typeSpace(this.shadowRoot);
        }
      } else {
        // end of paraphs
        this.currentWordIndex = 0;
        this.currentParagraphIndex++;
        this.typeNewLine(this.shadowRoot);
      }
    } else {
      // no more paragraphis, no more poem
      this.stop();
    }

    if (this.running) {
      const delay = (Math.random() * 200) + 300;
      setTimeout(() => this.typePoem(), delay);
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

  createParagraphElement() {
    const paragraphElement = document.createElement('p');
    paragraphElement.className = 'paragraph';
    return paragraphElement;
  }

  createWordElement() {
    const wordElement = document.createElement('span');
    wordElement.className = 'word';
    return wordElement;
  }

  createLetterElement(letter) {
    const imgElement = document.createElement('img');
    imgElement.src = base64Letters[letter];
    imgElement.style.width = '16px';
    imgElement.style.height = '16px';
    return imgElement;
  }

  playTypeSound() {
    const rand = Math.floor(Math.random() * audioSources.type.length);
    const src = audioSources.type[rand];
    const audioPromise = new Audio(src).play();
    if (audioPromise) {
      audioPromise.catch(function(error) { console.error(error); });
    }
  }

  playNewLineSound() {
    const src = audioSources.newLine;
    const audioPromise = new Audio(src).play();
    if (audioPromise) {
      audioPromise.catch(function(error) { console.error(error); });
    }
  }

  typeLetter($wordContainer, letter) {
    const letterHtml = this.createLetterElement(letter);
    $wordContainer.append(letterHtml);
    this.playTypeSound();
  }

  typeSpace($wordContainer) {
    const spanElement = document.createElement('span');
    spanElement.style.display = 'inline-block';
    spanElement.style.width = '16px'
    $wordContainer.append(spanElement);
    // this.playSpaceSound();
  }

  typeNewLine($wordContainer) {
    let brElement = document.createElement('br');
    $wordContainer.append(brElement);
    brElement = document.createElement('br');
    $wordContainer.append(brElement);
    this.playNewLineSound();
  }
}
window.customElements.define('bet-ical', Betical);