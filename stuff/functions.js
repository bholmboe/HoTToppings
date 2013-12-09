var toppingTotalAllowed = 3;
var videoTiming = 300000;
var videoPlayCount = 0;

$(function () {
    //load the menu when the page is loaded
    loadMenuData();
});


/** Load Videos **/

function playVideo(myPlayer) {
    var howMuchIsDownloaded = 1;  //myPlayer.bufferedPercent(); this isn't helping on an actual server.
    clearInterval(playVideoInterval);
    if (firstPlay || howMuchIsDownloaded === 1) {
        $('#video').show();
        myPlayer.play();
        firstPlay = false;
    } else {
        setPlayVideoInterval(myPlayer);
    }
}
function stopVideo(myPlayer) {
    $('#video').hide();
    setPlayVideoInterval(myPlayer);
    changeVideo(myPlayer);
}
function changeVideo(myPlayer) {
    videoPlayCount += 1;
    switch (playingVideo) {
        case "video1":
            playingVideo = "video2";
            myPlayer.src("stuff/videos/house_of_toast_1 min20second_promo_YoutubeHD_001.mp4");
            break;
        case "video2":
            //play the long video less often
            if (videoPlayCount % 10 === 0) {
                playingVideo = "video3";
            } else {
                playingVideo = "video1";
            }
            myPlayer.src("stuff/videos/SpaceToastFINALh264Med.mov");
            break;
        //case "video3":
        //    playingVideo = "video1";
        //    myPlayer.src("stuff/videos/40secliverwurstgraphicBrighter.mp4");
        //    break;
    }
}
function setPlayVideoInterval(myPlayer) {
    playVideoInterval = setInterval(function () { playVideo(myPlayer) }, videoTiming);
}


/* Scroll Toppings */
function scrollToppings() {
    var obj = $(".toppinglistinner");
    var text_height = obj.find(".list").height();
    var start_y = 0;
    var end_y = -text_height;
    var distance = Math.abs(end_y - parseInt(obj.css("top")));
    obj.find(".list").clone().appendTo(obj);
    obj.animate(
        { top: end_y },
        1000 * distance / 60,
        "linear",
        function () {
            // scroll to start position
            obj.css("top", start_y);
            loadMenuData();
        }
    );
}

function removeToppingULs() {
    if ($('.toppinglistinner ul').length > 1) {
        $('.toppinglistinner ul').remove();
    }
}

/** Load Toppings **/
function loadMenuData() {
    $.ajax({
        type: "GET",
        url: "hottoppingsboard.csv",
        dataType: "text",
        success: function (data) { processData(data); }
    });
}

function processData(allText) {
    var allTextLines = CSVToArray(allText, ","); //allText.split(/\r\n|\n/);
    allTextLines = allTextLines.sort();
    var headers = allTextLines[0];
    var bread = [];
    var topping = [];
    var special = [];
    var dataTemplate = '';


    //This assumes:
    //1st column: inactive? - Will only show if blank
    //2nd column: Topping Name - Won't show if blank
    //3rd column: Type - defaults to "topping" if blank
    //all other columns are ignored.
    //1st row: Headers, ignored
    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i];
        if (!data[0] && data[1]) {
            dataTemplate = '<li><div class="itemdetail">' + data[1].replace(/"""/g, '"') + '</div></li>';
            switch (data[2].toLowerCase()) {
                case 'bread':
                case 'breads':
                    bread.push(dataTemplate);
                    break;
                case 'special':
                case 'specials':
                    special.push(dataTemplate);
                    break;
                case 'topping':
                case 'toppings':
                default:
                    topping.push(dataTemplate);
                    break;
            }
        }
    }

    //Set the Special List
    if (special.length !== 0) {
        $('#special').html(special.join(''));
        $('#specialheader').show();
    } else {
        $('#specialheader').hide();
    }

    //Set the Bread List
    $('#bread').html(bread.join(''));

    //Set the Topping List
    removeToppingULs();
    $('.toppinglistinner').append('<ul class="list cf">' + topping.join('') + '</ul>');

    //Set the total number of toppings allowed
    $('#toppingtotalallowed').html(toppingTotalAllowed);    

    //Set the Total Number of Toppings
    $('#toppingtotal').html(topping.length);

    //Set the Specials List
    $('#toppingcombination').html('<br />There are ' + addCommas(calculateNumberOfToppings(topping.length, bread.length)) + ' combinations!');

    //Tell the toppings to scroll
    scrollToppings();
}

function calculateNumberOfToppings(toppingTotal, breadTotal) {
    //Hardcoded because I am not taking the time to make this more exciting.
    return breadTotal * (toppingTotal + (toppingTotal * (toppingTotal - 1)) / 2 + (toppingTotal * (toppingTotal - 1) * (toppingTotal - 2)) / 6);
}

function addCommas(number) {
    number += '';
    x = number.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


// This will parse a delimited string into an array of 
// arrays. The default delimiter is the comma, but this 
// can be overriden in the second argument. 
function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp((
    // Delimiters. 
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    // Quoted fields. 
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    // Standard fields. 
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
     );

    var arrData = [[]];
    var arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }

        if (arrMatches[2]) {
            var strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
        } else {
            var strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue.trim());
    }
    return (arrData);
}