# tamashii

<!-- toc -->
* [tamashii](#tamashii)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g tamashii
$ tamashii COMMAND
running command...
$ tamashii (--version)
tamashii/0.0.1 darwin-arm64 node-v20.8.0
$ tamashii --help [COMMAND]
USAGE
  $ tamashii COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`tamashii help [COMMANDS]`](#tamashii-help-commands)
* [`tamashii link SOURCE`](#tamashii-link-source)
* [`tamashii plugins`](#tamashii-plugins)
* [`tamashii plugins:install PLUGIN...`](#tamashii-pluginsinstall-plugin)
* [`tamashii plugins:inspect PLUGIN...`](#tamashii-pluginsinspect-plugin)
* [`tamashii plugins:install PLUGIN...`](#tamashii-pluginsinstall-plugin-1)
* [`tamashii plugins:link PLUGIN`](#tamashii-pluginslink-plugin)
* [`tamashii plugins:uninstall PLUGIN...`](#tamashii-pluginsuninstall-plugin)
* [`tamashii plugins reset`](#tamashii-plugins-reset)
* [`tamashii plugins:uninstall PLUGIN...`](#tamashii-pluginsuninstall-plugin-1)
* [`tamashii plugins:uninstall PLUGIN...`](#tamashii-pluginsuninstall-plugin-2)
* [`tamashii plugins update`](#tamashii-plugins-update)
* [`tamashii refresh [PACKAGE]`](#tamashii-refresh-package)
* [`tamashii sync [PACKAGE]`](#tamashii-sync-package)

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

Link package

```
USAGE
  $ tamashii link SOURCE [--installFlags <value>] [--npm] [--verbose]

ARGUMENTS
  SOURCE  Package path

FLAGS
  --installFlags=<value>  Flags to pass "yarn add" or "npm install"
  --npm                   Use npm instead of yarn
  --verbose               Print verbose output

DESCRIPTION
  Link package

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/link/index.ts](https://github.com/dinii-inc/tamashii/blob/v0.0.1/src/commands/link/index.ts)_

## `tamashii plugins`

List installed plugins.

```
USAGE
  $ tamashii plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ tamashii plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/index.ts)_

## `tamashii plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tamashii plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ tamashii plugins add

EXAMPLES
  $ tamashii plugins add myplugin 

  $ tamashii plugins add https://github.com/someuser/someplugin

  $ tamashii plugins add someuser/someplugin
```

## `tamashii plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ tamashii plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tamashii plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/inspect.ts)_

## `tamashii plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tamashii plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ tamashii plugins add

EXAMPLES
  $ tamashii plugins install myplugin 

  $ tamashii plugins install https://github.com/someuser/someplugin

  $ tamashii plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/install.ts)_

## `tamashii plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ tamashii plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ tamashii plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/link.ts)_

## `tamashii plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tamashii plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tamashii plugins unlink
  $ tamashii plugins remove

EXAMPLES
  $ tamashii plugins remove myplugin
```

## `tamashii plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ tamashii plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/reset.ts)_

## `tamashii plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tamashii plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tamashii plugins unlink
  $ tamashii plugins remove

EXAMPLES
  $ tamashii plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/uninstall.ts)_

## `tamashii plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tamashii plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tamashii plugins unlink
  $ tamashii plugins remove

EXAMPLES
  $ tamashii plugins unlink myplugin
```

## `tamashii plugins update`

Update installed plugins.

```
USAGE
  $ tamashii plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/update.ts)_

## `tamashii refresh [PACKAGE]`

Refresh package in node_modules

```
USAGE
  $ tamashii refresh [PACKAGE]

ARGUMENTS
  PACKAGE  Package name

DESCRIPTION
  Refresh package in node_modules

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/refresh/index.ts](https://github.com/dinii-inc/tamashii/blob/v0.0.1/src/commands/refresh/index.ts)_

## `tamashii sync [PACKAGE]`

Sync local package from source

```
USAGE
  $ tamashii sync [PACKAGE] [--npm] [--verbose]

ARGUMENTS
  PACKAGE  Target package name to sync

FLAGS
  --npm      Use npm instead of yarn
  --verbose  Print verbose output

DESCRIPTION
  Sync local package from source

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/sync/index.ts](https://github.com/dinii-inc/tamashii/blob/v0.0.1/src/commands/sync/index.ts)_
<!-- commandsstop -->
