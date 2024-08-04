module.exports = {
  apps: [{
    name: "Coffee",
    script: " gunicorn Coffee.wsgi:application -w 8  --threads=3  --bind 0.0.0.0:9090; ",
    args: "",
    exec_mode: "fork_mode"
  }]
}


pm2 --name=Coffee start "gunicorn Coffee.wsgi:application -w 8  --threads=3  --bind 0.0.0.0:9090"
