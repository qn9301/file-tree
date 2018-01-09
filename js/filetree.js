/**
 * @author zhengyifan
 * 传入配置文件 {options: '', datas: ''}
 * datas => {
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

    // 对传入的数据进行层级排序
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
 *  支持ajax动态加载
 *  2018/1/9 
 *      添加了部分注释，方便自己和他人维护
 *      增加dom懒渲染，在数据量大的时候，提升页面速度
 */    
(function (global, factory){
    if (typeof global.document == "undefined"){
        console.error("请在window下使用该插件");
    }else if (typeof global.$ == "undefined" ||
              typeof global.jQuery == "undefined"){
        console.error("该插件依赖jquery");
    }else{
        global.tree = factory;
    }
}(window, function (config){
    var data = config.datas;
    var checked_node = null;
    // 初始化参数
    var defaultIndent = config.options.indent ? config.options.indent : 10 ;
    var defaultCheckable = config.options.checkable ? config.options.checkable : false ;
    var defaultShowfile = config.options.showfile ? config.options.showfile : false ;
    var defaultCheckval = config.options.checkval ? config.options.checkval : false ;
    var defaultIndentUnit = config.options.indentUnit ? config.options.indentUnit : 'px' ;
    var ajaxload = config.options.ajaxload ? config.options.ajaxload : false ;
    var event = config.options.event ? config.options.event : false ;
    var title = config.options.title ? config.options.title : 'title';
    var filekey = config.options.filekey ? config.options.filekey : 'isFile';
    var filevalue = typeof config.options.filevalue !== 'undefined' ? config.options.filevalue : 2;
    var Util = {}

    /**
     * 递归排序整个树
     */
    Util.sort = function (pid, pidk, idk, data){
        var return_arr = [];
        for (var i=0; i<data.length;i++){
            if (data[i][pidk] == pid){
                var new_data = data[i];
                new_data['data'] = this.sort(data[i][idk], pidk, idk, data);
                return_arr.push(new_data)
            }
        }
        return return_arr;
    }

    /**
     * 自动排序
     */
    if (config.options.autosort === true)
    {
        var sortconfig = {
                    idKey: 'id',
                    pidKey: 'pId',
                    rootId: 0
                }
        if (typeof config.options.sortconfig !== 'undefined'){
            sortconfig.idKey = config.options.sortconfig.idKey ? config.options.sortconfig.idKey : 'id';
            sortconfig.pidKey = config.options.sortconfig.pidKey ? config.options.sortconfig.pidKey : 'pId';
            sortconfig.rootId = typeof config.options.sortconfig.rootId != 'undefined' ? config.options.sortconfig.rootId : 0;
        }
        data = Util.sort(sortconfig.rootId, sortconfig.pidKey, sortconfig.idKey, data);
    }
    if (typeof data !== 'object')
    {
        throw new Error('缺少数据！');
    }

    // 获取容器节点
    var pobj = $(config.options.el);
    if (pobj.length != 1)
    {
        throw new Error('请指定一个唯一的节点！');
    }

    // 设置无法被选中
    pobj[0].onselectstart = function (){return false}

    /**
     * COMPLETE 2018/1/9 数据量大的时候，页面渲染dom太多，导致界面变卡，解决：使用懒渲染的方式，按需渲染
     * 插入节点，
     * @param el       需要插入data的容器节点
     * @param deep     深度
     * @param datas 后续要插入的数据
     * @param pobj    父节点
     * @param type     -1节点懒加载 0插到最后 1插到前面 2整个替换
     */
    Util.appendNode = function (el, deep, datas, pobj, type){
        type = type ? parseInt(type) : 0;
        var func = null;
        if (type === 2)
        {
            el[0].innerHTML = ''
            el = $(el[0]);
        } 
        for (var i=0;i<datas.length;i++){
            var data_options = Util.createDomData(datas[i]);
            if (defaultShowfile && datas[i][filekey] == filevalue){
                var html = '';
                html += "<div class='tree-close tree-clearfix'>"
                html += "    <div class='tree-head tree-clearfix' "+data_options+">"
                html += "        <div class='tree-block'></div>"
                if (defaultCheckable){
                    var val = defaultCheckval ? datas[i][defaultCheckval] : datas[i][title];
                html += "        <div class='tree-checkbox'><input type='checkbox' value='"+val+"' /></div>"
                }
                html += "        <div class='tree-file'></div>"
                html += "        <div class='tree-title'>"+datas[i][title]+"</div>"
                html += "    </div>"
                html += "    <div class='tree-body'>"
                html += "    </div>"
                html += "</div>"
            }else{
                var html = '';
                html += "<div class='tree-close tree-clearfix'>"
                html += "    <div class='tree-head tree-clearfix' "+data_options+">"
                html += "        <div class='tree-icon'></div>"
                if (defaultCheckable){
                    var val = defaultCheckval ? datas[i][defaultCheckval] : datas[i][title];
                html += "        <div class='tree-checkbox'><input type='checkbox' value='"+val+"' /></div>"
                }
                html += "        <div class='tree-dir'></div>"
                html += "        <div class='tree-title'>"+datas[i][title]+"</div>"
                html += "    </div>"
                html += "    <div class='tree-body'>"
                html += "    </div>"
                html += "</div>"
            }
            var node = $(html);
            var obj = Util.node2obj(node, deep, pobj, datas[i]);
            if (type === 1)
            {
                node.prependTo(el);
            }
            else if(type === 0)
            {
                node.appendTo(el);
            }
            else if (type === -1)
            {
                node.appendTo(el);
                func = (function (i, that, node){
                            var has_append = false;
                            return function (){
                                if (has_append)
                                    return;
                                has_append = true;
                                if (typeof datas[i].data != 'undefined' && datas[i].data.length > 0){
                                    that.appendNode(node.find('.tree-body'), deep+1, datas[i].data, obj, type);
                                }
                            }
                        })(i, this, node);
            }
            (function (node, obj, that){
                that.createToggle(node.find('.tree-icon'), obj, node, func);
                var _node = node.find('.tree-title')
                    .add(node.find('.tree-file'))
                    .add(node.find('.tree-dir'));
                _node.click(function (e){
                    Util.changeCheckState($(this).parent().parent(), obj);
                    if (false !== event)
                    {
                        if (typeof event.click !== 'undefined')
                        {    
                            event.click(obj, node.hasClass('tree-open'), e)
                        }
                    }
                })
                if (typeof _node.doubleTap !== 'undefined'){
                    _node.doubleTap(function(e) {
                        Util.changeCheckState($(this).parent().parent(), obj);
                        if (false !== event)
                        {
                            if (typeof event.dblclick !== 'undefined')
                            {
                                event.dblclick(obj, node.hasClass('tree-open'), e)
                            }
                        }
                    });
                }else{
                    _node.dblclick(function(e) {
                        Util.changeCheckState($(this).parent().parent(), obj);
                        if (false !== event)
                        {
                            if (typeof event.dblclick !== 'undefined')
                            {
                                event.dblclick(obj, node.hasClass('tree-open'), e)
                            }
                        }
                    });
                }
            })(node, obj, this);

            node.find('.tree-body').css('marginLeft', defaultIndent + defaultIndentUnit);
            if (typeof datas[i].data != 'undefined' && datas[i].data.length > 0 && type != -1){
                this.appendNode(node.find('.tree-body'), deep+1, datas[i].data, obj, type);
            }
        }
    }
    
    /**
     * TODO 要序列化数据插入，防止 ' " 对dom节点造成影响
     * 为每个节点生成数据，方便获取
     */
    Util.createDomData = function (data){
        var str = '';
        for (var i in data){
            if (typeof data[i] != 'object'){
                str += ' data-' + i +'="'+data[i]+'" '
            }
        }
        return str;
    }

    /**
     * 标注被选中的节点，添加固定class
     */
    Util.changeCheckState = function (pp, obj){
        checked_node = obj
        pobj.find('.tree-clearfix').removeClass('tree-ckecked');
        pp.addClass('tree-ckecked');
    }

    /**
     * 为节点添加点击打开关闭的事件
     */ 
    Util.createToggle = function (el, obj, node, func){
        el.click(function (e){
            // 懒渲染
            func && func();
            var p = $(this).parent();
            var pp = p.parent();
            // Util.changeCheckState(pp, obj);
            if (pp.hasClass('tree-close')){
                pp.removeClass('tree-close').addClass('tree-open')
            }else{
                pp.removeClass('tree-open').addClass('tree-close')
            }
            // if (false !== event)
            // {
            //     if (typeof event.click !== 'undefined')
            //     {    
            //         event.click(obj, pp.hasClass('tree-open'), e)
            //     }
            // }
        });
    }

    /**
     *     将节点转化为对象的方式
     *    node     dom节点
     *    deep     节点所在深度
     *    parent     父节点所在的对象
     *  o         缓存到内存的数据，直接复制到节点对象中
     */
    Util.node2obj = function (node, deep, parent, o){
        var obj = {
            node: node,
            parent: parent, 
            deep: deep,
            // 正序插入节点
            append: function (data){
                Util.appendNode(this.node.find('.tree-body').eq(0), this.deep+1, data, this);
            },
            // 倒叙插入节点
            insert: function (data){
                Util.appendNode(this.node.find('.tree-body').eq(0), this.deep+1, data, this, 1);
            },
            // 替换所有子节点
            replace: function (data){
                Util.appendNode(this.node.find('.tree-body').eq(0), this.deep+1, data, this, 2);
            },
            // 打开子节点
            open: function (){
                this.node.removeClass('tree-close').addClass('tree-open')
            },
            // 关闭子节点
            close: function (){
                this.node.removeClass('tree-open').addClass('tree-close')
            },
            // 打开关闭子节点
            toggle: function (){
                if (this.node.hasClass('tree-open')){
                    this.node.removeClass('tree-open').addClass('tree-close')
                }else{
                    this.node.removeClass('tree-close').addClass('tree-open')
                }
            }
        };
        for (var i in o)
        {
            if (typeof obj.i != 'undefined')
            {
                obj['_' + i] = o[i];
            }
            else
            {
                obj[i] = o[i];
            }
        }
        return obj;
    }

    /**
     * 开始插入第一个节点
     */
    Util.appendNode(pobj, 1, data, undefined, -1);

    return {
        // 得到当前选中的节点
        getCheckedObj: function (){return checked_node},
        // 得到复选框勾选中的所有val，返回array
        getAllSelectVal: function (){
            var arr = [];
            pobj.find('input:checked').each(function (){
                arr.push($(this).val());
            })
            return arr;
        }
    }
}));
