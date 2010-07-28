
module('Unit Tests and some simple user emulated', {
	setup: function() {
		input = new Element('input', {id: 'input-id', type: 'text', maxLength: 10}).inject(document.body);
	},
	teardown: function(){
		$('input-id').destroy();
	}
});

test('should set the size of the input', function(){
	input.meiomask('Fixed', 'Time', {autoSetSize: true});
	equals(input.get('size'), 5);
});

test('should not set the size of the input', function(){
	input.set('size', 10).meiomask('Fixed', 'Time', {autoSetSize: true});
	equals(input.get('size'), 10);
});

test('should remove the maxlength when mask is set, and reset it when mask is removed', function(){
	input.meiomask('Fixed', 'Time');
	equals(input.get('maxLength'), null);
	input.erase('meiomask');
	equals(input.get('maxLength'), 10);
});

test('should set properly the placeholder on the input', function(){
	input.meiomask('Fixed', 'Date');
	input.focus();
	equals(input.value, '__/__/____');
});

test('should mask the value from the input that actually haves a value', function(){
	var el = new Element('input', {'type': 'text', 'value': '12122000'});
	el.meiomask('Fixed', 'Date');
	equals(el.value, '12/12/2000');
});

test('should mask a string with the fixed mask type option', function(){
	equals('12121212'.meiomask('Fixed', 'Date'), '12/12/1212');
});

test('should mask a string with the reverse.dollar mask', function(){
	equals('12121212'.meiomask('reverse.dollar'), '12,121,212.00');
});

test('should mask a string with the reverse.integer mask', function(){
	equals('345678.723'.meiomask('reverse.integer'), '345.679');
});

test('should mask a string with the reverse.decimal mask', function(){
	equals('345678.728'.meiomask('reverse.decimal'), '345.678,73');
});
	
test('should unmask the passed string', function(){
	equals('12/12/2000'.meiounmask('Fixed', 'Date'), '12122000');
});

test('should unmask the passed string to a float number', function(){
	equals('R$ 123,12'.meiounmask('reverse.reais'), 123.12);
});
