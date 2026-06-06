# 软件工程课设技术栈与建议

---

**User**

我们在做一个软件工程课设，课设要求参照@project-rubric.txt 。我们已经写好了user story，参考@bruinnest-user-story.md，里面的12条US我们都打算实现，如果难度过高，也会尽量实现基础版本，但保留后期拓展的可能性。我们打算前端用React vite，后端用Node.js，数据库用SQLite better-sqlite3。你看看这些决定怎么样，有什么建议？我们还需要用到什么工具吗？

---

**Cursor**

我先看看评分标准和你们现有的 user story，再基于课程目标来评估这套技术选型是否合适，以及还缺哪些必要工具。

我已经看过 rubric 和 12 条 US 了。整体方向是对的，但有几个高风险点很明确：`邮件验证`、`实时消息`、`Zillow 集成`、`地图` 和 `PDF 导出` 会明显拉高复杂度，所以更适合做成“先有基础可演示版本，再保留扩展口”的设计。

这套决定**整体是合理的，而且很适合课设**。如果你们的目标是先把 12 条 US 尽量都覆盖到、同时保证本地可跑和演示稳定，那么 `React + Vite`、`Node.js`、`SQLite + better-sqlite3` 这条路线属于“实现成本低、迭代快、部署简单”的组合，和 rubric 里要求的动态数据、上传到后端、认证、搜索、前后端都有实质代码、以及能解释设计选择这些点都比较契合。

```3:13:project-rubric.txt
You app can display dynamic data to the user.
Your app can upload data from the client to the back-end
Address security issues. For example, at least part of your application should require the user to authenticate
User can meaningfully search through server data.
Three more distinct features. Some points will be given according to how creative and useful the features are.
Meaningful understanding of Git is exemplified through version control.
A detailed README file that accurately and completely describes how to run the app locally.
The Project is generally visually pleasing and easy to navigate.
The code of your system is written with readability in mind (e.g., identifier have meaningful names, the code is well-structured and follows best practices, ...)
Execute a significant amount of code, written by your team, on both client and server.
You rationally consider alternative choices for your design decisions and you justify why the choices are made accordingly.
```

你们这套栈里，我会这样评价：

`React + Vite` 很合适。你们的产品明显是典型 SPA：注册登录、资料页、搜索筛选、详情页、消息页、收藏页、通知、地图，这些都很适合 React。Vite 开发体验也好，适合学生项目快速迭代。我的建议是**前后端都用 TypeScript**，因为你们字段很多，用户、profile、questionnaire、message、favorite、notification、housing unit 这些对象一多，TS 能明显减少低级错误。

`Node.js` 也合适，但建议尽快明确是 `Express` 还是 `Fastify`。如果你们想走最稳妥路线，我更推荐 `Express`，资料多、踩坑少、和中间件生态兼容好；如果团队里有人比较熟 Fastify 也可以，但课设里没必要为了“更现代”增加理解成本。你们有实时消息需求，后端建议直接配 `Socket.IO`，不要自己从头折腾原生 `ws`，因为 US-5/US-8 已经把实时和未读提醒都拉进来了。

`SQLite + better-sqlite3` 对课设也很合适。优点是本地跑起来非常轻，README 也容易写清楚；对于 profile、favorites、notifications、questionnaire、message history 这类数据完全够用。它的短板主要是并发和规模，但你们这个场景通常不是问题。真正需要注意的是：**从第一天就把 schema 设计好，并且用 migration 工具管理数据库**，不然到后面改表会很痛苦。

从你们的 user story 来看，真正“高风险”的不是主栈，而是几个具体功能：

```94:128:bruinnest-user-story.md
### US-5: Direct Messaging

**User Role**: As a user

**User Goal**: I want to send direct messages to a potential roommate in real time

**Benefit**: so that we can discuss living arrangements without exchanging personal contact information.

**Dependency**: It depends on US-1, US-2, US3 and US-4.

#### Acceptance Criteria

1. Given an authenticated user viewing another user's profile, when they click "Send Message" and type a message, then the message is delivered to the recipient in real time via WebSocket.
...
### US-6: Link Housing Unit via Zillow Integration
```

最大的风险我会按这个顺序看：

1. `Zillow API`
官方可用性和申请门槛很可能比你们预期高，很多学生项目最后都卡在这里。这个功能一定要设计成“可替换的数据源接口”，不要把整个系统绑死在 Zillow 上。更稳妥的基础版是：
- 先支持用户手动粘贴房源链接
- 或者手动录入地址、租金、图片 URL
- 再预留一个 `housing provider` 层，后面真能接 Zillow/别的 API 再换进去

这样既保留扩展性，也不会因为第三方 API 失效把 US-6 整个拖死。

2. `邮件验证码`
注册验证本身不难，但真正发邮件需要服务。建议尽量不要把 Gmail SMTP 这类临时方案做成正式依赖。可以考虑：
- `Resend` 或 `SendGrid` 这类开发者友好的发信服务
- 如果只是课程演示，保留一个 dev mode：验证码打印在 server log，方便本地测试
- 在报告里明确说明 production 和 demo 的区别

3. `实时消息 + 通知`
这里建议你们把通知系统做成“数据库存储 + Socket.IO 推送”的两层结构。也就是说：
- 消息、通知先落库
- 在线用户通过 socket 收到实时推送
- 不在线用户下次刷新再从数据库加载
这样实现简单，而且扩展到 US-8 也顺。

4. `地图`
US-12 做基础版的话，用 `Leaflet + React-Leaflet + OpenStreetMap` 就够了，不建议一开始上 Google Maps。前者免费、快、依赖轻。后面需要 marker clustering 再加插件。

5. `PDF 协议生成`
基础版完全可以做成“后端生成一个简单 PDF”，不用追求复杂模板。比如用 `pdf-lib` 或 `pdfkit`。不要把大量时间耗在排版上，重点是把问卷答案转成一份可下载文档。

如果问“还需要什么工具”，我会把它们分成“建议必备”和“看时间选配”两类。

**建议必备：**
- `TypeScript`：前后端都上
- `React Router`：前端路由
- `TanStack Query`：前端请求缓存、loading/error 管理，比自己到处 `useEffect` 稳很多
- `Express`：后端框架
- `Socket.IO`：实时消息和通知
- `Drizzle ORM`：如果你们坚持 `better-sqlite3`，它和 `Drizzle` 组合很舒服，类型也好
- `drizzle-kit`：数据库 migration
- `Zod`：接口入参校验，前后端都能用
- `bcrypt` 或 `argon2`：密码哈希，优先 `argon2`
- `express-session` + 安全 cookie：比自己乱设计 JWT 更适合你们这种单体课程项目
- `ESLint` + `Prettier`：代码一致性
- `Vitest`：前端/通用测试
- `Supertest`：后端 API 测试
- `dotenv`：环境变量管理

**看时间选配：**
- `Tailwind CSS` 或 `MUI`：想快速把 UI 做得更像样，可以二选一。课设里 Tailwind 往往更快
- `Playwright`：如果你们想做 1~2 条关键流程端到端测试，比如注册登录、搜索、发消息
- `Swagger/OpenAPI`：如果你们想让 API 文档更规范，但不是必须
- `dayjs`：处理日期比原生 `Date` 顺手很多
- `better-sqlite3-session-store` 或类似方案：如果你们走 session 登录，可以省自己写 session 持久化

我还会建议你们在实现顺序上做一点收敛。12 条全上不是不行，但最好按“评分收益/风险”排序。比较稳的分法是：

1. 第一阶段先拿下 `US-1 ~ US-5`
这是 rubric 最核心的闭环：认证、资料、搜索、详情、实时消息。做完这一层，课设基本已经成型。

2. 第二阶段做 `US-7、US-9、US-8`
问卷匹配、收藏、通知都很适合给项目加“有特色的功能点”，而且技术上比 Zillow/地图更可控。

3. 第三阶段做 `US-6、US-12`
这两个依赖外部数据和地图展示，建议放后面。

4. 第四阶段再冲 `US-10、US-11`
这两个更像加分项。

最后，站在“写设计 rationale”这个 rubric 点上，如果你们要在报告里解释为什么选这套技术，我会建议你们这样表述：

- 选 `React + Vite`：因为页面交互多、状态复杂、开发效率高，适合 SPA
- 选 `Node.js`：因为前后端统一 JavaScript/TypeScript，团队上手快，适合快速迭代
- 选 `SQLite + better-sqlite3`：因为课设重在功能实现和本地可运行性，SQLite 部署简单、依赖少，足以支持当前规模；若未来扩展，可迁移到 PostgreSQL
- 不把 Zillow 作为硬依赖：因为第三方 API 可用性不稳定，所以采用可替换 provider 设计，先保证核心功能可演示

如果你愿意，我下一步可以继续帮你们把这 12 条 US 按实现难度拆成一份“推荐技术栈 + 数据表设计 + 开发优先级”的落地方案。

---

**User**

后端就用Node.js吧，用Express。能先不用TanStack吗，但架构要保留后期改用TanStack的可能。实时消息可以先用3秒轮询吗，同样架构保留改动的可能。我们课设需要migration吗，能直接schema吗？把技术栈敲定一下吧，敲定后按流程是做什么，设计前后端api-spec吗？

---

**Cursor**

我先基于你刚刚确认的约束，把栈收敛成一套“现在能快做、后面能平滑升级”的方案，再给你一个实际开发顺序。
可以，这样收敛是合理的，而且更符合课设节奏。

你们现在可以把核心原则定成一句话：**先选最容易交付和演示的方案，但接口边界按可升级方式设计。**  
按这个原则，`Express`、先不用 `TanStack Query`、消息先 `3 秒轮询` 都没问题，只要一开始别把代码写死在具体实现上。

## 技术栈定稿

我建议你们先定成这一版：

### 前端
- `React`
- `Vite`
- `TypeScript`
- `React Router`
- 原生 `fetch` + 自己封装一层 API client
- 样式：`Tailwind CSS` 或 `CSS Modules` 二选一  
  如果想更快出效果，我更偏向 `Tailwind CSS`

### 后端
- `Node.js`
- `Express`
- `TypeScript`
- `express-session`
- 密码哈希：`argon2` 或 `bcrypt`  
  优先 `argon2`

### 数据库
- `SQLite`
- `better-sqlite3`

### 数据访问层
- 推荐：`Drizzle ORM`
- 配套：`drizzle-kit`

### 校验与工具
- `zod`
- `dotenv`
- `cors`
- `eslint`
- `prettier`

### 测试
- `vitest`
- `supertest`

这套已经够你们完成 rubric 里的大部分要求，而且实现成本不高。

---

## 你提的几个关键问题

### 1. 先不用 TanStack 可以吗？
可以。

但不要在页面组件里到处直接写 `fetch('/api/...')`。  
更好的做法是前端先抽一层，比如：

- `src/lib/api/client.ts`
- `src/lib/api/auth.ts`
- `src/lib/api/profiles.ts`
- `src/lib/api/messages.ts`

页面只调用这些函数，不直接关心请求细节。这样后面如果要切到 `TanStack Query`，你们只需要：

- 保留原来的 API 函数
- 在页面层把 `useEffect + useState` 换成 `useQuery/useMutation`

也就是说，**先把“请求逻辑”和“页面状态逻辑”分开**，以后切 TanStack 就很顺。

所以答案是：

- **现在可以不用 TanStack**
- **但要先封装 API client，别把 fetch 写散**

---

### 2. 实时消息先用 3 秒轮询可以吗？
也可以。

对课设来说，`3 秒轮询` 是一个非常现实的折中。只要你们在设计时把消息系统拆成两层，后面换 WebSocket 不会太痛：

#### 先这样设计
- 后端提供正常 REST API：
  - `POST /messages` 发送消息
  - `GET /conversations`
  - `GET /conversations/:id/messages?after=...`
- 前端在消息页每 3 秒拉一次新消息
- 导航栏未读数也每 3 秒刷新一次，或者在切页时刷新

#### 为未来升级留口
不要让前端页面直接依赖“轮询”这件事本身。最好抽一个消息同步层，例如概念上：

- `MessageService.sendMessage()`
- `MessageService.fetchConversation()`
- `MessageSync.subscribeConversation(conversationId, callback)`

现在 `subscribeConversation` 的内部实现是 `setInterval` 轮询；以后你们上 `Socket.IO`，只改这一层。

所以结论是：

- **3 秒轮询完全可以作为第一版**
- **接口和前端结构要按“未来可切 socket”来设计**

---

### 3. 课设需要 migration 吗？能直接 schema 吗？
严格说，**不是“必须”，但我建议要有**。

如果你们问的是“能不能一开始直接写一个 SQL schema，启动时创建表？”  
答案是：**能**，而且小项目一开始这么做最快。

但从你们这个项目规模看，我更建议至少有一个最基础的 migration 机制。原因不是“工业规范必须”，而是因为你们这个题目表结构大概率会频繁改：

- user
- profile
- questionnaire_answers
- compatibility_scores
- conversations
- messages
- favorites
- notifications
- housing_units
- maybe housing_parties

这些表只要改过两三轮，没有 migration 就会开始混乱。到时候团队成员本地数据库结构不一致，会很烦。

### 最现实的建议
你们可以采用“轻 migration”方案，而不是一开始搞很重：

#### 可接受方案 A：最省事
- 先写一个 `schema.sql`
- 数据库删了重建
- 适合项目最初几天快速试验

#### 更推荐方案 B：课设友好
- 用 `Drizzle + drizzle-kit`
- 每次改表生成 migration
- README 里写清楚如何执行 migration

对你们来说，我会建议：

- **如果现在还没开始正式开发，用 migration**
- **如果只是这两天想快速验证原型，可以先 schema，尽快切 migration**

一句话总结：  
**能直接 schema，但不建议整个项目都只靠 schema。**

---

## 我建议你们最终敲定的技术决策

可以直接写成你们的设计结论：

1. 前端使用 `React + Vite + TypeScript`，因为界面交互多、开发效率高，适合单页应用。
2. 后端使用 `Node.js + Express + TypeScript`，因为学习成本低、资料多、前后端语言统一。
3. 数据库使用 `SQLite + better-sqlite3`，因为本地开发和演示简单，足够支撑课设规模。
4. 前端当前使用 `fetch + 自封装 API client`，暂不引入 `TanStack Query`，但保留后续通过统一数据访问层迁移的可能。
5. 消息系统第一阶段采用 `REST API + 3 秒轮询`，后续可在不改变业务接口的情况下升级为 `WebSocket / Socket.IO`。
6. 数据库变更建议采用 migration 管理；如项目初期需快速试验，可短暂用 schema 初始化，但正式开发阶段应切换到 migration。
7. 表单与接口数据校验使用 `zod`，认证使用 `express-session` + 安全 cookie，密码使用 `argon2` 或 `bcrypt` 哈希。

这套说法也很适合以后写 README 或 design rationale。

---

## 敲定后按流程做什么

是的，下一步非常建议先做 **API spec**，但在 API spec 之前还有两件事最好先定掉。

我建议顺序是这样：

### 1. 先定 MVP 范围
虽然你们想做 12 条 US，但真正第一阶段要实现的建议先锁定：

- `US-1` 注册登录
- `US-2` 个人资料
- `US-3` 浏览搜索
- `US-4` 详情页
- `US-5` 消息（先轮询）

然后把：
- `US-7` 问卷匹配
- `US-9` 收藏
- `US-8` 通知

作为第二阶段。  
这样节奏会稳很多。

---

### 2. 先做数据模型设计
先画清楚有哪些核心实体，以及关系是什么。至少先定这些表：

- `users`
- `profiles`
- `housing_units`
- `questionnaire_answers`
- `compatibility_scores` 或运行时计算策略
- `conversations`
- `conversation_participants`
- `messages`
- `favorites`
- `notifications`

这一步很重要，因为 API spec 是建立在数据模型上的。

---

### 3. 再做 API spec
对，**这一步很值得做**。  
你们这个项目前后端交互很多，不先写 API spec，后面很容易前后端互相等。

API spec 不需要一上来写成 Swagger 那么正式。  
先写一个课程项目够用的文档就行，按这个格式：

- 路径
- 方法
- 是否需要登录
- 请求参数
- 响应格式
- 错误情况

比如：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

- `GET /api/profiles`
- `GET /api/profiles/:id`
- `PUT /api/profile/me`

- `GET /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/messages`

- `POST /api/favorites/:profileId`
- `DELETE /api/favorites/:profileId`
- `GET /api/favorites`

- `GET /api/notifications`
- `POST /api/notifications/read-all`

这样前后端就能并行了。

---

### 4. 再做页面路由和后端目录结构
在真正写功能前，把骨架先搭出来。

前端先定路由：
- `/login`
- `/register`
- `/profile/setup`
- `/browse`
- `/profiles/:id`
- `/messages`
- `/favorites`
- `/questionnaire`
- `/notifications`

后端先定模块：
- `auth`
- `profile`
- `browse/search`
- `message`
- `favorite`
- `notification`
- `housing`
- `questionnaire`

---

### 5. 再开始按 US 分阶段开发
推荐顺序：

1. `US-1`
2. `US-2`
3. `US-3`
4. `US-4`
5. `US-5`
6. `US-9`
7. `US-7`
8. `US-8`
9. `US-6`
10. `US-12`
11. `US-10`
12. `US-11`

这个顺序基本是按“依赖关系 + 风险控制”排的。

---

## 我对你们的一个额外建议

你们现在最该避免的，不是“技术选错”，而是**一次性把所有高级功能都做满**。  
对课设来说，更重要的是：

- 核心闭环完整
- 本地稳定可跑
- README 清楚
- 有认证、有搜索、有动态数据、有前后端代码
- 能解释为什么这么设计

所以像下面这些，第一版完全可以“降级实现”：

- 邮件验证：开发模式可先用日志验证码
- 消息：先轮询
- Zillow：先手动录入房源或预留 provider 接口
- 通知：先站内通知，不做浏览器 push
- 匹配分数：先简单规则打分，不做复杂算法
- PDF：先简单模板导出

只要你们在文档里说清楚“当前实现”和“未来扩展点”，这其实反而体现了设计理性。

如果你愿意，我下一步可以直接帮你们整理一版**适合这套技术栈的数据库表设计草案 + 第一版 API spec 清单**。

---

**User**

前后端确定不用TypeScript，就用JavaScript。前端要用axios吗。密码用bcrypt吧。所以然后第一步是确定数据库表吗？如果先做MVP的话，要考虑一开始的数据库和接口设计能够后续扩展吗

---

**Cursor**

可以，`前后端都用 JavaScript` 也是完全合理的，尤其是课设里要兼顾开发速度、团队上手成本和调试效率。你们现在这版可以收敛成：

- 前端：`React + Vite + JavaScript`
- 后端：`Node.js + Express + JavaScript`
- 数据库：`SQLite + better-sqlite3`
- 认证：`express-session`
- 密码哈希：`bcrypt`
- 请求校验：`zod` 可选，但我还是建议保留
- 前端请求：`fetch` 或 `axios` 二选一
- 测试：`vitest` + `supertest`

`bcrypt` 没问题，课设里很常见，也容易解释。只要记得**不要明文存密码**，并且登录时做 hash compare 就行。

关于 `axios`，我的建议是：**不是必须，可以不用。**  
如果你们项目不大，用原生 `fetch` 完全够，而且少一个依赖。只有在你们比较在意这些能力时，`axios` 才更值：

- 自动统一处理 `baseURL`
- 请求/响应拦截器
- 更方便的超时和错误处理
- 提交 JSON 时写法更顺手

但这些其实自己封装一层 `apiClient` 也能做到。所以我的倾向是：

- **如果想最简，就用 `fetch`**
- **如果你们有人已经很熟 `axios`，也可以用**
- 不管选哪个，**都要封装成统一 API 层**，不要在组件里到处直接发请求

也就是说，页面里最好不要这样写：

```js
useEffect(() => {
  fetch('/api/profiles')
}, [])
```

而是让页面调用：

```js
getProfiles()
login(data)
getConversationMessages(id)
```

这样以后无论你们换 `axios`、换 `TanStack`、还是换实时方案，页面层都不用大改。

---

### 第一件事是不是先确定数据库表？

**严格说，第一步不是只定数据库表，而是先定“核心数据模型 + MVP 范围 + API 草案”。**

这三件事最好一起做，而不是只做其中一个。  
因为数据库表、接口、页面功能是互相绑定的：

- 你有哪些页面和功能，决定你需要哪些接口
- 你有哪些接口，决定你怎么设计数据表
- 你怎么设计数据表，又会反过来影响接口是否好写、后续是否好扩展

所以更推荐你们按这个顺序：

## 推荐顺序

### 1. 先锁定 MVP 做哪些 US
如果先做 MVP，我建议第一阶段只锁这几个：

- `US-1` 注册/登录
- `US-2` 个人资料
- `US-3` Browse/Search
- `US-4` Detail Page
- `US-5` Messaging（先轮询版）
- 如果还能再加一个，优先 `US-9` Favorites

这样已经满足 rubric 里很多核心点了：认证、动态数据、搜索、前后端交互、多个 distinct features。

### 2. 再定核心数据模型
也就是先想清楚系统里有哪些“实体”：

- `users`
- `profiles`
- `conversations`
- `conversation_participants`
- `messages`
- `favorites`

如果你们想为后续扩展留空间，还可以提前预留这些实体，但 MVP 阶段不一定全做完：

- `housing_units`
- `questionnaire_answers`
- `notifications`
- `compatibility_scores`

### 3. 然后写 API spec 草案
比如：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/profile/me`
- `GET /api/profiles`
- `GET /api/profiles/:id`
- `GET /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/messages`
- `GET /api/favorites`
- `POST /api/favorites/:profileId`
- `DELETE /api/favorites/:profileId`

### 4. 最后再落到具体 schema
这时候表结构会清晰很多，不容易返工。

---

## 如果先做 MVP，一开始的数据库和接口要不要考虑后续扩展？

**要考虑，但不用为了未来把现在做得过于复杂。**

原则是：

**现在按 MVP 实现，但表结构和接口命名不要把未来堵死。**

这点非常重要。你们不需要一开始就把 12 条 US 全建完，但至少要避免“以后一扩展就推倒重来”。可以注意下面几个设计原则。

---

## 数据库设计上的扩展建议

### 1. 把用户账号和个人资料分开
不要把所有字段都塞进一个 `users` 表里。更推荐：

- `users`：账号相关
  - id
  - email
  - password_hash
  - is_verified
  - created_at

- `profiles`：展示相关
  - user_id
  - display_name
  - gender
  - graduation_year
  - budget_min
  - budget_max
  - move_in_date
  - bio
  - avatar_url（可后续加）

这样以后加更多 profile 字段不会污染认证逻辑。

### 2. 消息系统不要只做“两人聊天硬编码”
建议至少拆成：

- `conversations`
- `conversation_participants`
- `messages`

即使 MVP 只有一对一聊天，也先这么设计。因为以后如果你们做 `US-10` group/housing party，消息结构还能复用。

### 3. 收藏单独成表
`favorites`
- user_id
- target_user_id
- created_at

不要把 favorites 存成某个 JSON 字段塞进 profile 里，不利于查询和扩展。

### 4. 问卷和匹配也尽量拆开
以后做 `US-7` 时，不要把 10 个答案硬塞进 `profiles`。更适合单独做：

- `questionnaire_answers`
- `compatibility_scores`（可选，预计算时再建）

### 5. 房源信息单独成表
以后做 `US-6`/`US-12` 时，最好是：

- `housing_units`
- `profiles.linked_housing_id` 或单独关联表

这样未来换数据源也方便。

---

## 接口设计上的扩展建议

### 1. URL 按资源来设计，不要按页面来设计
比如用：

- `/api/profiles`
- `/api/messages`
- `/api/conversations`

不要写成很 UI 导向的：
- `/api/browsePageData`
- `/api/homePageCards`

前者以后更稳定。

### 2. 搜索和过滤用 query params
比如：

```txt
GET /api/profiles?gender=female&budgetMin=800&budgetMax=1200&keyword=quiet&page=1
```

这样以后加更多过滤条件比较自然。

### 3. 给消息轮询预留增量拉取能力
例如：

```txt
GET /api/conversations/:id/messages?after=123
```

现在轮询可以用它，后面如果换 WebSocket，历史消息加载接口还能继续复用。

### 4. 响应结构尽量统一
比如统一成：

```json
{
  "success": true,
  "data": ...
}
```

错误时：

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

不是硬性要求，但团队协作会轻松很多。

---

## 我的结论

你们现在不用 TypeScript、用 JavaScript 完全可以；`bcrypt` 也可以；`axios` 不是必须，`fetch` 足够，但一定要做统一 API 封装。

至于“第一步”，更准确地说不是单独先写数据库表，而是：

1. 先锁定 MVP 范围  
2. 再定核心数据模型  
3. 再写 API spec 草案  
4. 最后落成具体数据库 schema / migration

如果先做 MVP，**一定要考虑后续扩展，但只需要做到“结构可扩展”，不需要一开始就把所有高级功能都实现出来**。你们最需要的是把账号、资料、消息、收藏这些核心实体拆清楚，把接口按资源设计好，这样后面加问卷、通知、房源、地图都会顺很多。

如果你愿意，我下一步可以直接帮你们整理一版 **MVP 需要的数据库表草案 + 对应 API spec 第一版**。

---

**User**

好的，MVP就做US1-5。不用axios，就用fetch。你做一下MVP数据表和api-spec

---

**Cursor**

我先快速核对一下仓库里现有的计划文档和项目结构，看看有没有已经约定好的目录、命名或实现约束；然后我会整理出一版面向 `US1-5` 的 MVP 数据表和 API spec。

我已经确认目前仓库里还没有前后端代码骨架，所以这版可以直接把 `US1-5` 的 MVP 数据模型和 API 作为第一份正式设计基线，后面按它来搭 `client/` 和 `server/`。

---

**User**

把刚才那个spec做成一个我可以放进项目目录里的正式spec。我要给队友看的。

---

**Cursor**

我会把刚才那版方案整理成一份正式、可直接放进项目目录的设计文档，语气会按团队内部 spec 来写，不会保留聊天式表述。

我先确认一下当前目录里已有的文档文件名，然后把内容整理成一份正式的 MVP 规格说明，结构会更偏“项目文档”而不是“实施计划”。

我准备直接新建一份正式文档放在项目根目录，内容会整理成“背景、范围、技术基线、数据模型、API 契约、延期事项”这类规范结构，便于队友和老师直接阅读。

文档已经落到项目根目录了。我再快速过一遍格式和内容一致性，确保它更像正式项目文档，而不是聊天记录改写。

正式 spec 已经整理好了，文件在 `bruinnest-mvp-spec.md`。

这份文档已经从“实施计划”改成了更适合给队友和老师看的规格说明，内容包括：
- MVP 范围与延期项
- 技术基线
- 数据表设计与关系
- 统一的 API 约定
- `US1-5` 对应的接口定义
- 后续扩展边界和实现优先级

我没有保留聊天式措辞，也没有写成 AI 提纲风格，整体是偏项目文档的写法。你现在可以直接把它放进仓库里用；如果你们后面按 `git-convention.md` 的目录规范整理，也可以再移动到 `docs/` 下。

如果你愿意，下一步我可以继续帮你把这份 spec 往下落两步，二选一都很自然：
1. 产出一版对应的 `SQLite schema.sql`
2. 把这份 spec 再拆成“数据模型文档”和“API 文档”两份更正式的提交材料

---

**User**

按流程，写完api-spec，是不是设计后端项目目录的架构，我们打算用数据库，业务，路由三层架构怎么样？决定了后端架构之后，是不是要约定各个模块export的接口，像api-spec一样也写个文档？

---

**Cursor**

对，**通常下一步就是定后端项目结构**。  
你们现在已经有了对外的 API 契约，接下来最自然的事情就是把“这些接口在后端内部怎么落地”定下来，不然队友开始写代码时很容易各写各的。

你们现在这份 spec 里其实已经隐含了这个顺序：

```770:779:bruinnest-mvp-spec.md
## 10. Implementation Priority

Recommended build order:

1. authentication and session setup
2. profile creation and update
3. browse and search endpoint
4. roommate detail endpoint
5. conversation creation and message history
6. unread badge polling
```

在这一步之前，最好先把“后端目录结构 + 模块职责 + 调用边界”定掉。

## 三层架构可不可以

可以，**`数据库层 / 业务层 / 路由层` 对你们这个课设是合适的**。  
它比把所有逻辑都塞进 route handler 清晰得多，而且不会像企业级分层那样过重。

我会建议你们把三层理解成：

- `db/repository`：只负责数据访问
- `service`：只负责业务规则
- `route`：只负责 HTTP 层、参数接收、响应返回

也就是大致这样的调用方向：

`route -> service -> repository/db`

这个方向要尽量固定，避免反向依赖。

不过有一个小修正建议：  
如果你们直接把“路由层”写成既定义路由又写业务逻辑，后面很容易变乱。更稳一点的是：

- `routes/`：只注册 URL
- `controllers/`：处理请求和响应
- `services/`：业务逻辑
- `repositories/` 或 `models/`：数据库访问

也就是说，**严格说四层会更清楚**；但如果你们想保持简单，也可以把 `routes + controllers` 合并看作你说的“路由层”。关键不是名字，而是**不要把 SQL、业务判断、HTTP 响应混在一个文件里**。

## 我对你们的具体建议

如果你们是课程项目、团队人数有限，我建议用这个折中版：

```text
server/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   └── messageRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   └── messageController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── profileService.js
│   │   └── messageService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── profileRepository.js
│   │   ├── conversationRepository.js
│   │   └── messageRepository.js
│   ├── utils/
│   │   ├── password.js
│   │   ├── date.js
│   │   └── response.js
│   └── validations/
│       ├── authValidation.js
│       ├── profileValidation.js
│       └── messageValidation.js
```

这个结构的好处是：

- 认证、profile、message 三个模块边界很清楚
- API spec 可以自然映射到 route/controller
- service 层能承接你们的业务规则，比如“60 秒内不能重发验证码”“profile 完整才允许出现在 browse”“不能给自己发起会话”
- repository 层能把 SQL 隔离出去，后面换表结构或加字段不会影响太多文件

## 定完架构后，要不要约定模块 export 接口

**要，而且很值得。**  
但它不一定要像 API spec 那么正式、那么长。对你们更实用的做法是写一份**内部模块契约文档**，或者一份 `backend-architecture.md`。

因为 API spec 解决的是：

- 前后端怎么对接
- 请求和响应长什么样

而模块 export 契约解决的是：

- 后端内部不同人怎么协作
- service 调 repository 时传什么
- controller 调 service 时拿回什么
- 错误怎么抛、怎么返回

这两种文档作用不一样，后者对多人并行开发特别有用。

## 我建议你们写，但写轻量版

不用把每个函数都写成 JavaDoc 那么重。  
只要把**每个模块的职责、导出函数、参数、返回值、异常规则**写清楚就够了。

比如可以按模块写成这样：

### `authService`
职责：
- 注册验证流程
- 登录
- 登出
- 获取当前会话用户

导出：
- `sendVerificationCode({ email, password })`
- `verifyRegistration({ email, password, code })`
- `login({ email, password })`
- `logout(session)`
- `getCurrentUser(session)`

约定：
- 成功时返回 plain object
- 业务错误抛自定义错误，例如 `AuthError`
- 不直接处理 `req` / `res`

### `profileService`
职责：
- 创建/更新个人资料
- 获取本人资料
- 获取 browse 列表
- 获取公开详情

导出：
- `createProfile(userId, payload)`
- `updateMyProfile(userId, payload)`
- `getMyProfile(userId)`
- `searchProfiles(userId, query)`
- `getPublicProfile(viewerId, targetUserId)`

### `messageService`
职责：
- 创建或获取会话
- 获取会话列表
- 获取消息历史
- 发送消息
- 标记已读
- 获取未读汇总

导出：
- `createOrGetConversation(currentUserId, targetUserId)`
- `listConversations(currentUserId)`
- `listMessages(currentUserId, conversationId, afterMessageId)`
- `sendMessage(currentUserId, conversationId, body)`
- `markConversationRead(currentUserId, conversationId, lastReadMessageId)`
- `getUnreadSummary(currentUserId)`

这种文档非常适合你们现在这个阶段。

## 为什么这一步重要

因为你们现在的 API spec 已经定义了对外行为：

```272:308:bruinnest-mvp-spec.md
## 7. API Specification

## 7.1 Authentication

### `POST /api/auth/register`

Purpose: start the registration flow by validating email and password, then sending a verification code.
```

但 API spec 并没有规定：

- route 文件里谁负责解析参数
- service 里谁负责密码校验
- repository 里谁负责查重 email
- 错误是返回 `null`、抛异常，还是统一 result object

如果这些不先约定，团队并行开发时会很容易出现：
- 有人 service 返回 `{ success: false }`
- 有人直接 `throw new Error()`
- 有人 repository 返回数据库原始行
- 有人 controller 里直接写 SQL

最后很难合并。

## 我建议你们现在按这个顺序继续

1. 保留当前 `api-spec` 作为对外接口文档
2. 再写一份简洁的 `backend-architecture.md`
3. 在这份文档里约定：
   - 目录结构
   - 每层职责
   - 模块依赖方向
   - 各模块导出函数
   - 错误处理方式
   - 命名规范
4. 然后再开始正式搭 `server/` 骨架

## 关于“要不要写得像 API spec 一样正式”

我的建议是：

- **对外 API**：写正式一些，老师和前端都要看
- **对内模块接口**：写轻量但明确，主要给队友看

所以答案是：**要写，但不用和 API spec 一样重。**  
更像“开发约定文档”而不是“公开接口规范”。

如果你愿意，我下一步可以直接帮你起草一版适合你们项目的 **后端目录结构 + 模块 export 接口约定模板**，你们可以直接放进 `docs/`。

---

**User**

好，写一份

---

**Cursor**

我来把它整理成一份正式的后端架构文档，重点写清目录结构、分层职责、依赖方向，以及各模块对内导出的接口约定，方便你们并行开发。

我已经把后端架构文档落成正式文件了。再快速检查一遍内容组织和语气，确保它能直接给队友当内部规范看。

已经写好了，文件在 `bruinnest-backend-architecture.md`。

这份文档和前一份 `bruinnest-mvp-spec.md` 的分工是：
- `bruinnest-mvp-spec.md`：对外规格，讲数据模型和 API
- `bruinnest-backend-architecture.md`：对内实现规范，讲后端目录、分层职责、依赖方向、模块接口约定

这份后端文档已经包含了你刚才提到的关键内容：
- 推荐的后端目录结构
- `routes / controllers / services / repositories` 的职责划分
- 单向依赖规则
- `auth / profile / message` 三个模块的职责
- service 和 repository 层建议导出的函数接口
- 错误处理和校验职责分层
- 请求流转图和实现顺序

你们现在可以直接把这两份文档作为后端开工前的基线。比较自然的下一步就是按这份架构去搭 `server/` 骨架，再开始写 `schema.sql` 和各模块的空文件。

如果你要，我下一步可以继续帮你做这两个里面的一个：
1. 写 `SQLite schema.sql`
2. 写一份前端项目目录和前端模块接口约定，和这份后端文档配套

---

**User**

进行下一步之前，先把@bruinnest-mvp-spec.md 拆成两个文件吧，数据库和api。然后把git-convention也升级一下，更规范点，加上commit message的要求，改成英文。

---

**Cursor**

我先把现有的 MVP spec 重新组织成“数据库规格”和“API 规格”两份正式文档，再把 Git 规范升级成英文版的团队协作文档，并补上更明确的 commit message 规则。

我会把总 spec 改成一个简短总览，并拆出两份正式文档：一份专门写数据库，一份专门写 API。然后把 `git-convention.md` 重写成英文版团队规范，补上更明确的 commit message 和 PR 要求。

已经处理好了。

现在文档结构变成了这样：
- `bruinnest-mvp-database-spec.md`：单独负责数据库设计
- `bruinnest-mvp-api-spec.md`：单独负责 API 契约
- `bruinnest-mvp-spec.md`：改成总览入口，指向上面两份文档和后端架构文档

另外，`git-convention.md` 也已经重写成英文版，更适合直接给队友当团队规范使用。新版里补充了：
- 更清晰的 branching model
- daily workflow
- PR 要求
- 英文 commit message 标准
- 允许的 commit types
- 好/坏 commit message 示例
- 更明确的 team rules

如果你愿意，下一步最顺的就是继续把文档体系补完整，通常二选一：
- 写 `schema.sql`，把数据库 spec 真正落到可执行结构
- 写前端架构文档，和现在的后端架构文档配成一套

---

**User**

把总的@bruinnest-mvp-spec.md 调整一下，根本不要提original version，让他看起来就是第一版。

---

**Cursor**

我先把总览文档改成一个独立成立的“规格入口页”，去掉任何“拆分自旧版本”或“原始版本”的痕迹，让它看起来就是这套文档体系的正式第一页。

我会把开头和收尾都收得更自然一些，避免出现“拆分”“原始版本”这类编辑痕迹，同时保留它作为总览页的作用。

我再快速看一遍修改后的总览页，确认语气已经像正式第一版文档，而不是“重构过的文档说明”。

已经调整好了，`bruinnest-mvp-spec.md` 现在是一个自然的总览入口页，不再提任何“original version”“split from combined spec”之类的痕迹。

我主要做了这几处收口：
- 开头改成正式总览文档口吻
- 去掉了“从旧版拆分出来”的叙述
- 把“specification set”之类偏整理痕迹的措辞收得更自然
- 结尾改成“first implementation baseline”这种正式项目文档表达

现在这份看起来会更像你们一开始就这样组织好的文档体系。  
如果你还想更进一步去掉“文档索引感”，我也可以把它再改成更像 `Overview / Scope / References / Delivery Order` 的课程项目 spec 首页。

---

**User**

好了回到前面的话题，写前端架构文档，和现在的后端架构文档配成一套

---

**Cursor**

我先对齐一下现有后端架构文档的结构和语气，然后写一份对应的前端架构文档，确保两份文档在层次、粒度和命名上是成套的。

我会按后端文档同样的风格来写前端架构：先定义分层和依赖方向，再给出目录结构、模块职责和对内接口约定，这样两份文档可以并排使用。

前端架构文档已经成型了。我再快速通读一遍，确认它和后端文档在结构、术语和粒度上是对应的。

前端架构文档已经写好了，文件在 `bruinnest-frontend-architecture.md`。

这份文档是按你们现有 `bruinnest-backend-architecture.md` 的结构配套写的，主要对应了这些内容：
- 前端分层：`routes / pages / features / api / shared`
- 单向依赖规则
- 推荐的 `client/` 目录结构
- `auth / profile / messages` 三个模块的职责划分
- 前端内部模块接口约定
- `fetch` 包装层的推荐导出函数
- `AuthContext`、`ProtectedRoute`、`Navbar` 这类共享模块的职责
- 状态管理、数据获取、校验、命名规范和实现顺序

现在你们已经有一套比较完整的文档组合了：
- `bruinnest-mvp-database-spec.md`
- `bruinnest-mvp-api-spec.md`
- `bruinnest-backend-architecture.md`
- `bruinnest-frontend-architecture.md`

比较自然的下一步就是开始把文档落成工程骨架。最顺的两个方向是：
1. 写 `schema.sql`
2. 按前后端架构文档搭 `client/` 和 `server/` 的初始目录与空文件结构

---

**User**

first commit前要做什么？schema.sql也要写吗，这不是具体涉及到数据库表了吗

---

**Cursor**

对，`schema.sql` 确实已经进入“具体数据库表实现”这一步了，所以它通常不属于“纯文档阶段”，而是**开始落地代码/工程结构**的一部分。

如果你问的是 **first commit 之前** 应该做什么，我建议分成两类看：

## 在 first commit 之前，最好先完成的事

你们现在其实已经把最重要的设计前置工作做得差不多了。正式开始写代码前，最好确认这几件事已经定住：

1. **MVP scope 定住**
   也就是现在的 `US1-5`，不要一边开工一边改范围。

2. **技术栈定住**
   你们现在已经基本定了：
   - 前端：`React + Vite + JavaScript + fetch`
   - 后端：`Node.js + Express + JavaScript`
   - 数据库：`SQLite + better-sqlite3`
   - 认证：`express-session`
   - 密码：`bcrypt`

3. **文档基线定住**
   也就是你们现在这几份：
   - `bruinnest-mvp-database-spec.md`
   - `bruinnest-mvp-api-spec.md`
   - `bruinnest-backend-architecture.md`
   - `bruinnest-frontend-architecture.md`
   - `git-convention.md`

4. **目录和模块边界想清楚**
   至少大家要对 `client/`、`server/`、`docs/` 以及前后端模块分工没有异议。

做到这里，其实就可以开始 first commit 了。

---

## 那 first commit 应该是什么

我不建议你们第一下就把 `schema.sql + 前后端初始化 + 一堆页面 + 一堆路由` 全塞进一个 commit。  
更好的做法是把 first commit 做成**项目骨架初始化**。

比较合理的 first commit 内容一般是：

- 建立基础目录结构
- 初始化 `client/` 和 `server/`
- 加上基础 `README`
- 加上 `.gitignore`
- 把文档放进合适位置
- 加最基础的运行脚本

这种 first commit 更像：

- `chore: initialize project structure`
- `chore: scaffold client and server apps`
- `docs: add MVP and architecture specifications`

也就是说，**first commit 不一定要包含 schema.sql**。

---

## `schema.sql` 要不要写

### 短答案
**要写，但不一定非得放在 first commit 里。**

### 为什么要写
因为你们已经不是停留在“概念表设计”了，已经有正式的数据库 spec 了。下一步要真正开发后端，最终一定要把这些表落成可执行的数据库结构。

也就是说，下面这两者不是一回事：

- `bruinnest-mvp-database-spec.md`：说明“应该有哪些表、字段、关系”
- `schema.sql`：把这些设计真正变成 SQLite 能执行的建表语句

前者是设计文档，后者是实现文件。

---

## 最自然的顺序

我会建议你们这样排：

### 方案 A：更稳妥
1. **first commit：项目骨架**
   - `client/`
   - `server/`
   - `docs/`
   - `README.md`
   - `.gitignore`
   - 基础 spec 文档整理好

2. **second commit：database schema**
   - 新增 `server/database/schema.sql`
   - 如果需要，加一个简单 seed
   - 同步 README 里的数据库初始化说明

这样分层最清楚，也最适合老师和队友看提交历史。

### 方案 B：如果你们想更快
也可以 first commit 直接包含：
- 项目骨架
- `schema.sql`

这也没问题，只要提交内容还是“同一类工作”，别再混进 auth route、页面组件这些功能代码就行。

---

## 我更推荐哪种

我更推荐 **方案 A**，因为它更干净：

### Commit 1
`chore: initialize project structure`

内容：
- 初始化前后端目录
- 放入文档
- 配置基本忽略文件和 README

### Commit 2
`feat: add initial SQLite schema`

内容：
- `schema.sql`
- 建表语句
- 可能的索引
- 数据库初始化说明

这样以后回头看历史非常清楚。

---

## 为什么 schema.sql 不算“太早”

你担心的点其实很合理：  
“schema.sql 不是已经涉及具体数据库表了吗？”

答案是：**对，但现在已经到了该具体化的时候。**

因为你们已经完成了这几步：

- user story
- MVP scope
- API spec
- backend architecture
- database spec

如果再不写 `schema.sql`，后端同学就很难真正开工。  
比如 `authService`、`profileRepository`、`messageRepository` 都会依赖真实表结构。

所以从流程上说：

**先有数据库 spec，再写 schema.sql，是非常正常的。**

不是过早实现，而是设计落地的下一步。

---

## first commit 前最后再确认什么

在真正提交之前，我建议你们团队内部最后确认 3 件事：

1. **字段命名风格**
   例如数据库统一用 `snake_case`，前端/接口用 `camelCase`
   你们现有文档基本已经是这个方向了，比如 API 是 `displayName`，表字段是 `display_name`。

2. **时间字段格式**
   统一都存 ISO timestamp 字符串，还是 SQLite datetime 风格。
   这个最好在 `schema.sql` 前定好。

3. **schema 是否只覆盖 MVP**
   我的建议是：**只写 MVP 必需表**
   也就是目前先写：
   - `users`
   - `email_verifications`
   - `profiles`
   - `conversations`
   - `conversation_participants`
   - `messages`

不要现在就把 favorites、notifications、housing、questionnaire 先建进去。

---

## 结论

可以这样理解：

- **first commit 前**：你们最该完成的是范围、技术栈、API、前后端架构、数据库设计文档
- **schema.sql**：确实属于下一阶段的“具体实现”，但现在已经到了该写的时候
- **是否必须放进 first commit**：不必须，我更建议放在 first commit 之后的下一次提交里
- **最合理的 first commit**：先做项目骨架初始化，而不是把所有实现混进去

如果你愿意，我下一步可以直接帮你列一个 **“first commit 应该包含哪些文件 / second commit 的 schema.sql 应该包含哪些内容”** 的清单。

---

**User**

我在准备first commit，等提交了之后再进行后续工作。那first commit的项目要初始化到什么程度啊

---

**Cursor**

如果你们的目标是“先把 first commit 做干净，后面再正式开发”，那我建议把 first commit 定位成：

**“项目基线初始化”**，不是“功能开发开始”。

也就是说，first commit 要做到的是：**仓库能看出项目怎么组织、怎么启动、文档在哪里、前后端怎么分开**；但**不需要**已经实现数据库表、接口、页面功能。

## 建议做到的程度

first commit 最好至少包含这些内容：

### 1. 顶层仓库结构
把基础目录搭出来：

- `client/`
- `server/`
- `docs/`（如果你们准备把文档往这里放）
- `README.md`
- `.gitignore`

这一步的目标是让任何队友一 clone 下来，就能看懂项目骨架。

### 2. 前后端项目初始化
至少做到“两个子项目能识别出来”，通常是：

- `client/` 已经用 Vite 初始化
- `server/` 已经有 `package.json`
- 两边都有最基本的启动脚本

不要求你们已经写业务代码，但至少要有“这是个 React 前端 + Express 后端项目”的样子。

### 3. 基础依赖可以先装一小部分
first commit 不需要把所有依赖一次装完，但建议把**最基础、不会变的依赖**放进去。

比如：
- 前端：`react`, `react-dom`, `vite`, `react-router-dom`
- 后端：`express`

像 `better-sqlite3`、`bcrypt`、`express-session`、测试库这些，可以放在后面的提交里，也可以一起上，但不是 first commit 的重点。

### 4. 基础入口文件
建议至少有最小可运行入口：

前端：
- `client/src/main.jsx`
- `client/src/App.jsx`

后端：
- `server/src/app.js`
- `server/src/server.js`

哪怕里面只是最小骨架，也没问题。  
first commit 的标准不是“有功能”，而是“工程可落地”。

### 5. 文档基线
你们已经有这些文档了，这其实很适合纳入 first commit 或与 first commit 同阶段整理：

- `bruinnest-mvp-spec.md`
- `bruinnest-mvp-database-spec.md`
- `bruinnest-mvp-api-spec.md`
- `bruinnest-backend-architecture.md`
- `bruinnest-frontend-architecture.md`
- `git-convention.md`

如果 first commit 想更像“项目正式开工基线”，把这些文档一起纳入很合理。

### 6. README 至少写到能让队友上手
不需要一开始就写完整 README，但至少建议包括：

- project brief
- tech stack
- repo structure
- how to install dependencies
- how to run client
- how to run server

哪怕内容先简短，也比空着强。

---

## first commit 不必做到的程度

这些内容我**不建议硬塞进 first commit**：

- `schema.sql`
- 具体数据库表实现
- auth route
- profile page
- browse page
- messaging logic
- session auth
- API 封装细节
- 页面 UI 细节

原因很简单：这些已经属于“开始实现功能”了。  
而 first commit 更适合做成一个清晰的起点。

---

## 一个比较理想的 first commit 画像

如果让我给一个“刚刚好”的标准，大概是这样：

### 已经有
- 清晰的仓库目录
- 前后端都初始化完成
- 能分别启动 client/server
- README 和规范文档在位
- 团队对结构和流程没有歧义

### 还没有
- 业务功能
- 数据库 schema
- API 实现
- 页面实现
- 真正的用户流程

这样最干净。

---

## 你们 first commit 可以长什么样

一个很合理的 first commit 可以包含：

- 初始化 `client/` Vite 项目
- 初始化 `server/` Express 项目骨架
- 新增 `.gitignore`
- 新增 `README.md`
- 整理并加入文档
- 确定 `docs/` 放文档的位置（如果你们要挪过去）

对应的 commit message 可以是：

- `chore: initialize project structure`
- `chore: scaffold client and server apps`
- `docs: add MVP and architecture documents`

如果你们只想保留一个 very clean 的 first commit，我更推荐：

`chore: initialize project structure`

---

## 我对“初始化到什么程度”的一句话建议

**初始化到“工程能站起来、团队能开始分工”，但不要初始化到“已经开始做业务功能”。**

这是最合适的边界。

---

## 你们提交前可以自查这几个问题

如果下面大多数都能答“是”，first commit 就差不多了：

- 队友 clone 下来能看懂仓库结构吗？
- 前后端项目边界清楚吗？
- 至少知道怎么分别启动 client 和 server 吗？
- README 不是空的吗？
- Git 工作流文档已经明确了吗？
- MVP/database/API/architecture 文档已经有了吗？
- 这次提交里还没有混进具体功能实现吗？

如果这些都满足，就可以提交 first commit 了。

如果你愿意，我可以下一步直接给你一份**first commit 文件清单**，按“必须有 / 可以有 / 先不要有”三栏列出来。

---

**User**

项目目录bruinnest/的初始化要干什么

---

**Cursor**

`bruinnest/` 的初始化，本质上就是把它搭成一个**可作为团队开发起点的仓库根目录**。  
目标不是先做功能，而是先把“前后端在哪里、文档在哪里、怎么运行、怎么协作”定住。

我建议初始化到这个程度就够了：

## 根目录要有的东西

```text
bruinnest/
├── client/
├── server/
├── docs/
├── .gitignore
└── README.md
```

### `client/`
前端项目根目录。初始化到至少有：
- `package.json`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`

作用：让队友知道前端就是 React + Vite，并且能启动。

### `server/`
后端项目根目录。初始化到至少有：
- `package.json`
- `src/app.js`
- `src/server.js`

作用：让队友知道后端就是 Node.js + Express，并且有明确入口。

### `docs/`
放你们已经写好的设计文档。建议把这些都放进去：
- `bruinnest-mvp-spec.md`
- `bruinnest-mvp-database-spec.md`
- `bruinnest-mvp-api-spec.md`
- `bruinnest-backend-architecture.md`
- `bruinnest-frontend-architecture.md`
- `git-convention.md`

这样仓库结构会更专业，也方便老师看。

### `.gitignore`
至少要忽略这些：
- `node_modules/`
- `.env`
- `dist/`
- `build/`
- `.DS_Store`
- IDE 配置目录（如 `.vscode/`，如果你们不打算提交）

### `README.md`
first commit 时不用写很满，但至少建议有：
- 项目简介
- tech stack
- repo structure
- how to run client
- how to run server
- 团队开发分支说明，可引用 `git-convention.md`

---

## 可以有，但不是必须马上有

这些属于“初始化后很快会加上”的内容：

### 前端里
- `src/routes/`
- `src/pages/`
- `src/features/`
- `src/lib/api/`
- `src/shared/`

### 后端里
- `src/routes/`
- `src/controllers/`
- `src/services/`
- `src/repositories/`
- `src/middlewares/`
- `src/errors/`

你们如果已经决定按架构文档来走，其实**第一天就把这些空目录搭出来也可以**。  
这样队友后续直接往对应位置写，不会乱。

---

## 先不要放进去的东西

在“纯初始化”阶段，我建议先不要急着加这些：

- `schema.sql`
- 具体数据库表
- 已实现的 auth/profile/message 业务代码
- 具体页面逻辑
- session 配置细节
- poll message 逻辑

这些属于第二阶段，也就是“项目骨架已经立起来之后的实现工作”。

---

## 我建议的初始化边界

如果你问“`bruinnest/` 到底要初始化到什么程度”，我的建议是：

### 最低标准
- 有 `client/`
- 有 `server/`
- 有 `docs/`
- 有 `.gitignore`
- 有 `README.md`

### 更推荐的标准
- `client/` 和 `server/` 都已经完成最小项目初始化
- 都有可识别的入口文件
- 文档已经放到 `docs/`
- 目录结构和命名与架构文档一致

这时候就已经非常适合做 first commit。

---

## 一个比较好的 first commit 结果应该像这样

别人 clone 你们的仓库后，应该能一眼看明白：

- 这是一个前后端分离项目
- 前端在 `client/`
- 后端在 `server/`
- 文档在 `docs/`
- 团队规范已经定好
- 接下来可以分别开始做前端和后端

如果已经达到这个状态，初始化就算完成了。

## 推荐顺序

你们现在可以按这个顺序做：

1. 创建 `bruinnest/` 根目录结构
2. 初始化 `client/`
3. 初始化 `server/`
4. 创建 `.gitignore`
5. 写最基本的 `README.md`
6. 把现有文档放进 `docs/`
7. 提交 first commit

一个很合适的 first commit message 是：

```text
chore: initialize project structure
```

如果你要，我下一步可以直接给你一份 **`bruinnest/` 初始化后的推荐完整目录树**，包含前后端的空目录层级，基本可以照着建。

---

**User**

刚才又把@bruinnest/docs/project-rubric.txt 更新了一下。你检查下项目的架构，稍微概括总结一下，看看符不符合要求。

---

**Cursor**

我先看一下更新后的 rubric 和现在 `bruinnest/` 目录的实际结构，再按评分项对应做个简短检查，看看哪些已经满足、哪些还只是设计层面。

我已经看到整体是“骨架 + 设计文档比较完整、功能实现还没落地”的状态。再补读几个关键入口文件和 README，我就可以按 rubric 更准确地判断哪些已经满足、哪些还没满足。

整体看，**项目架构方向是对的，而且文档化程度对课设来说是加分项**；但如果按你刚更新的 rubric 来看，**目前属于“架构与规范基本到位，功能要求大部分还没真正落地”**。

## 架构概括

现在的 `bruinnest/` 已经是一个比较清晰的前后端分离仓库：

- `client/`: React + Vite 前端骨架
- `server/`: Express 后端骨架
- `docs/`: MVP spec、数据库 spec、前后端架构文档、user story、git 规范
- `README.md`: 项目说明和启动方式

从结构上看，这个方向是合理的，尤其适合你们当前的 `US1-5` MVP。README 里也已经把仓库定位说清楚了：

```1:26:bruinnest/README.md
# BruinNest

BruinNest is the MVP codebase for a roommate-matching web app.

This repository is initialized for the `US-1` to `US-5` MVP scope:

- account registration and login
- profile creation and update
- browse and search
- roommate detail page
- direct messaging

## Planned Stack

- frontend: `React`, `Vite`, `JavaScript`, `React Router`, `fetch`
- backend: `Node.js`, `Express`, `SQLite`, `better-sqlite3`
- auth: `express-session`

## Repository Layout

```text
bruinnest/
├── client/   # frontend app skeleton
├── server/   # backend app skeleton
└── docs/     # repo-local project documentation
```

前端和后端的“目标架构”也已经有了成套文档，这一点很好。你们现在不是“没设计”，而是**设计先行、实现滞后**。

## 跟 rubric 的符合度

### 已经比较符合的部分

**1. 代码结构清晰、可读性方向正确**  
从目录划分上看，前后端边界明确，文档也把模块职责讲清楚了，这和 rubric 里对 readable / well-structured code 的方向是一致的。

**2. 设计决策有说明，有理由**  
你们已经有数据库 spec、API spec、前后端 architecture 文档，这一点明显符合 “rationally consider alternative choices and justify decisions” 这一项。  
总览文档也已经把 MVP 范围和实现顺序固定下来了：

```54:75:bruinnest/docs/README.md
## 5. Implementation Order

Recommended implementation order:

1. authentication and session setup
2. profile creation and update
3. browse and search endpoint
4. roommate detail endpoint
5. conversation creation and message history
6. unread badge polling

## 6. Acceptance Alignment

This specification is intended to support the MVP subset of the BruinNest user stories:
...
Together, these documents define the first implementation baseline for the BruinNest MVP.
```

**3. Git 规范和协作流程已经有基础**  
如果你们后续真的按 `git-convention.md` 执行，这一项是能支撑 rubric 里的 version control 要求的。

**4. 架构图要求有一定基础**  
你们 docs 里已经有 mermaid 图，不是没有图。比如后端和前端架构文档里都有 flowchart 和 sequence diagram。这说明“图”这件事你们已经开始做了。

---

### 目前还不算满足，或者只满足“设计层面”的部分

**1. Dynamic data**
还没有真正实现。当前后端只有一个健康检查接口：

```28:45:bruinnest/server/src/app.js
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      server: "running",
    },
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found.",
    },
  });
});
```

这说明后端骨架在，但还没有 profile、search、messages 这些真正的动态业务数据。

**2. Client upload data to backend**
还没真正满足。前端虽然已经有 API wrapper 方向，但还没有和真实后端联通。

**3. Security / authentication**
目前只算“有认证中间件方向”，还不算真正完成。后端已经挂了 `express-session`：

```16:25:bruinnest/server/src/app.js
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
```

但前端 `AuthContext` 现在还是 stub，`main.jsx` 里也还没真正接 auth provider：

```1:12:bruinnest/client/src/shared/context/AuthContext.jsx
import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = {
    currentUser: null,
    isAuthenticated: false,
  };
```

```7:12:bruinnest/client/src/main.jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

所以“安全要求”目前是**架构上考虑了，但还没在行为上满足**。

**4. Meaningful search through server data**
还没满足。虽然 API spec 和前端架构都为 browse/search 预留好了，但代码里还没有真正的 search endpoint 和数据库查询。

**5. Significant amount of code on both client and server**
现在还不满足。当前更像 initialization scaffold，不是功能实现阶段。

**6. 2+ fully automated end-to-end tests**
这项目前明显还没有实现。我没有看到测试目录、Playwright 配置或 e2e 测试文件。

**7. README 中展示并解释至少两种架构图**
这是一个容易漏掉的点。你们 docs 里已经有图，但 rubric 要求的是：

```13:15:bruinnest/docs/project-rubric.txt
The project has 2+ fully automated end-to-end tests (for the End-to-end Test, we recommend PlayWright).
Include at least two different diagrams of your architecture (your choice which diagram types you pick, but it should be at least two and should capture the most important aspects of your system and are consistent with the code base and consistent with each other) presented and described in the Project README file.
You rationally consider alternative choices for your design decisions and you justify the choices are made accordingly.
```

注意这里写的是 **presented and described in the Project README file**。  
也就是说，**光在 `docs/` 里有图还不够**，最终你们需要把至少两张架构图放进项目 README 里，并且配上文字说明。

---

## 结论

**如果你问“这个项目架构合不合理”**，答案是：**合理，而且对课设来说挺规范**。  
前后端分离、分层文档、API spec、数据库 spec、Git workflow，这些都说明你们是按软件工程方式在组织项目。

**如果你问“现在是否已经符合 rubric”**，答案是：**还没有完全符合，目前主要符合的是“架构设计和文档准备”部分，功能与测试部分还没落地。**

可以粗略分成三档：

- **已具备基础**：项目结构、设计说明、Git 规范、架构图雏形
- **方向正确但未实现**：认证、搜索、数据库、消息、动态数据
- **当前缺失最明显**：e2e tests、README 中的正式架构图展示与说明、真实前后端联通功能

所以我会给一个比较准确的评价：

**“架构设计符合课程项目要求的方向，文档准备明显超出最低线；但当前代码实现还处在 scaffold 阶段，距离 rubric 的运行时功能要求和测试要求还有一段距离。”**

如果你愿意，我下一步可以继续帮你做两件很实际的事之一：
- 按 rubric 列一个 **“当前已满足 / 未满足 / 高优先补齐”** 的 checklist
- 帮你看一下现在 `bruinnest/` 里的 README 还差什么，才能更稳地对应老师这版 rubric



