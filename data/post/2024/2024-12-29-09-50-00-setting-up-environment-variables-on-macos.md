---
slug: "2024/12/29/setting-up-environment-variables-on-macos"
title: "Setting up environment variables on macOS"
description: "If you switch between shells, updating PATH and environment variables for each shell's configuration file can become tedious. Fortunately, macOS offers utilities to simplify this process."
date: 2024-12-29 18:26:56
update: 2024-12-29 18:26:56
type: "reference"
---

You can set the `PATH` and other environment variables on macOS by editing your shell's configuration file.

:::note
If you're using macOS Catalina (10.15) or later, the default shell is [zsh](https://en.wikipedia.org/wiki/Z_shell), and its configuration file is `~/.zshrc`. On older versions, the default is [bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)), with its configuration file at `~/.bashrc`.
:::

If you stick to one shell, this setup works perfectly. But if you switch between different shells, things can get tedious — you would have to update each configuration file separately to keep the same `PATH` and environment variables. Fortunately, macOS includes utilities to streamline and simplify this process.

## Configuring the `PATH`

macOS uses a utility called `path_helper` to construct the `PATH` variable. When the system starts, `path_helper` picks up the default `PATH` value, then adds the paths listed in the `/etc/paths` file. It finally iterates over all the files in the `/etc/paths.d` directory, and appends their contents to the `PATH` variable, automatically ignoring any duplicate path entry. Both the `/etc/paths` file and the files in `/etc/paths.d` should list one path per line.

Now, let's say you want to add `/opt/homebrew/bin` and `/Library/Java/JavaVirtualMachines/zulu-23.jdk/Contents/Home/bin` to the `PATH`. Here is how you can do it:

1. Create a new file in `/etc/paths.d` directory, for example, `/etc/paths.d/additional-paths`.
   
   :::assert
   Writing to the `/etc/paths.d` directory requires an administrator password or the use of `sudo`.
   :::

2. Add the following lines to the file, with each path on a separate line:
   
   ```txt title="/etc/paths.d/additional-paths"
   /opt/homebrew/bin
   /Library/Java/JavaVirtualMachines/zulu-23.jdk/Contents/Home/bin
   ```
3. After saving the file, restart your shell or application to pick the updated `PATH`. Alternatively, logout and log back in.

A few things to remember:
- Always use the full path for directories (avoid using `~`). Some programs and shells may not expand `~` to the full home directory path. Plus, `~` resolves to different locations for different user accounts, which could cause issues on shared systems.
- It is better to add files containing your paths under `/etc/paths.d` directory. System upgrades may modify or replace the `/etc/paths` file, but files in `/etc/paths.d` are generally left intact.

## Setting up the environment variables

macOS includes a utility called `launchctl`, which lets you interact with `launchd`, another utility that manages daemons and agents. By configuring an agent with a property list (`plist`) file, you can set environment variables that `launchctl` will apply when your system starts or when you log in.

:::note{title="Daemon vs Agent"}
A daemon is a system-wide service with one instance shared across all clients. An agent is a service that runs on a per-user basis, within each user's session.
:::

Now, let's say you want to configure the environment variables `XDG_CONFIG_HOME=/Users/example/.config` and `JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-23.jdk/Contents/Home`.

1. Go to `~/Library/LaunchAgents` directory.
2. Create a `plist` file, for example, `com.example.environment.plist` with the following content.

   ```xml title="~/Library/LaunchAgents/com.example.environment.plist" {9..16}
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.example.environment</string>
       <key>ProgramArguments</key>
       <array>
           <string>launchctl</string>
           <string>setenv</string>
           <string>XDG_CONFIG_HOME</string>
           <string>/Users/example/.config</string>
           <string>launchctl</string>
           <string>setenv</string>
           <string>JAVA_HOME</string>
           <string>/Library/Java/JavaVirtualMachines/zulu-23.jdk/Contents/Home</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
   </dict>
   </plist>
   ```

   `Label` is a required key to uniquely identify the job. `RunAtLoad` ensures that this job launches during system boot or user login.

3. Save the file, then either log out and log back in, or manually start the agent:
   
   ```sh
   launchctl load ~/Library/LaunchAgents/com.example.environment.plist
   ```

You can verify that the configuration works by listing all environment variables with the `env` command.
