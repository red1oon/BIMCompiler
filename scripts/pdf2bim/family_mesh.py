# Implements prompts/PDF2BIM_VECTOR_PROBE.md §34, §38 — what the generated families share: the library's mesh conventions, read from the library: centred, metres, X width, Y depth, Z height, hash = sha256(vertices)[:16], faces int32 LE. Imported, not run.
import struct,hashlib
TRI=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(1,2,6),(1,6,5),(2,3,7),(2,7,6),(3,0,4),(3,4,7)]   # a box, outward faces
def box(x0,x1,y0,y1,z0,z1): return [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
def along_y(V): return [(-y,x,z) for x,y,z in V]   # the same element on a wall running along Y; a quarter turn keeps the winding
def blob(V,I):
    v=struct.pack('<%df'%(3*len(V)),*[c for p in V for c in p]); f=struct.pack('<%di'%(3*len(I)),*[c for t in I for c in t]); return v,f,hashlib.sha256(v).hexdigest()[:16]
