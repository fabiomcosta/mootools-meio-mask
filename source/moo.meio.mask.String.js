String.implement({
	mask : function(options){
		var globals = meio.MaskGlobals.init(), o = {};
		switch($type(options)){
			case 'string':
				if(globals.masks[options]) $extend(o, globals.masks[options]);
				else o.mask = options;
				break;
			case 'object':
				$extend(o, options);
		}
		
		//insert signal if any
		if((o.type=='reverse') && o.defaultValue){
			var signals = globals.signals;
			if(typeof signals[o.defaultValue.charAt(0)] != 'undefined'){
				var maybeASignal = this.charAt(0);
				o.signal = options.signal = signals[maybeASignal]? signals[maybeASignal]: signals[o.defaultValue.charAt(0)];
				o.defaultValue = options.defaultValue = o.defaultValue.substring(1);
			}
		}
		
		if(!o.type) o.type = 'fixed';
		var maskType = new meio.MaskType[o.type];

		o.maskNonFixedChars = o.mask.replace(globals.fixedCharsRegG, '');
		o.maskArray = o.mask.split('');
		return maskType.__mask(this.split(''), globals, o);
	}
});