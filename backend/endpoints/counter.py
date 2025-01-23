# endpoints/counter.py
from fastapi import APIRouter, Request
from database import get_db
from typing import List, Dict

router = APIRouter()

global_counter = 0
ip_records: Dict[str, int] = {}

@router.post("/counter/track-ip")
async def track_ip(request: Request):
    global global_counter
    client_ip = request.client.host

    if client_ip not in ip_records:
        global_counter += 1
        ip_records[client_ip] = global_counter
        return {"message": "IP tracked", "ip": client_ip, "counter": global_counter}
    else:
        return {"message": "IP already tracked", "ip": client_ip, "counter": ip_records[client_ip]}

@router.get("/counter")
async def get_counter():
    return {"global_counter": global_counter}