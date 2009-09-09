var str = '()-/[]|#@,.?:%^';
var regex = Regex.compile(/\-\(\)[\/\[\]\|#@,\.\?:%\^]/);
var testStr = '(99) 9999-9999';
var maxLength = testStr.length;

for(var z=0; z< 500000; z++){
	for(var i=0; i < maxLength; i++){
		//(str.indexOf(testStr.charAt(i)) >= 0);
		regex.test(testStr.charAt(i));
	}
}