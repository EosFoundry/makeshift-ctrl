# makeshift-ctrl

Desktop interface for the MakeShift

## What is everything?

Everything is pain and under construction.

## Setting up Development Environment

Required tooling:

- git
- nodejs - node and npm
- some sort of IDE

### NodeJS version management

Using nvm is *highly* recommended to keep the chaos of node versioning somewhat contained.

Linuxs/MacOS: nvm - <https://github.com/nvm-sh/nvm>

Windows: nvm-windows - <https://github.com/coreybutler/nvm-windows>

### IDE Setup

This project has been developed in emacs and vscode. For beginners, vscode is likely easier to start with.

#### VSCode

[Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/install) terminal is optional but somewhat recommended. VSCode's internal terminal is often quite clunky.

Plugins:

- Vue Language Features: <https://github.com/johnsoncodehk/volar/tree/master/extensions/vscode-vue-language-features>

#### Emacs

Emacs 28+ is highly recommended, native-comp speeds things up greatly. All Emacs development has been using Doom Emacs, it is untested under vanilla so some tinkering may be required to get code completion/etc. working.

Useful extensions:

- treemacs: <https://github.com/Alexander-Miller/treemacs>
- vterm: <https://github.com/akermu/emacs-libvterm>
- lsp-mode with volar client: <https://github.com/emacs-lsp/lsp-mode>

### Starting Development

Clone repo:

```bash
git clone https://github.com/EosFoundry/makeshift-ctrl.git
```

Install package dependencies

```bash
cd makeshift-ctrl/
npm install
```

Now you're ready to run the dev server.

## Building and Runninng

This section assumes the reader has set up a dev environment and has cloned the project

### Running

Run the development server:

```bash
npm run dev
```

This will launch a live application that should respond to code changes after files are saved.

### Building

Build a package:

```bash
npm run build
```

The build output can be found in `./release` once the build completes, the options can be tweaked and fiddled with in `./electron-builder.yml` - see <https://www.electron.build/> for more details (however the documentation is... spotty).

Currently this project uses [electron-builder](https://www.electron.build/), a move to [electron forge](https://www.electronforge.io/) is planned in the near future.
