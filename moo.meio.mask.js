/* $Id: moo.meiomask.js 52 2008-12-08 02:09:39Z fabiomcosta $ */
/**
 * @version 1.0.0 $Rev: 52 $
 * The MIT License
 * Copyright (c) 2008 Fabio Miranda Costa http://www.meiocodigo.com
 */
/**
 * moo.meiomask.js
 * $URL: http://svn.assembla.com/svn/meiomask/moo.meiomask.js $
 * @author: $Author: fabiomcosta $
 * @version 1.0.0 $Rev: 52 $
 * @lastchange: $Date: 2008-12-08 00:09:39 -0200 (Mon, 08 Dec 2008) $
 *
 * Created by Fabio M. Costa on 2008-09-16. Please report any bug at http://www.meiocodigo.com
 *
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

if (!$defined(meio)) var meio = {};

// add the paste event
// browsers like firefox2 and before and opera doenst have the onPaste event, but the paste feature can be done with the onInput event.
$extend(Element.NativeEvents,{
	'paste' : 2, 'input' : 2
});
Element.Events.paste = {
	base : ( Browser.Engine.presto || ( Browser.Engine.gecko && Browser.Engine.version < 19 ))?'input':'paste',
	condition: function(e){
		// because of a ie bug this event needs this delay so i can access the value ofthe input that we are pasting
		// thanks Jan Kassens
		this.fireEvent('paste', e, 1);
		return false;
	}
};// this is the class that will contain all the 
meio.MaskGlobals = new Hash({

	init : function(){
		
		if(!this.inited){
			var self = this,i,
				keyRep = ( Browser.Platform.ipod ) ? this.iphoneKeyRepresentation : this.keyRepresentation;
			
			this.setFixedChars(this.fixedChars);
			
			// constructs number rules
			for(i=0; i<=9; i++) this.rules[i] = new RegExp('[0-'+i+']');
	
			this.keyRep = keyRep;
			this.ignoreKeys = [];
			// ignore keys array creation for iphone or the normal ones
			Hash.each(keyRep, function(val,key){
				self.ignoreKeys.push( key.toInt() );
			});
			this.inited = true;
		}
		return this;
		
	},
	
	reInit : function(){
		this.inited = false;
		return this.init();
	},
	
	// use this function to change the fixedChars after initialiazing any mask.
	// Be aware that it will change for all masks, since they have a pointer to this object (not a copy)
	setFixedChars : function(fixedChars){
		this.fixedCharsReg = new RegExp(this.fixedChars);
		this.fixedCharsRegG = new RegExp(this.fixedChars,'g');
		return this;
	},
	
	// the mask rules. You may add yours!
	// number rules will be overwritten
	rules : {
		'z': /[a-z]/,
		'Z': /[A-Z]/,
		'a': /[a-zA-Z]/,
		'*': /[0-9a-zA-Z]/,
		'@': /[0-9a-zA-ZçÇáàãéèíìóòõúùü]/
	},
	
	// fixed chars to be used on the masks. You may change it for your needs!
	fixedChars : '[(),.:/ -]',
	
	// these keys will be ignored by the mask.
	// all these numbers where obtained on the keydown event
	keyRepresentation : {
		8	: 'backspace',
		9	: 'tab',
		13	: 'enter',
		16	: 'shift',
		17	: 'control',
		18	: 'alt',
		27	: 'esc',
		33	: 'page up',
		34	: 'page down',
		35	: 'end',
		36	: 'home',
		37	: 'left',
		38	: 'up',
		39	: 'right',
		40	: 'down',
		45	: 'insert',
		46	: 'delete',
		116	: 'f5',
		224	: 'command'
	},

	iphoneKeyRepresentation : {
		10	: 'go',
		127	: 'delete'
	},

	signals : {
		'+' : '',
		'-' : '-'
	},

	// masks. You may add yours!
	// Ex: $.fn.setMask.masks.msk = {mask: '999'}
	// and then if the 'attr' options value is 'alt', your input should look like:
	// <input type="text" name="some_name" id="some_name" alt="msk" />
	masks : {
		'phone'				: { mask : '(99) 9999-9999' },
		'phone-us'			: { mask : '(999) 999-9999' },
		'cpf'				: { mask : '999.999.999-99' }, // cadastro nacional de pessoa fisica
		'cnpj'				: { mask : '99.999.999/9999-99' },
		'date'				: { mask : '39/19/9999' }, //uk date
		'date-us'			: { mask : '19/39/9999' },
		'cep'				: { mask : '99999-999' },
		'time'				: { mask : '29:59' },
		'cc'				: { mask : '9999 9999 9999 9999' }, //credit card mask
		'integer'			: { mask : '999.999.999.999', type : 'reverse' },
		'decimal'			: { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '000' },
		'decimal-us'		: { mask : '99.999,999,999,999', type : 'reverse', defaultValue : '000' },
		'signed-decimal'	: { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '+000' },
		'signed-decimal-us' : { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '+000' }
	}

});
meio.Mask = new Class({

	Implements : [Options,Events],

	// default settings for the plugin
	options : {
		//all masks option
		attr : 'alt', // an attr to look for the mask name or the mask itself
		mask : null, // the mask to be used on the input
		type : 'fixed' // the mask of this mask
		
		//onInvalid : $empty,
		//onValid : $empty,
		//onOverflow : $empty //doesnt work yet at regexp mask
		
		//fixed mask options
		//placeHolder : false, // can be a char. ex : '_'. This char CAN'T be a fixedChar.
		
		//reverse mask
		//defaultValue : '', // the default value for this input
		//signal : false	// this should not be set, to use signal at masks put the signal you want ('-' or '+') at the default value of this mask.
						// See the defined masks for a better understanding.
	},

	initialize : function(el,options){

		this.$el = $(el);
		// verify if the el is a text input element, if its not the case this class doenst work for it 
		if( this.$el.get('tag')!='input' || this.$el.get('type')!='text' ) return;

		this.globals = meio.MaskGlobals.init();
		
		//apply the mask
		this.change(options);
	
	},

	change : function(options){
		options = $pick(options, {});
		
		// see whats the attr that we have to look
		if( options.attr ) this.options.attr = options.attr;
		
		var attrValue = this.$el.get(this.options.attr),
			tmpMask;
	
		// then we look for the 'attr' option
		tmpMask = ( $type(options) == 'string' ) ? options : (attrValue) ? attrValue : null;
		if(tmpMask) this.options.mask = tmpMask;
		
		// then we see if it's a defined mask
		if(this.globals.masks[this.options.mask])
			this.setOptions(this.globals.masks[this.options.mask]);
		
		// apply the json options if any
		// be carefull, your JSON sould be always a valid one.
		// Ex: alt='{"mask":"999:999"}' works (its the ONLY accepted format)
		// alt="{'mask':'999:999'}" doenst work
		// alt='{mask:"999:999"}' doenst work
		// alt="other way", doesnt work!
		if( JSON ) this.setOptions( JSON.decode(tmpMask,true) );
		
		// merge options cause it will allways overwrite everything
		if( $type(options) == 'object' ) this.setOptions(options);
		
		if( this.options.mask ){
			
			// if theres a mask stored at this element, remove it
			if(this.$el.retrieve('mask')) this.remove();
			
			var mlStr = 'maxLength',
				mlValue = this.$el.get(mlStr);

			this.setOptions({
				maxlength : mlValue,
				maskArray : this.options.mask.split(''),
				maskNonFixedChars : this.options.mask.replace(this.globals.fixedCharsRegG,'')
			});
	
			// apply mask to the current value of the input
			if(this.$el.get('value')!='') this.$el.set('value', this.$el.get('value').mask(this.options) );
			
			this.$el.store('mask',this)
			    // removes the maxlength attribute (it will be set again if you use the unsetMask method)
			    .erase(mlStr);
			
			this.maskType = new meio.MaskType[this.options.type](this);
			
		}
		return this;
		
	},
	
	// removes the mask
	remove : function(){
		var mask = this.$el.retrieve('mask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength != -1) this.$el.set('maxLength',maxLength);
			
			mask.maskType.eventsToBind.each(function(evt){
				this.$el.removeEvent(evt,this[evt+'Event']);
			}.bind(mask.maskType));
		}
		return this;
	}
    
});meio.MaskType = new Class({
    
    initialize : function(mask){
        
        this.ignore = false;
        if(mask){
            this.mask = mask;
            this.globals = mask.globals;
            this.$el = mask.$el;
            //event creation
    		this.eventsToBind = ['keydown','keypress','keyup','paste'];
    		this.eventsToBind.each(function(evt){
    		    this[evt+'Event'] = this._onMask.bindWithEvent(this,this['_'+evt]);
    			this.$el.addEvent( evt , this[evt+'Event'] );
    		}.bind(this));
        }
        
    },
    
	_onMask : function(e,func){
		var o = {};
		e = new Event(e);
		// if the input is readonly it does nothing
		if( this.$el.get('readonly') ) return true;
		o.value = this.$el.get('value');
		o.range = this.$el.getRange();
		o.valueArray = o.value.split('');
		//o[this.options.type] = true;
		return func.call(this,e,o);
	},
    
    _keydown : function(e,o){
    	// lets say keypress at desktop == keydown at iphone (theres no keypress at iphone)
    	this.ignore = this.globals.ignoreKeys.contains(e.code);
    	if( this.ignore ){
    		var rep = this.globals.keyRep[e.code];
    		this.mask.fireEvent('valid',[this.$el,rep?rep:'',e.code]);
    	}
    	return Browser.Platform.ipod ? this._keypress(e,o) : true;
    },
    
    _keyup : function(e,o){
    	//9=TAB_KEY
    	//this is a little bug, when you go to an input with tab key
    	//it would remove the range selected by default, and that's not a desired behavior
    	if(e.code==9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
    	return this._paste(e,o);
    },
    
    testEvents : function(maskArray,rsEp,c,code){
        // if the rule for this character doesnt exist (value.length is bigger than mask.length)
    	if( !this.globals.rules[maskArray[rsEp]] ){
    		this.mask.fireEvent('overflow',[this.$el,c,code]);
    		return false;
    	}
    	// if the new character is not obeying the law... :P
    	else if( !this.globals.rules[maskArray[rsEp]].test( c ) ){
    		this.mask.fireEvent('invalid',[this.$el,c,code]);
    		return false;
    	}
    	else
    	    this.mask.fireEvent('valid',[this.$el,c,code]);
    	return true;
    },
    
    __mask : function(valueArray){
        return valueArray.join('');
    }
    
});
meio.MaskType.fixed = new Class({
    
    Extends : meio.MaskType,
    
    options : {
        placeHolder : false // can be a char. ex : '_'. This char CAN'T be a fixedChar.
    },
    
    _paste : function(e,o){
    	this.$el.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ) );
    	//fix so ie's caret won't go to the end of the input value.
    	if( Browser.Engine.trident || Browser.Engine.webkit )
    	    this.$el.setRange(o.range.start,o.range.end);
    	return true;
    },
    
    _keypress : function(e,o){

    	if( this.ignore || e.control || e.meta || e.alt ) return true;

    	var c = String.fromCharCode(e.code),
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
    		valueArray = o.value.replace(this.globals.fixedCharsRegG,'').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(o.range.start,this.globals.fixedCharsReg);

    	o.rsEp = o.range.start+extraPos;

		if( !this.testEvents(maskArray, o.rsEp, c, e.code) ) return false;

		this.$el.set('value' , this.__mask( valueArray , this.globals , opt , extraPos) );

    	if(o.range.start==o.range.end){
    		// the 0 thing is cause theres a particular behavior i wasnt liking when you put a default
    		// value on a fixed mask and you select the value from the input the range would go to the
    		// end of the string when you enter a char. with this it will overwrite the first char wich is a better behavior.
    		// opera fix, cant have range value bigger than value length, i think it loops thought the input value...
    		if( (o.rsEp==0 && o.value.length==0) || o.rsEp < o.value.length )
    			this.$el.setRange(o.rsEp,o.rsEp+1);	
    	}
    	else
    		this.$el.setRange(o.range.start,o.range.end);

    	return true;
    },
    
    __mask : function( valueArray, globals , o , extraPos){
        return valueArray.__mask( globals, o, extraPos ).join('').substring(0,o.maskArray.length);
    }

});meio.MaskType.infinite = new Class({
    
    Extends : meio.MaskType,
    
    _keyup : function(e,o){
    	return true;
    },
    
    _paste : function(e,o){
        this.$el.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ) );
    	return true;
    },
    
    _keypress: function(e,o){

    	if( this.ignore || e.control || e.meta || e.alt ) return true;
    	var c = String.fromCharCode(e.code),
    		maskArray = this.mask.options.maskArray,
            valueArray = o.value.replace(this.globals.fixedCharsRegG,'').split('');
        if( !this.testEvents(maskArray, 0, c, e.code) ) return false;
    	this.$el.set('value', valueArray.join('') );
    	return true;

    }
    
});
meio.MaskType.reverse = new Class({
    
    Extends : meio.MaskType,
    
    options : {
        defaultValue : '', // the default value for this input
		signal : false	// this should not be set, to use signal at masks put the signal you want ('-' or '+') at the default value of this mask.
    },
    
    initialize : function(mask){
        this.parent(mask);
        if(mask){
            var defaultValue = this.mask.options.defaultValue;
            //sets text-align right when applying the mask
            this.$el.setStyle('text-align','right');
            // apply the default value of the mask to the input
            if(defaultValue!='' && this.$el.get('value')=='') this.$el.set('value', defaultValue.mask(this.mask.options) );
        }
    },
    
    _paste : function(e,o){
    	// changes the signal at the data obj from the input
    	this.__changeSignal(e,o);
    	this.$el.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ) );
    	return true;
    },
    
    _keypress: function(e,o){

    	if( this.ignore || e.control || e.meta || e.alt ) return true;

    	// changes the signal at the data obj from the input
    	this.__changeSignal(e,o);

    	var c = String.fromCharCode(e.code),
    		rangeStart = o.range.start,
    		rawValue = o.value,
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0,rangeStart),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end,rawValue.length);

		rawValue = (valueStart+c+valueEnd);
		//necessary, if not decremented you will be able to input just the mask.length-1 if signal!=''
		//ex: mask:99,999.999.999 you will be able to input 99,999.999.99
		if( opt.signal && (rangeStart-opt.signal.length > 0 ) ) rangeStart -= opt.signal.length;

    	var valueArray = rawValue.replace(this.globals.fixedCharsRegG,'').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(rangeStart,this.globals.fixedCharsReg);

    	o.rsEp = rangeStart+extraPos;

    	if( !this.testEvents( maskArray, o.rsEp, c, e.code) ) return false;

    	this.$el.set('value', this.__mask( valueArray , this.globals , opt ) );

    	//fix for ie
    	//this bug was pointed by Pedro Martins
    	//it fixes a strange behavior that ie was having after a char was inputted in a text input that
    	//had its content selected by any range 
    	if(Browser.Engine.trident && ( (rangeStart==0 && o.range.end==0) || rangeStart != o.range.end ) )
    		this.$el.setRange(o.value.length);
    	return false;
    },
    
    __mask : function( valueArray, globals, o, extraPos){
        valueArray.reverse();
        var newValue = valueArray.__mask( globals, o ).reverse();
        return (o.signal || '')+newValue.join('').substring(newValue.length-o.maskArray.length);
    },
    
    __changeSignal : function(e,o){
   		if( this.mask.options.signal !== false ){
   			var inputChar = (o.paste) ? o.value.charAt(0) : e.key ;
   			if( $defined(this.globals.signals[inputChar]) )
   				this.mask.options.signal = this.globals.signals[inputChar];
   		}
   	}
   	
});
meio.MaskType.regexp = new Class({
    
    Extends : meio.MaskType,
    
    initialize : function(mask){
        this.parent(mask);
        this.regExp = new RegExp(this.mask.options.mask);
    },
    
    _keyup : function(e,o){
    	return true;
    },
    
    _paste : function(e,o){
        //for(var i=0 , newValue=''; i < o.value.length; i++) if( this.regExp.test( o.value.charAt(i) ) )
             //newValue += o.value.charAt(i);
        this.$el.set('value', this.regExp.test(o.value) ? o.value : '' );
    	return true;
    },
    
    _keypress: function(e,o){
    	if( this.ignore || e.control || e.meta || e.alt ) return true;
    	var c = String.fromCharCode(e.code),
    		rawValue = o.value,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0,o.range.start),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end,rawValue.length);
        rawValue = (valueStart+c+valueEnd);
        // its a little hard to detect the overflow :s
        if( this.regExp.test( rawValue ) ){
            this.mask.fireEvent('valid',[this.$el,c,e.code]);
            return true;
        }
        else{
            this.mask.fireEvent('invalid',[this.$el,c,e.code]);
            return false;
        }
    }

});
// all these functions were totaly designed to be used internaly with the plugin.
// you wont want to use them with your arrays
Array.implement({

	// gets the array representing an unmasked string and masks it depending on the type of the mask
	__mask : function( globals, o, extraPos){
		this.__removeInvalidChars(o.maskNonFixedChars,globals.rules);
		if(o.defaultValue) this.__applyDefaultValue(o.defaultValue);
		this.__applyMask(o.maskArray,globals.fixedCharsReg,extraPos);
		return this;
	},

	// applyes the default value to the result string
	__applyDefaultValue : function(defaultValue){
		var defLen = defaultValue.length,thisLen = this.length,i;
		//removes the leading chars
		for(i=thisLen-1;i>=0;i--){
			if(this[i]==defaultValue.charAt(0)) this.pop();
			else break;
		}
		// apply the default value
		for(i=0;i<defLen;i++) if(!this[i])
			this[i] = defaultValue.charAt(i);
		
		return this;
	},

	// Removes values that doesnt match the mask from the valueArray
	// Returns the array without the invalid chars.
	__removeInvalidChars : function(maskNonFixedChars,rules){
		// removes invalid chars
		for(var i=0; i<this.length; i++){
			if( maskNonFixedChars.charAt(i)
				&& rules[maskNonFixedChars.charAt(i)]
				&& !rules[maskNonFixedChars.charAt(i)].test(this[i]) ){
					this.splice(i,1);
					i--;
			}
		}
		return this;
	},

	// Apply the current input mask to the valueArray and returns it. 
	__applyMask : function(maskArray,fixedCharsReg,plus){
		plus = plus || 0;
		// apply the current mask to the array of chars
		for(var i=0; i<this.length+plus; i++ ){
			if( maskArray[i] && fixedCharsReg.test(maskArray[i]) )
				this.splice(i,0,maskArray[i]);
		}
		return this;
	},
	
	// searches for fixed chars begining from the range start position, till it finds a non fixed
   	__extraPositionsTill : function(rangeStart,fixedCharsReg){
   		var extraPos = 0;
   		while( fixedCharsReg.test(this[rangeStart]) ){
   			rangeStart++;
   			extraPos++;
   		}
   		return extraPos;
   	}

});
Element.implement({
	
	unmaskedVal : function(){
		return this.get('value').replace(meio.MaskGlobals.init().fixedCharsRegG,'');
	},
	
	mask : function(options){
        return this.set('mask',options);
    },
	
	// http://www.bazon.net/mishoo/articles.epl?art_id=1292
	setRange : function(start,end){
		end = $pick(end,start);
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
	
});

Element.Properties.mask = {
	// sets mask to this input and returns this input
	set : function(options){
		options = $pick(options,{});
		var mask = this.retrieve('mask');
		return this.store('mask' , mask ? mask.change(options) : new meio.Mask(this,options) );
	},
	// sets the mask and return the mask object
	get : function(options){
		this.set('mask',options);
		return this.retrieve('mask');
	},
	// removes the mask from this input but maintain the mask object stored at its hash (it will be removed at window.unload anyway)
	erase : function(){
		var mask = this.retrieve('mask');
		if(mask) mask.remove();
		return this;
	}
	
};
String.implement({
	mask : function(options){
		var globals = meio.MaskGlobals.init(),o = {};
		switch( $type(options) ){
			case 'string':
				// then we see if it's a defined mask
				if(globals.masks[options]) $extend(o,globals.masks[options]);
				else o.mask = options;
				break;
			case 'object':
				$extend(o,options);
		}
		
		//insert signal if any
		if( (o.type=='reverse') && o.defaultValue ){
			var signals = globals.signals;
			// typeof signals[o.defaultValue.charAt(0)] != 'undefined'
			// thats the only way i found to not see warnings on firefox
			if( typeof signals[o.defaultValue.charAt(0)] != 'undefined' ){
				var maybeASignal = this.charAt(0);
				o.signal = options.signal = signals[maybeASignal] ? signals[maybeASignal] : signals[o.defaultValue.charAt(0)];
				o.defaultValue = options.defaultValue = o.defaultValue.substring(1);
			}
		}
		
		if(!o.type) o.type = 'fixed';
		var maskType = new meio.MaskType[o.type];

		o.maskNonFixedChars = o.mask.replace(globals.fixedCharsRegG,'');
		o.maskArray = o.mask.split('');
		return maskType.__mask( this.split('') , globals , o );
		
	}
});