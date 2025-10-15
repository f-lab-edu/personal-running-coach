from typing import List
from uuid import UUID

from ports.feed_port import FeedPort
from schemas.models import TokenPayload, FeedResponse, FeedRequest
from config.exceptions import CustomError, InternalError, ValidationError



class FeedHandler:
    def __init__(self,
                 feed_adapter:FeedPort
                 ):
        self.feed_adapter = feed_adapter



    async def fetch_feeds(self, payload:TokenPayload, page_size:int=20, page_number:int=1)->List[FeedResponse]:
        try:
            # 페이지 계산
            offset = (page_number-1) * page_size
            limit = page_size

            
            return await self.feed_adapter.get_feeds_with_likes(user_id=payload.user_id,
                                                                limit=limit,
                                                                offset=offset
                                                                )
    
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error fetch_feed", original_exception=e)

    # get a feed
    async def fetch_feed(self, payload:TokenPayload, feed_id:UUID)->FeedResponse:
        try:
            return await self.feed_adapter.get_feed(user_id=payload.user_id,
                                                    feed_id=feed_id)
    
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error fetch_feed", original_exception=e)

    async def create_feed(self, payload:TokenPayload, data:FeedRequest)->bool:
        try:

            res = await self.feed_adapter.create_feed(
                                        user_id=payload.user_id,
                                        title=data.title,
                                        train_date=data.train_date,
                                        train_summary=data.train_summary,
                                        note=data.note
                                        )
            return res
    
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error upload_feed", original_exception=e)

    async def delete_feed(self, payload:TokenPayload, feed_id:UUID)->bool:
        try:
            #1. check user_id match
            exist = await self.feed_adapter.get_feed(user_id=payload.user_id,
                                                     feed_id=feed_id)
            
            if exist.user_id != payload.user_id:
                raise ValidationError(context=f"user id {payload.user_id} mismatch feed user_id {exist.user_id}. can't delete others feed")


            return await self.feed_adapter.delete_feed(feed_id=feed_id)
    
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error delete_feed", original_exception=e)

    async def like_feed(self, payload:TokenPayload, feed_id:UUID)->FeedResponse:
        '''좋아요 추가. 
            db 유니크 제약으로 같은 게시글 중복 좋아요 방지
        '''
        try:
            # new like
            res = await self.feed_adapter.create_feed_like(user_id=payload.user_id,
                                                             feed_id=feed_id
                                                             )
            if not res:
                raise InternalError()
            
            return await self.feed_adapter.get_feed(user_id=payload.user_id,
                                                    feed_id=feed_id)
            
        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error delete_feed", original_exception=e)

    async def unlike_feed(self, payload:TokenPayload, feed_id:UUID)->FeedResponse:
        '''좋아요 취소. '''
        try:
            # new like
            await self.feed_adapter.delete_feed_like(user_id=payload.user_id,
                                                             feed_id=feed_id
                                                             )
            
            return await self.feed_adapter.get_feed(user_id=payload.user_id,
                                                    feed_id=feed_id)


        except CustomError:
            raise
        except Exception as e:
            raise InternalError(context="error delete_feed", original_exception=e)
