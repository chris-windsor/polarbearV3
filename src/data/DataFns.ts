type contiguousObj = { [key: string]: any }

// https://github.com/lukeed/dset
export const setProp = (obj: contiguousObj, keys: (string | string[]), val: any): void => {
  (keys as string).split && (keys = (keys as string).split("."));
  let i = 0, l = keys.length, t = obj, x;
  for (; i < l; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = (i === l - 1 ? val : (x != null ? x : (!!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1)) ? {} : []));
  }
};

// https://github.com/developit/dlv
export const getProp = (obj: contiguousObj, key: (string | string[]), def?: any, p?: number): any => {
  p = 0;
  key = (key as string).split ? (key as string).split(".") : key;
  while (obj && p < key.length) obj = obj[key[p++]];
  return (obj === undefined || p < key.length) ? def : obj;
};
