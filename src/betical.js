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
  .poetry-container {
    margin: 0 auto;
    max-width: 600px;
  }
  p {
    margin-bottom: 48px;
  }
  .word {
    display: inline-block;
    margin-right: 16px;
  }
`;
class Betical extends HTMLElement {
  base64Images;
  letters = [];
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // load image
    this.base64Images = fetch('./images.json')
      .then(response => response.json());
  }

  connectedCallback() {
    this.base64Images
      .then(data => {
        this.letters = data.images;
        this.render();
      });
  }

  render() {
    let html = '';
    html += `
      <style>
        ${componentStyles}
      </style>
      <h1>Betical</h1>
      <section class="poetry-container">
    `;
    const poem = this.createPoem(5, 15);
    for (const paragraph of poem) {
      html += '<p>';
      for (const word of paragraph) {
        html += '<span class="word">';
        for (const letter of word) {
          html += this.getImgForLetter(letter, 'display: inline-block; width: 24px; margin-bottom: 4px; box-sizing: border-box;');
        }
        html += '</span>';
      }
      html += '</p>';
    }
    html += `</section>`;
    this.shadowRoot.innerHTML = html;
  }

  getImgForLetter(letter, styles) {
    return `<img src="${letter}" style="${styles}" />`;
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
      var letterIndex = Math.floor(Math.random() * this.letters.length);
      word.push(this.letters[letterIndex]);
    }
    return word;
  }

}

window.customElements.define('bet-ical', Betical);