/**
 * 节流
 *
 * @param {function} func 需要执行的方法
 * @param {number} wait 时间周期
 * @param {object} options 配置项
 * @param {boolean} options.leading 第一次调用函数时是否需要执行
 * @param {boolean} options.trailing 最后一次调用函数时是否需要执行
 */
type Timer = NodeJS.Timer | null;

export function throttle(
  func: (...args: any) => void,
  wait: number = 500,
  options: { leading?: boolean; trailing?: boolean } = {
    leading: false,
    trailing: true,
  }
): (...args: any) => void {
  // 如果第一次调用和最后一次调用都为false,可能会出现用户操作完全无响应的情况
  if (!options.leading && !options.trailing) {
    console.warn("options的leading属性和trailing属性，至少要有一个为true!");
    options.trailing = true;
  }
  // 缓存一个定时器，便于执行最后一次任务
  let timer: Timer;

  // 缓存上一次执行回调的时间
  let previous = 0;

  /**
   * 抛出的闭包函数，外部每次触发事件回调都会执行这个函数
   * @param  {...any} args 接受的参数，比如e.target.value
   */
  function throttled(...args: any) {
    // 记录当前时间
    let now = Date.now();
    let remaining;

    // 是否是第一次调用回调函数（previous只在首次调用时为0，其它时间应该都是上次执行时间）
    if (previous === 0) {
      previous = now;
      // 判断是否需要首次调用（这里与上面的第一次调用不是一个概念）
      // 不需要首次调用的，等待一个时间周期
      if (!options.leading) {
        remaining = wait;
      }
      // 首次调用的直接执行
      else {
        remaining = 0;
      }
    }
    // 不是第一次进入，直接拿上一次的时间与当前时间进行计算
    else {
      remaining = wait - (now - previous);
    }

    // 等待时间为0，表示需要立即调用函数
    if (remaining <= 0) {
      // 如果有定时器，表示有一个定时器在执行最后一次调用延时执行的方法，所以这里需要清除掉它
      if (timer) {
        // 停止计时器并手动清空防止内存泄漏
        clearTimeout(timer);
        timer = null;
      }

      // 设置 previous 为当前时间
      previous = now;
      // 执行 func 函数
      func.apply(null, args);
    }
    // 等待时间不为0的时候，我们需要先判断是否需要执行最后一次调用
    else if (options.trailing) {
      // 需要清除上一次的定时任务
      clearTimeout(Number(timer));
      /**
       * 最后一次调用执行的方法（只有options.trailing为true时才有效）
       * @param {*} context 当前上下文，表示this
       * @param {*} args    当前调用时传入的参数，比如e.target.value
       */
      timer = setTimeout(() => {
        // 因为这是尾调用，表示下一次再来调用可能需要较长一段时间了，
        // 应该算是一个新的调用过程，所以设定 previous = 0
        previous = 0;
        // 停止计时器并手动清空防止内存泄漏
        clearTimeout(Number(timer));
        timer = null;

        // 执行函数
        func.apply(null, args);
      }, remaining);
    }
    // 其它还在等待的状态则忽略
  }

  // 手动取消
  throttled.cancel = function () {
    clearTimeout(Number(timer));
    timer = null;
    previous = 0;
  };
  return throttled;
}
