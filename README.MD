# Whiteout Survivor Auto Gift Bot

## This code is for educational and learing purposes only. I am not responsible for any actions you take with this bot. Using this bot might be against the terms of service of the game. Use at your own risk.

### Clone the repository:

```bash
git clone https://github.com/pawix135/ws-gift-bot.git
```
or
```bash
git clone git@github.com:pawix135/ws-gift-bot.git
```

### Install the dependencies:

```bash
npm install
```
### Build the project:

```bash
npm run build
```

### Prepare the player id list:
Inside the `dist` folder create `.json` file. The file should contain an array of player ids as strings. Example:
```json
[
    "player_id_1",
    "player_id_2",
    "player_id_3"
]
``` 

### Run the bot:
```bash
cd dist
node index.js -p <json_file_path> -c <your_code>
```

### How to use the bot:
Pass two required arguments to the bot:

`-p` or `--players` - path to the player ids json file

`-c` or `--code` - gift code

Example:
```bash
node index.js -p player_ids.json -c HappyCode
```

