#!/usr/bin/env js
/*
// Find by regex or by string?
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
*/

// Need to convert from 1231231 to 1.123.123, whats faster:
// 1 - convert to array and insert the dot where needed
// 2 - maintaing string and make a while with a regex to make the groups -- seens to be faster and code is smaller

var re = new RegExp('(\\d+)(\\d{3})');
for(var z=0; z< 5000; z++){
    var str = '12312321321312321331,123';
    while(re.test(str)) {
        str = str.replace(re, '$1.$2');
    }
    /*
    var numberArray = str.split('');
    for(var i = numberArray.length, reversePos = 1; i--;){
        if(reversePos%3 == 0){
            numberArray.splice(i, 0, '.');
        }
        reversePos++;
    }
    str = numberArray.join('');
    */
}
print(str);
