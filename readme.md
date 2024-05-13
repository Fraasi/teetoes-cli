# teetoes-cli
Text to speech on command line

> This uses some new APIs in node v21.7.0 (some apis backported to v20.12.0)


> Voice RSS provides a very human-sounding voices and supports 49 languages with 100 voices.
> See [Voice RSS demo](https://www.voicerss.org/api/demo)

While not nearly as good as some other TTS's out there, this one is free and good enough.

## Installation & usage
Just curl the bin/teetoes file to somewhere in your PATH & change the permissions to executable
```sh
$ curl https://raw.githubusercontent.com/fraasi/teetoes-cli/main/bin/teetoes -o /usr/local/bin/teetoes
  chmod +x /usr/local/bin/teetoes
```
and you're good to go if you setup your api key in the config file (see below)
```
$ teetoes -h

teetoes v1.0.0: Text to speech on command line

Usage: teetoes [options] <text_file_path>

  -l, --lang
    language (default: en-us)
  -v, --voice
    voice (default: Linda)
  -r --rate
    speech rate (-10 to 10, default: 0)
  -o, --output
    output name for mp3 file (default: same as input file name)
  -h, --help
    this help

  <text_file_path>
    path to a text file you want to convert to audio

Note:
  Options order:  defaults -> env from config -> arguments

  See other language & voice options at https://voicerss.org/api/demo.aspx
  Issues & readme at https://github.com/fraasi/teetoes-cli
```
Languages have a default voice, so you can just use ```--lang=zh-hk``` to get chinese-hongkong default voice, no need to define ```--voice``` parameter.

## Config
You can specify some default configs and the mandatory api key (get it [here](https://www.voicerss.org/)) in the config file. Copy the config.example to ~/.config/teetoes/config and set your api key and own defaults. Empty configs will use defaults listed in help.
```sh
mkdir -p ~/.config/teetoes
https://raw.githubusercontent.com/fraasi/teetoes-cli/main/config.example ~/.config/teetoes/config
```
## Dependencies
Just [node](https://nodejs.org/en/) internals, no other dependencies.

## License
MIT
