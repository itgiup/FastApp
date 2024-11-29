import asyncio
from contextlib import asynccontextmanager
from http import HTTPStatus
from typing import Set

from colorama import Back
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from fastapp.app import api
from fastapp.app.core.config import settings, webSocketConnections
from fastapp.app.core.logging import configure_logging
from fastapp.app.db import init_db
from fastapp.app.schemas.error import APIValidationError, CommonHTTPError
from fastapp.app.middlewares.botwatchdepths import startBotWatchDepths


# khởi động chương trình và chương trình kết thúc
@asynccontextmanager
async def lifespan(application: FastAPI):  # noqa
    configure_logging()
    await init_db.init()
    await asyncio.create_task(startBotWatchDepths(application))
    yield 
    print(Back.RED, "Chương trình kết thúc") 
    


tags_metadata = [
    {
        "name": "Authentication",
        "description": "Get authentication token",
    },
    {
        "name": "Users",
        "description": "User registration and management",
    },
    {
        "name": "URLs",
        "description": "Shorten and manage URLs",
    },
]

# Common response codes
responses: Set[int] = {
    status.HTTP_400_BAD_REQUEST,
    status.HTTP_401_UNAUTHORIZED,
    status.HTTP_403_FORBIDDEN,
    status.HTTP_404_NOT_FOUND,
    status.HTTP_500_INTERNAL_SERVER_ERROR,
}

app = FastAPI(
    debug=settings.DEBUG,
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Fast and reliable URL shortener powered by FastAPI and MongoDB.",
    # Set current documentation specs to v1
    openapi_url=f"/api/{settings.API_V1_STR}/openapi.json",
    docs_url=None,
    redoc_url=None,
    default_response_class=ORJSONResponse,
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    license_info={
        "name": "GNU General Public License v3.0",
        "url": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
    responses={
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Validation Error",
            "model": APIValidationError,  # Adds OpenAPI schema for 422 errors
        },
        **{
            code: {
                "description": HTTPStatus(code).phrase,
                "model": CommonHTTPError,
            }
            for code in responses
        },
    },
)

app.mount("/static", StaticFiles(directory="fastapp/app/static"), name="static")

# Add the router responsible for all /api/ endpoint requests
app.include_router(api.router)
# Include redirection router in the main app
app.include_router(api.redirect.router)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

if settings.USE_CORRELATION_ID:
    from fastapp.app.middlewares.correlation import CorrelationMiddleware

    app.add_middleware(CorrelationMiddleware)


# ********************************* 
# ****** middlewares của tôi ****** 
# def runBot():
#     asyncio.run(startBotWatchDepths)
# run_in_executor(runBot)

# @app.on_event("startup")
# async def start_background_task():
#     asyncio.create_task(startBotWatchDepths())

# Tạo một ConnectionManager
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint WebSocket.
    """
    await webSocketConnections.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received: {data}")
            await webSocketConnections.send_message(f"Message from server: {data}")
    except WebSocketDisconnect:
        webSocketConnections.disconnect(websocket)
# ****** middlewares của tôi ****** 
# ********************************* 


# Custom HTTPException handler
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_, exc: StarletteHTTPException) -> ORJSONResponse:
    return ORJSONResponse(
        content={
            "message": exc.detail,
        },
        status_code=exc.status_code,
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(
    _,
    exc: RequestValidationError,
) -> ORJSONResponse:
    return ORJSONResponse(
        content=APIValidationError.from_pydantic(exc).dict(exclude_none=True),
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )
