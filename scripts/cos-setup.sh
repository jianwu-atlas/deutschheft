#!/usr/bin/env bash
# cos-setup.sh — 本地配置腾讯云 COS 凭证（写入 ~/.deutschheft-cos.json，权限 600）
# 凭证只在本地输入，不会出现在聊天记录或仓库里。
set -euo pipefail

OUT="$HOME/.deutschheft-cos.json"
echo "请输入腾讯云 API 密钥（在 https://console.cloud.tencent.com/cam/capi 创建）"
read -r -p "  SecretId : " SID
read -r -s -p "  SecretKey: " SKEY; echo
read -r -p "  存储桶名（如 deutschheft-1300000000）: " BUCKET
read -r -p "  地域（如 ap-chengdu / ap-shanghai / ap-beijing）: " REGION
[ -n "${REGION}" ] || REGION="ap-chengdu"

umask 077
cat > "$OUT" <<EOF
{
  "secret_id": "${SID}",
  "secret_key": "${SKEY}",
  "bucket": "${BUCKET}",
  "region": "${REGION}"
}
EOF
chmod 600 "$OUT"
echo "✅ 已写入 $OUT （权限 600）"
echo
echo "下一步：上传站点"
echo "  ./scripts/cos_upload.py"
