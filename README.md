# Roguelike


## Bundling
The source code in the src directory is bundled into a single file using **Browserify**.  The Browserify tools must first be installed on your system:

```$ npm install -g browserify``` (for OSX and linus users, you may need to preface this command with ```sudo```)

Once installed, you can bundle the current source with the command:

```$ browserify src/app.js -o bundle.js```

Remember, the browser must be refreshed to receive the changed javascript file.

## Watching

You may prefer to instead _watch_ the files for changes using **Watchify**.  This works very similarily to Browserify.  It first must be installed:

```$ npm install -g watchify``` (again, ```sudo``` may need to be used on linux and OSX platforms)

Then run the command:

```watchify src/app.js -o bundle.js```

The bundle will automatically be re-created every time you change a source file.  However, you still need to refresh your browser for the changed bundle to take effect.

## Credits
Game framework HTML5/CSS3/Javascript code was written by course instructor Nathan Bean, and released under the [CC-A-SA 3.0 License](https://creativecommons.org/licenses/by-sa/3.0/)

Assets are from user [Arachne](https://forums.tigsource.com/index.php?action=profile;u=4010) on [TIGForums](https://forums.tigsource.com/index.php) released under a [CC BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/2.0/) license.
