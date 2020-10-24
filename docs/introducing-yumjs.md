![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/a9jpvtu19deeuajnn9pt.png)

# YumJS

Hey there all, this is my first post so...yay me!


**YumJS** is a small reactive JavaScript library with JQuery like syntax that I have created for myself and released in the hope it will be useful to anyone who needs it.


*[examples near bottom of post, gotta do the fluff first.]*


Aside from having a familiar procedural syntax (and optional component syntax) it gives you the (optional) ability to make **any element** reactive and subscribable.

## Why another JS library?

**Why not?** 

No really, I started this project because:

- I wanted it to be useful for others to learn from.
- I wanted to see if it **could** be done.
- I wanted it to be open source / open for iteration (if found to be useful).
- I needed it for cutting down on repetitive tasks in my personal projects.


As mentioned above, **Yum** provides a familiar **procedural** and a **component** based syntax with low overhead and a slice of delicious reactivity when you need it.

## Is this a substitute for [*insert latest popular lib here* ].

Most definitely not!

Look I am no expert. I am just a dude who likes to make stuff. 

In all honesty I steer clear of popular frameworks preferring Vanilla Javascript (and now YumJS) for the things I build.

I make no claims about using **YumJS** in place of your favorite lib/framework (although maybe it could be). 


## Goals

  -  Be simple, easy to learn with familiar syntax.
  -  Complement and shorten JavaScript's syntax whenever possible.
  -  Ability to subscribe to and make **any** element reactive.
  -  Be small, fast, lightweight and flexible.
  -  Built in Drag and Drop/swipe.
  -  Optional component syntax.
  -  Be open source and extendable with intuitive plugin system.
  -  Encourage less DOM diving.
  
**Before I get into any examples let me point you to the docs and downloads...**
  
## Downloads and Docs

**GitHub repo:** https://github.com/bretgeek/yumjs

Feel free to download and try one of these minified versions:

**Minified Download:** https://yumjs.net/js/yum.min.js

**No Dragging Download:** https://yumjs.net/js/yum.nodrag-min.js

**Documentation** - in progress: https://yumjs.net/docs/



## USAGE
Load in your web app like:
`<script async src='https://yourdomain.com/js/yum.min.js' ></script>`


## EXAMPLES
###Basic usage

**You probably want to do stuff when the document is ready.**

```javascript
<script>

yum(document).ready( function(){

 // do your stuff here

});

</script>
```


**Querying the DOM and getting references to elements**

```javascript
// Assign a collection to variable for re-use, note the underscore.

let buttons = yum('.button')._; 

// Change the text of the entire collection.

yum(buttons).text('We are collected buttons.');

// The above prevents future DOM diving and re-use
// but same effect can be done with: 

yum('.buttons').text('We are collected buttons.');
```


**Make any element reactive**

```javascript
// get a reference to only the first h2 element

let h2 = yum('h2').first;
yum(h2).Reactor(); // set up the reactor


// a function for ReactTo
let runme = function(reactor){
console.log('H4 reacted '+reactor.data);
yum(reactor.subscriber).text(reactor.data)
};

// Set All h4's to **react to**  h2 property 'a' with a subscriber name 'myName'

yum('h4').ReactTo(h2, 'myName', runme, 'a'); // "a" here can be any property you want

//later on H2.
h2.atom.a = "I am some data";

// After which all H4's with react with 'runme' 
// and change their text to "I am some data"
```


**Basic component syntax**

```javascript
var app = new Yum ({
el: '#app', // OR yum()._createNode('<div'>) (see docs)
name: 'myWidget', 
template: `<span>I Will be your HTML</span>`,
scoped: true,
setTitle: function(s) { this.title(s) } ,
title: function(s) { yum(this.el).attr('title', s) },

runMe: function(reactor){
 yum(reactor.subscriber).text(reactor.data);
console.log('RUN ME '+reactor.data);
 },

reactTo: function(){
yum(this.el).ReactTo(someComponent, this.name, this.runMe, 'j') },

init: function() {  console.log('init me'); this.title('hey')  },

});
```
Components have built in Reactors. In the above example "app" will react to some element named "someComponent" when it changes it's property "j". See: https://yumjs.net/#yum

## More Usage Examples
See more examples at https://yumjs.net/

#More to do
Trying to keep it short here so I didn't explain the **component** syntax in depth (have a look at the site or the code). Maybe I can cover it further in a future post.

The documentation still needs some work and while there are examples on the site, many more need to be created. 

I'm sure there is plenty more to do but that is where you come in! 

If you find **YumJS** interesting or useful let's make it better together. Again the **GitHub repo is:** https://github.com/bretgeek/yumjs

Let me know your thoughts...

 **Thanks for taking the time to read my first post!**


