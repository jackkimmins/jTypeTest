let isCountingDown = false;
let currentWord = null;
let currentWordText = null;
let currentWordChars = [];
let correct = 0;
let incorrect = 0;

function ArrayShuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

function CountDown(seconds, callback) {
    const interval = setInterval(function () {
        seconds--;

        if (seconds <= 0)
        {
            clearInterval(interval);
            $("#textInput").val("");
            $("#textInput").prop("disabled", true);

            const Accuracy = correct / (correct + incorrect) * 100;
            const AccuracyString = Accuracy.toFixed(2) + "%";

            if (incorrect >= 20)
            {
                $('#wpm').text('Invalid WPM');
                $('#accuracy').text(AccuracyString);
            }
            else
            {
                const WPM = correct + incorrect + " WPM";

                //Set stats
                $('#wpm').text(WPM);
                $('#accuracy').text(AccuracyString);

                //Save the stats in the local storage
                localStorage.setItem("wpm", WPM);
                localStorage.setItem("accuracy", AccuracyString);
            }

            //Fade out and remove all .word
            $(".word").fadeOut(1000, function () {
                $(this).remove();
            });
        }
        else if (seconds <= 10)
        {
            //Set the timer background colour to red
            $('#timer').css("background-color", "red");
        }

        $('#timer').html(seconds);
    }, 1000);
}

let wordList = "standard";

if (localStorage.getItem("wordList") !== null)
    wordList = localStorage.getItem("wordList");

$.ajax({
    url: `./data/${wordList}.txt`,
    type: 'GET',
    success: function (response) {
        let words = [];

        if (wordList == "sentences")
        {
            let sentences = ArrayShuffle(response.split("\n"));
            let sentence = sentences[Math.floor(Math.random() * sentences.length)];
            words = sentence.split(" ");
        }
        else
            words = ArrayShuffle(response.split("\n"));

        //Add words to .words
        words.forEach(word => {
            //Split word into an array of letters
            let letters = word.split("");

            //Create a element
            let wordElement = document.createElement("span");
            wordElement.classList.add("word");
            
            for (let i = 0; i < letters.length; i++)
            {
                //Check if the letter is empty
                if (letters[i].trim() == "")
                    continue;

                //Create a letter element
                let letterElement = document.createElement("span");
                letterElement.classList.add("letter");
                letterElement.innerHTML = letters[i];

                //Add the letter element to the word element
                wordElement.appendChild(letterElement);
            }

            $('.words').append(wordElement);
        });

        //Get the first element of .words
        currentWord = $('.words .word').first();
        currentWord.addClass('active');
        currentWordChars = currentWord.text().split("");

        $('#caret').css('top', currentWord.position().top + 'px');
        $('#caret').css('left', currentWord.position().left + 'px');

        //Set .container to display block important
        $('#loader').css("display", "none");
        $('#contain').css('display', 'block');
    }
});

$(document).ready(function() {
    $("#textInput").focus();

    //Check if localStorage contains the stats
    if (localStorage.getItem("wpm") !== null)
        $('#wpm').text(localStorage.getItem("wpm"));

    if (localStorage.getItem("accuracy") !== null)
        $('#accuracy').text(localStorage.getItem("accuracy"));

    if (localStorage.getItem("wordList") !== null)
        $('#wordList').val(localStorage.getItem("wordList"));
});

$('#reset').click(function() {
    location.reload();
});

$('#wordList').change(function() {
    localStorage.setItem("wordList", $('#wordList').val());
    location.reload();
});

$("#textInput").keyup(function(event) {
    if (!isCountingDown)
    {
        CountDown(60);
        isCountingDown = true;
        $('#caret').removeClass('blink');
        $("#textInput").prop("disabled", false);
    }

    const value = $("#textInput").val().trim();
    const valueChars = value.split("");
    const valueCharsLength = valueChars.length;

    //Select the element of the last letter in the array
    const lastChar = currentWord.find('.letter').eq(valueCharsLength);

    if (lastChar.length != 0)
    {
        const lastCharTopPos = lastChar.position().top;
        const lastCharLeftPos = lastChar.position().left;

        $('#caret').css('top', currentWord.position().top + lastCharTopPos + 'px');
        $('#caret').css('left', currentWord.position().left + lastCharLeftPos + 'px');
    }
    else if (valueCharsLength <= currentWordChars.length)
    {
        const lastChar2 = currentWord.find('.letter').eq(valueCharsLength - 1);
        $('#caret').css('top', currentWord.position().top + lastChar2.position().top + 'px');
        $('#caret').css('left', currentWord.position().left + lastChar2.position().left + lastChar2.width() + 'px');
    }

    for (let i = 0; i < currentWordChars.length; i++)
    {
        const letter = currentWord.find(".letter").eq(i);

        if (valueCharsLength <= i)
        {
            letter.removeClass("correct");
            letter.removeClass("incorrect");
            continue;
        }

        //Set correct on the letter if the letter is correct
        if (valueChars[i] == currentWordChars[i])
        {
            letter.addClass("correct");
            letter.removeClass("incorrect");
        }
        else
        {
            letter.addClass("incorrect");
            letter.removeClass("correct");
        }
    }

    //Check if the key is space
    if (event.keyCode == 32)
    {
        //If value is empty
        if (value == "")
        {
            $(this).val("");
            return;
        }

        if (valueCharsLength <= currentWordChars.length)
        {
            const lastChar2 = currentWord.find('.letter').eq(valueCharsLength - 1);
            $('#caret').css('top', currentWord.position().top + lastChar2.position().top + 'px');
            $('#caret').css('left', currentWord.position().left + lastChar2.position().left + lastChar2.width() + document.documentElement.clientWidth * 0.65 / 100 + 'px');
        }

        if (value == currentWordText)
        {
            currentWord.addClass('correct');
            correct++;
        }
        else
        {
            currentWord.addClass('incorrect');
            incorrect++;
        }

        $(this).val("");

        currentWord.removeClass('active');

        let lastWordPosition = currentWord.position().top;

        currentWord = currentWord.next();
        currentWordChars = currentWord.text().split("");
        currentWordText = currentWord.text().replace(/\r?\n|\r/g, "");

        let currentWordPosition = currentWord.position().top;

        if (currentWordPosition != lastWordPosition)
        {
            let wordsToRemove = [];

            $('.word').each(function() {
                if ($(this).position().top < currentWordPosition)
                    wordsToRemove.push($(this));
            });

            wordsToRemove.forEach(word => word.remove());

            const lastChar2 = currentWord.find('.letter').eq(0);
            $('#caret').css('top', currentWord.position().top + lastChar2.position().top + 'px');
            $('#caret').css('left', currentWord.position().left + lastChar2.position().left + 'px');
        }

        currentWord.addClass('active');
    }
});

//Detect if the user presses the enter key
$(document).keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        //Reset the game
        location.reload();
    }
});