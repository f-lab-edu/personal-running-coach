import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeeds, likeFeed, unlikeFeed, deleteFeed } from '../api';
import type { FeedResponse } from '../types';

interface FeedPageProps {
    user: any; // 나중에 구체적인 타입으로 바꾸는 게 좋음
}

const FeedPage: React.FC<FeedPageProps> = ({user}) => {
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    loadFeeds();
  }, [user, page]);

  const loadFeeds = async () => {
    if (!user) return; 
    setLoading(true);
    setError(null);
    try {
      const { status, data } = await fetchFeeds(pageSize, page);
      if (status === 200) setFeeds(data);
      else setError('Failed to fetch feeds');
    } catch (e: any) {
      setError(e.message || 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (feed_id: string) => {
    try {
      await likeFeed(feed_id);
      loadFeeds();
    } catch (e) {
      setError('Failed to like feed');
    }
  };

  const handleUnlike = async (feed_id: string) => {
    try {
      await unlikeFeed(feed_id);
      loadFeeds();
    } catch (e) {
      setError('Failed to unlike feed');
    }
  };

  const handleDelete = async (feed_id: string) => {
    if (!window.confirm('Delete this feed?')) return;
    try {
      await deleteFeed(feed_id);
      loadFeeds();
    } catch (e) {
      setError('Failed to delete feed');
    }
  };

  return (
    <main className="content-area">
      <div className="container">
        <div className="card">
          <h2>Feed</h2>
          {/* Removed Add Feed button */}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
                {feeds.map(feed => (
                  <div key={feed.feed_id} className="card" style={{ position: 'relative' }}>
                    {user && user.id && feed.user_id === user.id && (
                      <button
                        onClick={() => handleDelete(feed.feed_id)}
                        title="Delete"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.5 2h3a.5.5 0 0 1 .5.5V3h3a.5.5 0 0 1 0 1h-.5v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V4H2.5a.5.5 0 0 1 0-1h3v-.5A.5.5 0 0 1 6.5 2zm-2 2v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4h-7zm2.5 2a.5.5 0 0 1 1 0v5a.5.5 0 0 1-1 0V6zm2 0a.5.5 0 0 1 1 0v5a.5.5 0 0 1-1 0V6z" fill="#d33"/>
                        </svg>
                      </button>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{feed.title}</span>
                      <span style={{ color: '#1976d2', fontWeight: 500, marginTop: 15 }}>{feed.user_name}</span>
                    </div>

                    <div style={{ color: '#555', marginBottom: 8 }}>{feed.train_summary}</div>
                    <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>{feed.note || '-'}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{feed.likes_count} Likes</span>
                      {feed.my_like ? (
                        <button className="btn btn--ghost" onClick={() => handleUnlike(feed.feed_id)}>Unlike</button>
                      ) : (
                        <button className="btn" onClick={() => handleLike(feed.feed_id)}>Like</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                <button className="btn" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
                <span>Page {page}</span>
                <button className="btn" onClick={() => setPage(page + 1)} disabled={feeds.length < pageSize}>Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default FeedPage;
