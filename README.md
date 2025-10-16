# 🏃 Personal Running Coach

- https://coach4runners.me
- 사용자의 러닝 기록과 목표를 기반으로 **맞춤형 훈련 스케줄**과 **AI 코칭 피드백**을 제공하는 웹 서비스 
- 백엔드 중심 아키텍처로 설계되었으며, 프론트엔드는 기본 기능 확인용 UI를 제공합니다.  

---

## 📌 주요 기능
- 사용자 프로필 관리 (회원가입 / 로그인 / 구글 OAuth)
- 서드 파티 훈련 데이터 사용 (스트라바 OAuth)
- 훈련 데이터 저장 (PostgreSQL)
- AI 기반 맞춤형 훈련 스케줄 및 코치 조언 생성 (LLM)
- 피드 게시판 / 커뮤니티 기능
- 캐시 및 세션 관리 (Redis)
- 도커 기반 배포 환경
---

## 🏗️ 프로젝트 아키텍처
```
[Client(Browser)]
        ↓
[Frontend(React, Vite)] 
        ↓
[Nginx + Certbot(SSL, Reverse Proxy, Static Serving)]
        ↓
[Backend (FastAPI app1,app2)] → [DB(PostgreSQL)]
                            ↘ [Redis]
                            ↘ [LLM(OpenAI)]
```  
- **Nginx** → 정적 파일 제공 + 백엔드 리버스 프록시 + 로드밸런싱
- **Certbot** → SSL 인증서 자동 발급/갱신
- **Docker** → 컨테이너 기반 배포
- **Backend**: FastAPI 기반, 포트 & 아답터 아키텍처
- **Frontend**: React(Vite) / 기본 구현
- **Database**: PostgreSQL
- **Cache 관리**: Redis
- **LLM**: OpenAI API

---

## 백엔드 포트&아답터 아키텍쳐
![백엔드구조](backend/doc/structure_final.jpg)


## ⚙️ 설치 및 실행 방법
```
// 프론트 파일 빌드
cd frontend
npm run build

```
```
// 도커 실행
docker compose -f 'docker-compose.dev.yml' up --build -d
```


#### 환경 변수 설정
`backend/src/.env` 파일 생성: env.example 확인



## 🛠️ 기술 스택
- **Backend** : Python, FastAPI
  - 로드밸런싱 : 백엔드 2개 인스턴스 운영, Nginx 기반 리버스 프록시
  - 무중단 배포 : Docker + GitHub Actions + Nginx Blue/Green 전략
  
- **Frontend** : React, Vite
- **Database** : PostgreSQL
  - 버전 관리/마이그레이션 : Alembic
- **Cache** : Redis (세션 + etag 관리)
- **Infra & Deployment** : Docker, Nginx, Certbot(SSL), GitHub Actions(CI/CD)
- **LLM** : OpenAI API

---

## 🚀 TODO / 개선 예정
- [ ] 프론트엔드 UI 개선 (대시보드/훈련 결과 시각화)
- [ ] 훈련 스케줄 추천 프롬프트 고도화 (AI 코칭 정확도 향상)
- [ ] Prometheus/Grafana 모니터링 연동
- [ ] 서드파티 추가 (가민/코로스 등)
---

## 📄 라이선스
MIT License
