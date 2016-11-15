$(document).ready(function() {

    let deckID = null;

    $('#newHand').click(newHand);
    $('img').click(log);

    // pseudoclassical GameBoard 'class'
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
        clearStage();
        if (deckID !== null) {
            shuffle();
        } else {
            newDeck();
        }
    }

    function clearStage() {
        $('.added').remove()
    }

    function uncover(board) {
        for (var prop in board) {
            popCards(board[prop], prop)
        }
    }

    function popCards(cardArr, tier) {
        if (tier === 'pile') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                if (i > 0) {
                    $cardDiv.addClass('pile');
                }
                $cardDiv.append($card);
                $(`.cardBox${tier}`).append($cardDiv);
            }
        } else if (tier === 'play') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                $cardDiv.append($card);
                $(`.cardBox${tier}`).append($cardDiv);
            }
        } else if (tier === 'fourthTier') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                $cardDiv.append($card);
                $(`.${tier} .cardBox`).append($cardDiv);
            }
        } else {
            let cardsPerPyramid = cardArr.length / 3;
            let image = null;

            // TODO: make card face hidden
            for (var i = 0; i < cardsPerPyramid; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                $cardDiv.append($card);
                $(`.leftPyramid .${tier} .cardBox`).append($cardDiv);
            }
            for (var i = cardsPerPyramid; i < cardsPerPyramid * 2; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                $cardDiv.append($card);
                $(`.midPyramid .${tier} .cardBox`).append($cardDiv);
            }
            for (var i = cardsPerPyramid * 2; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', 'Front of playing card');
                $cardDiv.append($card);
                $(`.rightPyramid .${tier} .cardBox`).append($cardDiv);
            }
        }
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
                console.log(data);
                let board = new GameBoard();

                // adds flip to each card object, cant get prototype thing to work
                data.cards.map(function(elem) {
                    elem.flip = function() {
                        let pngCard = this.images.png
                        let back = './images/cardBack.png';
                        if (elem.image !== back) {
                            elem.image = back;
                        } else {
                            elem.image = pngCard;
                        }
                    }
                })
                // TODO: understand prototype access
                // data.cards.prototype.flip = function() {
                    // let pngCard = this.images.png
                    // let back = './images/cardBack.png';
                    // if (this.image !== back) {
                    //     this.image = back;
                    // } else {
                    //     this.image = pngCard;
                    // }
                // }

                for (var i = 0; i < 10; i++) {
                    board.fourthTier.push(data.cards[i])
                }
                for (i = 10; i < 19; i++) {
                    data.cards[i].flip()
                    board.thirdTier.push(data.cards[i])
                }
                for (i = 19; i < 25; i++) {
                    data.cards[i].flip()
                    board.secondTier.push(data.cards[i])
                }
                for (i = 25; i < 28; i++) {
                    data.cards[i].flip()
                    board.firstTier.push(data.cards[i])
                }
                board.play.push(data.cards[i])
                for (i = 29; i < data.cards.length; i++) {
                    data.cards[i].flip()
                    board.pile.push(data.cards[i])
                }
                console.log('Successfully populated new board:', board);
                uncover(board);

            },
            error: errorMsg
        })
    }

    function errorMsg(error) {
        console.log('Error message on ajax call:', error);
    }

});
