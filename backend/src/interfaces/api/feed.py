from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from adapters import FeedAdapter
from infra.db.storage.session import get_session
from use_cases.feed import FeedHandler
from use_cases.auth.dependencies import get_test_user as get_current_user
from schemas.models import TokenPayload, FeedResponse, FeedRequest
from config.logger import get_logger
from config.exceptions import CustomError, DuplicateError
logger = get_logger(__name__)

router = APIRouter(prefix="/feed", tags=['feed'])


def get_handler(db:AsyncSession=Depends(get_session),
                )->FeedHandler:
    feed_adapter = FeedAdapter(db=db)
    return FeedHandler(
        feed_adapter=feed_adapter
        )

# 피드 리스트 (페이징) 불러오기
@router.get("/", response_model=List[FeedResponse])
async def fetch_feeds_pages(
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler),
    page_number:int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    ):
    try:
        return await handler.fetch_feeds(
            payload=payload,
            page_size=page_size,
            page_number=page_number
        )
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"error fetch-feeds. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

# 단일 피드 받기
@router.get("/{feed_id}", response_model=FeedResponse)
async def fetch_feed(
    feed_id:UUID,
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler)):
    try:
        return await handler.fetch_feed(payload=payload,feed_id=feed_id)
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"fetch_single_feed. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# 피드 업로드
@router.post("/create")
async def create_feed(
    feed_data:FeedRequest,
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler))->bool:
    try:
        return await handler.create_feed(payload=payload,data=feed_data)
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"upload session. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# 피드 삭제
@router.delete("/{feed_id}/delete")
async def delete_feed(
    feed_id:UUID,
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler))->bool:
    try:
        return await handler.delete_feed(payload=payload, feed_id=feed_id)
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"delete session. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
# 피드 좋아요 
@router.post("/{feed_id}/like", response_model=FeedResponse)
async def like_feed(
    feed_id:UUID,
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler)):
    try:
        return await handler.like_feed(payload=payload, feed_id=feed_id)
    except DuplicateError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"delete session. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
# 피드 좋아요 취소
@router.delete("/{feed_id}/unlike", response_model=FeedResponse)
async def unlike_feed(
    feed_id:UUID,
    payload: TokenPayload = Depends(get_current_user),
    handler:FeedHandler=Depends(get_handler)):
    try:
        return await handler.unlike_feed(payload=payload, feed_id=feed_id)
        
    except CustomError as e:
        if e.original_exception:
            logger.exception(f"{e.context} {str(e.original_exception)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.exception(f"delete session. {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    