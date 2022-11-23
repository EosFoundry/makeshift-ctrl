// Welcome to makesh*t-ctrl alpha!

// add plugins you want to use here as a string
// makeshift-ctrl will look them up and attach them
// in the plugins object if they exist
const requiredPlugins = [
	'ctrlTerm',
]

// makeshift-ctrl will load the plugins into this object
const plugins = {};

let ctrlTerm = {};

// you can delcare variables outside of functions
let some = 'Hello worlb'
let words = ' from makeshift-ctrl!'
let message = ''


// makeshift-ctrl will run this function once
// as soon as the cue is first loaded in
function setup() {
	// assigning a local alias can help readability
	ctrlTerm = plugins['ctrlTerm']

	// values that you know ahead of time can be calculated here
	// so you don't have to do it every time the button is pressed
	message = some + words
}

// This function is local to this cue, you can call it from 
// anywhere in your code
function sayHello() {
	// variables declared inside functions only exist inside functions

	// javascript allows you to add strings directly

	// this line uses an imported plugin
	plugins['ctrlTerm'].log(message)

	// use the alias - it's the same as above, but looks slightly nicer
	ctrlTerm.log(message)
}

// Put your main code in the run() function below 
// this is the code that runs every time a button is pressed
function run() {
	sayHello()
}

// These are the only names that makeshift-ctrl looks for
// when it interacts with your cue
//
// NOTE: if you delete any of these, it's very likely something will break!
module.exports = {
	requiredPlugins,
	plugins,
	setup,
	run,
}
// There may be stuff in the future that makes use of other exports