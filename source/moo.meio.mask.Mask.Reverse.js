
Meio.Mask.Reverse = new Class({

    Extends: Meio.Mask,

    options: {
		alignText: true,
		symbol: '',
		precision: 2,
		decimal: ',',
		thousands: '.',
		maxLength: 19
		//decimal: true
		//signal: false
    },

    initialize: function(element, options){
        this.parent(element, options);
        var escapedDecimalChar = this.options.decimal.escapeRegExp(),
            thousandsChar = this.options.thousands;
        if(this.options.alignText) this.element.setStyle('text-align', 'right');
        this.maxlength = this.maxlength || this.options.maxLength;
        this.thousandsRegex = /(\d+)(\d{3})/;
        this.thousandsReplaceStr = '$1' + thousandsChar + '$2';
        this.thousandReplaceRegex = new RegExp(thousandsChar.escapeRegExp(), 'g');
        this.moveRightRegex = new RegExp('([' + escapedDecimalChar + '])(\\d)', 'g');
        this.moveLeftRegex = new RegExp('(\\d)([' + escapedDecimalChar + '])', 'g');
        var elementValue = this.element.get('value');
        if(elementValue === ''){
            elementValue = this.mask(elementValue);
    		this.element.set('value', elementValue).defaultValue = elementValue;
        }
    },
    
    focus: function(e, o){
        var element = this.element,
            elValue = element.get('value'),
            symbol = this.options.symbol;
        element.set('value', (elValue = this.getValue(elValue, true)));
        if(this.options.selectOnFocus)
            element.setRange(symbol.length, elValue.length);
        this.parent(e, o);
    },
    
    blur: function(e, o){
        this.parent(e, o);
        var element = this.element;
        element.set('value', this.getValue(element.get('value')));
    },
    
    keypress: function(e, o){
    	if(this.isIgnoreKey(e)) return true;
        e.preventDefault();
    	var _char = String.fromCharCode(e.code),
    	    elValueFull = this.element.get('value');

    	elValueFull = elValueFull.substring(0, o.range.start) + (o.isRemoveKey? '': _char) +  elValueFull.substring(o.range.end);
    	var elValue = this.getValue(elValueFull);
	    
	    if(o.isRemoveKey){
	        elValue = elValue.substring(0, elValue.length - 1).replace(this.moveLeftRegex, '$2$1');
	    }
	    else{
	        if(!(/^\d$/).test(_char)) return true;
        	else if(elValue.length >= this.maxlength) return true;
	        elValue = elValue.replace(this.moveRightRegex, '$2$1');
	    }
	    elValue = this.mask(elValue, true);
    	this.element.set('value', elValue).setRange(elValue.length);
    	return true;
    },

    paste: function(e, o){
        e.preventDefault();
		var element = this.element;
		    elValue = element.get('value');
		element.set('value', (elValue = this.mask(elValue, true))).setRange(elValue.length);
        return true;
    },
    
    mask: function(str, withSymbol){
        str = str || '0';
        str = this.unmask(str).replace('.', this.options.decimal);
        return this.getValue(this.maskThousands(str), withSymbol);
    },
    
    unmask: function(str){
	    return this.toNumber(this.getValue(str));
    },
    
    toNumber: function(str){
        if(!isFinite(str)){
            var thousandsChar = this.options.thousands,
                decimalChar = this.options.decimal;
    	    if(thousandsChar) str = str.replace(this.thousandReplaceRegex, '');
    	    if(decimalChar) str = str.replace(decimalChar, '.');
        }
        return str.toFloat().toFixed(this.options.precision);
    },
    
    getValue: function(str, withSymbol){
        var symbol = this.options.symbol;
        return (str.substring(0, symbol.length) === symbol)?
            withSymbol? str: str.substring(symbol.length):
            withSymbol? symbol + str: str;
    },
    
    maskThousands: function(str){
        if(this.options.thousands){
            while(this.thousandsRegex.test(str)) str = str.replace(this.thousandsRegex, this.thousandsReplaceStr);
        }
        return str;
    }
    
});

Meio.Mask.createMasks('Reverse', {
    'Integer'			: { precision: 0 },
	'Decimal'			: { },
	'DecimalUs'         : { thousands: ',', decimal: '.' },
	'Reais'			    : { symbol: 'R$ ' },
	'Dollar'			    : { symbol: 'US$ ', thousands: ',', decimal: '.' }
});
