var ref$, Urbit, ERROR, urbit;
ref$ = require('./runner.ls'), Urbit = ref$.Urbit, ERROR = ref$.ERROR;
urbit = new Urbit(['-B', 'urbit.pill', '-A', '..', '-cSF', 'zod', 'zod']);
Promise.resolve(urbit).then(function(urb){
  urb.note("Booting urbit");
  return Promise.race([
    urb.expect(ERROR).then(function(){
      urb.warn("Boot error detected");
      throw Error("Stack trace while booting");
    }), urb.expect(/dojo> /).then(function(){
      return urb.expectEcho("%dojo-booted").then(function(){
        return urb.resetListeners();
      });
    })
  ]);
}).then(function(urb){
  var errs;
  urb.note("Running /===/tests");
  errs = "";
  urb.every(/(\/[ -~]* (FAILED|CRASHED))/, function(arg$){
    var _, result;
    _ = arg$[0], result = arg$[1];
    if (!errs) {
      urb.warn("First error");
    }
    return errs += "\n  " + result;
  });
  return urb.line("+test, =defer |, =seed `@uvI`(shaz %reproducible)").then(function(){
    return urb.expectEcho("%ran-tests").then(function(){
      if (errs) {
        throw Error(errs);
      }
      return urb.resetListeners();
    });
  });
}).then(function(urb){
  var errs, cur;
  urb.note("Testing compilation");
  errs = {};
  cur = "init";
  urb.every(/>> (\/[ -~]+)/, function(arg$){
    var _, path;
    _ = arg$[0], path = arg$[1];
    return cur = path;
  });
  urb.every(ERROR, function(){
    if (!errs[cur]) {
      errs[cur] = true;
      return urb.warn("Compile error detected");
    }
  });
  return urb.line("|start %test").then(function(){
    return urb.line(":test [%cores /]").then(function(){
      return urb.expectEcho("%compilation-tested").then(function(){
        errs = Object.keys(errs);
        if (errs.length) {
          throw Error("in " + errs);
        }
        return urb.resetListeners();
      });
    });
  });
}).then(function(urb){
  var errs, cur;
  urb.note("Testing renderers");
  errs = {};
  cur = "init";
  urb.every(/>> (\[[ -~]+)/, function(arg$){
    var _, ren;
    _ = arg$[0], ren = arg$[1];
    return cur = ren;
  });
  urb.every(ERROR, function(){
    if (!errs[cur]) {
      errs[cur] = true;
      return urb.warn("Renderer error detected");
    }
  });
  return urb.line(":test [%renders /]").then(function(){
    return urb.expectEcho("%renderers-tested").then(function(){
      errs = Object.keys(errs);
      if (errs.length) {
        throw Error("in " + errs);
      }
      return urb.resetListeners();
    });
  });
}).then(function(){
  return urbit.exit(0);
})['catch'](function(err){
  return urbit.waitSilent().then(function(){
    urbit.warn("Test aborted:", err);
    return urbit.exit(1);
  });
});
