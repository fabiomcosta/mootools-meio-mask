
describe('String.meiomask()', {

	'before all': function(){
		input = new Element('input', {'type': 'text', 'maxlength': 10, 'data-meiomask': 'time'});
	},
	
	'should set the size of the input': function(){
		input.meiomask({setSize: true});
		value_of(input.get('size'), 5);
	},
	
	'should not set the size of the input': function(){
		input.set('size', 10).meiomask({setSize: true});
		value_of(input.get('size'), 10);
	},
	
	'should remove the maxlength when mask is set, and reset it when mask is removed': function(){
		input.meiomask();
		value_of(input.get('maxlength'), null);
		input.erase('meiomask');
		value_of(input.get('maxlength'), 10);
	},
	
	'should mask a string with the fixed mask type option': function(){
		value_of('123456'.meiomask('999.999')).should_be('123.456');
	},
	
	'should set properly the placeholder on the input': function(){
		var el = new Element('input', {'type': 'text'});
		$(document.body).grab(el);
		el.meiomask('999/999');
		el.focus();
		//el.destroy();
		value_of(el.value).should_be('___/___');
	}

});
