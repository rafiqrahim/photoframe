__author__ = 'rafiq'

from django.shortcuts import render_to_response

def hello(request):
    hello = "hello"
    return render_to_response('base.html', locals())