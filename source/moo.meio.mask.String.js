	
	Meio.Mask.DumbInput = new Element('input', {'type': 'text'});
	String.implement({
		meiomask: function(mask, type, options){
			return new Meio.Mask[type][mask](Meio.Mask.DumbInput, options || {}).mask(this);
		}
	});

//})();