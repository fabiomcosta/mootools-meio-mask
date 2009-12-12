
describe('String.meiomask()', {

	'before all': function(){
		input = new Element('input', {'type': 'text', 'maxlength': 10});
	},
	
	'should set the size of the input': function(){
		input.meiomask('Time', 'Fixed', {autoSetSize: true});
		value_of(input.get('size'), 5);
	},
	
	'should not set the size of the input': function(){
		input.set('size', 10).meiomask('Time', 'Fixed', {autoSetSize: true});
		value_of(input.get('size'), 10);
	},
	
	'should remove the maxlength when mask is set, and reset it when mask is removed': function(){
		input.meiomask('Time', 'Fixed');
		value_of(input.get('maxlength'), null);
		input.erase('meiomask');
		value_of(input.get('maxlength'), 10);
	},
	
	'should set properly the placeholder on the input': function(){
		var el = new Element('input', {'type': 'text'});
		$(document.body).grab(el);
		el.meiomask('Date', 'Fixed');
		el.focus();
		value_of(el.value).should_be('__/__/____');
	},
	
	'should mask the value from the input that actually haves a value': function(){
		var el = new Element('input', {'type': 'text', 'value': '12122000'});
		el.meiomask('Date', 'Fixed');
		value_of(el.value).should_be('12/12/2000');
	},
	
	'should mask a string with the fixed mask type option': function(){
		value_of('12121212'.meiomask('Date', 'Fixed')).should_be('12/12/1212');
	},
	
	'should mask a string with the reverse.dollar mask': function(){
		value_of('12121212'.meiomask('reverse.dollar')).should_be('US$ 12,121,212.00');
	},
	
	'should mask a string with the reverse.integer mask': function(){
		value_of('345678.723'.meiomask('reverse.integer')).should_be('345.679');
	},
	
	'should mask a string with the reverse.decimal mask': function(){
		value_of('345678.728'.meiomask('reverse.decimal')).should_be('345.678,73');
	},
		
	'should unmask the passed string': function(){
		value_of('12/12/2000'.meiounmask('Date', 'Fixed')).should_be('12122000');
	},
	
	'should unmask the passed string to a float number': function(){
		value_of('R$ 123,12'.meiounmask('reverse.reais')).should_be(123.12);
	}

});
