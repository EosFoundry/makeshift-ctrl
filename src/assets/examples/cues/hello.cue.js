// Welcome to makesh*t-ctrl alpha!

// add plugins you want to use here as a string
const requiredPlugins = [
  'terminal',
]

// // makeshift-ctrl will load the plugins into this object
// let plugins = {};

// // if using terminal, this object will be filled with the appropriate
// // logging function
let terminal = {};

// you can delcare global variables anywhere
// let x = 12
let words = 'hello worlb!'

// this declares a function with the name 'sayHello'
function sayHello() {
	terminal.log(words)
}

// Put your code in the run() function below 
function run() {
	console.log('taster')
	terminal.log('toaster')
	// sayHello()
}

module.exports = {
	requiredPlugins,
	terminal,
	words,
	sayHello,
	run,
}