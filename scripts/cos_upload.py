#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cos_upload.py — 把 dist/ 同步到腾讯云 COS（默认域名，国内可达、免备案）
--------------------------------------------------------------------------
只用 Python 标准库（hmac/hashlib/http.client），无需 pip 安装任何包。

用法：
    python3 scripts/cos_upload.py                 # 上传 dist/ 全部文件
    python3 scripts/cos_upload.py --dist dist     # 指定目录
配置（ credential 不明文进仓库）：
    先跑 scripts/cos-setup.sh，或手动写 ~/.deutschheft-cos.json：
    {"secret_id":"...","secret_key":"...","bucket":"xxx-1250000000","region":"ap-chengdu"}
"""
import argparse
import hashlib
import hmac
import http.client
import json
import mimetypes
import os
import ssl
import sys
import time
import urllib.parse

CONFIG = os.path.expanduser("~/.deutschheft-cos.json")


def load_cfg():
    if not os.path.exists(CONFIG):
        sys.exit(f"❌ 缺少配置文件 {CONFIG}\n   请先运行：./scripts/cos-setup.sh")
    with open(CONFIG) as f:
        c = json.load(f)
    for k in ("secret_id", "secret_key", "bucket", "region"):
        if k not in c:
            sys.exit(f"❌ {CONFIG} 缺少字段 {k}")
    return c


def sign(secret_key, secret_id, method, uri, params, headers, body, start, end):
    """COS v5 签名（q-sign-algorithm=sha1）"""
    q_sign_time = f"{start};{end}"
    q_key_time = f"{start};{end}"

    hdr_list = ";".join(sorted(k.lower() for k in headers))
    param_list = ";".join(sorted(params.keys()))
    # UrlParams：按 key 排序，key=value 用 & 连接
    url_params = "&".join(f"{k}={params[k]}" for k in sorted(params.keys()))
    # Headers：按 key 排序，key=value 用 & 连接
    hdrs = "&".join(f"{k.lower()}={headers[k]}" for k in sorted(headers, key=str.lower))

    http_string = f"{method}\n{uri}\n{url_params}\n{hdrs}\n"
    sha1_content = hashlib.sha1(body).hexdigest()
    string_to_sign = f"sha1\n{q_sign_time}\n{sha1_content}\n"
    sign_key = hmac.new(secret_key.encode(), q_key_time.encode(), hashlib.sha1).hexdigest()
    signature = hmac.new(sign_key.encode(), (http_string + string_to_sign).encode(),
                         hashlib.sha1).hexdigest()

    auth = ("q-sign-algorithm=sha1"
            f"&q-ak={secret_id}"
            f"&q-sign-time={q_sign_time}"
            f"&q-key-time={q_key_time}"
            f"&q-header-list={hdr_list}"
            f"&q-url-param-list={param_list}"
            f"&q-signature={signature}")
    return auth


def put_object(cfg, key, body, ctype):
    host = f"{cfg['bucket']}.cos.{cfg['region']}.myqcloud.com"
    uri = "/" + urllib.parse.quote(key)
    start = int(time.time()) - 60
    end = start + 600
    headers = {
        "Host": host,
        "Content-Length": str(len(body)),
        "Content-Type": ctype,
        "Date": time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime()),
    }
    headers["Authorization"] = sign(cfg["secret_key"], cfg["secret_id"], "PUT",
                                    uri, {}, headers, body, start, end)

    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection(host, 443, timeout=60, context=ctx)
    try:
        conn.request("PUT", uri, body=body,
                     headers={k: v for k, v in headers.items()})
        r = conn.getresponse()
        r.read()
        return r.status
    finally:
        conn.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default="dist", help="要上传的目录（默认 dist）")
    ap.add_argument("--prefix", default="", help="远端前缀（默认空=根）")
    args = ap.parse_args()

    cfg = load_cfg()
    dist = os.path.abspath(args.dist)
    if not os.path.isfile(os.path.join(dist, "index.html")):
        sys.exit(f"❌ {dist}/index.html 不存在，先构建站点")

    files = []
    for root, _dirs, names in os.walk(dist):
        for n in names:
            if n == ".DS_Store":
                continue
            p = os.path.join(root, n)
            rel = os.path.relpath(p, dist).replace(os.sep, "/")
            files.append((rel, p))
    files.sort()

    total = sum(os.path.getsize(p) for _, p in files)
    print(f"==> 上传 {len(files)} 个文件（{total/1048576:.1f} MiB）"
          f" → {cfg['bucket']}.cos.{cfg['region']}.myqcloud.com")

    ok = fail = 0
    for i, (rel, p) in enumerate(files, 1):
        key = f"{args.prefix}/{rel}" if args.prefix else rel
        ctype = mimetypes.guess_type(p)[0] or "application/octet-stream"
        try:
            with open(p, "rb") as f:
                body = f.read()
            st = put_object(cfg, key, body, ctype)
            if st == 200:
                ok += 1
                print(f"  [{i:>3}/{len(files)}] 200  {key}")
            else:
                fail += 1
                print(f"  [{i:>3}/{len(files)}] ❌ HTTP {st}  {key}")
        except Exception as e:  # noqa: BLE001
            fail += 1
            print(f"  [{i:>3}/{len(files)}] ❌ {e}  {key}")

    print(f"\n{'✅' if fail == 0 else '⚠️'} 完成：成功 {ok}，失败 {fail}")
    if fail:
        sys.exit(1)
    print(f"\n国内访问地址（免备案）：")
    print(f"  https://{cfg['bucket']}.cos.{cfg['region']}.myqcloud.com/index.html")
    print("  （若已开启「静态网站托管」，直接用根域名即可）")


if __name__ == "__main__":
    main()
