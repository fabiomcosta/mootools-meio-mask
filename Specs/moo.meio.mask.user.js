
module('Automated Functional Tests', {
	setup: function() {
		input = new Element('input', {id: 'input-id', type: 'text', maxLength: 10}).inject(document.body);
	},
	teardown: function(){
		$('input-id').destroy();
	}
});

test('should mask the typed value with the Fixed mask type', function(){
	input.meiomask('Fixed', 'Time');
	stop();
	Syn.click({}, input).type('111', function(){
		start();
		equals(input.value, '11:1_');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('443212', function(){
		start();
		equals(input.value, 'R$ 4.432,12');
	});
});

test('should mask the typed value with the Repeat mask type', function(){
	input.meiomask('Repeat', {mask: '9', maxLength: 4});
	stop();
	Syn.click({}, input).type('441fff45', function(){
		start();
		equals(input.value, '4414');
	});
});

test('should mask the typed value with the Regexp mask type', function(){
	input.meiomask('Regexp', 'Ip');
	stop();
	Syn.click({}, input).type('12gg3456', function(){
		start();
		equals(input.value, '123');
	});
});

test('should mask the typed value with the Regexp mask type', function(){
	input.meiomask('Regexp', 'Ip');
	stop();
	Syn.click({}, input).type('123.45678.999.123', function(){
		start();
		equals(input.value, '123.456.999.123');
	});
});

