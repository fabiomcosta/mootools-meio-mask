
Meio.Mask.Reverse = new Class({

    Extends: Meio.Mask,

    options: {
        selectOnFocus: false,
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
    
    paste: function(e, o){
        return true;
    },
    
    focus: function(e, o){
        this.element.set('value', this.options.symbol + this.element.get('value'));
        this.parent(e, o);
    },
    
    blur: function(e, o){
        this.parent(e, o);
        this.element.set('value', this.element.get('value').substring(this.options.symbol.length));
    },
    
    keypress: function(e, o){
    	if(this.isIgnoreKey(e)) return true;
        e.preventDefault();
    	return true;
    },
    
    maskThousand: function(str){
        var replaceStr = '$1' + this.options.thousands + '$2';
        while(this.thousandRegex.test(str)) {
            str = str.replace(this.thousandRegex, replaceStr);
        }
        return str;
    },
    
    mask: function(str){
        var number = Number(str);
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
    }
});

Meio.Mask.createMasks('Reverse', {
    'Integer'			: { precision: 0 },
	'Decimal'			: { },
	'DecimalUs'         : { thousands: ',', decimal: '.' },
	'Reais'			    : { symbol: 'R$ ' },
	'Dolar'			    : { symbol: 'US$ ', thousands: ',', decimal: '.' }
});
