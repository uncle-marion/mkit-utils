export { default as storageManage } from "./storageManage";
export { default as EasyMenu } from "./EasyMenu";
export { default as EasyBread } from "./EasyBread";
export { default as EasyTag } from "./EasyTag";

// const toString = Object.prototype.toString;

interface anyObj {
  [key: string]: any;
}
/**
 * 去除文字前后的空白
 *
 * @param {String} str 待处理文字
 * @returns {String} 处理完成后的文字
 */
export function trim(str: string): string {
  return str.replace(/^\s*/, "").replace(/\s*$/, "");
}

/**
 * 时间格式化工具
 *
 * @param {Number | Date} time 正确的时间戳或时间对象
 * @param {String} type 时间格式，默认为YYYY-MM-DD hh:mm:ss
 * @returns {String} 格式化完成后的时间字符串
 */
export function formatDate(time: number | Date, type: string = "YYYY-MM-DD hh:mm:ss"): string {
  if (typeof time === "number") {
    time = new Date(time);
  }
  interface Module {
    [key: string]: number;
  }
  // 将当前时间中需要用到的内容都取出来
  const module: Module = {
    Y: time.getFullYear(),
    M: time.getMonth() + 1,
    D: time.getDate(),
    h: time.getHours(),
    m: time.getMinutes(),
    s: time.getSeconds(),
  };
  return type.replace(/(Y+|M+|D+|h+|m+|s+)/g, function (str) {
    return ("0" + module[str.slice(-1)]).slice(-str.length);
  });
}

/**
 * 获取一个包含字母数字的随机数
 * @param length
 * @returns
 */
export function getRandomString(length = 8) {
  return Math.random()
    .toString(36)
    .slice(2, length + 2)
    .replace(/[a-z]/g, (s) => {
      return Math.random() > 0.5 ? s.toLocaleUpperCase() : s;
    });
}

/**
 * url转对象
 * @param url {string} url
 * @param separator {string} 连接符，默认&
 * @param connector {string} 连接符，默认=
 * @returns {anyObj}
 */
export function urlToParams(url: string, separator: string = "&", connector: string = "="): anyObj {
  // 检测url字符串中是否存在？号
  url = url.includes("?") ? url.split("?")[1] : url;
  return url.split(separator).reduce((prev, curr) => {
    const [key, value] = curr.split(connector);
    prev[key] = value;
    return prev;
  }, {});
}

/**
 * 对象转url
 * @param obj {anyObj}
 * @param separator {string} 连接符，默认&
 * @param connector {string} 连接符，默认=
 * @returns {string}
 */
export function paramsToUrl(obj: anyObj, separator: string = "&", connector: string = "="): string {
  return Object.keys(obj)
    .reduce((prev: any[], key) => {
      prev.push(`${key}${connector}${obj[key]}`);
      return prev;
    }, [])
    .join(separator);
}
