/**
 * auth: marion.lau
 * mail: marion.lau@foxmail.com
 * lastChange: 2021/12/28 10:20
 */

type obj = {
  [key: string]: any;
};
type arr = {
  [index: number]: any;
};

// 需要存储|读取的属性名
type keyName = string;
// 需要存储的属性的值的类型
type dataType = obj | arr | number | string | boolean | undefined | null;

// 事件监听的回调函数
interface listenCallback {
  (x: string, y: any): void;
}

interface listenerCalls {
  // 参数名不定，值的类型为回调函数数组
  [paramName: string]: Array<listenCallback>;
}

// 约束我们的类
interface IManageStorage {
  // 写入方法
  set: (key: string, value: any, expiry?: number) => void;
  // 读取方法
  get: (key: string) => any;
  // 移除方法
  remove: (key: string) => boolean;
  // 清空方法
  clear: () => void;
  // 属性变化监听方法
  listener: (key: string, y: listenCallback) => void;
  // 回调函数集合
  listenerCalls: listenerCalls;
}

// 定义默认对象，设定默认对象可以避免getItem时出现空的问题
const dataBase: {
  version: string;
  auth: string;
  mail: string;
  root: obj; // 所有用户数据都在这个对象中保存
} = {
  version: "1.0.0",
  auth: "marion.lau",
  mail: "marion.lau@foxmail.com",
  root: {},
};

// 提供给用户的有效期计时单位为小时，需要转换成毫秒数
const hourToMS: number = 60 * 60 * 1000;

// 默认存储时间为1000天
const defaultExpiryTime: number = 24 * 1000 * hourToMS;

// 使用cookie来模仿storage
const cookies: {
  setItem: Function;
  getItem: Function;
} = {
  /**
   * 写入cookie
   */
  setItem(name: keyName, value: string) {
    const dataStr = `${name}=${value}; expires=${new Date(
      Date.now() + defaultExpiryTime
    ).toUTCString()}`;
    document.cookie = dataStr;
  },
  /**
   * 从cookie中取出
   */
  getItem() {
    const cookies = document.cookie.split(";");
    // 转成对象后取值
    return cookies.reduce((prev: obj, curr: string) => {
      const [key, value] = curr.split("=");
      prev[key] = value;
      return prev;
      // 取值
    }, {})["dataRoot"];
  },
};

/**
 * 检查当前环境是否支持storage
 */
function checkStorage() {
  const storage = window.localStorage;

  // 不支持storage
  if (!storage) return false;

  // 通过生成一个随机数并将其写入到storage中再读取的方式来验证所有对storage的操作都是允许的
  try {
    const val = Math.random().toString(36);
    storage.setItem("checkStorage", val);
    const value = storage.getItem("checkStorage");
    storage.removeItem("checkStorage");
    return val === value;
  } catch (err) {
    // 任意错误都返回false
    return false;
  }
}
// 如果不支持store就使用cookie
let storage = checkStorage() ? window.localStorage : cookies;

/**
 * 将用户数据写入缓存，
 */
function setStorage() {
  // 储存之前先使用encode转码，避免用户存值时存入一些特殊字符导致内容读取错误
  const dataStr = encodeURIComponent(JSON.stringify(dataBase));
  storage.setItem("dataRoot", dataStr);
}

/**
 * 从缓存中读取数据
 */
function getStorage() {
  const dataBase = storage.getItem("dataRoot");
  // 读取成功后也需要使用decode转码
  return dataBase ? JSON.parse(decodeURIComponent(dataBase)).root : {};
}

/**
 * 计算数据失效时间
 * @param expiryTime
 * @returns
 */
function getExpiryTime(expiryTime: number) {
  const now = Date.now();
  return expiryTime > 0 ? now + expiryTime * hourToMS : now;
}

/**
 * 校验数据有效性
 * @param expiryTime
 * @returns
 */
function dataValidate(expiryTime: number) {
  return Date.now() < expiryTime;
}

/**
 * 复制数据
 * @param data
 * @returns
 */
function cloneData(data: any) {
  return typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data;
}

/**
 * storage 管理类
 */
class StorageManage implements IManageStorage {
  listenerCalls: listenerCalls;
  constructor() {
    this.listenerCalls = {};
    // 初始化时读取当前浏览器中是否有上次缓存的数据
    dataBase.root = getStorage();
  }

  /**
   * 写入管理
   * @param name key 需要保存的属性
   * @param data data 需要保存的数据，不接受方法、正则等非正常数据类型
   * @param expiryTime timeSteamp 时间，以小时为单位，如未传则该数据会保存约三年时间
   */
  set(name: keyName, data: dataType, expiryTime: number = defaultExpiryTime) {
    // 将数据存入dataBase，这里使用的是完全覆盖，如果需要后期可以修改成合并
    dataBase.root[name] = {
      expiryTime:
        // 如果传入的时间超过30年，可以认为用户传入的是时间戳，不需要计算，直接使用
        expiryTime > 3e5 ? expiryTime * 1000 : getExpiryTime(expiryTime),
      val: data,
    };
    // 调用命令将数据写入缓存中
    setStorage();
    // 检查是否有对应的监听程序，如果有，调用监听程序
    const listenerCall = this.listenerCalls[name];
    if (listenerCall) {
      // 遍历执行所有监听方法
      listenerCall.map((item: Function) => {
        return item(data);
      });
    }

    // 返回写入成功
    return true;
  }
  /**
   * 读取管理
   * @param name
   * @returns
   */
  get(name: keyName): any {
    const data = dataBase.root[name];
    // 校验数据，如果有效返回数据，否则返回undefined
    return dataValidate(data?.expiryTime) ? cloneData(data.val) : undefined;
  }

  /**
   * 移除指定的数据
   */
  remove(name: keyName): boolean {
    // 删除
    const result = Reflect.deleteProperty(dataBase.root, name);
    if (result) {
      // 如果成功将删除后的对象重新写入到storage中去
      setStorage();
      return true;
    }
    return false;
  }

  /**
   * 清除所有的数据
   */
  clear(): boolean {
    // 清空root内容
    dataBase.root = {};
    // 重新写入缓存
    setStorage();
    return true;
  }

  /**
   * 监听storage的变化并通知订阅者
   * @param callback
   */
  listener(name: keyName, callback: listenCallback) {
    // 检查当前监听函数是否已经存在同名监听方法
    const hasCallback = Reflect.has(this.listenerCalls, name);
    if (hasCallback) {
      this.listenerCalls[name].push(callback);
    } else {
      this.listenerCalls[name] = [callback];
    }
  }
}

export default new StorageManage();
