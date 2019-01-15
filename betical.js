
// Grabs the list of images with jQuery
var letterList = jQuery('#images li').toArray();

function createWord($minLetters, $maxLetters) {
  var word = [];
   // Sets the minimum and maximum amount of images to display
   var min = $minLetters;
   var max = $maxLetters;
   // Calculates a random amount of images between min and max
   var wordLength = Math.floor(Math.random() * (max - min)) + min;
   // Repeat loop for the random amount of images picked above
   for (var i = 0; i < wordLength; i++) {
     // Select a random index out of the list of images
     var randLetter = Math.floor(Math.random() * letterList.length);
     // Set that random image to display
	 var randLetterWidth = Math.floor(Math.random() * 15) + 15;
	 var randLetterMargin = Math.floor(Math.random() * 3);
	   var letter = jQuery(letterList[randLetter]).clone().attr('style', 'max-width: ' + randLetterWidth + 'px; margin-right: ' + randLetterMargin + 'px');
     word.push(letter);
   }
   var wordItem = jQuery(word);

   // hack -- converts every li element into a string and then wraps it
   var randWordMargin = Math.floor(Math.random() * 10) + 20;
   var html = '<li style="margin-right: ' + randWordMargin + 'px"><ul class="word-letter-list">'
   for (var j = 0; j < wordItem.length; j++) {
     html += wordItem[j].prop('outerHTML');
   }
   html += '</ul></li>'

   jQuery('#words').append(html);
}

function createParagraph($minWords, $maxWords, $minLetters, $maxLetters) {
  var min = $minWords;
  var max = $maxWords;

   // Calculates a random amount of words between min and max
  var paragraphLength = Math.floor(Math.random() * (max - min)) + min;
  for (var i = 0; i < paragraphLength; i++) {
    createWord($minLetters, $maxLetters);
  }
}

// This calls the initial function to start everything
// createParagraph(minWords, maxWords, minLetters, maxLetters)
createParagraph(5, 50, 1, 8);