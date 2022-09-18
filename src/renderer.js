// import Terminal from 'xterm';

var term = new Terminal({
    fontFamily: 'Fira Code, Iosevka, monospace',
    fontSize: 12,
    experimentalCharAtlas: 'dynamic'
});
term.open(document.getElementById('terminal'));
term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
