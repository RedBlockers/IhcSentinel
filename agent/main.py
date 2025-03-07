import websocket
import json
import psutil
import time
import uuid
import os

config_path = os.path.join(os.path.dirname(__file__), 'agent_config.json')

def get_server_ip():
    ip = input("Entrez l'IP du serveur (ou appuyez sur Entrée pour utiliser l'IP par défaut): ")
    return ip

# Vérifier et générer un machine_id si nécessaire
if not os.path.exists(config_path):
    config = {}
else:
    with open(config_path, 'r') as f:
        config = json.load(f)

if 'machine_id' not in config or not config['machine_id']:
    config['machine_id'] = str(uuid.uuid4())

# Demander l'IP du serveur à l'utilisateur
server_ip = get_server_ip()
if server_ip:
    config['server_ip'] = server_ip
else:
    if 'server_ip' not in config:
        config['server_ip'] = '172.16.163.164'  # IP par défaut si non présente dans la config

# Sauvegarder la configuration mise à jour
with open(config_path, 'w') as f:
    json.dump(config, f)

# Utiliser machine_id et server_ip dans vos données
machine_id = config['machine_id']
server_ip = config['server_ip']

ws = websocket.WebSocket()
ws.connect(f"ws://{server_ip}:5000")
print(f'connecté au serveur\nPour vous connecter utilisez l\'UUID suivant:\n \033[92m{machine_id}\033[0m')

FREQUENCY = 1  # 1 second

def get_disk_data():
    # Récupère l'utilisation de chaque partition
    disk_data = {}
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disk_data[partition.device] = {
                'total': usage.total,
                'used': usage.used,
                'free': usage.free,
                'percent': usage.percent
            }
        except:
            pass
    return disk_data

data = {}
previous_network = psutil.net_io_counters()

while True:
    current_network = psutil.net_io_counters()
    data = {
        "machine_id": machine_id,
        "cpu": psutil.cpu_percent(percpu=True),
        "ram": psutil.virtual_memory().percent,
        "network": {"in": (current_network.bytes_recv - previous_network.bytes_recv) * (1 / FREQUENCY), "out": (current_network.bytes_sent - previous_network.bytes_sent) * (1 / FREQUENCY)},  # Bytes per second
        "disk": get_disk_data()
    }
    previous_network = current_network
    ws.send(json.dumps(data))
    time.sleep(FREQUENCY)  # 1 second