# TanStack Query前端目录refactor

---

**User**

你看下我们课设的所有文档@bruinnest/docs ，了解下我们的项目。git管理的目录是project/bruinnest/。

我打算refactor一下前的tanstack query和hooks之类的，你看看下面的说法怎么样：


---

## 统一目录模板

```text
features/<domain>/
  components/     # 纯 UI，props 进、事件出
  hooks/          # useXxx.js，内部用 queries + lib/api
  queries/        # queryKeys.js、*Cache.js（不 export 给 page）
```

**Page 只 import：**

```javascript
import { ChatPanel } from "../features/messages/components/ChatPanel";
import { useConversations } from "../features/messages/hooks/useConversations";
```

**不要** import `queries/` 里的东西。

---

## favorites 拆完长什么样

```text
features/favorites/
  queries/
    queryKeys.js          # 从现有文件移入
    favoriteCache.js      # 从现有文件移入
  hooks/
    useFavoritesList.js   # 新建（从 FavoritesPage 抽出）
    useFavoriteToggle.js  # 从根目录移入，改 import 路径
```

依赖关系：

```text
useFavoritesList  → queryKeys + lib/api
useFavoriteToggle → queryKeys + favoriteCache + lib/api
favoriteCache     → queryKeys
```
---

## messages 拆完长什么样

```text
features/messages/
  components/
    ChatPanel.jsx
    ConversationList.jsx
    MessageAvatar.jsx
  queries/
    queryKeys.js          # 新建
    messageCache.js       # 新建（send/mark read 的 invalidate 收这里）
  hooks/
    useConversations.js
    useConversationMessages.js
    useUnreadSummary.js
    useSendMessage.js     # 可选，或先留在 MessagesPage
```

`MessagesPage` 里那 3 个 `useQuery` + mutation 的 invalidate 逐步迁到 hooks/queries。

---


---

**Cursor**

Let me first read through your project documentation to understand the codebase.

Now let me look at the current hooks, queries, and the actual page implementations to understand the current state.

Let me now look at the other relevant docs and existing files referenced in the proposal.

Let me also look at some more pages to understand the full pattern, and check for any existing hooks or cache files.

Now I have a thorough understanding of both the architecture docs and the actual codebase. Let me give you a comprehensive evaluation.

---

## 总体评价：方案非常好，和架构文档高度一致

你的方案和 `bruinnest-frontend-architecture.md` 里定下的设计意图完全吻合。架构文档 Section 5 推荐了 `features/` 分组，Section 4.1 要求 "server-state caching, invalidation, and polling should live in TanStack Query"、page 不直接管 cache synchronization。但目前实际代码里（这也是 `refactor-todo.md` #15 指出的问题），`features/` 基本是空的，所有 query/mutation 逻辑都堆在 page 组件里。你的方案正好把这件事做对了。

---

## 当前代码的痛点（你的方案精准命中了）

**1. Query key 是散落的魔法字符串**

`["favorites"]` 这个 key 出现在 `FavoritesPage.jsx`、`BrowsePage.jsx`、`ProfileDetailPage.jsx` 三个文件里。一旦有人拼错或改名，调试成本很高。`queryKeys.js` 集中管理直接解决这个问题。

**2. Favorite toggle 逻辑三处重复**

```1:28:/home/wangxy/CS35L/project/bruinnest/client/src/pages/FavoritesPage.jsx
```

```62:83:/home/wangxy/CS35L/project/bruinnest/client/src/pages/BrowsePage.jsx
  const favMutation = useMutation({
    mutationFn: ({ userId, isFav }) =>
      isFav ? removeFavorite(userId) : addFavorite(userId),
    onMutate: ({ userId, isFav }) => {
      queryClient.setQueryData(
        ["profiles", searchFilters, page],
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((p) =>
                  p.userId === userId ? { ...p, isFavorited: !isFav } : p
                ),
              }
            : old
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
```

```31:46:/home/wangxy/CS35L/project/bruinnest/client/src/pages/ProfileDetailPage.jsx
  const favMutation = useMutation({
    mutationFn: () =>
      profile.isFavorited
        ? removeFavorite(Number(userId))
        : addFavorite(Number(userId)),
    onMutate: () => {
      queryClient.setQueryData(["profile", userId], (old) =>
        old ? { ...old, isFavorited: !old.isFavorited } : old
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
```

`useFavoriteToggle` 把这些抽成一个 hook 非常合理。

**3. `MessagesPage` 是最大的 page（160 行），3 个 query + 2 个 mutation + ref + state 全堆在一起**

提取 `useConversations`、`useConversationMessages`、`useUnreadSummary` 后 page 会干净很多。

---

## 方案的具体分析

### 模板结构：`components/` + `hooks/` + `queries/`

很清晰的三层：

| 层 | 职责 | 谁 import |
|---|---|---|
| `queries/` | query keys、invalidation helpers | 只被 `hooks/` import |
| `hooks/` | `useQuery` / `useMutation` 封装 | `pages/` import |
| `components/` | 纯 UI，props in / events out | `pages/` 或 `hooks/` import |

"Page 不 import `queries/`" 这条规则是好的——它强制了清晰的抽象边界：hook 拥有 query 关注点，page 只管组合。

### Favorites 拆分

```text
features/favorites/
  queries/
    queryKeys.js          # 迁移自 ??? （目前不存在，需要新建）
    favoriteCache.js      # 迁移自 ??? （目前不存在，需要新建）
  hooks/
    useFavoritesList.js   # 新建（从 FavoritesPage 抽出 useQuery）
    useFavoriteToggle.js  # 新建（从三处 favorite mutation 合并）
```

依赖方向是合理的。不过有一个小点：你说的 "从现有文件移入" / "从根目录移入" —— 实际上目前项目里**完全不存在** `queryKeys.js`、`favoriteCache.js`、`useFavoriteToggle.js` 这些文件。这些全部是新建，不是"移入"。

### Messages 拆分

```text
features/messages/
  components/
    ChatPanel.jsx           # 已有
    ConversationList.jsx    # 已有
    MessageAvatar.jsx       # 已有
  queries/
    queryKeys.js            # 新建
    messageCache.js         # 新建（send/mark read 的 invalidate 收这里）
  hooks/
    useConversations.js       # 新建
    useConversationMessages.js # 新建
    useUnreadSummary.js       # 新建
    useSendMessage.js         # 可选/新建
```

---

## 几个值得讨论的细节

### 1. `messageCache.js` 的命名

TanStack Query 的 API 不使用 "cache" 这个词——它用的是 `queryClient.invalidateQueries`、`queryClient.setQueryData` 等。这个文件实际做的是"定义 mutation 的 invalidation 逻辑"。建议改名为 `messageMutations.js` 或 `messageInvalidation.js`，语义上更准确，也不会让队友和 TanStack 自身的 cache 概念混淆。

### 2. `useFavoriteToggle` 需要考虑跨 feature 的 cache invalidation

这是你方案里唯一一个需要想清楚的边界问题。

`BrowsePage` 的 favorite toggle 需要 invalidate `["favorites"]` **和** `["profiles"]`（因为 browse 卡片上显示了 `isFavorited` 状态）。`ProfileDetailPage` 也类似，需要 invalidate `["profile", userId]`、`["favorites"]`、`["profiles"]`。

如果 `useFavoriteToggle` 放在 `features/favorites/hooks/` 里，它"应该"只知道自己 domain 的 key `["favorites"]`，不应该知道 `["profiles"]` 的存在。但有几种处理方式：

- **方案 A**: `useFavoriteToggle` 只 invalidate `["favorites"]`，page 自己在 `onSuccess` 回调里额外 invalidate 自己的 query
- **方案 B**: `useFavoriteToggle` 接受可选的 `extraInvalidationKeys` 参数
- **方案 C**: 用 TanStack 的 `queryClient.invalidateQueries` 的 fuzzy matching——比如 `["profiles"]` 前缀匹配同时清掉所有 profiles 相关缓存

我建议 **方案 A**，最简单也不违反边界约束。这在你方案里只需微调 hook 的接口即可。

### 3. `useSendMessage` 和 `markRead` 也应该提取

你的方案里 `useSendMessage` 标了 "可选，或先留在 MessagesPage"，`markRead` 没有对应的 hook。但这两者都是 mutation + invalidation 的模式，建议一起提取，保持一致性：

```text
hooks/
  useConversations.js
  useConversationMessages.js
  useUnreadSummary.js
  useSendMessage.js        # ← 建议做
  useMarkConversationRead.js  # ← 建议补上
```

### 4. ref 和 side-effect 的去向

`MessagesPage` 里有这些：

```65:77:/home/wangxy/CS35L/project/bruinnest/client/src/pages/MessagesPage.jsx
  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    const markKey = `${activeId}:${lastId}`;

    if (markKey !== lastMarkedReadRef.current) {
      lastMarkedReadRef.current = markKey;
      markReadMutation.mutate({
        conversationId: activeId,
        lastReadMessageId: lastId,
      });
    }
  }, [activeId, messages]);
```

这里 `lastMarkedReadRef` 是用来防止重复 mark-read 的 ref。如果 `markRead` 被抽成 `useMarkConversationRead` hook，这个 ref 逻辑也应该一起进去，否则 page 还是会有多余的 ref 管理。

同样，`messagesEndRef` 的 scroll-into-view 逻辑（第79-81行）是纯 UI 行为，留在 page 或者放进 `ChatPanel` 组件里都合理，不需要进 hook。

---

## 总结

| 维度 | 评价 |
|---|---|
| 和架构文档对齐 | 完全一致，直接实现了 doc 里规划但未落地的 features 分组 |
| 解决当前痛点 | 精准命中了 query key 散落、mutation 重复、MessagesPage 臃肿 |
| 抽象层次设计 | `queries → hooks → pages` 三层边界清晰，"page 不 import queries" 是好的约束 |
| 范围选择 | 从 favorites + messages 起步是合理的 MVP 范围，后续 browse/profile 可以同样处理 |
| 需要微调的点 | `messageCache.js` 命名、`useFavoriteToggle` 跨 feature invalidation 策略、markRead 是否也提取 |

**一句话：这方案可以直接做，上面列的细节只是实施时的微调方向，不影响整体设计。**

---

**User**

queries/queryKeys.js 要不要命名具体点，写成queries/messagesQueryKeys.js

messageCache.js是干什么的，哪些文件要调用到它啊

---

**Cursor**

## 1. `queryKeys.js` 要不要加域名前缀？

**不需要。** 两种方案对比：

| 方案 | import 写法 | 冗余度 |
|---|---|---|
| `queries/queryKeys.js` | `import { ... } from "../queries/queryKeys"` | 无 — 目录本身已经是 `features/messages/` |
| `queries/messagesQueryKeys.js` | `import { ... } from "../queries/messagesQueryKeys"` | `messages` 出现了两次（路径 + 文件名） |

因为你的规则是 **page 不 import `queries/`**，只有同 feature 下的 hook 才 import，上下文天然清楚。`"../queries/queryKeys"` 本身就不存在歧义。

如果你在意 grep-ability（全局搜索 `messagesKeys` 比搜 `queryKeys` 准），可以通过**具名导出**解决，不需要改文件名：

```js
// features/messages/queries/queryKeys.js
export const messagesKeys = {
  all: ["messages"],
  conversations: ["conversations"],
  messages: (conversationId) => ["messages", conversationId],
  unreadSummary: ["unreadSummary"],
};
```

这样搜 `messagesKeys` 只会命中 messages domain，搜 `favoritesKeys` 只命中 favorites。文件名保持简洁。

---

## 2. `messageCache.js` 是干什么的？

**它本质是 mutation 的 invalidation 副作用集中管理文件。** 不直接管理 cache，而是定义"某 mutation 成功后需要 invalidate 哪些 query"。

### 动机

看现在 `MessagesPage` 里的两段 invalidation：

```89:96:/home/wangxy/CS35L/project/bruinnest/client/src/pages/MessagesPage.jsx
  const sendMutation = useMutation({
    mutationFn: (body) => sendMessage(activeId, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
```

```56:63:/home/wangxy/CS35L/project/bruinnest/client/src/pages/MessagesPage.jsx
  const markReadMutation = useMutation({
    mutationFn: ({ conversationId, lastReadMessageId }) =>
      markConversationRead(conversationId, lastReadMessageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadSummary"] });
    },
  });
```

如果拆成 hook，这两段 invalidation 逻辑会分别在 `useSendMessage.js` 和 `useMarkConversationRead.js` 里各自写。但"发完消息该 invalidate 哪些 key"是一个业务规则，抽出来放到一个地方更内聚。

### `messageCache.js` 长什么样

```js
// features/messages/queries/messageInvalidation.js
import { queryClient } from "../../../shared/query/queryClient";
import { messagesKeys } from "./queryKeys";

export function invalidateConversations() {
  return queryClient.invalidateQueries({ queryKey: messagesKeys.conversations });
}

export function invalidateMessages(conversationId) {
  return queryClient.invalidateQueries({ queryKey: messagesKeys.messages(conversationId) });
}

export function invalidateUnreadSummary() {
  return queryClient.invalidateQueries({ queryKey: messagesKeys.unreadSummary });
}

// 组合 — 给 mutation onSuccess 直接用
export function afterSendMessage(conversationId) {
  invalidateMessages(conversationId);
  invalidateConversations();
}

export function afterMarkRead() {
  invalidateConversations();
  invalidateUnreadSummary();
}
```

### 哪些文件调用它？

**只有两个 hook：**

```
useSendMessage.js  ──→ afterSendMessage(conversationId)
useMarkConversationRead.js ──→ afterMarkRead()
```

调用关系：

```text
useSendMessage.js ──import──→ messageInvalidation.js ──import──→ queryKeys.js
useMarkConversationRead.js ──import──→ messageInvalidation.js ──import──→ queryKeys.js

MessagesPage.jsx ──import──→ useSendMessage / useMarkConversationRead
                           （page 完全不碰 queries/ 下的东西）
```

---

## 3. 命名建议

`messageCache.js` 这个名字**容易误导**——TanStack Query 的 API 里没有 `cache` 这个概念，都是 `invalidateQueries` / `setQueryData` / `refetchQueries`。这个文件做的事是 mutation side-effect（invalidation），不是 cache management。

建议改为 `messageInvalidation.js`，语义更准。对应 favorites 版就是 `favoriteInvalidation.js`。

---

**User**

好，听你的。另外page层不会调用feature里各个query目录里的东西吗

---

**Cursor**

好问题，这正好可以谈谈这个规则的边界。

## 规则本身是对的，但不绝对

先说结论：**page 不 import `queries/` 里的东西，主流程上完全可行；但有极少情况下 page 需要直接调 `queryClient.invalidateQueries`——这不违反规则，因为 `queryClient` 来自 TanStack 本身，不是 `queries/` 目录。**

---

## 用 MessagesPage 验证

重构后的 `MessagesPage` 长这样：

```jsx
// MessagesPage 只 import 这些
import { useConversations } from "../features/messages/hooks/useConversations";
import { useConversationMessages } from "../features/messages/hooks/useConversationMessages";
import { useUnreadSummary } from "../features/messages/hooks/useUnreadSummary";
import { useSendMessage } from "../features/messages/hooks/useSendMessage";
import { useMarkConversationRead } from "../features/messages/hooks/useMarkConversationRead";
import ChatPanel from "../features/messages/components/ChatPanel";
import ConversationList from "../features/messages/components/ConversationList";

function MessagesPage() {
  const { conversations } = useConversations();
  const { messages } = useConversationMessages(activeId);
  const { unreadTotal } = useUnreadSummary();
  const { send, isSending } = useSendMessage(activeId);
  const markRead = useMarkConversationRead();

  // page 只剩 UI 状态和事件处理
  // 没有任何 query key 字符串、没有 queryClient.invalidateQueries
}
```

**是的，page 完全不需要接触 `queries/`。** 所有的 invalidation 都被 hook 内部吃掉了。

---

## 但有一个需要诚实的点：跨 domain 的 invalidation

拿 `BrowsePage` 的 favorite toggle 举例。它需要同时 invalidate `["favorites"]`（favorites domain）和 `["profiles"]`（browse domain）。如果把 toggle 抽成 `useFavoriteToggle()`，hook 内部只会 invalideate `favoritesKeys.all`，browse 自己的 `["profiles"]` 谁来清？

有两种做法：

### 做法一：page 里直接调 `queryClient.invalidateQueries`（推荐）

```jsx
import { useQueryClient } from "@tanstack/react-query";
import { useFavoriteToggle } from "../features/favorites/hooks/useFavoriteToggle";

function BrowsePage() {
  const queryClient = useQueryClient();  // ← 来自 TanStack，不来自 queries/
  const { toggle } = useFavoriteToggle();

  function handleToggle(profile) {
    toggle(profile.userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        // ↑ page 在自己的 domain 里管理自己的 cache，合理
      },
    });
  }
}
```

**这不违反规则**——page 没有 import `features/favorites/queries/` 下的任何东西。`queryClient` 是 TanStack 的原生 API，page 用它管理自己 domain 的 query key，合情合理。

### 做法二：给 hook 加回调参数

```jsx
const { toggle } = useFavoriteToggle({
  onToggleSettled: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
});
```

本质上和做法一一样，只是写法不同。核心思想不变：跨 domain 的事由调用方（page）负责。

---

## 总结

| 谁 | 能 import `queries/`? | 能用 `queryClient.invalidateQueries`? |
|---|---|---|
| `hooks/` | 是 — import `queryKeys` + `invalidation` | 是 — 在 mutation onSuccess 里调用 |
| `pages/` | 否 — 不 import `queries/` 里的东西 | 是 — 管理自己 domain 的 key，用 TanStack 原生 API |
| `components/` | 否 — 纯 UI，props 进事件出 | 否 — 不该知道数据层的存在 |

规则的实际含义是：**page 不需要知道 query key 常量定义放在哪个文件里，不需要关心 favorites domain 的 invalidate 策略是什么**。但它仍然可以（也需要）用 TanStack 自己的 API 来 refresh 它自己关心的一亩三分地。

---

**User**

你现在能先把文档更新了吧，还需要协商吗

---

**Cursor**

Let me re-read the architecture doc carefully first, then make the targeted edits.

Now I'll apply the edits. There are several spots in the doc that need updating.

**Edit 1:** Update the `features` section in 3.1 to describe the internal `components/` + `hooks/` + `queries/` structure.

**Edit 2:** Add a new section 3.2 explaining the feature internal pattern in detail.

I need to insert the new section 3.2 after the current features description (which ends with `- `queries/` modules should only be imported by hooks within the same feature domain`) and before `#### `api``.

**Edit 3:** Update Section 4 Dependency Direction to include the internal feature dependency rules.

Now update 4.1 to reference hooks instead of raw query management from pages.

**Edit 4:** Update Section 5 Directory Structure to show the new `hooks/` and `queries/` subdirectories.

**Edit 5:** Update Section 6.3 (Messages) and 6.6 (Favorites) to reference hooks/queries.

**Edit 6:** Add Section 8.3 Query Convention.

Let me also update Section 9 to reflect the hooks-based approach.

Let me also update the request flow diagram in Section 11 to include the hooks layer.

文档已更新完毕。以下是改动的完整总结：

---

## 改了什么

| 位置 | 改动 |
|---|---|
| **3.1 `features` 描述** | 新增三层表格（components / hooks / queries）及职责说明 |
| **3.2 新增：Feature Internal Pattern** | 完整说明 queries/ → hooks/ → pages 的依赖关系，`queryKeys.js` 和 `*Invalidation.js` 示例，跨 domain invalidation 策略 |
| **4. Dependency Direction** | 拆成两层（External + Inside features），新增 `pages → features/queries` 禁止、`features/components → hooks` 禁止等规则 |
| **4.1** | 改为"server-state 逻辑收在 `hooks/` backed by `queries/`" |
| **5. Directory Structure** | `features/` 下 messages/favorites 展示完整 hooks/ 和 queries/，browse/notifications/housing 预留了目录 |
| **6.3 Message Module** | 列出具体文件（`useConversations.js` 等），规则改为 "invlidation 集中在 `messageInvalidation.js`" |
| **6.6 Favorite Module** | 同上，加入 `useFavoritesList`、`useFavoriteToggle`、`favoriteInvalidation.js`，规则加上跨 domain invalidation |
| **8.3 新增：Query Conventions** | query key 命名规范、invalidation helper 命名（`after<Action>()`）、hook 命名模式表、跨 domain invalidation 原则 |
| **9. State Management** | 改为 "use feature hooks/ (backed by TanStack Query)" |
| **10. Data Fetching** | 改为 "pages import feature hooks to trigger data loads" |
| **11 / 11.1 Request Flow 图** | mermaid 图加入 Hook 和 QueryClient 参与者 |

---

不需要再协商了。现在的文档已经完整体现了我们讨论后定下来的所有规则，可以直接作为重构的实施指南。要我接下来开始实施重构吗？

---

**User**

你可以实施重构了吗？可以的话就重构一下

---

**Cursor**

Let me first check the existing structure and re-read the key files.

Now I'll create the new files and update the pages. Let me start with the query infrastructure files.

Now creating all four new files:

Let me fix a signature mismatch in the hook — `patchFavoriteState` and `invalidateFavoriteCaches` import `queryClient` internally, not as a parameter.

Now updating the three pages. Starting with FavoritesPage:

Now ProfileDetailPage:

Now let me verify all the files are clean.

All clean. Let me do a final readability check on the key files.

重构完成。0 个 lint 错误。以下是改动总结：

---

## 新建文件

| 文件 | 说明 |
|---|---|
| `features/favorites/queries/queryKeys.js` | 集中定义 `favoritesKeys`，覆盖 list、profiles、profile 三级 key |
| `features/favorites/queries/favoriteInvalidation.js` | `invalidateFavoriteCaches(userId)` — 三路 invalidate + `patchFavoriteState(userId, isFav)` — 乐观更新（`setQueriesData` 批量 patch 所有 browse 分页） |
| `features/favorites/hooks/useFavoritesList.js` | 封装 `["favorites", "list"]` query |
| `features/favorites/hooks/useFavoriteToggle.js` | 三处页面共用的 toggle mutation，内置 onMutate patch → onError rollback → onSettled invalidate |

## 修改的页面文件

| 页面 | 改动 |
|---|---|
| `FavoritesPage.jsx` | 删除 `useQuery`/`useMutation`/`useQueryClient`，改用 `useFavoritesList` + `useFavoriteToggle` |
| `BrowsePage.jsx` | 删除 25 行 `favMutation` + `queryClient` 逻辑，改用一行 `const favToggle = useFavoriteToggle()` |
| `ProfileDetailPage.jsx` | 同上，删除 `favMutation` + `queryClient`，改用 `useFavoriteToggle` |

---

## bug 修复逻辑

改动前，Favorites/Browse 改收藏后只 invalidate 了 `["favorites"]` 和 `["profiles"]`，从不通知 `["profile", userId]`。现在 `invalidateFavoriteCaches` 统一覆盖了三路缓存，加上 `patchFavoriteState` 的即时乐观更新，30 秒 stale 窗口不再是问题。

---

**User**

前端其他的feature和page呢，要重构吗

---

**Cursor**

让我先全面盘点一下当前各 page 的状态。

让我直接读取剩余的页面和组件来精确判断。

盘点完毕，以下是完整情况：

---

## 不需要动的 Page（无 TanStack Query）

| Page | 原因 |
|---|---|
| `LoginPage.jsx` | 手动 async/await + `useState`，不涉及缓存同步 |
| `RegisterPage.jsx` | 同上 |

---

## 已完成的

| Domain | 已完成 |
|---|---|
| `favorites/` | `useFavoritesList` + `useFavoriteToggle`，三处 page 都已切换 |

---

## 还没动的 Page

| Page | 行内内容 | 复杂度 |
|---|---|---|
| **`MessagesPage`** | 3 个 query (`conversations`/`messages`/`unreadSummary`) + 2 个 mutation (`send`/`markRead`) | **高** — 最大一坨 |
| **`ProfileSetupPage`** | 3 个 query/mutation (`myProfile` query + `saveMutation` + `avatarMutation`) | 中 |
| **`ProfileDetailPage`** | 1 个 query (`profile` by id) + 1 个 message mutation（fav 已迁走） | 低 |
| **`BrowsePage`** | 1 个 profiles query + pagination（fav 已迁走） | 中 |
| **`HousingPage`** | 2 个 query (`housing` + `linkedHousing`) + 2 个 mutation (`link`/`unlink`) | 中 |
| **`QuestionnairePage`** | 1 个 query + 1 个 mutation | 低 |
| **`MapPage`** | 1 个 query (`mapMarkers`) | 低 |

## Shared 组件里的行内 query

| 组件 | 内容 | 问题 |
|---|---|---|
| **`Navbar`** | `["unreadSummary"]` query (5s poll) | **和 `MessagesPage` 重复**，同 key 两次注册 |
| **`NotificationBell`** | `["notifications"]` query (5s poll) + `markRead`/`markAll` mutation | 207 行，完全没拆分 |

---

## 建议优先级

| 优先级 | 做哪些 | 理由 |
|---|---|---|
| **1 (这次就做)** | `messages/` 全套（hooks + queries + page） | 代码量最大、逻辑最复杂、有 Navbar 重复 key，改完效果最明显 |
| **2 (这次就做)** | `notifications/` 全套 | 组件 207 行全堆 query/mutation，架构文档 Section 6.5 明确要求 notification polling 集中化 |
| **3 (后续)** | `profile/` + `browse/` + `questionnaire/` | 逻辑简单、改动量不大，但也没那么急 |
| **4 (后续)** | `housing/` + `map/` | 相对独立，依赖关系少 |

---

## 具体来说，messages + notifications 这次重构完，整个项目的核心数据层就干净了

- **不改 auth**：Login/Register 没用到 TanStack Query，保持原样没问题
- **不改 profile/browse/questionnaire/housing/map 这次也行**：它们各自逻辑不复杂，没有跨页缓存同步问题，当前行内写法是可接受的

要我继续把 **messages + notifications** 也重构掉吗？这两坨做完，项目里最"脏"的 query 代码就清干净了，剩下那些 page 节奏上不赶也行。

---

**User**

好，继续

---

**Cursor**

Let me re-read MessagesPage one more time to nail the exact extraction.

Now I have a clear picture. Let me start creating the messages domain. First, create directories and all query/hook files.

Now creating all messages domain files in parallel:

Now update Navbar.jsx to use the shared hook:

Now notifications domain. Creating all notification files:

Now move NotificationBell and update it to use hooks. I need to read the current file, rewrite it with hooks, and write to the new location, then delete the old one.

Now delete the old file and update Navbar import:

Let me verify Navbar is clean:

Navbar clean — no more `useQuery` or `getUnreadSummary` imports. Now verify all files:

No lints. Let me do a final sanity check on MessagesPage:

重构完成，0 个 lint 错误。以下是本次改动的总结：

---

## Messages Domain

### 新建 7 个文件

| 文件 | 说明 |
|---|---|
| `features/messages/queries/queryKeys.js` | `conversations` / `messages(id)` / `unreadSummary` |
| `features/messages/queries/messageInvalidation.js` | `afterSendMessage(cid)` + `afterMarkRead()` |
| `features/messages/hooks/useConversations.js` | 4s poll，封装 conversations 列表 query |
| `features/messages/hooks/useConversationMessages.js` | 按 `activeId` 获取消息，4s poll，自动 disabled |
| `features/messages/hooks/useUnreadSummary.js` | 4s poll，Navbar 和 MessagesPage 共用同一 hook |
| `features/messages/hooks/useSendMessage.js` | 封装 send mutation + invalidate |
| `features/messages/hooks/useMarkConversationRead.js` | 封装 markRead mutation + `useEffect` ref 去重逻辑 |

### 修改的文件

| 文件 | 改动 |
|---|---|
| `MessagesPage.jsx` | 160 行 → 113 行，删掉全部 `useQuery`/`useMutation`/`useQueryClient`，改用 5 个 hook |
| `Navbar.jsx` | 删除 `useQuery(["unreadSummary"], ...)` + `getUnreadSummary` import，改用 `useUnreadSummary()` |

---

## Notifications Domain

### 新建 6 个文件

| 文件 | 说明 |
|---|---|
| `features/notifications/queries/queryKeys.js` | `all: ["notifications"]` |
| `features/notifications/queries/notificationInvalidation.js` | `invalidateNotifications()` |
| `features/notifications/hooks/useNotifications.js` | 5s poll，返回 `{ data, isLoading, isError }` |
| `features/notifications/hooks/useMarkNotificationRead.js` | 标记单条已读 + invalidate |
| `features/notifications/hooks/useMarkAllNotificationsRead.js` | 标记全部已读 + invalidate |
| `features/notifications/components/NotificationBell.jsx` | 从 `shared/components/` 移入，改用上述 3 个 hook |

### 删除的文件

| 文件 | 说明 |
|---|---|
| `shared/components/NotificationBell.jsx` | 已迁移至 `features/notifications/components/` |

---

## 项目状态总结

| Domain | 状态 |
|---|---|
| `messages/` | ✅ 已重构（hooks + queries） |
| `favorites/` | ✅ 已重构（hooks + queries） |
| `notifications/` | ✅ 已重构（hooks + queries + components） |
| `profile/` | ⏳ 待后续（1 page，无跨页同步问题） |
| `browse/` | ⏳ 待后续（1 page，无跨页同步问题） |
| `questionnaire/` | ⏳ 待后续（1 page，逻辑简单） |
| `housing/` | ⏳ 待后续（2 pages，逻辑独立） |
| `auth/` | ➖ 不需要（未使用 TanStack Query） |

---

**User**

你没把@bruinnest/client/src/features/messages 下的jsx移到component里吧。要用git mv吗

---

**Cursor**

确实，三种 JSX 还平铺在 `features/messages/` 根目录下，`components/` 里只有一个空的 `.gitkeep`。需要用 `git mv` 移进去，同时更新所有 import 引用。

只有 3 处引用需要更新：

- `MessagesPage.jsx` 里 import `ChatPanel` 和 `ConversationList`
- `ChatPanel.jsx` 和 `ConversationList.jsx` 内部的 `import MessageAvatar from "./MessageAvatar"` 因为同目录下相对路径不变，**不需要改**

Now update `MessagesPage.jsx` imports:

搞定。3 个 JSX 文件已通过 `git mv` 移入 `components/`，内部相对 import (`./MessageAvatar`) 不受影响，`MessagesPage.jsx` 的两行 import 也已更新。0 lint 错误。

---

**User**

继续重构吗

---

**Cursor**

剩下的 page 多是单页内使用、没有跨页缓存同步问题，重构收益比 messages/favorites/notifications 小。快速盘点：

| Page | 待提取内容 | 复杂度 | 建议 |
|---|---|---|---|
| `ProfileSetupPage` | `myProfile` query + `saveMutation` + `avatarMutation` | 中 (243行) | **值得做**，3 个 mutation/query 堆一起 |
| `HousingPage` | `housing` + `linkedHousing` query + `link`/`unlink` mutation | 中 (276行) | **值得做**，2Q+2M |
| `BrowsePage` | `["profiles", filters, page]` query | 低 (fav 已迁走) | 可做，但就 1 个 query |
| `ProfileDetailPage` | `["profile", userId]` query + message mutation | 低 (fav 已迁走) | 可做 |
| `QuestionnairePage` | `["questionnaire"]` query + `upsert` mutation | 低 | 可做 |
| `MapPage` | `["mapMarkers", filters]` query | 低 | 可做 |

要不要一波全做了？这 6 个 page 结构都简单，就是 extract query/mutation → hook → update import 的机械操作，一起做完就全部合规了。

---

**User**

都做了

---

**Cursor**

Now creating all profile domain files:

Batch-creating all profile domain files:

Now update ProfileSetupPage and ProfileDetailPage:

Now browse domain:

Now questionnaire domain:

I need to handle the `setJustSaved(true)` that was moved out of the mutation. Let me check and fix:

Now housing domain:

Now update HousingPage:

Now update MapPage:

Now verify everything:

Let me do a final scan to make sure no pages still have inline TanStack Query:

That one is the "Send Message" button's `createOrGetConversation` mutation — no cache interaction, just navigates. Let me extract it too:

I need to add the navigation callback to the page's onClick:

All pages clean — zero TanStack Query imports anywhere in `pages/`. Let me do the final lint sweep:

全部完成，0 lint 错误。以下是 4 个 domain 的完整改动：

---

## profile domain（新建 6 文件，改 2 page）

| 文件 | 说明 |
|---|---|
| `queries/queryKeys.js` | `myProfile` / `detail(userId)` / `all` |
| `queries/profileInvalidation.js` | `afterProfileSave()` — invalideate myProfile + profiles |
| `hooks/useMyProfile.js` | 封装 `getMyProfile` query |
| `hooks/useSaveProfile.js` | 封装 create/update mutation（根据 `isEditing` 自动选） |
| `hooks/useUploadAvatar.js` | 封装 avatar upload mutation |
| `hooks/useProfileDetail.js` | 封装 `getProfileById(userId)` query |

## browse domain（新建 2 文件，改 1 page）

| 文件 | 说明 |
|---|---|
| `queries/queryKeys.js` | `filtered(filters, page)` |
| `hooks/useBrowseProfiles.js` | 封装分页搜索 query（内含 `buildQuery`），带 `placeholderData` |

## questionnaire domain（新建 4 文件，改 1 page）

| 文件 | 说明 |
|---|---|
| `queries/queryKeys.js` | `all: ["questionnaire"]` |
| `queries/questionnaireInvalidation.js` | `afterUpsertQuestionnaire()` — invalideate questionnaire + profiles |
| `hooks/useMyQuestionnaire.js` | 封装 get query |
| `hooks/useUpsertQuestionnaire.js` | 封装 upsert mutation |

## housing domain（新建 7 文件，改 2 page）

| 文件 | 说明 |
|---|---|
| `queries/queryKeys.js` | `filtered(filters,page)` / `linkedHousing` / `mapMarkers(filters)` |
| `queries/housingInvalidation.js` | `afterHousingLinkChange()` |
| `hooks/useSearchHousing.js` | 封装搜索 + 分页 query |
| `hooks/useLinkedHousing.js` | 封装 linked housing query |
| `hooks/useLinkHousing.js` | 封装 link mutation |
| `hooks/useUnlinkHousing.js` | 封装 unlink mutation |
| `hooks/useMapMarkers.js` | 封装地图 markers query |

## 额外 1 个 hook

| `features/messages/hooks/useStartConversation.js` | ProfileDetail 里最后一个 `useMutation`（不涉及 cache）也迁走了 |

## 验证结果

- **pages/ 目录 0 个 TanStack Query import**（LoginPage/RegisterPage 本就不需要）
- **全项目 0 lint 错误**
