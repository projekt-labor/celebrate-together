import requests


base_uri = "http://127.0.0.1:8080"
routes = open("routes.txt", "r")
lines = routes.readlines()
routes.close()

for line in lines:
    line = line.strip()
    if not line or "/" not in line:
        continue

    # Try different methods
    uri = base_uri + line

    if ":" in line:
        line.replace(":id", "1")

    r = requests.get(uri)
    print(uri, r)
