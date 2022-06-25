# mkit-utils 测试版
业务中部分常用工具封装

### storageManage
```javascript
import {storageManage} from 'mkit-utils'
/**
 * set方法接受三个参数
 * 参数一：key 或者说是数据的名字
 * 参数二：value 需要存入的数据
 * 参数三：expiryTime 有效期，此项为可选项，如果不传则默认永久有效（3年）
 */
storageManage.set(key, value, expiryTime)

/**
 * get方法接受一个参数
 * 当未能在storage中寻找到匹配的数据或数据已经过期，返回undefined否则返回寻找到的数据
 */
storageManage.get(key)
storageManage.remove(key)
/**
 * 清空当前所有数据 
 */
storageManage.clean()
/**
 * 实时监听storage中数据的变化
 */
storageManage.listener(eventName, eventCallback)
```

### EasyMenu

菜单组件，用于将多层嵌套菜单数据渲染成类似antd中的菜单样式，该组件依赖antd，如需使用，项目中必须安装有antd

```javascript
<EasyMenu
  data={menus} // 嵌套数组格式的菜单数据 必传
  selected={menuSelect} // 菜单项被选中的回调方法 必传

  keyName="path" // 菜单项对应的页面路径 可选 默认为path
  childName="children" // 菜单项对应的子菜单列表名称 默认为children
  titleName="title" // 菜单项对应的标题名称 可选 默认为title
/>
```

### EasyBread

面包屑组件，自动根据当前的页面路径，自动从对应的菜单数据中匹配出对应的面包屑内容，该组件依赖antd，如需使用，项目中必须安装有antd

```javascript
<EasyBread
  data={menus} // 嵌套数组格式的菜单数据 必传
  selected={menuSelect} // 面包屑被点击的回调方法 必传

  keyName="path" // 菜单项对应的页面路径 可选 默认为path
  childName="children" // 菜单项对应的子菜单列表名称 默认为children
  titleName="title" // 菜单项对应的标题名称 可选 默认为title
/>
```

### EasyTag

标签组件，自动根据当前页面路径，在页面中显示tag标签并进行增加、删除等操作；该组件依赖antd，如需使用，项目中必须安装有antd

```javascript
<EasyTag
  data={menus} // 嵌套数组格式的菜单数据 必传
  onClick={tagClick} // 标签被点击的回调方法 必传
/>
```
