## teetoes-cli
Text to speech on command line

> note: I wanted to try some of the new node API's to build a cli program.
> So node v21.7.0 and above is required.


> Voice RSS provides a very human-sounding voices and supports 49 languages with 100 voices.
> See [Voice RSS demo](https://www.voicerss.org/api/demo)

While not nearly as good as some other TTS's out there, this one is free and good enough for my needs.

## Installation & usage
Just curl the bin/teetoes file to somewhere in your PATH & change the permissions to executable
```sh
  curl https://raw.githubusercontent.com/fraasi/teetoes-cli/main/bin/teetoes -o /usr/local/bin/teetoes
  chmod +x /usr/local/bin/teetoes
```
and you're good to go if you setup your api key in the config file (see below)
```sh
  teetoes -h
```
Languages have a default voice, so you can just use ```--lang=zh-hk``` to get chinese-hongkong default voice, no need to define ```--voice``` parameter.

## Config
You can specify some default configs and the mandatory api key (get it [here](https://www.voicerss.org/) in the config file. Copy the config.example to ~/.config/teetoes/config and set your api key and own defaults.
```sh
mkdir -p ~/.config/teetoes
https://raw.githubusercontent.com/fraasi/teetoes-cli/main/config.example ~/.config/teetoes/config
```
## Dependencies
Just [node](https://nodejs.org/en/) internals, no other dependencies.

## License
MIT
