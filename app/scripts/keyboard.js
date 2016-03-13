'use strict';
/**
 * Keyboard module, renders a keyboard with a heatmat
 * @module keyboard
 */
var Keyboard = can.Control.extend({
	pluginName: 'keyboard'
}, {
    keyMap: {
        8: "backspace", // backspace
        9: "tab", // tab
        13: "enter", // enter
        16: "shift", // shift
        20: "caps", // caps lock
        59: 186, // ;
        58: 186, // :
        61: 187, // =,
        41: 187, // +
        44: 188, // ,
        60: 188, // <
        45: 189, // -
        95: 189, // _
        46: 190, // .
        62: 190, // >
        47: 191, // /
        63: 191, // ?
        96: 192, // `
        126: 192, // ~
        91: 219, // [
        123: 219, // {
        92: 220, // \
        124: 220, 
        93: 221, // ]
        125: 221, // }
        39: 222, // '
        34: 222, // "
    },

    hits: {},

    formats: {
        'qwerty': [
            ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'backspace'],
            ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter'],
            ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '/', 'shift'],
            [' ']
        ]
    },

    /** Set the active keyboard format and render the keyboard table */
	init: function(){
        this.activeFormat = this.formats.qwerty.reverse();
        this.render();
	},

    /** Call when keydown event is fired.
        @public
        @param {jQuery.Event} ev - keydown event to grab the key code from
    */
    onKeyDown: function(ev){
        var charCode = ev.which ? ev.which : ev.keyCode
        this.element.find('td[data-code=' + charCode + '] div').addClass('active');
    },

    /** Call when keyup event is fired, only update heat when a key is released
        @public
        @param {jQuery.Event} ev - keyup event to grab the key code from
    */
    onKeyUp: function(ev){
        var charCode = ev.which ? ev.which : ev.keyCode;
        this.hits[charCode] ? 
            this.hits[charCode]++ : 
            this.hits[charCode] = 1;
        this.addHeat(charCode);
        this.element.find('td[data-code=' + charCode + '] div').removeClass('active');
    },

    /** Updates the background color for the key element based on how many times the key has been pressed
        @param {number} charCode - character code for the key to add heat to
    */
    addHeat: function(charCode){
        this.element.find('td[data-code=' + charCode + '] div').css('backgroundColor', 'rgba(255,0,0,'+(this.hits[charCode]/100));
    },

    /** Generates a keyboard document fragment, then appends it to the DOM 
        Use document fragments to prevent multiple paints while generating keyboard
    */
    render: function(){
        var keyboardContainer = document.createDocumentFragment();
        var tableFragment = document.createElement('table');
        var longestRowLength = 0;
        for (var i = this.activeFormat.length - 1; i >= 0; i--) {
            var row = document.createElement('tr');
            var rowKeys = this.activeFormat[i].reverse();
            var rowLength = rowKeys.length;

            longestRowLength = longestRowLength > rowLength ? longestRowLength : rowLength;
            
            for (var x = rowLength - 1; x >= 0; x--) {
                var keyCode = rowKeys[x].toUpperCase().charCodeAt(0);
                var key = document.createElement('td');

                // These keys won't be picked up correctly by .charCodeAt(), manually map them
                if(['backspace','tab','enter','shift', 'caps'].indexOf(rowKeys[x]) > -1){
                    switch(rowKeys[x]){
                        case 'backspace':
                            keyCode = 8;
                            break;
                        case 'tab':
                            keyCode = 9;
                            break;
                        case 'enter':
                            keyCode = 13;
                            break;
                        case 'shift':
                            keyCode = 16;
                            break;
                        case 'caps':
                            keyCode = 20;
                            break;
                    }
                } else if(this.keyMap.hasOwnProperty(keyCode)){
                    // Key was manually mapped because the keyCode does not match the charCode
                    keyCode = this.keyMap[keyCode];
                } else {
                    this.keyMap[keyCode] = rowKeys[x];
                }

                // Set an attribute so we can refer back to the element easily
                key.setAttribute('data-code', keyCode);
                key.innerHTML = "<div>" + rowKeys[x] + "</div>";

                row.appendChild(key);
            }

            if(longestRowLength > rowLength){
                var numMissing = longestRowLength - rowLength;
                for (var z = 0; z < numMissing; z++) {
                    var emptyKey = document.createElement('td');
                    if(z % 2 === 0){
                        row.appendChild(emptyKey)
                    } else {
                        row.insertBefore(emptyKey, row.firstChild);
                    }
                }
            }

            tableFragment.appendChild(row);
        }
        keyboardContainer.appendChild(tableFragment);
        this.element.html(keyboardContainer);
    }
});
