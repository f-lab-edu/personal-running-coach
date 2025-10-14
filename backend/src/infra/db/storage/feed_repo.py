from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import aliased
from uuid import UUID
from typing import List, Tuple



from infra.db.orm.models import FeedLikes, Feed
from config.exceptions import DBError


# Feed CRUD
async def create_feed(db: AsyncSession, feed:Feed) -> bool:
	try:
		db.add(feed)
		await db.commit()
		await db.refresh(feed)
		return True
	except Exception as e:
		await db.rollback()
		raise DBError(context=f"[create_feed] failed user_id={feed.user_id}", original_exception=e)

async def update_feed(db: AsyncSession, feed_id: UUID, title: str = None, train_summary: str = None, note: str = None) -> Feed:
	try:
		res = await db.execute(select(Feed).where(Feed.id == feed_id))
		feed = res.scalar_one_or_none()
		if not feed:
			return None
		if title is not None:
			feed.title = title
		if train_summary is not None:
			feed.train_summary = train_summary
		if note is not None:
			feed.note = note
		await db.commit()
		await db.refresh(feed)
		return feed
	except Exception as e:
		await db.rollback()
		raise DBError(context=f"[update_feed] failed feed_id={feed_id}", original_exception=e)

async def delete_feed(db: AsyncSession, feed_id: UUID) -> bool:
	try:
		res = await db.execute(select(Feed).where(Feed.id == feed_id))
		feed = res.scalar_one_or_none()
		if not feed:
			return False
		await db.delete(feed)
		await db.commit()
		return True
	except Exception as e:
		await db.rollback()
		raise DBError(context=f"[delete_feed] failed feed_id={feed_id}", original_exception=e)

async def get_feed(db: AsyncSession, feed_id: UUID) -> Feed | None:
	try:
		res = await db.execute(select(Feed).where(Feed.id == feed_id))
		return res.scalar_one_or_none()
	except Exception as e:
		raise DBError(context=f"[get_feed] failed feed_id={feed_id}", original_exception=e)

async def get_feeds(db: AsyncSession, offset: int = 0, limit: int = 10) -> list[Feed]:
	try:
		res = await db.execute(select(Feed).order_by(Feed.created_at.desc()).offset(offset).limit(limit))
		return res.scalars().all()
	except Exception as e:
		raise DBError(context=f"[get_feeds] failed", original_exception=e)
	


async def get_feeds_with_likes(
    db: AsyncSession,
    current_user_id: UUID,
    offset: int = 0,
    limit: int = 20
) -> List[Tuple[Feed, int, bool]]:
    """
    Feed 리스트 + likes_count + my_like를 한 번의 쿼리로 가져오기
    반환: List of Tuple(Feed, likes_count, my_like)
    """
    try:
        FL = aliased(FeedLikes)
        stmt = (
            select(
                Feed,
                func.count(FL.id).label("likes_count"),
                func.bool_or(FL.user_id == current_user_id).label("my_like")
            )
            .outerjoin(FL, FL.feed_id == Feed.id)
            .group_by(Feed.id)
            .order_by(Feed.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        res = await db.execute(stmt)
        return res.all()  # [(Feed, likes_count, my_like), ...]
    except Exception as e:
        raise DBError(context="[get_feeds_with_likes] failed", original_exception=e)



# FeedLikes CRUD
async def create_feed_like(db: AsyncSession, feed_id: UUID, user_id: UUID) -> bool:
	try:
		feed_like = FeedLikes(feed_id=feed_id, user_id=user_id)
		db.add(feed_like)
		await db.commit()
		await db.refresh(feed_like)
		return feed_like
	except Exception as e:
		await db.rollback()
		raise DBError(context=f"[create_feed_like] failed feed_id={feed_id}, user_id={user_id}", original_exception=e)

async def delete_feed_like(db: AsyncSession, feed_id: UUID, user_id: UUID) -> bool:
	try:
		res = await db.execute(select(FeedLikes).where(and_(FeedLikes.feed_id == feed_id, FeedLikes.user_id == user_id)))
		feed_like = res.scalar_one_or_none()
		if not feed_like:
			return False
		await db.delete(feed_like)
		await db.commit()
		return True
	except Exception as e:
		await db.rollback()
		raise DBError(context=f"[delete_feed_like] failed feed_id={feed_id}, user_id={user_id}", original_exception=e)