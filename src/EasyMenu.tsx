import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Menu, MenuTheme } from "antd";
import { createFromIconfontCN } from "@ant-design/icons";

import recursive from "./recursive";

type MenuMode = "horizontal" | "vertical" | "inline";
export interface MenuItem {
  [key: string]: any;
}

interface IProps {
  // 看看这个
  data: MenuItem[]; // 菜单数组
  selected: (path: {}) => void; // 被选中的处理方法
  keyName?: string; // 路径名称
  childName?: string; // 子节点数组名称
  titleName?: string; // 菜单项名称
  theme?: MenuTheme; // 主题颜色 参考antd
  mode?: MenuMode;
  iconUrl?: string; // icon 必须使用
}

/**
 * 简易菜单渲染
 * @param {IProps} props
 * @param {MenuItem[]} props.data 菜单数组 必传
 * @param {string} props.selected 选中后的处理方法 必传
 * @param {string} props.keyName 菜单项的路径名称 可选，默认为path
 * @param {string} props.childName 子菜单名称 可选，默认为children
 * @param {string} props.titleName 菜单项显示文案名称 可选，默认为title
 * @param {string} props.iconUrl icon地址，必须为iconfont生成的地址，不接受其它类型的参数
 * @returns
 */
export default function EasyMenu({
  data,
  selected,
  keyName = "path",
  childName = "children",
  titleName = "title",
  theme = "dark",
  mode = "inline",
  iconUrl = "//at.alicdn.com/t/font_2812195_yxm743wrn.js",
}: IProps) {
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { pathname } = useLocation();

  /**
   * 生成icon
   */
  const EasyIcon = useMemo(() => {
    return createFromIconfontCN({
      scriptUrl: iconUrl,
    });
  }, []);

  /**
   * 菜单初始化
   */
  useEffect(() => {
    const actions = recursive(data, pathname);
    const selectedKeys = actions.map((item) => item.path);
    setSelectKeys(selectedKeys);
    setOpenKeys(selectedKeys);
  }, [data]);

  /**
   * 展开项改变
   * @param openKeys
   */
  const openChange = useCallback((openKeys) => {
    setOpenKeys(openKeys);
  }, []);

  /**
   * 选中项改变
   */
  const selectChange = useCallback(({ item, key, keyPath, selectedKeys, domEvent }) => {
    setSelectKeys(selectedKeys);
    selected({ item, key, keyPath, selectedKeys, domEvent });
  }, []);

  /**
   * 递归渲染菜单项
   */
  const renderMenus = useCallback((data: MenuItem[]) => {
    return data.map(
      // 判断当前菜单项下面是否有子项， 如果有使用SubMenu来渲染
      (item) =>
        item[childName] && item[childName].length ? (
          <Menu.SubMenu
            className="easy-menu-sub"
            key={item[keyName]}
            icon={item.icon && <EasyIcon type={`icon-${item.icon}`} />}
            title={item[titleName]}
          >
            {/* 它的逻辑实现与父级的逻辑实现基本一致，除了被遍历的成员名称发生变化 */}
            {renderMenus(item[childName])}
          </Menu.SubMenu>
        ) : (
          // 如果没有使用Menu.Item来渲染
          <Menu.Item
            className="easy-menu-item"
            key={item[keyName]}
            icon={item.icon && <EasyIcon type={`icon-${item.icon}`} />}
          >
            {item[titleName]}
          </Menu.Item>
        )
    );
  }, []);

  return (
    <Menu
      className="easy-menu"
      theme={theme}
      mode={mode}
      selectedKeys={selectKeys}
      openKeys={openKeys}
      onOpenChange={openChange}
      onSelect={selectChange}
    >
      {renderMenus(data)}
    </Menu>
  );
}
