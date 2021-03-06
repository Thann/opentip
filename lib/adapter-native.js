var Adapter,
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Adapter = (function() {
  var dataValues, lastDataId;

  function Adapter() {}

  Adapter.prototype.name = "native";

  Adapter.prototype.domReady = function(callback) {
    var add, doc, done, init, poll, pre, ref, rem, root, top, win;
    done = false;
    top = true;
    win = window;
    doc = document;
    if ((ref = doc.readyState) === "complete" || ref === "loaded") {
      return callback();
    }
    root = doc.documentElement;
    add = (doc.addEventListener ? "addEventListener" : "attachEvent");
    rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
    pre = (doc.addEventListener ? "" : "on");
    init = function(e) {
      if (e.type === "readystatechange" && doc.readyState !== "complete") {
        return;
      }
      (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
      if (!done) {
        done = true;
        return callback();
      }
    };
    poll = function() {
      var e, error;
      try {
        root.doScroll("left");
      } catch (error) {
        e = error;
        setTimeout(poll, 50);
        return;
      }
      return init("poll");
    };
    if (doc.readyState !== "complete") {
      if (doc.createEventObject && root.doScroll) {
        try {
          top = !win.frameElement;
        } catch (undefined) {}
        if (top) {
          poll();
        }
      }
      doc[add](pre + "DOMContentLoaded", init, false);
      doc[add](pre + "readystatechange", init, false);
      return win[add](pre + "load", init, false);
    }
  };

  Adapter.prototype.create = function(htmlString) {
    var div;
    div = document.createElement("div");
    div.innerHTML = htmlString;
    return this.wrap(div.childNodes);
  };

  Adapter.prototype.wrap = function(element) {
    var el;
    if (!element) {
      element = [];
    } else if (typeof element === "string") {
      element = this.find(document.body, element);
      element = element ? [element] : [];
    } else if (element instanceof NodeList) {
      element = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = element.length; i < len; i++) {
          el = element[i];
          results.push(el);
        }
        return results;
      })();
    } else if (!(element instanceof Array)) {
      element = [element];
    }
    return element;
  };

  Adapter.prototype.unwrap = function(element) {
    return this.wrap(element)[0];
  };

  Adapter.prototype.tagName = function(element) {
    return this.unwrap(element).tagName;
  };

  Adapter.prototype.attr = function(element, attr, value) {
    if (arguments.length === 3) {
      return this.unwrap(element).setAttribute(attr, value);
    } else {
      return this.unwrap(element).getAttribute(attr);
    }
  };

  lastDataId = 0;

  dataValues = {};

  Adapter.prototype.data = function(element, name, value) {
    var dataId;
    dataId = this.attr(element, "data-id");
    if (!dataId) {
      dataId = ++lastDataId;
      this.attr(element, "data-id", dataId);
      dataValues[dataId] = {};
    }
    if (arguments.length === 3) {
      return dataValues[dataId][name] = value;
    } else {
      value = dataValues[dataId][name];
      if (value != null) {
        return value;
      }
      value = this.attr(element, "data-" + (Opentip.prototype.dasherize(name)));
      if (value) {
        dataValues[dataId][name] = value;
      }
      return value;
    }
  };

  Adapter.prototype.find = function(element, selector) {
    return this.unwrap(element).querySelector(selector);
  };

  Adapter.prototype.findAll = function(element, selector) {
    return this.unwrap(element).querySelectorAll(selector);
  };

  Adapter.prototype.update = function(element, content, escape) {
    element = this.unwrap(element);
    if (escape) {
      element.innerHTML = "";
      return element.appendChild(document.createTextNode(content));
    } else {
      return element.innerHTML = content;
    }
  };

  Adapter.prototype.append = function(element, child) {
    var unwrappedChild, unwrappedElement;
    unwrappedChild = this.unwrap(child);
    unwrappedElement = this.unwrap(element);
    return unwrappedElement.appendChild(unwrappedChild);
  };

  Adapter.prototype.remove = function(element) {
    var parentNode;
    element = this.unwrap(element);
    parentNode = element.parentNode;
    if (parentNode != null) {
      return parentNode.removeChild(element);
    }
  };

  Adapter.prototype.addClass = function(element, className) {
    return this.unwrap(element).classList.add(className);
  };

  Adapter.prototype.removeClass = function(element, className) {
    return this.unwrap(element).classList.remove(className);
  };

  Adapter.prototype.css = function(element, properties) {
    var key, results, value;
    element = this.unwrap(this.wrap(element));
    results = [];
    for (key in properties) {
      if (!hasProp.call(properties, key)) continue;
      value = properties[key];
      results.push(element.style[key] = value);
    }
    return results;
  };

  Adapter.prototype.dimensions = function(element) {
    var dimensions, revert;
    element = this.unwrap(this.wrap(element));
    dimensions = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
    if (!(dimensions.width && dimensions.height)) {
      revert = {
        position: element.style.position || '',
        visibility: element.style.visibility || '',
        display: element.style.display || ''
      };
      this.css(element, {
        position: "absolute",
        visibility: "hidden",
        display: "block"
      });
      dimensions = {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
      this.css(element, revert);
    }
    return dimensions;
  };

  Adapter.prototype.scrollOffset = function() {
    return [window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop];
  };

  Adapter.prototype.viewportDimensions = function() {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
  };

  Adapter.prototype.mousePosition = function(e) {
    var error, pos;
    pos = {
      x: 0,
      y: 0
    };
    if (e == null) {
      e = window.event;
    }
    if (e == null) {
      return;
    }
    try {
      if (e.pageX || e.pageY) {
        pos.x = e.pageX;
        pos.y = e.pageY;
      } else if (e.clientX || e.clientY) {
        pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
    } catch (error) {
      e = error;
    }
    return pos;
  };

  Adapter.prototype.offset = function(element) {
    var offset;
    element = this.unwrap(element);
    offset = {
      top: element.offsetTop,
      left: element.offsetLeft
    };
    while (element = element.offsetParent) {
      offset.top += element.offsetTop;
      offset.left += element.offsetLeft;
      if (element !== document.body) {
        offset.top -= element.scrollTop;
        offset.left -= element.scrollLeft;
      }
    }
    return offset;
  };

  Adapter.prototype.observe = function(element, eventName, observer) {
    return this.unwrap(element).addEventListener(eventName, observer, false);
  };

  Adapter.prototype.stopObserving = function(element, eventName, observer) {
    return this.unwrap(element).removeEventListener(eventName, observer, false);
  };

  Adapter.prototype.ajax = function(options) {
    var e, error, error1, ref, ref1, request;
    if (options.url == null) {
      throw new Error("No url provided");
    }
    if (window.XMLHttpRequest) {
      request = new XMLHttpRequest;
    } else if (window.ActiveXObject) {
      try {
        request = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (error) {
        e = error;
        try {
          request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (error1) {
          e = error1;
        }
      }
    }
    if (!request) {
      throw new Error("Can't create XMLHttpRequest");
    }
    request.onreadystatechange = function() {
      var error2;
      if (request.readyState === 4) {
        try {
          if (request.status === 200) {
            if (typeof options.onSuccess === "function") {
              options.onSuccess(request.responseText);
            }
          } else {
            if (typeof options.onError === "function") {
              options.onError("Server responded with status " + request.status);
            }
          }
        } catch (error2) {
          e = error2;
          if (typeof options.onError === "function") {
            options.onError(e.message);
          }
        }
        return typeof options.onComplete === "function" ? options.onComplete() : void 0;
      }
    };
    request.open((ref = (ref1 = options.method) != null ? ref1.toUpperCase() : void 0) != null ? ref : "GET", options.url);
    return request.send();
  };

  Adapter.prototype.clone = function(object) {
    var key, newObject, val;
    newObject = {};
    for (key in object) {
      if (!hasProp.call(object, key)) continue;
      val = object[key];
      newObject[key] = val;
    }
    return newObject;
  };

  Adapter.prototype.extend = function() {
    var i, key, len, source, sources, target, val;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = sources.length; i < len; i++) {
      source = sources[i];
      for (key in source) {
        if (!hasProp.call(source, key)) continue;
        val = source[key];
        target[key] = val;
      }
    }
    return target;
  };

  return Adapter;

})();

Opentip.addAdapter(new Adapter);
