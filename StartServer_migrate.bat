@echo off
title The Server : 9090
./env_local/Scripts/python.exe manage.py migrate Patient
@echo on