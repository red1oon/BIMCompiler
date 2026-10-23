from PIL import Image, ImageDraw, ImageFont
W,H=1920,1080; NAVY=(18,33,60)
im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im)
F=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf',40)
d.rectangle((0,0,W,70),fill=(12,24,46))
d.text((480,36),'User A',font=F,fill=(255,230,180),anchor='mm'); d.text((1440,36),'User B',font=F,fill=(180,225,255),anchor='mm')
d.rectangle((958,70,962,710),fill=(232,152,74))
d.rectangle((0,709,W,711),fill=(232,152,74))
im.save('bg.png')
