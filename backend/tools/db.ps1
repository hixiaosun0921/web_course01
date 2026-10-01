param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('init', 'start', 'stop', 'status', 'createdb', 'psql')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'

# 本机免安装 PostgreSQL 17（不写系统服务，仅当前用户使用）
$PGSQL_HOME = 'C:\Users\18835\tools\pgsql'
$PG_DATA    = 'C:\Users\18835\tools\pgdata'
$PG_LOG     = Join-Path $PG_DATA 'postgres.log'
$DB_NAME    = 'course_select'

$env:PGPASSWORD = 'postgres'

switch ($Action) {
  'init' {
    if (Test-Path (Join-Path $PG_DATA 'PG_VERSION')) {
      Write-Output "数据目录已初始化：$PG_DATA"
      break
    }
    $pwFile = Join-Path $env:TEMP 'pg-pw.txt'
    Set-Content -Path $pwFile -Value 'postgres' -NoNewline -Encoding ASCII
    & "$PGSQL_HOME\bin\initdb.exe" -D $PG_DATA -U postgres -E UTF8 -A scram-sha-256 --pwfile=$pwFile
    Remove-Item $pwFile -Force
    Write-Output '初始化完成'
  }
  'start' {
    & "$PGSQL_HOME\bin\pg_ctl.exe" -D $PG_DATA -l $PG_LOG start
  }
  'stop' {
    & "$PGSQL_HOME\bin\pg_ctl.exe" -D $PG_DATA stop
  }
  'status' {
    & "$PGSQL_HOME\bin\pg_ctl.exe" -D $PG_DATA status
  }
  'createdb' {
    $exists = & "$PGSQL_HOME\bin\psql.exe" -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'"
    if ($exists -eq '1') {
      Write-Output "数据库已存在：$DB_NAME"
      break
    }
    & "$PGSQL_HOME\bin\createdb.exe" -U postgres -E UTF8 $DB_NAME
    Write-Output "已创建数据库：$DB_NAME"
  }
  'psql' {
    & "$PGSQL_HOME\bin\psql.exe" -U postgres -d $DB_NAME
  }
}
