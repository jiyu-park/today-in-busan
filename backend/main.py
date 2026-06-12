import os
from typing import Any
from urllib.parse import unquote

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

RAW_TOUR_API_KEY = os.getenv("TOUR_API_KEY", "")
TOUR_API_KEY = unquote(RAW_TOUR_API_KEY.strip().strip("\"'"))
API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2"
COMMON_PARAMS = {
    "MobileOS": "ETC",
    "MobileApp": "TodayInBusan",
    "_type": "json",
}

app = FastAPI(title="Today in Busan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_items(data: dict[str, Any]) -> list[dict[str, Any]]:
    body = data.get("response", {}).get("body", {})
    items = body.get("items") or {}
    item = items.get("item", [])

    if isinstance(item, list):
        return item
    if isinstance(item, dict):
        return [item]
    return []


def call_tour_api(endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    if not TOUR_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="TOUR_API_KEY is not configured. Create backend/.env from .env.example.",
        )

    request_params = {
        **COMMON_PARAMS,
        "serviceKey": TOUR_API_KEY,
        **(params or {}),
    }

    try:
        response = requests.get(
            f"{API_BASE_URL}/{endpoint}",
            params=request_params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except requests.Timeout as exc:
        raise HTTPException(status_code=504, detail="TourAPI request timed out.") from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"TourAPI request failed: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="TourAPI returned invalid JSON.") from exc

    header = data.get("response", {}).get("header", data)
    result_code = header.get("resultCode")
    if result_code != "0000":
        raise HTTPException(
            status_code=502,
            detail={
                "message": "TourAPI returned an error.",
                "resultCode": result_code,
                "resultMsg": header.get("resultMsg"),
            },
        )

    return data


def normalize_spot(item: dict[str, Any]) -> dict[str, Any]:
    title = (item.get("title") or "").strip()
    overview = (item.get("overview") or "").strip()
    address = " ".join(
        value.strip()
        for value in [item.get("addr1") or "", item.get("addr2") or ""]
        if value and value.strip()
    )
    area = next((part for part in address.split() if part.endswith(("구", "군"))), "부산")

    return {
        "id": item.get("contentid"),
        "contentId": item.get("contentid"),
        "title": title,
        "area": area,
        "address": address,
        "image": item.get("firstimage") or item.get("firstimage2") or "",
        "shortDescription": overview[:90] + "..." if len(overview) > 90 else overview,
        "historyStory": overview,
        "mapx": item.get("mapx"),
        "mapy": item.get("mapy"),
        "raw": item,
    }


@app.get("/api/spots")
def get_spots() -> list[dict[str, Any]]:
    data = call_tour_api(
        "areaBasedList2",
        {
            "areaCode": "6",
            "contentTypeId": "12",
            "numOfRows": "20",
            "pageNo": "1",
            "arrange": "O",
        },
    )
    return [normalize_spot(item) for item in get_items(data)]


@app.get("/api/spots/{content_id}")
def get_spot_detail(content_id: str) -> dict[str, Any]:
    data = call_tour_api(
        "detailCommon2",
        {
            "contentId": content_id,
        },
    )
    items = get_items(data)
    if not items:
        raise HTTPException(status_code=404, detail="Spot not found.")

    return normalize_spot(items[0])


@app.get("/api/spots/{content_id}/images")
def get_spot_images(content_id: str) -> list[dict[str, Any]]:
    data = call_tour_api(
        "detailImage2",
        {
            "contentId": content_id,
            "numOfRows": "20",
            "pageNo": "1",
        },
    )
    return [
        {
            "contentId": item.get("contentid"),
            "originImageUrl": item.get("originimgurl"),
            "smallImageUrl": item.get("smallimageurl"),
            "imageName": item.get("imgname"),
            "serialNumber": item.get("serialnum"),
            "raw": item,
        }
        for item in get_items(data)
    ]


@app.get("/api/events")
def get_events() -> list[dict[str, Any]]:
    data = call_tour_api(
        "searchFestival2",
        {
            "areaCode": "6",
            "numOfRows": "20",
            "pageNo": "1",
            "arrange": "O",
        },
    )
    return get_items(data)
