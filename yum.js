function yum(itr, ...Arr) {// itr = strings of things to iterate over
  /* START GLOBAL VARS */
  // components can have non global yumobservers - see spy
  globalThis.yumobservers = globalThis.yumobservers || {};

  let itrtemp; // for saving itr

  // idk why anyone would want to do this but...
  if (isFunction(itr)) {
    // console.log('functor');
    itr();
    return this;
  }


  // THE STACK
  let _stk = [];

  // handle if itr itself is an object or a string
  if (itr) {
    if (isObject(itr)) {
    // can take an array of objects like [ obj, obj2];
      if (Array.isArray(itr)) {
        for ( const a of itr ) {
          if (a.nodeType === 1) {
            _stk.push(a);
          }
        }
      } else {
        if (itr.nodeType == 1) {
          // console.log('node type is a '+itr.nodeType);
          // not sure why itr has to be an array even if it is onle one object
          // crazy hack to get one selector object passed in to work
          const tempitr = [itr];
          for ( const a of tempitr ) {
            if (a.nodeType === 1) {
              _stk.push(a);
            }
          }
        }
      }
    }


    // check for window
    if (itr === window) {
      // console.log('window');
      _stk.push(itr);
    }
    // check for document
    if (itr.nodeName === '#document' ) {
      // console.log('selector name is '+itr.nodeName);
      var yumloaded = false; // yes var
      (function ready(fn) {
        if (document.readyState != 'loading') {
          yumloaded = true;
          // console.log('ready state');
        } else if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', function() {
            yumloaded = true;
            // console.log('DOM Loaded');
          });
        } else {
          document.attachEvent('onreadystatechange', function() {
            if (document.readyState != 'loading') {
              yumloaded = true;
              // console.log('ready state');
            }
          });
        }
      })();
    }

    if (isString(itr)) {
      itrtemp = itr;
      itr = itr.split(',');
      itr = itr.filter((x, i, a) => a.indexOf(x) == i);
      for ( const s of itr ) {
        // console.log('s type is '+typeof(s));
        if (__isHTML(s)) {
          // console.log('s is html '+s);
          // console.log('the tagname is  '+__isHTML(s, true));
          // create the element from an html tag name which was parsed
          __procHTML(__isHTML(s, true));// returns tagname
        } else {
          let els;
          // if just sending in an ID this would be faster
          if (s.startsWith('#')) {
            const id = s.replace(/#/, '');
            els = document.getElementById(id);
            // console.log('s is '+s);
            _stk.push(els);
          }
          // handle classes as live HTML collection
          else if (s.startsWith('.')) {
            const cn = s.replace(/./, '');
            els = document.getElementsByClassName(cn);
            // console.log('cn is '+s);
            for ( const el of els ) {
              _stk.push(el);
            }
          } else {
            els = document.querySelectorAll(s);
            for ( const el of els ) {
              _stk.push(el);
            }
          }
        }
      }
    }
  } // end if itr

  // check for ...rest as Arr
  // make unique array first
  Arr = Arr.filter((x, i, a) => a.indexOf(x) == i);
  for ( let sel of Arr ) { // let instead of cont because sel gets mutated  below sel = sel.split(','); TODO fix
    if (Array.isArray(sel)) {
      for ( const a of sel ) {
        if (a.nodeType === 1) {
          _stk.push(a);
        }
      }
    }
    if (isObject(sel)) {
      if (sel.nodeType === 1) {
        _stk.push(sel);
      }
    }

    if (isString(sel)) {
      sel = sel.split(',');
      for ( const s of sel ) {
        // console.log('s type is '+typeof(s));

        const els = document.querySelectorAll(s);
        for ( const el of els) {
          if (el.nodeType === 1) {
            _stk.push(el);
          }
        }
      }
    }
  } // end Arr ...Arr

  /* END THE STACK */


  /* START LIBRARY FUNCTIONS */

  let doc;
  let docint;
  function ready(fn, fallbacktime=3000) {
    let tout;
    let inc = 1;
    docint = setInterval( (i) => {
      if (yumloaded) {
        clearInterval(docint);
        clearTimeout(tout);
        // console.log('ran and cleared in Intv and cleared timeout');
        if (fn && isFunction(fn) && inc <=1) { // dont run more than once per call
          try {
            fn();
            inc++;
          } catch (e) {}
        } else {
          // should also be able to use to check if docready is true
          return true;
        }
      }
    }, 6);
    // if all else fails set yumloaded after fallbacktime (can pass it in too)
    tout = setTimeout( (e) => {
      // console.log('ran in Timeout');
      yumloaded = true;
    }, fallbacktime);
  }// end ready


  let Y = 1;
  let X = 1;
  let scrLeft;
  let scrTop = 0;
  function _scrollPos() {
    doc = document.documentElement;
    scrLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    scrTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    scrTop = _rpx(scrTop);
    scrLeft = _rpx(scrLeft);
    // console.log('scrTop = '+scrTop+' scrLeft= '+scrLeft);
  }


  let tchdev = false;
  function _isTouch() {
    return window.matchMedia('(pointer: coarse)').matches || false;
  }

  if (_isTouch()) {
    tchdev = true;
  }

  function _rect(el, st=false, round=false) {
    let e = el; // if el is object
    if (isString(el)) {
      e = document.querySelector(el);
    }

    const allow = ['x', 'y', 'width', 'height', 'right', 'left', 'top', 'bottom'];
    if (!allow.includes(st)) {
      return null;
    }

    const ret = e.getBoundingClientRect()[st];

    if (round) {
      return Math.round(ret);
    } else {
      return ret;
    }
  }


  // Get Computed Styles of el
  function _cs(el, prop, trim=false) {
    if (isString(el)) {
      el = document.querySelector(el);
    }
    if (el) {
      let cs = getComputedStyle(el).getPropertyValue(prop) || null;
      if (trim) {
        try {
          cs = _rpx(cs);
        } catch (e) {}
      }
      return cs;
    }
  }


  /* HTXT */
  // HTML
  function html(str=false, limit='all' ) {
    let res = '';
    if (!str && limit==='all') {
      // console.log('stk len' + _stk.length);
      for ( const y of _stk) {
        res += y.innerHTML;
      }
      return res;
    }
    __htxt(str, limit='all' );
    return this;
  }


  /*  TEXT */
  // if limit is set then only do for that many times
  function text(str, limit='all' ) {
    let res = '';
    if (!str && limit==='all') {
      // console.log('stk len' + _stk.length);
      for ( const y of _stk) {
        res += y.textContent;
      }
      return res;
    }

    __htxt(str, limit='all', true );
    return this;
  }

  // if limit is set then only do for that many times
  function __htxt(str, limit='all', t=false ) {
    const content = '';
    let inc = 0;
    for ( const y of _stk) {
      if (__isNum(limit) && inc <= limit) {
        // console.log('limit '+ inc);
        inc++;
        if (t) {
          y.textContent = str;
        } else {
          y.innerHTML = str;
        }
      }
      if (limit === 'all') {
        if (t) {
          y.textContent = str;
        } else {
          y.innerHTML = str;
        }
      }
    }
    // console.log('str should set '+ str);
    return this;
  }
  /* END HTXT  */


  /* TOOLS  */

  // takes an array s of [tagname, innerHTML]
  function __procHTML(s, r=false) {
    // console.log('GOT HTML');
    // create a wrapper so we can turn HTML string into a node
    // console.log('tag name is '+ s[0]);
    const el = document.createElement(s[0]);
    el.innerHTML = s[1];
    if (r) {
      return el;
    } else {
      _stk.push(el);// push el onto stack
    }
  }


  function __isHTML(str, t = false) {
    // if t is true return the tag name
    const doc = new DOMParser().parseFromString(str, 'text/html');
    if (t) {
      return [doc.body.childNodes[0].tagName.toLowerCase(), doc.body.childNodes[0].innerHTML];
    } else {
      return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1 );
    }
  }

  // filter strings
  function _sfilter(str, strict=false) {
    str = str.replace(/[^\x20-\x7E]+/g, '');
    if (strict) {
      str = str.replace(/[^a-z0-9-#]+|\s+/gmi, '');
    }
    str = str.trim();
    return str;
  }


  /* _createNode */
  function _createNode( nodetype='div', override=false, selector='default') {
    const allowedNodes = ['html', 'head', 'link', 'meta', 'script', 'style', 'title', 'body', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'main', 'nav', 'section', 'blockquote', 'div', 'figure', 'hr', 'li', 'ol', 'p', 'pre', 'ul', 'a', 'code', 'data', 'time', 'em', 'i', 'span', 'strong', 'audio', 'source', 'img', 'track', 'video', 'iframe', 'svg', 'canvas', 'noscript', 'col', 'colgroup', 'button', 'option', 'fieldset', 'label', 'form', 'input', 'select', 'textarea', 'menu', 'template'];

    if (!allowedNodes.includes(nodetype)) {
      if (!override) {// you can send in an element not in the list by setting override to true (think custom elements that are properly defined)
        nodetype = 'div';
      }
    }

    const newnode = document.createElement(nodetype);
    return newnode;
  }


  /* generate uuid */
  function _uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16),
    );
  }

  /* DELAY execute function for every element after a delay, fn takes in */
  function delay(wait=500, fn) {
    setTimeout((t) => {
      for ( const y of _stk ) {
        fn(y);
      }
      // console.log('delayed');
    }, wait);
    return this;
  }

  /* ISNUMBER */
  function __isNum(value) {
    return /^-{0,1}\d+$/.test(value);
  }

  function hidkbd(el) {
    if (!el) {
      for ( const el of _stk ) {
        setTimeout(function() {
          el.onfocus = blur(); // close the keyboard
        }, 100);
      }
    }
  }

  // return a number minus px since parseInt is flakey
  function _rpx(s) {
    s = s.toString();
    return Math.round(Number(s.replace(/px/g, '')));
  }

  // get outer margins and return them
  function __getM(el) {
    const computed = getComputedStyle(el);
    const padding = parseInt(computed.paddingTop) + parseInt(computed.paddingBottom);

    const marginT = _rpx(computed.getPropertyValue('margin-top')) || 0;
    const marginB = _rpx(computed.getPropertyValue('margin-bottom')) || 0;

    const marginL = _rpx(computed.getPropertyValue('margin-left')) || 0;
    const marginR = _rpx(computed.getPropertyValue('margin-right')) || 0;
    return [marginT, marginL, marginB, marginR];
  }

  function _getAtPt(x, y) {
    return document.elementFromPoint(x, y);
  }


  /* END TOOLS  */

  /* EVENTS */

  /* create events  */
  function _createEvent(str, bubbles=false, cancelable=false) {
    const evt = new Event(str, {'bubbles': bubbles, 'cancelable': cancelable});
    // console.log('the event was '+evt);
    return evt;
  }

  // this will dispatch the event for the specified element must be valid string name for e element reference for el
  function _eventDispatch(e, el) {
    el.dispatchEvent(e);
  }


  function addEvent(etype='mousedown', handler, cap = false ) {
    let userCap = cap;
    // console.log(typeof(cap));
    // if cap is sent in as boolean then set capture to true
    if (typeof(cap) === 'boolean' ) {
      if (cap) {
        userCap = {'capture': true};
      } else {
        userCap = {'capture': false};
      }
    }
    // note do e.preventDefault() in the handlier
    const types = etype.split(',');
    for ( const y of _stk ) {
      // console.log('stack');
      for ( let t of types ) { // TODO fix let here instead of const because t is immediately mutated
        t = t.trim();
        y.addEventListener(t, handler, userCap);
      }
    }
    return this;
  }


  function removeEvent(etype='mousedown', handler, cap=false ) {
    let userCap = cap;
    // console.log(typeof(cap));
    // if cap is sent in as boolean then set capture to true
    if (typeof(cap) === 'boolean' ) {
      if (cap) {
        userCap = {'capture': true};
      } else {
        userCap = {'capture': false};
      }
    }

    const types = etype.split(',');
    for ( const y of _stk ) {
      for ( const t of types ) {
        y.removeEventListener(t, handler, userCap);
      }
    }
    return this;
  }


  /* object and var rm is a removal pattern for building without drag */
  /* eslint-disable */
   {drag: rm}
   var rm = 'r';
   /* eslint-enable */

  /* DRAG AND SWIPE  */


  // short hand for just dragging
  function drg() {
    if (tchdev) {
      swipe(_stk[0]);
    } else {
      drag(false, _stk[0], {});
    }
    return this;
  }

  function drag(node, {drop='.droppable', drpfn=false, lvupfn = false, zindex=false, contain=false} ) {
    // for deciding if parent is to be dragged
    if (node && typeof(node) !== 'function') {// if it is a function then its a swipe
      node = _stk[0].parentNode;
    } else {
      node = _stk[0];
    }
    if (!zindex) {
      zindex = 1006;
    }
    if (tchdev) {
      swipe(node, drop, drpfn, lvupfn, zindex, contain);
    } else {
      const drgfn = function(e) {
        // we have to handle touch devices differently
        if (tchdev) {
          setTimeout((t) => {
            hidkbd(e);
          }, 20);
        } else {
          stopped = false;
          doDrag(_stk[0], e, node, drop, false, false, zindex, contain );
        }
        _stk[0].style.cursor = 'move';
      };


      const upfn = function(e) {
        const dropped = document.querySelector(drop);
        const drp = _data(e.target, 'dropping', 'get');
        if (drp) {
          // console.log('GOT '+drp);
          if (isFunction(drpfn)) {
            // console.log('drpfn should run');
            if (dropped) {
              drpfn(dropped);
            }
          }
        }// end if drp

        if (!drp) {
          if (isFunction(lvupfn)) {
            if (dropped) {
              lvupfn(dropped);
            }
          }
        }// end not drp
      };// end upfn

      addEvent('mousedown, touchstart', drgfn, true);
      addEvent('mouseup', upfn, true);
    }
    return this;
  }

  /* dragee is the thing you want to drag while el is the handle thing to click to do the dragging */
  function doDrag(el, e, dragee, droppable=false, drpfn, lvupfn, zindex=false, contain=false) {
    if (!dragee) return;

    e.preventDefault();

    dragee.ondragstart = function() {
      return false;
    };

    let shiftX;
    let shiftY;
    if (tchdev) {
      // console.log('droppable = '+droppable);
    }
    let dropel = droppable;
    if (dropel) {
      dropel = document.querySelector(droppable);
    } else {
      dropel = document.querySelector('.droppable');
    }
    let cont = contain;
    // the container as an element need for getting dimensions
    if (cont) {
      cont = document.querySelector(contain);
    } else {
      // prevent from going off screen
      cont = document.documentElement || document.querySelector('body') || window;
    }


    // Cutoff and adjust shift for margins
    let shiftLR = 0;
    const shiftArr = __getM(dragee);
    const [shiftT, shiftL, shiftR] = shiftArr;
    shiftLR = shiftL+shiftR;
    let stopped = false;


    dragee.style.position = 'absolute';
    dragee.style.marginTop = 0;
    dragee.style.marginLeft = 0;
    dragee.style.marginRight = 0;
    dragee.style.zIndex = zindex;


    shiftX = e.clientX - dragee.getBoundingClientRect().left-shiftLR;// was left and top
    shiftY = e.clientY - dragee.getBoundingClientRect().top-shiftT;
    if (tchdev) {
      const touchLocation = e.targetTouches[0];
      shiftX = touchLocation.pageX - dragee.getBoundingClientRect().left-shiftLR;
      shiftY = touchLocation.pageY - dragee.getBoundingClientRect().top-shiftT;
    }
    function moveTo(pageX, pageY) {
      // console.log('pagex and y '+pageX+' ' +pageY);
      pageX = Math.round(pageX);
      pageY = Math.round(pageY);
      shiftX = Math.round(shiftX);
      shiftY = Math.round(shiftY);

      _scrollPos();
      // for some reason touch doesnt adjust for scroll
      if (tchdev) {
        pageX = pageX + scrLeft;
        pageY = pageY + scrTop;
      }


      if (tchdev) {
        dragee.style.left = pageX - shiftX + 'px';
        dragee.style.top = pageY - shiftY +'px';
        X = pageX;
        Y = pageY;
      } else {
        dragee.style.left = pageX - shiftX + 'px';
        dragee.style.top = pageY - shiftY + 'px';
        X = pageX;
        Y = pageY;
      }

      if (dropel) {
        drop(dragee, dropel, pageX, pageY);
      }
    }// end moveTo


    function drop(dragee, cont, pageX, pageY) {
      _scrollPos();
      const cRct = dropel.getBoundingClientRect();
      const dRct = dragee.getBoundingClientRect();
      // touch device have to subrtact scroll for some reason
      if (tchdev) {
        pageX = pageX - scrLeft;
        pageY = pageY - scrTop;
      }
      // keep element in container
      // top
      const dtop = _rpx(dRct.top) + scrTop;
      const contop = _rpx(cRct.top) + scrTop;
      // console.log('moving '+ pageY+' '+contop);
      if (pageY < contop ) {
        // console.log('mouse OUT Y top in contM');
        // pageY = contop + 9;
        // dragee.style.top = contop + 6+'px';
      }

      let inY = false;
      let inX= false;
      if ( dtop > contop ) {
        // console.log('inside drop from  top '+ dtop+' '+contop);
        inY = true;
      }

      // bottom
      const dbot = _rpx(dRct.y) - scrTop;
      const conbot = _rpx(cRct.y)+cont.offsetHeight + scrTop;

      if (pageY > conbot ) {
        // console.log('inside drop  from bottom '+ dbot+' '+contop);
        inY = false;
      }

      // left
      if ( pageX < cRct.x + cont.offsetWidth + scrLeft ) {
        // console.log('inside drop  from left '+ dRct.x+' '+cRct.x);
        inX= true;
      }

      // right
      if ( pageX < cRct.x || pageX > cRct.x + cont.offsetWidth + scrLeft) {
        // console.log('inside drop  from left '+ dRct.x+' '+cRct.x);
        inX = false;
      }

      if (inY && inX) {
        // console.log('in Droppable');
        _data(dragee, 'dropping', 'set');
      } else {
        _data(dragee, 'dropping', 'remove' );// remove dropping data
      }
    }// end drop

    // the containment function
    function contM(dragee, cont, pageX, pageY) {
      _scrollPos();
      const cRct = cont.getBoundingClientRect();
      const dRct = dragee.getBoundingClientRect();

      // keep element in container
      // top
      const dtop = _rpx(dRct.top) + scrTop;
      const contop = _rpx(cRct.top) + scrTop;
      // console.log('moving '+ pageY+' '+contop);
      if (pageY < contop ) {
        // console.log('mouse OUT Y top in contM');
        pageY = contop + 9;
        dragee.style.top = contop + 6+'px';
        stopped = true;
        return;
      }

      if ( dtop < contop ) {
        pageY = _rpx(dragee.style.top) + 20;
        dragee.style.top = contop + 6+'px';
        // console.log('hit contain  top '+ dtop+' '+contop);
        stopped = true;
        return;
      }

      // bottom
      const dbot = _rpx(dRct.y) - scrTop;
      const conbot = _rpx(cRct.y)+cont.offsetHeight + scrTop;

      if (pageY > conbot ) {
        // console.log('mouse OUT Y bottom');
        dragee.style.top = conbot - dragee.offsetHeight - 6+'px';
        stopped = true;
        return;
      }

      if ( dbot - conbot > conbot ) {
        pageY = conbot-20;
        dragee.style.top = conbot - dragee.offsetHeight - 3 +'px';
        // console.log('touch shift page x '+ conbot);
        stopped = true;
        return;
      }

      // TODO adjust for left scroll
      // left
      if ( dRct.x < cRct.x ) {
        // console.log('less than left');
        dragee.style.left = Math.round(cRct.x)+ 3 +'px';
        stopped = true;
        return;
      }

      // right
      if ( dRct.x+dragee.offsetWidth > cRct.x+cont.offsetWidth) {
        // console.log('more than right');
        dragee.style.left = cRct.x+cont.offsetWidth - dragee.offsetWidth - 3 +'px';
        // pageX = cRct.x+cont.offsetWidth-3;
        stopped = true;
        return;
      }
    }// end contM


    // for mobile drag
    if (tchdev) {
    // touchscreen
      // console.log('touch');
      // wrap the handler
      function tHandler(e) {
        e.preventDefault();
        // grab the location of touch
        const touchLocation = e.targetTouches[0];
        try {
          if (cont) {
            mob(e.target, cont, touchLocation.pageX, touchLocation.pageY);
          }
          if (!stopped) {
            moveTo(touchLocation.pageX, touchLocation.pageY);
          }
        } catch (e) {}
      }
      el.addEventListener('touchmove', tHandler, true);
      function mob(t, cont, pageX, pageY) {
        contM(t, cont, pageX, pageY);
      }


      // wrap the handler
      function endHandler(e) {
        try {
          stopped = false;
          if (droppable) {
            // console.log('touch droppable is '+ droppable);
            const upfn = function(e) {
              const dropped = document.querySelector(droppable);
              const drp = _data(e.target, 'dropping', 'get');
              if (drp) {
                // console.log('Touch GOT '+drp);
                if (isFunction(drpfn)) {
                  // console.log('drpfn should run');
                  if (dropped) {
                    drpfn(dropped);
                  }
                }
              }// end if drp

              if (!drp) {
                if (isFunction(lvupfn)) {
                  if (dropped) {
                    lvupfn(dropped);
                  }
                }
              }// end not drp
            };// end upfn

            upfn(e);
          } // end droppable
        } catch (e) {
          // console.log(X+','+ Y);
        }

        el.removeEventListener('touchend', endHandler, true);
        el.removeEventListener('touchmove', tHandler, true);
      }

      el.addEventListener('touchend', endHandler, true);
    } else {
      if (!stopped) {
        moveTo(e.pageX, e.pageY);
      }
      globalThis.onMouseMove = function(e) {
        e.preventDefault();

        // contM func  desktop
        if (cont) {
          contM(dragee, cont, e.pageX, e.pageY);
          // console.log('in CONT');
        }
        // end func

        // console.log('event '+e);
        if (!stopped) {
          moveTo(e.pageX, e.pageY);
        }
      };// endonMouseOver

      document.addEventListener('mousemove', onMouseMove, true);
      // remove lister if dragee mouse up
      dragee.onmouseup = function() {
        // console.log('remove listener');
        document.removeEventListener('mousemove', onMouseMove, true);
        dragee.onmouseup = null;
      };


      // remove lister if handle mouse up
      el.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove, true);
        el.onmouseup = null;
      };

      // remove listener if document mouse up
      document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove, true);
        el.onmouseup = null;
      };
      el.ondragstart = function() {
        return false;
      };
    }// end if tchdev
  };

  /* END DRAG */


  /* SWIPE */
  function swipe(node, drop=false, drpfn=false, lvupfn = false, zindex=1006, contain=false) {
    // if first param is a func or false then swiping is in affect
    let swipe = false;
    // swipeleft etc
    let swipeleft;
    // if first param if false or function then it is a swipe
    if (isFunction(node) || !node) {
      swipe = true;
      if (node) { // if node is actual a function sent in then swipeleft function activated
        swipeleft = node;
      }
    }
    let swiperight;
    if (drop && isFunction(drop) && swipe) {
      swiperight = drop;
    }

    var swipeup;
    if (drpfn && isFunction(drpfn) && swipe) {
      swipeup = drpfn;
    }

    var swipeup;
    if (lvupfn && isFunction(lvupfn) && swipe) {
      swipedown = lvupfn;
    }


    s = _stk[0];
    s.addEventListener('touchstart', handleTouchStart, false);
    s.addEventListener('touchmove', handleTouchMove, false);
    s.addEventListener('touchend', handleTouchEnd, false);
    let xDown = null;
    let yDown = null;


    let draggable = false;
    if (s.matches('.draggable') && !swipe) { // only draggable if not swiping
      draggable = true;
    }

    function dragme(e) {
      e.preventDefault();
      if (draggable) {
        doDrag(_stk[0], e, node, drop, drpfn, lvupfn, zindex, contain );
      }
    }

    function handleTouchEnd(e) {
      // for future use
      return;
    }
    function handleTouchStart(e) {
      const touchLocation = e.targetTouches[0];

      xDown = touchLocation.pageX;
      yDown = touchLocation.pageY;
    };
    function handleTouchMove(e) {
      e.preventDefault();
      if ( ! xDown || ! yDown ) {
        return;
      }
      const touchLocation = e.targetTouches[0];

      const xUp = touchLocation.pageX;
      const yUp = touchLocation.pageY;

      const xDiff = xDown - xUp;
      const yDiff = yDown - yUp;

      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) { // most significant
        if ( xDiff > 0 ) {
          // left swipe
          // console.log('swiped left');
          if (swipe && swipeleft ) {
            swipeleft(e);
          }
          dragme(e);
        } else {
          // right swipe
          // console.log('swiped right');
          if (swipe && swiperight ) {
            swiperight(e);
          }
          dragme(e);
        }
      } else {
        if ( yDiff > 0 ) {
          // up swipe
          // console.log('swiped up');
          if (swipe && swipeup ) {
            swipeup(e);
          }
          dragme(e);
        } else {
          // down swipe
          // console.log('swiped down');
          if (swipe && swipedown ) {
            swipedown(e);
          }
          dragme(e);
        }
      }
      // reset values
      xDown = null;
      yDown = null;
      if (swipe) {
        // console.log('swiped');
      }
    };
    return this;
  }
  /* END SWIPE */


  /* END DRAG AND SWIPE */

  // edrag removal pattern here
  /* eslint-disable */
   {edrag: rm}
   /* eslint-enable */


  function _Route( dir, ...args) {
    let newroute;
    const search = globalThis.location.search;
    const hash = globalThis.location.hash;
    let loc = globalThis.location.pathname;
    // console.log('SEARCH '+search);
    if (!dir) {
      return globalThis.location.pathname;
    }

    if (isString(dir)) {
      if (dir.match(/^[?#&]/) ) {
        // console.log('hash '+dir);
        if (hash !== dir) {
          if (dir.match(/^[#]/) ) {
            loc = loc.replace(/\/$/, '');
          }
          //  console.log(loc + dir);
          // console.log(globalThis.location.protocol +'//'+ globalThis.location.hostname+loc+dir);
          return;
          // return  globalThis.location = globalThis.location.protocol +'//'+ globalThis.location.hostname+loc+dir;
        }
      }


      if (dir.match(/^[?#&]/) && dir === hash ) {
        return;
      }
    }

    newroute = dir+'/';

    if (args.length) {
      for ( const r of args ) {
        if (r.match(/^[?#&]/) ) {
          newroute += r;
        } else {
          newroute += r+'/';
        }
      }
    }

    const curpath = globalThis.location.pathname + search;
    if (curpath !== '/'+newroute) {
    // console.log('curpath is '+ curpath);
    // console.log('newroute /'+ newroute);
      globalThis.location = '/'+newroute;
    }
  }


  function Reactor(prop) {
    if (prop) {
      prop = _camelDash(prop);
    } else {
      prop = 'atom';
    }
    for ( const e of _stk ) {
      // Initialize the reactor on every component's data prop
      e.subscribers = [];

      e.reactor = {
        set: function(target, key, value) {
          //  console.log(`The property ${prop}.${key} on ${e.tagName} has been updated with ${value}`);
          for ( let i=0; i< e.subscribers.length; i++ ) {
            // console.log(e.subscribers[i]);
            const reactees = Object.keys(e.subscribers[i]);
            const watchers = Object.values(e.subscribers[i]);
            const watchProp = e.subscribers[i].watch; // property we are watching
            const sname = Object.keys(e.subscribers[i])[0];// subscriber name
            const el = e.subscribers[i].el;
            for ( const o of watchers ) {
              if (isFunction(o)) {
                if (watchProp === 'all' || watchProp == key) {
                  o( {data: value, name: sname, watch: watchProp, subscriber: el});
                }
              }
            }
          }
          return true;
        },
      };
      const react = new Proxy({}, e.reactor);
      // e.data = react;
      e[prop] = react;
    }
    return this;
  }


  //  for external use
  function ReactTo(obj, ob, localProp, externalProp = false) {
    if (_stk.length) {
      for ( const y of _stk ) {
        _ReactTo(obj, ob, localProp, externalProp, y);
      }
    } else {
      _ReactTo(obj, ob, localProp, externalProp );
    }

    return this;
  }

  // for internal use
  function _ReactTo(obj, ob, localProp, externalProp = false, e = false) {
    const name = _camelDash(ob);
    if (externalProp) {
      externalProp = _camelDash(externalProp);
    }
    if (!externalProp) {
      externalProp = 'all';
    }
    obj.subscribers.push({[name]: localProp, watch: externalProp, el: e} );
    return this;
  }


  function unReact(obj, name, prop='all' ) {
    name = _camelDash(name);
    prop = _camelDash(prop);
    const inc = 0;
    const narr = [];
    // console.log('prop '+ prop);
    for ( const s of obj.subscribers ) {
      if ( name in s && s.watch === prop ) {
        obj.subscribers.splice(s, 1);
        // console.log('S Watch '+s.watch);
        // console.log('NAME  is IN '+name)
        // console.log('WATCH  is '+s.watch)
      }
    }
    return this;
  }

  // this trigger will trigger the event for all on the stack
  function trigger(e) {
    for ( const y of _stk ) {
      const ev = new Event(e);
      y.dispatchEvent(ev, {'bubbles': true, 'cancelable': true} );
    }
    return this;
  }


  /* SPY */
  // params sel, fn to run after delay
  // Pass in an object and build config from that then change the if mutation
  // function spy(fn, name = 'name', delay=10 ) {
  function spy(fn, name = 'name', {delay=10, child=true, attr=true, subtree=false, attrs=['style'], chardat=false, attrsOV=false, chardatOV=false}, yo=false ) {
    // keep a record of observers in an object of global var or component so we can disconnect them later
  // yo here is to pass in a reference to a component  object
    if (yo) {
      var yumobservers = yo.yob;
      // console.log('I SPY COMPONENT YO');
    } else {
      var yumobservers = globalThis.yumobservers;
    }
    if (typeof(fn) !== 'function') {
      return;
    }
    // console.log('observer running');
    // configuration of the observer
    const config = {
      childList: child,
      attributes: attr,
      characterData: chardat,
      subtree: subtree,
      attributeFilter: attrs,
      attributeOldValue: attrsOV,
      characterDataOldValue: chardatOV,
    };


    const target = _stk;
    for ( let i = 0; i < target.length; i++) {
      //  console.log('spying '+name+i );
      const e = target[i];
      // create an observer instance
      const ob = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' || mutation.type === 'attributes' || mutation.type === 'subtree' || mutation.type === 'characterData') {
            setTimeout((t) => {
              // console.log('mutor type '+mutation.type);
              fn(e);
            }, delay);
          }// end childList
        });
      });
        // add to yumobservers object, pass in target nodes, and observer config
      // Do not allow spy with same name to exist - i.e the user might try to use same name on different object leaving the first one with a data-spy attr so just return here
      const spydat = document.querySelector(`[data-spy="${name+i}"]`);
      if (yumobservers[name+i] || spydat) {
        throw new Error(`spy ${name} exists choose a different name`);
        return;
      }
      _data(target[i], name+i, 'spy');
      yumobservers[name+i] = ob;
      yumobservers[name+i].observe(target[i], config);
    }
    return this;
  }// end spy

  function unspy(name='name', yo=false ) {
    if (yo) {
      var yumobservers = yo.yob;
      // console.log('I UNSPY COMPONENT YO');
    } else {
      var yumobservers = globalThis.yumobservers;
    }

    // disconnect all
    if (name === 'all') {
      for ( const o in yumobservers) {
        // console.log('disconnecting all');
        yumobservers[o].disconnect();
      }
    } else {
      const ykeys = Object.keys(yumobservers);
      let kinc = -1;
      // console.log('the keys' + ykeys);

      for ( const o of ykeys) {
        if (o.startsWith(name) ) {
          kinc++;
          // console.log('unspying '+name+kinc);
        }
        if (yumobservers[name+kinc] || yumobservers[name]) {
          let spydat;
          if (o === name) {
            spydat = document.querySelector(`[data-spy="${name}"]`);
            // if called directly by name
            // console.log('unspying direct '+name);
            yumobservers[name].disconnect();
          } else {
            spydat = document.querySelector(`[data-spy="${name+kinc}"]`);
            // console.log('unspying all that start with '+name);
            yumobservers[name+kinc].disconnect();
          }
          if (spydat) {
            // console.log('deleting spied   '+typeof(spydat));
            // these both work but the first is probably faster
            spydat.removeAttribute('data-spy');
            // _data(spydat, 'spy', 'remove');
          }
        }
      }
    }

    return this;
  }

  /* END SPY and UNSPY */


  /* END EVENTS */

  /* DOM TOOLS */
  /* scroll to bottom of el */
  function scroller(el) {
    el.scrollTop = el.scrollHeight;
  }

  /*
  function xscrollTo(to) {// object paramater for behavior smooth doesnt work in safari maybe some day it will
    if (typeof(to) === 'string') {
        to = document.querySelectorAll(to)[0];
      }else{
  to =  _stk[0];
          }
  let top = _rect(to, 'x');
  console.log(top);
  window.scroll({
    top: top,
    left: 0,
    behavior: 'smooth'
  });
      return this;
     }
 */


  function scrollTo(to) {
    if (isString(to)) {
      to = document.querySelectorAll(to)[0];
    } else {
      to = _stk[0];
    }
    to.scrollIntoView();
    return this;
  }


  /* ATTR */
  function removeAttr(str) {
    attr(str, false, true);
    return this;
  }

  function _data(e, a, r='set') {
    if (r === 'remove' ) {
      e.removeAttribute('data-'+a);
    }
    if (r === 'set') {
      e.setAttribute('data-'+a, a);
    }

    if (r === 'spy') { // for setting data on spy elements
      e.setAttribute('data-spy', a);
    }


    if (r === 'get') {
      return e.getAttribute('data-'+a);
    }
  }

  function attr(str, s=false, r=false) {
    if (str && isString(str)) {
      if (r) {
        for ( const y of _stk) {
          y.removeAttribute(str);
        }
        return this;
      }


      if (isString(s) || typeof(s) === 'number' ) {
        for ( const y of _stk) {
          y.setAttribute(str, s);
        }
        return this;
      }
      if (!s) {
        const a = _stk[0].getAttribute(str);
        return a;
      }
    }
  }


  /* CSS */

  function __dumpCSS(el) {
    let s = '';
    const o = getComputedStyle(el);
    for ( let i = 0; i < o.length; i++) {
      if (o.getPropertyValue(o[i]).length) {
        s+=o[i] + ':' + o.getPropertyValue(o[i])+';';
      }
    }
    return s;
  }


  // set 2nd param to true to over write the css
  function css(str, append = false) {
    if (!append && !str) {
      let style;
      for ( const y of _stk) {
        style += __dumpCSS(y);
        // console.log('css for '+y);
      }
      return style;
    }


    if (!append) {
    // console.log(str);
      for ( const y of _stk) {
        y.style.cssText = y.style.cssText + str;
      }
    } else {
      for ( const y of _stk) {
        y.style.cssText = str;
      }
    }
    return this;
  }

  function fadeOut(spd='fast', dtype='block') {
    fade(spd, dtype, false);
    return this;
  }


  function fadeIn(spd='fast', dtype='block') {
    fade(spd, dtype, true);
    return this;
  }

  // t = true to fade in
  function fade(spd='fast', dtype='block', t=false, single=false) {
    if (single) {
      _stk = single;// fade in this singular node if passed in
    }

    if (spd === 'fast') {
      spd = 20;
    }
    if (spd === 'slow') {
      spd = 1;
    }
    if (spd > 20) {
      spd = 20;
    }
    spd = 1000 / spd;
    const intv = setInterval( (e) => {
      const ready = true;
      for ( const y of _stk) {
        let op;
        if (t) {
          y.style.display = dtype;
          op = Number(y.style.opacity) + 0.1;
          y.style.visibility = 'visible';
          y.style.opacity = op;
          if (op > 1) {
            op = 1;
            clearInterval(intv);
          }
          y.style.opacity = op;
        } else {
          op = Number(y.style.opacity) - 0.1;
          if (!y.style.opacity.length) {
            op = 1;
          }
          y.style.opacity = op;
          if (op < 0.1) {
            op = 0;
            y.style.opacity = op;
            y.style.visibility = 'hidden';
            clearInterval(intv);
          }
        }
      }
    }, spd);
    return this;
  }


  function classToggle(str) {
    if (isString(str)) {
      for ( const y of _stk) {
        y.classList.toggle(str);
      }
    }
    return this;
  }

  function toggle(dtype='block', d = false) {
    for ( const s of _stk) {
      if (!s.matches('body')) { // no toggling on the body in case the selector is invalid
        let hid = false;

        if (s.style.opacity && Number(s.style.opacity) < 0.1) {
          hid = true;
        }


        if (s.visibility === 'hidden') {
          hid = true;
        }

        const disp = getComputedStyle(s).display;
        if (s.style.display === 'none' || disp === 'none') {
          hid = true;
        }

        if (hid) {
          // call fade with params and single as s
          if (d) {
            fade(d, dtype, true, [s]);// fade in single
          } else {
            s.visibility = 'visible';
            s.style.opacity = 1;
            s.style.display = dtype;
          }
        }

        if (!hid) {
          if (d) {
            fade(d, dtype, false, [s]);// fade out single
          } else {
            s.style.opacity = 0;
            s.visibility = 'hidden';
            s.style.display = dtype;
          }
        }
      }
    }

    return this;
  }

  function after(str) {
    __beforeOrAfter(str);
    return this;
  }


  function before(str) {
    __beforeOrAfter(str, true);
    return this;
  }

  function insertBefore(str) {
    __beforeOrAfter(str, true, true);
    return this;
  }

  function insertAfter(str) {
    __beforeOrAfter(str, false, true);
    return this;
  }


  function __beforeOrAfter(str, p=false, I=false ) {
    for ( const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        let to;
        if (__isHTML(str)) {
          to = __procHTML(__isHTML(str, true), true);
          if (!to) {
            break;
          }// break out of for if to does not exist
        } else {
          to = document.querySelectorAll(str)[0];
          if (!to) {
            break;
          }// break out of for if to does not exist
        }
        if (p) {
          if (I) {
            to.before(y);
          } else {
            y.before(to);
          }
        } else {
          if (I) {
            to.after(y);
          } else {
            y.after(to);
          }
        }
      }
      if ( isObject(str) && str.nodeType == 1) {
        if (p) {
          if (I) {
            str.before(y);
          } else {
            y.before(str);
          }
        } else {
          if (I) {
            str.after(y);
          } else {
            y.after(str);
          }
        }
      }
      return this;
    }
  }

  // APPEND
  function append(str, p=false) {
    if (!str) {
      return this;
    }
    // console.log('type of str '+ typeof(str));
    for ( const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        let el;
        if (__isHTML(str)) {
          el = __procHTML(__isHTML(str, true), true);
        } else {
          el = str;
        }
        if (p) {
          y.prepend(el);
        } else {
          y.append(el);
        }
      } else {
        if (p) {
          y.prepend(str);
          // console.log('prepending');
        } else {
          y.append(str);
          // console.log('not prepending');
        }
      }
    }
    return this;
  }

  // PREPEND
  function prepend(str) {
    if (!str) {
      return this;
    }
    append(str, true);
    return this;
  }

  // APPENDTO AND PREPENDTO
  function prependTo(str) {
    if (!str) {
      return this;
    }


    __To(str, true);
    return this;
  }


  function appendTo(str, p=false) {
    if (!str) {
      return this;
    }

    __To(str);
    return this;
  }

  function __To(str, p=false) {
    for ( const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        const to = document.querySelectorAll(str)[0];
        if (!to) {
          return this;
        }
        if (p) {
          to.prepend(y);
        } else {
          to.append(y);
        }
      }
      if ( isObject(str) && str.nodeType == 1) {
        if (p) {
          str.prepend(y);
        } else {
          str.append(y);
        }
      }
      return this;
    }
  }

  function show() {
    for ( const y of _stk) {
      y.style.visibility = 'visible';
      if (getComputedStyle(y).display === 'none') {
        y.style.display = 'block';
      }
    }
    return this;
  }

  function hide() {
    for ( const y of _stk) {
      y.style.visibility = 'hidden';
    }
    return this;
  }


  // PARENT for each element in the stack put each direct parent on the stack and subsequent chains will act on the parent/s - if You want to return the collection chain with ._
  function parent() {
    let nstk = [];// the new stack
    for ( const y of _stk) {
      nstk.push(y.parentElement);
    // console.log(y.parentElement.classList);
    }
    if (nstk.length) {
    // console.log('GOT nstk');
      nstk = nstk.filter((x, i, a) => a.indexOf(x) == i);
      _stk = nstk.slice(0);
      obj._ = _stk;
      obj.first = _stk[0];
      // make stack unique  since elements could have the same parent
    }
    return this;
  }

  // PARENTS
  function parents(fn=false, matchsel=false) {
    // if matchsel then only operate on matches
    // if fn is a function run fn against all parents[done];
    // if fn is not a function(maybe bool) push all parents to an array and replace the _stk with the new array (nstk)  of parents so that we the next chained functions will operate on them (like css or text or html etc)
    const nstk = [];// the new stack


    if (matchsel) {
      for ( const y of _stk) {
        let els = y;
        while (els = els.parentElement) {
          if (els.matches(matchsel)) {
            nstk.push(els);
          }
        }
      }
    }

    if (!matchsel) {
      for ( const y of _stk) {
        let els = y;
        while (els = els.parentElement) {
          nstk.push(els);
        }
      }
    }
    // if nstk has anything in it then replace the _stk with the new stack of parents so that subsequent chains act upon the parents
    if (nstk.length) {
      _stk = nstk.slice(0);

      // make stack unique  since elements could have the same parent
      _stk = _stk.filter((x, i, a) => a.indexOf(x) == i);
      obj._ = _stk;// update _ function to reflect new _stk
      obj.first = _stk[0];
      if (isFunction(fn)) {
        for ( const y of _stk) {
          fn(y);
        }
      }
    }
    return this;
  }


  // CHILDREN
  // finds only direct children of elements on stack but children.children will keep going if first in chain is true
  // str can be singular selector, nothing or comma delim list of selectors, fn if passed in will run on each found child
  function children(str, fn=false) {
    // str can be comma delim list of selectors to match
    let starr=[];
    if (isString(str)) {
      starr = str.split(',');
    }
    // console.log('starr is '+starr);
    const carr = [];// the children array
    for ( const y of _stk) {
      const c = y.children;// a collections of child nodes for each item on the stack;
      // each item on the stacks children are pushed to carr array
      for (let i = 0; i < c.length; i++) {
        if (starr.length) {
          for ( const a of starr) {
            if (c[i].matches(a)) {
              carr.push(c[i]);
              // console.log(c[i].classList);
            }
          }
        }
        // no selectors just get all children
        else {
          carr.push(c[i]);
          // console.log(i);
        }
      }
    }// end outer for

    // we got some so change the stack
    if (carr.length) {
      _stk = carr.slice(0);
      obj._ = _stk;
      obj.first = _stk[0];

      // if a function was passed execute it for every element of the new stack
      if (isFunction(fn)) {
        for ( const y of _stk) {
          fn(y);
        }
      }
    }

    if (!carr.length) {
      // return false; // this was set to stop the stack being changed when no children were found but that causes errors so..
      // instead of returning false create a fake node but never add it to the document it so chaining still works
      const faux = _createNode('span');
      _stk = [faux];
      obj._ = _stk;
      obj.first = _stk[0];
      faux.remove();
    }

    return this;
  }

  // FIND
  // can pass in a selector that is valid to querySelector all or a singular element
  function find(str, fn=false) {
    const farr = [];// the found array
    let type = 's';
    if (isObject(str)) {
      type = 'o';
    }
    for ( const y of _stk) {
      // fn(y);
      if (type !== 'o') {
        const sel = y.querySelectorAll(str);
        for ( const s of sel) {
          // console.log(s.classList);
          farr.push(s);
        }
      }// end is selector
      // if an actual object element was sent in
      else {
        for ( const y of _stk) {
          if (y.contains(str)) {
            farr.push(str);
          }
        }
      }
    }// end for

    // we got some so change the stack
    if (farr.length) {
      _stk = farr.slice(0);
      obj._ = _stk;
      obj.first = _stk[0];
      // if a function was passed execute it for every element of the new stack
      if (isFunction(fn)) {
        for ( const y of _stk) {
          fn(y);
        }
      }
    }

    if (!farr.length) {
    // return false; // this was set to stop the stack being changed when no children were found but that causes errors so..
      // instead of returning false create a fake node but never add it to the document it so chaining still works
      const faux = _createNode('span');
      _stk = [faux];
      obj._ = _stk;
      obj.first = _stk[0];
      faux.remove();
    }
    return this;
  }


  // FOREVERY
  function forEvery(str, fn) {
    for ( const y of _stk) {
      // console.log(str);
      if (y.matches(str)) {
        if (isFunction(fn)) {
          fn(y);
        }
      }
    }
    return this;
  }

  // EACH
  function each(fn) {
    for ( const y of _stk) {
      fn(y);
    }
    return this;
  }

  function detach() {
    for ( const y of _stk) {
      y.remove();
    }
    return this;
  }


  // addClass
  function addClass(s, r=false) {
    for ( const y of _stk) {
      if (!r) {
        y.classList.add(s);
      } else {
        // console.log('I should remove class');
        y.classList.remove(s);
      }
    }
    return this;
  }
  // removeClass
  function removeClass(s) {
    addClass(s, true); // call addClass with remove option
    return this;
  }

  // PLUGIN
  function plug(fn) {
    for ( const x of _stk) {
      fn(x);
    }
    return this;
  }

  // same as plug but without plugvar and return value ret
  function fn(f) {
    f(_stk);
    return this;
  }


  /*
  // a TEMPLATE for future use
  function template() {
    for ( let y of _stk) {
      // console.log(y.classList);
    }
    return this;
  }
  */

  /* END DOM TOOLS */


  /* STACK TOOLS */
  function _getstack(num) {
    // use like yum('.butt').getstack(0);
    if (num === 'all') {
      return _stk;
    } else {
      return _stk[num];
    }
  }

  /* END STACK TOOLS */


  // replace multiple dashes with one
  function _singleDash(str) {
    str = str.trim().replace(/\s/g, '-');
    str = str.replace(/-$/, '');
    str = str.replace(/^-/, '');
    str = str.replace(/-+/g, '-');
    str = str.replace(/[^a-z0-9-]+/gi, '');
    return str;
  }
  // return hyphenated names as camel case foo-foo becomes fooFoo
  function _camelDash(str) {
    str = _singleDash(str);
    return str.split('-').reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));
  }
  // DATA
  function data(name, data=false) {
    for ( const y of _stk) {
      if (!y.data) {
        y.data = {};
      }

      if (name) {
        name = _camelDash(name);
      }

      const nm = name;
      // if the name exists but the data is different, update it
      if (y.data.nm && y.data[nm] !== data) {
        y.data[nm] = data;
        // console.log('UPDATE DATA '+data);
      }


      // if data doesnt exist by that name store it
      if (name && !y.data.nm && data) {
        y.data[nm] = data;
        // console.log('STORE DATA '+data);
      }

      // not name return what is in data
      if (!name) {
        // console.log('RETURN DATA ');
        return y.data;
      }

      if (name && !data) {
        // retrieve the named data
        const res = [];
        const keys = Object.keys(y.data);
        for ( const k of keys) {
          //  console.log('DATA NAME: '+k);
          if (k === nm) {
            res.push(y.data[k]);
          }
        }
        // console.log('RETRIEVE DATA '+nm);
        return res;
      }
    }
    return this;
  }

  function isString(thing) {
    return typeof thing === 'string';
  }

  function isFunction(thing) {
    return typeof thing === 'function';
  }

  function isObject(thing) {
    return typeof thing === 'object';
  }


  function ctx(str='2d', obj=false) {
  // obj can be context attributes see MDN
    console.log(typeof(_stk[0]));
    console.log('n name = '+_stk[0].nodeName);
    if (_stk[0].tagName === 'CANVAS' || _stk[0].nodeName === 'CANVAS' || _stk[0] instanceof HTMLCanvasElement ) {
      if (obj) {
        return _stk[0].getContext(str, obj);
      } else {
        return _stk[0].getContext(str);
      }
    } else {
      throw new Error( 'First argument to yum is not an instance of canvas.' );
    }
  }

  // App, to=element {options [pos=position, reactor = create a reactor, set reactor element to atom  }
  function _render(fn, to='body', { pos='append', reactor=false, r='atom'} ) {
    // check if function
    let h;
    if (isFunction(fn)) {
      h = fn(to);

    if(reactor){
    console.log('reactor activated');
    yum(h).Reactor(r);
    }

    } else {
      return;
    }

    // switch for pos
    switch (pos) {
      case 'after':
        yum(h).insertAfter(to);
        break;

      case 'before':
        yum(h).insertBefore(to);
        break;

      case 'prepend':
        yum(h).prependTo(to);
        break;

      default:
        yum(h).appendTo(to);
        break;
    }
    return;
  }

  const obj = {
    first: _stk[0],
    _: _stk,
    _getstack: _getstack,
    _createNode: _createNode,
    _render: _render,
    css: css,
    ctx: ctx,
    data: data,
    parents: parents,
    parent: parent,
    _sfilter: _sfilter,
    _uuidv4: _uuidv4,
    addEvent: addEvent,
    on: addEvent,
    off: removeEvent,
    removeEvent: removeEvent,
    doDrag: doDrag,
    drag: drag,
    drg: drg,
    swipe: swipe,
    _isTouch: _isTouch,
    _createEvent: _createEvent,
    _ReactTo: _ReactTo,
    ReactTo: ReactTo,
    Reactor: Reactor,
    _Route: _Route,
    unReact: unReact,
    scroller: scroller,
    scrollTo: scrollTo,
    text: text,
    html: html,
    attr: attr,
    addClass: addClass,
    removeClass: removeClass,
    classToggle: classToggle,
    toggle: toggle,
    removeAttr: removeAttr,
    before: before,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    after: after,
    append: append,
    prepend: prepend,
    appendTo: appendTo,
    prependTo: prependTo,
    forEvery: forEvery,
    each: each,
    show: show,
    hide: hide,
    detach: detach,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    ready: ready,
    delay: delay,
    plug: plug,
    spy: spy,
    unspy: unspy,
    trigger: trigger,
    find: find,
    children: children,
    _eventDispatch: _eventDispatch,
    _rpx: _rpx,
    _rect: _rect,
    _cs: _cs,
    _singleDash: _singleDash,
    _camelDash: _camelDash,
    _getAtPt: _getAtPt,
    fn: fn,
  };


  return obj;
};
