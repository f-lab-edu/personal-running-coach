#!/bin/bash
set -e

# 새 이미지 빌드
echo "1. 새 이미지 빌드 중..."
docker compose build

# echo "2. db  재시작은 서비스 끊길 수 있어서 불필요." 
# docker compose up -d db
# docker compose up -d redis

# 2.5 Alembic DB 마이그레이션
echo "=== Alembic DB Migration 시작 ==="
docker compose exec app1 alembic upgrade head

# echo "3. nginx 설정 재로드..."
docker compose exec nginx nginx -s reload


# 무중단 배포 스크립트
# 한 서버씩 순차적으로 재배포
echo "=== 서버 무중단 배포 시작 ==="
# app1 배포
echo ""
echo "2. app1 배포 시작..."
echo "   - app1 Graceful Shutdown 시작 (SIGTERM 전송)"
docker-compose stop -t 30 app1

echo "   - app1 재시작"
docker-compose up -d app1

echo "   - app1 헬스체크 대기 (최대 30초)"
timeout=30
elapsed=0
until curl -f http://localhost:8001/health >/dev/null 2>&1 || [ $elapsed -ge $timeout ]; do
    sleep 1
    elapsed=$((elapsed + 1))
    echo "     대기 중... ${elapsed}초"
done

if [ $elapsed -ge $timeout ]; then
    echo "   - 오류: app1 헬스체크 실패!"
    exit 1
fi

echo "   - app1 배포 완료!"

# 중간 대기 (안정화)
echo ""
echo "3. 잠시 대기 중 (20초)..."
sleep 20

# app2 배포
echo ""
echo "4. app2 배포 시작..."
echo "   - app2 Graceful Shutdown 시작 (SIGTERM 전송)"
docker-compose stop -t 30 app2

echo "   - app2 재시작"
docker-compose up -d app2

echo "   - app2 헬스체크 대기 (최대 30초)"
timeout=30
elapsed=0
until curl -f http://localhost:8002/health >/dev/null 2>&1 || [ $elapsed -ge $timeout ]; do
    sleep 1
    elapsed=$((elapsed + 1))
    echo "     대기 중... ${elapsed}초"
done

if [ $elapsed -ge $timeout ]; then
    echo "   - 오류: app2 헬스체크 실패!"
    exit 1
fi

echo "   - app2 배포 완료!"

echo ""
echo "=== 무중단 배포 완료! ==="
echo "모든 서버가 정상적으로 재시작되었습니다."