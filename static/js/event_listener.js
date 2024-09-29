function timedCount() {
    postMessage('get');
    setTimeout("timedCount()", 100000);
}

timedCount();
