"""
Supabase REST client for Django backend (IoT + vision pipeline).
Uses service role key for server-side writes.
"""
import os
import urllib.request
import json


SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://yyrmuaocpnrlkeedwpzx.supabase.co')
SUPABASE_KEY = os.environ.get(
    'SUPABASE_SERVICE_ROLE_KEY',
    os.environ.get('SUPABASE_ANON_KEY', ''),
)


def _headers(prefer=None):
    h = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }
    if prefer:
        h['Prefer'] = prefer
    return h


def supabase_insert(table: str, payload: dict) -> dict:
    url = f'{SUPABASE_URL}/rest/v1/{table}'
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=_headers('return=representation'),
        method='POST',
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        return data[0] if isinstance(data, list) else data


def supabase_update(table: str, match: dict, payload: dict) -> None:
    params = '&'.join(f'{k}=eq.{v}' for k, v in match.items())
    url = f'{SUPABASE_URL}/rest/v1/{table}?{params}'
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=_headers(),
        method='PATCH',
    )
    urllib.request.urlopen(req)


def supabase_select(table: str, match: dict = None, select='*') -> list:
    url = f'{SUPABASE_URL}/rest/v1/{table}?select={select}'
    if match:
        for k, v in match.items():
            url += f'&{k}=eq.{v}'
    req = urllib.request.Request(url, headers=_headers())
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())
