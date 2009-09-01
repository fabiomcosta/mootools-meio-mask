	String.implement({
		meiomask: function(options){
			var globals = Meio.MaskGlobals.get(),
				o = {type: 'fixed'};

			switch($type(options)){
				case 'string':
					if(globals.masks[options]) $extend(o, globals.masks[options]);
					else o.mask = options;
					break;
				case 'object':
					$extend(o, options);
			}
			
			//console.log(o);
			
			//insert signal if any
			/*if((o.type=='reverse') && o.defaultValue){
				var signals = globals.signals;
				if(typeof signals[o.defaultValue.charAt(0)] != 'undefined'){
					var maybeASignal = this.charAt(0);
					o.signal = options.signal = signals[maybeASignal]? signals[maybeASignal]: signals[o.defaultValue.charAt(0)];
					o.defaultValue = options.defaultValue = o.defaultValue.substring(1);
				}
			}*/
			//if(!o.fixedChars) o.fixedChars = Meio.Mask.options.fixedChars;
			//o.fixedCharsReg = new RegExp(o.fixedChars);
			//o.fixedCharsRegG = new RegExp(o.fixedChars, 'g');

			//if(!o.type) o.type = 'fixed';
			var opt = {};
			opt.globals = globals;
			opt.options = o;
			var maskType = new Meio.MaskType[o.type](opt);

			//o.maskNonFixedChars = o.mask.replace(o.fixedCharsRegG, '');
			//o.maskArray = o.mask.split('');
			return maskType.mask(this);//maskType.__mask(this.split(''), globals, o);
		}
	});

//})();