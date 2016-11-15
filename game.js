$(document).ready(function() {

    let deckID = null;

    $('#newHand').click(newHand);
    $('img').click(log);

    function GameBoard(firstTier, secondTier, thirdTier, fourthTier, pile, play) {
        this.firstTier = firstTier || [];
        this.secondTier = secondTier || [];
        this.thirdTier = thirdTier || [];
        this.fourthTier = fourthTier || [];
        this.pile = pile || [];
        this.play = play || [];
    }

    function log(e) {
        console.log(e.target);
    }

    function newHand() {
        clearStage()
        if (deckID !== null) {
            shuffle()
        } else {
            newDeck()
        }
    }

    function clearStage() {
        $('.added').remove()
    }

    function uncover(board) {
        let $card = $('<img></img>');
        $card.addClass('card added').attr('src', board.play[0]['image']).attr('alt', 'Back of playing card');
        $('.cardBoxPlay').append($card);
        let i = 0;
        $.map($('.fourthTier img'), function(e) {
            e.src = board.fourthTier[i]['image'];
            i++
        })
    }

    function errorMsg(error) {
        console.log('Error message on ajax call:', error);
    }

    // AJAX functions:
    function shuffle() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`,
            method: 'GET',
            success: function(data) {
                console.log('shuffled: ', deckID);
                populateBoard();
            },
            error: errorMsg
        })
    }

    function newDeck() {
        $.ajax({
            url: 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1',
            method: 'GET',
            success: function(data) {
                deckID = data['deck_id'];
                console.log('new deck:', deckID);
                populateBoard();
            },
            error: errorMsg
        })
    }

    function populateBoard(num) {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`,
            method: 'GET',
            success: function(data) {
                let board = new GameBoard();
                for (var i = 0; i < 10; i++) {
                    board.fourthTier.push(data.cards[i])
                }
                for (i = 10; i < 19; i++) {
                    board.thirdTier.push(data.cards[i])
                }
                for (i = 19; i < 25; i++) {
                    board.secondTier.push(data.cards[i])
                }
                for (i = 25; i < 28; i++) {
                    board.firstTier.push(data.cards[i])
                }
                board.play.push(data.cards[i])
                for (i = 29; i < data.cards.length; i++) {
                    board.pile.push(data.cards[i])
                }
                console.log('Successfully populated new board:', board);
                uncover(board);

            },
            error: errorMsg
        })
    }

});
