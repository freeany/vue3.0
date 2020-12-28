const isObject = val => val !== null && typeof val === 'object'
const convert = target => (isObject(target) ? reactive(target) : target) // 递归响应式数据
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive(target) {
  if (!isObject(target)) return target
  const handler = {
    // vue3.0 在获取时对数据进行响应式，而不像以前的无脑对data中的数据进行递归然后响应式这些数据
    get(target, key, receiver) {
      // get方法中收集依赖
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      // 如果获取到的对象是响应式的，那么需要递归将获取到的对象重新进行响应式的操作
      return convert(result)
    },
    set(target, key, value, receiver) {
      // 获取以前的value
      const oldVal = Reflect.get(target, key, receiver)
      let result = true
      if (oldVal !== value) {
        result = Reflect.set(target, key, value, receiver)

        // set方法中触发更新
        trigger(target, key)
      }
      return result // 返回的是给改属性设置值后该属性的值
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        // 触发更新
        trigger(target, key)
      }
      return result // 返回true/false
    }
  }

  return new Proxy(target, handler)
}

// effect
let activeEffect = null // 定义变量记录callback
export function effect(callback) {
  activeEffect = callback
  // 首先执行一次callback，
  callback() // 访问响应式对象属性，去收集依赖。在收集依赖的过程中要把callback存储起来
  // 所以要想办法让之后的track函数访问到这里的callback

  // 收集完毕
  activeEffect = null
}

// 收集依赖
let targetMap = new WeakMap() // 存放依赖的map集合
export function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 把目标对象target存储到map集合中
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // dep中存放的才是effect函数
  dep.add(activeEffect)
}

// 触发更新
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}

// ref函数
export function ref(raw) {
  // 判断raw是否是ref创建的对象， 如果是的话直接返回
  if (isObject(raw) && raw.__v_isRef) return

  let value = convert(raw)
  const r = {
    __v_isRef: true,
    get value() {
      track(r, 'value')
      return value
    },
    set value(newValue) {
      if (newValue !== value) {
        raw = newValue
        value = convert(raw)
        trigger(r, 'value')
      }
    }
  }
  return r
}

// computed函数
export function computed(getter) {
  const result = ref()
  effect(() => (result.value = getter()))
  return result
}
