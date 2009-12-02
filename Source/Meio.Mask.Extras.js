/*
---

description: MeioMask.Extras

authors:
  - Fábio Miranda Costa

requires:
	MeioMask

license:
  MIT-style license

version:
  0.8

provides:
	MeioMask.Extras

...
*/

(function(){

	Meio.Mask.dumbInput = new Element('input', {'type': 'text'});
	
	var upperCamelize = function(str){
		return str.camelCase().capitalize();
	};
	
	var getClassOptions = function(args){
		var classNames = [];
		args = Array.link(args, {mask: String.type, type: String.type, options: Object.type, klass: Class.type});
		if(args.mask) classNames = args.mask.contains('.')? args.mask.split('.'): [args.type, args.mask];
		var klass = args.klass || Meio.Mask[upperCamelize(classNames[0])][upperCamelize(classNames[1])],
		    options = args.options || {};
		return {klass: klass, options: options};
	};
	
	var executeFunction = function(functionName, args){
		var co = getClassOptions(args);
		Meio.Mask.dumbInput.set('value', '');
		return new co.klass(Meio.Mask.dumbInput, co.options)[functionName](this);
	};

	String.implement({
		meiomask: function(){
			return executeFunction.call(this, 'mask', arguments);
		},
		meiounmask: function(){
			return executeFunction.call(this, 'unmask', arguments);
		}
	});

	Element.Properties.meiomask = {
		set: function(){
			var args = getClassOptions(arguments);
			return this.store('meiomask', new args.klass(this, args.options));
		},
		// returns the mask object
		get: function(){
			return this.retrieve('meiomask');
		},
		// removes the mask from this input but maintain the mask object stored at its table
		erase: function(){
			var mask = this.retrieve('meiomask');
			if(mask) mask.remove();
			return this;
		}
	};

	// fix for maxlength property, you will have to use get/set/erase 'maxlength', lowercased for this to work
	Element.Properties.maxLength = Element.Properties.maxlength = {
		set: function(value){
			this.setAttribute('maxLength', value);
			return this;
		},
		get: function(){
			var ml = this.getAttribute('maxLength', 2);
			return (ml === 2147483647)? null: ml;
		},
		erase: function(){
			this.removeAttribute('maxLength');
			return this;
		}
	};
	
	/*
	Element.Properties.value = {
		// sets the value but first it applyes the mask (if theres any)
		set: function(value){
			var mask = this.retrieve('meiomask');
			if(mask) value = mask.maskString(value);
			return this.setProperty('value', value);
		}
	};
	*/
	
	Element.implement({
		meiomask: function(mask, type, options){
			return this.set('meiomask', mask, type, options);
		}
	/*,
		// http://www.bazon.net/mishoo/articles.epl?art_id=1292
		setRange : function(start, end){
			end = $pick(end, start);
			if (this.setSelectionRange){
				this.setSelectionRange(start, end);
			}
			else{
				var range = this.createTextRange();
				range.collapse();
				range.moveStart('character', start);
				range.moveEnd('character', end - start);
				range.select();
			}
		},

		// adaptation from http://digitarald.de/project/autocompleter/
		getRange : function(){
			if (!Browser.Engine.trident) return {start: this.selectionStart, end: this.selectionEnd};
			var pos = {start: 0, end: 0},
				range = document.selection.createRange();
			pos.start = 0 - range.duplicate().moveStart('character', -100000);
			pos.end = pos.start + range.text.length;
			return pos;
		}
*/
	});

})();
