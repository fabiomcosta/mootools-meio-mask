
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
        this.thousandRegex = /(\d+)(\d{3})/;
        //this.initialCharsRegex = new RegExp('^' + this.options.symbol.escapeRegExp());
    },
    
    focus: function(e, o){
        var element = this.element,
            elValue = element.get('value'),
            symbol = this.options.symbol;
        if(elValue.substring(0, symbol.length) !== symbol)
            element.set('value', (elValue = symbol + elValue));
        if(this.options.selectOnFocus)
            element.setRange(symbol.length, elValue.length);
        this.parent(e, o);
    },
    
    blur: function(e, o){
        this.parent(e, o);
        var symbol = this.options.symbol,
            element = this.element,
            elValue = element.get('value');
        if(elValue.substring(0, symbol.length) === symbol)
            element.set('value', elValue.substring(symbol.length));
    },
    
    keypress: function(e, o){
    	if(this.isIgnoreKey(e)) return true;
        e.preventDefault();
    	return true;
    },

    paste: function(e, o){
        e.preventDefault();
		var element = this.element;
		    elValue = element.get('value');
		element.set('value', (elValue = this.mask(elValue))).setRange(elValue.length);
        return true;
    },
    
    mask: function(str){
        var number = Number(str.substring(this.options.symbol.length));
        str = '' + number.toFixed(this.options.precision);
        str = str.replace('.', this.options.decimal);
        return this.options.symbol + (this.options.thousands? this.maskThousand(str): str);
    },
    
    unmask: function(str){
        var thousandChar = this.options.thousands,
	        precision = this.options.precision,
	        symbol = this.options.symbol;
	    if(thousandChar) str = str.replace(thousandChar, '');
	    if(symbol) str = str.substring(symbol.length);
	    return (precision)? str.replace(this.options.decimal, '.').toFloat().toFixed(precision): str.toInt();
    },
    
    maskThousand: function(str){
        var replaceStr = '$1' + this.options.thousands + '$2';
        while(this.thousandRegex.test(str)) {
            str = str.replace(this.thousandRegex, replaceStr);
        }
        return str;
    }
    
});

Meio.Mask.createMasks('Reverse', {
    'Integer'			: { precision: 0 },
	'Decimal'			: { },
	'DecimalUs'         : { thousands: ',', decimal: '.' },
	'Reais'			    : { symbol: 'R$ ' },
	'Dolar'			    : { symbol: 'US$ ', thousands: ',', decimal: '.' }
});
