import os.path
__author__ = 'rafiq'

from django.shortcuts import render_to_response
import glob

def show_pic(request):

    return render_to_response('base.html', locals())

def slide(request):
    piclist = glob.glob(os.path.join(os.path.dirname(__file__), u'media/assets/images') + u'/*.jpg')
    pic = '/'.join(piclist[0].replace('/','\\').rsplit('\\')[-4:]).encode('utf8')
    name = '/'.join(piclist[0].replace('/','\\').rsplit('\\')[-1:]).rsplit('.')[0].encode('utf8')
    sec=''
    for i in range(3):
        a = glob.glob(os.path.join(os.path.dirname(__file__), u'media/assets/images') + u'/*.jpg')

        b = '/'.join(piclist[i].replace('/','\\').rsplit('\\')[-4:]).encode('utf8')
        c = '/'.join(piclist[i].replace('/','\\').rsplit('\\')[-1:]).rsplit('.')[0].encode('utf8')
        sec = sec + "<section><h3>" + c + "</h3><img src='" + b + "'></section>"
    return render_to_response('section.html',locals())