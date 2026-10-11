#!/usr/bin/env bash
#
# KungaCV dev orchestrator — install / build / test / run the three packages
# without doing it by hand.
#
#   ./start.sh install        install deps for all packages
#   ./start.sh build          build all packages
#   ./start.sh test           run backend jest + lint all packages
#   ./start.sh lint           lint only
#   ./start.sh run            start all servers (background, logs in .logs/)
#   ./start.sh dev            alias for `run`
#   ./start.sh all            install + build + test + run
#   ./start.sh status         which servers are up
#   ./start.sh logs [svc]     tail logs (svc: backend|client|admin)
#   ./start.sh stop [svc]     stop servers (default: all)
#   ./start.sh clean          remove logs, pid files and build output
#   ./start.sh reinstall      force a fresh `npm install` in all packages
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
CLIENT="$ROOT/frontend/flowcv_client"
ADMIN="$ROOT/frontend/flowcv_admin"

RUN_DIR="$ROOT/.run"
LOG_DIR="$ROOT/.logs"

# Port collision: backend and admin both default to 3000, so admin is pinned to 3002.
BACKEND_PORT="${BACKEND_PORT:-3000}"
CLIENT_PORT="${CLIENT_PORT:-3001}"
ADMIN_PORT="${ADMIN_PORT:-3002}"

SERVICES=(backend client admin)

# ---------------------------------------------------------------- helpers ----

if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_BLUE=$'\033[34m'
else
  C_RESET=""; C_DIM=""; C_BOLD=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""
fi

log()  { printf '%s==>%s %s\n' "$C_BLUE"   "$C_RESET" "$*"; }
ok()   { printf '%s ok %s %s\n' "$C_GREEN"  "$C_RESET" "$*"; }
warn() { printf '%swarn%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
err()  { printf '%serr %s %s\n' "$C_RED"    "$C_RESET" "$*" >&2; }
die()  { err "$*"; exit 1; }

banner() {
  printf '\n%s┌─ KungaCV ─ %s%s\n' "$C_BOLD" "$*" "$C_RESET"
}

need() { command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"; }

svc_dir() {
  case "$1" in
    backend) echo "$BACKEND" ;;
    client)  echo "$CLIENT" ;;
    admin)   echo "$ADMIN" ;;
    *) die "unknown service: $1 (backend|client|admin)" ;;
  esac
}

svc_port() {
  case "$1" in
    backend) echo "$BACKEND_PORT" ;;
    client)  echo "$CLIENT_PORT" ;;
    admin)   echo "$ADMIN_PORT" ;;
  esac
}

svc_cmd() {
  case "$1" in
    backend) echo "npm run start:dev" ;;
    client)  echo "npm run dev -- -p $CLIENT_PORT" ;;
    admin)   echo "npm run dev -- -p $ADMIN_PORT" ;;
  esac
}

pid_file() { echo "$RUN_DIR/$1.pid"; }
log_file() { echo "$LOG_DIR/$1.log"; }

is_running() {
  local f; f="$(pid_file "$1")"
  [[ -f "$f" ]] && kill -0 "$(cat "$f")" 2>/dev/null
}

port_in_use() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$1" 2>/dev/null | grep -q LISTEN
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

# Installs only when node_modules is missing, unless forced.
ensure_deps() {
  local dir="$1" name="$2" force="${3:-}"
  if [[ -z "$force" && -d "$dir/node_modules" ]]; then
    ok "$name deps present"
    return
  fi
  log "installing $name deps"
  (cd "$dir" && npm install --no-audit --no-fund) || die "npm install failed for $name"
  ok "$name deps installed"
}

# --------------------------------------------------------------- commands ----

cmd_install() {
  local force="${1:-}"
  banner "install"
  need npm
  for s in "${SERVICES[@]}"; do ensure_deps "$(svc_dir "$s")" "$s" "$force"; done
  mkdir -p "$RUN_DIR" "$LOG_DIR"
}

cmd_reinstall() { cmd_install "force"; }

cmd_build() {
  banner "build"
  need npm
  local failed=0
  for s in "${SERVICES[@]}"; do
    local dir; dir="$(svc_dir "$s")"
    log "building $s"
    if (cd "$dir" && npm run build) >"$(log_file "$s-build")" 2>&1; then
      ok "$s build"
    else
      failed=1
      err "$s build failed — see $(log_file "$s-build")"
      tail -n 30 "$(log_file "$s-build")" >&2 || true
    fi
  done
  [[ $failed -eq 0 ]] || die "one or more builds failed"
}

cmd_test() {
  banner "test"
  need npm
  local failed=0

  log "backend: jest"
  if (cd "$BACKEND" && npm test) >"$(log_file backend-test)" 2>&1; then
    ok "backend tests"
  else
    failed=1
    err "backend tests failed — see $(log_file backend-test)"
    tail -n 40 "$(log_file backend-test)" >&2 || true
  fi

  cmd_lint || failed=1
  [[ $failed -eq 0 ]] || die "tests/lint failed"
}

cmd_lint() {
  banner "lint"
  need npm
  local failed=0
  for s in "${SERVICES[@]}"; do
    local dir; dir="$(svc_dir "$s")"
    log "linting $s"
    if (cd "$dir" && npm run lint) >"$(log_file "$s-lint")" 2>&1; then
      ok "$s lint"
    else
      failed=1
      err "$s lint failed — see $(log_file "$s-lint")"
      tail -n 30 "$(log_file "$s-lint")" >&2 || true
    fi
  done
  [[ $failed -eq 0 ]]
}

cmd_run() {
  banner "run"
  need npm
  mkdir -p "$RUN_DIR" "$LOG_DIR"
  cmd_install

  for s in "${SERVICES[@]}"; do
    if is_running "$s"; then
      warn "$s already running (pid $(cat "$(pid_file "$s")"))"
      continue
    fi
    local port; port="$(svc_port "$s")"
    if port_in_use "$port"; then
      warn "port $port for $s is already in use by something else — skipping"
      continue
    fi

    local dir; dir="$(svc_dir "$s")"
    local cmd; cmd="$(svc_cmd "$s")"
    log "starting $s on :$port"
    # shellcheck disable=SC2086
    ( cd "$dir" && nohup $cmd </dev/null >"$(log_file "$s")" 2>&1 & echo $! >"$(pid_file "$s")" )
    sleep 1
    ok "$s -> http://localhost:$port  (log: $(log_file "$s"))"
  done

  printf '\n'
  cmd_status
  cat <<EOF

  ${C_DIM}tail logs:   ./start.sh logs <backend|client|admin>${C_RESET}
  ${C_DIM}stop all:    ./start.sh stop${C_RESET}

EOF
}

cmd_status() {
  banner "status"
  printf '  %-8s %-7s %-6s %s\n' "SERVICE" "PORT" "PID" "STATE"
  for s in "${SERVICES[@]}"; do
    local port pid state
    port="$(svc_port "$s")"
    if is_running "$s"; then
      pid="$(cat "$(pid_file "$s")")"
      state="${C_GREEN}running${C_RESET}"
    elif port_in_use "$port"; then
      pid="-"
      state="${C_YELLOW}port busy (external)${C_RESET}"
    else
      pid="-"
      state="${C_DIM}stopped${C_RESET}"
    fi
    printf '  %-8s %-7s %-6s %b\n' "$s" "$port" "$pid" "$state"
  done
  printf '\n'
}

cmd_logs() {
  local s="${1:-}"
  [[ -d "$LOG_DIR" ]] || die "no logs yet — run ./start.sh run first"
  if [[ -z "$s" ]]; then
    need tail
    tail -n 100 -f "$LOG_DIR"/*.log
    return
  fi
  svc_dir "$s" >/dev/null   # validates name
  [[ -f "$(log_file "$s")" ]] || die "no log for $s yet — is it running?"
  exec tail -n 200 -f "$(log_file "$s")"
}

cmd_stop() {
  banner "stop"
  local targets=("$@")
  [[ ${#targets[@]} -eq 0 ]] && targets=("${SERVICES[@]}")
  for s in "${targets[@]}"; do
    svc_dir "$s" >/dev/null
    if ! is_running "$s"; then
      warn "$s not running"
      continue
    fi
    local pid; pid="$(cat "$(pid_file "$s")")"
    log "stopping $s (pid $pid)"
    # kill the whole process group so `npm` passes the signal to next/nest
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.25
    done
    kill -0 "$pid" 2>/dev/null && { warn "forcing $s"; kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true; }
    rm -f "$(pid_file "$s")"
    ok "$s stopped"
  done
}

cmd_clean() {
  banner "clean"
  cmd_stop || true
  rm -rf "$RUN_DIR" "$LOG_DIR"
  rm -rf "$BACKEND/dist" "$BACKEND/coverage" \
         "$CLIENT/.next" "$ADMIN/.next" "$ADMIN/tsconfig.tsbuildinfo"
  ok "removed logs, pid files and build output"
}

cmd_all() {
  cmd_install
  cmd_build
  cmd_test
  cmd_run
}

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
}

# ----------------------------------------------------------------- dispatch ---

main() {
  local cmd="${1:-help}"
  shift || true
  case "$cmd" in
    install|deps) cmd_install "$@" ;;
    reinstall)    cmd_reinstall "$@" ;;
    build)        cmd_build "$@" ;;
    test)         cmd_test "$@" ;;
    lint)         cmd_lint "$@" ;;
    run|dev|up)   cmd_run "$@" ;;
    all)          cmd_all "$@" ;;
    status|st)    cmd_status "$@" ;;
    logs|log)     cmd_logs "$@" ;;
    stop|down)    cmd_stop "$@" ;;
    clean)        cmd_clean "$@" ;;
    help|-h|--help) usage ;;
    *) usage; die "unknown command: $cmd" ;;
  esac
}

# Run every service in its own process group so `stop` can kill the whole tree.
set -m
main "$@"
