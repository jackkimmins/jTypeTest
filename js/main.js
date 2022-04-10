let isCountingDown = false;
let currentWord = null;
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
        // console.log(response);

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
            $('.words').append(`<span class="word">${word}</span>`);
        });

        //Get the first element of .words
        currentWord = $('.words .word').first();
        currentWord.addClass('active');

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
        $("#textInput").prop("disabled", false);
        return;
    }

    const value = $("#textInput").val().trim();

    //Check if the current word contains value
    if (currentWord.text().includes(value))
    {
        currentWord.removeClass('incorrect');
    }
    else
    {
        currentWord.addClass('incorrect');
    }

    //Check if the key is space
    if (event.keyCode == 32)
    {
        if (value == currentWord.text())
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

        let currentWordPosition = currentWord.position().top;

        if (currentWordPosition != lastWordPosition) {
            let wordsToRemove = [];

            $('.word').each(function() {
                if ($(this).position().top < currentWordPosition)
                    wordsToRemove.push($(this));
            });

            wordsToRemove.forEach(word => word.remove());
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