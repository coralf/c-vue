class Compile {

    constructor(el, vm) {
        this.$el = document.querySelector(el);
        this.$vm = vm;
    }

    compiled() {
        //编译
        if (!this.$el) {
            return;
        }
        //将node节点转换成片段
        this.$fragment = this.nodeToFragment(this.$el);
        //编译
        this.compile(this.$fragment);
        //将编译完成后的html追加到this.$el
        this.$el.appendChild(this.$fragment);
    }

    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
           
            if (this.isElement(node)) {//如果是元素节点
                const attributes = node.attributes;
                Array.from(attributes).forEach(attr => {
                    console.log(attr);
                    const attrName = attr.name;
                    const exp = attr.value;
                    //如果是k-指令
                    if (this.isDrective(attrName)) {
                        const dir = attrName.substring(2);
                        console.log('dir',dir);
                        
                        this[dir] && this[dir](node, this.$vm, exp);
                    }
                    if (this.isEvent(attrName)) {
                        const dir = attrName.substring(1);
                        this.eventHandler(node, this.$vm, exp, dir);
                    }
                });

            } else if (this.isInterpolation(node)) {//如果是文本节点
                this.compileText(node);
            }

            //如果没遍历完递归遍历
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }

        });
    }

    nodeToFragment(el) {
        const frag = document.createDocumentFragment();
        //将el的元素转移到frag中
        let child = null;
        while (child = el.firstChild) {
            frag.appendChild(child);
        }
        return frag;
    }

    eventHandler(node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp];
        if (dir && fn) {
            node.addEventListener(dir, fn.bind(vm));
        }

    }

    compileText(node) {
        this.update(node, this.$vm, RegExp.$1, 'text');
    }
    update(node, vm, exp, dir) {

        const updateFn = this[dir + 'Updater']
        updateFn && updateFn(node, vm[exp]);
        new Watcher(vm, exp, function (value) {

            updateFn && updateFn(node, value);

        });

    }

    isElement(node) {
        return node.nodeType == 1;
    }

    isDrective(attrName) {
        return attrName.indexOf('c-') == 0;
    }

    isEvent(attrName) {
        return attrName.indexOf('@') == 0;
    }

    test(node, vm, exp) {
        this.update(node, vm, exp, "text");
    }

    //   双绑
    model(node, vm, exp) {
        // 指定input的value属性
        this.update(node, vm, exp, "model");

        // 视图对模型响应
        node.addEventListener("input", e => {
            vm[exp] = e.target.value;
        });
    }

    modelUpdater(node, value) {

        node.value = value;
    }

    html(node, vm, exp) {
        
        this.update(node, vm, exp, "html");
    }

    htmlUpdater(node, value) {
        node.innerHTML = value;
    }

    textUpdater(node, value) {
        node.textContent = value;
        console.log('node',node.textContent);
        
    }
    // 插值文本
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
}