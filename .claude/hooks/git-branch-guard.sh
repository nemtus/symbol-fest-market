#!/usr/bin/env bash
# PreToolUse(Bash) hook: route git commit/push/merge through `ask` when they
# target the `main` branch, and `allow` them otherwise.
#
# Decision rules:
#   commit / merge -> act on the CURRENT branch  -> ask iff current branch is main
#   push           -> ask if the command names `main` explicitly, or it's a bare
#                     `git push` while the current branch is main
#   force push     -> emit no decision, so the static deny rule still blocks it
# Anything that isn't a git commit/push/merge: emit nothing and let the static
# allow/ask/deny rules decide.

set -euo pipefail

MAIN_BRANCH="main"

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"

emit() { # $1=decision (allow|ask)  $2=reason
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}'
  exit 0
}

current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

matched=false
ask=false

# commit -> current branch
if printf '%s' "$cmd" | grep -Eq '\bgit\b.*\bcommit\b'; then
  matched=true
  [ "$current_branch" = "$MAIN_BRANCH" ] && ask=true
fi

# merge -> current branch
if printf '%s' "$cmd" | grep -Eq '\bgit\b.*\bmerge\b'; then
  matched=true
  [ "$current_branch" = "$MAIN_BRANCH" ] && ask=true
fi

# push -> remote target branch
if printf '%s' "$cmd" | grep -Eq '\bgit\b.*\bpush\b'; then
  # Force pushes: defer to the static deny rule (never auto-allow).
  if printf '%s' "$cmd" | grep -Eq -- '(--force([^-]|$)|--force-with-lease|[[:space:]]-f([[:space:]]|$))'; then
    exit 0
  fi
  matched=true
  if printf '%s' "$cmd" | grep -Eq "(^|[[:space:]:/])${MAIN_BRANCH}([[:space:]:]|$)"; then
    ask=true                                   # explicitly names main (e.g. `origin main`, `HEAD:main`)
  else
    # Count positional args after `push` (skip option flags). 2+ => an explicit
    # refspec was given (remote + branch); since it isn't main, it targets some
    # other branch -> allow. 0-1 => bare push, which uses the current branch.
    set -f
    read -ra _push_args <<<"${cmd#*push}"
    set +f
    positionals=0
    for w in "${_push_args[@]}"; do
      case "$w" in -*) ;; *) positionals=$((positionals + 1)) ;; esac
    done
    if [ "$positionals" -lt 2 ] && [ "$current_branch" = "$MAIN_BRANCH" ]; then
      ask=true                                 # bare `git push` while on main
    fi
  fi
fi

[ "$matched" = false ] && exit 0               # not a git commit/push/merge -> static rules apply

if [ "$ask" = true ]; then
  emit "ask" "git operation targets the ${MAIN_BRANCH} branch — confirm before proceeding"
else
  emit "allow" "git operation targets a non-${MAIN_BRANCH} branch (current: ${current_branch:-unknown})"
fi
