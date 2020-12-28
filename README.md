## vue.js 3.0

- 源码组织方式的变化

  - 源码使用ts重写
  - 使用monorepo的方式组织源码结构， 把独立的模块提取到不同的包中。每个模块都可以单独发布、测试、使用。

  ```js
  compiler-xxx 与编译相关的包
  compiler-core 与平台无关的编译器
  compiler-dom  浏览器相关的编译器，依赖compiler-core
  compiler-sfc  用来编译单文件组件，依赖compiler-core和compiler-dom
  compiler-ssr  服务端渲染的编译器，依赖compiler-core
  reactivity 	  数据响应式系统，可以独立使用
  runtime-core  和平台无关的运行时
  runtime-dom	  针对浏览器的运行时， 处理原生dom的api、事件等。
  runtime-test  为测试编写的运行时，这个运行时渲染出来的dom树是一个js对象，这个js对象可以运行在所有的环境上，可以测试渲染是否正确。
  server-renderer  服务端渲染
  shared   公用的api
  size-check  私有的包，作用是tree-shaking之后检查包的大小
  template-explorer 浏览器中运行的实时编译组件，输出render函数。
  vue 	构建完整的vue 依赖于compiler 和 runtime。
  ```



- vue3.0的不同构建版本
  - vue3.0中不同构建版本和vue2.0类似，构建不同版本，可以在不同的场合下使用。但是vue3.0不再构建umd的方式，因为umd方式会有更多的冗余。
  - cjs (都包含编译器和运行时)
    - vue.cjs.js
    - vue.cjs.prod.js
  - global(可以直接用script标签引入, 在全局中增加vue对象)
    - vue.global.js
    - vue.global.prod.js
    - vue.runtime.global.js
    - vue.runtime.global.prod.js
  - browser ( 浏览器原生化的方式，esmodule的形式, 可以直接 script type="module"的方式去引入)
    - vue.esm-browser.js
    - vue.esm-browser.prod.js
    - vue.runtime.esm-browser.js
    - vue.runtime.esm-browser.prod.js
  - bundler (没有打包所有的代码，需要配合打包工具来使用)
    - vue.esm-bundler.js
    - vue.runtime.esm-bundler.js (使用脚手架默认导入的是这个版本)



- composition API

  - RFC(Request For Comments)
    - https://github.com/vuejs/rfcs   rfc的仓库
    - 官方提出的提案，根据社区的反馈和讨论最终确认
  - Composition API RFC
    - https://composition-api.vuejs.org  rfc的文档
  - 设计动机
    - Options API
      - 包含一个描述组件选项(data, methods, props等) 的对象来创建一个组件.
        - 我们可能看别人写的复杂代码很难看懂，同一个功能的代码会被拆分到不同的选项中。
      - options API 开发复杂组件，同一个功能逻辑的代码被拆分到不同的选项
      - 难以提取组件重用的逻辑，虽然有mixin可以让代码进行混入，但是mixin会出现命名冲突，数据来源不清晰等问题。
  - 90%以上的api兼容2.x
  - composition API解决vue2.x开发超大的组件使用options api不好拆分和重用的问题。
  - Composition API 是一组基于函数的API， 可以更灵活的组织组件的逻辑.

- 性能提升

  - 使用proxy重写了响应式的代码，对编译器做了优化，重写了虚拟dom。让渲染和更新的性能得到了大幅度的提升。服务端渲染的性能提升了两到三倍。
  - 响应式系统升级
    - vue2.x 中响应式系统的核心 defineProperty
    - vue3.0中使用proxy对象重写响应式系统
      - 性能比definePreperty要好
      - 可以监听动态新增的属性
      - 可以监听删除的属性
      - 可以监听数组的length和索引
  - 编译优化
    - vue2.x 中通过标记静态根节点，优化diff的过程. 但是还是要进行diff,  重新渲染的时候需要重新创建新的vnode，哪怕这个vnode什么也没有，diff的时候跳过静态节点， 对比剩下的每一个新旧vnode。
    - vue3.0 中标记和提升所有的静态根节点，diff的时候只需要对比动态节点内容， 不要diff静态节点了。大大提升了diff的性能能
      - Fragments （升级vetur插件， 不然vscode还是会报错）
        - 如果template模板中没有根节点，那么在编译之后最外层要创建一个_Fragments节点来维护这个组件模板(还是有根节点)
      - 静态节点提升 _hoisted
      - patch Flag
      - 缓存事件处理函数
  - 源码体积的优化
    - vue3.0 移除了一些不常用的api
      - 例如： inline-template、filter等
    - tree-shaking
      - 对tree-shakingde支持更友好。

- Vite

  - 构建工具
  - 使用vite不需要打包可以直接运行项目

  ```js
  浏览器使用esmodule的形式
  1. 现代浏览器都支持es Module （IE不支持）
  2. 通过下面的方式加载模块
  	<script type="module" src="..."></script>
  3. 支持模块的script默认延迟加载
  	3.1 类似于script标签设置defer
      3.2 在文档解析完成后， 触发DOMContentLoaded事件前执行
  ```

  vite的快就是使用浏览器支持esmodule的特性，避免开发环境下打包, 从而避免开发环境下打包。

  vite在开发模式下不需要打包就可以直接运行. 秒开页面。

  vite会开启一个测试的服务器，拦截浏览器发送的请求，浏览器会向浏览器发送请求获取相应的模块。将所有的模块给服务器进行处理，vite开启的服务器会对浏览器不识别的模块进行处理，比如import  .vue文件时， 会在服务器上对.vue文件进行编译，把编译后的结果返回给浏览器。

  - 快速冷启动
  - 按需编译
  - 模块热更新， 并且模块热更新的速度与模块总数无关。

  vite在生产环境下使用rollup打包

  - 基于esModule 的方式打包
  - vue-cli使用webpack打包

  vue-cli在开发模式下必须对项目打包才可以运行。

- vite创建项目

  1. vite创建基于vue3的项目

     ```html
     npm init vite-app <project-name>
     cd <project-name>
     npm install
     npm run dev
     ```

  2. 基于模板创建项目

     ```js
     npm init vite-app --template react
     npm init vite-app --template preact
     ```



### Composition API

> composition api 是vue3.0新增的api， 也可以使用options api。

setup是composition api的入口

为了让某一逻辑代码都能被封装到一个函数中， 这个函数就是steup函数， 在这个函数中提供了composition API， 这个函数可以调用生命周期等函数，可以进行有效的封装组件。这个时候我们就不能在以前options API中的生命周期钩子中操作setup内部的数据了(如果要封装组件的话)

setup返回的对象会将该对象的属性将会被合并到组件模板的渲染上下文， 也就是可以返回数据作为渲染模板的数据，也可以返回函数作为模板上的事件函数

```js
const count = ref(11)
return {
    count,
    handleClick: () => {
        count.value += 1
    }
}
```



在setup函数中可以使用 composition API提供的生命周期函数， 这些生命周期的钩子函数同options API的钩子函数一致.  

setup函数的调用时机

```js
创建组件实例，然后初始化 props ，紧接着就调用setup 函数。从生命周期钩子的视角来看，它会在 beforeCreate 钩子之前被调用
```

- 与 2.x 版本生命周期相对应的组合式 API

  > composition API 的生命周期函数是写在函数的参数中写一个参数，例如：onMounted(() => {  ...  })

  ``` js
  beforeCreate -> 使用 setup()
  created -> 使用 setup()
  beforeMount -> onBeforeMount
  mounted -> onMounted
  beforeUpdate -> onBeforeUpdate
  updated -> onUpdated
  beforeDestroy -> onBeforeUnmount
  destroyed -> onUnmounted
  errorCaptured -> onErrorCaptured
  composition API 新增了以下的钩子函数
  onRenderTracked  // 在render函数被重新调用时触发  在首次调用的时候触发
  onRenderTriggered // 在render函数被重新调用时触发  在首次调用的时候不会触发
  使用：onRenderTriggered(e) {
      debugger
      // 检查哪个依赖性导致组件重新渲染
  },
  ```

- 封装逻辑功能， 这个函数都可以被封装成一个模块。 

  ```js
  const handleMouseMove = () => {
      const position = reactive({
          x: 0,
          y: 0
      })
      const updatePage = e => {
          position.x = e.pageX
          position.y = e.pageY
      }
      onMounted(() => {
          window.addEventListener('mousemove', updatePage)
      })
      onUnmounted(() => {
          // console.log('onUnMounted');
          window.removeEventListener('mousemove', updatePage)
      })
      return position
  }
  ```



#### composition API之 reactive/toRefs/ref

reactive存在的问题： reactive是将数据进行代理，解构之后数据就不是响应式的了。当我们解构出的数据是基本类型数据的时候就相当于定义了变量去接收基本类型数据，相当于进行赋值操作(在内存中复制一份)。解构出的数据与代理对象无关，无法进行set触发更新的操作。可以用babeljs.io查看解构的降级处理，就是定义变量进行接收。

解决问题：toRefs(reactive(obj))，对一个响应式对象进行toRefs的话，那么这个对象中的所有数据都会变成响应式的。	

toRefs原理： toRefs要求传入的对象必须是一个代理对象。toRefs内部会创建一个新的对象，遍历传入的对象，将所有属性的值都转换为响应式对象，然后挂载到新的对象中，然后返回这个新的对象。

 toRefs 可以将 reactive() 创建出来的响应式对象中的每个属性节点都转化为响应式的

ref: 将一个基本类型数据转换为响应式数据， 而reactive是将一个引用数据类型数据转换为对象

ref的原理：基本类型数据存储的是值，不可能是响应式数据，如果ref传递的参数是对象的话，那么内部会调用reactive返回一个代理对象，如果传入的是基本类型数据的话，那么会创建一个只有value属性的对象，该对象的value属性具有get和set。所有可以将基本数据类型变成响应式对象。但是reactive返回的代理对象不可被解构，需要toRefs后才可以被解构.因为reactive的对象只有第一层是响应式的， 

```js
 const position = ref({
     x: 0,
     y: 0
 })
 内部会先创建value属性，将{x:0,y:0}赋值给value属性，然后对value:{x:0,y:0}进行响应式，但是x:0与y:0不是响应式的，所以还要对value的值进行响应式也就是toRefs(position.value)。
```



- 使用 toRefs 和 ref着两个函数返回的响应式数据都会有一个value属性，这个value在模板中是不用写的( 直接些x )，但是在代码中使用的话，要些x.value

#### composition API之 computed

作用： 简化模板中的代码，缓存计算后的结果。当依赖的数据变化的时候才会重新计算。

第一种用法：

- const plusOne = computed( () => count.value + 1 )  // 返回不可变的响应式对象，类似于ref(基本数据类型)

第二种用法:  返回不可变的响应式对象

```js
const count = ref(1)
const plusOne = computed({
    get: () => count.value + 1,
    set: val => {
        count.value = val - 1
    }
})
```

#### composition API之 watch

- watch的三个参数
  - 第一个参数：要监听的数据:    必须是代理对象，也可以是函数return 代理对象，还可以是数组。
  - 第二个参数：监听到数据变化后执行的函数，这个函数有两个参数分别是新值和旧值
  - 第三个参数：选项对象，deep和immediate
- watch的返回值
  - 取消监听的函数

```js
const question = ref('')
const answer = ref('')
watch(question, async (newValue, oldValue) => {
     const result = await fetch('https://www.yesno.wtf/api')
     const data = await result.json()
     answer.value = data.answer
})
```

#### composition API之 watchEffect

- 是watch 函数的简化版本， 也用来监测数据的变化
- 接收一个函数作为参数，监听函数内响应式数据的变化。
- 返回值是取消监听的函数
- 立即执行传入的一个函数，并响应式追踪其依赖，并在其依赖变更时重新运行该函数。

```js
const count = ref(11)
watchEffect(() => {
	console.log(count.value)
})
```







### ToDoList

- 自定义指令

  vue2和vue3自定义指令的差别就是自定义指令中钩子函数被重命名

  bind		  beforeMount

  inserted	mounted

  update	  updated

  componentUpdated	beforeUnmount

  unbind	unmounted

  





### vue3.0响应式系统原理

1. proxy 对象实现属性监听
2. 多层属性嵌套， 在访问属性过程中处理下一级属性
3. 默认监听动态添加的属性
4. 默认监听属性的删除操作
5. 默认监听数组索引和length属性
6. 可以作为单独的模块使用

核心方法

- reactive/ref/toRefs/computed
- effect   watch函数的底层函数
- track    收集依赖的函数
- trigger   触发更新的函数





### reflect的好处

1. 将object对象一些内部的方法，放到Reflect对象上, 现阶段这些方法存在于object和Reflect对象上，未来只存在于Reflect对象上

2. 操作对象时出现报错返回false

   ```js
   比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而Reflect.defineProperty(obj, name, desc)则会返回false。
   ```

3. 让操作对象的编程变为函数式编程

   ```js
   // 老写法
   'assign' in Object // true
   // 新写法
   Reflect.has(Object, 'assign') // true
   ```

4. `Reflect`对象的方法与`Proxy`对象的方法一一对应，只要是`Proxy`对象的方法，就能在`Reflect`对象上找到对应的方法。

proxy

- set 和 deleteProperty中需要返回布尔类型的值
  - 在严格模式下， 如果返回false的话会出现Type Error的异常



#### ref和reactive的区别

- ref可以把基本类型数据，转换成响应式对象
- ref返回的对象，重新赋值成对象也是响应式的
- reactive返回的对象，重新赋值丢失响应式
- reactive返回的对象不可以解构, ref可以解构





#### vite

- vite是一个面向现代浏览器的一个更轻、更快的web应用开发工具
  - webpack在devServer环境下冷启动过长，热更新反应速度慢的问题。
- 它基于ECMAScript标准原生模块系统 (ES Module)实现

- vite项目依赖

  - vite
  - @vue/compiler-sfc 编译.vue结尾的单文件组件

- vue2是vue-template-compiler, vite目前只支持3.0的版本

- 基础使用

  - vite serve
  - vite build

- vite启动开发服务器

  ```js
  vite 启动开发服务器
  在运行vite serve的时候，不需要打包，直接开启一个web服务器，当浏览器请求web服务器，例如请求一个单文件组件，服务端编译单文件组件， 编译的结果返回给浏览器，这里的编译是在服务器端，而且 模块的处理是在请求到服务端处理的。
  
  vue-cli 启动开发服务器
  vue-cli-service serve (npm run serve)
  首先使用webpack打包所有的模块，如果模块比较多，打包速度比较慢，将打包后的结果存储到内存中，然后再开启一个web服务器， 浏览器请求web服务器，将内存中打包后的结果返回给浏览器。webpack是将所有的模块提前编译打包进bundle里， 不管模块是否被执行，是否被使用到都会被打包到bundle里。随着项目的增大，打包的速度越来越慢，所以启动好服务器的速度也越来越慢。
  
  
  vite利用现代浏览器原生支持的esModule的特性，省略了对模块的打包，但是对于单文件组件，样式模块等，vite即时编译，只有在具体请求这个文件的时候，才会去编译这个文件。
  ```

- HMR

  - vite HMR
    - 立即编译当前所修改的文件
  - webpack HMR
    - 会自动以这个文件为入口重新build一次，所有的涉及到的依赖也会被重新加载一遍。

- Build

  - vite build
    - rollup
    - Dynamic import
      - polyfill (使用了polyfill完成动态导入)

- 打包 or 不打包

  - 使用webpack打包的两个原因
    - 浏览器环境并不支持模块化  （现代浏览器已经支持模块化）
    - 零散的模块文件会产生大量的http请求  （http2可以复用连接）

- 开箱即用

  - TypeScript - 内置支持
  - less/sass/stylus/postcss - 内置支持（需要单独安装编译器）
  - JSX
  - Web Assembly

- Vite特性

  - 快速冷启动
  - 模块热更新
  - 按需编译
  - 开箱即用



#### Vite功能

- 静态web服务器
- 编译单文件组件
  - 拦截浏览器不识别的模块，并处理
- HMR