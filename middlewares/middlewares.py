import threading
from threading import current_thread


_requests = {}

def get_username():
    t = current_thread()
    if t not in _requests:
         return None
    return _requests[t]

class RequestMiddleware:

    def __init__(self, get_response, thread_local=threading.local()):
        self.get_response = get_response
        self.thread_local = thread_local
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        #self.thread_local.current_request = request
        self.thread_local.__setattr__('current_request',request)
        _requests[current_thread()] = request
        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.

        return response

    def process_request(self, request):
        _requests[current_thread()] = request

