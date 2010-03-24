/*
---

description: A mask that is defined by a regular expression.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Regexp]

...
*/

Meio.Mask.Regexp = new Class({

	Extends : Meio.Mask,

	options: {
		//regex: /^$/
	},

	initialize : function(element, options){
		this.parent(element, options);
		this.regex = new RegExp(this.options.regex);
	},

	keypress: function(e, o){
		if (this.ignore) return true;
		e.preventDefault();
	
		var _char = String.fromCharCode(e.code),
			elValue = this.element.get('value');

		var start = o.range.start, end = o.range.end;
		if (o.isRemoveKey) o.isDelKey ? end++ : start--;
		elValue = elValue.substring(0, start) + (o.isRemoveKey ? '' : _char) + elValue.substring(end);
		
		if (this.regex.test(elValue)) this.element.set('value', elValue).setCaretPosition(start + (o.isRemoveKey ? 0 : 1));
		else this.fireEvent('invalid', [this.element, _char, e.code]);
		
		return true;
	},
	
	paste: function(e, o){
		var elValue = this.element.get('value'), oldValue = '', curValue;
		for (var i = 1; i <= elValue.length; i++){
			curValue = elValue.substring(0, i);
			if (!this.regex.test(curValue)){
				this.fireEvent('invalid', [this.element, elValue.charAt(i), elValue.charCodeAt(i)]);
				break;
			}
			oldValue = curValue;
		}
		this.element.set('value', oldValue).setCaretPosition(i);
	},
	
	mask: function(str){
		return str;
	},

	unmask: function(str){
		return str;
	}

});

Meio.Mask.createMasks('Regexp', {
	'Ip'		: {regex: /^(\d{1,3}\.){0,3}(\d{1,3})?$/},
	'Email'		: {regex: /^[\w.!#$%&'*+=?~^_`{|}\/-]*@?[.\w-]*$/}
});
