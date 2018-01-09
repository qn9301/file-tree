# file-tree

### 原先项目中使用了jquery-ztree作为树形下拉组件，后来因为touch问题和皮肤问题，故自己写了一个，一来可以使用公司ui出的皮肤，二来可以根据数据需求定制逻辑。

## log
- 调整返回的节点，注入数据，方便拿取

- 当数据量过大后，导致页面变卡，改写为按需加载dom，提升页面性能

## image
![image](https://github.com/qn9301/file-tree/blob/master/img/asset.png?raw=true)

## example
```
datas => {
    'name1': {
        values: 
        data: {
            'name11': {
                values: 
                data: {...}
            }
        }
    },
    'name2': {
        values: 
        data: {
            'name21': {
                values: 
                data: {...}
            }
        }
    }
 }
 options => {
    indent: 10, // 缩进
    indentUnit: 'px', // 缩进单位
    checkable: true, // 是否可选
    checkval: 'id', // 
    showfile: true, //开启则去判断isfile
     event: {
        click: function (node, state, e){}, // 点击时触发回调
        dblclick: function (node, state, e){} // 
     }
 }
```
- 自动排序
```
options: {
    el: '#rz-book-tree',
    showfile: false,
    autosort: true,
    title: 'name',
    filekey: '',
    filevalue: 1,
    sortconfig: {
        idKey: 'id',
        pidKey: 'pId',
        rootId: 0
    }
}
```
- 示例
```
var file_data = data// 数据
var my_tree = new tree({
        options: {
            el: '#tree',
            showfile: true,
            autosort: true,
            title: 'dirname',
            sortconfig:{
                idKey: 'id',
                pidKey: 'parentdir',
                rootId: 0
            },
            event: {
                    click: function (node, state, e){
                        // 业务逻辑
                    },
                    dblclick: function(node, state, e){
                        // 业务逻辑
                    }
            }
        },
        datas: file_data
    })

```
## document
- `var my_tree = new tree(config)` ***config参数说明***

key | des | default
---|---|---
datas | 传入tree的数据 | 不能为空
options | 传入的配置文件 |

- `config.option` ***option说明***

key | des | default
---|---|---
autosort | 是否需要代码进行自动排序 | false
sortconfig | 排序需要定义的关键字 |
indent | 缩进 | 10
indentUnit | 缩进的单位，可以适用于rem，按项目需求来 | px
checkable | 是否显示checkbox | false
checkval | 选中的checkbox的值 | false
showfile | 是否显示文件的样式 【true时回去判断datas中filekey的字段】 | false
filekey | 声明是文件的键名，可以根据业务需求自定义 | isFile
filevalue | 当filekey的值与filevalue的值相同时，则判断为文件，而非文件夹 | 2
event | 事件列表 | false

- `config.option.sortconfig` ***sortconfig说明***

key | des | default
---|---|---
idKey | 当前节点的id键名 | id
pidKey | 父节点的pid键名 | pid
rootId | 根节点的值 | 0

- `config.option.event` ***event说明***

key | des | default
---|---|---
click | 单机事件 | 
dblclick | 双击事件，可以自己用jq写一个doubleTap的移动端双击事件，以兼容移动端 |

- ***返回值`my_tree`说明***

### 方法
- `node getCheckedObj()` 得到当前选中的节点 
- `array getAllSelectVal()` 得到复选框勾选中的所有val

### event回调参数说明
- `node` 点击的节点对象
- `state` 节点状态 true open，false close
- `e` event对象

### node对象方法说明
- `append` 正序插入节点
- `insert` 倒叙插入节点
- `replace` 替换所有子节点
- `open` 打开当前节点
- `close` 关闭节点
- `toggle` 打开关闭子节点

## PS
#### 现在的代码可能存在内存泄露的问题，目前没时间优化，等下次再看，找到bug的童鞋欢迎issue，喜欢的同学请star一下。