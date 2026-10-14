#!/usr/bin/env bash
# scripts/sync-gitee.sh — 把 dist/ 打包成 pages 分支推送到 Gitee Pages（国内访问用）
#
# 用法：
#   GITEE_REMOTE=https://gitee.com/<用户名>/deutschheft.git ./scripts/sync-gitee.sh
# 也可以把 GITEE_REMOTE 写进 git config（推荐）：
#   git config remote.gitee.url "https://gitee.com/<用户名>/deutschheft.git"
#   ./scripts/sync-gitee.sh            # 之后不再需要传环境变量
#
# 前置：已在 Gitee 完成实名认证，并在仓库「管理 → 服务 → Pages」选择分支 pages、目录 /。
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="pages"
PKG="/tmp/dh_gitee"

# 远端优先取环境变量，其次 git config remote.gitee.url
GITEE_REMOTE="${GITEE_REMOTE:-$(git -C "$SRC" config --get remote.gitee.url || true)}"
if [ -z "$GITEE_REMOTE" ]; then
  echo "❌ 未指定 Gitee 远端。" >&2
  echo "   GITEE_REMOTE=https://gitee.com/<用户名>/deutschheft.git $0" >&2
  exit 1
fi

[ -d "$SRC/dist" ] || { echo "❌ 找不到 $SRC/dist，先构建站点"; exit 1; }
[ -f "$SRC/dist/index.html" ] || { echo "❌ dist/index.html 不存在，构建不完整"; exit 1; }

SRC_COMMIT="$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo manual)"

echo "==> 打包 dist/ → $PKG ($(du -sh "$SRC/dist" | cut -f1))"
rm -rf "$PKG"; mkdir -p "$PKG"
cp -a "$SRC/dist/." "$PKG/"

cd "$PKG"
[ -d .git ] || git init -q -b "$BRANCH"
printf ".DS_Store\n" > .gitignore
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-Jian Wu}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-Jian.Wu@mpi-bn.mpg.de}" \
    commit -q -m "chore(static): build for Gitee Pages @ ${SRC_COMMIT}" || echo "（无变化可提交）"

echo "==> 推送到 $GITEE_REMOTE ($BRANCH)"
git push -f "$GITEE_REMOTE" "$BRANCH"

# 从 https://gitee.com/<user>/<repo>.git 解析出 user / repo
GITEE_USER="$(echo "$GITEE_REMOTE" | sed -nE 's#.*gitee\.com[:/]+([^/]+)/.*#\1#p')"
GITEE_REPO="$(echo "$GITEE_REMOTE" | sed -nE 's#.*gitee\.com[:/]+[^/]+/([^/.]+).*#\1#p')"

if [ -n "$GITEE_USER" ] && [ -n "$GITEE_REPO" ]; then
  cat <<EOF

✅ 已推送。Gitee Pages 部署地址：
   https://${GITEE_USER}.gitee.io/${GITEE_REPO}/

提示：首次需在 Gitee 仓库「管理 → 服务 → Pages」选择分支 ${BRANCH}、目录 / ，保存后等 1–2 分钟生效。
EOF
else
  cat <<EOF

✅ 已推送到 $GITEE_REMOTE ($BRANCH)
提示：首次需在 Gitee 仓库「管理 → 服务 → Pages」选择分支 ${BRANCH}、目录 / 。
Gitee Pages 地址形如：https://<你的用户名>.gitee.io/<仓库名>/
EOF
fi
