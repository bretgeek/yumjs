

# Deprecated
see https://github.com/bretgeek/surf

# YumJS
YumJS is a small reactive JavaScript library with JQuery like syntax. 

Small as in ~19KB minified with drag ~15KB minified without drag and about half of that if served gzipped.

Please see https://surf.monster for ongoing documentation, minified downloads and optional builds.


Yum provides a familiar **procedural** and a **component** based syntax with low overhead and a slice of delicious reactivity when you need it.


**Funding:** https://www.patreon.com/yumjs?fan_landing=true

## Features

  -  Simple, easy to learn with familiar syntax.
  -  Optional component (rendering) syntax with props and state.
  -  A lightweight alternative to JQuery (not all JQuery functions implemented).
  -  Tons of utility functions.
  -  Ability to observe or subscribe to **any** element for complex reactivity.
  -  Small, fast, lightweight and flexible.
  -  Built in Drag and Drop/swipe.
  -  A nodeJS build tool for component based apps [Yum App Builder](https://github.com/bretgeek/yumapp/).
    
## Downloads and Docs

Feel free to download and try one of these minified versions:

**Minified Download:** https://yumjs.net/js/yum.min.js

**No Dragging Download:** https://yumjs.net/js/yum.nodrag-min.js

**Documentation** - in progress: https://yumjs.net/docs/


## Build / minify
There is a custom build/minify process that runs on https://yumjs.net and builds the drag and no drag versions. You should probably use those (linked above) but if you want to minify Yum yourself you can use **terser** https://github.com/terser/terser.

 
terser --c -m -- yum.js >yum.min.js



## USAGE
Load in your web app like:
```javascript
<script async src='https://yourdomain.com/js/yum.min.js' ></script>
```

### Starting
You probably want to load your code when the document is ready like:


```javascript
<script>

yum(document).ready( function(){

 // do your stuff here

});

</script>
```
## More Usage Examples
See more examples at https://yumjs.net/

## Thanks for your support!

[![Stargazers repo roster for @bretgeek/yumjs](https://reporoster.com/stars/bretgeek/yumjs)](https://github.com/bretgeek/yumjs/stargazers)
