
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

let s = "16. Click this instruction 10 times";
let scrabledStrings = [s];
for(let i = 0; i < 10; i++){
    for(let j = 0; j < 3; j++){
        //swap random two letters
        let a = Math.floor(Math.random() * s.length);
        let b = Math.floor(Math.random() * s.length);
        let placeholder = s[a];
        s = s.replaceAt(a, s[b])
        s = s.replaceAt(b, placeholder);
    }
    scrabledStrings.unshift(s);
}
console.log(scrabledStrings)
