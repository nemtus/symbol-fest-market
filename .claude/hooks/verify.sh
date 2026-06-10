#!/usr/bin/env bash
# Stop フック: このセッションでソースに変更があった場合だけ、プロジェクトの
# フルゲート（lint / format:check / typecheck / test / build）を実行して検証する。
# いずれか失敗したら decision:block を返してモデルに修正を促す。
# ソース変更が無いターン（純粋な会話など）では即 exit 0 して終了を妨げない。
#
# 無限ループ対策: stop_hook_active が true（=この block による継続）のときは
#                再検証せず exit 0 する。最終的な担保は CI 側のゲート。
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

input="$(cat)"
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then
  exit 0
fi

# 検証結果に影響するファイルが変わったときだけ走らせる（追跡/未追跡の両方）
changed="$(git status --porcelain -- \
  src functions/src \
  package.json package-lock.json \
  functions/package.json functions/package-lock.json \
  tsconfig.json functions/tsconfig.json \
  .eslintrc.json .prettierrc.json 2>/dev/null)"
[ -z "$changed" ] && exit 0

fails=()
run() { # $1=ラベル, $2..=コマンド
  local label="$1"
  shift
  if ! "$@" >"/tmp/verify-${label}.log" 2>&1; then
    fails+=("$label")
  fi
}

run lint npm run lint
run format npm run format:check
run typecheck npm run typecheck
run test npm test
run build npm run build

# functions/ に変更があるときだけ functions の型/ビルドも検証
if printf '%s' "$changed" | grep -q 'functions/'; then
  run functions-build npm --prefix functions run build
fi

[ ${#fails[@]} -eq 0 ] && exit 0

reason="検証で失敗したチェックがあります: ${fails[*]}。修正してから完了してください（詳細ログ: /tmp/verify-<check>.log）。"
jq -n --arg r "$reason" '{decision:"block", reason:$r}'
exit 0
