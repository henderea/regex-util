const XRegExp = require('xregexp/lib/xregexp');
require('xregexp/lib/addons/matchrecursive')(XRegExp);

const replaceRegex = XRegExp(`\\$\\{(?<index>\\d+)(?<otherIndexes>(?:\\|\\d+)+)?(?<caseMod>(?:[,^]{1,2}))?(?:(?<question>\\?)(?<whenVal>[^:}]*)(?::(?<elseVal>[^:}]*))?|(?:(?<colon>:)(?:(?<hyphen>-)(?<fallback>[^{}]+)|(?<subStart>\\d+)(?::(?<subLen>\\d+))?)))?}`, 'g');

const isNil = (arg) => arg === null || typeof arg === 'undefined';

const getMatches = (replaceString) => XRegExp.matchRecursive(replaceString, '\\$\\{', '}', 'g', {
  valueNames: ['between', 'left', 'match', 'right'],
  escapeChar: '\\'
});

const doCaseMod = (caseMod, str) => {
  if(isNil(caseMod) || caseMod == '' || isNil(str) || str == '') { return str; }
  if(caseMod == '^') { return `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`; }
  if(caseMod == ',') { return `${str.slice(0, 1).toLowerCase()}${str.slice(1)}`; }
  if(caseMod == '^,') { return `${str.slice(0, 1).toUpperCase()}${str.slice(1).toLowerCase()}`; }
  if(caseMod == ',^') { return `${str.slice(0, 1).toLowerCase()}${str.slice(1).toUpperCase()}`; }
  if(caseMod == '^^') { return str.toUpperCase(); }
  if(caseMod == ',,') { return str.toLowerCase(); }
};

const getAt = (arr, ind) => {
  if(!arr) { return undefined; }
  if(ind < 0) { ind = arr.length + ind; }
  return arr[ind];
};

const mapParams = (inds, func) => {
  if(!inds && inds !== 0) { inds = []; }
  if(!Array.isArray(inds)) { inds = [inds]; }
  return (...args) => {
    const params = inds.map((i) => getAt(args, i));
    return func(...params);
  };
};

const processReplace = (args, replaceString, left = null, right = null) => {
  if(!replaceString || replaceString.length == 0) {
    return '';
  }
  let matches = getMatches(replaceString);

  if(matches.length <= 1) {
    if(left && right) {
      return XRegExp.replace(`${left}${replaceString}${right}`, replaceRegex, mapParams([0, -1], (match, groups) => {
        let { index, otherIndexes, caseMod, question, whenVal, elseVal, colon, hyphen, fallback, subStart, subLen } = groups;
        if(index >= args.length - 2) {
          return match;
        }
        let val = args[index];
        if(!isNil(otherIndexes) && isNil(val)) {
          let indexes = otherIndexes.split(/|/);
          for(let i = 0; i < indexes.length && isNil(val); i++) {
            let ind = indexes[i];
            if(!isNil(ind) && ind.length > 0 && ind < args.length - 2) {
              val = args[ind];
            }
          }
        }
        if(question == '?') {
          return doCaseMod(caseMod, !isNil(val) ? whenVal : (elseVal || ''));
        }
        if(colon == ':') {
          if(hyphen == '-') {
            return doCaseMod(caseMod, val || fallback || '');
          } else {
            if(isNil(subLen)) {
              return doCaseMod(caseMod, val.slice(parseInt(subStart)));
            } else {
              return doCaseMod(caseMod, val.slice(parseInt(subStart), parseInt(subStart) + parseInt(subLen)));
            }
          }
        }
        return doCaseMod(caseMod, val || '');
      }));
    } else {
      return replaceString;
    }
  }

  let ind = 0;
  let rv = [];
  let match, l, m, r;

  while(ind < matches.length) {
    match = matches[ind];
    if(match.name == 'between') {
      rv.push(match.value);
      ind++;
    } else if(match.name == 'left' && ind < matches.length - 2) {
      l = match.value;
      ind++;
      m = matches[ind].value;
      ind++;
      r = matches[ind].value;
      ind++;
      while(getMatches(m).length > 1) {
        m = processReplace(args, m, l, r);
      }
      rv.push(processReplace(args, m, l, r));
    }
  }

  return rv.join('');
};

const doReplace = (input, matchRegex, replaceString) => input.replace(matchRegex, (...args) => processReplace(args, replaceString));

const flatten = (array) => {
  let rv = [];
  array.forEach((i) => {
    if(Array.isArray(i)) {
      i.forEach((j) => {
        rv.push(j);
      });
    } else {
      rv.push(i);
    }
  });
  return rv;
};

const resetRegex = (regex) => {
  regex.lastIndex = 0;
  return regex;
};

const doMultiReplace = (input, ...subs) => {
  let rv = input;
  flatten(subs).forEach((sub) => {
    if(rv !== null) {
      if(Object.keys(sub).includes('replaceString')) {
        rv = doReplace(rv, resetRegex(sub.matchRegex), sub.replaceString);
      } else if(Object.keys(sub).includes('invertGrep')) {
        if(/\n/.test(rv)) {
          rv = rv.split(/\r?\n/g).map((l) => {
            let keep = resetRegex(sub.matchRegex).test(l) ? !sub.invertGrep : sub.invertGrep;
            return keep ? l : null;
          }).filter((l) => l !== null).join('\n');
        } else {
          let keep = resetRegex(sub.matchRegex).test(rv) ? !sub.invertGrep : sub.invertGrep;
          rv = keep ? rv : null;
        }
      }
    }
  });
  return rv;
};

module.exports = {
  XRegExp,
  processReplace,
  doReplace,
  doMultiReplace
};
