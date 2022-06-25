import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Tag } from "antd";
import recursive from "./recursive";
import { MenuItem } from "./EasyMenu";

interface ITag extends MenuItem {
  action?: boolean;
}

interface IProps {
  data: MenuItem[]; // 菜单数组
  selected: (item: ITag) => void;
}

export default function EasyTag({ data, selected }: IProps) {
  const [tags, setTags] = useState<ITag[]>([]);
  const { pathname } = useLocation();

  const addTags = useCallback((tags, pathname) => {
    // 获取当前的tag
    const currTag: ITag = recursive(data, pathname).reverse()[0];

    // 列表是否存在当前页面
    return tags.some((tag: ITag) => tag.path === currTag.path)
      ? // 调用changeTag方法
        changeAction(tags, currTag)
      : // 将当前页面的tag加入列表并设定高亮
        setTags([
          // 清除所有选中
          ...tags.map((tag: ITag) => {
            tag.action = false;
            return tag;
          }),
          // 加入当前tag
          { ...currTag, action: true },
        ]);
  }, []);

  /**
   * 每次pathname发生变化时这里都会执行，可以将这理解为新增
   */
  useEffect(() => {
    if (!data.length) {
      return;
    }
    addTags(tags, pathname);
  }, [data, pathname]);

  const changeAction = useCallback((tags, actionTag: ITag) => {
    const newTags = [...tags].map((tag: ITag) => {
      return { ...tag, action: tag.path === actionTag.path };
    });
    setTags(newTags);
  }, []);

  const tagClase = useCallback((tags, closeTag: ITag) => {
    // 复制当前tags数组
    const newTags = [...tags];
    // 定位当前tag对应的下标
    const currIndex = tags.findIndex((item) => item.path === closeTag.path);
    // 从tags数组中移除
    newTags.splice(currIndex, 1);
    // 判断是否激活中
    if (closeTag.action) {
      if (currIndex > 0) {
        newTags[currIndex - 1].action = true;
        selected(newTags[currIndex - 1]);
      } else {
        newTags[currIndex].action = true;
        selected(newTags[currIndex]);
      }
    }
    setTags(newTags);
  }, []);

  return (
    <div className="easy-tag">
      {tags.map((item) => (
        <Tag
          className={`tag-item${item.action ? " action" : ""}`}
          key={item.path}
          onClick={() => {
            changeAction(tags, item);
            selected(item);
          }}
          closable={tags.length > 1 ? true : false}
          onClose={(e) => {
            // antd会自动删除当前的标签项，我们可以屏掉这个操作
            e.preventDefault();
            tagClase(tags, item);
          }}
        >
          {item.title}
        </Tag>
      ))}
    </div>
  );
}
