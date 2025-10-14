from abc import ABC, abstractmethod
from uuid import UUID
from typing import List, Optional
from schemas.models import FeedResponse
from datetime import datetime

class FeedPort(ABC):

    @abstractmethod
    async def create_feed(
        self,
        user_id: UUID,
        title: str,
        train_date: datetime,
        train_summary: str,
        note: Optional[str] = None,
    ) -> FeedResponse:
        '''피드 생성'''
        ...

    @abstractmethod
    async def update_feed(
        self,
        feed_id: UUID,
        title: Optional[str] = None,
        train_summary: Optional[str] = None,
        note: Optional[str] = None
    ) -> FeedResponse:
        '''피드 수정'''
        ...

    @abstractmethod
    async def delete_feed(self, feed_id: UUID) -> bool:
        '''피드 삭제'''
        ...

    @abstractmethod
    async def get_feed(self, feed_id: UUID, user_id: UUID) -> FeedResponse:
        '''피드 받기'''
        ...

    @abstractmethod
    async def get_feeds(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0
    ) -> List[FeedResponse]:
        '''피드 리스트 받기'''
        ...

    @abstractmethod
    async def create_feed_like(self, user_id: UUID, feed_id: UUID) -> bool:
        '''피드 좋아요'''
        ...

    @abstractmethod
    async def delete_feed_like(self, user_id: UUID, feed_id: UUID) -> bool:
        '''피드 좋아요 해제'''
        ...
