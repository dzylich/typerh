(function() {
    'use strict';
    /**
     * Main module.
     * @module main
     * @param {Object} options - Plain object containing langs attr with dictionaries
     */
    var Typerh = can.Control.extend({
    	pluginName: 'typerh'
    }, {
    	langs: {}, 

    	init: function(){
            this.langs = this.options.langs;
    		this.selectedLang = new can.Map({ lang: 'js' });
            this.keyboard = new Keyboard($('#keyboard'));
    		this.score = 0;
            this._lastPhraseIndex = -1;
            this.highestNwpm = 0;
    		this.nextRound();
    	},

        /** Reset round data and pick a new phrase*/
    	nextRound: function(){
    		this._updateScoreState({mistakes: {value: 0}});
    		this.mistakesMap = {};
    		this.hasStarted = false;
            this.highestNwpm = 0;
    		this.pickPhrase();
    	},

        /** Set interval to call _tick() every second */
    	resetTimer: function(){
    		clearInterval(this.timer);
    		this.timer = setInterval(jQuery.proxy(this._tick, this), 1000);
    		this.count = 0;
    	},

        /** Calculate the Gross Words Per Minute and Net Words Per Minute */
    	_tick: function(){
    		this.count++;
    		// Gross wpm and Net wpm
    		var gwpm = Math.round((this.userInput.length / 5) / (this.count / 60)),
    			nwpm = Math.round(gwpm - (this.mistakes / (this.count / 60) ));

            this.highestNwpm = Math.max(this.highestNwpm, nwpm);
            this._updateScoreState({
                gwpm: {value: gwpm},
                nwpm: {value: nwpm}
            });
    	},

        _updateScoreState: function(scoreObj){
            for(var key in scoreObj){
                this[key] = scoreObj[key].value;
                if(scoreObj[key].animate){
                    $('#scoreboard #' + key).animateCss(scoreObj[key].animate);
                }
                $('#scoreboard #' + key).html(this[key]);
            }
        },

        _updateButtonState: function(btnObj){
            for(var key in btnObj){
                $('.btn#' + key).toggleClass('disabled', btnObj[key]);
            }
        },

        /**
            Pick a phrase from the dictionary and 
            update the line count for the phrase display
        */
        pickPhrase: function(){
            var d = this.getDict(),
                n = Math.floor(Math.random() * d.length); // Pick a random index

            // Don't pick the same phrase twice in a row
            if(n === this._lastPhraseIndex){ 
                this.pickPhrase();
                return;
            }

            var phrase = d[n],
                re = new RegExp("\n", "g"),
                match = phrase.match(re),
                newLineCount = (match && match.length+1) || 1;

            // Minimum field size is 60px;
            $('#phrase').height(Math.floor(newLineCount * 20, 60));

            $("#phraseLineCount").html('');
            $("#inputLineCount").html('');
            for (var i = 0; i < newLineCount; i++) {
                $("#phraseLineCount").append("<li></li>");
                $("#inputLineCount").append("<li></li>");
            }

            $('#phrase').val(phrase);
        },

        /** Returns an array of strings from the this.langs based on the selected language */
        getDict: function(){
            return this.langs[this.selectedLang.attr('lang').toLowerCase()];
        },

        
        '#start:not(.disabled) click': function(el){
            this._updateButtonState({start: true, reset: false, pause: false});
            if(this.isPaused){
                el.removeClass('pulse repeat');
                this.isPaused = false;
            }
            $('#keyInput').focus();
        },

        '#pause:not(.disabled) click': function(el){
            clearInterval(this.timer);
            this.isPaused = true;
            this._updateButtonState({start: false, pause: true});
            $('.btn#start').addClass('pulse repeat');
        },

        '#reset:not(.disabled) click': function(){
            clearInterval(this.timer);
            this.count = 0;
            this.highestNwpm = 0;
            this.mistakesMap = {};
            this._updateScoreState({
                score: {value: 0},
                mistakes: {value: 0},
                gwpm: {value: 0},
                nwpm: {value: 0}
            })
            this._updateButtonState({start: false, reset: true, pause: true});
            $('#keyInput').val('').removeClass('bad good');
            this.nextRound();
        },

    	'#langSelect change': function(el){
    		this.selectedLang.attr('lang', $(el.children(':selected')).data('value'));
    		this.pickPhrase();
    	},

        '#keyInput keydown': function(el, ev){
            // Prevent default tab action so user can enter tab character
            if (ev.keyCode === 9) {
                ev.preventDefault();
                el.val(el.val()+'\t'); // Manually add tab character
            }
            this.keyboard.onKeyDown(ev);
        },

        '#keyInput keyup': function(el, ev){
            this.keyboard.onKeyUp(ev);
        },

    	'#keyInput input': function(el){
    		var e = $(el),
    			v = e.val(),
    			pl = $('#phrase').val(),
    			valid = true;

    		this.userInput = v;

    		// Start timer whent the first letter is typed 
    		if(v.length === 1 && !this.hasStarted){
                this._updateButtonState({start: true, reset: false, pause: false});
    			this.hasStarted = true;
    			this.resetTimer();
    		}

    		// Full match
    		if(v === pl){
    			this._updateScoreState({
                    score: {
                        value: this.score + 1,
                        animate: 'flash'
                    }
                });
    			this.nextRound();
    			e.val('');
    			return;
    		}

    		// Count each character
            for (var i = v.length - 1; i >= 0; i--) {
    			var hasMistake = typeof this.mistakesMap[i] !== 'undefined';
    			valid = v[i] === pl[i];

    			if(!valid){
    				// Only count mistakes once
    				if(!hasMistake){
                        this._updateScoreState({
                            mistakes: {
                                value: this.mistakes + 1,
                                animate: 'shake'
                            }
                        });
                    }
                    // Add the mistake character to the map
    				this.mistakesMap[i] = pl[i];
    				continue; 
    			}

    			// Remove a mistake from the map if it is corrected
    			if(hasMistake){
                    this._updateScoreState({
                        mistakes: {
                            value: this.mistakes - 1,
                            animate: 'pulse'
                        }
                    });
    				delete this.mistakesMap[i];
    			}
    		}

    		e.toggleClass('bad', !valid);
    		e.toggleClass('good', valid);
    	}
    });

    // Grab the languages, then init the game
    var p = $.get('/scripts/languages.json');
    p.done(function(langs){
        new Typerh($('#main'), {langs: langs});
    })
})();
