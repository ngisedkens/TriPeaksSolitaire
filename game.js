$(document).ready(function() {

    // IMPORTANT NOTES:
    // * for some reason adblock plugin will cause bugs
    // * first tier is the top tier (3 total cards)
    // * fourth tier is the base of the pyramids
    // * two sources of truth for card data at the moment currentBoard and deck
    // * Alt text doesn't currently change on flipping
    // * how to set up data so that theres one source of truth and site is generated from that
    // TODO: incorporate image changing on addToPlay function
    // TODO: currently flipcheck doesnt keep track of cards that have already been flipped
    // TODO: fix reset button functionality

    let deckID = null;
    let currentBoard = null;
    let deck = null;
    let currentScore = 0;
    let scoreStreak = 0;
    let leftPyramidFinished = false;
    let midPyramidFinished = false;
    let rightPyramidFinished = false;
    let boardCopy = null;


    $('#newHand').click(newHand);
    $('.cardBox').on('click', cardClick);
    $('.cardBoxpile').on('click', pileClick);
    $('#reset').click(resetHand); // TODO: doesnt work yet

    function GameBoard(firstTier, secondTier, thirdTier, fourthTier, pile, play) {
        this.firstTier = firstTier || [];
        this.secondTier = secondTier || [];
        this.thirdTier = thirdTier || [];
        this.fourthTier = fourthTier || [];
        this.pile = pile || [];
        this.play = play || [];
    }

    GameBoard.prototype.refresh = function(targetCard, tier) {
        for (var i = 0; i < this[tier].length; i++) {
            if (this[tier][i].code === targetCard) {
                this[tier][i].addToPlay();
                deck[targetCard].addToPlay();
                this.play.push(deck[targetCard]);
            }
        }
    }

    // ugly and useless :D
    function retrieveTargetPyramid(targetCard, tier) {
        // set variable for pyramid(s) targetCard is located in
        let targetPyramid = null;
        let indexOfCurrentTier = null;
        for (var i = 0; i < currentBoard[tier].length; i++) {
            if (targetCard === currentBoard[tier][i].code) {
                indexOfCurrentTier = i;
            }
        }
        switch (tier) {
            case 'firstTier':
                switch (indexOfCurrentTier) {
                    case 0:
                        targetPyramid = 'first';
                        break;
                    case 1:
                        targetPyramid = 'second';
                        break;
                    case 2:
                        targetPyramid = 'third';
                        break;
                };
                break;
            case 'secondTier':
                switch (indexOfCurrentTier) {
                    case 0:
                    case 1:
                        targetPyramid = 'first';
                        break;
                    case 2:
                    case 3:
                        targetPyramid = 'second';
                        break;
                    case 4:
                    case 5:
                        targetPyramid = 'third';
                        break;
                };
                break;
            case 'thirdTier':
                switch (indexOfCurrentTier) {
                    case 0:
                    case 1:
                    case 2:
                        targetPyramid = 'first';
                        break;
                    case 3:
                    case 4:
                    case 5:
                        targetPyramid = 'second';
                        break;
                    case 6:
                    case 7:
                    case 8:
                        targetPyramid = 'third';
                        break;
                };
                break;
            case 'fourthTier':
                switch (indexOfCurrentTier) {
                    case 0:
                    case 1:
                    case 2:
                        targetPyramid = 'first';
                        break;
                    case 3:
                        targetPyramid = 'first and second';
                        break;
                    case 4:
                    case 5:
                        targetPyramid = 'second';
                        break;
                    case 6:
                        targetPyramid = 'second and third';
                        break;
                    case 7:
                    case 8:
                    case 9:
                        console.log('hello');
                        targetPyramid: 'third';
                        break;
                };
                break;
        };
        return targetPyramid;
    };

    function scoreMultVictoryCheck() {
        for (var i = 0; i < currentBoard['firstTier'].length; i++) {
            console.log(currentBoard['firstTier'][0].addedToPlayPile);
            if (currentBoard['firstTier'][0].addedToPlayPile) {
                switch (i) {
                    case 0:
                        if (!leftPyramidFinished) {
                            currentScore += 15;
                            leftPyramidFinished = true;
                        };
                        break;
                    case 1:
                        if (!midPyramidFinished) {
                            currentScore += 15;
                            midPyramidFinished = true;
                        };
                        break;
                    case 2:
                        if (!rightPyramidFinished) {
                            currentScore += 15;
                            rightPyramidFinished = true;
                        };
                        break;
                };
            }
        };
        if (leftPyramidFinished && midPyramidFinished && rightPyramidFinished) {
            currentScore += 15;
            setTimeout(function() {
                alert(`You won with a score of ${currentScore}!! Try resetting to see if you can do better!`);
            }, 3000);
        }

    };

    function resetScore() {
        currentScore = 0;
        scoreStreak = 0;
        refreshScore();
    }

    function calculateAddScore(targetCard, tier) {
        scoreStreak++;
        currentScore += scoreStreak;
        scoreMultVictoryCheck();
        refreshScore();
    }

    function calculatePileScore() {
        scoreStreak = 0;
        currentScore = currentScore - 5;
        refreshScore();
    }

    function refreshScore() {
        $('#scoreSpan').text(currentScore)
    }

    function log(e) {
        console.log(e.target);
    }

    function pileClick(e) {
        console.log(e.target);
        let topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
        if (deck[topPileCard].inPlay) {
            calculatePileScore();
            renderCardMove(topPileCard);
            turnCardOver(currentBoard.pile.length - 1, 'pile');
            currentBoard.play.push(currentBoard.pile.pop());
            // assign the new topPileCard
            topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
            deck[topPileCard].inPlay = true;
        }
    }

    function cardClick(e) {

        let targetCard = e.target.id;
        let targetTier = e.target.alt.split(' ')[0]

        if (deck[targetCard].inPlay) {
            // targetCard at 0 because suit doesnt matter in this game ex: 6D = 6 of diamonds
            if (validMove(targetCard[0])) {
                // replace image on play pile
                renderCardMove(targetCard);

                // update score
                calculateAddScore(targetCard, targetTier);

                // handling targetCard status in both truth objects
                currentBoard.refresh(targetCard, targetTier)

                // if flipInfo.flipNeeded === true, then flip(flipIndex/targetCard, flipTier)
                let flipInfo = flipCheck(targetCard, targetTier);
                if (flipInfo.length > 0) {
                    for (var i = 0; i < flipInfo.length; i++) {
                        if (flipInfo[i].flipIndex === null) {
                            continue;
                        } else {
                            turnCardOver(flipInfo[i].flipIndex, flipInfo[i].flipTier);
                        }
                    }
                }
            }
        } else {
            console.log('card is not in play');
        }
        console.log('deck: ', deck);
    }

    function turnCardOver(index, tier) {
        // don't use flip because it will flip back and forth
        let targetCard = currentBoard[tier][index].code;
        deck[targetCard].image = deck[targetCard].images.png;
        $(`#${targetCard}`).attr('src', `${deck[targetCard].image}`);
        deck[targetCard].inPlay = true;
    }

    function renderCardMove(targetCard) {
        $(`#${targetCard}`).addClass('invis');
        $(`.cardBoxplay img`).attr('src', `${deck[targetCard].images.png}`);
    }

    function flipCheck(targetCard, tier) {
        // crawl through tiers on currentBoard to see if anything needs to be flipped
        let tiers = ['firstTier', 'secondTier', 'thirdTier', 'fourthTier'];
        let flipInfo = [];

        if (tier === 'fourthTier') {
            for (var i = 0; i < currentBoard[tier].length - 1; i++) {
                if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                    let flipItem = {};
                    flipItem.flipNeeded = true;
                    flipItem.flipIndex = i;
                    flipItem.flipTier = 'thirdTier';
                    flipInfo.push(flipItem);
                }
            }
        } else if (tier === 'thirdTier') {
            for (var i = 0; i < currentBoard[tier].length - 1; i++) {
                if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                    let flipItem = {};
                    flipItem.flipTier = 'secondTier';
                    flipItem.flipNeeded = true;
                    if (i < 2) {
                        flipItem.flipIndex = i;
                    } else if (i < 5) {
                        flipItem.flipIndex = i - 1;
                    } else {
                        flipItem.flipIndex = i - 2;
                    }
                    if (i === 2 || i === 5) {
                        flipItem.flipNeeded = false;
                        flipItem.flipIndex = null;
                    }
                    flipInfo.push(flipItem);
                }
            }
        } else if (tier === 'secondTier') {
            let i = 0;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = i;
                flipInfo.push(flipItem);
            }
            i = 2;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = 1;
                flipInfo.push(flipItem);
            }
            i = 4;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = 2;
                flipInfo.push(flipItem);
            }
        }
        console.log(flipInfo);
        return flipInfo;
    }

    function validMove(target) {
        let inPlay = currentBoard.play[currentBoard.play.length - 1].code[0];
        inPlay.toString();
        target.toString();
        inPlay = inPlay.replace('J', '11');
        inPlay = inPlay.replace('Q', '12');
        inPlay = inPlay.replace('K', '13');
        inPlay = inPlay.replace('A', '1');
        inPlay = inPlay.replace('0', '10');
        target = target.replace('J', '11');
        target = target.replace('Q', '12');
        target = target.replace('K', '13');
        target = target.replace('A', '1');
        target = target.replace('0', '10');
        inPlay = parseInt(inPlay);
        target = parseInt(target);
        // TODO: TEST THIS!!
        if (target === inPlay + 1 || target === inPlay - 1 || (target === 1 && inPlay === 13) || (target === 13 && inPlay === 1)) {
            return true;
        } else {
            console.log('invalid move for inplay card: ', currentBoard.play[currentBoard.play.length - 1].code[0]);
            return false;
        }
    }

    function resetHand() {
        clearStage();
        currentBoard = jQuery.extend(true, {}, boardCopy);
        uncover(currentBoard);
        resetScore();
    }

    function newHand() {
        clearStage();
        resetScore();
        if (deckID !== null) {
            shuffle();
        } else {
            newDeck();
        }
    }

    function clearStage() {
        $('.added').remove();
        $('.cardDiv').remove();
    }

    function uncover(board) {
        for (var prop in board) {
            if (typeof(board[prop]) !== 'function') {
                popCards(board[prop], prop)
            }
        }
    }

    // populate HTML with card image and code as id with tier location as first word of alt attribute
    function popCards(cardArr, tier) {
        if (tier === 'pile') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
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
                    .attr('id', cardArr[0].code)
                    .attr('src', cardArr[0]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                $cardDiv.append($card);
                $(`.cardBox${tier}`).append($cardDiv);
            }
        } else if (tier === 'fourthTier') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Front of playing card`);
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
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                $cardDiv.append($card);
                $(`.leftPyramid .${tier} .cardBox`).append($cardDiv);
            }
            for (var i = cardsPerPyramid; i < cardsPerPyramid * 2; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                $cardDiv.append($card);
                $(`.midPyramid .${tier} .cardBox`).append($cardDiv);
            }
            for (var i = cardsPerPyramid * 2; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                $cardDiv.append($card);
                $(`.rightPyramid .${tier} .cardBox`).append($cardDiv);
            }
        }
    }

    // AJAX functions:
    // shuffles current deck instead of calling API for a new one
    function shuffle() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`,
            method: 'GET',
            success: function(data) {
                populateBoard();
            },
            error: errorMsg
        })
    }

    function retrieveDeck() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/`,
            method: 'GET',
            success: function(data) {
                populateBoard();
                console.log(data);
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
                populateBoard();
            },
            error: errorMsg
        })
    }

    // creates a new GameBoard and fills it with API data along with custom properties and methods
    // also adds all those new card objects to a deck object
    function populateBoard() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`,
            method: 'GET',
            success: function(data) {

                currentBoard = new GameBoard();

                // adds flip to each card object, cant get prototype thing to work
                data.cards.map(function(elem) {
                    elem.inPlay = false;
                    elem.boardLoc = null;
                    elem.addedToPlayPile = false;
                    elem.addToPlay = function() {
                        this.addedToPlayPile = true;
                        this.boardLoc = 'play'
                    }
                    elem.flip = function() {
                        let pngCard = this.images.png
                        let back = './images/cardBack.png';
                        if (elem.image !== back) {
                            elem.image = back;
                            this.inPlay = false;
                        } else {
                            elem.image = pngCard;
                            this.inPlay = true;
                        }
                    }
                })

                // // TODO: understand prototype access
                // data.cards.prototype.flip = function() {
                // let pngCard = this.images.png
                // let back = './images/cardBack.png';
                // if (this.image !== back) {
                //     this.image = back;
                // } else {
                //     this.image = pngCard;
                // }
                // }

                // sets fourth tier cards in play
                for (var i = 0; i < 10; i++) {
                    data.cards[i].boardLoc = 'fourthTier';
                    data.cards[i].inPlay = true;
                    currentBoard.fourthTier.push(data.cards[i])
                }
                // all other pyramid cards are flipped and assigned their location, updating currentBoard
                for (i = 10; i < 19; i++) {
                    data.cards[i].flip();
                    data.cards[i].boardLoc = 'thirdTier';
                    currentBoard.thirdTier.push(data.cards[i])
                }
                for (i = 19; i < 25; i++) {
                    data.cards[i].flip();
                    data.cards[i].boardLoc = 'secondTier';
                    currentBoard.secondTier.push(data.cards[i])
                }
                for (i = 25; i < 28; i++) {
                    data.cards[i].flip();
                    data.cards[i].boardLoc = 'firstTier';
                    currentBoard.firstTier.push(data.cards[i])
                }
                data.cards[i].boardLoc = 'play';
                data.cards[i].addedToPlayPile = true;
                currentBoard.play.push(data.cards[i])
                for (i = 29; i < data.cards.length; i++) {
                    data.cards[i].flip();
                    data.cards[i].boardLoc = 'pile';
                    currentBoard.pile.push(data.cards[i])
                }
                // set top card on pile to be in play
                currentBoard.pile[currentBoard.pile.length - 1].inPlay = true;
                deck = data.cards.reduce(function(result, element) {
                    result[element.code] = element;
                    return result;
                }, {});

                boardCopy = jQuery.extend(true, {}, currentBoard);
                uncover(currentBoard);

            },
            error: errorMsg
        })
    }

    function errorMsg(error) {
        console.log('Error message on ajax call:', error);
    }

});
