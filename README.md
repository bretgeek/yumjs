[![GitHub Logo](/images/yumlogo.png)](https://yumjs.net/)

# YumJS
YumJS is a small reactive JavaScript library with JQuery like syntax. 

Small as in ~20KB minified with drag ~16KB minified without drag and about half of that if served gzipped.

Please see https://yumjs.net for ongoing documentation, minified downloads and optional builds.


Yum provides a familiar **procedural** and a **component** based syntax with low overhead and a slice of delicious reactivity when you need it.


**Funding:** https://www.patreon.com/yumjs?fan_landing=true

## Goals

  -  Be simple, easy to learn with familiar syntax.
  -  Complement and shorten JavaScript's syntax whenever possible.
  -  Ability to subscribe to and make **any** element reactive.
  -  Be small, fast, lightweight and flexible.
  -  Built in Drag and Drop/swipe.
  -  Optional component syntax.
  -  Be open source and extendable with intuitive plugin system.
  -  Encourage less DOM diving.
    
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
