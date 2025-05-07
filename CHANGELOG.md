# Changelog

## [0.2.0](https://github.com/MEMLTS/HackerKit/compare/v0.1.0...v0.2.0) (2025-05-07)


### ✨ 新功能

* **build:** 添加 ARM 架构支持并优化构建流程 ([02540f0](https://github.com/MEMLTS/HackerKit/commit/02540f04538e9b4120423968cd176cfdc16a95a9))
* **components:** 跑路吧 ([83861ac](https://github.com/MEMLTS/HackerKit/commit/83861ac1bea03911557f79c6988915cdeab54464))
* **devtools:** 添加打开开发者工具的功能 ([7a6d616](https://github.com/MEMLTS/HackerKit/commit/7a6d6169ad2a3d541b093526b60c678e22186442))
* **gen:** 添加 Android 项目模板 ([259ad56](https://github.com/MEMLTS/HackerKit/commit/259ad561e0ef6b97e0d8c4d51d11f921c76e9332))
* **network:** 添加 WebSocket 工具并优化 WHOIS 查询功能 ([af7eb92](https://github.com/MEMLTS/HackerKit/commit/af7eb92841e5033405bf2112f7312a036a54245a))
* **theme:** 实现暗黑主题并优化样式 ([bbece5a](https://github.com/MEMLTS/HackerKit/commit/bbece5a504b605dd705f400979bc7cc85e3b71c7))
* **toolbox:** 优化工具页面样式和功能 ([3b575e2](https://github.com/MEMLTS/HackerKit/commit/3b575e2eaf6548f691976842ad8cdb87b00a9a9d))
* **toolbox:** 新增文本对比和 Gzip 解压功能 ([028781e](https://github.com/MEMLTS/HackerKit/commit/028781e55a5548915516b29e33e29221349773de))
* **toolbox:** 添加 JWT 解析器工具 ([18d79d5](https://github.com/MEMLTS/HackerKit/commit/18d79d55b8cbee6639386ebc641acbff26567e28))
* **whois:** 更新版本号并优化查询结果展示 ([e17d7ff](https://github.com/MEMLTS/HackerKit/commit/e17d7ff0ec12a804c14c05d0c429a2ae79806dac))
* 添加Protobuf工具支持 ([f666c67](https://github.com/MEMLTS/HackerKit/commit/f666c67c7450964ea61d58362b589ce94caa3f25))


### 🐛 错误修复

* **components:** 优化 WebSocket 连接错误处理 ([7cccaf5](https://github.com/MEMLTS/HackerKit/commit/7cccaf5f297549e490b53294ebc7498fff18f5df))
* 修改文件名大小写 ([b9b6996](https://github.com/MEMLTS/HackerKit/commit/b9b6996c30aac1ab90d2d167099d1d2501e88dda))


### 🎨 代码样式

* **components:** 调整窗口大小和样式 ([36c800a](https://github.com/MEMLTS/HackerKit/commit/36c800aa1f5497873571e364dcc3ca00c2d2eaf0))


### ♻️ 代码重构

* **app:** 更新版本号并优化用户界面 ([cc13cf8](https://github.com/MEMLTS/HackerKit/commit/cc13cf87742cb1c5c421009db34531ba4a128b4a))
* **components:** 更新 Protobuf 组件标题 ([301cb3a](https://github.com/MEMLTS/HackerKit/commit/301cb3a97d60d8ca03d844edb5572a274106eebb))
* **components:** 重构组件并移除 CustomModal ([2957479](https://github.com/MEMLTS/HackerKit/commit/295747970d3f7c093aa1179a84a6f5934f7df8fe))
* **jwt:** 优化 JWT 组件布局和代码结构 ([2514bcf](https://github.com/MEMLTS/HackerKit/commit/2514bcf8f6e366c9989438252e5d73880c1e2a7e))
* **Protobuf:** 重构 Protobuf 编码功能 ([a20c510](https://github.com/MEMLTS/HackerKit/commit/a20c510329a4c308cec23162f9410a802f9ac9e6))
* 移除开发者工具相关代码 ([0b1fd37](https://github.com/MEMLTS/HackerKit/commit/0b1fd37f5ba15ef1fce54654190ba74ca2dcbfdc))


### 📦️ 构建系统

* **ci:** 优化 Android 构建流程 ([3319068](https://github.com/MEMLTS/HackerKit/commit/33190680363da0d6bcbf16b7e30eaee7a04dabd4))
* **ci:** 更新 release-please 配置和工作流 ([08990e7](https://github.com/MEMLTS/HackerKit/commit/08990e78a6542cddfbe9290c1371463845b8e849))
* 更新应用版本号 ([b8f83b4](https://github.com/MEMLTS/HackerKit/commit/b8f83b498b0cf5865c64ce88fb02557160284bd8))
* 更新版本号并修复发布工作流 ([94793b1](https://github.com/MEMLTS/HackerKit/commit/94793b1950c2b619da479eebc0678a0f7dac942c))
* 移除 Android 构建相关文件 ([743dc1a](https://github.com/MEMLTS/HackerKit/commit/743dc1a33aeb399daef311c400a483b6e7f05d25))


### 🎡 持续集成

* **android:** 优化 Android 构建流程 ([a9e647f](https://github.com/MEMLTS/HackerKit/commit/a9e647f11d1bbf7d3ef711429556c3079d3226ab))
* **github:** 更新 release 作业权限 ([8822aaf](https://github.com/MEMLTS/HackerKit/commit/8822aaf5d75a47aea73e6a653017b5a0ec7ed68e))
* 安装 pnpm 作为构建依赖项 ([0aaa88b](https://github.com/MEMLTS/HackerKit/commit/0aaa88b9fa0451095d9926f96588ed3eeb38ea42))
* 更新 Android CI 配置 ([1722328](https://github.com/MEMLTS/HackerKit/commit/1722328f183a231470cc24fd00d9f78686e66cd8))
* 更新 Android 构建工作流 ([12b8a72](https://github.com/MEMLTS/HackerKit/commit/12b8a7227e2a501e1970ed0cfa1a9b863b9927c9))
* 更新 GitHub Actions 工作流以发布到 release 分支 ([03e88f2](https://github.com/MEMLTS/HackerKit/commit/03e88f2a9795b501e9515678722ed921140f1078))
* 更新 GitHub Actions 工作流以支持发布到 GitHub Release ([7714c7b](https://github.com/MEMLTS/HackerKit/commit/7714c7b6ce7a1a96c2b09db1038b36895912cd9f))
* 更新 GitHub Actions 工作流并升级版本号 ([90d249e](https://github.com/MEMLTS/HackerKit/commit/90d249e5eb91e8e108905557a65d04eff26554d6))
* 更新 GitHub Actions 工作流并替换应用图标 ([a938f83](https://github.com/MEMLTS/HackerKit/commit/a938f83ebae6adff4692d3a91b7df49b446e9081))
* 更新 Node 设置和 pnpm 安装流程 ([15d4c85](https://github.com/MEMLTS/HackerKit/commit/15d4c85cd3dadd39b0e72af45ae27d22ca19987e))
* 更新 Node.js 版本并配置 npm ([cf5c26f](https://github.com/MEMLTS/HackerKit/commit/cf5c26fa693e6d72c9c70470d4ef495abbae2708))
* 添加 Tauri Android 应用的 GitHub Actions 构建流程 ([7a493d3](https://github.com/MEMLTS/HackerKit/commit/7a493d3e5dd9a653fb92b79e1e0488f3f1c73a53))
* 移除 gradlew 权限设置步骤 ([f44b227](https://github.com/MEMLTS/HackerKit/commit/f44b227ce99ce030f15024f73101d4ca2195c0f5))
