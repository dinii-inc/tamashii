# tamashii

Tamashii assists in resolving internal packages within a monorepo, particularly for private repositories.

# How tamashii helps your work

To use JavaScript packages within the same monorepo in a private monorepo, there are several challenges:

- Depending on the package manager, you may need to delete the 'node_modules' directory and reinstall it to reflect the latest changes.
- Directly specifying the package directory copies the 'node_modules' as-is, including "devDependencies", leading to changes in the resolution of dependencies depending on the environment.
- If a build is required, setting up mechanisms to automatically execute the build for multiple dependencies is necessary.

"tamashii" resolves these challenges with just a few simple commands.

<!-- toc -->
* [tamashii](#tamashii)
* [How tamashii helps your work](#how-tamashii-helps-your-work)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

## Installation

<!-- usage -->
```sh-session
$ npm install -g @dinii-inc/tamashii
$ tamashii COMMAND
running command...
$ tamashii (--version)
@dinii-inc/tamashii/1.4.4 darwin-arm64 node-v20.8.0
$ tamashii --help [COMMAND]
USAGE
  $ tamashii COMMAND
...
```
<!-- usagestop -->

## Integration

```sh-session
$ tamashii init
$ tamashii link ../path/to/your/internal/package
```

It is recommended to add `tamashii refresh` and `tamashii sync` to npm scripts so that internal packages are automatically updated correctly.

```json
{
  "scripts": {
    "preinstall": "tamashii sync",
    "prepare": "tamashii refresh"
  }
}
```

# Commands

<!-- commands -->
* [`tamashii help [COMMANDS]`](#tamashii-help-commands)
* [`tamashii link SOURCE`](#tamashii-link-source)
* [`tamashii refresh [PACKAGE]`](#tamashii-refresh-package)
* [`tamashii sync [PACKAGE]`](#tamashii-sync-package)
* [`tamashii vscode`](#tamashii-vscode)
* [`tamashii zip SOURCE`](#tamashii-zip-source)

## `tamashii help [COMMANDS]`

Display help for tamashii.

```
USAGE
  $ tamashii help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tamashii.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `tamashii link SOURCE`

Links package

```
USAGE
  $ tamashii link SOURCE [--cwd <value>] [--installFlags <value>] [--npm] [--verbose]

ARGUMENTS
  SOURCE  Package path

FLAGS
  --cwd=<value>           Current working directory of the child process
  --installFlags=<value>  Flags to pass "yarn add" or "npm install"
  --npm                   Use npm instead of yarn
  --verbose               Print verbose output

DESCRIPTION
  Links package

EXAMPLES
  $ tamashii link ../path/to/your/internal/package
```

_See code: [src/commands/link/index.ts](https://github.com/dinii-inc/tamashii/blob/v1.4.4/src/commands/link/index.ts)_

## `tamashii refresh [PACKAGE]`

Refreshes package in node_modules

```
USAGE
  $ tamashii refresh [PACKAGE] [--cwd <value>]

ARGUMENTS
  PACKAGE  Package name

FLAGS
  --cwd=<value>  Current working directory of the child process

DESCRIPTION
  Refreshes package in node_modules

  At times, yarn may not update the content under "node_modules" even if changes are made to locally installed packages
  using "file:[path to package]" instead of a specific version number.
  In such cases, it may be necessary to delete the entire contents of "node_modules" and then re-run "yarn install".
  This command resolves the issue by copying files directly from the source to "node_modules".

  Consider placing this command in the "prepare" section of npm scripts to ensure that the content under "node_modules"
  is always kept up to date.


EXAMPLES
  $ tamashii refresh # all packages will be refreshed

  $ tamashii refresh your-internal-package
```

_See code: [src/commands/refresh/index.ts](https://github.com/dinii-inc/tamashii/blob/v1.4.4/src/commands/refresh/index.ts)_

## `tamashii sync [PACKAGE]`

Syncs local packages from source

```
USAGE
  $ tamashii sync [PACKAGE] [--cwd <value>] [--force] [--npm] [--verbose] [--yarn2]

ARGUMENTS
  PACKAGE  Target package name to sync

FLAGS
  --cwd=<value>  Current working directory of the child process
  --force        never skip even if no changes detected at source
  --npm          Use npm instead of yarn classic
  --verbose      Print verbose output
  --yarn2        Use yarn 2+ instead of yarn classic

DESCRIPTION
  Syncs local packages from source

  This updates package builds under ".tamashii" based on the source code linked via symbolic link in ".tamashii/.links".
  To reflect the latest builds in node_modules, where you have installed internal packages, you need to execute
  "tamashii refresh".

  This also prevents the copying of the "node_modules" directory within the source directory that contains
  "devDependencies".

  Consider placing this command in the "preinstall" section of npm scripts so that the required builds are prepared even
  during the initial run of yarn in the package directory where you have installed internal packages.


EXAMPLES
  $ tamashii sync # all packages will be synced

  $ tamashii sync your-internal-package
```

_See code: [src/commands/sync/index.ts](https://github.com/dinii-inc/tamashii/blob/v1.4.4/src/commands/sync/index.ts)_

## `tamashii vscode`

Shows instruction to make your development experience with tamashii and VSCode more comfortable

```
USAGE
  $ tamashii vscode

DESCRIPTION
  Shows instruction to make your development experience with tamashii and VSCode more comfortable
```

_See code: [src/commands/vscode/index.ts](https://github.com/dinii-inc/tamashii/blob/v1.4.4/src/commands/vscode/index.ts)_

## `tamashii zip SOURCE`

Zips package

```
USAGE
  $ tamashii zip SOURCE

ARGUMENTS
  SOURCE  Package path

DESCRIPTION
  Zips package

EXAMPLES
  $ tamashii zip ../path/to/your/internal/package
```

_See code: [src/commands/zip/index.ts](https://github.com/dinii-inc/tamashii/blob/v1.4.4/src/commands/zip/index.ts)_
<!-- commandsstop -->
