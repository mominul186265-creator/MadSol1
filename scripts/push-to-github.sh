#!/bin/bash
# MadSol - Push to GitHub Helper Script

if [ -z "$1" ]; then
  echo "ব্যবহারবিধি: ./scripts/push-to-github.sh <আপনার_গিটহাব_রিপোজিটরি_URL>"
  echo "উদাহরণ: ./scripts/push-to-github.sh https://github.com/your-username/madsol.git"
  exit 1
fi

REPO_URL=$1

echo "গিটহাব রিমোট সেট করা হচ্ছে: $REPO_URL ..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git branch -M main

echo "গিটহাবে কোড পুশ করা হচ্ছে..."
git push -u origin main

echo "সফলভাবে কোড গিটহাবে পুশ হয়েছে!"
