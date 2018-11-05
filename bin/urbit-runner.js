var split, through, ref$, Urbit, ERROR, urbit, slice$ = [].slice;
split = require('split');
through = require('promise-streams').through;
ref$ = require('../index.js'), Urbit = ref$.Urbit, ERROR = ref$.ERROR;
urbit = new Urbit(slice$.call(process.argv, 3));
urbit.expect(ERROR).then(function(){
  return process.exit(1);
});
urbit.expect(/dojo> /).then(function(){
  return process.stdin.pipe(split()).pipe(through(function(it){
    return urbit.line(it.trim().replace(/\$[a-zA-Z0-9_]+/g, function(it){
      var ref$;
      return (ref$ = process.env[it.slice(1)]) != null ? ref$ : '__unknown-var__';
    }));
  })).wait().then(function(){
    return urbit.exit(0);
  });
});