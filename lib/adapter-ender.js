var slice = [].slice,
  hasProp = {}.hasOwnProperty;

(function($) {
  var Adapter, bean, reqwest;
  bean = require("bean");
  reqwest = require("reqwest");
  $.ender({
    opentip: function(content, title, options) {
      return new Opentip(this, content, title, options);
    }
  }, true);
  Adapter = (function() {
    function Adapter() {}

    Adapter.prototype.name = "ender";

    Adapter.prototype.domReady = function(callback) {
      return $.domReady(callback);
    };

    Adapter.prototype.create = function(html) {
      return $(html);
    };

    Adapter.prototype.wrap = function(element) {
      element = $(element);
      if (element.length > 1) {
        throw new Error("Multiple elements provided.");
      }
      return element;
    };

    Adapter.prototype.unwrap = function(element) {
      return $(element).get(0);
    };

    Adapter.prototype.tagName = function(element) {
      return this.unwrap(element).tagName;
    };

    Adapter.prototype.attr = function() {
      var args, element, ref;
      element = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = $(element)).attr.apply(ref, args);
    };

    Adapter.prototype.data = function() {
      var args, element, ref;
      element = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = $(element)).data.apply(ref, args);
    };

    Adapter.prototype.find = function(element, selector) {
      return $(element).find(selector)[0];
    };

    Adapter.prototype.findAll = function(element, selector) {
      return $(element).find(selector);
    };

    Adapter.prototype.update = function(element, content, escape) {
      element = $(element);
      if (escape) {
        return element.text(content);
      } else {
        return element.html(content);
      }
    };

    Adapter.prototype.append = function(element, child) {
      return $(element).append(child);
    };

    Adapter.prototype.remove = function(element) {
      return $(element).remove();
    };

    Adapter.prototype.addClass = function(element, className) {
      return $(element).addClass(className);
    };

    Adapter.prototype.removeClass = function(element, className) {
      return $(element).removeClass(className);
    };

    Adapter.prototype.css = function(element, properties) {
      return $(element).css(properties);
    };

    Adapter.prototype.dimensions = function(element) {
      return $(element).dim();
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
      var pos;
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
      if (e.pageX || e.pageY) {
        pos.x = e.pageX;
        pos.y = e.pageY;
      } else if (e.clientX || e.clientY) {
        pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      return pos;
    };

    Adapter.prototype.offset = function(element) {
      var offset;
      offset = $(element).offset();
      return {
        top: offset.top,
        left: offset.left
      };
    };

    Adapter.prototype.observe = function(element, eventName, observer) {
      return $(element).on(eventName, observer);
    };

    Adapter.prototype.stopObserving = function(element, eventName, observer) {
      return $(element).unbind(eventName, observer);
    };

    Adapter.prototype.ajax = function(options) {
      var ref, ref1;
      if (options.url == null) {
        throw new Error("No url provided");
      }
      return reqwest({
        url: options.url,
        type: 'html',
        method: (ref = (ref1 = options.method) != null ? ref1.toUpperCase() : void 0) != null ? ref : "GET",
        error: function(resp) {
          return typeof options.onError === "function" ? options.onError("Server responded with status " + resp.status) : void 0;
        },
        success: function(resp) {
          return typeof options.onSuccess === "function" ? options.onSuccess(resp) : void 0;
        },
        complete: function() {
          return typeof options.onComplete === "function" ? options.onComplete() : void 0;
        }
      });
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
  return Opentip.addAdapter(new Adapter);
})(ender);
