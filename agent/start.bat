@echo off

REM Vérifiez si pip est installé
python -m ensurepip --default-pip

REM Installez les dépendances nécessaires
pip install websocket-client psutil uuid

cls

REM Démarrez le script main.py
python main.py
pause