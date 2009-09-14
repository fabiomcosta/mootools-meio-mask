Meio.Mask.Reverse = new Class({

    Extends: Meio.Mask,

    options: {
		alignText: true,
		symbol: '',
		precision: 2,
		decimal: ',',
		thousands: '.'
		//decimal: true
		//signal: false
    },

    initialize: function(element, options){
        this.parent(element, options);
        if(this.options.alignText) this.element.setStyle('text-align', 'right');
		//this.maskMold = this.element.get('value') || this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeholder);
		//this.maskMoldArray = this.maskMold.split('');
		// this.validIndexes = [];
		// this.maskArray.each(function(c, i){
		//    if(!this.isFixedChar(c)) this.validIndexes.push(i);
		// }, this);
		// this.mask.options.maskArray.reverse();
        // if(this.$el.get('value') == '') this.$el.set('value', .mask(this.mask.options));
        this.initRegex = new RegExp('^' + this.options.symbol.escapeRegExp());
    },
    
    _paste: function(e, o){
        return true;
    },

    _keypress: function(e, o){
    	if(this.isIgnoreKey(e)) return true;
        e.preventDefault();
        
    	var c = String.fromCharCode(e.code),
    		rangeStart = o.range.start,
    		rawValue = o.value,
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0, rangeStart),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end, rawValue.length);

		rawValue = (valueStart + c + valueEnd);
	
    	var valueArray = rawValue.replace(opt.fixedCharsRegG, '').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(rangeStart, opt.fixedCharsReg);

    	o.rsEp = rangeStart + extraPos;
    	if(!this.testEvents(maskArray, o.rsEp, c, e.code)) return false;
    	this.$el.set('value', this.__mask(valueArray, this.globals, opt));

    	//fix for ie
    	//this bug was pointed by Pedro Martins
    	//it fixes a strange behavior that ie was having after a char was inputted in a text input that
    	//had its content selected by any range 
    	if(Browser.Engine.trident && ((rangeStart==0 && o.range.end==0) || rangeStart != o.range.end))
    		this.$el.setRange(o.value.length);

    	return true;
    },

    mask: function(str){
        return this._applyMask(str).value.join('');
    },
    
    unmask: function(str){
        var thousandChar = this.options.thousands,
	        precision = this.options.precision;
	    if(thousandChar) str = str.replace(thousandChar, '');
	    if(this.options.symbol) str = str.replace(this.initRegex, '');
	    return (precision)? str.replace(this.options.decimal, '.').toFloat().toFixed(precision): str.toInt();
    }
});

Meio.Mask.createMasks('Reverse', {
    'Integer'			: { precision: 0 },
	'Decimal'			: { },
	'DecimalUs'         : { thousands: ',', decimal: '.' },
	'Reais'			    : { symbol: 'R$' },
	'Dolar'			    : { symbol: 'US$', thousands: ',', decimal: '.' }
});
