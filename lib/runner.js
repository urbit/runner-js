var stream, streamSnitch, colors, escapeStringRegexp, pty, ERROR, Urbit, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
stream = require('stream');
streamSnitch = require('stream-snitch');
colors = require('colors');
escapeStringRegexp = require('escape-string-regexp');
pty = require('pty.js');
out$.ERROR = ERROR = /((ford|warn): |\r\x1b\[K\/~)/;
out$.Urbit = Urbit = (function(){
  Urbit.displayName = 'Urbit';
  var prototype = Urbit.prototype, constructor = Urbit;
  function Urbit(args){
    var this$ = this;
    this.expect = bind$(this, 'expect', prototype);
    this.every = bind$(this, 'every', prototype);
    this.resetListeners = bind$(this, 'resetListeners', prototype);
    this.waitSilent = bind$(this, 'waitSilent', prototype);
    this.stdout = process.stdout;
    this.pty = pty.spawn('urbit', args);
    this.pty.on('data', function(it){
      return this$.stdout.write(it);
    });
    console.log("FIXME Running Ubuntu 14.04, which causes a libtinfo version info warning. Should update to 16.04.");
    console.log("starting vere with the following arguments:");
    console.log(args);
    this.lastOutput = Date.now();
    this.pty.on('data', function(){
      return this$.lastOutput = Date.now();
    });
    this.resetListeners();
    process.on('exit', function(){
      return this$.pty.write('\x04');
    });
    this.pty.on('exit', function(code, signal){
      switch (false) {
      case !code:
        return process.exit(code);
      case !signal:
        return process.exit(128 + signal);
      default:

      }
    });
  }
  Urbit.prototype.note = function(){
    var args, res$, i$, to$;
    res$ = [];
    for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    args = res$;
    return console.log.apply(console, [("\n" + repeatString$('_', 40) + "\nnode:").blue].concat(arrayFrom$(args)));
  };
  Urbit.prototype.warn = function(){
    var args, res$, i$, to$;
    res$ = [];
    for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    args = res$;
    return console.log.apply(console, [("\n" + repeatString$('!', 40) + "\nnode:").red].concat(arrayFrom$(args)));
  };
  Urbit.prototype.waitSilent = function(){
    var this$ = this;
    return new Promise(function(resolve){
      var a;
      return a = setInterval(function(){
        if (Date.now() > this$.lastOutput + 1000) {
          clearInterval(a);
          return resolve(this$.lastOutput);
        }
      }, 200);
    });
  };
  Urbit.prototype.resetListeners = function(){
    this.pty.socket.unpipe(this.listeners);
    this.pty.socket.pipe(this.listeners = new stream.PassThrough);
    return this;
  };
  Urbit.prototype.every = function(re, cb){
    return this.listeners.pipe(new streamSnitch(re).on("match", cb));
  };
  Urbit.prototype.expect = function(re){
    var this$ = this;
    return new Promise(function(resolve){
      return this$.listeners.pipe(new streamSnitch(re).once("match", resolve));
    });
  };
  Urbit.prototype.expectImmediate = function(re){
    return Promise.race([
      this.expect(re), this.waitSilent().then(function(){
        throw Error("Expected " + re + " during event");
      })
    ]);
  };
  Urbit.prototype.line = function(s){
    var this$ = this;
    this.pty.write(s);
    return this.waitSilent().then(function(){
      this$.stdout.write("\n");
      return this$.pty.write("\r");
    });
  };
  Urbit.prototype.expectEcho = function(s){
    var this$ = this;
    return this.line(s).then(function(){
      return this$.expect(new RegExp(escapeStringRegexp(s)));
    });
  };
  Urbit.prototype.exit = function(code){
    this.pty.on('exit', function(){
      return process.exit(code);
    });
    this.pty.write("\x05\x15");
    return this.pty.write("\x04");
  };
  return Urbit;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
