(function() {
    'use strict';
    /**
     * Main module.
     * @module main
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
    		this.mistakes = 0;
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
    		$('#gwpm').html(gwpm);
    		$('#nwpm').html(nwpm);
    	},

        /** 
            Sets the control buttons states and focuses on the typing field 
            @param {boolean} [doFocus] - true to focus cursor on typing field, false or null does nothing
        */
        start: function(doFocus){
            $('button#start').prop('disabled', true);
            $('button#reset').prop('disabled', false);
            $('button#pause').prop('disabled', false);
            if(doFocus) {
                $('#keyInput').focus();
            }
        },

        /** Clean up scores, timers, and views */
        reset: function(){
            clearInterval(this.timer);
            this.count = 0;
            this.mistakesMap = {};
            this.updateScore(0);
            this.updateMistakes(-this.mistakes);
            this.highestNwpm = 0;
            $('#gwpm').html(0);
            $('#nwpm').html(0);
            $('button#reset').prop('disabled', true);
            $('button#start').prop('disabled', false);
            $('button#pause').prop('disabled', true);
            $('#keyInput').val('').removeClass('bad good');
            this.nextRound();
        },

        /**
            Pick a phrase from the dictionary and 
            update the line count for the phrase display
        */
    	pickPhrase: function(){
    		var d = this.getDict(),
    			n = Math.floor(Math.random() * d.length);

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

            $("#lineCount").html('');
            for (var i = 0; i < newLineCount; i++) {
                $("#lineCount").append("<li></li>");
            }

			$('#phrase').val(phrase);
    	},

        /** Returns an array of strings from the this.langs based on the selected language */
    	getDict: function(){
    		return this.langs[this.selectedLang.attr('lang').toLowerCase()];
    	},

        /** Update the scoreboard with a new score
            @param {number} [num] - Force the score to a specific value, null to incremember by 1
        */
    	updateScore: function(num){
    		this.score = num ? num : this.score + 1;
            $('#scoreboard #score').animateCss('flash');
			$('#scoreboard #score').html(this.score);
    	},

        /** Update the scoreboard with new count of mistakes
            @param {number} num - Number of mistakes to incremenent mistake count by
        */
    	updateMistakes: function(num){
    		this.mistakes = this.mistakes + num;
            $('#scoreboard #mistakes').animateCss('shake');
    		$('#scoreboard #mistakes').html(this.mistakes);
    	},
        
        '#start:not(\'[disabled=disabled]\') click': function(){
            this.start();
        },

        '#pause:not(\'[disabled=disabled]\') click': function(el){
            this.start();
            clearInterval(this.timer);
            el.prop('disabled', true);
            $('button#start').prop('disabled', false);
        },

        '#reset:not(\'[disabled=disabled]\') click': function(){
            this.reset();
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
                this.start(true);
    			this.hasStarted = true;
    			this.resetTimer();
    		}

    		// Full match
    		if(v === pl){
    			this.updateScore();
    			this.nextRound();
    			e.val('');
    			return;
    		}

    		// Count each character
    		for (var i = 0; i < v.length; i++) {
    			var hasMistake = typeof this.mistakesMap[i] !== 'undefined';
    			valid = v[i] === pl[i];

    			if(!valid){
    				// Only count mistakes once
    				if(!hasMistake){ this.updateMistakes(1); }
                    // Add the mistake character to the map
    				this.mistakesMap[i] = pl[i];
    				continue; 
    			}

    			// Remove a mistake from the map if it is corrected
    			if(hasMistake){
					this.updateMistakes(-1);
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
