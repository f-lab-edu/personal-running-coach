from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from schemas.models import FeedResponse
from datetime import datetime

from ports.feed_port import FeedPort
from infra.db.storage import feed_repo as repo
from infra.db.orm.models import Feed, FeedLikes
from config.exceptions import CustomError, InternalError

class FeedAdapter(FeedPort):
    def __init__(self, db:AsyncSession):
        self.db = db

    async def create_feed(self,
                            user_id: UUID,
                            title: str,
                            train_date: datetime,
                            train_summary: str,
                            note: Optional[str] = None,
                        ) -> bool:
        '''피드 생성'''
        try:
            feed = Feed(
                user_id=user_id,
                train_date=train_date,
                title=title,
                train_summary=train_summary,
                note=note
            )
            return await repo.create_feed(db=self.db,feed=feed)

        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error create_feed", original_exception=e)


    async def update_feed(
        self,
        feed_id: UUID,
        title: Optional[str] = None,
        train_summary: Optional[str] = None,
        note: Optional[str] = None
    ) -> FeedResponse:
        '''피드 수정'''
        ...

    async def delete_feed(self, feed_id: UUID) -> bool:
        '''피드 삭제'''
        try:
            return await repo.delete_feed(feed_id=feed_id)
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error delete_feed", original_exception=e)



    async def get_feed(self, feed_id: UUID, user_id: UUID) -> FeedResponse:
        '''피드 받기'''
        ...

    async def get_feeds_with_likes(
        self,
        user_id: UUID,
        offset: int = 0,
        limit: int = 20
    ) -> List[FeedResponse]:
        '''피드 리스트 받기'''
        try:
            feeds = await repo.get_feeds_with_likes(
                                    db=self.db,
                                    current_user_id=user_id,
                                    offset=offset,
                                    limit=limit
                                    )
            
            res = [
                FeedResponse(
                    feed_id=feed.id,
                    user_id=feed.user_id,
                    created_at=feed.created_at,
                    train_date=feed.train_date,
                    title=feed.title,
                    train_summary=feed.train_summary,
                    note=feed.note,
                    likes_count=likes,
                    my_like=my_like,
                )
                for (feed, likes, my_like) in feeds
            ]
                    
            return res

        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error get_feeds_with_likes", original_exception=e)
        

    async def create_feed_like(self, user_id: UUID, feed_id: UUID) -> bool:
        '''피드 좋아요'''
        try:
            return await repo.create_feed_like(db=self.db,
                                               user_id=user_id,
                                               feed_id=feed_id
                                               )
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error get_feeds_with_likes", original_exception=e)

    async def delete_feed_like(self, user_id: UUID, feed_id: UUID) -> bool:
        '''피드 좋아요 해제'''
        try:
            return await repo.delete_feed_like(db=self.db,
                                               user_id=user_id,
                                               feed_id=feed_id
                                               )
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error get_feeds_with_likes", original_exception=e)
        
