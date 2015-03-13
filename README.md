# CATS Score

CATS Score is a unified rank table for programming contests scoring.

### Installation

You need install Node.js
```sh
$ sudo apt-get install nodejs
```

Next, need requeredjs installed globally:

```sh
$ npm install -g requirejs
```

Next, build dist/index.js
```sh
$ cd path/to/cats-score/
$ nodejs /usr/local/bin/r.js -o build.js
```

Next, in index.html make sure be to load "dist/index", not "app/index", like this
```code
<script type="text/javascript" src="vendors/requirejs/require.js" data-main="dist/index"></script>
```
Now, CATS Score should work! 
