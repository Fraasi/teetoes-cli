## teetoes-cli

Text to speech on command line

![teetoes](https://user-images.githubusercontent.com/108606/179718300-0c7a3e8b-3e6f-4a6b-9e0c-7a7a9b0dcbf1.png)


> Voice RSS provides a very human-sounding voices and supports 49 languages with 100 voices.
> See [Voice RSS demo](https://www.voicerss.org/api/demo)

While not nearly as good as some other TTS's out there, this one is free and good enough for my needs.

## Installation & usage
Just curl the bin/teetoes file to somewhere in your PATH & change the permissions to executable
```sh
  curl -o /usr/local/bin/teetoes https://raw.githubusercontent.com/fraasi/teetoes-cli/main/bin/teetoes
  chmod +x /usr/local/bin/teetoes
```
and you're good to go if you setup your api key in the config file (see below)
```sh
  teetoes -h
```
Languages have a default voice, so you can just use ```--lang=zh-hk``` to get chinese-hongkong default voice, no need to define ```--voice``` parameter.

## Config
You can specify some default configs and the mandatory api key in the config file. Copy the config.example to ~/.config/teetoes/config
```sh
mkdir ~/.config/teetoes



```sh
  cp .env.example .env
```

## License
MIT
