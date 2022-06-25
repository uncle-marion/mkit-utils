import { MenuItem } from "./EasyMenu";
function recursive(data: MenuItem[], pathname: string) {
  const actions: MenuItem[] = [];
  for (const item of data) {
    // 判断当前的路径与菜单项是否匹配，如果匹配就返当前的菜单项
    if (item.path === pathname) {
      return [item];
    }
    // 有子元素
    if (item.children && item.children.length) {
      const menu = recursive(item.children, pathname);
      // 返回有节点存在
      if (menu && menu.length) {
        actions.push(item, ...menu);
        // 要记得结束当前层级的遍历，这是一个有效减少资源占用的关键
        continue;
      }
    }
  }
  return actions;
}

export default recursive;
