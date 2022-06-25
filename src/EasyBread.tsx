import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Breadcrumb } from "antd";
import { createFromIconfontCN } from "@ant-design/icons";

import recursive from "./recursive";
import { MenuItem } from "./EasyMenu";

interface IProps {
  data: MenuItem[]; // 菜单数组
  selected?: (path: {}) => void; // 被选中的处理方法
  keyName?: string; // 路径名称
  childName?: string; // 子节点数组名称
  titleName?: string; // 菜单项名称
  iconUrl?: string; // icon 必须使用
}

export default function EasyBread({
  data,
  // selected = () => {},
  keyName = "path",
  titleName = "title",
  iconUrl = "//at.alicdn.com/t/font_2812195_yxm743wrn.js",
}: IProps) {
  const [breads, setBreads] = useState<MenuItem[]>([]);
  const { pathname } = useLocation();

  /**
   * 生成icon
   */
  const EasyIcon = useMemo(() => {
    return createFromIconfontCN({
      scriptUrl: iconUrl,
    });
  }, []);

  useEffect(() => {
    const breads = recursive(data, pathname);
    setBreads(breads);
  }, [data, pathname]);

  return (
    <Breadcrumb className="easy-bread">
      {breads.map((item, index) => (
        <Breadcrumb.Item className="easy-bread-item" key={item[keyName]}>
          {index === 0 && item.icon && <EasyIcon type={`icon-${item.icon}`} />}
          <span>{item[titleName]}</span>
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}
