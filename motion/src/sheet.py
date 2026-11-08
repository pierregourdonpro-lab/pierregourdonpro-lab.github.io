import sys,glob
from PIL import Image
pre,cols,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
ims=[Image.open(p) for p in sorted(glob.glob(pre+'_*.png'),key=lambda p:float(p.rsplit('_',1)[1][:-4]))]
w,h=ims[0].size; s=0.5; W,H=int(w*s),int(h*s); rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(W*cols+6*(cols-1),H*rows+6*(rows-1)),(60,60,60))
for i,im in enumerate(ims): sh.paste(im.convert('RGB').resize((W,H)),((i%cols)*(W+6),(i//cols)*(H+6)))
sh.save(out)
