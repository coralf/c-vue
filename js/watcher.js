class Watcher {

    /**
     * 
     * @param {*} vm  CVue实例
     * @param {*} key 
     * @param {*} cb //
     */
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        Dep.target = this;
        this.vm[this.key];//触发getter
        Dep.target = null;
    }

    update() {
        this.cb.call(this.vm, this.vm[this.key]);
    }
}