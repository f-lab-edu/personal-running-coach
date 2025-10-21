import React from "react";

const MainPage: React.FC = () => {
  return (
    <div className="app-root">

      <main className="content-area">
        <section className="hero">
          <div className="container hero-inner">
            <div className="card hero-card">
              <h1 className="hero-title">개인 러닝 훈련 플래너</h1>
              <p className="hero-lead">목표 거리, 체력 수준, 대회 일정에 맞춘 주간 훈련 플랜을 AI가 제안합니다. 실적 분석과 코칭 피드백까지 한 곳에서 관리하세요.</p>
              <div style={{marginTop:18, display:'flex', gap:12, flexWrap:'wrap'}}>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mt-8" style={{display: "flex",flexDirection: "column",}}>
          <h2 className="page-title">주요 기능</h2>

          <div className="grid features-grid">
            <div className="card feature-card">
              <div className="feature-icon">🎯</div>
              <h3>맞춤형 훈련</h3>
              <p className="hint">목표, 일정, 가용 시간을 입력하면 주간/월간 플랜을 생성합니다.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">📊</div>
              <h3>성과 분석</h3>
              <p className="hint">주간 통계와 피로도 추세를 통해 계획을 보정할 수 있습니다.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI 코칭</h3>
              <p className="hint">러닝 데이터를 학습한 모델이 개인별 조언을 제공합니다.</p>
            </div>
            
            <div className="card feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Strava 데이터 연동</h3>
              <p className="hint">Strava 계정을 연결해 활동 기록을 자동으로 가져오고 분석에 반영합니다.</p>
            </div>
          </div>
        </section>
        <br /><br /><br />
        <section id="about" className="container mt-8">
          <div className="card">
            <h3 className="page-title">간단한 소개</h3>
            <p className="page-sub">Personal Running Coach는 러닝 데이터를 중심으로 한 개인화 훈련 도구입니다. 트레이닝 계획 생성, 세션 기록, 목표 관리, 그리고 AI 기반 피드백까지 포함합니다.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <div className="hint">© 2025 Personal Running Coach</div>
            <div className="hint">문의: support@prc.example</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
