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

if not os.path.exists(config_path):
    config = {}
else:
    with open(config_path, 'r') as f:
        config = json.load(f)

if 'machine_id' not in config or not config['machine_id']:
    config['machine_id'] = str(uuid.uuid4())

server_ip = get_server_ip()
if server_ip:
    config['server_ip'] = server_ip
else:
    if 'server_ip' not in config:
        config['server_ip'] = '172.16.163.164'

with open(config_path, 'w') as f:
    json.dump(config, f)

machine_id = config['machine_id']
server_ip = config['server_ip']
FREQUENCY = 1  # 1 second

def get_disk_data():
    disk_data = {}
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disk_data[partition.device] = {
                'total': usage.total,
                'used': usage.used,
                'free': usage.free,
                'percent': usage.percent,
            }
        except Exception:
            pass
    return disk_data

def get_battery_info():
    battery = psutil.sensors_battery()
    if battery:
        percent = battery.percent
        is_plugged = battery.power_plugged
        time_left = secs2hours(battery.secsleft) if battery.secsleft != psutil.POWER_TIME_UNLIMITED else "Indéfini"
        return {"percent": percent, "plugged": is_plugged, "left": time_left}
    return None

def secs2hours(secs):
    mm, ss = divmod(secs, 60)
    hh, mm = divmod(mm, 60)
    return "%d:%02d:%02d" % (hh, mm, ss)

def connect():
    while True:
        try:
            ws = websocket.WebSocket()
            ws.connect(f"ws://{server_ip}:5000?machine_id={machine_id}")
            print(f'Connecté au serveur WebSocket\nUUID: \033[92m{machine_id}\033[0m')

            previous_network = psutil.net_io_counters()
            prev_disk_io_counters = psutil.disk_io_counters()

            while True:
                current_network = psutil.net_io_counters()
                current_disk_io_counters = psutil.disk_io_counters()

                data = {
                    "machine_id": machine_id,
                    "cpu": psutil.cpu_percent(percpu=True),
                    "memory": {"ram": psutil.virtual_memory().percent, "swap": psutil.swap_memory().percent},
                    "network": {
                        "in": (current_network.bytes_recv - previous_network.bytes_recv) / FREQUENCY,
                        "out": (current_network.bytes_sent - previous_network.bytes_sent) / FREQUENCY,
                    },
                    "disk": get_disk_data(),
                    "disk_io": {
                        "read": (current_disk_io_counters.read_bytes - prev_disk_io_counters.read_bytes) / FREQUENCY,
                        "write": (current_disk_io_counters.write_bytes - prev_disk_io_counters.write_bytes) / FREQUENCY,
                    },
                    "battery": get_battery_info(),
                    "tempSensors": psutil.sensors_temperatures() if hasattr(psutil, 'sensors_temperatures') else None,
                    "fans": psutil.sensors_fans() if hasattr(psutil, 'sensors_fans') else None,
                }

                prev_disk_io_counters = current_disk_io_counters
                previous_network = current_network
                ws.send(json.dumps(data))
                time.sleep(FREQUENCY)
        
        except (websocket.WebSocketConnectionClosedException, ConnectionRefusedError) as e:
            print(f"Connexion perdue, tentative de reconnexion dans 3 secondes... {e}")
            time.sleep(3)
        except Exception as e:
            print(f"Erreur inattendue : {e}, tentative de reconnexion dans 3 secondes...")
            time.sleep(3)

connect()
