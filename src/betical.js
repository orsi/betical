import base64Letters from './letters.js';
const audioService = {
  newLine: new Audio('./new-line.mp3'),
  type: [
    new Audio('./type-1.mp3'),
    new Audio('./type-2.mp3'),
    new Audio('./type-3.mp3'),
    new Audio('./type-4.mp3'),
    new Audio('./type-5.mp3')
  ]
};

const componentStyles = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #fafafa;
  }
  h1 {
    font-family: serif;
    text-align: center;
    font-weight: 300;
  }
  p {
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
`;
class Betical extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    let html = '';
    html += `
      <style>
        ${componentStyles}
      </style>
      <h1>Betical</h1>
      <section class="poem">
    `;
    const poem = this.createPoem(5, 15);
    html += this.getPoemHtml(poem, '');
    this.shadowRoot.innerHTML = html;
  }

  createPoem(min, max) {
    const poem = [];
    // Calculates a random amount of paragraphs between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      poem.push(this.createParagraph(5, 20));
    }
    return poem;
  }

  createParagraph(min, max) {
    const paragraph = [];
    // Calculates a random amount of words between min and max
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      paragraph.push(this.createWord(2, 12));
    }
    return paragraph;
  }

  createWord(min, max) {
    var word = [];
    var length = Math.floor(Math.random() * (max - min)) + min;
    for (var i = 0; i < length; i++) {
      var letterIndex = Math.floor(Math.random() * base64Letters.length);
      word.push(letterIndex);
    }
    return word;
  }

  getPoemHtml(poem, styles) {
    let html = `<section class="poem" styles="${styles}">`;
    for (const paragraph of poem) {
      html += this.getParagraphHtml(paragraph, '');
    }
    html += '</section>';
    return html;
  }

  getParagraphHtml(paragraph, styles) {
    let html = `<p class="paragraph" styles="${styles}">`;
    for (const word of paragraph) {
      html += this.getWordHtml(word, '');
    }
    html += '</p>';
    return html;
  }

  getWordHtml(word, styles) {
    let html = `<span class="word" style="${styles}">`;
    for (const letter of word) {
      html += this.getLetterHtml(letter, 'display: inline-block; width: 24px; margin-bottom: 4px; box-sizing: border-box;');
    }
    html += '</span>';
    return html;
  }

  getLetterHtml(letter, styles) {
    return `<img src="${base64Letters[letter]}" style="${styles}" />`;
  }

}
window.customElements.define('bet-ical', Betical);