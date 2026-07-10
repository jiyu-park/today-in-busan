import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from functools import lru_cache
from html import unescape
from typing import Any
from urllib.parse import unquote, urljoin

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

RAW_TOUR_API_KEY = os.getenv("TOUR_API_KEY", "")
TOUR_API_KEY = unquote(RAW_TOUR_API_KEY.strip().strip("\"'"))
API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2"
VISIT_BUSAN_BASE_URL = "https://www.visitbusan.net"
VISIT_BUSAN_SCHEDULE_URL = f"{VISIT_BUSAN_BASE_URL}/schedule/list.do"
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
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:5173",
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


def clean_html(value: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", value, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return " ".join(unescape(text).replace("\xa0", " ").split())


def fetch_visit_busan_page(url: str, params: dict[str, Any] | None = None) -> str:
    last_error: requests.RequestException | None = None
    for _ in range(2):
        try:
            response = requests.get(
                url,
                params=params,
                timeout=25,
                headers={"User-Agent": "TodayInBusan/1.0"},
            )
            response.raise_for_status()
            return response.text
        except requests.RequestException as exc:
            last_error = exc
    raise HTTPException(status_code=502, detail="Visit Busan 행사 정보를 불러오지 못했습니다.") from last_error


def parse_visit_busan_events(page_html: str) -> list[dict[str, Any]]:
    playlist = re.search(r'<ul\s+id="playlist"[^>]*>(.*?)</ul>', page_html, re.DOTALL)
    if not playlist:
        return []

    events: list[dict[str, Any]] = []
    for item_html in re.findall(r"<li>\s*<a\b.*?</a>\s*</li>", playlist.group(1), re.DOTALL):
        href_match = re.search(r'<a\s+href="([^"]+)"', item_html)
        title_match = re.search(r'<p\s+class="tit"[^>]*>(.*?)</p>', item_html, re.DOTALL)
        period_match = re.search(r'<p\s+class="cont"[^>]*>(.*?)</p>', item_html, re.DOTALL)
        image_match = re.search(r'<img\s+src="([^"]+)"', item_html)
        if not href_match or not title_match or not period_match:
            continue

        dates = re.findall(r"\d{4}-\d{2}-\d{2}", clean_html(period_match.group(1)))
        data_sid = re.search(r"dataSid=(\d+)", unescape(href_match.group(1)))
        if len(dates) < 2 or not data_sid:
            continue

        detail_url = urljoin(VISIT_BUSAN_BASE_URL, unescape(href_match.group(1)))
        image_url = urljoin(VISIT_BUSAN_BASE_URL, unescape(image_match.group(1))) if image_match else ""
        events.append(
            {
                "id": data_sid.group(1),
                "contentid": data_sid.group(1),
                "title": clean_html(title_match.group(1)),
                "eventstartdate": dates[0].replace("-", ""),
                "eventenddate": dates[1].replace("-", ""),
                "firstimage": image_url,
                "firstimage2": image_url,
                "addr1": "",
                "detailUrl": detail_url,
                "source": "Visit Busan",
            }
        )
    return events


@lru_cache(maxsize=2)
def fetch_visit_busan_events(year: int) -> tuple[dict[str, Any], ...]:
    events_by_id: dict[str, dict[str, Any]] = {}
    successful_months = 0

    def fetch_month(month: int) -> list[dict[str, Any]]:
        page_html = fetch_visit_busan_page(
            VISIT_BUSAN_SCHEDULE_URL,
            {
                "boardId": "BBS_0000009",
                "menuCd": "DOM_000000204012000000",
                "year": year,
                "month": month,
            },
        )
        return parse_visit_busan_events(page_html)

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(fetch_month, month) for month in range(1, 13)]
        for future in as_completed(futures):
            try:
                month_events = future.result()
            except HTTPException:
                continue
            successful_months += 1
            for event in month_events:
                events_by_id[event["id"]] = event

    if not successful_months:
        raise HTTPException(status_code=502, detail="Visit Busan 행사 정보를 불러오지 못했습니다.")

    return tuple(sorted(events_by_id.values(), key=lambda event: event["eventstartdate"]))


@lru_cache(maxsize=128)
def fetch_visit_busan_event_detail(event_id: str) -> dict[str, str]:
    page_html = fetch_visit_busan_page(
        f"{VISIT_BUSAN_BASE_URL}/schedule/view.do",
        {
            "boardId": "BBS_0000009",
            "menuCd": "DOM_000000204012000000",
            "dataSid": event_id,
        },
    )
    place_match = re.search(
        r'<div\s+class="name">\s*장소\s*</div>\s*<div\s+class="detail">(.*?)</div>',
        page_html,
        re.DOTALL,
    )
    image_match = re.search(r'<section\s+id="contents".*?<img\s+src="([^"]+)"', page_html, re.DOTALL)
    return {
        "addr1": clean_html(place_match.group(1)) if place_match else "",
        "firstimage": urljoin(VISIT_BUSAN_BASE_URL, unescape(image_match.group(1))) if image_match else "",
    }


def enrich_current_visit_busan_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    today = date.today()
    month_end = date(today.year, today.month % 12 + 1, 1) if today.month < 12 else date(today.year + 1, 1, 1)
    enriched: list[dict[str, Any]] = []
    for event in events:
        start = date.fromisoformat(f"{event['eventstartdate'][:4]}-{event['eventstartdate'][4:6]}-{event['eventstartdate'][6:]}")
        end = date.fromisoformat(f"{event['eventenddate'][:4]}-{event['eventenddate'][4:6]}-{event['eventenddate'][6:]}")
        if start < month_end and end >= today:
            details = fetch_visit_busan_event_detail(event["id"])
            event = {
                **event,
                "addr1": details["addr1"],
                "firstimage": details["firstimage"] or event["firstimage"],
                "firstimage2": details["firstimage"] or event["firstimage2"],
            }
        enriched.append(event)
    return enriched


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
    events = [dict(event) for event in fetch_visit_busan_events(date.today().year)]
    return enrich_current_visit_busan_events(events)


@app.get("/api/events/{event_id}")
def get_event_detail(event_id: str) -> dict[str, Any]:
    events = {event["id"]: dict(event) for event in fetch_visit_busan_events(date.today().year)}
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    details = fetch_visit_busan_event_detail(event_id)
    return {
        **event,
        "addr1": details["addr1"],
        "firstimage": details["firstimage"] or event["firstimage"],
        "firstimage2": details["firstimage"] or event["firstimage2"],
    }
