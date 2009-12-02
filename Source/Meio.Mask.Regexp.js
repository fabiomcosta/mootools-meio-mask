/*
---

description: MeioMask.Regexp

authors:
  - Fábio Miranda Costa

requires:
	MeioMask

license:
  MIT-style license

version:
  0.8

...
*/

Meio.Mask.Regexp = new Class({

	Extends : Meio.Mask,

	options: {
		//maxLength: 18
		//regex: /^$/
	},

	initialize : function(element, options){
		this.parent(element, options);
		this.regex = new RegExp(this.options.regex);
	},

	keypress: function(e, o){
		if(this.ignore) return true;
		e.preventDefault();
	
		var _char = String.fromCharCode(e.code),
			elValue = this.element.get('value');
    
		elValue = elValue.substring(0, o.range.start) + (o.isRemoveKey? '': _char) +  elValue.substring(o.range.end);
		if(this.regex.test(elValue)){
			this.element.set('value', elValue);
		}
		return true;
	}

});

Meio.Mask.createMasks('Regexp', {
    'Ip'		: { regex: /^(\d{1,3})(\.\d{1,3}){0,3}?$/, maxLength: 15 }
});
