(function() {
    var typerh = can.Control.extend({
    	pluginName: 'typerh'
    }, {
    	langs: {
    		js: [
				"for(var x=1; x<array.length; x++){ }",
				"if(shortObject.hasValue() && longObjectName.withAttribute){ return; }",
				"switch(caseName){ case 0: define(obj.property); break; case 1: Content.removeContentValue(); default: showDesc(); break; }",
				"var divStyle = window.getComputedStyle( div, null );",
				"marginDiv = div.appendChild( document.createElement( \"div\" ) );"
			],
			java: [
				"public static int fact(int n) { int result = 0; if(n == 0) result = 1; return result; }",
				"UnsortedHashSet<E> temp = new UnsortedHashSet<E>(); temp.con = (LinkedList<E>[])(new LinkedList[con.length * 2 + 1]);",
			]
    	}, 

    	init: function(){
    		this.selectedLang = new can.Map({ lang: 'js' });
    		this.score = 0;
    		this.nextRound();
    	},

    	nextRound: function(){
    		this.mistakes = 0;
    		this.mistakesMap = {};
    		this.hasStarted = false;
    		this.pickPhrase();
    	},

    	resetTimer: function(){
    		clearInterval(this.timer);
    		this.timer = setInterval(jQuery.proxy(this._tick, this), 1000);
    		this.count = 0;
    	},

    	_tick: function(){
    		this.count++;
    		// Gross wpm and Net wpm
    		var gwpm = Math.round((this.userInput.length / 5) / (this.count / 60)),
    			nwpm = Math.round(gwpm - (this.mistakes / (this.count / 60) ));
    		$("#gwpm").html(gwpm);
    		$("#nwpm").html(nwpm);
    	},

    	pickPhrase: function(){
    		var d = this.getDict(),
    			n = Math.floor(Math.random() * d.length);
			$('#phrase').val(d[n]);
    	},

    	getDict: function(){
    		return this.langs[this.selectedLang.attr("lang")];
    	},

    	updateScore: function(){
    		this.score++;
			$("#scoreboard #score").html(this.score);
    	},

    	updateMistakes: function(num){
    		this.mistakes = this.mistakes + num;
    		$("#scoreboard #mistakes").html(this.mistakes);
    	},

    	"#langSelect change": function(el, ev){
    		this.selectedLang.attr("lang", $(el).val());
    		this.pickPhrase();
    	},

    	"#keyInput input": function(el, ev){
    		var e = $(el),
    			v = e.val(),
    			pl = $("#phrase").val(),
    			valid = true;

    		this.userInput = v;

    		// Start timer whent the first letter is timed 
    		if(v.length === 1 && !this.hasStarted){
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
    			var hasMistake = typeof this.mistakesMap[i] !== "undefined";
    			valid = v[i] === pl[i];

    			if(!valid){
    				// Only count mistakes once
    				if(!hasMistake){ this.updateMistakes(1); }
    				this.mistakesMap[i] = pl[i];
    				break; 
    			}

    			// Remove a mistake from the map if it is corrected
    			if(hasMistake){
					this.updateMistakes(-1);
    				delete this.mistakesMap[i];
    			}
    		};

    		e.toggleClass('bad', !valid);
    		e.toggleClass("good", valid);

    	}

    });

    new typerh($("#main"));
})();
