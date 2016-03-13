'use strict';
/**
 * Keyboard module, renders a keyboard with a heatmat
 * @module keyboard
 */
var Keyboard = can.Control.extend({
	pluginName: 'keyboard'
}, {
    keyMap: {
        8: "backspace", //  backspace
        9: "tab", //  tab
        13: "enter", //  enter
        16: "shift" //  shift
    },

    hits: {},

    formats: {
        'qwerty': [
            ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'backspace'],
            ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter'],
            ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '/', 'shift'],
            [' ']
        ]
    },

    /** Set the active keyboard format and render the keyboard table */
	init: function(){
        this.activeFormat = this.formats.qwerty.reverse();
        this.render();
	},

    /** Call when keydown event is fired, updates key heat.
        @public
        @param {jQuery.Event} ev - keydown event to grab the key code from
    */
    onKeyDown: function(ev){
        var charCode = ev.which ? ev.which : ev.keyCode
        this.hits[charCode] ? 
            this.hits[charCode]++ : 
            this.hits[charCode] = 1;
        this.addHeat(charCode);
        this.element.find('td[data-code=' + charCode + ']').addClass('active');
    },

    /** Call when keyup event is fired
        @public
        @param {jQuery.Event} ev - keyup event to grab the key code from
    */
    onKeyUp: function(ev){
        var charCode = ev.which ? ev.which : ev.keyCode
        this.element.find('td[data-code=' + charCode + ']').removeClass('active');
    },

    /** Updates the background color for the key element based on how many times the key has been pressed
        @param {number} charCode - character code for the key to add heat to
    */
    addHeat: function(charCode){
        this.element.find('td[data-code=' + charCode + ']').css('backgroundColor', 'rgba(255,0,0,'+(this.hits[charCode]/100));
    },

    /** Generates a keyboard document fragment, then appends it to the DOM 
        Use document fragments to prevent multiple paints while generating keyboard
    */
    render: function(){
        var keyboardContainer = document.createDocumentFragment();
        var tableFragment = document.createElement('table');
        for (var i = this.activeFormat.length - 1; i >= 0; i--) {
            var row = document.createElement('tr');
            var rowKeys = this.activeFormat[i].reverse();

            for (var x = rowKeys.length - 1; x >= 0; x--) {
                var keyCode = rowKeys[x].toUpperCase().charCodeAt(0);
                var key = document.createElement('td');

                // These keys won't be picked up correctly by .charCodeAt(), manually map them
                if(['backspace','tab','enter','shift'].indexOf(rowKeys[x]) > -1){
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
                    }
                } else {
                    this.keyMap[keyCode] = rowKeys[x];
                }

                // Set an attribute so we can refer back to the element easily
                key.setAttribute('data-code', keyCode);
                key.innerHTML = rowKeys[x];

                row.appendChild(key);
            }

            tableFragment.appendChild(row);
        }
        keyboardContainer.appendChild(tableFragment);
        this.element.html(keyboardContainer);
    }
});
