@echo off
title The Server : 9090
.\env_local\Scripts\python.exe manage.py runserver 0.0.0.0:9090
@echo on