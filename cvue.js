class CVue {

    //构造函数传参
    /**
     * 
     * el:"#app",
            data:{
                name:'coral',
                age:2,
                html:"<button>按钮</button>",
            },
            created(){
                console.log('created 函数执行');
                setTimeout(()=>{
                    this.name='我是被修改过后的 coral';
                },2000);
            },
            methods:{
                updateName(){
                    this.name='点击事件被触发了';
                    this.age=18;
                }
            }
     * 
     * */
    constructor(options) {
        this.$options = options;
        this.$data = options.data;
        this.observe(this.$data);

        const compile = new Compile(this.$options.el, this);
        //编译
        compile.compiled();

        //调用created方法
        if (options.created) {
            this.$options.created.call(this);
        }
    }

    defineReactive(obj, key, val) {
        this.observe(val);//递归解决数据嵌套
        const dep = new Dep();
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target);//
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();//通知更新
            }
        });
    }

    observe(value) {

        if (!value || typeof value !== 'object') {
            return;
        }
        //遍历data数据
        /**
         * data:{
                name:'coral',
                age:2,
                html:"<button>按钮</button>",
            },
         */
        Object.keys(value).forEach(key => {
            //定义响应式
            this.defineReactive(value, key, value[key]);
            //将data的属性代理到cvue实例中
            /**
             * 相当于this可以直接this.xxx调用data.xxx里面的属性
             */
            this.proxyData(key);
        });
    }



    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key];
            },
            set(newVal) {
                this.$data[key] = newVal;
            }
        });
    }
}