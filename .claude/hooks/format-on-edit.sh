#!/usr/bin/env bash
# PostToolUse(Write|Edit) hook: 編集された src 配下のソースを、プロジェクトの
# Prettier で即整形する。生成/編集コードを常にリポジトリのスタイルに揃えるため。
# 対象は src/**.{js,jsx,ts,tsx} のみ。ツール呼び出しは絶対に失敗させない（常に exit 0）。
# Lint/型/テスト/ビルドの本格検証は Stop フック（verify.sh）と CI が担う。
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

input="$(cat)"
f="$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty' 2>/dev/null)"
[ -z "$f" ] && exit 0

# src 配下のソースファイルだけを対象にする
case "$f" in
  *src/*.js | *src/*.jsx | *src/*.ts | *src/*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

prettier="./node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0
"$prettier" --write "$f" >/dev/null 2>&1 || true
exit 0
