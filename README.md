# CATS Score

CATS Score is a unified rank table for programming contests scoring.

### Installation

Just type in you web browser "file:///path/to/cats-score/index.html"

If you want to run at maximum performance, perform the following steps:

1) You need install Node.js
```sh
$ sudo apt-get install nodejs
```

2) Next, need requeredjs installed globally:

```sh
$ npm install -g requirejs
```

3) Next, build dist/index.js
```sh
$ cd path/to/cats-score/
$ nodejs /usr/local/bin/r.js -o build.js
```

4) Next, in index.html make sure be to load "dist/index", not "app/index", like this
```code
<script type="text/javascript" src="vendors/requirejs/require.js" data-main="dist/index"></script>
```
5) Now, CATS Score should work with maximum performance! 
